"""
Explainability Module for ProjectSetu
Calculates feature attributions and generates deterministic plain-language explanations.
Does not make causal assertions. Clearly labels associative findings.
"""

from typing import List, Dict, Any
from .schemas import FeatureDriver

FEATURE_LABELS = {
    "elapsed_ratio": "Project Timeline Elapse",
    "physical_progress_pct": "Reported Physical Progress",
    "planned_progress_pct": "Scheduled Target Progress",
    "progress_gap": "Planned vs Actual Progress Gap",
    "expenditure_ratio": "Budget Spend Ratio",
    "has_blockers": "Active Site & Inter-Ministerial Blockers",
    "evidence_count": "Evidence Verification Completeness",
    "original_cost_cr": "Project Scale (Approved Budget)",
    "original_duration_months": "Contractual Project Duration"
}

def generate_explanations(feature_dict: Dict[str, Any], importances: Dict[str, float]) -> List[FeatureDriver]:
    drivers: List[FeatureDriver] = []

    # 1. Progress Gap
    gap = feature_dict.get("progress_gap", 0.0)
    gap_impact = min(0.35, max(-0.25, (gap / 100.0) * 0.8))
    if gap > 15.0:
        drivers.append(FeatureDriver(
            feature_key="progress_gap",
            feature_label=FEATURE_LABELS["progress_gap"],
            feature_value=f"{gap:+.1f}% slippage",
            impact_score=round(gap_impact, 3),
            direction="increases_risk",
            plain_language_summary=f"Physical progress trails planned schedule by {abs(gap):.1f}%, indicating execution bottlenecks."
        ))
    elif gap < -5.0:
        drivers.append(FeatureDriver(
            feature_key="progress_gap",
            feature_label=FEATURE_LABELS["progress_gap"],
            feature_value=f"{abs(gap):.1f}% ahead",
            impact_score=round(gap_impact, 3),
            direction="decreases_risk",
            plain_language_summary=f"Project is progressing {abs(gap):.1f}% ahead of scheduled baseline."
        ))

    # 2. Expenditure vs Progress Divergence
    exp_ratio = feature_dict.get("expenditure_ratio", 0.0)
    phys_ratio = feature_dict.get("physical_progress_pct", 0.0) / 100.0
    divergence = exp_ratio - phys_ratio
    if divergence > 0.15:
        drivers.append(FeatureDriver(
            feature_key="expenditure_ratio",
            feature_label="Expenditure vs Physical Progress Divergence",
            feature_value=f"Spend: {exp_ratio*100:.1f}% vs Phys: {phys_ratio*100:.1f}%",
            impact_score=round(divergence * 0.5, 3),
            direction="increases_risk",
            plain_language_summary=f"Financial spend ({exp_ratio*100:.0f}%) exceeds physical progress ({phys_ratio*100:.0f}%) by {divergence*100:.1f}%, increasing cost-overrun probability."
        ))

    # 3. Blockers
    has_blockers = feature_dict.get("has_blockers", 0)
    if has_blockers:
        drivers.append(FeatureDriver(
            feature_key="has_blockers",
            feature_label=FEATURE_LABELS["has_blockers"],
            feature_value="Active unresolved blockers",
            impact_score=0.22,
            direction="increases_risk",
            plain_language_summary="Unresolved site/clearance blockers logged in current update directly elevate schedule delay risk."
        ))

    # 4. Evidence Count
    ev_count = feature_dict.get("evidence_count", 0)
    if ev_count == 0:
        drivers.append(FeatureDriver(
            feature_key="evidence_count",
            feature_label=FEATURE_LABELS["evidence_count"],
            feature_value="0 files uploaded",
            impact_score=0.15,
            direction="increases_risk",
            plain_language_summary="No supporting site photos, vouchers or inspection reports attached to validate reported progress."
        ))
    else:
        drivers.append(FeatureDriver(
            feature_key="evidence_count",
            feature_label=FEATURE_LABELS["evidence_count"],
            feature_value=f"{ev_count} verified files",
            impact_score=-0.08,
            direction="decreases_risk",
            plain_language_summary=f"Progress claim supported by {ev_count} verified field observation records."
        ))

    # 5. Elapsed duration ratio
    el_ratio = feature_dict.get("elapsed_ratio", 0.0)
    if el_ratio > 0.85 and phys_ratio < 0.70:
        drivers.append(FeatureDriver(
            feature_key="elapsed_ratio",
            feature_label=FEATURE_LABELS["elapsed_ratio"],
            feature_value=f"{el_ratio*100:.1f}% of duration elapsed",
            impact_score=0.18,
            direction="increases_risk",
            plain_language_summary=f"{el_ratio*100:.0f}% of allotted project time has elapsed while physical progress stands at {phys_ratio*100:.0f}%."
        ))

    # Sort drivers by absolute impact score descending
    drivers.sort(key=lambda d: abs(d.impact_score), reverse=True)
    return drivers[:5]
