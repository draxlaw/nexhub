import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import User from '../src/models/User.model';
import Category from '../src/models/Category.model';

async function seedAdmin() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');

    // Create admin user if it doesn't exist
    const adminEmail = 'walyise@example.com';
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const admin = await User.create({
        email: adminEmail,
        password: 'admin123456',
        name: 'Admin User',
        roles: ['admin'],
        isEmailVerified: true,
        emailVerifiedAt: new Date(),
      });
      console.log('✓ Admin user created:', admin.email);
    } else {
      console.log('✓ Admin user already exists:', adminEmail);
    }

    // Create sample categories
    const categories = [
      { name: 'Electronics', description: 'Electronic devices and gadgets' },
      { name: 'Fashion', description: 'Clothing and accessories' },
      { name: 'Home & Garden', description: 'Home and garden products' },
      { name: 'Sports & Outdoors', description: 'Sports and outdoor equipment' },
      { name: 'Books & Media', description: 'Books, movies, and music' },
    ];

    for (const catData of categories) {
      const exists = await Category.findOne({ name: catData.name });
      if (!exists) {
        await Category.create({
          name: catData.name,
          description: catData.description,
          slug: catData.name.toLowerCase().replace(/\s+/g, '-'),
        });
        console.log('✓ Category created:', catData.name);
      } else {
        console.log('✓ Category exists:', catData.name);
      }
    }

    console.log('\n✓ Admin seeding complete!');
    console.log('\nTest credentials:');
    console.log('Email: walyise@example.com');
    console.log('Password: admin123456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seedAdmin();
