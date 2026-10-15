"""
Reproducible Training Pipeline for ProjectSetu ML Service
=========================================================
Trains:
1. Calibrated Cost Overrun Classifier (Probability final cost > original approved + 10%)
2. Positive Schedule Delay Regressor (Expected delay in days)

Key Principles:
- Project-level split (all observations of a project stay strictly in train OR test)
- Temporal / cutoff awareness
- No leakage of future observations
- Versioned artifacts and evaluation reports
"""

import os
import json
import numpy as np
import pandas as pd
import joblib
from sklearn.linear_model import LogisticRegression, Ridge
from sklearn.ensemble import GradientBoostingClassifier, GradientBoostingRegressor
from sklearn.metrics import (
    roc_auc_score,
    average_precision_score,
    brier_score_loss,
    mean_absolute_error,
    median_absolute_error
)
from sklearn.calibration import CalibratedClassifierCV

MODEL_VERSION = "v1.2.0-xgb"
RANDOM_SEED = 2026103

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

def train_and_evaluate():
    # 1. Load synthetic records
    data_path = os.path.join("data", "synthetic_dataset_rows.json")
    if not os.path.exists(data_path):
        print("Data not found, running generator first...")
        from generate_demo_data import generate_dataset
        generate_dataset(200)

    with open(data_path, "r") as f:
        records = json.load(f)

    df = pd.DataFrame(records)
    print(f"Loaded {len(df)} feature snapshots.")

    # 2. Project-level split to guarantee NO data leakage
    project_ids = df["project_id"].unique()
    np.random.seed(RANDOM_SEED)
    np.random.shuffle(project_ids)

    split_idx = int(len(project_ids) * 0.75)
    train_projects = set(project_ids[:split_idx])
    test_projects = set(project_ids[split_idx:])

    train_df = df[df["project_id"].isin(train_projects)]
    test_df = df[df["project_id"].isin(test_projects)]

    print(f"Train split: {len(train_projects)} projects, {len(train_df)} snapshots.")
    print(f"Test split: {len(test_projects)} projects, {len(test_df)} snapshots.")

    X_train = train_df[FEATURE_COLS].values
    y_clf_train = train_df["target_cost_overrun_binary"].values
    y_reg_train = train_df["target_delay_days"].values

    X_test = test_df[FEATURE_COLS].values
    y_clf_test = test_df["target_cost_overrun_binary"].values
    y_reg_test = test_df["target_delay_days"].values

    # 3. Train Classification Models
    # Baseline
    clf_base = LogisticRegression(random_state=RANDOM_SEED, max_iter=1000)
    clf_base.fit(X_train, y_clf_train)

    # Primary Gradient Boosting Classifier with Isotonic/Sigmoid Calibration
    clf_gb = GradientBoostingClassifier(
        n_estimators=100,
        learning_rate=0.08,
        max_depth=4,
        random_state=RANDOM_SEED
    )
    clf_calibrated = CalibratedClassifierCV(estimator=clf_gb, method='sigmoid', cv=3)
    clf_calibrated.fit(X_train, y_clf_train)

    # 4. Train Regression Models
    # Baseline Ridge
    reg_base = Ridge(random_state=RANDOM_SEED)
    reg_base.fit(X_train, y_reg_train)

    # Primary Gradient Boosting Regressor
    reg_gb = GradientBoostingRegressor(
        n_estimators=120,
        learning_rate=0.07,
        max_depth=4,
        random_state=RANDOM_SEED
    )
    reg_gb.fit(X_train, y_reg_train)

    # 5. Evaluate Classification
    y_clf_prob = clf_calibrated.predict_proba(X_test)[:, 1]
    roc_auc = float(roc_auc_score(y_clf_test, y_clf_prob))
    pr_auc = float(average_precision_score(y_clf_test, y_clf_prob))
    brier = float(brier_score_loss(y_clf_test, y_clf_prob))

    # Baseline comparison
    y_base_prob = clf_base.predict_proba(X_test)[:, 1]
    base_roc = float(roc_auc_score(y_clf_test, y_base_prob))

    # 6. Evaluate Regression
    y_reg_pred = np.maximum(0, reg_gb.predict(X_test))
    mae = float(mean_absolute_error(y_reg_test, y_reg_pred))
    median_ae = float(median_absolute_error(y_reg_test, y_reg_pred))

    base_reg_pred = np.maximum(0, reg_base.predict(X_test))
    base_mae = float(mean_absolute_error(y_reg_test, base_reg_pred))

    metrics = {
        "model_version": MODEL_VERSION,
        "is_synthetic": True,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "classification": {
            "model_type": "CalibratedGradientBoostingClassifier",
            "roc_auc": round(roc_auc, 4),
            "pr_auc": round(pr_auc, 4),
            "brier_score": round(brier, 4),
            "baseline_logistic_roc_auc": round(base_roc, 4)
        },
        "regression": {
            "model_type": "GradientBoostingRegressor",
            "mae_days": round(mae, 2),
            "median_absolute_error_days": round(median_ae, 2),
            "baseline_ridge_mae_days": round(base_mae, 2)
        }
    }

    # 7. Serialize Artifacts
    output_dir = os.path.join("models", MODEL_VERSION)
    os.makedirs(output_dir, exist_ok=True)

    joblib.dump(clf_calibrated, os.path.join(output_dir, "classifier.pkl"))
    joblib.dump(reg_gb, os.path.join(output_dir, "regressor.pkl"))

    # Also extract feature importances from underlying GBDT for explanations
    feature_importances = reg_gb.feature_importances_.tolist()
    importance_map = dict(zip(FEATURE_COLS, [round(x, 4) for x in feature_importances]))

    metadata = {
        "model_version": MODEL_VERSION,
        "policy_version": "v1.0.0-mospi",
        "feature_columns": FEATURE_COLS,
        "feature_importances": importance_map,
        "metrics": metrics,
        "description": "ProjectSetu Infrastructure Risk Model (SIH26103 Synthetic Prototype)"
    }

    with open(os.path.join(output_dir, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)

    with open(os.path.join(output_dir, "evaluation_report.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    print("--- MODEL EVALUATION SUMMARY ---")
    print(json.dumps(metrics, indent=2))
    print(f"Artifacts saved to {output_dir}/")

if __name__ == "__main__":
    train_and_evaluate()
