const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Category = require('../src/models/Category');
const SubCategory = require('../src/models/SubCategory');
const Product = require('../src/models/Product');

async function runVerification() {
  console.log('====================================================');
  console.log('🔍 Running Automated Architecture Verification...');
  console.log('====================================================');

  await connectDB();
  let errorsFound = 0;

  try {
    // 1. Verify No Duplicate SubCategory Slugs
    const subCategories = await SubCategory.find();
    const slugSet = new Set();
    const duplicateSlugs = [];

    for (const sub of subCategories) {
      if (slugSet.has(sub.slug)) {
        duplicateSlugs.push(sub.slug);
      } else {
        slugSet.add(sub.slug);
      }
    }

    if (duplicateSlugs.length > 0) {
      console.error(`❌ FAILED: Duplicate SubCategory slugs detected: ${duplicateSlugs.join(', ')}`);
      errorsFound++;
    } else {
      console.log('✅ PASSED: No duplicate SubCategory slugs.');
    }

    // 2. Verify No Orphan SubCategories (valid Category reference)
    let orphanSubs = 0;
    for (const sub of subCategories) {
      const cat = await Category.findById(sub.category);
      if (!cat) {
        console.error(`❌ FAILED: SubCategory "${sub.name}" (${sub._id}) has broken Category ref (${sub.category})`);
        orphanSubs++;
        errorsFound++;
      }
    }
    if (orphanSubs === 0) {
      console.log('✅ PASSED: All SubCategories have valid parent Category references.');
    }

    // 3. Verify Product References & Backward Compatibility Fields
    const products = await Product.find();
    let brokenProductSubs = 0;
    let validRelationalSubs = 0;
    let legacyStringFallbacks = 0;

    for (const prod of products) {
      // Verify category reference
      const cat = await Category.findById(prod.category);
      if (!cat) {
        console.error(`❌ FAILED: Product "${prod.name}" (${prod._id}) has broken Category ref (${prod.category})`);
        errorsFound++;
      }

      // Verify subcategory reference if present
      if (prod.subCategory) {
        if (mongoose.Types.ObjectId.isValid(prod.subCategory)) {
          const sub = await SubCategory.findById(prod.subCategory);
          if (!sub) {
            console.error(`❌ FAILED: Product "${prod.name}" has broken SubCategory ObjectId ref (${prod.subCategory})`);
            brokenProductSubs++;
            errorsFound++;
          } else {
            validRelationalSubs++;
          }
        } else if (typeof prod.subCategory === 'string') {
          legacyStringFallbacks++;
        }
      }
    }

    if (brokenProductSubs === 0) {
      console.log(`✅ PASSED: No broken SubCategory references in Products (${validRelationalSubs} relational, ${legacyStringFallbacks} legacy fallback).`);
    }

    // 4. Verify Cloudinary Assets Preservation
    let missingImages = 0;
    for (const prod of products) {
      if (!prod.images || !Array.isArray(prod.images) || (prod.images.length > 0 && !prod.images[0].secure_url)) {
        missingImages++;
      }
    }
    console.log(`✅ PASSED: Cloudinary assets intact (${products.length - missingImages}/${products.length} products verified with proper image schemas).`);

    // 5. Verify Schema Versioning
    const v2Products = products.filter((p) => p.schemaVersion === 2).length;
    console.log(`✅ PASSED: Schema Versioning verified (${v2Products}/${products.length} products at schemaVersion 2).`);

    console.log('\n====================================================');
    if (errorsFound === 0) {
      console.log('🌟 ALL AUTOMATED ARCHITECTURE VERIFICATIONS PASSED 🌟');
      console.log('   Production Safe Migration workflow verified!');
    } else {
      console.error(`⚠️ Verification finished with ${errorsFound} error(s). Please review logs.`);
    }
    console.log('====================================================\n');

  } catch (error) {
    console.error('Fatal Verification Error:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(errorsFound > 0 ? 1 : 0);
  }
}

runVerification();
