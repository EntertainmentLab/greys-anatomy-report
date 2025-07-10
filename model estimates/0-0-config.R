# ================================================================
# CONFIGURATION FILE FOR ALL ANALYSES
# ================================================================
# This file contains all shared configurations, model specifications,
# and helper functions. It replaces global environment assignment
# with a factory pattern for better maintainability.
# ================================================================
source("../Greys-Anatomy/data/libraries.R")
source("model estimates/0-0-data-config.R")
source("model estimates/0-0-model-functions.R")
source("model estimates/0-0-html-utils.R")
source("model estimates/0-0-helpers.R")

# Load data
dt <- readRDS("../Greys-Anatomy/data/1-Data/processed_data/complete_data_for_analysis.rds")
dt <- dt[wave_2_analysis_ready == TRUE & wave_3_analysis_ready == TRUE,]
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
# HTML STYLING TEMPLATE
# ============================================================
get_html_style <- function() {
    return(paste0(
        "body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; margin: 40px auto; max-width: 1200px; background-color: white; color: #333; }\n",
        "h1 { font-size: 18pt; font-weight: bold; text-align: center; margin: 20px 0 30px 0; color: #000; }\n",
        "h2 { font-size: 14pt; font-weight: bold; margin: 30px 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; }\n",
        "h3 { font-size: 11pt; font-weight: bold; margin: 25px 0 10px 0; color: #333; background-color: #f5f5f5; padding: 5px; border-bottom: 1px solid #ddd; }\n",
        "table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11pt; }\n",
        "th { background-color: white; color: #000; padding: 8px 6px; text-align: center; font-weight: bold; border-top: 2px solid #000; border-bottom: 1px solid #000; }\n",
        "th.main-header { border-bottom: none; }\n",
        "th.sub-header { font-size: 10pt; border-top: none; border-bottom: 1px solid #000; font-style: italic; }\n",
        "td { padding: 6px 6px; text-align: center; vertical-align: top; border: none; font-size: 10pt; }\n",
        "tr:last-child td { border-bottom: 1px solid #ccc; }\n",
        ".outcome-col { text-align: left; font-weight: normal; min-width: 180px; }\n",
        ".ci { font-size: 9pt; color: #666; font-style: italic; }\n",
        ".fdr { font-size: 8pt; color: #888; font-style: italic; }\n",
        ".note { margin-top: 15px; font-size: 10pt; line-height: 1.3; }\n",
        ".note-title { font-style: italic; }\n",
        ".section-break { margin-top: 40px; }\n",
        ".category-row { background-color: #f5f5f5; font-weight: bold; border-top: 1px solid #ccc; }\n",
        ".category-row td { text-align: left; }\n",
        ".purpose { margin-bottom: 30px; font-size: 11pt; line-height: 1.4; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; }\n",
        ".purpose-title { font-weight: bold; margin-bottom: 10px; }\n",
        ".subtitle { text-align: center; font-size: 12pt; font-weight: normal; margin-top: 0; margin-bottom: 30px; color: #444; border-bottom: none; padding-bottom: 0; }\n",
        "/* Border styles for improved table readability */\n",
        ".contrast-border { border-left: 1px solid #ccc; position: relative; z-index: 20; }\n", 
        ".wave-border { border-left: none; }\n", 
        ".subgroup-border { border-left: none; }\n",
        ".immediate-section { background-color: #fcfcfc; }\n",
        ".followup-section { background-color: #f2f2f2; }\n", 
        "tr.category-row td { position: relative; z-index: 5; }\n", 
        "th, td { position: relative; }\n", 
        "td.contrast-border, th.contrast-border { border-left: 1px solid #ccc !important; }\n" 
    ))
}

# ============================================================
# COMMON HTML GENERATION FUNCTIONS
# ============================================================
create_html_header <- function(title, subtitle = NULL) {
    html_content <- paste0(
        "<!DOCTYPE html>\n<html>\n<head>\n<meta charset='utf-8'>\n",
        "<title>", title, "</title>\n",
        "<style>\n", get_html_style(), "</style>\n</head>\n<body>\n",
        "<h1>", title, "</h1>\n"
    )
    
    if (!is.null(subtitle)) {
        html_content <- paste0(
            html_content,
            "<h2 class='subtitle'>",
            subtitle, "</h2>\n"
        )
    }
    
    return(html_content)
}

create_html_footer <- function(note_text) {
    return(paste0(
        "<div class='note'>\n",
        "<span class='note-title'>Note:</span> ",
        note_text, "\n",
        "</div>\n",
        "</body>\n</html>"
    ))
}

# ============================================================
# COMMON UTILITY FUNCTIONS
# ============================================================
add_significance_stars <- function(p_values) {
    case_when(
        p_values < 0.001 ~ "***",
        p_values < 0.01 ~ "**", 
        p_values < 0.05 ~ "*",
        p_values < 0.1 ~ "†",
        TRUE ~ ""
    )
}

format_estimate_with_ci <- function(estimate, std_error, p_value, use_fdr = FALSE, fdr_p = NULL) {
    ci_lower <- estimate - 1.96 * std_error
    ci_upper <- estimate + 1.96 * std_error
    
    if (use_fdr && !is.null(fdr_p)) {
        stars <- add_significance_stars(fdr_p)
        fdr_text <- paste0("<br><span class='fdr'>FDR p = ", sprintf("%.2f", fdr_p), "</span>")
    } else {
        stars <- add_significance_stars(p_value)
        fdr_text <- ""
    }
    
    return(paste0(
        sprintf("%.2f", estimate), stars, "<br><span class='ci'>",
        "(", sprintf("%.2f", ci_lower), ", ", sprintf("%.2f", ci_upper), ")</span>",
        fdr_text
    ))
}

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

# ============================================================
# MODEL FACTORY FUNCTIONS
# ============================================================

# Create model factory function
lm_custom <- function(dv, wave, baseline_available = TRUE, individual_var = FALSE, flags = wave_flags_w2) {
  # Load data once
  dt <- readRDS("../Greys-Anatomy/data/1-Data/processed_data/complete_data_for_analysis.rds")
  
  # Convert control variables to strings for formula building
  w1_controls_str <- paste0(w1_controls, collapse = " + ")
  heatwave_w1_controls_scaled <- paste0(heatwave_w1_controls, "_scaled", collapse = " + ")
  
  flag_str <- paste(flags, collapse = " & ")

  if (individual_var) {
      dv_wave <- dv
      if (baseline_available) {
          dv_prev_wave <- sub(paste0("w", wave), "w1", dv)
      } else {
          dv_prev_wave <- NULL
      }
  } else {
      dv_wave <- paste0(dv, "_w", wave)
      dv_prev_wave <- paste0(dv, "_w1")
  }

  # Build formula string
  if (baseline_available) {
      formula_str <- paste0(
          dv_wave, " ~ condition_w2 + ",
          dv_prev_wave, " + ",
          w1_controls_str
      )
  } else {
      formula_str <- paste0(
          dv_wave, " ~ condition_w2 + ",
          heatwave_w1_controls_scaled, " + ",
          w1_controls_str
      )
  }

  # Subset data based on flags
  data_sub <- dt[eval(parse(text = flag_str)), ]

  # Ensure condition_w2 is a factor
  if ("condition_w2" %in% names(data_sub)) {
      data_sub[["condition_w2"]] <- factor(data_sub[["condition_w2"]])
  }

  lm(formula = as.formula(formula_str), data = data_sub)
}

# Generic model fitting function
fit_models_from_configs <- function(configs, wave, flags) {
    lapply(configs, function(config) {
      if (config$individual) {
        if (wave == 2) {
          dv_name <- config$dv
        } else {
          dv_name <- gsub("_w2_scaled", "_w3_scaled", config$dv)
        }
      } else {
        dv_name <- gsub("_w[23]_scaled", "", config$dv)
      }
      
      lm_custom(
        dv = dv_name,
        wave = wave,
        baseline_available = config$baseline,
        individual_var = config$individual,
        flags = flags
      )
    })
  }

# Enhanced model factory that returns structured model objects
create_models <- function(configs, wave, flags) {
  models <- fit_models_from_configs(configs, wave, flags)
  
  # Return structured list instead of assigning to global environment
  return(models)
}

# Factory function for all analysis models
create_all_models <- function() {
  # Create all model groups
  models <- list(
    high_level = list(
      w2 = create_models(high_level_configs, 2, wave_flags_w2),
      w3 = create_models(high_level_configs, 3, wave_flags_w3)
    ),
    threat_severity = list(
      w2 = create_models(threat_severity_configs, 2, wave_flags_w2),
      w3 = create_models(threat_severity_configs, 3, wave_flags_w3)
    ),
    threat_health = list(
      w2 = create_models(threat_health_configs, 2, wave_flags_w2),
      w3 = create_models(threat_health_configs, 3, wave_flags_w3)
    ),
    impact_knowledge = list(
      w2 = create_models(impact_knowledge_configs, 2, wave_flags_w2),
      w3 = create_models(impact_knowledge_configs, 3, wave_flags_w3)
    ),
    heat_policy = list(
      w2 = create_models(heat_policy_configs, 2, wave_flags_w2),
      w3 = create_models(heat_policy_configs, 3, wave_flags_w3)
    ),
    healthcare_responsibility = list(
      w2 = create_models(healthcare_responsibility_configs, 2, wave_flags_w2),
      w3 = create_models(healthcare_responsibility_configs, 3, wave_flags_w3)
    ),
    climate_personal = list(
      w2 = create_models(climate_personal_configs, 2, wave_flags_w2),
      w3 = create_models(climate_personal_configs, 3, wave_flags_w3)
    ),
    climate_action = list(
      w2 = create_models(climate_action_configs, 2, wave_flags_w2),
      w3 = create_models(climate_action_configs, 3, wave_flags_w3)
    ),
    individual_matrix = list(
      w2 = create_individual_matrix_models(2, wave_flags_w2),
      w3 = create_individual_matrix_models(3, wave_flags_w3)
    )
  )
  
  return(models)
}

# Helper function for individual matrix models
create_individual_matrix_models <- function(wave, flags) {
  # Individual matrix item configurations
  matrix_configs <- list(
    # Knowledge Matrix Items
    list(dv = "heatwaves_knowledge_organ_failure_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_knowledge_violent_crime_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_knowledge_cancer_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_knowledge_premature_labor_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_knowledge_heart_attacks_w2_scaled", individual = TRUE, baseline = TRUE),
    # Health Worry Items
    list(dv = "heatwaves_health_worry_death_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_health_worry_heat_stroke_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_health_worry_worsening_conds_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_health_worry_dehydration_w2_scaled", individual = TRUE, baseline = TRUE),
    # System Impacts Items
    list(dv = "heatwaves_system_impacts_overcrowding_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_system_impacts_surgery_cancellation_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_system_impacts_er_visits_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_system_impacts_resource_shortage_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_system_impacts_response_times_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_system_impacts_losing_power_w2_scaled", individual = TRUE, baseline = TRUE),
    # Worry Items
    list(dv = "heatwaves_worry_personal_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_worry_family_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_worry_community_w2_scaled", individual = TRUE, baseline = TRUE),
    # Harm Items
    list(dv = "heatwaves_harm_personal_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_harm_family_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_harm_community_w2_scaled", individual = TRUE, baseline = TRUE),
    # Behavioral Intentions Items
    list(dv = "heatwaves_behavioral_intentions_take_precautions_w2_scaled", individual = TRUE, baseline = TRUE),
    list(dv = "heatwaves_behavioral_intentions_check_on_vulnerable_w2_scaled", individual = TRUE, baseline = TRUE),
    # Policy Support Items
    list(dv = "policy_support_cooling_centers_w2_scaled", individual = TRUE, baseline = FALSE),
    list(dv = "policy_support_government_investment_w2_scaled", individual = TRUE, baseline = FALSE)
  )
  
  return(create_models(matrix_configs, wave, flags))
}

# ============================================================
# MODEL ACCESS HELPER FUNCTIONS
# ============================================================

# Function to extract contrasts from a model
get_contrasts <- function(model, contrasts = c("treatment-control", "handoff-control", "treatment-handoff")) {
    library(emmeans)
    
    # Get estimated marginal means
    emm <- emmeans(model, ~ condition_w2)
    
    # Define contrast matrix
    contrast_list <- list()
    if ("treatment-control" %in% contrasts) {
        contrast_list[["treatment vs control"]] <- c(control = -1, handoff = 0, treatment = 1)
    }
    if ("handoff-control" %in% contrasts) {
        contrast_list[["handoff vs control"]] <- c(control = -1, handoff = 1, treatment = 0)
    }
    if ("treatment-handoff" %in% contrasts) {
        contrast_list[["handoff vs treatment"]] <- c(control = 0, handoff = 1, treatment = -1)
    }
    
    # Apply contrasts
    contrast(emm, contrast_list)
}

# Get component model groups and labels (used across multiple analysis scripts)
get_component_model_groups <- function(models, wave) {
    list(
        get_models(models, "threat_severity", wave),
        get_models(models, "threat_health", wave),
        get_models(models, "impact_knowledge", wave),
        get_models(models, "heat_policy", wave),
        get_models(models, "healthcare_responsibility", wave),
        get_models(models, "climate_personal", wave),
        get_models(models, "climate_action", wave)
    )
}

# Get component label groups
get_component_label_groups <- function() {
    list(
        get_labels("threat_severity"), get_labels("threat_health"), get_labels("impact_knowledge"),
        get_labels("heat_policy"), get_labels("healthcare_responsibility"),
        get_labels("climate_personal"), get_labels("climate_action")
    )
}

# Get component section names
get_component_section_names <- function() {
    c(
        "Threat Severity Components", "Threat Health Impact Components", "Impact Knowledge Components",
        "Heat Policy Support Components", "Healthcare Responsibility Components",
        "Climate Personal Impact Components", "Climate Support for Action Components"
    )
}

# Get models by category and wave
get_models <- function(models, category, wave = NULL) {
  if (is.null(wave)) {
    return(models[[category]])
  } else {
    wave_key <- paste0("w", wave)
    return(models[[category]][[wave_key]])
  }
}

# Get model labels by category
get_labels <- function(category) {
  switch(category,
    "high_level" = high_level_dv_labels,
    "threat_severity" = threat_severity_labels,
    "threat_health" = threat_health_labels,
    "impact_knowledge" = impact_knowledge_labels,
    "heat_policy" = heat_policy_labels,
    "healthcare_responsibility" = healthcare_responsibility_labels,
    "climate_personal" = climate_personal_labels,
    "climate_action" = climate_action_labels,
    "individual_matrix" = individual_labels,
    stop("Unknown category: ", category)
  )
}
