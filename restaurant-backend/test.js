import mongoose from 'mongoose';

(async () => {
    try {
        const customerConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/food_delivery_customer').asPromise();
        const restaurantsCollection = customerConn.collection('restaurants');
        const restaurant = await restaurantsCollection.findOne({});
        console.log("Found restaurant in customer DB:", restaurant ? restaurant._id : "None");
        
        if (!restaurant) {
            console.log("No restaurant found in customer DB.");
            process.exit(0);
        }
        
        const restaurantConn = await mongoose.createConnection('mongodb://127.0.0.1:27017/food_delivery_restaurant').asPromise();
        const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
        const RestaurantOwner = restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema, 'restaurantowners');
        
        const BankAccountSchema = new mongoose.Schema({}, { strict: false });
        const BankAccount = restaurantConn.model('BankAccount', BankAccountSchema, 'bankaccounts');

        console.log("Restaurant ID string:", restaurant._id.toString());
        const rIdStr = restaurant._id.toString();
        const rIdObj = new mongoose.Types.ObjectId(restaurant._id);

        const owner = await RestaurantOwner.findOne({
            $or: [
              { restaurant: rIdObj },
              { restaurant: rIdStr },
              { restaurantId: rIdObj },
              { restaurantId: rIdStr }
            ]
        }).lean();

        console.log("Owner found:", owner ? owner.name : "NO OWNER");
        if (owner) {
            console.log("Owner restaurant field type:", typeof owner.restaurant);
            console.log("Owner restaurant field value:", owner.restaurant);
        } else {
            const anyOwner = await RestaurantOwner.findOne().lean();
            console.log("Any owner in DB:", anyOwner ? anyOwner : "NO OWNERS AT ALL");
        }
        
        console.log("\n--- Bank Account Check ---");
        const bank = await BankAccount.findOne({
            $or: [
              { restaurantId: rIdObj },
              { restaurantId: rIdStr },
              { restaurant: rIdObj },
              { restaurant: rIdStr }
            ]
        }).lean();

        console.log("Bank found:", bank ? bank.bankName : "NO BANK");
        if (!bank) {
            const anyBank = await BankAccount.findOne().lean();
            console.log("Any bank in DB:", anyBank ? anyBank : "NO BANKS AT ALL");
        }
        
        console.log("\n--- Restaurant Document Root Level ---");
        console.log("Does restaurant doc have owner field?", restaurant.owner ? "YES: " + restaurant.owner : "NO");

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
