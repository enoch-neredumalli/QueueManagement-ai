"""
database.py
SQLite database manager for AI-Based Queue Waiting-Time Prediction.
Stores predictions, historical queue logs, and provides aggregation for the admin dashboard.
"""

import sqlite3
import os
from datetime import datetime, timedelta
import random

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "queue_system.db")

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS predictions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        service_type TEXT NOT NULL,
        people_waiting INTEGER NOT NULL,
        active_counters INTEGER NOT NULL,
        avg_service_time REAL NOT NULL,
        hour_of_day INTEGER NOT NULL,
        day_of_week TEXT NOT NULL,
        is_holiday INTEGER NOT NULL,
        predicted_wait_time REAL NOT NULL,
        congestion_level TEXT NOT NULL
    )
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS queue_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        service_type TEXT NOT NULL,
        queue_count INTEGER NOT NULL,
        active_counters INTEGER NOT NULL,
        avg_wait_minutes REAL NOT NULL,
        status TEXT NOT NULL
    )
    """)

    conn.commit()

    # Check if predictions table has data, if not seed initial 20 realistic logs for the admin dashboard
    cursor.execute("SELECT COUNT(*) FROM predictions")
    count = cursor.fetchone()[0]

    if count == 0:
        seed_sample_data(conn)

    conn.close()

def seed_sample_data(conn):
    cursor = conn.cursor()
    services = ["General Inquiry", "Cash Transaction", "Document Verification", "Account Opening", "Loan Consultation"]
    now = datetime.now()

    sample_logs = []
    # Generate 25 recent historical entries over past 24 hours
    for i in range(25):
        past_time = now - timedelta(hours=(24 - i))
        hr = past_time.hour
        day = past_time.strftime("%A")
        st = random.choice(services)
        
        # Simulating queue size based on hour
        if hr in [10, 11, 13, 14]:
            people = random.randint(18, 38)
            counters = random.randint(3, 5)
        elif hr in [9, 15, 16]:
            people = random.randint(8, 20)
            counters = random.randint(2, 4)
        else:
            people = random.randint(3, 12)
            counters = random.randint(1, 3)

        avg_st = round(random.uniform(4.0, 12.0), 1)
        wait = round((people * avg_st) / max(1, counters) * random.uniform(0.9, 1.2), 1)
        
        if wait < 12:
            congestion = "Low"
        elif wait < 28:
            congestion = "Moderate"
        elif wait < 45:
            congestion = "High"
        else:
            congestion = "Critical"

        sample_logs.append((
            past_time.strftime("%Y-%m-%d %H:%M:%S"),
            st,
            people,
            counters,
            avg_st,
            hr,
            day,
            0,
            wait,
            congestion
        ))

    cursor.executemany("""
    INSERT INTO predictions 
    (timestamp, service_type, people_waiting, active_counters, avg_service_time, hour_of_day, day_of_week, is_holiday, predicted_wait_time, congestion_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, sample_logs)

    conn.commit()
    print("Database initialized and seeded with 25 initial logs.")

def save_prediction_record(service_type, people_waiting, active_counters, avg_service_time, hour_of_day, day_of_week, is_holiday, predicted_wait_time, congestion_level):
    conn = get_connection()
    cursor = conn.cursor()
    now_str = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("""
    INSERT INTO predictions 
    (timestamp, service_type, people_waiting, active_counters, avg_service_time, hour_of_day, day_of_week, is_holiday, predicted_wait_time, congestion_level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (now_str, service_type, people_waiting, active_counters, avg_service_time, hour_of_day, day_of_week, is_holiday, predicted_wait_time, congestion_level))

    record_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return record_id

def get_dashboard_data():
    conn = get_connection()
    cursor = conn.cursor()

    # Total queries / predictions logged
    cursor.execute("SELECT COUNT(*) FROM predictions")
    total_predictions = cursor.fetchone()[0]

    # Average wait time
    cursor.execute("SELECT AVG(predicted_wait_time) FROM predictions")
    avg_wait = cursor.fetchone()[0] or 0.0

    # Max wait time
    cursor.execute("SELECT MAX(predicted_wait_time) FROM predictions")
    max_wait = cursor.fetchone()[0] or 0.0

    # Recent 10 predictions
    cursor.execute("""
    SELECT id, timestamp, service_type, people_waiting, active_counters, avg_service_time, predicted_wait_time, congestion_level
    FROM predictions
    ORDER BY id DESC
    LIMIT 10
    """)
    recent_rows = [dict(row) for row in cursor.fetchall()]

    # Hourly distribution of wait time and queue volume
    cursor.execute("""
    SELECT hour_of_day, 
           AVG(predicted_wait_time) as avg_wait,
           AVG(people_waiting) as avg_queue,
           COUNT(*) as entry_count
    FROM predictions
    GROUP BY hour_of_day
    ORDER BY hour_of_day ASC
    """)
    hourly_rows = [dict(row) for row in cursor.fetchall()]

    # Congestion breakdown
    cursor.execute("""
    SELECT congestion_level, COUNT(*) as count
    FROM predictions
    GROUP BY congestion_level
    """)
    congestion_breakdown = {row["congestion_level"]: row["count"] for row in cursor.fetchall()}

    conn.close()

    # Format hourly trend for charts
    hourly_trends = []
    for h in range(9, 18):
        found = next((row for row in hourly_rows if row["hour_of_day"] == h), None)
        hour_label = f"{h % 12 or 12}:00 {'AM' if h < 12 else 'PM'}"
        if found:
            hourly_trends.append({
                "hour": hour_label,
                "hour_num": h,
                "avg_wait": round(found["avg_wait"], 1),
                "avg_queue": round(found["avg_queue"], 1),
                "sample_count": found["entry_count"]
            })
        else:
            # Baseline estimation if no entries yet for this hour
            hourly_trends.append({
                "hour": hour_label,
                "hour_num": h,
                "avg_wait": 14.5,
                "avg_queue": 10.0,
                "sample_count": 0
            })

    # Determine peak hours
    peak_hour_entry = max(hourly_trends, key=lambda x: x["avg_wait"]) if hourly_trends else None
    peak_hours_str = f"{peak_hour_entry['hour']} (Peak Wait ~{peak_hour_entry['avg_wait']}m)" if peak_hour_entry else "11:00 AM - 1:00 PM"

    return {
        "total_predictions": total_predictions,
        "avg_wait_minutes": round(avg_wait, 1),
        "max_wait_minutes": round(max_wait, 1),
        "peak_hours": peak_hours_str,
        "recent_predictions": recent_rows,
        "hourly_trends": hourly_trends,
        "congestion_breakdown": congestion_breakdown
    }

if __name__ == "__main__":
    init_db()
    data = get_dashboard_data()
    print("Dashboard Data Sample:")
    print("Total predictions:", data["total_predictions"])
    print("Average wait:", data["avg_wait_minutes"], "minutes")
    print("Peak hours:", data["peak_hours"])
