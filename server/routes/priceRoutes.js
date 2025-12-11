import express from "express";
import { getLivePrices, getHistory, getPrediction } from "../controllers/priceController.js";

const priceRouter = express.Router();

priceRouter.get("/live", getLivePrices);          // ?city=  optional
priceRouter.get("/history", getHistory);
priceRouter.get("/predict", getPrediction);       // ?city=&category=

export default priceRouter;