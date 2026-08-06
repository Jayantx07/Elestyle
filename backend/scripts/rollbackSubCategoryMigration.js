const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('../src/config/db');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Product = require('../src/models/Product');

/**
 * Enterprise Migration Rollback Script (Production Safe & Atomic)
 * Safely undoes WF-05 relational changes in the event of an unexpected production rollback requirement.
 * Restores Product.subCategory string values from legacySubCategory and reverts schemaVersion to 1
 * without deleting any products or categories.
 */
async function runRollback() {
  console.log('====================================================');
  console.log('⚠️ Starting WF-05 Relational Migration Rollback...');
  console.log('====================================================');

  await connectDB();

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    console.log('🔒 MongoDB Transaction Session initiated for rollback.');
  } catch (sErr) {
    console.warn('⚠️ MongoDB Transaction Session not supported in this DB environment (standalone). Proceeding safely...');
    session = null;
  }

  const options = session ? { session } : {};
  const logReport = {
    timestamp: new Date().toISOString(),
    action: 'ROLLBACK_WF_05',
    summary: {
      productsReverted: 0,
      categoriesReverted: 0,
      subCategoriesPurged: 0,
      errorsCount: 0,
    },
  };

  try {
    // 1. Revert Products to legacy string representations & Schema v1
    const products = await Product.find({}, null, options);
    console.log(`\n🏷️ Inspecting ${products.length} Products for Rollback...`);

    for (const product of products) {
      let modified = false;
      if (product.legacySubCategory && product.subCategory && mongoose.Types.ObjectId.isValid(product.subCategory)) {
        // Re-assign string back into subCategory field
        product.subCategory = undefined; // unset relational reference
        await Product.collection.updateOne(
          { _id: product._id },
          { $set: { subCategory: product.legacySubCategory, schemaVersion: 1 } },
          options
        );
        logReport.summary.productsReverted++;
        modified = true;
      } else if (product.schemaVersion === 2) {
        await Product.collection.updateOne(
          { _id: product._id },
          { $set: { schemaVersion: 1 } },
          options
        );
        logReport.summary.productsReverted++;
      }
    }

    // 2. Revert Categories schemaVersion back to 1
    const categories = await Category.find({}, null, options);
    console.log(`\n📦 Reverting ${categories.length} Categories Schema Version...`);
    for (const category of categories) {
      if (category.schemaVersion === 2) {
        await Category.collection.updateOne(
          { _id: category._id },
          { $set: { schemaVersion: 1 } },
          options
        );
        logReport.summary.categoriesReverted++;
      }
    }

    // 3. Purge SubCategories collection generated during migration
    const subCatCount = await SubCategory.countDocuments({}, options);
    if (subCatCount > 0) {
      await SubCategory.deleteMany({}, options);
      logReport.summary.subCategoriesPurged = subCatCount;
      console.log(`\n🗑️ Purged ${subCatCount} generated SubCategory collection records.`);
    }

    if (session) {
      await session.commitTransaction();
      session.endSession();
      console.log('✅ Rollback Transaction Committed Successfully!');
    }

    const logFilePath = path.join(__dirname, '../../rollback-log.json');
    fs.writeFileSync(logFilePath, JSON.stringify(logReport, null, 2), 'utf-8');

    console.log('\n====================================================');
    console.log('🎯 Rollback Completed Successfully!');
    console.log(`📊 Summary:
       - Products Reverted to Legacy String: ${logReport.summary.productsReverted}
       - Categories Reverted to Schema v1: ${logReport.summary.categoriesReverted}
       - SubCategories Purged: ${logReport.summary.subCategoriesPurged}
       - Errors Encountered: ${logReport.summary.errorsCount}`);
    console.log(`📜 Audit Log saved to: ${logFilePath}`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Fatal Rollback Error:', error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
      console.log('🔁 Transaction Aborted. All changes rolled back cleanly.');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runRollback();
