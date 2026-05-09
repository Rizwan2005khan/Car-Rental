import express from 'express'
import 'dotenv/config'
import cors from 'cors';
import connectDB from './configs/db.js';
import userRouter from './routes/userRoutes.js';
import ownerRouter from './routes/ownerRoutes.js';
import bookingRouter from './routes/bookingRoutes.js';
import aiRouter from './routes/aiRoutes.js';
import adminRouter from './routes/superAdminRoutes.js';
import kycRouter from './routes/kycRoutes.js';

// Initialize Express App
const app = express()

try {
  await connectDB()
} catch (error) {
  console.error("Failed to connect to MongoDB:", error.message)
  process.exit(1)
}

// Middleware
app.use(cors())
app.use(express.json())

app.get('/', (req, res) => res.send("Server is running"))
app.use('/api/user', userRouter)
app.use('/api/owner', ownerRouter)
app.use('/api/bookings', bookingRouter)
app.use('/api/ai', aiRouter)
app.use('/api/admin', adminRouter)
app.use('/api/kyc', kycRouter)

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
