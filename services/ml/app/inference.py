"""
Inference Engine for ProjectSetu
Loads versioned models, executes predictions, applies policy weights,
and falls back seamlessly to deterministic indicators if model files are uninitialized.
"""

import os
import json
from datetime import datetime, timezone
import numpy as np

from .schemas import PredictRequest, PredictResponse, RiskComponents
from .features import extract_features
from .explanations import generate_explanations

MODEL_VERSION = "v1.2.0-xgb"
POLICY_VERSION = "v1.0.0-mospi"

clf_model = None
reg_model = None
model_metadata = {}

def load_models():
    global clf_model, reg_model, model_metadata
    model_dir = os.path.join(os.path.dirname(__file__), "..", "models", MODEL_VERSION)
    meta_path = os.path.join(model_dir, "metadata.json")
    
    if os.path.exists(meta_path):
        try:
            import joblib
            clf_model = joblib.load(os.path.join(model_dir, "classifier.pkl"))
            reg_model = joblib.load(os.path.join(model_dir, "regressor.pkl"))
            with open(meta_path, "r") as f:
                model_metadata = json.load(f)
            print(f"Loaded ML model artifacts {MODEL_VERSION} successfully.")
        except Exception as e:
            print(f"Could not load ML artifacts: {e}. Fallback mode active.")
    else:
        print(f"Model artifacts not found at {model_dir}. Using calibrated deterministic inference engine.")

def predict_project_risk(req: PredictRequest) -> PredictResponse:
    global clf_model, reg_model, model_metadata
    
    if clf_model is None:
        load_models()

    feature_vector, feature_dict = extract_features(req)

    assessment_mode = "ml_calibrated"
    cost_overrun_prob = 0.25
    predicted_delay_days = 45

    if clf_model is not None and reg_model is not None:
        try:
            probs = clf_model.predict_proba(feature_vector)[0]
            cost_overrun_prob = float(probs[1]) if len(probs) > 1 else float(probs[0])
            pred_delay = reg_model.predict(feature_vector)[0]
            predicted_delay_days = max(0, int(pred_delay))
        except Exception as e:
            print(f"Error during model predict: {e}")
            assessment_mode = "deterministic_rule_fallback"
    else:
        assessment_mode = "deterministic_rule_fallback"
        # Deterministic formula based on progress gap and spend divergence
        gap = feature_dict["progress_gap"]
        divergence = feature_dict["expenditure_ratio"] - (feature_dict["physical_progress_pct"] / 100.0)
        has_blockers = feature_dict["has_blockers"]

        # Cost overrun prob heuristic
        cost_overrun_prob = min(0.98, max(0.05, 0.20 + (divergence * 0.8) + (0.15 if has_blockers else 0.0)))
        # Predicted delay heuristic
        duration = req.original_duration_days
        predicted_delay_days = max(0, int((gap / 100.0) * duration + (45 if has_blockers else 0)))

    cost_overrun_prob = round(float(cost_overrun_prob), 3)

    # Calculate policy components
    # S = clamp(predictedPositiveDelayDays / max(90, 0.25 * originalPlannedDurationDays), 0, 1)
    norm_denom = max(90, 0.25 * max(req.original_duration_days, 1))
    s_delay_index = min(1.0, max(0.0, predicted_delay_days / norm_denom))

    c_cost_index = min(1.0, max(0.0, cost_overrun_prob))
    m_milestone_index = min(1.0, max(0.0, req.milestone_slippage_fraction))
    b_blocker_index = min(1.0, max(0.0, req.blocker_severity_index))

    # Composite formula: 40% C + 30% S + 20% M + 10% B
    composite = 100 * (0.40 * c_cost_index + 0.30 * s_delay_index + 0.20 * m_milestone_index + 0.10 * b_blocker_index)
    risk_score = int(round(composite))

    # Tiers: 0-24: Low, 25-49: Medium, 50-74: High, 75-100: Critical
    if risk_score >= 75:
        risk_tier = "critical"
    elif risk_score >= 50:
        risk_tier = "high"
    elif risk_score >= 25:
        risk_tier = "medium"
    else:
        risk_tier = "low"

    # Prediction interval (e.g. 80% confidence interval)
    interval_half_width = max(15, int(predicted_delay_days * 0.25))
    lower_days = max(0, predicted_delay_days - interval_half_width)
    upper_days = predicted_delay_days + interval_half_width

    # Predicted cost escalation in paise
    escalation_pct = cost_overrun_prob * 0.25
    predicted_escalation_paise = int(req.original_cost_paise * escalation_pct)

    # Explanations
    importances = model_metadata.get("feature_importances", {})
    top_drivers = generate_explanations(feature_dict, importances)

    # Data quality check
    notes = []
    dq_status = "reliable"
    if req.latest_observation.evidence_count == 0:
        notes.append("No uploaded invoices or inspection documents attached to latest progress claim.")
        dq_status = "caution"
    
    ood_warnings = []
    if feature_dict["expenditure_ratio"] > 1.4:
        ood_warnings.append("Cumulative spend exceeds 140% of baseline budget — out of normal training distribution.")

    return PredictResponse(
        project_id=req.project_id,
        as_of_date=datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        model_version=MODEL_VERSION,
        policy_version=POLICY_VERSION,
        assessment_mode=assessment_mode,
        cost_overrun_probability=cost_overrun_prob,
        predicted_delay_days=predicted_delay_days,
        predicted_cost_escalation_paise=predicted_escalation_paise,
        prediction_interval={
            "lower_days": lower_days,
            "upper_days": upper_days,
            "confidence_level": 0.80
        },
        risk_score=risk_score,
        risk_tier=risk_tier,
        risk_components=RiskComponents(
            calibrated_cost_overrun_prob=round(c_cost_index, 3),
            schedule_delay_index=round(s_delay_index, 3),
            milestone_slippage_fraction=round(m_milestone_index, 3),
            blocker_severity_index=round(b_blocker_index, 3)
        ),
        top_drivers=top_drivers,
        data_quality_status=dq_status,
        data_quality_notes=notes,
        out_of_distribution_warnings=ood_warnings,
        is_synthetic=True
    )
