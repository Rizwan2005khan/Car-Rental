import express from 'express';
import { adminProtect, protect } from '../middleware/auth.js';
import { 
    deleteUser, 
    deleteCarAdmin,
    getAllBookings, 
    getAllCars, 
    getAllUsers, 
    getGlobalStats 
} from '../controllers/superAdminController.js';

const adminRouter = express.Router();

// All routes here require super-admin role
adminRouter.use(protect);
adminRouter.use(adminProtect);

adminRouter.get('/stats', getGlobalStats);
adminRouter.get('/users', getAllUsers);
adminRouter.get('/cars', getAllCars);
adminRouter.get('/bookings', getAllBookings);
adminRouter.post('/delete-user', deleteUser);
adminRouter.post('/delete-car', deleteCarAdmin);

export default adminRouter;
