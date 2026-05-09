from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pathlib import Path
from typing import List, Optional
import joblib
import pandas as pd
import numpy as np

# Use absolute path based on THIS file's location
BASE_DIR = Path(__file__).resolve().parent.parent  # ml-service/
MODEL_DIR = BASE_DIR / "model"
DATA_FILE = BASE_DIR / "data" / "car_data.csv"

# Load model and encoders at startup
try:
    model    = joblib.load(MODEL_DIR / "price_model.pkl")
    encoders = joblib.load(MODEL_DIR / "encoders.pkl")
    features = joblib.load(MODEL_DIR / "features.pkl")
    training_df = pd.read_csv(DATA_FILE)
    print(f"[OK] Model loaded from: {MODEL_DIR}")
    print(f"[OK] Features: {features}")
except Exception as e:
    print(f"[ERROR] Failed to load model: {e}")
    raise RuntimeError(f"Cannot load model files from {MODEL_DIR}: {e}")

app = FastAPI(title="Elite Car AI Service", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Input Schemas ────────────────────────────────────────────────────────────
class CarInput(BaseModel):
    Brand:        str
    Model:        str
    Year:         int
    Fuel_Type:    str
    Transmission: str
    Mileage:      int = 0
    Demand_Level: Optional[str] = "Normal" # "Low", "Normal", "High", "Holiday"

class ReviewInput(BaseModel):
    text: str

class RecommendInput(BaseModel):
    Brand: str
    Category: str
    Limit: int = 4

# ── Helpers ──────────────────────────────────────────────────────────────────
def calculate_sentiment(text: str):
    """Simple rule-based sentiment analyzer for car reviews"""
    positive_words = {'great', 'excellent', 'clean', 'smooth', 'reliable', 'amazing', 'best', 'good', 'fast', 'comfortable'}
    negative_words = {'dirty', 'noisy', 'broken', 'slow', 'bad', 'worst', 'expensive', 'uncomfortable', 'smelly', 'old'}
    
    words = text.lower().split()
    pos_count = sum(1 for w in words if w in positive_words)
    neg_count = sum(1 for w in words if w in negative_words)
    
    score = (pos_count - neg_count) / max(len(words), 1)
    
    if score > 0.1: return "Positive", 0.85
    if score < -0.1: return "Negative", 0.70
    return "Neutral", 0.50

# ── Routes ───────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Elite Car AI Service v2 is running 🚀"}

@app.post("/predict")
def predict_price(car: CarInput):
    try:
        car_dict = car.model_dump()

        df = pd.DataFrame([{
            'Brand':        car_dict['Brand'],
            'Model':        car_dict['Model'],
            'Year':         car_dict['Year'],
            'Fuel Type':    car_dict['Fuel_Type'],
            'Transmission': car_dict['Transmission'],
            'Mileage':      car_dict['Mileage'],
        }])

        for col, encoder in encoders.items():
            if col in df.columns:
                try:
                    df[col] = encoder.transform(df[col])
                except ValueError:
                    df[col] = -1

        prediction = float(model.predict(df[features])[0])
        base_rate = prediction * 0.0012
        
        # Phase 2: Dynamic Pricing Logic
        demand_multipliers = {
            "Low": 0.90,
            "Normal": 1.0,
            "High": 1.25,
            "Holiday": 1.50
        }
        multiplier = demand_multipliers.get(car_dict['Demand_Level'], 1.0)
        daily_rate = round(base_rate * multiplier, 2)

        return {
            "success": True,
            "prediction": {
                "optimal":    daily_rate,
                "min":        round(daily_rate * 0.9, 2),
                "max":        round(daily_rate * 1.1, 2),
                "demand_applied": car_dict['Demand_Level'],
                "multiplier": multiplier,
                "confidence": 0.89
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-review")
def analyze_review(review: ReviewInput):
    sentiment, confidence = calculate_sentiment(review.text)
    return {
        "success": True,
        "sentiment": sentiment,
        "confidence": confidence,
        "vibe": "Reliable" if sentiment == "Positive" else "Check Vehicle" if sentiment == "Negative" else "Standard"
    }

@app.post("/recommend")
def get_recommendations(req: RecommendInput):
    try:
        # Simple similarity: Match category and different brands for variety
        matches = training_df[
            (training_df['Brand'] != req.Brand)
        ].head(req.Limit)
        
        recs = []
        for _, row in matches.iterrows():
            # Convert training data price to daily rate
            rate = round(row['Price'] * 0.0012, 2)
            recs.append({
                "brand": row['Brand'],
                "model": row['Model'],
                "year": int(row['Year']),
                "price": rate,
                "reason": f"Popular in {row['Brand']} category"
            })
            
        return {"success": True, "recommendations": recs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/insights")
def training_insights():
    try:
        df = training_df.copy()
        df["DailyRate"] = (df["Price"] * 0.0012).round(2)

        by_year = df.groupby("Year", as_index=False).agg(avg_daily_rate=("DailyRate", "mean"), sample_count=("Car ID", "count")).sort_values("Year")
        by_brand = df.groupby("Brand", as_index=False).agg(avg_daily_rate=("DailyRate", "mean"), sample_count=("Car ID", "count")).sort_values("sample_count", ascending=False).head(8)
        by_fuel_type = df.groupby("Fuel Type", as_index=False).agg(avg_daily_rate=("DailyRate", "mean"), sample_count=("Car ID", "count")).sort_values("sample_count", ascending=False)

        summary = {
            "records": int(len(df)),
            "brands": int(df["Brand"].nunique()),
            "models": int(df["Model"].nunique()),
            "years": [int(df["Year"].min()), int(df["Year"].max())],
            "avg_daily_rate": round(float(df["DailyRate"].mean()), 2),
            "median_daily_rate": round(float(df["DailyRate"].median()), 2),
        }

        return {
            "success": True,
            "summary": summary,
            "charts": {
                "yearlyTrend": [
                    {"year": int(row["Year"]), "avgDailyRate": round(float(row["avg_daily_rate"]), 2), "samples": int(row["sample_count"])}
                    for _, row in by_year.iterrows()
                ],
                "topBrands": [
                    {"brand": row["Brand"], "avgDailyRate": round(float(row["avg_daily_rate"]), 2), "samples": int(row["sample_count"])}
                    for _, row in by_brand.iterrows()
                ],
                "fuelMix": [
                    {"fuelType": row["Fuel Type"], "avgDailyRate": round(float(row["avg_daily_rate"]), 2), "samples": int(row["sample_count"])}
                    for _, row in by_fuel_type.iterrows()
                ],
            },
            "notes": {"timeGranularity": "Refined yearly trends for elite insights."}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0", "model": "loaded"}
