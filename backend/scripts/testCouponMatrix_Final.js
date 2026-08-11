require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Coupon = require('../src/models/Coupon');
const Product = require('../src/models/Product');
const CouponRedemption = require('../src/models/CouponRedemption');
const Order = require('../src/models/Order');
const couponService = require('../src/services/couponService');

async function runTests() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    // Clean up
    await Coupon.deleteMany({ code: { $regex: /^TEST_/ } });
    await CouponRedemption.deleteMany({});
    
    const productA = await Product.findOne();
    if (!productA) throw new Error('Need at least 1 product');
    
    let totalTests = 0;
    let passedTests = 0;

    const assertTest = (name, condition) => {
      totalTests++;
      if (condition) {
        console.log(`[PASS] ${name}`);
        passedTests++;
      } else {
        console.log(`[FAIL] ${name}`);
      }
    };

    // 1. Percentage
    const c1 = await Coupon.create({ code: 'TEST_PERC', discountType: 'percentage', discountValue: 10, isActive: true, allowGuest: true });
    const r1 = await couponService.validateAndCalculate('TEST_PERC', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Percentage coupon', r1.valid && r1.pricing.discount > 0);

    // 2. Fixed
    const c2 = await Coupon.create({ code: 'TEST_FIXED', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true });
    const r2 = await couponService.validateAndCalculate('TEST_FIXED', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Fixed coupon', r2.valid && r2.pricing.discount === 5);

    // 3. Free shipping
    const c3 = await Coupon.create({ code: 'TEST_FREE_SHIP', discountType: 'free_shipping', discountValue: 0, isActive: true, allowGuest: true });
    const r3 = await couponService.validateAndCalculate('TEST_FREE_SHIP', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Free shipping', r3.valid && r3.pricing.shippingDiscount === -1);

    // 4. Invalid code
    const r4 = await couponService.validateAndCalculate('TEST_INVALID_CODE', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Invalid code', !r4.valid && r4.message === 'Invalid coupon code');

    // 5. Expired code
    const c5 = await Coupon.create({ code: 'TEST_EXPIRED', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, expiryDate: new Date(Date.now() - 10000) });
    const r5 = await couponService.validateAndCalculate('TEST_EXPIRED', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Expired code', !r5.valid && r5.message === 'Coupon has expired');

    // 6. Future code
    const c6 = await Coupon.create({ code: 'TEST_FUTURE', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, startDate: new Date(Date.now() + 100000) });
    const r6 = await couponService.validateAndCalculate('TEST_FUTURE', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Future code', !r6.valid && r6.message === 'Coupon is not yet active');

    // 7. Disabled coupon
    const c7 = await Coupon.create({ code: 'TEST_DISABLED', discountType: 'fixed', discountValue: 5, isActive: false, allowGuest: true });
    const r7 = await couponService.validateAndCalculate('TEST_DISABLED', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Disabled coupon', !r7.valid && r7.message === 'Coupon is not active');

    // 8. Minimum order
    const c8 = await Coupon.create({ code: 'TEST_MIN', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, minPurchaseAmount: 999999 });
    const r8 = await couponService.validateAndCalculate('TEST_MIN', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Minimum order failure', !r8.valid && r8.message.includes('Minimum order'));

    // 9. Maximum discount
    const c9 = await Coupon.create({ code: 'TEST_MAX_DISC', discountType: 'percentage', discountValue: 100, isActive: true, allowGuest: true, maxDiscountAmount: 2 });
    const r9 = await couponService.validateAndCalculate('TEST_MAX_DISC', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Maximum discount', r9.valid && r9.pricing.discount === 2);

    // 10. Product-specific
    const c10 = await Coupon.create({ code: 'TEST_PROD_SPEC', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, applicableProducts: [productA._id] });
    const r10 = await couponService.validateAndCalculate('TEST_PROD_SPEC', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Product-specific', r10.valid);

    // 12. Excluded product
    const c12 = await Coupon.create({ code: 'TEST_EXCL_PROD', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, excludedProducts: [productA._id] });
    const r12 = await couponService.validateAndCalculate('TEST_EXCL_PROD', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Excluded product', !r12.valid && r12.message === 'No eligible items in cart for this coupon');

    // 15. Customer-specific
    const c15 = await Coupon.create({ code: 'TEST_CUST_SPEC', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: false, customerEligibility: [new mongoose.Types.ObjectId()] });
    const r15 = await couponService.validateAndCalculate('TEST_CUST_SPEC', [{ productId: productA._id, quantity: 1 }], new mongoose.Types.ObjectId());
    assertTest('Customer-specific mismatch', !r15.valid && r15.message.includes('eligible'));

    // 17. Guest rejected
    const c17 = await Coupon.create({ code: 'TEST_NO_GUEST', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: false });
    const r17 = await couponService.validateAndCalculate('TEST_NO_GUEST', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Guest rejected', !r17.valid && r17.message.includes('logged in'));

    // 18. Global usage limit
    const c18 = await Coupon.create({ code: 'TEST_GLOBAL_LIM', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, maxUsageLimit: 1, currentUsageCount: 1 });
    const r18 = await couponService.validateAndCalculate('TEST_GLOBAL_LIM', [{ productId: productA._id, quantity: 1 }], null);
    assertTest('Global usage limit', !r18.valid && r18.message.includes('usage limit reached'));

    // 19. Per-customer limit
    const mockCustomerId = new mongoose.Types.ObjectId();
    const c19 = await Coupon.create({ code: 'TEST_CUST_LIM', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: false, perCustomerUsageLimit: 1 });
    await CouponRedemption.create({ couponId: c19._id, customerId: mockCustomerId, orderId: new mongoose.Types.ObjectId(), discountAmount: 5 });
    const r19 = await couponService.validateAndCalculate('TEST_CUST_LIM', [{ productId: productA._id, quantity: 1 }], mockCustomerId);
    assertTest('Per-customer limit', !r19.valid && r19.message.includes('maximum usage limit'));

    // Transaction atomicity tests
    let txSupported = false;
    const adminDb = mongoose.connection.db.admin();
    const info = await adminDb.command({ replSetGetStatus: 1 }).catch(() => null);
    if (info) {
      txSupported = true;
    }
    
    assertTest('Transaction support verified', txSupported);
    if (txSupported) {
      const session = await mongoose.startSession();
      session.startTransaction();
      try {
        const c25 = await Coupon.create([{ code: 'TEST_TX', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, maxUsageLimit: 1 }], { session });
        await couponService.applyCouponUsage(c25[0]._id, null, new mongoose.Types.ObjectId(), 5, session);
        await session.abortTransaction();
        const check = await Coupon.findOne({ code: 'TEST_TX' });
        assertTest('Transaction rollback', check === null);
      } catch (err) {
        await session.abortTransaction();
        assertTest('Transaction rollback', false);
      } finally {
        session.endSession();
      }
    } else {
       console.log('Skipping Transaction test: STANDALONE DB');
    }

    console.log(`\nResults: ${passedTests}/${totalTests} Passed`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
runTests();
