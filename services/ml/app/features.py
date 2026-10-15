"""
Feature Engineering for ProjectSetu
Extracts and validates feature vector for model inference.
"""

import numpy as np
from .schemas import PredictRequest

FEATURE_COLS = [
    "elapsed_ratio",
    "physical_progress_pct",
    "planned_progress_pct",
    "progress_gap",
    "expenditure_ratio",
    "has_blockers",
    "evidence_count",
    "original_cost_cr",
    "original_duration_months"
]

def extract_features(req: PredictRequest):
    orig_duration_months = max(1, req.original_duration_days // 30)
    elapsed_months = max(0, req.elapsed_days // 30)
    elapsed_ratio = min(2.5, elapsed_months / orig_duration_months)

    obs = req.latest_observation
    prog_gap = obs.planned_progress_pct - obs.physical_progress_pct
    
    orig_cost_cr = req.original_cost_paise / (10_000_000 * 100)
    exp_ratio = obs.cumulative_expenditure_paise / max(1, req.original_cost_paise)

    feature_dict = {
        "elapsed_ratio": round(elapsed_ratio, 3),
        "physical_progress_pct": round(obs.physical_progress_pct, 2),
        "planned_progress_pct": round(obs.planned_progress_pct, 2),
        "progress_gap": round(prog_gap, 2),
        "expenditure_ratio": round(exp_ratio, 3),
        "has_blockers": 1 if obs.has_blockers else 0,
        "evidence_count": obs.evidence_count,
        "original_cost_cr": round(orig_cost_cr, 2),
        "original_duration_months": orig_duration_months
    }

    feature_vector = np.array([[feature_dict[col] for col in FEATURE_COLS]], dtype=np.float32)
    return feature_vector, feature_dict
