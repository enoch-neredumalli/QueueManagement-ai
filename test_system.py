import os
import urllib.request
import json
import sqlite3

def run_diagnostics():
    print("==================================================")
    print("       QUEUEAI FULL SYSTEM DIAGNOSTIC REPORT       ")
    print("==================================================")
    
    base = os.path.dirname(os.path.abspath(__file__))
    
    # 1. File verification
    print("\n[1] PHYSICAL ARTIFACTS VERIFICATION:")
    files = [
        ("Historical Dataset (CSV)", os.path.join(base, "data", "queue_data.csv")),
        ("Trained Random Forest Model", os.path.join(base, "backend", "models", "queue_rf_model.joblib")),
        ("Authentic Model Metrics JSON", os.path.join(base, "backend", "models", "model_metrics.json")),
        ("SQLite Database", os.path.join(base, "backend", "queue_system.db")),
        ("Frontend Production Bundle", os.path.join(base, "frontend", "dist", "index.html")),
    ]
    for label, path in files:
        if os.path.exists(path):
            size = os.path.getsize(path)
            print(f"  [OK] {label:32} [EXISTS - {size:,} bytes]")
        else:
            print(f"  [FAIL] {label:32} [MISSING]")

    # 2. Database verification
    print("\n[2] DATABASE ENGINE (SQLite):")
    db_path = os.path.join(base, "backend", "queue_system.db")
    conn = sqlite3.connect(db_path)
    c = conn.cursor()
    c.execute("SELECT COUNT(*) FROM predictions")
    count = c.fetchone()[0]
    print(f"  [OK] Active SQLite Records in DB: {count} logged predictions")
    c.execute("SELECT timestamp, service_type, people_waiting, predicted_wait_time, congestion_level FROM predictions ORDER BY id DESC LIMIT 1")
    latest = c.fetchone()
    print(f"  [OK] Most Recent DB Entry: {latest}")
    conn.close()

    # 3. Backend Verification
    print("\n[3] BACKEND REST API (FastAPI @ http://127.0.0.1:8000):")
    try:
        h = urllib.request.urlopen("http://127.0.0.1:8000/health")
        h_data = json.loads(h.read().decode())
        print(f"  [OK] Health Check: {h_data}")

        # Real ML prediction test
        payload = {
            "service_type": "Cash Transaction",
            "people_waiting": 23,
            "active_counters": 2,
            "avg_service_time": 5.5,
            "hour_of_day": 11,
            "day_of_week": "Monday",
            "is_holiday": 0
        }
        req = urllib.request.Request(
            "http://127.0.0.1:8000/predict",
            data=json.dumps(payload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        res = urllib.request.urlopen(req)
        pred = json.loads(res.read().decode())
        print(f"  [OK] POST /predict: SUCCESS")
        print(f"      - Predicted Wait: {pred['predicted_waiting_time']} minutes")
        print(f"      - Congestion Level: {pred['congestion']['level']}")
        print(f"      - Stored Log ID: #{pred['log_id']}")

        # Forecast test
        fpayload = {
            "service_type": "Cash Transaction",
            "avg_service_time": 5.5,
            "day_of_week": "Monday",
            "is_holiday": 0,
            "active_counters": 2,
            "current_queue": 23
        }
        freq = urllib.request.Request(
            "http://127.0.0.1:8000/forecast",
            data=json.dumps(fpayload).encode("utf-8"),
            headers={"Content-Type": "application/json"}
        )
        fres = urllib.request.urlopen(freq)
        forecast = json.loads(fres.read().decode())
        print(f"  [OK] POST /forecast: SUCCESS")
        print(f"      - Business Slots Generated: {len(forecast['forecast_slots'])} (9 AM to 5 PM)")
        print(f"      - Highlighted Best Slot: {forecast['best_slot']['time']} with {forecast['best_slot']['predicted_waiting_time']} mins")

    except Exception as e:
        print(f"  [FAIL] Backend Test Error: {e}")

    # 4. Frontend Verification
    print("\n[4] FRONTEND DEV SERVER (Vite React @ http://127.0.0.1:5173):")
    try:
        f_res = urllib.request.urlopen("http://127.0.0.1:5173/")
        print(f"  [OK] HTTP Status: {f_res.status} OK")
        print("  [OK] QueueAI SaaS Frontend is running and responding live")
    except Exception as e:
        print(f"  [FAIL] Frontend Server Error: {e}")

    print("\n==================================================")
    print("               VERIFICATION COMPLETE               ")
    print("==================================================")

if __name__ == "__main__":
    run_diagnostics()
