import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: 'car-rental'
        });
        console.log("📡 Connected to MongoDB...");

        const adminEmail = 'superadmin@carrental.com';
        const adminPassword = 'admin1234';

        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log("ℹ️ Super Admin already exists. Updating credentials...");
        }

        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        await User.findOneAndUpdate(
            { email: adminEmail },
            {
                name: 'System Controller',
                email: adminEmail,
                password: hashedPassword,
                role: 'super-admin',
                image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=300'
            },
            { upsert: true, new: true }
        );

        console.log("-----------------------------------------");
        console.log("🚀 SUCCESS: Super Admin Account Ready!");
        console.log(`📧 Email: ${adminEmail}`);
        console.log(`🔑 Password: ${adminPassword}`);
        console.log("-----------------------------------------");

        process.exit();
    } catch (error) {
        console.error("❌ Error seeding admin:", error.message);
        process.exit(1);
    }
};

seedAdmin();
