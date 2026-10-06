"""
data_generator.py
Synthetic queue dataset generator for AI-Based Queue Waiting-Time Prediction.
Generates realistic historical queue records based on multi-server queuing dynamics (M/M/c approximation),
temporal peak cycles, service variations, and holiday impacts.
"""

import os
import numpy as np
import pandas as pd

def generate_queue_dataset(num_records: int = 6500, output_path: str = None) -> pd.DataFrame:
    """
    Generate synthetic queue dataset with realistic operational dependencies.
    """
    np.random.seed(42)

    service_catalog = {
        "General Inquiry": {"base_time": (2.5, 5.0), "weight": 0.30},
        "Cash Transaction": {"base_time": (4.0, 7.5), "weight": 0.25},
        "Document Verification": {"base_time": (6.5, 11.0), "weight": 0.20},
        "Account Opening": {"base_time": (12.0, 18.0), "weight": 0.15},
        "Loan Consultation": {"base_time": (18.0, 28.0), "weight": 0.10},
    }

    service_names = list(service_catalog.keys())
    service_weights = [service_catalog[k]["weight"] for k in service_names]

    days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    day_weights = [0.22, 0.17, 0.16, 0.16, 0.19, 0.10]  # Mondays & Fridays busier

    # Random generation of primary dimensions
    service_types = np.random.choice(service_names, size=num_records, p=service_weights)
    days = np.random.choice(days_of_week, size=num_records, p=day_weights)
    hours = np.random.choice(range(9, 18), size=num_records)  # 9 AM to 5 PM
    
    # Holidays: approx 8% of operating days are special holiday schedules
    is_holidays = np.random.choice([0, 1], size=num_records, p=[0.92, 0.08])

    avg_service_times = []
    active_counters_list = []
    people_waiting_list = []
    waiting_times = []

    for i in range(num_records):
        st = service_types[i]
        day = days[i]
        hr = hours[i]
        hol = is_holidays[i]

        # 1. Average service time for this session (with natural variation)
        min_st, max_st = service_catalog[st]["base_time"]
        session_avg_st = round(np.random.uniform(min_st, max_st), 1)
        avg_service_times.append(session_avg_st)

        # 2. Peak hour factor
        # Rush hours: 10-12 AM (morning surge) and 13-14 PM (lunch surge)
        if hr in [10, 11]:
            peak_factor = 1.35
        elif hr in [13, 14]:
            peak_factor = 1.40
        elif hr in [9, 16, 17]:
            peak_factor = 0.85
        else:
            peak_factor = 1.05

        # 3. Day factor
        if day == "Monday":
            day_factor = 1.25
        elif day == "Friday":
            day_factor = 1.15
        elif day == "Saturday":
            day_factor = 0.90
        else:
            day_factor = 1.0

        # 4. Active counters (1 to 8, usually management scales up during peak)
        if peak_factor > 1.2:
            counters = int(np.random.choice([2, 3, 4, 5, 6], p=[0.10, 0.35, 0.30, 0.15, 0.10]))
        else:
            counters = int(np.random.choice([1, 2, 3, 4, 5], p=[0.15, 0.40, 0.30, 0.10, 0.05]))
        
        # Holiday staffing might be reduced
        if hol == 1 and counters > 2:
            counters -= 1
        active_counters_list.append(counters)

        # 5. People waiting (Poisson-like queue length influenced by hour and day)
        base_lambda = 12 * peak_factor * day_factor
        if hol == 1:
            base_lambda *= 1.2  # Holiday surge
        
        queue_size = int(np.random.poisson(lam=base_lambda))
        queue_size = max(0, min(65, queue_size))
        people_waiting_list.append(queue_size)

        # 6. Realistic waiting time calculation (queuing theory + friction)
        if queue_size == 0:
            wait = 0.0
        else:
            # Theoretical queue wait time = (people_waiting * avg_service_time) / active_counters
            service_capacity = counters / session_avg_st
            theoretical_wait = queue_size / service_capacity

            # Realistic operational adjustments:
            # - Transition / handover friction between tickets (~0.4 - 1.2 min per person ahead)
            handover_delay = queue_size * (0.3 / counters)
            
            # - Fatigue / slowdown under heavy congestion
            congestion_strain = 1.0 + (0.12 if queue_size > 25 else 0.0) + (0.08 if hr in [13, 14] else 0.0)
            
            # - Random stochastic environmental noise
            noise = np.random.normal(loc=0.0, scale=max(0.8, theoretical_wait * 0.06))

            wait = (theoretical_wait * congestion_strain) + handover_delay + noise
            wait = round(max(0.5, wait), 1)

        waiting_times.append(wait)

    df = pd.DataFrame({
        "service_type": service_types,
        "people_waiting": people_waiting_list,
        "active_counters": active_counters_list,
        "avg_service_time": avg_service_times,
        "hour_of_day": hours,
        "day_of_week": days,
        "is_holiday": is_holidays,
        "waiting_time": waiting_times
    })

    if output_path:
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        df.to_csv(output_path, index=False)
        print(f"Generated dataset with {len(df)} records saved to: {output_path}")

    return df

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    target_csv = os.path.abspath(os.path.join(current_dir, "..", "data", "queue_data.csv"))
    df = generate_queue_dataset(num_records=6500, output_path=target_csv)
    print("Sample generated rows:")
    print(df.head())
    print("\nDataset Summary:")
    print(df.describe())
