import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'fixed', 'free_delivery'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    minSpend: {
        type: Number,
        default: 0,
        min: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    expiryDate: {
        type: Date
    },
    usageLimit: {
        type: Number, // Total times this coupon can be used globally
        default: null
    },
    usedCount: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

// Check if coupon is valid
couponSchema.methods.isValid = function () {
    if (!this.isActive) return false;
    if (this.expiryDate && this.expiryDate < new Date()) return false;
    if (this.usageLimit && this.usedCount >= this.usageLimit) return false;
    return true;
};

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;
