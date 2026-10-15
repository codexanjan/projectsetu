from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ObservationInput(BaseModel):
    reporting_period: str # YYYY-MM
    cumulative_expenditure_paise: int
    physical_progress_pct: float
    planned_progress_pct: float
    has_blockers: bool = False
    evidence_count: int = 0

class PredictRequest(BaseModel):
    project_id: str
    sector: str
    original_cost_paise: int
    original_duration_days: int
    elapsed_days: int
    latest_observation: ObservationInput
    milestone_slippage_fraction: float = Field(0.0, ge=0.0, le=1.0)
    blocker_severity_index: float = Field(0.0, ge=0.0, le=1.0)
    policy_version: Optional[str] = "v1.0.0-mospi"

class FeatureDriver(BaseModel):
    feature_key: str
    feature_label: str
    feature_value: Any
    impact_score: float # SHAP or tree contribution
    direction: str # 'increases_risk' | 'decreases_risk' | 'neutral'
    plain_language_summary: str

class RiskComponents(BaseModel):
    calibrated_cost_overrun_prob: float
    schedule_delay_index: float
    milestone_slippage_fraction: float
    blocker_severity_index: float

class PredictResponse(BaseModel):
    project_id: str
    as_of_date: str
    model_version: str
    policy_version: str
    assessment_mode: str
    cost_overrun_probability: float
    predicted_delay_days: int
    predicted_cost_escalation_paise: int
    prediction_interval: Dict[str, Any]
    risk_score: int
    risk_tier: str
    risk_components: RiskComponents
    top_drivers: List[FeatureDriver]
    data_quality_status: str
    data_quality_notes: List[str]
    out_of_distribution_warnings: List[str]
    is_synthetic: bool = True
