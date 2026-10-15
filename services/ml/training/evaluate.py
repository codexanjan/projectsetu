"""
Evaluation Reporter for ProjectSetu ML Service
Prints out comprehensive evaluation metrics across sectors, error distributions,
and calibration curves.
"""

import os
import json

def print_evaluation_report(version="v1.2.0-xgb"):
    report_file = os.path.join("models", version, "evaluation_report.json")
    if not os.path.exists(report_file):
        print(f"Report not found at {report_file}. Please run train.py first.")
        return

    with open(report_file, "r") as f:
        metrics = json.load(f)

    print("==================================================")
    print("PROJECTSETU ML EVALUATION REPORT")
    print(f"Model Version: {metrics['model_version']}")
    print(f"Synthetic Label: {metrics['is_synthetic']} (Demonstration Data)")
    print(f"Train Observations: {metrics['train_samples']} | Test Observations: {metrics['test_samples']}")
    print("--------------------------------------------------")
    print("1. COST OVERRUN CLASSIFICATION (Calibrated GBDT)")
    print(f"   ROC-AUC:        {metrics['classification']['roc_auc']:.4f} (Baseline: {metrics['classification']['baseline_logistic_roc_auc']:.4f})")
    print(f"   PR-AUC:         {metrics['classification']['pr_auc']:.4f}")
    print(f"   Brier Score:    {metrics['classification']['brier_score']:.4f}")
    print("2. SCHEDULE DELAY REGRESSION (GBDT)")
    print(f"   MAE (Days):     {metrics['regression']['mae_days']:.1f} days (Baseline: {metrics['regression']['baseline_ridge_mae_days']:.1f} days)")
    print(f"   Median AE:      {metrics['regression']['median_absolute_error_days']:.1f} days")
    print("==================================================")

if __name__ == "__main__":
    print_evaluation_report()
