require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../models/Category');

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/ellestyle';

const finalCategories = [
  {
    name: 'Home Furnishing',
    slug: 'home-furnishing',
    displayOrder: 1,
    showInNavbar: true,
    showInHomepage: true,
    showInCircularCarousel: true,
    showInSearch: true,
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg'
  },
  {
    name: 'Rajasthan Heritage',
    slug: 'rajasthan-heritage',
    displayOrder: 2,
    showInNavbar: true,
    showInHomepage: true,
    showInCircularCarousel: true,
    showInSearch: true,
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/Rajasthani_Vibe_u6p0zm.jpg'
  },
  {
    name: 'Earrings Collection',
    slug: 'earrings-collection',
    displayOrder: 3,
    showInNavbar: true,
    showInHomepage: true,
    showInCircularCarousel: true,
    showInSearch: true,
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_earrings_o0cb8h.jpg'
  },
  {
    name: 'Macramé Collection',
    slug: 'macrame-collection',
    displayOrder: 4,
    showInNavbar: true,
    showInHomepage: true,
    showInCircularCarousel: true,
    showInSearch: true,
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527415/macrame_bags_waokfv.jpg'
  },
  {
    name: 'Candle Studio',
    slug: 'candle-studio',
    displayOrder: 5,
    showInNavbar: true,
    showInHomepage: true,
    showInCircularCarousel: true,
    showInSearch: true,
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/handmade_candles_rwjvlj.jpg'
  },
  {
    name: 'Wedding Favors',
    slug: 'wedding-favors',
    displayOrder: 6,
    showInNavbar: true,
    showInHomepage: true,
    showInCircularCarousel: true,
    showInSearch: true,
    image: 'https://res.cloudinary.com/gc1qeznc/image/upload/v1784527414/wedding_giveaways_aabxvh.jpg'
  }
];

const migrateCategories = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB.');

    console.log('Starting category migration...');
    
    for (const cat of finalCategories) {
      // Upsert based on slug to be strictly idempotent
      const updatedCat = await Category.findOneAndUpdate(
        { slug: cat.slug },
        { $set: cat },
        { new: true, upsert: true }
      );
      console.log(`Migrated category: ${updatedCat.name} (${updatedCat.slug})`);
    }

    // Optional: Mark others as inactive if they are not in the final list
    const finalSlugs = finalCategories.map(c => c.slug);
    const result = await Category.updateMany(
      { slug: { $nin: finalSlugs } },
      { $set: { isActive: false, showInNavbar: false, showInHomepage: false, showInCircularCarousel: false, showInSearch: false } }
    );
    console.log(`Deactivated ${result.modifiedCount} old categories not in the finalized list.`);

    console.log('Migration completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
};

migrateCategories();
