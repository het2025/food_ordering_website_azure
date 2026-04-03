import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,
    maxlength: 15,
    match: [/^[0-9]{10,15}$/, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
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
    match: [/^[A-Z]{2}[ -]?[0-9]{1,2}(?:[ -]?[A-Z]{1,2})?[ -]?[0-9]{4}$/i, 'Please enter a valid Indian vehicle number']
  },
  drivingLicense: {
    type: String,
    required: [true, 'Driving license is required'],
    maxlength: 20,
    validate: {
      validator: function (v) {
        // Accept various Indian DL formats:
        // - Standard: XX00 00000000000 (2 letters + 13 digits)
        // - Numeric only: 16 digits
        // - With spaces/dashes
        const cleaned = v.replace(/[\s-]/g, '');
        return /^[A-Z0-9]{10,20}$/i.test(cleaned);
      },
      message: 'Please enter a valid driving license number'
    }
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
    ref: 'DeliveryOrder',
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
  },
  bankDetails: {
    accountNumber: { type: String, trim: true },
    accountName: { type: String, trim: true },
    ifscCode: { type: String, trim: true }
  }
}, {
  timestamps: true
});

// Create geospatial index
deliveryBoySchema.index({ currentLocation: '2dsphere' });

// Hash password before saving
deliveryBoySchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password
deliveryBoySchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
deliveryBoySchema.methods.getJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: 'delivery' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

export const DeliveryBoy = mongoose.model('DeliveryBoy', deliveryBoySchema);
