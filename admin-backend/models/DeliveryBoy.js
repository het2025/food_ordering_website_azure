import mongoose from 'mongoose';

const deliveryBoySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 100,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    maxlength: 15,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    select: false
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'bicycle', 'car'],
    default: 'bike'
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Vehicle number is required'],
    maxlength: 15,
  },
  drivingLicense: {
    type: String,
    required: [true, 'Driving license is required'],
    maxlength: 20,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    }
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  currentOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    default: null
  },
  completedOrders: {
    type: Number,
    default: 0
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 5,
    min: 0,
    max: 5
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  documents: {
    profilePhoto: String,
    licensePhoto: String,
    vehiclePhoto: String,
    aadharCard: String
  }
}, {
  timestamps: true
});

export const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
