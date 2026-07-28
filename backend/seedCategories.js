const mongoose = require('mongoose');
const Category = require('./src/models/Category');
require('dotenv').config();

const categories = [
  { name: 'Macrame Bags', slug: 'macrame-bags', description: 'Handcrafted macrame bags' },
  { name: 'Handmade Soaps', slug: 'handmade-soaps', description: 'Organic handmade soaps' },
  { name: 'Handmade Earrings', slug: 'handmade-earrings', description: 'Handmade delicate earrings' },
  { name: 'Home Furnishing', slug: 'home-furnishing', description: 'Curated collection of soft furnishings' },
  { name: 'Rajasthani Vibes', slug: 'rajasthani-vibes', description: 'Bags and accessories steeped in rich textile traditions' },
  { name: 'Wedding Giveaways', slug: 'wedding-giveaways', description: 'Thoughtful, beautifully packaged gifts' },
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected for Seeding');

    for (const cat of categories) {
      await Category.findOneAndUpdate(
        { slug: cat.slug },
        cat,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }
    
    console.log('Categories seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
