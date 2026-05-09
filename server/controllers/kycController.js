import User from '../models/User.js';
import imagekit from '../configs/imagekit.js';
import fs from 'fs';

// Submit KYC documents (user)
export const submitKYC = async (req, res) => {
    try {
        const { _id } = req.user;
        const { cnic, licenseNumber } = req.body;

        if (!cnic || !licenseNumber) {
            return res.json({ success: false, message: "CNIC and License Number are required" });
        }

        // Validate CNIC format (13 digits, with or without dashes)
        const cleanCnic = cnic.replace(/-/g, '');
        if (cleanCnic.length !== 13 || isNaN(cleanCnic)) {
            return res.json({ success: false, message: "Invalid CNIC format. Must be 13 digits (e.g., 12345-1234567-1)" });
        }

        // Check if images were uploaded
        if (!req.files || !req.files.licenseFront || !req.files.licenseBack) {
            return res.json({ success: false, message: "Both front and back license images are required" });
        }

        const user = await User.findById(_id);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        // Prevent re-submission if already verified
        if (user.kyc?.status === 'verified') {
            return res.json({ success: false, message: "Your KYC is already verified" });
        }

        // Upload front image to ImageKit
        const frontFile = req.files.licenseFront[0];
        const frontResponse = await imagekit.upload({
            file: fs.readFileSync(frontFile.path),
            fileName: `kyc_front_${_id}_${Date.now()}`,
            folder: '/kyc-documents'
        });
        const frontUrl = imagekit.url({
            src: frontResponse.url,
            transformation: [{ width: "800", quality: "80" }]
        });

        // Upload back image to ImageKit
        const backFile = req.files.licenseBack[0];
        const backResponse = await imagekit.upload({
            file: fs.readFileSync(backFile.path),
            fileName: `kyc_back_${_id}_${Date.now()}`,
            folder: '/kyc-documents'
        });
        const backUrl = imagekit.url({
            src: backResponse.url,
            transformation: [{ width: "800", quality: "80" }]
        });

        // Clean up temp files
        fs.unlinkSync(frontFile.path);
        fs.unlinkSync(backFile.path);

        // Update user KYC
        user.kyc = {
            cnic: cleanCnic,
            licenseNumber: licenseNumber.trim(),
            licenseFrontImage: frontUrl,
            licenseBackImage: backUrl,
            status: 'pending',
            rejectionReason: '',
            submittedAt: new Date()
        };
        await user.save();

        res.json({ success: true, message: "KYC documents submitted successfully. Verification usually takes 24-48 hours." });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get KYC status (user)
export const getKYCStatus = async (req, res) => {
    try {
        const { _id } = req.user;
        const user = await User.findById(_id).select('kyc');

        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        res.json({ success: true, kyc: user.kyc || { status: 'none' } });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all pending KYC submissions (admin)
export const getPendingKYC = async (req, res) => {
    try {
        const users = await User.find({ 'kyc.status': 'pending' })
            .select('name email image kyc createdAt')
            .sort({ 'kyc.submittedAt': -1 });

        res.json({ success: true, submissions: users });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Get all KYC submissions (admin) — all statuses
export const getAllKYC = async (req, res) => {
    try {
        const users = await User.find({ 'kyc.status': { $ne: 'none' } })
            .select('name email image kyc createdAt')
            .sort({ 'kyc.submittedAt': -1 });

        res.json({ success: true, submissions: users });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};

// Approve or Reject KYC (admin)
export const reviewKYC = async (req, res) => {
    try {
        const { userId, action, rejectionReason } = req.body;
        const adminId = req.user._id;

        if (!userId || !action || !['approve', 'reject'].includes(action)) {
            return res.json({ success: false, message: "Invalid request" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        if (user.kyc?.status !== 'pending') {
            return res.json({ success: false, message: "This KYC submission is not pending review" });
        }

        user.kyc.status = action === 'approve' ? 'verified' : 'rejected';
        user.kyc.reviewedAt = new Date();
        user.kyc.reviewedBy = adminId;

        if (action === 'reject') {
            user.kyc.rejectionReason = rejectionReason || 'Documents did not meet verification requirements';
        }

        await user.save();

        res.json({
            success: true,
            message: action === 'approve'
                ? `${user.name}'s identity has been verified`
                : `${user.name}'s KYC has been rejected`
        });
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
};
