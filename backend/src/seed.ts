import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';
import { UserRole } from './types';

// Load environment variables
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/sociotrack';

// Demo user data
const demoUsers = [
  {
    name: 'Admin User',
    email: 'admin@sociotrack.com',
    password: 'Admin@123',
    role: UserRole.ADMIN,
    phone: '+1234567890',
    isActive: true,
  },
  {
    name: 'John Doe',
    email: 'john@sociotrack.com',
    password: 'Resident@123',
    role: UserRole.RESIDENT,
    flatNumber: 'A-101',
    phone: '+1234567891',
    isActive: true,
  },
  {
    name: 'Jane Smith',
    email: 'jane@sociotrack.com',
    password: 'Resident@123',
    role: UserRole.RESIDENT,
    flatNumber: 'B-202',
    phone: '+1234567892',
    isActive: true,
  },
  {
    name: 'Mike Wilson',
    email: 'mike@sociotrack.com',
    password: 'Tech@123',
    role: UserRole.TECHNICIAN,
    phone: '+1234567893',
    isActive: true,
  },
  {
    name: 'Sarah Johnson',
    email: 'sarah@sociotrack.com',
    password: 'Tech@123',
    role: UserRole.TECHNICIAN,
    phone: '+1234567894',
    isActive: true,
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing users
    console.log('\n🗑️  Clearing existing users...');
    const deleteResult = await User.deleteMany({});
    console.log(`   Deleted ${deleteResult.deletedCount} existing users`);

    // Create demo users
    console.log('\n👥 Creating demo users...');
    const createdUsers = [];

    for (const userData of demoUsers) {
      try {
        const user = await User.create(userData);
        createdUsers.push(user);
        console.log(`   ✓ Created ${user.role}: ${user.name} (${user.email})`);
      } catch (error: any) {
        console.error(`   ✗ Failed to create user ${userData.email}:`, error.message);
      }
    }

    // Summary
    console.log('\n📊 Seed Summary:');
    console.log(`   Total users created: ${createdUsers.length}/${demoUsers.length}`);
    console.log(`   - Admins: ${createdUsers.filter(u => u.role === UserRole.ADMIN).length}`);
    console.log(`   - Residents: ${createdUsers.filter(u => u.role === UserRole.RESIDENT).length}`);
    console.log(`   - Technicians: ${createdUsers.filter(u => u.role === UserRole.TECHNICIAN).length}`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Account Credentials:');
    console.log('   ────────────────────────────────────────');
    console.log('   Admin:');
    console.log('     Email: admin@sociotrack.com');
    console.log('     Password: Admin@123');
    console.log('   ────────────────────────────────────────');
    console.log('   Resident:');
    console.log('     Email: john@sociotrack.com');
    console.log('     Password: Resident@123');
    console.log('     Flat: A-101');
    console.log('   ────────────────────────────────────────');
    console.log('   Technician:');
    console.log('     Email: mike@sociotrack.com');
    console.log('     Password: Tech@123');
    console.log('   ────────────────────────────────────────');

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run seed function
seedDatabase();