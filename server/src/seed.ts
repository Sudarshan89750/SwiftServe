import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.model';
import Service from './models/Service.model';
import Provider from './models/Provider.model';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/swiftserve';

// Sample services data
const services = [
  {
    name: 'Plumbing',
    category: 'Home Repair',
    description: 'Professional plumbing services including repairs, installations, and maintenance.',
    basePrice: 50,
    image: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGx1bWJpbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    rating: 4.5,
    providersCount: 0
  },
  {
    name: 'Electrical',
    category: 'Home Repair',
    description: 'Electrical services for residential and commercial properties.',
    basePrice: 60,
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWxlY3RyaWNpYW58ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    rating: 4.7,
    providersCount: 0
  },
  {
    name: 'Cleaning',
    category: 'Home Maintenance',
    description: 'Professional cleaning services for homes and offices.',
    basePrice: 40,
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Y2xlYW5pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60',
    rating: 4.3,
    providersCount: 0
  },
  {
    name: 'Gardening',
    category: 'Outdoor',
    description: 'Gardening and landscaping services for your outdoor spaces.',
    basePrice: 45,
    image: 'https://images.unsplash.com/photo-1599629954294-14df9f8291b7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Z2FyZGVuaW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    rating: 4.6,
    providersCount: 0
  },
  {
    name: 'Painting',
    category: 'Home Improvement',
    description: 'Interior and exterior painting services for homes and businesses.',
    basePrice: 55,
    image: 'https://images.unsplash.com/photo-1562259929-b4e1fd3aef09?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cGFpbnRpbmclMjB3YWxsfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60',
    rating: 4.4,
    providersCount: 0
  }
];

// Sample users data
const users = [
  {
    name: 'Admin User',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin',
    phone: '123-456-7890',
    address: '123 Admin St, City, Country'
  },
  {
    name: 'Customer User',
    email: 'customer@example.com',
    password: 'password123',
    role: 'customer',
    phone: '123-456-7891',
    address: '456 Customer Ave, City, Country'
  },
  {
    name: 'Provider One',
    email: 'provider1@example.com',
    password: 'password123',
    role: 'provider',
    phone: '123-456-7892',
    address: '789 Provider Blvd, City, Country'
  },
  {
    name: 'Provider Two',
    email: 'provider2@example.com',
    password: 'password123',
    role: 'provider',
    phone: '123-456-7893',
    address: '101 Provider Lane, City, Country'
  }
];

// Sample provider data
const providerData = [
  {
    hourlyRate: 35,
    description: 'Experienced plumber with over 10 years in the industry.',
    coordinates: {
      type: 'Point',
      coordinates: [-73.9857, 40.7484] // New York City
    },
    isAvailable: true,
    services: [] // Will be populated with service IDs
  },
  {
    hourlyRate: 40,
    description: 'Professional electrician specializing in residential and commercial properties.',
    coordinates: {
      type: 'Point',
      coordinates: [-74.0060, 40.7128] // New York City (different location)
    },
    isAvailable: true,
    services: [] // Will be populated with service IDs
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Service.deleteMany({});
    await Provider.deleteMany({});
    console.log('Cleared existing data');

    // Seed services
    const createdServices = await Service.insertMany(services);
    console.log(`${createdServices.length} services created`);

    // Seed users
    const createdUsers = [];
    for (const user of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      const newUser = await User.create({
        ...user,
        password: hashedPassword
      });
      
      createdUsers.push(newUser);
    }
    console.log(`${createdUsers.length} users created`);

    // Seed providers
    const providerUsers = createdUsers.filter(user => user.role === 'provider');
    
    for (let i = 0; i < providerUsers.length; i++) {
      // Assign services to providers
      const serviceIndices = i === 0 
        ? [0, 2, 4] // First provider gets Plumbing, Cleaning, Painting
        : [1, 3];   // Second provider gets Electrical, Gardening
      
      const providerServices = serviceIndices.map(index => createdServices[index]._id);
      
      // Create provider
      const provider = await Provider.create({
        ...providerData[i],
        userId: providerUsers[i]._id,
        services: providerServices
      });
      
      // Update service provider counts
      await Service.updateMany(
        { _id: { $in: providerServices } },
        { $inc: { providersCount: 1 } }
      );
      
      console.log(`Provider created for ${providerUsers[i].name}`);
    }

    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

// Run the seed function
seedDatabase();