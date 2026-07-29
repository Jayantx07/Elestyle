require('dotenv').config();

const env = {
  PORT: process.env.PORT || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/elestyle',
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM || 'ElleStyle <support@ellestyle.in>',
  APP_URL: process.env.APP_URL || 'http://localhost:5173',
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID
};

module.exports = env;
