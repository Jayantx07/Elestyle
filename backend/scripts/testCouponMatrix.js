const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Coupon = require('../src/models/Coupon');
const Product = require('../src/models/Product');
const CouponRedemption = require('../src/models/CouponRedemption');
const couponService = require('../src/services/couponService');

dotenv.config({ path: 'backend/.env' });

const env = require('../src/config/env');

async function runTests() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    // Setup Test Data
    await Coupon.deleteMany({ code: { $regex: /^TEST_/ } });
    await CouponRedemption.deleteMany({});
    
    // Create dummy products
    const productA = await Product.findOne();
    if (!productA) throw new Error('Need at least 1 product in DB to test');
    
    // Test Case 1: Simple percentage
    const coupon1 = await Coupon.create({
      code: 'TEST_PERC',
      discountType: 'percentage',
      discountValue: 10, // 10%
      isActive: true,
      allowGuest: true
    });

    const res1 = await couponService.validateAndCalculate('TEST_PERC', [{ productId: productA._id, quantity: 1 }], null);
    console.log('Test 1 (Percentage):', res1.valid ? 'PASS' : 'FAIL', res1.pricing);

    // Test Case 2: Inactive
    const coupon2 = await Coupon.create({
      code: 'TEST_INACTIVE',
      discountType: 'percentage',
      discountValue: 10,
      isActive: false
    });
    const res2 = await couponService.validateAndCalculate('TEST_INACTIVE', [{ productId: productA._id, quantity: 1 }], null);
    console.log('Test 2 (Inactive):', !res2.valid ? 'PASS' : 'FAIL', res2.message);

    // Test Case 3: Min Purchase
    const coupon3 = await Coupon.create({
      code: 'TEST_MIN',
      discountType: 'fixed',
      discountValue: 5,
      minPurchaseAmount: 999999, // Guarantee fail
      isActive: true,
      allowGuest: true
    });
    const res3 = await couponService.validateAndCalculate('TEST_MIN', [{ productId: productA._id, quantity: 1 }], null);
    console.log('Test 3 (Min Purchase):', !res3.valid ? 'PASS' : 'FAIL', res3.message);

    // Test Case 4: Global Usage Limit
    const coupon4 = await Coupon.create({
      code: 'TEST_LIMIT',
      discountType: 'fixed',
      discountValue: 5,
      maxUsageLimit: 1,
      currentUsageCount: 1,
      isActive: true,
      allowGuest: true
    });
    const res4 = await couponService.validateAndCalculate('TEST_LIMIT', [{ productId: productA._id, quantity: 1 }], null);
    console.log('Test 4 (Global Limit):', !res4.valid ? 'PASS' : 'FAIL', res4.message);

    console.log('All core logic tests executed.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runTests();
