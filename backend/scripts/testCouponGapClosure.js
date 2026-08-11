require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const env = require('../src/config/env');
const Coupon = require('../src/models/Coupon');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');
const Order = require('../src/models/Order');
const User = require('../src/models/User');
const CouponUsageTracker = require('../src/models/CouponUsageTracker');
const couponService = require('../src/services/couponService');

async function runTests() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('Connected to DB');

    // Clean up
    await Coupon.deleteMany({ code: { $regex: /^TEST_/ } });
    await CouponUsageTracker.deleteMany({});
    await User.deleteOne({ email: 'test_gap@example.com' });
    await Order.deleteMany({ 'customer.email': 'test_gap@example.com' });
    await Order.deleteMany({ 'customer.email': 'test_existing@example.com' });
    await Category.deleteMany({ name: { $regex: /^TEST_CAT/ } });
    await Product.deleteMany({ name: { $regex: /^TEST_PROD/ } });
    
    // Create test user and existing order
    const testUser = await User.create({ name: 'Gap Test', email: 'test_gap@example.com', password: 'password', role: 'customer' });
    const existingUser = await User.create({ name: 'Existing', email: 'test_existing@example.com', password: 'password', role: 'customer' });
    
    // Create test categories
    const catA = await Category.create({ name: 'TEST_CATA', description: 'desc', slug: 'test-cata' });
    const catB = await Category.create({ name: 'TEST_CATB', description: 'desc', slug: 'test-catb' });

    // Create test products
    const productA = await Product.create({ name: 'TEST_PRODA', price: 100, stock: 10, category: catA._id, description: 'desc', slug: 'test-proda' });
    const productB = await Product.create({ name: 'TEST_PRODB', price: 50, stock: 10, category: catB._id, description: 'desc', slug: 'test-prodb' });

    // Create an existing order for existingUser
    await Order.create({
      orderNumber: 'TEST-ORD-123',
      customer: { name: existingUser.name, email: existingUser.email, phone: '123' },
      shippingAddress: { addressLine1: '123', city: 'c', state: 's', postalCode: 'p', country: 'c' },
      billingAddress: { addressLine1: '123', city: 'c', state: 's', postalCode: 'p', country: 'c' },
      items: [{ product: productA._id, name: 'TEST_PRODA', price: 100, quantity: 1 }],
      paymentMethod: 'Credit Card',
      subtotal: 100, grandTotal: 100,
      orderStatus: 'delivered'
    });
    
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

    // Category Inclusions
    const cCatInc = await Coupon.create({ code: 'TEST_CAT_INC', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, applicableCategories: [catA._id] });
    const rCatIncA = await couponService.validateAndCalculate('TEST_CAT_INC', [{ productId: productA._id, quantity: 1 }], null);
    const rCatIncB = await couponService.validateAndCalculate('TEST_CAT_INC', [{ productId: productB._id, quantity: 1 }], null);
    assertTest('Category-specific (Eligible)', rCatIncA.valid);
    assertTest('Category-specific (Ineligible)', !rCatIncB.valid);

    // Category Exclusions
    const cCatExc = await Coupon.create({ code: 'TEST_CAT_EXC', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: true, excludedCategories: [catA._id] });
    const rCatExcMixed = await couponService.validateAndCalculate('TEST_CAT_EXC', [
      { productId: productA._id, quantity: 1 },
      { productId: productB._id, quantity: 1 }
    ], null);
    assertTest('Excluded category (Mixed cart removes excluded)', rCatExcMixed.valid && rCatExcMixed.pricing.subtotal === 150 && rCatExcMixed.pricing.discount === 5 && rCatExcMixed.pricing.grandTotal === 145);

    // First Order
    const cFirst = await Coupon.create({ code: 'TEST_FIRST', discountType: 'fixed', discountValue: 10, isActive: true, allowGuest: false, isFirstOrderOnly: true });
    const rFirstGuest = await couponService.validateAndCalculate('TEST_FIRST', [{ productId: productA._id, quantity: 1 }], null);
    const rFirstNew = await couponService.validateAndCalculate('TEST_FIRST', [{ productId: productA._id, quantity: 1 }], testUser._id);
    const rFirstOld = await couponService.validateAndCalculate('TEST_FIRST', [{ productId: productA._id, quantity: 1 }], existingUser._id);
    assertTest('First order (Guest rejected)', !rFirstGuest.valid && rFirstGuest.message.includes('logged in'));
    assertTest('First order (New customer)', rFirstNew.valid);
    assertTest('First order (Existing customer rejected)', !rFirstOld.valid && rFirstOld.message.includes('first order'));

    // Auto Apply & Priority
    await Coupon.create({ code: 'TEST_AUTO_1', discountType: 'fixed', discountValue: 10, isActive: true, autoApply: true, priority: 50, allowGuest: true });
    await Coupon.create({ code: 'TEST_AUTO_2', discountType: 'fixed', discountValue: 50, isActive: true, autoApply: true, priority: 10, allowGuest: true });
    const rAuto = await couponService.findBestAutoApplyCoupon([{ productId: productA._id, quantity: 1 }], null);
    assertTest('Auto Apply (Priority Engine)', rAuto && rAuto.code === 'TEST_AUTO_1' && rAuto.pricing.discount === 10);

    // Atomic Per-Customer Concurrency check
    const cAtomic = await Coupon.create({ code: 'TEST_ATOMIC', discountType: 'fixed', discountValue: 5, isActive: true, allowGuest: false, perCustomerUsageLimit: 1 });
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
      await couponService.applyCouponUsage(cAtomic._id, testUser._id, new mongoose.Types.ObjectId(), 5, session);
      await session.commitTransaction();
      assertTest('Atomic tracking (First usage)', true);
    } catch (err) {
      assertTest('Atomic tracking (First usage)', false);
    }
    session.endSession();

    const session2 = await mongoose.startSession();
    session2.startTransaction();
    try {
      await couponService.applyCouponUsage(cAtomic._id, testUser._id, new mongoose.Types.ObjectId(), 5, session2);
      await session2.commitTransaction();
      assertTest('Atomic tracking (Duplicate usage blocked)', false);
    } catch (err) {
      await session2.abortTransaction();
      assertTest('Atomic tracking (Duplicate usage blocked)', err.message === 'CUSTOMER_USAGE_LIMIT_REACHED');
    }
    session2.endSession();

    console.log(`\nGap Closure Tests: ${passedTests}/${totalTests} Passed`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
runTests();
