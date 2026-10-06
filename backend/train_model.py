"""
train_model.py
Trains a Random Forest Regressor on the historical queue dataset.
Calculates authentic evaluation metrics (MAE, RMSE, R²) and persists the model pipeline and metrics.
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, root_mean_squared_error, r2_score

from data_generator import generate_queue_dataset

def train_and_evaluate(csv_path: str, model_output_path: str, metrics_output_path: str):
    # 1. Load or Generate Dataset
    if not os.path.exists(csv_path):
        print(f"Data file not found at {csv_path}. Generating fresh synthetic dataset...")
        df = generate_queue_dataset(num_records=6500, output_path=csv_path)
    else:
        print(f"Loading dataset from: {csv_path}")
        df = pd.read_csv(csv_path)

    print(f"Total dataset records: {len(df)}")
    
    # Clean & validate
    df = df.dropna()
    df["people_waiting"] = df["people_waiting"].clip(lower=0)
    df["active_counters"] = df["active_counters"].clip(lower=1)
    df["avg_service_time"] = df["avg_service_time"].clip(lower=1.0)
    df["waiting_time"] = df["waiting_time"].clip(lower=0.0)

    # 2. Features and Target
    feature_cols = [
        "service_type",
        "people_waiting",
        "active_counters",
        "avg_service_time",
        "hour_of_day",
        "day_of_week",
        "is_holiday"
    ]
    target_col = "waiting_time"

    X = df[feature_cols]
    y = df[target_col]

    # 3. Train-Test Split (80% Train, 20% Test)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    categorical_features = ["service_type", "day_of_week"]
    numeric_features = ["people_waiting", "active_counters", "avg_service_time", "hour_of_day", "is_holiday"]

    # 4. Preprocessing & Model Pipeline
    preprocessor = ColumnTransformer(
        transformers=[
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features),
            ("num", "passthrough", numeric_features)
        ]
    )

    rf_model = RandomForestRegressor(
        n_estimators=120,
        max_depth=16,
        min_samples_split=4,
        min_samples_leaf=2,
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", rf_model)
    ])

    print("Training Random Forest Regressor...")
    pipeline.fit(X_train, y_train)

    # 5. Evaluate on Test Set (Authentic, calculated metrics)
    y_pred = pipeline.predict(X_test)
    y_train_pred = pipeline.predict(X_train)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))
    r2 = float(r2_score(y_test, y_pred))

    train_r2 = float(r2_score(y_train, y_train_pred))
    train_mae = float(mean_absolute_error(y_train, y_train_pred))

    # Feature Importances extraction
    ohe_categories = pipeline.named_steps["preprocessor"].named_transformers_["cat"].get_feature_names_out(categorical_features)
    all_feature_names = list(ohe_categories) + numeric_features
    importances = pipeline.named_steps["regressor"].feature_importances_

    feature_importance_dict = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
    ]

    metrics = {
        "model_type": "Random Forest Regressor",
        "dataset_size": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "mae": round(mae, 3),
        "rmse": round(rmse, 3),
        "r2_score": round(r2, 4),
        "train_r2": round(train_r2, 4),
        "train_mae": round(train_mae, 3),
        "mean_actual_wait": round(float(y.mean()), 2),
        "feature_importances": feature_importance_dict[:8],
        "training_features": feature_cols
    }

    # 6. Save Model and Metrics
    os.makedirs(os.path.dirname(model_output_path), exist_ok=True)
    joblib.dump(pipeline, model_output_path)
    print(f"Model saved to: {model_output_path}")

    with open(metrics_output_path, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved to: {metrics_output_path}")

    print("\n--- Model Training Results ---")
    print(f"Mean Absolute Error (MAE): {mae:.3f} minutes")
    print(f"Root Mean Squared Error (RMSE): {rmse:.3f} minutes")
    print(f"R² Score: {r2:.4f}")
    print("--------------------------------\n")

    return metrics

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    csv_file = os.path.abspath(os.path.join(current_dir, "..", "data", "queue_data.csv"))
    model_file = os.path.join(current_dir, "models", "queue_rf_model.joblib")
    metrics_file = os.path.join(current_dir, "models", "model_metrics.json")

    train_and_evaluate(csv_file, model_file, metrics_file)
