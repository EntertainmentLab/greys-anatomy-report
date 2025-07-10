# ================================================================
# DATA CONFIGURATION FILE
# ================================================================
# This file contains all data definitions, labels, flags, and 
# model configurations. Pure data - no functions.
# ================================================================

# ============================================================
# WAVE FLAGS
# ============================================================
wave_flags_w2 <- c(
    "careless_flag_w1 == FALSE",
    "attention_flag_w1 == FALSE", 
    "viewership_logic_flag_w1 == FALSE",
    "indee_flag_adjusted_w2 == FALSE",
    "no_data_w1_flag == FALSE",
    "no_data_w2_flag == FALSE"
)

wave_flags_w3 <- c(
    "careless_flag_w1 == FALSE",
    "attention_flag_w1 == FALSE", 
    "viewership_logic_flag_w1 == FALSE",
    "indee_flag_adjusted_w2 == FALSE",
    "no_data_w1_flag == FALSE",
    "no_data_w3_flag == FALSE"
)

# ============================================================
# CONTROL VARIABLES
# ============================================================
w1_controls <- c(
    "demos_pol_orient_w1", "demos_social_trust_w1", "demos_hospitalized_w1",
    "demos_chronic_conditions_w1", "demos_heat_sensitivity_w1", "demos_heatwave_exp_w1",
    "sassy_segment_w1", "demos_news_exposure_w1", "viewership_greys_anatomy_general_w1",
    "viewership_greys_anatomy_season21_w1", "entertainment_seen_episode_w2"
)

heatwave_w1_controls <- c(
    "heatwaves_worry_personal_w1", "heatwaves_worry_family_w1", "heatwaves_worry_community_w1",
    "heatwaves_harm_personal_w1", "heatwaves_harm_family_w1", "heatwaves_harm_community_w1",
    "heatwaves_behavioral_intentions_take_precautions_w1", "heatwaves_behavioral_intentions_check_on_vulnerable_w1",
    "heatwaves_health_worry_death_w1", "heatwaves_health_worry_heat_stroke_w1", "heatwaves_health_worry_worsening_conds_w1", "heatwaves_health_worry_dehydration_w1",
    "heatwaves_system_impacts_overcrowding_w1", "heatwaves_system_impacts_surgery_cancellation_w1", "heatwaves_system_impacts_er_visits_w1", "heatwaves_system_impacts_resource_shortage_w1", "heatwaves_system_impacts_response_times_w1", "heatwaves_system_impacts_losing_power_w1",
    "heatwaves_knowledge_organ_failure_w1", "heatwaves_knowledge_violent_crime_w1", "heatwaves_knowledge_cancer_w1", "heatwaves_knowledge_premature_labor_w1", "heatwaves_knowledge_heart_attacks_w1",
    "heatwaves_self_efficacy_w1"
)

# String versions for formula building
w1_controls_str <- paste0(w1_controls, collapse = " + ")
heatwave_w1_controls_scaled <- paste0(heatwave_w1_controls, "_scaled", collapse = " + ")

# ============================================================
# LABELS FOR HIGH-LEVEL CONSTRUCTS
# ============================================================
high_level_dv_labels <- c(
    "Heatwave Likelihood of Exposure",
    "Heatwave Threat Severity", 
    "Heatwave Threat Health Impact",
    "Heatwave Impact Knowledge",
    "Heat and Policy Support",
    "Healthcare Worker Responsibility",
    "Climate Change Personal Impact",
    "Climate Change Support for Action"
)

# ============================================================
# LABELS FOR INDIVIDUAL COMPONENTS
# ============================================================
threat_severity_labels <- c(
    "Heatwave Worry Score",
    "Heatwave Harm Score", 
    "Behavioral Intentions Score"
)

threat_health_labels <- c(
    "Health Worry Score",
    "System Impacts Score",
    "Worry about Medical Access"
)

impact_knowledge_labels <- c(
    "Knowledge Matrix Score",
    "Self-Efficacy",
    "Lower Body Temperature Knowledge",
    "Health Risk Knowledge"
)

heat_policy_labels <- c(
    "Policy Supports Score",
    "Tax Increase Support"
)

healthcare_responsibility_labels <- c(
    "HW Responsibility to Public",
    "HW Responsibility to Policy Makers"
)

climate_personal_labels <- c(
    "Climate Heat Attribution",
    "Temporal Proximity of Climate Impact", 
    "Social Norms about Climate Impacts"
)

climate_action_labels <- c(
    "Normative Beliefs on Climate Action",
    "Support Government Action",
    "Action Intention",
    "Receive Information",
    "Audience Demand for Climate Content"
)

# ============================================================
# INDIVIDUAL MATRIX ITEMS LABELS AND CATEGORIES
# ============================================================
individual_labels <- c(
    # Knowledge Matrix Items
    "Organ Failure Knowledge", "Violent Crime Knowledge", "Cancer Knowledge", 
    "Premature Labor Knowledge", "Heart Attacks Knowledge",
    # Health Worry Items
    "Health Worry: Death", "Health Worry: Heat Stroke", "Health Worry: Worsening Conditions", "Health Worry: Dehydration",
    # System Impacts Items
    "System Impact: Overcrowding", "System Impact: Surgery Cancellation", "System Impact: ER Visits",
    "System Impact: Resource Shortage", "System Impact: Response Times", "System Impact: Losing Power",
    # Worry Items
    "Worry: Personal", "Worry: Family", "Worry: Community",
    # Harm Items
    "Harm: Personal", "Harm: Family", "Harm: Community",
    # Behavioral Intentions Items
    "Intentions: Take Precautions", "Intentions: Check on Vulnerable",
    # Policy Support Items
    "Policy: Cooling Centers", "Policy: Government Investment"
)

matrix_categories <- c(
    rep("Knowledge Matrix Items", 5),
    rep("Health Worry Items", 4),
    rep("System Impact Items", 6),
    rep("Worry Items", 3),
    rep("Harm Items", 3),
    rep("Behavioral Intentions Items", 2),
    rep("Policy Support Items", 2)
)

# ============================================================
# MODEL CONFIGURATIONS
# ============================================================

# High-level construct model configurations
high_level_configs <- list(
  list(dv = "heatwaves_likelihood_heatwave_w2_scaled", individual = TRUE, baseline = TRUE),
  list(dv = "threat_severity_score", individual = FALSE, baseline = TRUE),
  list(dv = "threat_health_impact_score", individual = FALSE, baseline = TRUE),
  list(dv = "impact_knowledge_full", individual = FALSE, baseline = TRUE),
  list(dv = "heat_policy_support_score", individual = FALSE, baseline = FALSE),
  list(dv = "healthcare_responsibility_score", individual = FALSE, baseline = FALSE),
  list(dv = "climate_personal_impact_score", individual = FALSE, baseline = TRUE),
  list(dv = "climate_support_for_action_score", individual = FALSE, baseline = TRUE)
)

# Individual component configurations
threat_severity_configs <- list(
    list(dv = "heatwave_worry_score", individual = FALSE, baseline = TRUE),
    list(dv = "heatwave_harm_score", individual = FALSE, baseline = TRUE),
    list(dv = "behavioral_intentions_score", individual = FALSE, baseline = TRUE)
)

threat_health_configs <- list(
    list(dv = "health_worry_score", individual = FALSE, baseline = TRUE),
    list(dv = "system_impacts_score", individual = FALSE, baseline = TRUE),
    list(dv = "heatwaves_worry_medical_access_w2_scaled", individual = TRUE, baseline = TRUE)
)

impact_knowledge_configs <- list(
    list(dv = "knowledge_matrix_score", individual = FALSE, baseline = TRUE),
    list(dv = "heatwaves_self_efficacy_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_lower_body_temp_w2_scaled", individual = TRUE, baseline = FALSE),
    list(dv = "heatwaves_health_risk_total_score_w2_scaled", individual = TRUE, baseline = FALSE)
)

heat_policy_configs <- list(
    list(dv = "policy_supports_score", individual = FALSE, baseline = FALSE),
    list(dv = "policy_support_tax_increase_w2_scaled", individual = TRUE, baseline = FALSE)
)

healthcare_responsibility_configs <- list(
    list(dv = "policy_support_responsibility_h_ps_public_w2_scaled", individual = TRUE, baseline = FALSE),
    list(dv = "policy_support_responsibility_h_ps_policy_makers_w2_scaled", individual = TRUE, baseline = FALSE)
)

climate_personal_configs <- list(
    list(dv = "climate_climate_heat_attribution_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "climate_temporal_proximity_timing_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "climate_social_norms_w2_scaled", individual = TRUE, baseline = TRUE)
)

climate_action_configs <- list(
    list(dv = "climate_normative_belief_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "climate_support_gov_action_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "climate_action_intention_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "climate_receive_info_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "climate_audience_demand_w2_scaled", individual = TRUE, baseline = TRUE)
)
