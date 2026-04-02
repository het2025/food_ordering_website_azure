import mongoose from 'mongoose';

let customerDB;
let restaurantDB;

const getCustomerDB = async () => {
  if (!customerDB) {
    customerDB = mongoose.createConnection(process.env.MONGO_URI);
    await customerDB.asPromise();
  }
  return customerDB;
};

const getRestaurantDB = async () => {
  if (!restaurantDB) {
    restaurantDB = mongoose.createConnection(process.env.RESTAURANT_DB_URI || process.env.MONGO_URI);
    await restaurantDB.asPromise();
  }
  return restaurantDB;
};

// @desc    Get all restaurants (from BOTH collections - old + new)
// @route   GET /api/admin/restaurants
// @access  Private
export const getAllRestaurants = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status || '';

    // Build query
    let query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'location.area': { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } }
      ];
    }
    if (status) {
      query.status = status;
    }

    // Fetch from BOTH collections, but exclude already-approved restaurants from new collection
    const [oldRestaurants, newRestaurants] = await Promise.all([
      restaurantsCollection.find(query).sort({ createdAt: -1 }).toArray(),
      newRestaurantsCollection.find({
        ...query,
        // Only fetch restaurants that haven't been approved yet
        $or: [
          { isApproved: { $ne: true } },
          { isApproved: { $exists: false } }
        ]
      }).sort({ registeredAt: -1, createdAt: -1 }).toArray()
    ]);

    // Mark new restaurants with isNew flag
    const markedOldRestaurants = oldRestaurants.map(r => ({
      ...r,
      isNew: false,
      source: 'restaurants'
    }));

    const markedNewRestaurants = newRestaurants.map(r => ({
      ...r,
      isNew: true,
      source: 'new_registered_restaurants'
    }));

    // Combine both arrays
    const allRestaurants = [...markedNewRestaurants, ...markedOldRestaurants];

    // Apply pagination
    const paginatedRestaurants = allRestaurants.slice(skip, skip + limit);
    const total = allRestaurants.length;

    res.status(200).json({
      success: true,
      data: paginatedRestaurants,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalRestaurants: total,
        oldRestaurants: oldRestaurants.length,
        newRestaurants: newRestaurants.length
      }
    });
  } catch (error) {
    console.error('Error in getAllRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Get only newly registered restaurants (pending approval)
// @route   GET /api/admin/restaurants/pending
// @access  Private
export const getPendingRestaurants = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    // ✅ FIXED: Fetch only UNAPPROVED restaurants (exclude rejected AND approved)
    const pendingRestaurants = await newRestaurantsCollection
      .find({
        status: { $ne: 'rejected' },
        $or: [
          { isApproved: { $exists: false } },
          { isApproved: false }
        ]
      })
      .sort({ registeredAt: -1, createdAt: -1 })
      .toArray();

    console.log(`Found ${pendingRestaurants.length} pending restaurants for approval`);

    // ✅ NEW: Fetch owner data from restaurant-backend database
    let restaurantsWithOwners = pendingRestaurants;

    try {
      const restaurantConn = await getRestaurantDB();

      // Get all unique owner IDs
      const ownerIds = pendingRestaurants
        .map(r => r.owner)
        .filter(Boolean);

      if (ownerIds.length > 0) {
        // Fetch all owners in one query
        const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
        const RestaurantOwner = restaurantConn.models.RestaurantOwner || restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema);

        const owners = await RestaurantOwner.find({
          _id: { $in: ownerIds }
        }).lean();

        // Create owner lookup map
        const ownerMap = new Map();
        owners.forEach(owner => {
          ownerMap.set(owner._id.toString(), owner);
        });

        // Merge owner data into restaurants
        restaurantsWithOwners = pendingRestaurants.map(restaurant => {
          const owner = ownerMap.get(restaurant.owner?.toString());
          return {
            ...restaurant,
            ownerName: owner?.name || 'N/A',
            ownerEmail: owner?.email || '',
            ownerPhone: owner?.phone || restaurant.contact?.phone || ''
          };
        });

        console.log(`✅ Added owner data to ${restaurantsWithOwners.length} restaurants`);
      }

      // Connection is reused, no need to close
    } catch (ownerError) {
      console.error('⚠️ Failed to fetch owner data:', ownerError.message);
      // Continue without owner data - better to show restaurants than fail completely
    }

    res.status(200).json({
      success: true,
      data: restaurantsWithOwners,
      count: restaurantsWithOwners.length
    });
  } catch (error) {
    console.error('Error in getPendingRestaurants:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Approve restaurant (move from new_registered to main restaurants)
// @route   POST /api/admin/restaurants/:id/approve
// @access  Private
export const approveRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');
    const restaurantsCollection = customerConn.collection('restaurants');

    const restaurantIdStr = req.params.id;
    let restaurantIdObj = null;
    try { restaurantIdObj = new mongoose.Types.ObjectId(restaurantIdStr); } catch (e) {}
    
    const restaurantId = restaurantIdObj || restaurantIdStr;

    const query = {
      $or: restaurantIdObj ? [{ _id: restaurantIdObj }, { _id: restaurantIdStr }] : [{ _id: restaurantIdStr }]
    };

    // Find restaurant in new_registered_restaurants collection
    const restaurant = await newRestaurantsCollection.findOne(query);

    if (!restaurant) {
      // Check if it was already moved to main collection (idempotency)
      const alreadyApproved = await restaurantsCollection.findOne(query);
      if (alreadyApproved) {
        console.log(`Restaurant ${restaurantIdStr} already in main collection. Skipping move.`);
      } else {
        return res.status(404).json({
          success: false,
          message: 'Restaurant not found in pending list'
        });
      }
    } else {
      // Check if already exists in main collection (to handle retries/duplicates)
      const existingRestaurant = await restaurantsCollection.findOne({
        $or: [
          ...(restaurantIdObj ? [{ _id: restaurantIdObj }, { restaurantId: restaurantIdObj }] : []),
          { _id: restaurantIdStr },
          { restaurantId: restaurantIdStr }
        ]
      });

      if (existingRestaurant) {
        console.log(`Restaurant ${restaurantIdStr} already exists in main collection. Updating instead of inserting.`);

        // Update existing
        await restaurantsCollection.updateOne(
          { _id: existingRestaurant._id },
          {
            $set: {
              status: 'active',
              isActive: true,
              approvedAt: new Date(),
              approvedBy: req.admin._id
            }
          }
        );
      } else {
        // Prepare approved restaurant data
        const approvedRestaurant = {
          ...restaurant,
          approvedAt: new Date(),
          approvedBy: req.admin._id,
          status: 'active',
          isActive: true
        };

        // Remove _id and restaurantId to avoid conflicts/duplicates
        delete approvedRestaurant._id;
        delete approvedRestaurant.restaurantId;

        // Insert into main restaurants collection
        await restaurantsCollection.insertOne({
          _id: restaurantId, // Keep same ID
          restaurantId: restaurantId.toString(), // Ensure unique restaurantId
          ...approvedRestaurant
        });
      }

      // ✅ FIXED: Update new_registered_restaurants instead of deleting
      // This ensures it remains visible on the "Newly Registered" page for customers
      await newRestaurantsCollection.updateOne(
        query,
        {
          $set: {
            status: 'active',
            isActive: true,
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: req.admin._id
          }
        }
      );
      console.log(`✅ Restaurant updated in new_registered_restaurants (kept for visibility)`);
    }

    // ✅ UPDATE RestaurantOwner in restaurant database
    try {
      const restaurantConn = await getRestaurantDB();

      const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
      const RestaurantOwner = restaurantConn.models.RestaurantOwner || restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema);

      const ownerUpdate = await RestaurantOwner.updateOne(
        { 
          $or: restaurantIdObj 
            ? [{ restaurant: restaurantIdObj }, { restaurant: restaurantIdStr }, { restaurantId: restaurantIdObj }, { restaurantId: restaurantIdStr }]
            : [{ restaurant: restaurantIdStr }, { restaurantId: restaurantIdStr }]
        },
        {
          $set: {
            isApproved: true,
            approvedAt: new Date(),
            approvedBy: req.admin._id
          }
        }
      );

      console.log(`✅ RestaurantOwner updated: ${ownerUpdate.modifiedCount} modified`);
      // Connection is reused, no need to close
    } catch (ownerError) {
      console.error('⚠️ RestaurantOwner update error:', ownerError.message);
      // Don't fail the whole approval if this fails
    }

    console.log(`Restaurant "${restaurantId}" approved and moved to main collection`);

    res.status(200).json({
      success: true,
      message: 'Restaurant approved successfully',
      data: {
        restaurantId,
        restaurantName: restaurant ? restaurant.name : 'Approved Restaurant'
      }
    });
  } catch (error) {
    console.error('Error in approveRestaurant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// @desc    Reject restaurant
// @route   POST /api/admin/restaurants/:id/reject
// @access  Private
export const rejectRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantIdStr = req.params.id;
    let restaurantIdObj = null;
    try { restaurantIdObj = new mongoose.Types.ObjectId(restaurantIdStr); } catch (e) {}

    const query = {
      $or: restaurantIdObj ? [{ _id: restaurantIdObj }, { _id: restaurantIdStr }] : [{ _id: restaurantIdStr }]
    };
    
    const { reason } = req.body;

    const updatedRestaurant = await newRestaurantsCollection.findOneAndUpdate(
      query,
      {
        $set: {
          status: 'rejected',
          rejectionReason: reason || 'No reason provided',
          rejectedAt: new Date(),
          rejectedBy: req.admin._id
        }
      },
      { returnDocument: 'after' }
    );

    if (!updatedRestaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    // Also update the RestaurantOwner in restaurant database
    try {
      const restaurantConn = await getRestaurantDB();

      const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
      const RestaurantOwner = restaurantConn.models.RestaurantOwner || restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema);

      await RestaurantOwner.updateOne(
        { 
          $or: restaurantIdObj 
            ? [{ restaurant: restaurantIdObj }, { restaurant: restaurantIdStr }, { restaurantId: restaurantIdObj }, { restaurantId: restaurantIdStr }]
            : [{ restaurant: restaurantIdStr }, { restaurantId: restaurantIdStr }]
        },
        {
          $set: {
            isApproved: false,
            rejectedAt: new Date(),
            rejectionReason: reason || 'No reason provided'
          }
        }
      );

      console.log(`✅ RestaurantOwner rejection status updated`);
      // Connection is reused, no need to close
    } catch (ownerError) {
      console.error('⚠️ RestaurantOwner rejection update error:', ownerError.message);
    }

    console.log(`Restaurant "${restaurantIdStr}" rejected. Reason: ${reason}`);

    res.status(200).json({
      success: true,
      message: 'Restaurant rejected',
      data: updatedRestaurant
    });
  } catch (error) {
    console.error('Reject restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error rejecting restaurant'
    });
  }
};

// @desc    Update restaurant status
// @route   PUT /api/admin/restaurants/:id/status
// @access  Private
export const updateRestaurantStatus = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantIdStr = req.params.id;
    let restaurantIdObj = null;
    try { restaurantIdObj = new mongoose.Types.ObjectId(restaurantIdStr); } catch (e) {}

    const query = {
      $or: restaurantIdObj ? [{ _id: restaurantIdObj }, { _id: restaurantIdStr }] : [{ _id: restaurantIdStr }]
    };
    
    const { status } = req.body;

    if (!['active', 'inactive', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be: active, inactive, or closed'
      });
    }

    // Try to update in both collections
    const updated1 = await restaurantsCollection.findOneAndUpdate(
      query,
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const updated2 = await newRestaurantsCollection.findOneAndUpdate(
      query,
      { $set: { status, updatedAt: new Date() } },
      { returnDocument: 'after' }
    );

    const result = updated1 || updated2;

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant status updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Update restaurant status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating restaurant status'
    });
  }
};

// @desc    Delete restaurant (from both collections)
// @route   DELETE /api/admin/restaurants/:id
// @access  Private
export const deleteRestaurant = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantIdStr = req.params.id;
    let restaurantIdObj = null;
    try { restaurantIdObj = new mongoose.Types.ObjectId(restaurantIdStr); } catch (e) {}

    const query = {
      $or: restaurantIdObj ? [{ _id: restaurantIdObj }, { _id: restaurantIdStr }] : [{ _id: restaurantIdStr }]
    };

    // Try to delete from both collections
    const result1 = await restaurantsCollection.deleteOne(query);
    const result2 = await newRestaurantsCollection.deleteOne(query);

    if (result1.deletedCount === 0 && result2.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Restaurant deleted successfully'
    });
  } catch (error) {
    console.error('Delete restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting restaurant'
    });
  }
};

// @desc    Get restaurant by ID (from any collection)
// @route   GET /api/admin/restaurants/:id
// @access  Private
export const getRestaurantById = async (req, res) => {
  try {
    const customerConn = await getCustomerDB();
    const restaurantsCollection = customerConn.collection('restaurants');
    const newRestaurantsCollection = customerConn.collection('new_registered_restaurants');

    const restaurantIdStr = req.params.id;
    let restaurantIdObj = null;
    try { restaurantIdObj = new mongoose.Types.ObjectId(restaurantIdStr); } catch (e) {}

    const query = {
      $or: restaurantIdObj ? [{ _id: restaurantIdObj }, { _id: restaurantIdStr }] : [{ _id: restaurantIdStr }]
    };

    // Try to find in both collections
    let restaurant = await restaurantsCollection.findOne(query);
    let isNew = false;

    if (!restaurant) {
      restaurant = await newRestaurantsCollection.findOne(query);
      isNew = true;
    }

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found'
      });
    }

    let ownerDetails = null;
    let bankAccount = null;
    
    // Fetch owner and bank details from restaurant DB
    try {
      const restaurantConn = await getRestaurantDB();

      const RestaurantOwnerSchema = new mongoose.Schema({}, { strict: false });
      const RestaurantOwner = restaurantConn.models.RestaurantOwner || restaurantConn.model('RestaurantOwner', RestaurantOwnerSchema, 'restaurantowners');
      
      // Look up owner using the restaurant reference - handle mix of string/ObjectId schemas
      ownerDetails = await RestaurantOwner.findOne({
        $or: restaurantIdObj 
            ? [{ restaurant: restaurantIdObj }, { restaurant: restaurantIdStr }, { restaurantId: restaurantIdObj }, { restaurantId: restaurantIdStr }]
            : [{ restaurant: restaurantIdStr }, { restaurantId: restaurantIdStr }]
      }).lean();

      const BankAccountSchema = new mongoose.Schema({}, { strict: false });
      const BankAccount = restaurantConn.model('BankAccount', BankAccountSchema, 'bankaccounts');
      bankAccount = await BankAccount.findOne({
        $or: restaurantIdObj 
            ? [{ restaurantId: restaurantIdObj }, { restaurantId: restaurantIdStr }, { restaurant: restaurantIdObj }, { restaurant: restaurantIdStr }]
            : [{ restaurantId: restaurantIdStr }, { restaurant: restaurantIdStr }]
      }).lean();
      
      // Connection is reused, no need to close
    } catch (e) {
      console.error('Error fetching extended restaurant details:', e.message);
    }

    let averagePreparationTime = 15;
    if (restaurant.menu && restaurant.menu.length > 0) {
      let totalPrepTime = 0;
      let itemCount = 0;
      restaurant.menu.forEach(category => {
        if (category.items && category.items.length > 0) {
          category.items.forEach(item => {
             totalPrepTime += (item.preparationTime || 15);
             itemCount++;
          });
        }
      });
      if (itemCount > 0) {
        averagePreparationTime = Math.round(totalPrepTime / itemCount);
      }
    }

    res.status(200).json({
      success: true,
      data: {
        ...restaurant,
        isNew,
        ownerDetails: ownerDetails ? {
           name: ownerDetails.name,
           email: ownerDetails.email,
           phone: ownerDetails.phone,
           lastLogin: ownerDetails.lastLogin,
           lastLogout: ownerDetails.lastLogout
        } : null,
        bankAccount,
        averagePreparationTime
      }
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching restaurant details'
    });
  }
};
