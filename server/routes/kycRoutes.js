import express from 'express';
import { protect, adminProtect } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import {
    submitKYC,
    getKYCStatus,
    getPendingKYC,
    getAllKYC,
    reviewKYC
} from '../controllers/kycController.js';

const kycRouter = express.Router();

// User routes
kycRouter.post('/submit', protect, upload.fields([
    { name: 'licenseFront', maxCount: 1 },
    { name: 'licenseBack', maxCount: 1 }
]), submitKYC);

kycRouter.get('/status', protect, getKYCStatus);

// Admin routes
kycRouter.get('/pending', protect, adminProtect, getPendingKYC);
kycRouter.get('/all', protect, adminProtect, getAllKYC);
kycRouter.post('/review', protect, adminProtect, reviewKYC);

export default kycRouter;
