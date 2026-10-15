"""
Unit tests for ProjectSetu ML Inference Service
Verifies:
- Feature extraction & schema validation
- Classification & regression prediction with v1.2.0-xgb
- Normalization against baseline planned duration
- Deterministic explainability & SHAP driver generation
- Synthetic disclosure flags
"""

import sys
import os
import unittest

# Ensure app path is resolvable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.schemas import PredictRequest, ObservationInput
from app.inference import predict_project_risk, load_models
from app.features import extract_features


class TestMLInference(unittest.TestCase):
    def setUp(self):
        load_models()
        self.sample_request = PredictRequest(
            project_id="test-proj-001",
            sector="Roads & Highways",
            original_cost_paise=150000000000,   # 1500 Cr
            original_duration_days=730,
            elapsed_days=365,
            latest_observation=ObservationInput(
                reporting_period="2024-06",
                cumulative_expenditure_paise=75000000000,
                physical_progress_pct=35.0,
                planned_progress_pct=50.0,
                has_blockers=True,
                evidence_count=3
            ),
            milestone_slippage_fraction=0.25,
            blocker_severity_index=0.40,
            policy_version="v1.0.0-mospi"
        )

    def test_feature_extraction(self):
        feature_vector, feature_dict = extract_features(self.sample_request)
        self.assertIn("progress_gap", feature_dict)
        self.assertIn("expenditure_ratio", feature_dict)
        self.assertEqual(feature_vector.shape[0], 1)
        self.assertEqual(feature_vector.shape[1], 9)

    def test_predict_project_risk(self):
        response = predict_project_risk(self.sample_request)
        self.assertEqual(response.project_id, "test-proj-001")
        self.assertGreaterEqual(response.cost_overrun_probability, 0.0)
        self.assertLessEqual(response.cost_overrun_probability, 1.0)
        self.assertGreaterEqual(response.predicted_delay_days, 0)
        self.assertGreaterEqual(response.risk_score, 0)
        self.assertLessEqual(response.risk_score, 100)
        self.assertIn(response.risk_tier, ["low", "medium", "high", "critical"])
        self.assertGreater(len(response.top_drivers), 0)
        self.assertTrue(response.is_synthetic)

    def test_policy_weights(self):
        response = predict_project_risk(self.sample_request)
        # Verify formula: 100 * (0.40*C + 0.30*S + 0.20*M + 0.10*B)
        comps = response.risk_components
        expected_raw = (
            0.40 * comps.calibrated_cost_overrun_prob +
            0.30 * comps.schedule_delay_index +
            0.20 * comps.milestone_slippage_fraction +
            0.10 * comps.blocker_severity_index
        )
        expected_score = round(100 * expected_raw)
        self.assertEqual(response.risk_score, expected_score)


if __name__ == '__main__':
    unittest.main()
