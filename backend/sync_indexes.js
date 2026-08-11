const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Review = require('./src/models/Review');

const sync = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected');
  await Review.syncIndexes();
  console.log('Indexes synced');
  process.exit(0);
};

sync();
