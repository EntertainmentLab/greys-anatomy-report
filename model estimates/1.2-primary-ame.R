# ============================================================
# AME MODEL SPECIFICATION AND TABLE GENERATION
# ============================================================

# Load shared configuration and models
source("model estimates/0-0-run-models.R")

generate_ame_model <- function(dv, wave, baseline_available = TRUE, individual_var = FALSE, flags) {
  flag_str <- paste(flags, collapse = " & ")
  
  # Fix DV name generation to match the logic in lm_custom
  if (individual_var) {
    dv_wave <- dv
    if (baseline_available) {
      dv_prev <- sub(paste0("w", wave), "w1", dv)
    } else {
      dv_prev <- NULL
    }
  } else {
    dv_wave <- paste0(dv, "_w", wave)
    if (baseline_available) {
      dv_prev <- paste0(dv, "_w1")
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

  # Build formula string - fix the baseline variable inclusion
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

extract_ame_contrasts <- function(model, outcome_label, wave_label) {
  out <- tryCatch({
    # Instead of using comparisons(), use avg_comparisons() with explicit contrast specification
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
      contrast_clean = c("Heat Wave Episode Only vs. Control", "Multiplatform vs. Control", "Multiplatform vs. Heat Wave Episode Only"),
      estimate = c(treat_vs_control_est, handoff_vs_control_est, handoff_vs_treatment_est),
      std.error = c(treat_vs_control_se, handoff_vs_control_se, handoff_vs_treatment_se),
      p.value = c(treat_vs_control_p, handoff_vs_control_p, handoff_vs_treatment_p),
      stringsAsFactors = FALSE
    )
    
    # Format and pivot
    contrast_df <- contrast_df %>%
      mutate(
        label = paste0(contrast_clean, "_", wave_label),
        estimate_with_ci = format_estimate_with_ci(estimate, std.error, p.value)
      ) %>%
      select(outcome, label, estimate_with_ci) %>%
      pivot_wider(names_from = label, values_from = estimate_with_ci)
    
    return(contrast_df)
    
  }, error = function(e) {
    cat("Error in extract_ame_contrasts for", outcome_label, wave_label, ":", e$message, "\n")
    # Return a minimal valid structure
    data.frame(
      outcome = outcome_label,
      stringsAsFactors = FALSE
    )
  })
  out
}

process_ame_models_both_waves <- function(models_w2, models_w3, labels) {
  ame_w2 <- mapply(
    function(mod, lbl) extract_ame_contrasts(mod, lbl, "Immediate"),
    models_w2, labels, SIMPLIFY = FALSE
  )
  ame_w3 <- mapply(
    function(mod, lbl) extract_ame_contrasts(mod, lbl, "+ 15 days"),
    models_w3, labels, SIMPLIFY = FALSE
  )
  
  # Combine all results for FDR correction
  all_ame_results <- c(ame_w2, ame_w3)
  all_ame_results <- all_ame_results[!sapply(all_ame_results, is.null)]
  
  if (length(all_ame_results) > 0) {
    # Combine all AME results into one data frame
    all_ame_df <- do.call(rbind, lapply(all_ame_results, function(x) {
      if (ncol(x) > 1) {
        # Convert wide format back to long for FDR correction
        x_long <- tidyr::pivot_longer(x, cols = -outcome, names_to = "contrast_wave", values_to = "estimate_with_ci")
        # Extract contrast type and wave
        x_long$contrast <- gsub("_(Immediate|\\+ 15 days)$", "", x_long$contrast_wave)
        x_long$wave <- ifelse(grepl("Immediate", x_long$contrast_wave), "Immediate", "+ 15 days")
        return(x_long[, c("outcome", "contrast", "wave")])
      }
      return(NULL)
    }))
    
    # Get individual results with p-values for FDR correction
    all_raw_results <- list()
    
    for (i in seq_along(models_w2)) {
      if (!is.null(models_w2[[i]])) {
        result <- extract_ame_contrasts_with_pvalues(models_w2[[i]], labels[i], "Immediate")
        if (!is.null(result)) all_raw_results[[length(all_raw_results) + 1]] <- result
      }
    }
    
    for (i in seq_along(models_w3)) {
      if (!is.null(models_w3[[i]])) {
        result <- extract_ame_contrasts_with_pvalues(models_w3[[i]], labels[i], "+ 15 days")
        if (!is.null(result)) all_raw_results[[length(all_raw_results) + 1]] <- result
      }
    }
    
    # Combine raw results and apply FDR correction
    if (length(all_raw_results) > 0) {
      all_raw_df <- do.call(rbind, all_raw_results)
      
      # Initialize FDR column
      all_raw_df$p.value.fdr <- NA
      
      # Apply FDR correction within each contrast type
      contrast_types <- unique(all_raw_df$contrast_clean)
      
      for (contrast_type in contrast_types) {
        contrast_subset <- all_raw_df$contrast_clean == contrast_type
        all_raw_df$p.value.fdr[contrast_subset] <- p.adjust(all_raw_df$p.value[contrast_subset], method = "fdr")
      }
      
      # Format with FDR-corrected p-values
      clean_ame <- all_raw_df %>%
        mutate(
          estimate_with_ci = format_estimate_with_ci(estimate, std.error, p.value.fdr, use_fdr = FALSE, fdr_p = NULL),
          label = paste0(contrast_clean, "_", wave)
        ) %>%
        select(outcome, label, estimate_with_ci) %>%
        pivot_wider(names_from = label, values_from = estimate_with_ci)
      
      return(clean_ame)
    }
  }
  
  # Fallback to original method if FDR fails
  all_ames <- list()
  
  # Combine waves for each outcome in order
  for (i in seq_along(labels)) {
    if (!is.null(ame_w2[[i]]) && !is.null(ame_w3[[i]])) {
      # Merge the two waves for this outcome
      combined_outcome <- merge(ame_w2[[i]], ame_w3[[i]], by = "outcome", all = TRUE)
      all_ames[[i]] <- combined_outcome
    } else if (!is.null(ame_w2[[i]])) {
      all_ames[[i]] <- ame_w2[[i]]
    } else if (!is.null(ame_w3[[i]])) {
      all_ames[[i]] <- ame_w3[[i]]
    }
  }
  
  # Remove NULL entries and bind in order
  all_ames <- all_ames[!sapply(all_ames, is.null)]
  
  if (length(all_ames) > 0) {
    return(do.call(rbind, all_ames))
  }
  return(NULL)
}

# New helper function to extract AME contrasts with p-values for FDR correction
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
      contrast_clean = c("Heat Wave Episode Only vs. Control", "Multiplatform vs. Control", "Multiplatform vs. Heat Wave Episode Only"),
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

# Define which DVs are individual variables and which have baselines - FIX ORDER to match primary models
dv_configs <- list(
  list(dv = "heatwaves_likelihood_heatwave_w2_scaled", individual = TRUE, baseline = TRUE),
  list(dv = "threat_severity_score", individual = FALSE, baseline = TRUE),
  list(dv = "threat_health_impact_score", individual = FALSE, baseline = TRUE),
  list(dv = "impact_knowledge_full", individual = FALSE, baseline = TRUE),
  list(dv = "heat_policy_support_score", individual = FALSE, baseline = FALSE),
  list(dv = "healthcare_responsibility_score", individual = FALSE, baseline = FALSE),
  list(dv = "climate_personal_impact_score", individual = FALSE, baseline = TRUE),
  list(dv = "climate_support_for_action_score", individual = FALSE, baseline = TRUE)
)

# Fit models using exact same logic as primary models
fit_ame_models_exact <- function(dv_configs, wave, flags) {
  lapply(dv_configs, function(config) {
    # Use the base DV name without wave suffix for non-individual variables
    if (config$individual) {
      # For individual variables, use the exact DV name but replace wave number
      if (wave == 2) {
        dv_name <- config$dv
      } else {
        dv_name <- gsub("_w2_scaled", "_w3_scaled", config$dv)
      }
    } else {
      # For composite scores, use base name without wave suffix
      dv_name <- gsub("_w[23]_scaled", "", config$dv)
      dv_name <- gsub("_score$", "_score", dv_name)  # Ensure it ends with _score
    }
    
    tryCatch({
      generate_ame_model(
        dv = dv_name,
        wave = wave,
        baseline_available = config$baseline,
        individual_var = config$individual,
        flags = flags
      )
    }, error = function(e) {
      cat("Error fitting model for", dv_name, "wave", wave, ":", e$message, "\n")
      NULL
    })
  })
}

# Use high-level configs from config file and create AME models
create_ame_models <- function() {
  # Get base models and modify for AME (interaction with heat index)
  base_models_w2 <- get_models(ALL_MODELS, "high_level", 2)
  base_models_w3 <- get_models(ALL_MODELS, "high_level", 3)
  
  # Create AME versions by refitting with heat index interaction
  high_ame_models_w2 <- fit_ame_models_exact(high_level_configs, 2, wave_flags_w2)
  high_ame_models_w3 <- fit_ame_models_exact(high_level_configs, 3, wave_flags_w3)
  
  return(list(w2 = high_ame_models_w2, w3 = high_ame_models_w3))
}

# Create AME models
ame_models <- create_ame_models()

# Extract and format
ame_table <- process_ame_models_both_waves(ame_models$w2, ame_models$w3, high_level_dv_labels)

# ============================================================
# CREATE INDIVIDUAL COMPONENT MODELS FOR AME USING CONFIG
# ============================================================

# Fit individual component models using config
threat_severity_ame_w2 <- fit_ame_models_exact(threat_severity_configs, 2, wave_flags_w2)
threat_severity_ame_w3 <- fit_ame_models_exact(threat_severity_configs, 3, wave_flags_w3)

threat_health_ame_w2 <- fit_ame_models_exact(threat_health_configs, 2, wave_flags_w2)
threat_health_ame_w3 <- fit_ame_models_exact(threat_health_configs, 3, wave_flags_w3)

impact_knowledge_ame_w2 <- fit_ame_models_exact(impact_knowledge_configs, 2, wave_flags_w2)
impact_knowledge_ame_w3 <- fit_ame_models_exact(impact_knowledge_configs, 3, wave_flags_w3)

heat_policy_ame_w2 <- fit_ame_models_exact(heat_policy_configs, 2, wave_flags_w2)
heat_policy_ame_w3 <- fit_ame_models_exact(heat_policy_configs, 3, wave_flags_w3)

healthcare_responsibility_ame_w2 <- fit_ame_models_exact(healthcare_responsibility_configs, 2, wave_flags_w2)
healthcare_responsibility_ame_w3 <- fit_ame_models_exact(healthcare_responsibility_configs, 3, wave_flags_w3)

climate_personal_ame_w2 <- fit_ame_models_exact(climate_personal_configs, 2, wave_flags_w2)
climate_personal_ame_w3 <- fit_ame_models_exact(climate_personal_configs, 3, wave_flags_w3)

climate_action_ame_w2 <- fit_ame_models_exact(climate_action_configs, 2, wave_flags_w2)
climate_action_ame_w3 <- fit_ame_models_exact(climate_action_configs, 3, wave_flags_w3)

# Create component AME models using config
create_component_ame_models <- function() {
  component_groups <- list(
    "threat_severity", "threat_health", "impact_knowledge", "heat_policy", 
    "healthcare_responsibility", "climate_personal", "climate_action"
  )
  
  config_map <- list(
    threat_severity = threat_severity_configs,
    threat_health = threat_health_configs,
    impact_knowledge = impact_knowledge_configs,
    heat_policy = heat_policy_configs,
    healthcare_responsibility = healthcare_responsibility_configs,
    climate_personal = climate_personal_configs,
    climate_action = climate_action_configs
  )
  
  component_ame_w2 <- lapply(component_groups, function(group) {
    fit_ame_models_exact(config_map[[group]], 2, wave_flags_w2)
  })
  
  component_ame_w3 <- lapply(component_groups, function(group) {
    fit_ame_models_exact(config_map[[group]], 3, wave_flags_w3)
  })
  
  return(list(w2 = component_ame_w2, w3 = component_ame_w3))
}

component_ame_models <- create_component_ame_models()

# Extract AME contrasts similar to scaled visualization format
extract_ame_contrasts_for_json <- function(model, outcome_label, wave_label) {
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
      contrast = c("Heat Wave Episode Only vs. Control", "Multiplatform vs. Control", "Multiplatform vs. Heat Wave Episode Only"),
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
    cat("Error in extract_ame_contrasts_for_json for", outcome_label, wave_label, ":", e$message, "\n")
    return(NULL)
  })
}

# Extract contrasts for both waves for main constructs
ame_contrasts_w2 <- mapply(
  function(mod, lbl) {
    if (!is.null(mod)) {
      extract_ame_contrasts_for_json(mod, lbl, "Immediate")
    } else {
      NULL
    }
  },
  ame_models$w2, 
  high_level_dv_labels, 
  SIMPLIFY = FALSE
)

ame_contrasts_w3 <- mapply(
  function(mod, lbl) {
    if (!is.null(mod)) {
      extract_ame_contrasts_for_json(mod, lbl, "15 Days")
    } else {
      NULL
    }
  },
  ame_models$w3, 
  high_level_dv_labels, 
  SIMPLIFY = FALSE
)

# Combine all results
all_ame_contrasts <- c(ame_contrasts_w2, ame_contrasts_w3)
all_ame_contrasts <- all_ame_contrasts[!sapply(all_ame_contrasts, is.null)]

# Create final results data frame
if (length(all_ame_contrasts) > 0) {
  ame_results <- do.call(rbind, all_ame_contrasts)
  
  # Apply FDR correction within each contrast type
  ame_results$p.value.fdr <- NA
  contrast_types <- unique(ame_results$contrast)
  
  for (contrast_type in contrast_types) {
    contrast_subset <- ame_results$contrast == contrast_type
    ame_results$p.value.fdr[contrast_subset] <- p.adjust(ame_results$p.value[contrast_subset], method = "fdr")
  }
  
  # Add significance indicators
  ame_results$sig_raw <- ifelse(ame_results$p.value < 0.001, "***",
                               ifelse(ame_results$p.value < 0.01, "**",
                                     ifelse(ame_results$p.value < 0.05, "*",
                                           ifelse(ame_results$p.value < 0.10, "†", ""))))
  
  ame_results$sig_fdr <- ifelse(ame_results$p.value.fdr < 0.001, "***",
                               ifelse(ame_results$p.value.fdr < 0.01, "**",
                                     ifelse(ame_results$p.value.fdr < 0.05, "*",
                                           ifelse(ame_results$p.value.fdr < 0.10, "†", ""))))
  
  # Round numeric columns
  ame_results$estimate <- round(ame_results$estimate, 2)
  ame_results$std.error <- round(ame_results$std.error, 2)
  ame_results$t.value <- round(ame_results$t.value, 3)
  ame_results$p.value <- round(ame_results$p.value, 3)
  ame_results$p.value.fdr <- round(ame_results$p.value.fdr, 3)
  ame_results$ci_lower <- round(ame_results$ci_lower, 2)
  ame_results$ci_upper <- round(ame_results$ci_upper, 2)
  
} else {
  ame_results <- data.frame()
}

# Save results as JSON
library(jsonlite)
write_json(ame_results, "public/data-ame_results.json", pretty = TRUE)
cat("AME results saved to public/data-ame_results.json\n")
