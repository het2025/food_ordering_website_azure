import mongoose from 'mongoose';

const deliveryPayoutSchema = new mongoose.Schema({
  deliveryUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Completed'
  },
  paidAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export const DeliveryPayout = mongoose.model('DeliveryPayout', deliveryPayoutSchema);
