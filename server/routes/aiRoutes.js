import express from "express";
import { predictPrice, checkMLHealth, getTrainingInsights, analyzeReview, getRecommendations } from "../controllers/aiController.js";

const aiRouter = express.Router();

aiRouter.get("/health", checkMLHealth);
aiRouter.get("/insights", getTrainingInsights);
aiRouter.post("/predict-price", predictPrice);
aiRouter.post("/analyze-review", analyzeReview);
aiRouter.post("/recommend", getRecommendations);

export default aiRouter;
