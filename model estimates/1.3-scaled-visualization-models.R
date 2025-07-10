# ============================================================
# SCALED VISUALIZATION MODELS FOR PLOTTING
# ============================================================
# This file creates models using scaled factor scores for visualization
# purposes, providing standardized effect sizes comparable across outcomes.
# Models include heat index interaction to match AME analysis.
# Results are saved as RDS for easy plotting later.

# Load configuration
source("model estimates/0-0-config.R")

# ============================================================
# GENERATE SCALED VISUALIZATION MODELS
# ============================================================

generate_scaled_viz_model <- function(dv, wave, baseline_available = TRUE, individual_var = FALSE, flags) {
  flag_str <- paste(flags, collapse = " & ")
  
  # Create scaled version of DV name
  if (individual_var) {
    dv_wave <- paste0(dv, "_scaled")
    if (baseline_available) {
      dv_prev <- sub(paste0("w", wave), "w1", dv_wave)
    } else {
      dv_prev <- NULL
    }
  } else {
    dv_wave <- paste0(dv, "_w", wave, "_scaled")
    if (baseline_available) {
      dv_prev <- paste0(dv, "_w1_scaled")
    } else {
      dv_prev <- NULL
    }
  }
  
  # Build control variables
  if (baseline_available) {
    controls <- w1_controls
  } else {
    controls <- c(paste0(heatwave_w1_controls, "_scaled"), w1_controls)
  }

  # Build formula string with heat index interaction
  if (baseline_available && !is.null(dv_prev)) {
    formula_str <- paste(
      dv_wave, "~ condition_w2 * avg_heat_index +",
      dv_prev, "+",
      paste(controls, collapse = " + ")
    )
  } else {
    formula_str <- paste(
      dv_wave, "~ condition_w2 * avg_heat_index +",
      paste(controls, collapse = " + ")
    )
  }

  data_sub <- dt[eval(parse(text = flag_str)), ]
  data_sub$condition_w2 <- factor(data_sub$condition_w2)

  lm(as.formula(formula_str), data = data_sub)
}

# ============================================================
# EXTRACT CONTRASTS FOR VISUALIZATION
# ============================================================

extract_viz_contrasts <- function(model, outcome_label, wave_label) {
  tryCatch({
    library(marginaleffects)
    
    # Get estimated marginal means
    emm_results <- avg_predictions(model, by = "condition_w2")
    
    # Extract estimates and standard errors
    control_est <- emm_results[emm_results$condition_w2 == "control", "estimate"]
    handoff_est <- emm_results[emm_results$condition_w2 == "handoff", "estimate"]  
    treatment_est <- emm_results[emm_results$condition_w2 == "treatment", "estimate"]
    
    control_se <- emm_results[emm_results$condition_w2 == "control", "std.error"]
    handoff_se <- emm_results[emm_results$condition_w2 == "handoff", "std.error"]
    treatment_se <- emm_results[emm_results$condition_w2 == "treatment", "std.error"]
    
    # Calculate contrasts
    treat_vs_control_est <- treatment_est - control_est
    treat_vs_control_se <- sqrt(treatment_se^2 + control_se^2)
    treat_vs_control_t <- treat_vs_control_est / treat_vs_control_se
    treat_vs_control_p <- 2 * (1 - pnorm(abs(treat_vs_control_t)))
    treat_vs_control_ci_lower <- treat_vs_control_est - 1.96 * treat_vs_control_se
    treat_vs_control_ci_upper <- treat_vs_control_est + 1.96 * treat_vs_control_se
    
    handoff_vs_control_est <- handoff_est - control_est
    handoff_vs_control_se <- sqrt(handoff_se^2 + control_se^2)
    handoff_vs_control_t <- handoff_vs_control_est / handoff_vs_control_se
    handoff_vs_control_p <- 2 * (1 - pnorm(abs(handoff_vs_control_t)))
    handoff_vs_control_ci_lower <- handoff_vs_control_est - 1.96 * handoff_vs_control_se
    handoff_vs_control_ci_upper <- handoff_vs_control_est + 1.96 * handoff_vs_control_se
    
    handoff_vs_treatment_est <- handoff_est - treatment_est
    handoff_vs_treatment_se <- sqrt(handoff_se^2 + treatment_se^2)
    handoff_vs_treatment_t <- handoff_vs_treatment_est / handoff_vs_treatment_se
    handoff_vs_treatment_p <- 2 * (1 - pnorm(abs(handoff_vs_treatment_t)))
    handoff_vs_treatment_ci_lower <- handoff_vs_treatment_est - 1.96 * handoff_vs_treatment_se
    handoff_vs_treatment_ci_upper <- handoff_vs_treatment_est + 1.96 * handoff_vs_treatment_se
    
    # Get sample size from model
    model_n <- length(model$residuals)
    
    # Create results data frame
    results <- data.frame(
      outcome = rep(outcome_label, 3),
      wave = rep(wave_label, 3),
      contrast = c("Treatment vs. Control", "Handoff vs. Control", "Handoff vs. Treatment"),
      estimate = c(treat_vs_control_est, handoff_vs_control_est, handoff_vs_treatment_est),
      std.error = c(treat_vs_control_se, handoff_vs_control_se, handoff_vs_treatment_se),
      t.value = c(treat_vs_control_t, handoff_vs_control_t, handoff_vs_treatment_t),
      p.value = c(treat_vs_control_p, handoff_vs_control_p, handoff_vs_treatment_p),
      ci_lower = c(treat_vs_control_ci_lower, handoff_vs_control_ci_lower, handoff_vs_treatment_ci_lower),
      ci_upper = c(treat_vs_control_ci_upper, handoff_vs_control_ci_upper, handoff_vs_treatment_ci_upper),
      n = rep(model_n, 3),
      stringsAsFactors = FALSE
    )
    
    return(results)
    
  }, error = function(e) {
    cat("Error in extract_viz_contrasts for", outcome_label, wave_label, ":", e$message, "\n")
    return(NULL)
  })
}

# ============================================================
# FIT SCALED VISUALIZATION MODELS
# ============================================================

# Define configurations for 8 high-level constructs only
high_level_configs_scaled <- list(
  list(dv = "heatwaves_likelihood_heatwave_w2", individual = TRUE, baseline = TRUE),
  list(dv = "threat_severity_score", individual = FALSE, baseline = TRUE),
  list(dv = "threat_health_impact_score", individual = FALSE, baseline = TRUE),
  list(dv = "impact_knowledge_full", individual = FALSE, baseline = TRUE),
  list(dv = "heat_policy_support_score", individual = FALSE, baseline = FALSE),
  list(dv = "healthcare_responsibility_score", individual = FALSE, baseline = FALSE),
  list(dv = "climate_personal_impact_score", individual = FALSE, baseline = TRUE),
  list(dv = "climate_support_for_action_score", individual = FALSE, baseline = TRUE)
)

# Function to fit scaled models
fit_scaled_viz_models <- function(configs, wave, flags) {
  lapply(configs, function(config) {
    # Use the base DV name
    if (config$individual) {
      dv_name <- config$dv
    } else {
      dv_name <- gsub("_score$", "_score", config$dv)
    }
    
    tryCatch({
      generate_scaled_viz_model(
        dv = dv_name,
        wave = wave,
        baseline_available = config$baseline,
        individual_var = config$individual,
        flags = flags
      )
    }, error = function(e) {
      cat("Error fitting scaled model for", dv_name, "wave", wave, ":", e$message, "\n")
      NULL
    })
  })
}

# Fit scaled models for both waves
scaled_viz_models_w2 <- fit_scaled_viz_models(high_level_configs_scaled, 2, wave_flags_w2)
scaled_viz_models_w3 <- fit_scaled_viz_models(high_level_configs_scaled, 3, wave_flags_w3)

# ============================================================
# EXTRACT CONTRASTS AND COMBINE RESULTS
# ============================================================

# Extract contrasts for both waves
viz_contrasts_w2 <- mapply(
  function(mod, lbl) {
    if (!is.null(mod)) {
      extract_viz_contrasts(mod, lbl, "Immediate")
    } else {
      NULL
    }
  },
  scaled_viz_models_w2, 
  high_level_dv_labels, 
  SIMPLIFY = FALSE
)

viz_contrasts_w3 <- mapply(
  function(mod, lbl) {
    if (!is.null(mod)) {
      extract_viz_contrasts(mod, lbl, "15 Days")
    } else {
      NULL
    }
  },
  scaled_viz_models_w3, 
  high_level_dv_labels, 
  SIMPLIFY = FALSE
)

# Combine all results
all_viz_contrasts <- c(viz_contrasts_w2, viz_contrasts_w3)
all_viz_contrasts <- all_viz_contrasts[!sapply(all_viz_contrasts, is.null)]

# Create final results data frame
if (length(all_viz_contrasts) > 0) {
  viz_results <- do.call(rbind, all_viz_contrasts)
  
  # Apply FDR correction within each contrast type
  viz_results$p.value.fdr <- NA
  contrast_types <- unique(viz_results$contrast)
  
  for (contrast_type in contrast_types) {
    contrast_subset <- viz_results$contrast == contrast_type
    viz_results$p.value.fdr[contrast_subset] <- p.adjust(viz_results$p.value[contrast_subset], method = "fdr")
  }
  
  # Add significance indicators
  viz_results$sig_raw <- ifelse(viz_results$p.value < 0.001, "***",
                               ifelse(viz_results$p.value < 0.01, "**",
                                     ifelse(viz_results$p.value < 0.05, "*",
                                           ifelse(viz_results$p.value < 0.10, "†", ""))))
  
  viz_results$sig_fdr <- ifelse(viz_results$p.value.fdr < 0.001, "***",
                               ifelse(viz_results$p.value.fdr < 0.01, "**",
                                     ifelse(viz_results$p.value.fdr < 0.05, "*",
                                           ifelse(viz_results$p.value.fdr < 0.10, "†", ""))))
  
  # Round numeric columns
  viz_results$estimate <- round(viz_results$estimate, 2)
  viz_results$std.error <- round(viz_results$std.error, 2)
  viz_results$t.value <- round(viz_results$t.value, 3)
  viz_results$p.value <- round(viz_results$p.value, 3)
  viz_results$p.value.fdr <- round(viz_results$p.value.fdr, 3)
  viz_results$ci_lower <- round(viz_results$ci_lower, 2)
  viz_results$ci_upper <- round(viz_results$ci_upper, 2)
  
} else {
  viz_results <- data.frame()
}

# ============================================================
# SAVE RESULTS
# ============================================================

# Save results as JSON for easy loading in visualization scripts

write_json(viz_results, "public/data-scaled_visualization_results.json", pretty = TRUE)

