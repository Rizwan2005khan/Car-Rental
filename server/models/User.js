import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type: String, enum: ["owner", "user", "super-admin"], default: 'user'},
    image: {type: String, default: ''},

    // KYC / Driver Verification
    kyc: {
        cnic: {type: String, default: ''},
        licenseNumber: {type: String, default: ''},
        licenseFrontImage: {type: String, default: ''},
        licenseBackImage: {type: String, default: ''},
        status: {type: String, enum: ['none', 'pending', 'verified', 'rejected'], default: 'none'},
        rejectionReason: {type: String, default: ''},
        submittedAt: {type: Date},
        reviewedAt: {type: Date},
        reviewedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}
    }
}, {timestamps: true})

const User = mongoose.model('User', userSchema)
export default User;
