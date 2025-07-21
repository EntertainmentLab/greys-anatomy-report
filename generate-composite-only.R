# Script to generate only the heatwave composite data
library(data.table)
library(jsonlite)

# Read the processed data
dt <- readRDS("../Greys-Anatomy/data/1-Data/processed_data/complete_data_for_analysis.rds")
dt <- dt[wave_2_analysis_ready == TRUE & wave_3_analysis_ready == TRUE,]

# HeatWave Composite calculation with baseline-referenced scaling
calculate_heatwave_composite_stats <- function() {

  # Define HeatWave Composite Score variables for each wave (unscaled versions)
  heatwave_vars_unscaled <- list(
    w1 = c("heatwaves_likelihood_heatwave_w1",
           "threat_severity_score_w1",
           "threat_health_impact_score_w1",
           "impact_knowledge_score_w1"),
    w2 = c("heatwaves_likelihood_heatwave_w2",
           "threat_severity_score_w2",
           "threat_health_impact_score_w2",
           "impact_knowledge_score_w2"),
    w3 = c("heatwaves_likelihood_heatwave_w3",
           "threat_severity_score_w3",
           "threat_health_impact_score_w3",
           "impact_knowledge_score_w3")
  )

  condition_var <- "condition_w2"

  # Create condition labels
  condition_labels <- c(
    "control" = "Control",
    "treatment" = "Heat Wave",
    "handoff" = "Multiplatform Group"
  )

  # Wave labels
  wave_labels <- c(
    "1" = "Baseline (7 Days Before)",
    "2" = "Immediately After Viewing", 
    "3" = "15 Days Later"
  )

  results <- list()

  # Calculate baseline statistics for scaling (from Wave 1)
  baseline_stats <- list()
  w1_vars <- heatwave_vars_unscaled[["w1"]]
  
  for (var in w1_vars) {
    if (var %in% names(dt)) {
      baseline_stats[[var]] <- list(
        mean = mean(dt[[var]], na.rm = TRUE),
        sd = sd(dt[[var]], na.rm = TRUE)
      )
    }
  }
  
  # Calculate composite score for each wave with baseline-referenced scaling
  for (wave in names(heatwave_vars_unscaled)) {
    wave_num <- as.numeric(gsub("w", "", wave))
    vars <- heatwave_vars_unscaled[[wave]]
    
    # Only include rows where all variables are non-NA
    dt_sub <- dt[!is.na(get(condition_var))]
    
    # Check which variables exist and have baseline stats
    existing_vars <- vars[vars %in% names(dt_sub)]
    baseline_var_names <- gsub("_w[0-9]+$", "_w1", existing_vars)
    existing_vars <- existing_vars[baseline_var_names %in% names(baseline_stats)]
    
    if (length(existing_vars) == 0) {
      cat("Warning: No HeatWave Composite Score variables with baseline found for wave", wave, "\n")
      next
    }
    
    # Create a subset with only non-NA values for existing variables
    for (var in existing_vars) {
      dt_sub <- dt_sub[!is.na(get(var))]
    }
    
    # Apply baseline-referenced scaling and calculate composite score
    if (length(existing_vars) > 0) {
      scaled_vars <- c()
      for (var in existing_vars) {
        baseline_var <- gsub("_w[0-9]+$", "_w1", var)
        if (baseline_var %in% names(baseline_stats)) {
          scaled_var_name <- paste0(var, "_baseline_scaled")
          dt_sub[[scaled_var_name]] <- (dt_sub[[var]] - baseline_stats[[baseline_var]]$mean) / baseline_stats[[baseline_var]]$sd
          scaled_vars <- c(scaled_vars, scaled_var_name)
        }
      }
      
      if (length(scaled_vars) > 0) {
        # Define weights based on number of underlying items in each composite
        weights <- list(
          "heatwaves_likelihood_heatwave" = 1,    # 1 single item
          "threat_severity_score" = 8,            # 8 underlying items (3+3+2)
          "threat_health_impact_score" = 11,      # 11 underlying items (4+1+6)
          "impact_knowledge_score" = 6            # 6 underlying items (5+1)
        )
        
        # Calculate weighted composite
        weighted_sum <- 0
        total_weight <- 0
        
        for (scaled_var in scaled_vars) {
          # Extract base variable name to match with weights
          base_var <- gsub("_w[0-9]+_baseline_scaled$", "", scaled_var)
          if (base_var %in% names(weights)) {
            weight <- weights[[base_var]]
            weighted_sum <- weighted_sum + dt_sub[[scaled_var]] * weight
            total_weight <- total_weight + weight
          }
        }
        
        if (total_weight > 0) {
          dt_sub[, heatwave_composite := weighted_sum / total_weight]
        } else {
          next
        }
      } else {
        next
      }
    } else {
      next
    }

    # Calculate means and SEs by condition (overall)
    stats <- dt_sub[!is.na(heatwave_composite),
      .(mean = mean(heatwave_composite, na.rm = TRUE),
        se = sd(heatwave_composite, na.rm = TRUE) / sqrt(.N),
        n = .N),
      by = condition_var]

    setnames(stats, condition_var, "condition")

    # Create records for each condition (overall)
    for (i in 1:nrow(stats)) {
      results[[length(results) + 1]] <- list(
        wave = wave_num,
        wave_label = wave_labels[as.character(wave_num)],
        condition = condition_labels[stats$condition[i]],
        mean = round(stats$mean[i], 2),
        se = round(stats$se[i], 3),
        n = stats$n[i]
      )
    }
  }

  return(results)
}

# Generate the data
cat("Calculating HeatWave Composite Score data with baseline-referenced scaling...\n")
heatwave_composite_data <- calculate_heatwave_composite_stats()

# Write to JSON file
write_json(heatwave_composite_data, "public/data/data-heatwave-composite.json",
           pretty = TRUE, auto_unbox = TRUE)

cat("Generated new HeatWave Composite Score data with", length(heatwave_composite_data), "records\n")
cat("Updated subtitle: Average of perceived likelihood of heat wave exposure, threat severity, health impact, and core knowledge (baseline-referenced scaling)\n")