import User from '../models/User.js';
import Car from '../models/Car.js';
import Booking from '../models/Booking.js';

// Get Global Statistics
export const getGlobalStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments({ role: 'user' });
        const totalOwners = await User.countDocuments({ role: 'owner' });
        const totalCars = await Car.countDocuments();
        const totalBookings = await Booking.countDocuments();
        const totalRevenue = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: "$price" } } }
        ]);

        res.json({
            success: true,
            stats: {
                totalUsers,
                totalOwners,
                totalCars,
                totalBookings,
                totalRevenue: totalRevenue[0]?.total || 0
            }
        });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Manage All Users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({ role: { $ne: 'super-admin' } }).select('-password');
        res.json({ success: true, users });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Manage All Cars
export const getAllCars = async (req, res) => {
    try {
        const cars = await Car.find().populate('owner', 'name email');
        res.json({ success: true, cars });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Manage All Bookings
export const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate('user', 'name email')
            .populate('car', 'brand model image')
            .populate('owner', 'name email');
        res.json({ success: true, bookings });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete any User (cascade)
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.body;
        // Cascade: also remove cars and bookings
        await Car.deleteMany({ owner: userId });
        await Booking.deleteMany({ $or: [{ user: userId }, { owner: userId }] });
        await User.findByIdAndDelete(userId);
        res.json({ success: true, message: "User and all associated data removed" });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Delete any Car (super-admin)
export const deleteCarAdmin = async (req, res) => {
    try {
        const { carId } = req.body;
        const car = await Car.findById(carId);
        if (!car) return res.json({ success: false, message: 'Car not found' });
        await Booking.deleteMany({ car: carId });
        await Car.findByIdAndDelete(carId);
        res.json({ success: true, message: 'Car permanently removed from platform' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
