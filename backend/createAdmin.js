require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const authService = require('./src/services/authService');
const mongoose = require('mongoose');

const createAdmin = async () => {
  await connectDB();
  
  try {
    const adminEmail = 'admin@elestyle.com';
    const adminPassword = 'AdminPassword123!';
    
    let adminUser = await User.findOne({ email: adminEmail });
    
    if (adminUser) {
      adminUser.role = 'admin';
      adminUser.isEmailVerified = true;
      // Also update the password just to be sure we know what it is
      adminUser.password = await authService.hashPassword(adminPassword);
      await adminUser.save();
      console.log(`\n--- Admin User Updated ---`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`--------------------------\n`);
    } else {
      const hashedPassword = await authService.hashPassword(adminPassword);
      adminUser = await User.create({
        name: 'Super Admin',
        email: adminEmail,
        password: hashedPassword,
        role: 'admin',
        isEmailVerified: true
      });
      console.log(`\n--- New Admin User Created ---`);
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: ${adminPassword}`);
      console.log(`------------------------------\n`);
    }
  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    mongoose.connection.close();
  }
};

createAdmin();
