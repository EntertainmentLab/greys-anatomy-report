# ================================================================
# MODEL FUNCTIONS
# ================================================================
# This file contains model creation, fitting, and analysis functions.
# ================================================================

# Load data configuration
# Data config is loaded by main config file

# ============================================================
# MODEL FACTORY FUNCTIONS
# ============================================================

# Create model factory function
lm_custom <- function(dv, wave, baseline_available = TRUE, individual_var = FALSE, flags = wave_flags_w2) {
  # Load data once
  # dt is already loaded in config file
  
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

# Create AME model factory function with heat index interaction
lm_ame <- function(dv, wave, baseline_available = TRUE, individual_var = FALSE, flags = wave_flags_w2) {
  # Load data once
  # dt is already loaded in config file
  
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

  # Build formula string with heat index interaction
  if (baseline_available && !is.null(dv_prev_wave)) {
      formula_str <- paste0(
          dv_wave, " ~ condition_w2 * avg_heat_index + ",
          dv_prev_wave, " + ",
          w1_controls_str
      )
  } else {
      formula_str <- paste0(
          dv_wave, " ~ condition_w2 * avg_heat_index + ",
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

# Function to extract AME results from a model
get_ame_results <- function(model, contrasts = c("treatment-control", "handoff-control", "treatment-handoff")) {
    library(emmeans)
    library(broom)
    
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
    
    # Apply contrasts and return as data frame
    contrasts_result <- contrast(emm, contrast_list)
    ame_df <- tidy(contrasts_result)
    
    # Clean up contrast names to match expected format
    ame_df$contrast <- gsub("treatment vs control", "treatment vs control", ame_df$contrast)
    ame_df$contrast <- gsub("handoff vs control", "handoff vs control", ame_df$contrast)
    ame_df$contrast <- gsub("handoff vs treatment", "handoff vs treatment", ame_df$contrast)
    
    return(ame_df)
}

# Function to extract AME contrasts with p-values for FDR correction
extract_ame_contrasts_with_pvalues <- function(model, outcome_label, wave_label) {
  tryCatch({
    library(marginaleffects)
    
    # Get estimated marginal means first
    emm_results <- avg_predictions(model, by = "condition_w2")
    
    # Manual contrast calculation to match emmeans exactly
    control_est <- emm_results[emm_results$condition_w2 == "control", "estimate"]
    handoff_est <- emm_results[emm_results$condition_w2 == "handoff", "estimate"]  
    treatment_est <- emm_results[emm_results$condition_w2 == "treatment", "estimate"]
    
    control_se <- emm_results[emm_results$condition_w2 == "control", "std.error"]
    handoff_se <- emm_results[emm_results$condition_w2 == "handoff", "std.error"]
    treatment_se <- emm_results[emm_results$condition_w2 == "treatment", "std.error"]
    
    # Calculate contrasts manually
    # Treatment vs Control
    treat_vs_control_est <- treatment_est - control_est
    treat_vs_control_se <- sqrt(treatment_se^2 + control_se^2)
    treat_vs_control_p <- 2 * (1 - pnorm(abs(treat_vs_control_est / treat_vs_control_se)))
    
    # Handoff vs Control  
    handoff_vs_control_est <- handoff_est - control_est
    handoff_vs_control_se <- sqrt(handoff_se^2 + control_se^2)
    handoff_vs_control_p <- 2 * (1 - pnorm(abs(handoff_vs_control_est / handoff_vs_control_se)))
    
    # Handoff vs Treatment
    handoff_vs_treatment_est <- handoff_est - treatment_est
    handoff_vs_treatment_se <- sqrt(handoff_se^2 + treatment_se^2)
    handoff_vs_treatment_p <- 2 * (1 - pnorm(abs(handoff_vs_treatment_est / handoff_vs_treatment_se)))
    
    # Create data frame with all three contrasts
    contrast_df <- data.frame(
      outcome = rep(outcome_label, 3),
      wave = rep(wave_label, 3),
      contrast_clean = c("Treatment vs. Control", "Handoff vs. Control", "Handoff vs. Treatment"),
      estimate = c(treat_vs_control_est, handoff_vs_control_est, handoff_vs_treatment_est),
      std.error = c(treat_vs_control_se, handoff_vs_control_se, handoff_vs_treatment_se),
      p.value = c(treat_vs_control_p, handoff_vs_control_p, handoff_vs_treatment_p),
      stringsAsFactors = FALSE
    )
    
    return(contrast_df)
    
  }, error = function(e) {
    cat("Error in extract_ame_contrasts_with_pvalues for", outcome_label, wave_label, ":", e$message, "\n")
    return(NULL)
  })
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
