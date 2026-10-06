# QueueAI — Enterprise Queue Waiting-Time Prediction & Service Optimization Platform

> **"Predict. Plan. Avoid the Wait."**  
> *B.Tech Information Technology • PDD Prototype & Commercial-Grade SaaS Platform*

**QueueAI** is an AI-powered queue management and waiting-time prediction platform. Designed to meet the standards of modern SaaS platforms (such as Stripe, Linear, and Vercel), it combines multi-server queuing kinetics with machine learning to eliminate long lines, forecast future hourly waiting times, and provide automated counter dispatch recommendations.

---

## 🌟 Key Features & SaaS Architecture

- **1. Modern SaaS UI/UX Design System**:
  - Full **Light Mode & Dark Mode** with instant theme toggle and persistence.
  - Enterprise typography using **Inter** and **JetBrains Mono**.
  - Restrained semantic colors: Emerald (Low / Optimal), Amber (Moderate), Rose (High Congestion), and Electric Indigo (Primary Brand).
  - Responsive layout: Collapsible desktop sidebar + mobile drawer, accessible top bar with location and notification selectors.

- **2. Dedicated Navigation Modules**:
  - **Dashboard**: Live queue headcount, estimated waiting time (e.g. `47 min`), active counters, congestion meter, and AI operational insights.
  - **Predict Wait**: Modern form controls (sliders, dropdowns, toggles) with loading state (`Analyzing queue conditions...`) and immediate result card.
  - **Future Forecast**: Interactive Recharts projection from 9:00 AM to 5:00 PM highlighting the optimal lowest-wait slot (`3:00 PM ~18 min wait`).
  - **Recommendations**: Dedicated smart scheduling page with recommended visiting window, alternative slot matrix, and explanation card (*"Why this time?"*).
  - **Queue Analytics**: High-level throughput metrics, daily arrival area charts, congestion donut distribution, peak-hours severity table, and genuine ML validation (MAE, RMSE, R²).
  - **Admin Control Center**: Facility oversight KPIs, counter dispatch simulator, AI staffing recommendations, and live queue monitoring table.

- **3. Authentic Machine Learning Model (Preserved & Real)**:
  - **Algorithm**: `RandomForestRegressor` (120 Estimator Ensembles)
  - **MAE (Mean Absolute Error)**: `3.427` minutes
  - **RMSE (Root Mean Squared Error)**: `6.115` minutes
  - **R² Score (Coefficient of Determination)**: `0.9857` (98.6% Variance Explained)
  - **Feature Weights**: Average Service Time (50.2%), Active Counters (27.6%), People Waiting (21.0%).

---

## 🏗️ Project Architecture

```
queue-prediction-system/
│
├── backend/
│   ├── main.py              # FastAPI REST API (all endpoints preserved)
│   ├── model.py             # Inference engine & staffing optimization
│   ├── train_model.py       # ML training pipeline (authentic metrics calculation)
│   ├── data_generator.py    # 6,500 synthetic queue records
│   ├── database.py          # SQLite database storage & aggregation
│   ├── requirements.txt     # Python backend dependencies
│   ├── queue_system.db      # SQLite database file
│   └── models/
│       ├── queue_rf_model.joblib # Serialized Random Forest model
│       └── model_metrics.json    # Authentic evaluation metrics
│
├── frontend/
│   ├── index.html           # HTML5 entrypoint with QueueAI branding
│   ├── package.json         # React 19, Recharts & Lucide-react
│   └── src/
│       ├── api.js           # REST API client
│       ├── App.jsx          # Root component, theme manager & view routing
│       ├── index.css        # Enterprise SaaS design system (Light/Dark mode)
│       └── components/
│           ├── layout/
│           │   ├── Sidebar.jsx # Desktop & mobile responsive sidebar
│           │   └── Topbar.jsx  # Location switcher, theme toggle & alerts
│           ├── common/
│           │   ├── StatCard.jsx        # Reusable KPI metric card
│           │   ├── CongestionBadge.jsx # Status pill with pulse dot
│           │   ├── CongestionMeter.jsx # Visual 4-tier queue meter bar
│           │   ├── AIInsightCard.jsx   # AI insight callout card
│           │   ├── LoadingState.jsx    # Professional loading animation
│           │   └── ErrorState.jsx      # Friendly error banner with retry
│           └── views/
│               ├── DashboardView.jsx      # Module 1: Executive Dashboard
│               ├── PredictWaitView.jsx    # Module 2: Predict Wait
│               ├── FutureForecastView.jsx # Module 3: Future Forecast
│               ├── RecommendationsView.jsx# Module 4: Recommendations
│               ├── QueueAnalyticsView.jsx # Module 5: Queue Analytics
│               └── AdminView.jsx          # Module 6: Admin Dashboard
│
├── data/
│   └── queue_data.csv       # Historical dataset (6,500 records)
│
└── README.md
```

---

## 🚀 Running the Application

### 1. Backend (FastAPI):
```powershell
cd "c:\Users\nenoc\OneDrive\Desktop\queue-prediction-system\backend"
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

### 2. Frontend (React Vite):
```powershell
cd "c:\Users\nenoc\OneDrive\Desktop\queue-prediction-system\frontend"
npm run dev -- --host 127.0.0.1 --port 5173
```
QueueAI Dashboard: [http://127.0.0.1:5173](http://127.0.0.1:5173)
