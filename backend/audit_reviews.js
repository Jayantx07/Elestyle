const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './.env' });

const Review = require('./src/models/Review');

const auditReviews = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');

    const duplicates = await Review.aggregate([
      {
        $group: {
          _id: { user: '$user', product: '$product' },
          uniqueIds: { $addToSet: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('No duplicate reviews found.');
    } else {
      console.log(`Found ${duplicates.length} combinations with duplicate reviews.`);
      let totalDeleted = 0;
      for (const dup of duplicates) {
        // Keep the most recent one (let's assume the last ID in the set is the oldest, but just to be safe, sort them)
        const reviews = await Review.find({ _id: { $in: dup.uniqueIds } }).sort({ createdAt: -1 });
        const keepId = reviews[0]._id;
        
        for (let i = 1; i < reviews.length; i++) {
          await Review.findByIdAndDelete(reviews[i]._id);
          totalDeleted++;
        }
      }
      console.log(`Successfully deleted ${totalDeleted} duplicate reviews.`);
    }

    process.exit(0);
  } catch (error) {
    console.error('Audit failed:', error);
    process.exit(1);
  }
};

auditReviews();
