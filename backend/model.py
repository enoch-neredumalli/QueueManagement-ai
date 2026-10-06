"""
model.py
Inference engine and queue optimization logic.
Loads trained Random Forest model, runs real-time predictions, forecasts future time slots,
computes congestion levels, and generates counter/staffing recommendations.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "models", "queue_rf_model.joblib")
METRICS_PATH = os.path.join(BASE_DIR, "models", "model_metrics.json")
CSV_PATH = os.path.abspath(os.path.join(BASE_DIR, "..", "data", "queue_data.csv"))

class QueuePredictor:
    def __init__(self):
        self.model = None
        self.metrics = None
        self._ensure_model_loaded()

    def _ensure_model_loaded(self):
        if not os.path.exists(MODEL_PATH) or not os.path.exists(METRICS_PATH):
            print("Model or metrics not found on disk. Initiating training process...")
            from train_model import train_and_evaluate
            train_and_evaluate(CSV_PATH, MODEL_PATH, METRICS_PATH)
        
        self.model = joblib.load(MODEL_PATH)
        with open(METRICS_PATH, "r") as f:
            self.metrics = json.load(f)
        print("Model and metrics loaded successfully.")

    def classify_congestion(self, wait_minutes: float) -> dict:
        if wait_minutes < 10.0:
            return {
                "level": "Low",
                "color": "#10b981", # emerald green
                "badge": "Smooth Flow",
                "description": "Minimal queue delay. Service is operating swiftly."
            }
        elif wait_minutes < 25.0:
            return {
                "level": "Moderate",
                "color": "#f59e0b", # amber
                "badge": "Moderate Flow",
                "description": "Standard waiting line. Manageable counter throughput."
            }
        elif wait_minutes < 45.0:
            return {
                "level": "High",
                "color": "#f97316", # orange
                "badge": "High Congestion",
                "description": "Noticeable queue backlog. Expect noticeable waiting duration."
            }
        else:
            return {
                "level": "Critical",
                "color": "#ef4444", # red
                "badge": "Severe Congestion",
                "description": "Critical bottleneck. Immediate staff intervention or extra counter recommended."
            }

    def generate_counter_recommendation(self, people_waiting: int, active_counters: int, avg_service_time: float, current_wait: float, service_type: str, hour: int, day: str, holiday: int) -> dict:
        """
        Service optimization engine:
        Evaluates what-if scenarios for increasing or decreasing active counters to optimize staff allocation.
        """
        if people_waiting == 0:
            return {
                "current_counters": active_counters,
                "suggested_counters": active_counters,
                "impact_summary": "Queue is empty. Current counter staffing is sufficient.",
                "counter_change": 0,
                "potential_time_saved": 0.0
            }

        # Simulate wait time with +1 counter
        plus_one_df = pd.DataFrame([{
            "service_type": service_type,
            "people_waiting": people_waiting,
            "active_counters": active_counters + 1,
            "avg_service_time": avg_service_time,
            "hour_of_day": hour,
            "day_of_week": day,
            "is_holiday": holiday
        }])
        wait_plus_one = round(float(self.model.predict(plus_one_df)[0]), 1)
        time_saved_plus_one = max(0.0, round(current_wait - wait_plus_one, 1))

        # Check if queues are very low and a counter can be conserved
        can_conserve = False
        conserve_wait = current_wait
        if active_counters > 1 and current_wait < 8.0:
            minus_one_df = pd.DataFrame([{
                "service_type": service_type,
                "people_waiting": people_waiting,
                "active_counters": active_counters - 1,
                "avg_service_time": avg_service_time,
                "hour_of_day": hour,
                "day_of_week": day,
                "is_holiday": holiday
            }])
            conserve_wait = round(float(self.model.predict(minus_one_df)[0]), 1)
            if conserve_wait < 14.0:
                can_conserve = True

        if current_wait > 30.0 and active_counters < 8:
            suggested = active_counters + 1
            if current_wait > 50.0 and active_counters < 7:
                suggested = active_counters + 2
            
            diff = suggested - active_counters
            return {
                "current_counters": active_counters,
                "suggested_counters": suggested,
                "impact_summary": f"Adding {diff} counter(s) will reduce expected customer wait by approximately {time_saved_plus_one} minutes.",
                "counter_change": diff,
                "potential_time_saved": time_saved_plus_one
            }
        elif can_conserve:
            return {
                "current_counters": active_counters,
                "suggested_counters": active_counters - 1,
                "impact_summary": f"Queue load is low. 1 counter can be reassigned to other duties while keeping customer wait under {conserve_wait} mins.",
                "counter_change": -1,
                "potential_time_saved": 0.0
            }
        else:
            return {
                "current_counters": active_counters,
                "suggested_counters": active_counters,
                "impact_summary": "Optimal counter staffing. Current throughput matches queue demand nicely.",
                "counter_change": 0,
                "potential_time_saved": 0.0
            }

    def predict(self, service_type: str, people_waiting: int, active_counters: int, avg_service_time: float, hour_of_day: int, day_of_week: str, is_holiday: int) -> dict:
        if people_waiting == 0:
            predicted_wait = 0.0
        else:
            input_df = pd.DataFrame([{
                "service_type": service_type,
                "people_waiting": max(0, people_waiting),
                "active_counters": max(1, active_counters),
                "avg_service_time": max(1.0, avg_service_time),
                "hour_of_day": hour_of_day,
                "day_of_week": day_of_week,
                "is_holiday": is_holiday
            }])

            raw_pred = self.model.predict(input_df)[0]
            predicted_wait = round(max(0.5, float(raw_pred)), 1)

        congestion = self.classify_congestion(predicted_wait)
        recommendation = self.generate_counter_recommendation(
            people_waiting=people_waiting,
            active_counters=active_counters,
            avg_service_time=avg_service_time,
            current_wait=predicted_wait,
            service_type=service_type,
            hour=hour_of_day,
            day=day_of_week,
            holiday=is_holiday
        )

        return {
            "predicted_waiting_time": predicted_wait,
            "congestion": congestion,
            "people_waiting": people_waiting,
            "active_counters": active_counters,
            "avg_service_time": avg_service_time,
            "service_type": service_type,
            "hour_of_day": hour_of_day,
            "day_of_week": day_of_week,
            "is_holiday": is_holiday,
            "counter_recommendation": recommendation
        }

    def forecast_day(self, service_type: str, avg_service_time: float, day_of_week: str, is_holiday: int, active_counters: int = 3, current_queue: int = 15) -> dict:
        """
        Generates predictions for 9 AM through 5 PM.
        Models time-of-day customer arrival patterns and predicts expected waiting time for each hour.
        Highlights the best future visiting slot.
        """
        # Arrival pattern multipliers based on typical operational curve
        # 9 AM: initial ramp
        # 10-11 AM: morning peak
        # 12 PM: transition
        # 1-2 PM: lunch peak
        # 3 PM: afternoon dip (best window)
        # 4-5 PM: closing rush
        arrival_profile = {
            9: 0.65,
            10: 1.30,
            11: 1.45,
            12: 1.10,
            13: 1.50,
            14: 1.35,
            15: 0.70,
            16: 0.90,
            17: 0.80
        }

        base_load = max(6, current_queue)
        forecast_slots = []

        for h in range(9, 18):
            slot_multiplier = arrival_profile.get(h, 1.0)
            slot_people = int(round(base_load * slot_multiplier))
            
            # Predict for this hypothetical slot
            input_df = pd.DataFrame([{
                "service_type": service_type,
                "people_waiting": slot_people,
                "active_counters": max(1, active_counters),
                "avg_service_time": avg_service_time,
                "hour_of_day": h,
                "day_of_week": day_of_week,
                "is_holiday": is_holiday
            }])

            wait = round(max(1.0, float(self.model.predict(input_df)[0])), 1)
            time_label = f"{h % 12 or 12}:00 {'AM' if h < 12 else 'PM'}"
            congestion = self.classify_congestion(wait)

            forecast_slots.append({
                "time": time_label,
                "hour": h,
                "predicted_waiting_time": wait,
                "estimated_queue": slot_people,
                "congestion_level": congestion["level"],
                "color": congestion["color"]
            })

        # Identify slot with the lowest waiting time
        best_slot = min(forecast_slots, key=lambda x: x["predicted_waiting_time"])

        return {
            "forecast_slots": forecast_slots,
            "best_slot": {
                "time": best_slot["time"],
                "hour": best_slot["hour"],
                "predicted_waiting_time": best_slot["predicted_waiting_time"],
                "estimated_queue": best_slot["estimated_queue"],
                "recommendation_text": f"Optimal time to visit is around {best_slot['time']} with an estimated wait of only {best_slot['predicted_waiting_time']} minutes."
            }
        }

predictor = QueuePredictor()
