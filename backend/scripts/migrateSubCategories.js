const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const connectDB = require('../src/config/db');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Product = require('../src/models/Product');
const slugify = require('slugify');

async function runMigration() {
  console.log('====================================================');
  console.log('🚀 Starting WF-05 Enterprise SubCategory Migration...');
  console.log('====================================================');

  await connectDB();

  let session = null;
  try {
    session = await mongoose.startSession();
    session.startTransaction();
    console.log('🔒 MongoDB Transaction Session active for atomic migration.');
  } catch (sErr) {
    console.warn('⚠️ MongoDB Transaction Session not supported in standalone mode. Running safely...');
    session = null;
  }

  const options = session ? { session } : {};
  const logReport = {
    timestamp: new Date().toISOString(),
    strategy: 'Expand -> Migrate -> Switch -> Contract (Transactional)',
    summary: {
      categoriesProcessed: 0,
      subCategoriesCreated: 0,
      subCategoriesSkipped: 0,
      productsProcessed: 0,
      productsMigrated: 0,
      productsSkipped: 0,
      productsRequiringManualReview: 0,
      errorsCount: 0,
    },
    Migrated: [],
    Skipped: [],
    Errors: [],
    Mapped: [],
    ManualReview: [],
  };

  try {
    // 1. Migrate Categories -> SubCategories collection (Idempotent)
    const categories = await Category.find({}, null, options);
    logReport.summary.categoriesProcessed = categories.length;
    console.log(`\n📦 Processing ${categories.length} Categories...`);

    const subCategoryMap = {}; // Key: "categoryId_subCatNameLower", Value: SubCategory._id

    for (const category of categories) {
      if (category.schemaVersion !== 2) {
        category.schemaVersion = 2;
        await category.save(options);
      }

      const subs = category.subCategories || [];
      for (const subName of subs) {
        if (!subName || typeof subName !== 'string' || subName.trim() === '') continue;
        const cleanedName = subName.trim();
        const generatedSlug = slugify(cleanedName, { lower: true, strict: true });
        const mapKey = `${category._id.toString()}_${cleanedName.toLowerCase()}`;

        try {
          let subDoc = await SubCategory.findOne({
            category: category._id,
            $or: [{ name: { $regex: new RegExp(`^${cleanedName}$`, 'i') } }, { slug: generatedSlug }],
          }, null, options);

          if (!subDoc) {
            [subDoc] = await SubCategory.create([{
              name: cleanedName,
              slug: generatedSlug,
              category: category._id,
              description: `${cleanedName} under ${category.name} collection`,
              schemaVersion: 2,
              isActive: true,
              showInSearch: true,
              showInCircularCarousel: true,
            }], options);
            logReport.summary.subCategoriesCreated++;
            logReport.Mapped.push({ type: 'SubCategoryCreated', name: cleanedName, slug: subDoc.slug, parentCategory: category.name });
            console.log(`   ✅ Created SubCategory: "${cleanedName}" under "${category.name}"`);
          } else {
            logReport.summary.subCategoriesSkipped++;
            logReport.Skipped.push({ type: 'SubCategoryExists', name: cleanedName, id: subDoc._id });
          }

          subCategoryMap[mapKey] = subDoc._id;
        } catch (err) {
          logReport.summary.errorsCount++;
          logReport.Errors.push({ type: 'SubCategoryCreationError', name: cleanedName, error: err.message });
          console.error(`   ❌ Error creating SubCategory "${cleanedName}":`, err.message);
        }
      }
    }

    // 2. Migrate Products -> set ObjectId reference and legacySubCategory String
    const products = await Product.find({}, null, options);
    logReport.summary.productsProcessed = products.length;
    console.log(`\n🏷️ Processing ${products.length} Products for Relational Linking...`);

    for (const product of products) {
      try {
        let isModified = false;
        let originalSubCatVal = product.subCategory;
        let legacyVal = product.legacySubCategory;

        const currentString = (typeof originalSubCatVal === 'string' && !mongoose.Types.ObjectId.isValid(originalSubCatVal))
          ? originalSubCatVal
          : legacyVal || (typeof originalSubCatVal === 'string' ? originalSubCatVal : null);

        if (typeof originalSubCatVal === 'string' && !mongoose.Types.ObjectId.isValid(originalSubCatVal)) {
          if (!product.legacySubCategory) {
            product.legacySubCategory = originalSubCatVal.trim();
            isModified = true;
          }
        }

        if (product.category && currentString) {
          const lookupKey = `${product.category.toString()}_${currentString.toString().trim().toLowerCase()}`;
          let matchedSubCatId = subCategoryMap[lookupKey];

          if (!matchedSubCatId) {
            const foundSub = await SubCategory.findOne({
              category: product.category,
              $or: [
                { name: { $regex: new RegExp(`^${currentString.toString().trim()}$`, 'i') } },
                { slug: slugify(currentString.toString().trim(), { lower: true, strict: true }) },
              ],
            }, null, options);
            if (foundSub) matchedSubCatId = foundSub._id;
          }

          if (matchedSubCatId) {
            if (String(product.subCategory) !== String(matchedSubCatId)) {
              product.subCategory = matchedSubCatId;
              if (!product.legacySubCategory && typeof currentString === 'string') {
                product.legacySubCategory = currentString.trim();
              }
              isModified = true;
              logReport.summary.productsMigrated++;
              logReport.Migrated.push({
                productId: product._id,
                name: product.name,
                fromString: currentString,
                toObjectId: matchedSubCatId,
              });
              console.log(`   🔗 Migrated Product "${product.name}" -> SubCategory ObjectId: ${matchedSubCatId}`);
            } else {
              logReport.summary.productsSkipped++;
              logReport.Skipped.push({ type: 'ProductAlreadyLinked', productId: product._id, name: product.name });
            }
          } else {
            logReport.summary.productsRequiringManualReview++;
            logReport.ManualReview.push({
              productId: product._id,
              name: product.name,
              categoryId: product.category,
              unresolvedSubCategory: currentString,
              reason: 'No matching SubCategory found under parent Category',
            });
            console.warn(`   ⚠️ Manual Review Required: Product "${product.name}" has unmapped subCategory "${currentString}"`);
          }
        } else {
          logReport.summary.productsSkipped++;
          logReport.Skipped.push({ type: 'NoSubCategoryToMigrate', productId: product._id, name: product.name });
        }

        if (product.schemaVersion !== 2) {
          product.schemaVersion = 2;
          isModified = true;
        }

        if (isModified) {
          await product.save(options);
        }
      } catch (err) {
        logReport.summary.errorsCount++;
        logReport.Errors.push({ type: 'ProductMigrationError', productId: product._id, error: err.message });
        console.error(`   ❌ Error migrating Product "${product.name}":`, err.message);
      }
    }

    if (session) {
      await session.commitTransaction();
      session.endSession();
      console.log('\n🔒 Transaction Committed Safely!');
    }

    const logFilePath = path.join(__dirname, '../../migration-log.json');
    fs.writeFileSync(logFilePath, JSON.stringify(logReport, null, 2), 'utf-8');

    console.log('\n====================================================');
    console.log('✅ Migration Completed Successfully!');
    console.log(`📊 Summary:
       - Categories Processed: ${logReport.summary.categoriesProcessed}
       - SubCategories Created: ${logReport.summary.subCategoriesCreated} (Skipped: ${logReport.summary.subCategoriesSkipped})
       - Products Processed: ${logReport.summary.productsProcessed}
       - Products Migrated to Relational ObjectId: ${logReport.summary.productsMigrated}
       - Products Requiring Manual Review: ${logReport.summary.productsRequiringManualReview}
       - Errors Encountered: ${logReport.summary.errorsCount}`);
    console.log(`📜 Detailed Audit Log saved to: ${logFilePath}`);
    console.log('====================================================\n');

  } catch (error) {
    console.error('❌ Fatal Migration Error:', error);
    if (session) {
      await session.abortTransaction();
      session.endSession();
      console.log('🔁 Transaction Aborted. No changes were applied.');
    }
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
}

runMigration();
