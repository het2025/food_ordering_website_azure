import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['home', 'work', 'other'],
    default: 'home'
  },
  street: {
    type: String,
    required: true,
    maxlength: 100
  },
  city: {
    type: String,
    required: true,
    maxlength: 100
  },
  state: {
    type: String,
    required: true,
    maxlength: 100
  },
  pincode: {
    type: String,
    required: true,
    maxlength: 10
  },
  landmark: {
    type: String,
    maxlength: 100
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: true });

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add your name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please add your email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false
  },
  phone: {
    type: String,
    default: '',
    trim: true,
    maxlength: 15,
    validate: {
      validator: function (v) {
        return !v || /^\d{10}$/.test(v.replace(/\D/g, ''));
      },
      message: 'Please enter a valid 10-digit phone number'
    }
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'admin', 'driver'],
    default: 'customer'
  },
  driverDetails: {
    licenseNumber: String,
    vehicleType: {
      type: String,
      enum: ['bike', 'scooter', 'car', 'bicycle']
    },
    vehicleNumber: String,
    isAvailable: {
      type: Boolean,
      default: true
    },
    currentLocation: {
      lat: Number,
      lng: Number
    }
  },
  addresses: [AddressSchema],
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant'
  }],
  favoriteDishes: [{
    dishId: String,
    dishName: String,
    dishPrice: Number,
    dishImage: String,
    restaurantId: String,
    restaurantName: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  completedOrdersCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ role: 1 });

// Pre-save middleware to ensure email is always lowercase
UserSchema.pre('save', function (next) {
  if (this.email) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

const User = mongoose.model('User', UserSchema);
export default User;
