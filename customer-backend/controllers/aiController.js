// import { GoogleGenerativeAI } from "@google/generative-ai"; // Replaced by Groq
import Groq from "groq-sdk";
import mongoose from 'mongoose'; // Added mongoose
import Restaurant from '../models/Restaurant.js';
import Order from '../models/Order.js';

// Initialize Groq
// Note: API Key will be loaded from process.env.GROQ_API_KEY
const getGroq = () => {
    if (!process.env.GROQ_API_KEY) {
        throw new Error("GROQ_API_KEY is not set in environment variables");
    }
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// --- MOOD DETECTION ---
const moodKeywords = {
    spicy: ['spicy', 'hot', 'fiery', 'chili', 'chilli', 'pepper', 'masala', 'peri', 'schezwan', 'tikka', 'spiced', 'bold flavour', 'bold flavor'],
    sweet: ['sweet', 'dessert', 'chocolate', 'cake', 'ice cream', 'icecream', 'mithai', 'gulab', 'halwa', 'ladoo', 'barfi', 'kheer', 'pudding', 'brownie', 'pastry', 'candy', 'sugary'],
    healthy: ['healthy', 'salad', 'light', 'diet', 'nutritious', 'fresh', 'grilled', 'steamed', 'low cal', 'low calorie', 'green', 'clean eating', 'fit'],
    comfort: ['comfort', 'cozy', 'warm', 'desi', 'homestyle', 'home style', 'traditional', 'classic', 'dal', 'roti', 'khichdi', 'hearty'],
    exotic: ['exotic', 'fusion', 'international', 'unique', 'special', 'gourmet', 'premium', 'continental', 'thai', 'japanese', 'korean', 'mexican', 'italian', 'sushi', 'adventure'],
    heavy: ['heavy', 'filling', 'biryani', 'thali', 'platter', 'feast', 'starving', 'very hungry', 'full meal', 'combo'],
    snack: ['snack', 'quick bite', 'light bite', 'pani puri', 'chaat', 'samosa', 'vada', 'pakora', 'finger food', 'something light', 'munchies'],
    nonveg: ['non-veg', 'nonveg', 'chicken', 'mutton', 'prawn', 'fish', 'seafood', 'meat', 'egg'],
    veg: ['veg only', 'vegetarian', 'no meat', 'plant based', 'plant-based'],
};

const detectMood = (message) => {
    const lower = message.toLowerCase();
    for (const [mood, keywords] of Object.entries(moodKeywords)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return mood;
        }
    }
    return null;
};

const searchDishesByMood = (restaurants, mood) => {
    const keywords = moodKeywords[mood] || [];
    const moodToDishTypes = {
        sweet: ['dessert'],
        snack: ['snack', 'starter'],
        heavy: ['main', 'combo'],
        comfort: ['main'],
        healthy: ['main', 'starter'],
    };
    const allowedDishTypes = moodToDishTypes[mood] || [];

    let matches = [];

    for (const r of restaurants) {
        if (r.menu) {
            for (const cat of r.menu) {
                if (cat.items) {
                    for (const item of cat.items) {
                        const itemText = `${item.name} ${item.description || ''} ${(item.tags || []).join(' ')}`.toLowerCase();
                        const matchesKeyword = keywords.some(kw => itemText.includes(kw));
                        const matchesDishType = allowedDishTypes.length > 0 && allowedDishTypes.includes(item.dishType);

                        if (matchesKeyword || matchesDishType) {
                            matches.push({
                                restaurantName: r.name,
                                restaurantId: r._id,
                                itemId: item._id,
                                name: item.name,
                                price: item.price,
                                isVeg: item.isVeg,
                                image: item.url || ''
                            });
                        }

                        if (matches.length >= 8) break;
                    }
                    if (matches.length >= 8) break;
                }
            }
        }
        if (matches.length >= 8) break;
    }

    return matches.slice(0, 5);
};

export const chatWithAI = async (req, res) => {
    try {
        const { message, userId } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, message: "Message is required" });
        }

        const lowerMessage = message.toLowerCase();
        // Exclude continuation messages like "show me more" or "I've added X" from triggering a dish search
        const isFollowUpMessage = lowerMessage.includes("i've added") || lowerMessage.includes("show me more") || lowerMessage.includes("more options");
        const isOrderingIntent = !isFollowUpMessage && (
            lowerMessage.includes('order') ||
            lowerMessage.includes('get me') ||
            lowerMessage.includes('buy') ||
            lowerMessage.includes('want to eat') ||
            /\badd\b/.test(lowerMessage)
        );

        // Detect mood from the message
        const detectedMood = detectMood(message);

        // Fetch all active restaurants with their popular items/menu highlights
        let restaurants = await Restaurant.find({
            isActive: true,
            status: 'active'
        })
            .select('name cuisine averageRating address.city menu restaurantId priceRange')
            .lean();

        // OPTIMIZATION: Limit to top 30 rated restaurants
        restaurants.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        let limitedRestaurants = restaurants.slice(0, 30);
        // FETCH NEWLY REGISTERED RESTAURANTS (Top 5, from the SEPARATE collection)
        const db = mongoose.connection.db;
        let newRestaurants = await db.collection('new_registered_restaurants').find({
            isActive: true,
            status: 'active'
        })
            .project({ name: 1, cuisine: 1, averageRating: 1, 'address.city': 1, menu: 1, restaurantId: 1, priceRange: 1, _id: 1 })
            .sort({ createdAt: -1 })
            .limit(5)
            .toArray();

        // MERGE & DEDUPLICATE
        const allRestaurants = [...limitedRestaurants, ...newRestaurants];

        const uniqueRestaurantsMap = new Map();
        allRestaurants.forEach(r => {
            uniqueRestaurantsMap.set(r._id.toString(), r);
        });

        limitedRestaurants = Array.from(uniqueRestaurantsMap.values());

        // EXTRA FILTER: Remove "Azure" if present
        limitedRestaurants = limitedRestaurants.filter(r => !r.name.toLowerCase().includes('azure'));

        // SHUFFLE
        for (let i = limitedRestaurants.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [limitedRestaurants[i], limitedRestaurants[j]] = [limitedRestaurants[j], limitedRestaurants[i]];
        }

        // --- MOOD-BASED DISH SEARCH ---
        let moodDishResults = "";
        if (detectedMood) {
            const moodMatches = searchDishesByMood(limitedRestaurants, detectedMood);
            if (moodMatches.length > 0) {
                moodDishResults = `MOOD DISHES (Detected Mood: ${detectedMood.toUpperCase()} - Use DISH_CARDS for these):\n` +
                    moodMatches.map(m =>
                        `Dish: ${m.name} | Price: ${m.price} | Restaurant: ${m.restaurantName} | ID: ${m.itemId} | RestID: ${m.restaurantId} | Image: ${m.image || ''} | IsVeg: ${m.isVeg}`
                    ).join('\n');
                console.log(`[AI Mood] Detected mood '${detectedMood}', found ${moodMatches.length} dishes`);
            } else {
                moodDishResults = `MOOD DISHES: No dishes found for mood '${detectedMood}'. Suggest browsing restaurants.`;
            }
        }

        // --- SPECIFIC DISH SEARCH (If intent is ordering) ---
        let dishSearchResults = "";
        if (isOrderingIntent) {
            // Stronger cleaning to isolate the actual dish name
            const stopWords = [
                'order', 'get', 'me', 'buy', 'i', 'want', 'to', 'eat', 'add', 'cart',
                'some', 'a', 'an', 'the', 'for', 'please', 'bring', 'have', 'like', 'would',
                'pure', 'veg', 'non-veg', 'custom', 'customize'
            ];

            const removeRegex = new RegExp(`\\b(${stopWords.join('|')})\\b`, 'gi');
            const potentialDish = message.replace(removeRegex, '').replace(/[^\w\s]/gi, '').trim().replace(/\s+/g, ' ');

            if (potentialDish.length > 2) {
                let matches = [];

                for (const r of limitedRestaurants) {
                    if (r.menu) {
                        for (const cat of r.menu) {
                            if (cat.items) {
                                for (const item of cat.items) {
                                    if (item.name.toLowerCase().includes(potentialDish.toLowerCase())) {
                                        matches.push({
                                            restaurantName: r.name,
                                            restaurantId: r._id,
                                            itemId: item._id,
                                            name: item.name,
                                            price: item.price,
                                            isVeg: item.isVeg,
                                            image: item.url || ''
                                        });
                                    }
                                }
                            }
                        }
                    }
                    if (matches.length >= 5) break;
                }

                if (matches.length > 0) {
                    dishSearchResults = "MATCHING DISHES FOUND (Use ONLY these for [ADD_TO_CART]):\n" +
                        matches.map(m => `Dish: ${m.name} | Price: ${m.price} | Restaurant: ${m.restaurantName} | ID: ${m.itemId} | RestID: ${m.restaurantId} | Image: ${m.image || 'N/A'}`).join('\n');

                    console.log(`[AI Search] Found ${matches.length} matches for '${potentialDish}'`);
                } else {
                    dishSearchResults = "NO EXACT DISH MATCHES FOUND for '" + potentialDish + "'. Do NOT invent false items.";
                    console.log(`[AI Search] No matches for '${potentialDish}'`);
                }
            }
        }

        // Format generic context for AI
        const contextList = limitedRestaurants.map(r => {
            let vegCount = 0;
            let totalItems = 0;
            let userHighlights = [];
            let minPrice = Infinity;
            let maxPrice = 0;

            if (r.menu && r.menu.length > 0) {
                r.menu.forEach(cat => {
                    if (cat.items) {
                        cat.items.forEach(item => {
                            totalItems++;
                            if (item.isVeg) vegCount++;
                            if (item.price) {
                                if (item.price < minPrice) minPrice = item.price;
                                if (item.price > maxPrice) maxPrice = item.price;
                            }
                            if (item.isPopular || userHighlights.length < 5) {
                                userHighlights.push(item.name);
                            }
                        });
                    }
                });
            }

            if (minPrice === Infinity) minPrice = "N/A";
            if (maxPrice === 0) maxPrice = "N/A";

            const priceString = (minPrice !== "N/A") ? `₹${minPrice}-₹${maxPrice}` : r.priceRange || 'N/A';
            const uniqueHighlights = [...new Set(userHighlights)].slice(0, 4).join(', ');
            const isPureVeg = totalItems > 0 && vegCount === totalItems;
            const dietaryLabel = isPureVeg ? "Pure Veg" : (vegCount > 0 ? "Mixed / Veg Options" : "Non-Veg Only");
            const ratingDisplay = r.averageRating ? `${r.averageRating}⭐` : "New (No Rating)";

            return `ID: ${r._id} | Name: ${r.name} | Avg Cost: ${priceString} | Cuisine: ${r.cuisine?.join(', ')} | Dietary: ${dietaryLabel} | Rating: ${ratingDisplay} | Top Items: ${uniqueHighlights}`;
        }).join('\n');

        // User and Order Context
        let orderContext = "";
        let activeOrdersList = "";

        if (userId) {
            let userObjectId;
            try {
                userObjectId = new mongoose.Types.ObjectId(userId);
            } catch (e) {
                console.error("Invalid User ID format:", userId);
            }

            if (userObjectId) {
                const activeStatuses = ['pending', 'confirmed', 'accepted', 'preparing', 'ready', 'out_for_delivery', 'picked_up'];

                const activeOrders = await Order.find({
                    customer: userObjectId,
                    status: { $in: activeStatuses }
                }).sort({ createdAt: -1 });

                if (activeOrders.length > 0) {
                    activeOrdersList = activeOrders.map(o =>
                        `Order ID: ${o._id} | Restaurant: ${o.restaurantName} | Status: ${o.status} | Tracking Action: [NAVIGATE:/track-order/${o._id}]`
                    ).join('\n');
                    orderContext = `USER HAS ACTIVE ORDERS:\n${activeOrdersList}`;
                } else {
                    orderContext = "USER HAS NO ACTIVE ORDERS.";
                }

                const lastCompletedOrder = await Order.findOne({
                    customer: userObjectId,
                    status: 'Delivered'
                }).sort({ createdAt: -1 });

                if (lastCompletedOrder) {
                    orderContext += `\n\nUSER HISTORY:\nLast completed meal was from ${lastCompletedOrder.restaurantName}. Items: ${lastCompletedOrder.items.map(i => i.name).join(', ')}.`;
                }
            }
        }

        // Construct System Prompt
        const systemPrompt = `
        You are QuickBites AI, a smart food delivery assistant.

        DATA CONTEXT (All available restaurants):
        ${contextList}

        MATCHING DISHES (Priority - Use for Ordering specific dish):
        ${dishSearchResults || 'N/A'}

        MOOD DISHES (Priority - Use for mood-based recommendations):
        ${moodDishResults || 'N/A'}

        USER CONTEXT:
        ${orderContext}

        YOUR GOAL:
        Help users find food, TRACK ORDERS, navigate, ADD ITEMS TO CART, and PLACE ORDERS via mood-based recommendations.

        RULES:
        1. **Live Order Tracking**:
           - IF "USER HAS ACTIVE ORDERS": "Your order from [Restaurant] is [Status]." + the exact Tracking Action from the context.
           - IF "USER HAS NO ACTIVE ORDERS": "You don't have any active orders."

        2. **Ordering Specific Dishes (ADD TO CART)**:
           - **STRICT RULE**: You can ONLY generate an [ADD_TO_CART] tag if the item is in "MATCHING DISHES".
           - If match found: [ADD_TO_CART:{itemId}|{name}|{price}|{restaurantId}|{image}]
           - If NO match: Apologize and suggest a restaurant with [NAVIGATE].

        3. **Mood-Based Recommendations (DISH_CARDS)**:
           - When MOOD DISHES data is available (not N/A), use it for dish cards.
           - Reply warmly: "Here are some [mood] options I found for you!"
           - Show up to 5 dishes using the DISH_CARDS format below.
           - **DISH_CARDS FORMAT** (field order is STRICT — follow exactly):
             [DISH_CARDS:{ID}|{NAME}|{PRICE}|{RESTAURANT_ID}|{RESTAURANT_NAME}|{IMAGE_URL}|{IS_VEG}:::{ID2}|{NAME2}|{PRICE2}|...]
             Position 1: Item ID (from "ID:" field in MOOD DISHES)
             Position 2: Dish name (from "Dish:" field)
             Position 3: Price as raw number only, no ₹ symbol (from "Price:" field)
             Position 4: Restaurant ID (from "RestID:" field)
             Position 5: Restaurant name (from "Restaurant:" field)
             Position 6: Full image URL (from "Image:" field)
             Position 7: isVeg true or false (from "IsVeg:" field)
           - Copy values EXACTLY from MOOD DISHES data, in the order shown above.
           - **CRITICAL**: Do NOT output dish names, prices, or image URLs as plain text in your reply. ALL dish data must be ONLY inside the [DISH_CARDS:...] tag — never outside it.
           - Separator between dishes is ::: (three colons).
           - End reply with: "Click any dish to add it to your order, then I'll ask if you want more or want to place the order!"

        4. **Add More Flow**:
           - When user message contains "show me more", "more options", "want more", or asks for additional dishes:
             - Show 3-5 more dishes using DISH_CARDS format (re-use the detected mood).
             - Ask: "Want to add more, or shall I place your order now?"
             - Include [ORDER_NOW] tag at the end of your reply.
           - **DO NOT** mention image URLs, prices, or dish names as plain text — use DISH_CARDS only.

        5. **Finalise Order (ORDER_NOW)**:
           - When user says "order it", "place order", "that's all", "order now", "no more", "just order":
             - Reply: "Your order is ready! I'll place it with Cash on Delivery to your home address. Tap the button below to confirm!"
             - Append: [ORDER_NOW]

        6. **Dish/Restaurant Search**:
           - "I want pizza" -> "Pizza Hut is great! [NAVIGATE:/restaurants?search=pizza]"

        7. **General Navigation**:
           - [NAVIGATE:/orders], [NAVIGATE:/cart], [NAVIGATE:/profile]

        8. **Reorder**:
           - Use "USER HISTORY".
           - "Your last meal was... [NAVIGATE:/restaurants?search=RestaurantName]"

        9. **Surprise Me**:
           - Pick top restaurant.
           - "How about [Name]? [NAVIGATE:/restaurants?search=Name]"

        10. **Tone**: Helpful, short, friendly. No internal thinking exposed.

        11. **Formatting Rules (STRICT)**:
            - **MAX 5 RESULTS**: Never list more than 5 restaurants or dishes at once.
            - **CONCISE**: Short replies. Lists: name + rating only unless user asks for dishes.
            - **Custom Orders**: Reply: "I can't take custom requests directly! Please browse the menu."

        `;

        try {
            const groq = getGroq();
            const completion = await groq.chat.completions.create({
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                model: "llama-3.1-8b-instant",
                temperature: 0.5,
            });

            const reply = completion.choices[0]?.message?.content || "I didn't get any response.";
            res.json({ success: true, reply });

        } catch (apiError) {
            console.error("Groq API Error:", apiError);
            if (apiError.message?.includes("API key")) {
                return res.status(500).json({ success: false, message: "Server configuration error: Invalid Groq API Key." });
            }
            res.status(500).json({ success: false, message: "AI is currently unavailable. Please try again later." });
        }

    } catch (error) {
        console.error("AI Controller Error:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};
