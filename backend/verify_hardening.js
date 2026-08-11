const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Review = require('./src/models/Review');
const User = require('./src/models/User');
const Product = require('./src/models/Product');

const runVerification = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Verification Matrix');

    let passCount = 0;
    let failCount = 0;
    const report = [];

    const user = await User.findOne();
    const product = await Product.findOne();

    if (!user || !product) {
      console.log('Skipping DB tests: need at least 1 user and 1 product in DB');
      process.exit(1);
    }

    // 1. Review Uniqueness Test
    console.log('\n--- Test 1: Review Uniqueness ---');
    try {
      await Review.create({
        product: product._id,
        user: user._id,
        customerName: 'Test',
        customerEmail: 'test@test.com',
        rating: 5,
        comment: 'Test 1'
      });
      
      // Should fail
      await Review.create({
        product: product._id,
        user: user._id,
        customerName: 'Test',
        customerEmail: 'test@test.com',
        rating: 4,
        comment: 'Test 2'
      });
      
      report.push('FAIL: Duplicate review was allowed.');
      failCount++;
    } catch (err) {
      if (err.code === 11000) {
        report.push('PASS: Duplicate review correctly rejected by DB index.');
        passCount++;
      } else {
        report.push(`FAIL: Duplicate review failed with wrong error: ${err.message}`);
        failCount++;
      }
    } finally {
      // Cleanup
      await Review.deleteMany({ customerName: 'Test', comment: /^Test/ });
    }

    // 2. Review Aggregation Test
    console.log('\n--- Test 2: Review Aggregation Hooks ---');
    try {
      const p1 = await Product.findById(product._id);
      const initialRating = p1.ratingAverage || 0;
      const initialCount = p1.reviewCount || 0;

      // Create approved review
      const rev = await Review.create({
        product: product._id,
        user: user._id,
        customerName: 'Test Hook',
        customerEmail: 'testhook@test.com',
        rating: 5,
        comment: 'Test Hook',
        status: 'approved' // Will trigger save hook
      });
      
      // Wait a bit for async hooks (they might be fast, but just in case)
      await new Promise(r => setTimeout(r, 500));
      
      let p2 = await Product.findById(product._id);
      if (p2.reviewCount > initialCount) {
        report.push('PASS: create+approve correctly increments reviewCount.');
        passCount++;
      } else {
        report.push('FAIL: create+approve did not increment reviewCount.');
        failCount++;
      }

      // Hide review via findByIdAndUpdate
      await Review.findByIdAndUpdate(rev._id, { status: 'pending' });
      await new Promise(r => setTimeout(r, 500));
      let p3 = await Product.findById(product._id);
      
      if (p3.reviewCount === initialCount) {
         report.push('PASS: hiding review via findByIdAndUpdate correctly decrements reviewCount.');
         passCount++;
      } else {
         report.push('FAIL: hiding review did not decrement reviewCount.');
         failCount++;
      }

      // Cleanup via findByIdAndDelete
      await Review.findByIdAndUpdate(rev._id, { status: 'approved' }); // approve again
      await new Promise(r => setTimeout(r, 500));
      await Review.findByIdAndDelete(rev._id); // delete
      await new Promise(r => setTimeout(r, 500));
      
      let p4 = await Product.findById(product._id);
      if (p4.reviewCount === initialCount) {
        report.push('PASS: deleting review via findByIdAndDelete correctly aggregates.');
        passCount++;
      } else {
        report.push('FAIL: deleting review failed to aggregate.');
        failCount++;
      }

    } catch (err) {
      report.push(`FAIL: Aggregation test error: ${err.message}`);
      failCount++;
    }

    console.log('\n=== VERIFICATION MATRIX REPORT ===');
    report.forEach(r => console.log(r));
    console.log(`\nPassed: ${passCount}, Failed: ${failCount}`);

    process.exit(failCount > 0 ? 1 : 0);
  } catch (error) {
    console.error('Test script failed:', error);
    process.exit(1);
  }
};

runVerification();
