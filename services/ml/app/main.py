"""
FastAPI Microservice for ProjectSetu ML Inference & Explanation
===============================================================
Endpoints:
- GET  /health
- GET  /model-info
- POST /predict
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from .schemas import PredictRequest, PredictResponse
from .inference import predict_project_risk, MODEL_VERSION, POLICY_VERSION, load_models

app = FastAPI(
    title="ProjectSetu ML Service",
    description="Integrated Infrastructure Intelligence - Predictive Risk & Explainability Service (MoSPI SIH26103)",
    version=MODEL_VERSION
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup_event():
    load_models()

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "project-setu-ml",
        "model_version": MODEL_VERSION,
        "policy_version": POLICY_VERSION,
        "is_synthetic_demo": True
    }

@app.get("/model-info")
def model_info():
    return {
        "model_version": MODEL_VERSION,
        "policy_version": POLICY_VERSION,
        "targets": [
            "Cost Overrun Classification (> 10% baseline)",
            "Schedule Delay Regression (Positive Days Over Baseline)"
        ],
        "training_data": "Synthetic Indian Infrastructure Demonstration Dataset (~200 projects, 24 months)",
        "features": [
            "elapsed_ratio", "physical_progress_pct", "planned_progress_pct",
            "progress_gap", "expenditure_ratio", "has_blockers",
            "evidence_count", "original_cost_cr", "original_duration_months"
        ],
        "explainability": "Feature impact contributions with deterministic narrative templates"
    }

@app.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        return predict_project_risk(req)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
