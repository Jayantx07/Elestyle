const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const Coupon = require('../src/models/Coupon');

async function inspectCoupons() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');
    
    const coupons = await Coupon.find({}).lean();
    console.log('Existing Coupons count:', coupons.length);
    console.log('Coupons:', JSON.stringify(coupons, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

inspectCoupons();
