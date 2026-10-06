"""
main.py
FastAPI application for AI-Based Queue Waiting-Time Prediction and Service Optimization System.
Provides REST APIs for:
- Real-time prediction (POST /predict)
- Future 9 AM - 5 PM queue forecasting (POST /forecast)
- Real ML evaluation metrics (GET /metrics)
- Admin analytics and staff counter planning (GET /dashboard)
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List
import uvicorn
import os

from model import predictor
from database import init_db, save_prediction_record, get_dashboard_data

app = FastAPI(
    title="AI Queue Waiting-Time Prediction & Service Optimization API",
    description="Backend service predicting queue delays, forecasting time slots, and optimizing staff allocation using Machine Learning.",
    version="1.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup event to ensure database is created and seeded
@app.on_event("startup")
def startup_event():
    init_db()
    print("Application started. Database initialized.")

# --- Pydantic Request & Response Models ---

class PredictRequest(BaseModel):
    service_type: str = Field(..., example="Cash Transaction")
    people_waiting: int = Field(..., ge=0, example=15)
    active_counters: int = Field(..., ge=1, le=20, example=3)
    avg_service_time: float = Field(..., gt=0.0, example=5.5)
    hour_of_day: int = Field(..., ge=0, le=23, example=11)
    day_of_week: str = Field(..., example="Monday")
    is_holiday: int = Field(default=0, ge=0, le=1, example=0)

class ForecastRequest(BaseModel):
    service_type: str = Field(default="Cash Transaction", example="Cash Transaction")
    avg_service_time: float = Field(default=5.5, gt=0.0, example=5.5)
    day_of_week: str = Field(default="Monday", example="Monday")
    is_holiday: int = Field(default=0, ge=0, le=1, example=0)
    active_counters: int = Field(default=3, ge=1, example=3)
    current_queue: int = Field(default=15, ge=0, example=15)

# --- API Endpoints ---

@app.get("/")
def root():
    return {
        "project": "AI-Based Queue Waiting-Time Prediction and Service Optimization System",
        "status": "Online",
        "docs": "/docs",
        "endpoints": ["/predict", "/forecast", "/metrics", "/dashboard"]
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "model_loaded": predictor.model is not None}

@app.post("/predict")
def predict_waiting_time(payload: PredictRequest):
    """
    Predict waiting time and congestion level for the current queue state.
    Also logs the query to the SQLite database and generates staff counter recommendations.
    """
    try:
        # Run ML inference
        result = predictor.predict(
            service_type=payload.service_type,
            people_waiting=payload.people_waiting,
            active_counters=payload.active_counters,
            avg_service_time=payload.avg_service_time,
            hour_of_day=payload.hour_of_day,
            day_of_week=payload.day_of_week,
            is_holiday=payload.is_holiday
        )

        # Log prediction to SQLite
        record_id = save_prediction_record(
            service_type=payload.service_type,
            people_waiting=payload.people_waiting,
            active_counters=payload.active_counters,
            avg_service_time=payload.avg_service_time,
            hour_of_day=payload.hour_of_day,
            day_of_week=payload.day_of_week,
            is_holiday=payload.is_holiday,
            predicted_wait_time=result["predicted_waiting_time"],
            congestion_level=result["congestion"]["level"]
        )
        result["log_id"] = record_id

        # Also obtain best future visiting slot recommendation for user convenience
        forecast_res = predictor.forecast_day(
            service_type=payload.service_type,
            avg_service_time=payload.avg_service_time,
            day_of_week=payload.day_of_week,
            is_holiday=payload.is_holiday,
            active_counters=payload.active_counters,
            current_queue=payload.people_waiting
        )
        result["recommended_future_slot"] = forecast_res["best_slot"]

        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

@app.post("/forecast")
def forecast_future_slots(payload: ForecastRequest):
    """
    Generate waiting-time predictions across business hours (9 AM - 5 PM).
    Highlights the optimal time slot with minimum expected waiting delay.
    """
    try:
        forecast_data = predictor.forecast_day(
            service_type=payload.service_type,
            avg_service_time=payload.avg_service_time,
            day_of_week=payload.day_of_week,
            is_holiday=payload.is_holiday,
            active_counters=payload.active_counters,
            current_queue=payload.current_queue
        )
        return forecast_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Forecasting error: {str(e)}")

@app.get("/metrics")
def get_model_metrics():
    """
    Return authentic evaluation metrics (MAE, RMSE, R²) calculated from the real dataset.
    """
    if not predictor.metrics:
        raise HTTPException(status_code=503, detail="Metrics not available yet.")
    return predictor.metrics

@app.get("/dashboard")
def get_dashboard_analytics():
    """
    Return admin dashboard statistics: queue volume, historical trends,
    peak rush hours, congestion breakdown, and dynamic staff/counter planning recommendations.
    """
    try:
        dash_data = get_dashboard_data()

        # Dynamic Staff/Counter Planning Suggestion for Admin
        # Evaluate current general queue conditions
        avg_wait = dash_data["avg_wait_minutes"]
        if avg_wait > 30.0:
            staff_advice = {
                "status": "Understaffed",
                "badge_color": "#ef4444",
                "action": "Urgent Counter Expansion",
                "details": f"Average wait time ({avg_wait}m) exceeds acceptable SLA (20m). Recommend increasing active service counters by +1 to +2 desks immediately during peak periods."
            }
        elif avg_wait > 18.0:
            staff_advice = {
                "status": "Moderate Load",
                "badge_color": "#f59e0b",
                "action": "Maintain / Prepare Relief Counter",
                "details": f"Average wait time ({avg_wait}m) is approaching peak boundaries. Keep floating staff on alert to open an auxiliary counter if queue lengths exceed 18 people."
            }
        else:
            staff_advice = {
                "status": "Efficient Flow",
                "badge_color": "#10b981",
                "action": "Optimal Allocation",
                "details": f"Average wait time ({avg_wait}m) is well within target comfort thresholds. Current counter distribution is operating with high efficiency."
            }

        dash_data["staff_planning_suggestion"] = staff_advice
        dash_data["model_summary"] = {
            "algorithm": predictor.metrics.get("model_type", "Random Forest Regressor"),
            "mae": predictor.metrics.get("mae", 0.0),
            "rmse": predictor.metrics.get("rmse", 0.0),
            "r2_score": predictor.metrics.get("r2_score", 0.0)
        } if predictor.metrics else None

        return dash_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dashboard error: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)
