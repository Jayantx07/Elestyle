require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/elestyle',
  NODE_ENV: process.env.NODE_ENV || 'development'
};

module.exports = env;
