import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const normalizeFuelType = (fuelType = "") => {
    const value = fuelType.trim().toLowerCase();
    if (value === "gas") return "Petrol";
    return fuelType;
};

const normalizeTransmission = (transmission = "") => {
    const value = transmission.trim().toLowerCase();
    if (value === "semi-automatic") return "Automatic";
    return transmission;
};

// POST /api/ai/predict-price
export const predictPrice = async (req, res) => {
    try {
        const { brand, model, year, fuel_type, transmission, mileage, demand_level } = req.body;
        
        const normalizedFuelType = normalizeFuelType(fuel_type);
        const normalizedTransmission = normalizeTransmission(transmission);

        if (!brand || !model || !year || !normalizedFuelType || !normalizedTransmission) {
            return res.json({
                success: false,
                message: "Missing required fields"
            });
        }

        const { data } = await axios.post(`${ML_SERVICE_URL}/predict`, {
            Brand:        brand,
            Model:        model,
            Year:         Number(year),
            Fuel_Type:    normalizedFuelType,
            Transmission: normalizedTransmission,
            Mileage:      Number(mileage) || 0,
            Demand_Level: demand_level || "Normal"
        }, { timeout: 10000 });

        return res.json(data);
    } catch (error) {
        console.error("[AI Controller] Prediction error:", error.message);
        return res.json({ success: false, message: "ML service unavailable" });
    }
};

// POST /api/ai/analyze-review
export const analyzeReview = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.json({ success: false, message: "Review text is required" });

        const { data } = await axios.post(`${ML_SERVICE_URL}/analyze-review`, { text }, { timeout: 5000 });
        return res.json(data);
    } catch (error) {
        return res.json({ success: false, message: "Sentiment analysis failed" });
    }
};

// POST /api/ai/recommend
export const getRecommendations = async (req, res) => {
    try {
        const { brand, category, limit } = req.body;
        const { data } = await axios.post(`${ML_SERVICE_URL}/recommend`, {
            Brand: brand || "",
            Category: category || "",
            Limit: limit || 4
        }, { timeout: 5000 });
        
        return res.json(data);
    } catch (error) {
        return res.json({ success: false, message: "Recommendations unavailable" });
    }
};

// GET /api/ai/insights
export const getTrainingInsights = async (req, res) => {
    try {
        const { data } = await axios.get(`${ML_SERVICE_URL}/insights`, { timeout: 10000 });
        return res.json(data);
    } catch (error) {
        return res.json({ success: false, message: "Insights unavailable" });
    }
};

// GET /api/ai/health
export const checkMLHealth = async (req, res) => {
    try {
        const { data } = await axios.get(`${ML_SERVICE_URL}/health`, { timeout: 5000 });
        return res.json({ success: true, ...data });
    } catch (error) {
        return res.json({ success: false, message: "ML service is offline" });
    }
};
