require('dotenv').config({ path: 'backend/.env' });
const mongoose = require('mongoose');
const env = require('../src/config/env');

async function checkTopology() {
  try {
    await mongoose.connect(env.MONGO_URI);
    const adminDb = mongoose.connection.db.admin();
    const info = await adminDb.command({ replSetGetStatus: 1 }).catch(() => null);
    
    if (info) {
      console.log('REPLICA_SET_ACTIVE');
    } else {
      console.log('STANDALONE');
    }
    process.exit(0);
  } catch (err) {
    console.error('ERROR', err.message);
    process.exit(1);
  }
}
checkTopology();
