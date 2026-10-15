"""
Synthetic Demonstration Data Generator for ProjectSetu (MoSPI SIH26103)
=======================================================================
Generates ~200 realistic Indian public infrastructure projects across 8 sectors
and 28 states/UTs, with monthly historical observations (~24 months).
Includes:
- Completed projects with known final delay and cost-overrun outcomes
- Active projects with unknown future outcomes
- Stale updates and missing evidence examples
- Labeling on every record: is_synthetic = True
"""

import json
import os
import random
from datetime import datetime, timedelta

# Fixed seed for 100% reproducible demonstration data
RANDOM_SEED = 2026103
random.seed(RANDOM_SEED)

SECTORS = [
    'Roads & Highways',
    'Railways',
    'Power & Renewable Energy',
    'Water & Sanitation',
    'Urban Infrastructure',
    'Health & Education',
    'Ports & Shipping',
    'Telecom'
]

STATES = [
    ('Maharashtra', 'Mumbai', 19.0760, 72.8777),
    ('Gujarat', 'Ahmedabad', 23.0225, 72.5714),
    ('Uttar Pradesh', 'Lucknow', 26.8467, 80.9462),
    ('Tamil Nadu', 'Chennai', 13.0827, 80.2707),
    ('Karnataka', 'Bengaluru', 12.9716, 77.5946),
    ('Delhi', 'New Delhi', 28.6139, 77.2090),
    ('Madhya Pradesh', 'Bhopal', 23.2599, 77.4126),
    ('Odisha', 'Bhubaneswar', 20.2961, 85.8245),
    ('West Bengal', 'Kolkata', 22.5726, 88.3639),
    ('Rajasthan', 'Jaipur', 26.9124, 75.7873),
    ('Assam', 'Guwahati', 26.1445, 91.7362),
    ('Kerala', 'Thiruvananthapuram', 8.5241, 76.9366)
]

AGENCIES = [
    ('NHAI', 'National Highways Authority of India'),
    ('RVNL', 'Rail Vikas Nigam Limited'),
    ('NTPC', 'NTPC Limited - Green Energy'),
    ('JJM', 'Jal Jeevan Mission State Directorate'),
    ('NBCC', 'NBCC (India) Limited'),
    ('CPWD', 'Central Public Works Department'),
    ('PGCIL', 'Power Grid Corporation of India')
]

BLOCKER_TYPES = [
    'land_acquisition',
    'environmental_clearance',
    'utility_shifting',
    'fund_delay',
    'contractor_dispute',
    'weather_calamity',
    'design_revision'
]

def generate_dataset(num_projects=200):
    projects = []
    all_observations = []
    dataset_records = []

    start_date_base = datetime(2022, 1, 1)

    for i in range(1, num_projects + 1):
        sector = random.choice(SECTORS)
        agency_code, agency_name = random.choice(AGENCIES)
        state, district, lat, lng = random.choice(STATES)
        
        # Jitter coordinates slightly
        proj_lat = lat + random.uniform(-0.3, 0.3)
        proj_lng = lng + random.uniform(-0.3, 0.3)

        # Cost in Crores (from 50 Cr to 3500 Cr)
        orig_cost_cr = round(random.uniform(50, 3500), 2)
        orig_cost_paise = int(orig_cost_cr * 10_000_000 * 100)

        # Duration in months (12 to 48 months)
        duration_months = random.randint(18, 48)
        planned_start = start_date_base + timedelta(days=random.randint(0, 400))
        planned_end = planned_start + timedelta(days=duration_months * 30)

        # 60% completed projects (to train labels), 40% active projects
        is_completed = (i <= int(num_projects * 0.60))

        # True underlying risk factor
        underlying_risk_factor = random.betavariate(2, 3) # [0, 1] skewed
        
        # Outcome:
        # Delay in days
        if is_completed:
            actual_delay_days = max(0, int(underlying_risk_factor * duration_months * 30 * random.uniform(0.3, 1.8)))
            # Cost overrun
            cost_overrun_pct = max(0.0, underlying_risk_factor * random.uniform(0.05, 0.65))
            final_cost_paise = int(orig_cost_paise * (1 + cost_overrun_pct))
            cost_overrun_label = 1 if cost_overrun_pct >= 0.10 else 0
        else:
            actual_delay_days = None
            cost_overrun_pct = None
            final_cost_paise = None
            cost_overrun_label = None

        proj_code = f"{agency_code}-{planned_start.year}-{str(i).zfill(3)}"
        project_name = f"{state} {sector} Package #{i}"
        if i == 1:
            project_name = "Coastal Water Supply Expansion"
            sector = "Water & Sanitation"
        elif i == 2:
            project_name = "Regional Rail Connectivity Upgrade"
            sector = "Railways"
        elif i == 3:
            project_name = "District Hospital Modernization"
            sector = "Health & Education"
        elif i == 4:
            project_name = "Rural Transmission Corridor"
            sector = "Power & Renewable Energy"
        elif i == 5:
            project_name = "Urban Flood Mitigation Works"
            sector = "Urban Infrastructure"
        elif i == 6:
            project_name = "National Highway Bypass & Elevated Corridor"
            sector = "Roads & Highways"

        # Monthly observations
        obs_count = min(duration_months + (random.randint(0, 12) if is_completed else 0), 24)
        curr_cum_exp = 0
        curr_phys_prog = 0.0

        project_obs = []

        for m in range(1, obs_count + 1):
            obs_date = planned_start + timedelta(days=m * 30)
            rep_period = obs_date.strftime("%Y-%m")

            # Planned progress curve (S-curve approximation)
            t = m / duration_months
            planned_prog_pct = min(100.0, max(0.0, round(100 / (1 + pow(2.718, -6 * (t - 0.5))), 1)))

            # Actual physical progress increment
            # Affected by risk factor and blockers
            step_factor = max(0.1, 1.0 - (underlying_risk_factor * 0.7) + random.uniform(-0.15, 0.15))
            exp_factor = 1.0 + (underlying_risk_factor * 0.5) + random.uniform(-0.1, 0.2)

            inc_prog = (100.0 / duration_months) * step_factor
            curr_phys_prog = min(100.0 if is_completed and m == obs_count else 95.0, curr_phys_prog + inc_prog)

            # Expenditure
            monthly_exp = (orig_cost_paise / duration_months) * exp_factor
            curr_cum_exp += int(monthly_exp)

            # Blockers
            has_blocker = (random.random() < (0.2 + 0.5 * underlying_risk_factor))
            blockers = []
            if has_blocker:
                b_type = random.choice(BLOCKER_TYPES)
                blockers.append(b_type)

            obs_record = {
                "observation_id": f"obs-{proj_code}-{m}",
                "project_id": f"proj-{i}",
                "reporting_period": rep_period,
                "month_index": m,
                "cumulative_expenditure_paise": curr_cum_exp,
                "physical_progress_pct": round(curr_phys_prog, 2),
                "planned_progress_pct": planned_prog_pct,
                "has_blockers": 1 if has_blocker else 0,
                "blocker_types": blockers,
                "evidence_count": random.randint(1, 4) if random.random() > 0.15 else 0,
                "approval_status": "approved",
                "is_synthetic": True
            }
            project_obs.append(obs_record)
            all_observations.append(obs_record)

            # Form feature dataset row for this observation snapshot if completed (for training)
            if is_completed and m >= 4:
                # Features calculated at this historical cutoff
                exp_ratio = curr_cum_exp / orig_cost_paise
                prog_gap = planned_prog_pct - curr_phys_prog
                elapsed_ratio = m / duration_months

                dataset_records.append({
                    "project_id": f"proj-{i}",
                    "sector": sector,
                    "original_cost_cr": orig_cost_cr,
                    "original_duration_months": duration_months,
                    "elapsed_months": m,
                    "elapsed_ratio": round(elapsed_ratio, 3),
                    "physical_progress_pct": round(curr_phys_prog, 2),
                    "planned_progress_pct": planned_prog_pct,
                    "progress_gap": round(prog_gap, 2),
                    "expenditure_ratio": round(exp_ratio, 3),
                    "has_blockers": 1 if has_blocker else 0,
                    "evidence_count": obs_record["evidence_count"],
                    # Targets
                    "target_cost_overrun_binary": cost_overrun_label,
                    "target_delay_days": actual_delay_days,
                    "is_synthetic": True
                })

        proj_summary = {
            "id": f"proj-{i}",
            "code": proj_code,
            "name": project_name,
            "sector": sector,
            "state": state,
            "district": district,
            "agency": agency_code,
            "original_cost_paise": orig_cost_paise,
            "planned_duration_months": duration_months,
            "planned_start": planned_start.strftime("%Y-%m-%d"),
            "planned_end": planned_end.strftime("%Y-%m-%d"),
            "is_completed": is_completed,
            "actual_delay_days": actual_delay_days,
            "cost_overrun_pct": cost_overrun_pct,
            "observations_count": len(project_obs),
            "is_synthetic": True
        }
        projects.append(proj_summary)

    os.makedirs("data", exist_ok=True)
    with open("data/synthetic_projects.json", "w") as f:
        json.dump(projects, f, indent=2)
    with open("data/synthetic_dataset_rows.json", "w") as f:
        json.dump(dataset_records, f, indent=2)

    print(f"Generated {len(projects)} synthetic infrastructure projects.")
    print(f"Generated {len(all_observations)} historical observations.")
    print(f"Generated {len(dataset_records)} training feature-snapshot rows from completed projects.")

if __name__ == "__main__":
    generate_dataset(200)
