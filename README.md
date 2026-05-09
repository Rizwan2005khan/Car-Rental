# 🚗 Premium Car Rental Platform (MERN + AI)

An enterprise-grade, multi-tier car rental platform built with the MERN stack and integrated with an AI-driven machine learning service. This platform features a premium glassmorphic UI, real-time interactive mapping, and a robust role-based access control system.

## 🚀 Key Features

### 👤 Multi-Role Management System
*   **User**: Browse cars, view AI-recommended pricing, and book vehicles.
*   **Owner**: Manage their own fleet, view earnings, and access the AI Price Advisor to optimize rental rates.
*   **Super Admin**: Global oversight of all users, vehicles, and bookings. Manage platform-wide fleet health and user verification.

### 🤖 AI-Powered Intelligence (FastAPI)
*   **Dynamic Pricing Advisor**: Predicts optimal rental rates based on demand levels (Normal, Weekend, Holiday).
*   **Sentiment Analysis**: "Vibe Check" on car reviews using NLP to gauge customer satisfaction.
*   **Recommendation Engine**: Similarity-based suggestions to help users find the perfect car.

### 🗺️ Interactive Map Discovery
*   **Region-Specific Search**: Fully integrated **Leaflet.js** map centered on the **Peshawar region**.
*   **Smart Pins**: Color-coded car markers by category (Luxury, SUV, Sedan, etc.) with interactive popup cards.
*   **Auto-Bounds**: Map automatically adjusts to show all available cars in the filtered results.

### 🪪 Phase 4: KYC & Driver Verification
*   **Document Upload**: Secure upload for CNIC and Driving License (Front/Back) using ImageKit.
*   **Verification Workflow**: Admin review system (Approve/Reject) with rejection reasons.
*   **Booking Gate**: Automated check to ensure only verified drivers can book vehicles.

### 💎 Premium UI/UX
*   **Modern Aesthetics**: Glassmorphism, sleek dark modes, and high-fidelity animations using `motion/react`.
*   **Responsive Design**: Fully optimized for all screen sizes from mobile to ultra-wide desktops.
*   **Localized**: Fully localized for Pakistan with **Rs.** currency and Pakistani city listings.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS, Motion/React, Leaflet, Chart.js |
| **Backend** | Node.js, Express, MongoDB (Mongoose) |
| **AI Service** | Python, FastAPI, Scikit-learn, Pandas, Uvicorn |
| **Storage** | ImageKit.io (Media Management) |

---

## ⚙️ Setup & Installation

### 1. Environment Configuration
Create a `.env` file in the **server** directory:
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
IMAGEKIT_PUBLIC_KEY=your_key
IMAGEKIT_PRIVATE_KEY=your_key
IMAGEKIT_URL_ENDPOINT=your_endpoint
ML_SERVICE_URL=http://localhost:8000
```

Create a `.env` file in the **client** directory:
```env
VITE_CURRENCY=Rs.
VITE_BASE_URL=http://localhost:3000
```

### 2. Running the Project

#### Start the ML Service (FastAPI)
```bash
cd ml-service
python -m uvicorn app.main:app --reload --port 8000
```

#### Start the Backend (Node.js)
```bash
cd server
npm run server
```

#### Start the Frontend (Vite)
```bash
cd client
npm run dev
```

---

## 📂 Project Structure

```text
├── client/              # React frontend (Vite)
│   ├── src/
│   │   ├── components/  # Reusable UI & Map components
│   │   ├── context/     # Global state (AppContext)
│   │   └── pages/       # Dashboard, KYC, Cars, etc.
├── server/              # Express backend
│   ├── configs/         # DB & ImageKit config
│   ├── controllers/     # Business logic (KYC, Booking, AI)
│   ├── models/          # Mongoose Schemas (User, Car, Booking)
│   └── routes/          # API Endpoints
└── ml-service/          # Python AI microservice
    └── app/
        └── main.py      # Pricing & Sentiment logic
```

## 🔐 Administrative Access
A Super Admin account can be generated using the `server/seed.js` script.
*   **Login**: `superadmin@carrental.com`
*   **Password**: `admin1234`
