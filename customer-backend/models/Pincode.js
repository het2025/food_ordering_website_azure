import mongoose from 'mongoose';

const pincodeSchema = new mongoose.Schema({
  pincode: { 
    type: String, 
    required: true, 
    unique: true 
  },
  areaName: { 
    type: String, 
    required: true 
  },
  state: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  }
}, {
  timestamps: true
});

const Pincode = mongoose.model('Pincode', pincodeSchema);

export default Pincode;
