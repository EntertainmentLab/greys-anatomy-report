source("../Greys-Anatomy/data/libraries.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Helper - Likert to Numbers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Misc Helpers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Data Merging Helpers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Data Download Helpers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Health Risk Text Scoring.R")

dt <- readRDS("../Greys-Anatomy/data/1-Data/processed_data/complete_data_for_analysis.rds")
dt <- dt[wave_2_analysis_ready == TRUE & wave_3_analysis_ready == TRUE,]


# Calculate means and standard errors for knowledge variables
calculate_knowledge_stats <- function(wave) {

  # Define knowledge variables for each wave
  if (wave == 2) {
    knowledge_vars <- c(
    "heatwaves_knowledge_heart_attacks_w2",
    "heatwaves_knowledge_organ_failure_w2",
    "heatwaves_knowledge_premature_labor_w2",
    "heatwaves_knowledge_violent_crime_w2"
    # "heatwaves_knowledge_cancer_w2", 
  )
    condition_var <- "condition_w2"
  } else if (wave == 3) {
    knowledge_vars <- c(
    "heatwaves_knowledge_heart_attacks_w3",
    "heatwaves_knowledge_organ_failure_w3",
    "heatwaves_knowledge_premature_labor_w3",
    "heatwaves_knowledge_violent_crime_w3"
    # "heatwaves_knowledge_cancer_w3",
  )
    condition_var <- "condition_w2" # Still using w2 condition
  }

  # Create results list
  results <- list()

  # Calculate stats for each combination (overall)
  for (var in knowledge_vars) {
    # Extract category name from variable name
    category <- gsub(paste0("heatwaves_knowledge_|_w", wave), "", var)
    category <- gsub("_", " ", category)
    category <- tools::toTitleCase(category)

    # Calculate means and SEs by condition (overall)
    stats <- dt[!is.na(get(var)) & !is.na(get(condition_var)),
        .(mean = mean(get(var), na.rm = TRUE),
          se = sd(get(var), na.rm = TRUE) / sqrt(.N),
          n = .N),
        by = condition_var]

    setnames(stats, condition_var, "condition")

    # Create final records with array format for React compatibility
    for (i in 1:nrow(stats)) {
      results[[length(results) + 1]] <- list(
    condition = list(stats$condition[i]),
    category = list(category),
    mean = list(round(stats$mean[i], 2)),
    se = list(round(stats$se[i], 3)),
    n = list(stats$n[i]),
    wave = list(wave),
    political_party = list("Overall")
    )
    }
  }

  # Now repeat for each political party (Democrat, Independent, Republican)
  parties <- c("Democrat", "Independent", "Republican")
  for (party in parties) {
    for (var in knowledge_vars) {
      category <- gsub(paste0("heatwaves_knowledge_|_w", wave), "", var)
      category <- gsub("_", " ", category)
      category <- tools::toTitleCase(category)

      stats <- dt[
    !is.na(get(var)) &
    !is.na(get(condition_var)) &
    connect_political_party_w1 == party,
    .(mean = mean(get(var), na.rm = TRUE),
      se = sd(get(var), na.rm = TRUE) / sqrt(.N),
      n = .N),
    by = condition_var
    ]

      setnames(stats, condition_var, "condition")

      for (i in 1:nrow(stats)) {
        results[[length(results) + 1]] <- list(
      condition = list(stats$condition[i]),
      category = list(category),
      mean = list(round(stats$mean[i], 2)),
      se = list(round(stats$se[i], 3)),
      n = list(stats$n[i]),
      wave = list(wave),
      political_party = list(party)
    )
      }
    }
  }

  return(results)
}

# Calculate heatwave health worry data
calculate_health_worry_stats <- function(wave) {

  # Define health worry variables for each wave
  if (wave == 2) {
    worry_vars <- c(
      "heatwaves_health_worry_death_w2_raw",
      "heatwaves_health_worry_worsening_conds_w2_raw",
      "heatwaves_health_worry_heat_stroke_w2_raw",
      "heatwaves_health_worry_dehydration_w2_raw"
    )
    condition_var <- "condition_w2"
  } else if (wave == 3) {
    worry_vars <- c(
      "heatwaves_health_worry_death_w3_raw",
      "heatwaves_health_worry_worsening_conds_w3_raw",
      "heatwaves_health_worry_heat_stroke_w3_raw",
      "heatwaves_health_worry_dehydration_w3_raw"
    )
    condition_var <- "condition_w2" # Still using w2 condition
  }

  # Create condition labels
  condition_labels <- c(
    "control" = "Control",
    "treatment" = "Heat Wave",
    "handoff" = "Multiplatform Group"
  )

  results <- list()

  # Calculate stats for each worry variable
  for (var in worry_vars) {
    # Skip if variable doesn't exist
    if (!var %in% names(dt)) {
      cat("Warning: Variable", var, "not found in dataset\n")
      next
    }

    # Extract health issue name
    health_issue <- gsub(paste0("heatwaves_health_worry_|_w", wave, "_raw"), "", var)
    health_issue <- gsub("_", " ", health_issue)
    # Fix specific cases
    health_issue <- gsub("conds", "conditions", health_issue)
    health_issue <- tools::toTitleCase(health_issue)

    # Calculate counts by condition for each response level (using character matching)
    worry_stats <- dt[!is.na(get(var)) & !is.na(get(condition_var)),
                        .(extremely_worried = sum(get(var) == "Extremely worried", na.rm = TRUE),
                        very_worried = sum(get(var) == "Very worried", na.rm = TRUE),
                        moderately_worried = sum(get(var) == "Moderately worried", na.rm = TRUE),
                        little_worried = sum(get(var) == "A little worried", na.rm = TRUE),
                        not_worried = sum(get(var) == "Not worried at all", na.rm = TRUE)
                      ),
                    by = condition_var]

    setnames(worry_stats, condition_var, "condition")

    # Create records for each condition
    for (i in 1:nrow(worry_stats)) {
      # Calculate total for this condition/health issue
      total <- worry_stats$extremely_worried[i] + worry_stats$very_worried[i] +
               worry_stats$moderately_worried[i] + worry_stats$little_worried[i] +
               worry_stats$not_worried[i]

      results[[length(results) + 1]] <- list(
        wave = wave,
        condition = condition_labels[worry_stats$condition[i]],
        health_issue = health_issue,
        extremely_worried = round((worry_stats$extremely_worried[i] / total) * 100, 1),
        very_worried = round((worry_stats$very_worried[i] / total) * 100, 1),
        moderately_worried = round((worry_stats$moderately_worried[i] / total) * 100, 1),
        little_worried = round((worry_stats$little_worried[i] / total) * 100, 1),
        not_worried = round((worry_stats$not_worried[i] / total) * 100, 1)
      )
    }
  }

  return(results)
}

# Calculate heatwave system impacts data
calculate_sys_impacts_stats <- function(wave) {

  # Define system impact variables for each wave
  if (wave == 2) {
    impact_vars <- c(
    "heatwaves_system_impacts_surgery_cancellation_w2_raw",
    "heatwaves_system_impacts_losing_power_w2_raw",
    "heatwaves_system_impacts_resource_shortage_w2_raw",
    "heatwaves_system_impacts_overcrowding_w2_raw",
    "heatwaves_system_impacts_er_visits_w2_raw",
    "heatwaves_system_impacts_response_times_w2_raw"
  )
    condition_var <- "condition_w2"
  } else if (wave == 3) {
    impact_vars <- c(
    "heatwaves_system_impacts_surgery_cancellation_w3_raw",
    "heatwaves_system_impacts_losing_power_w3_raw",
    "heatwaves_system_impacts_resource_shortage_w3_raw",
    "heatwaves_system_impacts_overcrowding_w3_raw",
    "heatwaves_system_impacts_er_visits_w3_raw",
    "heatwaves_system_impacts_response_times_w3_raw"
  )
    condition_var <- "condition_w2" # Still using w2 condition
  }

  # Create condition labels
  condition_labels <- c(
  "control" = "Control",
  "treatment" = "Heat Wave",
  "handoff" = "Multiplatform Group"
  )

  results <- list()

  # Calculate stats for each impact variable
  for (var in impact_vars) {
    # Skip if variable doesn't exist
    if (!var %in% names(dt)) {
      cat("Warning: Variable", var, "not found in dataset\n")
      next
    }

    # Extract impact issue name
    impact_issue <- gsub(paste0("heatwaves_system_impacts_|_w", wave, "_raw"), "", var)
    impact_issue <- gsub("_", " ", impact_issue)
    impact_issue <- tools::toTitleCase(impact_issue)

    # Calculate counts by condition for each response level
    impact_stats <- dt[!is.na(get(var)) & !is.na(get(condition_var)),
            .(a_great_deal = sum(get(var) == "A great deal", na.rm = TRUE),
            quite_a_bit = sum(get(var) == "Quite a bit", na.rm = TRUE),
            a_moderate_amount = sum(get(var) == "A moderate amount", na.rm = TRUE),
            a_little_amount = sum(get(var) == "A little amount", na.rm = TRUE),
            not_at_all = sum(get(var) == "Not at all", na.rm = TRUE)),
            by = condition_var]

    setnames(impact_stats, condition_var, "condition")

    # Create records for each condition
    for (i in 1:nrow(impact_stats)) {
      # Calculate total for this condition/impact issue
      total <- impact_stats$a_great_deal[i] + impact_stats$quite_a_bit[i] +
         impact_stats$a_moderate_amount[i] + impact_stats$a_little_amount[i] +
         impact_stats$not_at_all[i]

      results[[length(results) + 1]] <- list(
    wave = wave,
    condition = condition_labels[impact_stats$condition[i]],
    impact_issue = impact_issue,
    a_great_deal = round((impact_stats$a_great_deal[i] / total) * 100, 1),
    quite_a_bit = round((impact_stats$quite_a_bit[i] / total) * 100, 1),
    a_moderate_amount = round((impact_stats$a_moderate_amount[i] / total) * 100, 1),
    a_little_amount = round((impact_stats$a_little_amount[i] / total) * 100, 1),
    not_at_all = round((impact_stats$not_at_all[i] / total) * 100, 1)
    )
    }
  }

  return(results)
}
# Calculate means and standard errors for policy support variables
calculate_policy_support_stats <- function(wave) {

  # Define policy support variables for each wave
  if (wave == 2) {
    policy_vars <- c(
    "policy_support_government_investment_w2",
    "policy_support_cooling_centers_w2"
  )
    condition_var <- "condition_w2"
  } else if (wave == 3) {
    policy_vars <- c(
    "policy_support_government_investment_w3",
    "policy_support_cooling_centers_w3"
  )
    condition_var <- "condition_w2" # Still using w2 condition
  }

  # Create results list
  results <- list()

  # Calculate average of government investment and cooling centers (overall)
  # First, create a composite variable that's the average of both policy variables
  dt_policy <- dt[!is.na(get(policy_vars[1])) & !is.na(get(policy_vars[2])) & !is.na(get(condition_var))]
  dt_policy[, policy_support_avg := (get(policy_vars[1]) + get(policy_vars[2])) / 2]

  # Calculate means and SEs by condition (overall)
  stats <- dt_policy[,
      .(mean = mean(policy_support_avg, na.rm = TRUE),
        se = sd(policy_support_avg, na.rm = TRUE) / sqrt(.N),
        n = .N),
      by = condition_var]

  setnames(stats, condition_var, "condition")

  # Create final records with array format for React compatibility
  for (i in 1:nrow(stats)) {
    results[[length(results) + 1]] <- list(
  condition = list(stats$condition[i]),
  category = list("Policy Support Average"),
  mean = list(round(stats$mean[i], 2)),
  se = list(round(stats$se[i], 3)),
  n = list(stats$n[i]),
  wave = list(wave),
  political_party = list("Overall")
  )
  }

  # Now repeat for each political party (Democrat, Independent, Republican)
  parties <- c("Democrat", "Independent", "Republican")
  for (party in parties) {
    dt_party <- dt_policy[connect_political_party_w1 == party]
    
    stats <- dt_party[,
      .(mean = mean(policy_support_avg, na.rm = TRUE),
        se = sd(policy_support_avg, na.rm = TRUE) / sqrt(.N),
        n = .N),
      by = condition_var]

    setnames(stats, condition_var, "condition")

    for (i in 1:nrow(stats)) {
      results[[length(results) + 1]] <- list(
    condition = list(stats$condition[i]),
    category = list("Policy Support Average"),
    mean = list(round(stats$mean[i], 2)),
    se = list(round(stats$se[i], 3)),
    n = list(stats$n[i]),
    wave = list(wave),
    political_party = list(party)
  )
    }
  }

  return(results)
}


# Calculate HeatWave Composite Score data
calculate_heatwave_composite_stats <- function() {

  # Define HeatWave Composite Score variables for each wave
  heatwave_vars <- list(
    w1 = c("heatwaves_likelihood_heatwave_w1_scaled",
           "threat_severity_score_w1_scaled",
           "threat_health_impact_score_w1_scaled",
           "impact_knowledge_full_w1_scaled"),
    w2 = c("heatwaves_likelihood_heatwave_w2_scaled",
           "threat_severity_score_w2_scaled",
           "threat_health_impact_score_w2_scaled",
           "impact_knowledge_full_w2_scaled"),
    w3 = c("heatwaves_likelihood_heatwave_w3_scaled",
           "threat_severity_score_w3_scaled",
           "threat_health_impact_score_w3_scaled",
           "impact_knowledge_full_w3_scaled")
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

  # Calculate composite score for each wave
  for (wave in names(heatwave_vars)) {
    wave_num <- as.numeric(gsub("w", "", wave))
    vars <- heatwave_vars[[wave]]
    
    # Only include rows where all variables are non-NA
    dt_sub <- dt[!is.na(get(condition_var))]
    
    # Check which variables exist
    existing_vars <- vars[vars %in% names(dt_sub)]
    
    if (length(existing_vars) == 0) {
      cat("Warning: No HeatWave Composite Score variables found for wave", wave, "\n")
      next
    }
    
    # Create a subset with only non-NA values for existing variables
    for (var in existing_vars) {
      dt_sub <- dt_sub[!is.na(get(var))]
    }
    
    # Calculate composite score as average of existing variables
    if (length(existing_vars) > 0) {
      dt_sub[, heatwave_composite := rowMeans(.SD, na.rm = TRUE), .SDcols = existing_vars]
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

# Calculate climate temporal proximity belief change data
calculate_climate_belief_change_stats <- function() {
  
  # Define response labels
  response_labels <- c(
    "0" = "It will never affect me",
    "1" = "It will in the future", 
    "2" = "It already has"
  )
  
  # Define condition labels
  condition_labels <- c(
    "control" = "Control",
    "treatment" = "Heat Wave",
    "handoff" = "Multiplatform Group"
  )
  
  # Filter for people who said "it will never affect me" at wave 1 (coded as 0)
  dt_baseline_never <- dt[climate_temporal_proximity_belief_w1 == 0 & 
                         !is.na(climate_temporal_proximity_belief_w1) & 
                         !is.na(climate_temporal_proximity_belief_w2) & 
                         !is.na(condition_w2)]
  
  results <- list()
  
  # Calculate percentages for each condition
  for (condition in c("control", "treatment", "handoff")) {
    dt_condition <- dt_baseline_never[condition_w2 == condition]
    total_n <- nrow(dt_condition)
    
    if (total_n > 0) {
      # Count responses at wave 2
      wave2_counts <- table(dt_condition$climate_temporal_proximity_belief_w2)
      
      # Calculate percentages
      percentages <- list()
      for (response_code in names(response_labels)) {
        count <- ifelse(response_code %in% names(wave2_counts), wave2_counts[response_code], 0)
        percentages[[response_labels[response_code]]] <- round((count / total_n) * 100, 1)
      }
      
      # Calculate percentage who changed their mind (response != 0)
      changed_mind_count <- sum(dt_condition$climate_temporal_proximity_belief_w2 != 0)
      changed_mind_pct <- round((changed_mind_count / total_n) * 100, 1)
      
      results[[length(results) + 1]] <- list(
        condition = condition_labels[condition],
        total_n = total_n,
        percentages = percentages,
        changed_mind_pct = changed_mind_pct
      )
    }
  }
  
  return(results)
}

# Calculate climate temporal proximity data
calculate_climate_temporal_stats <- function() {

  # Define temporal proximity variables for each wave
  temporal_vars <- c(
    "climate_temporal_proximity_timing_w1",
    "climate_temporal_proximity_timing_w2",
    "climate_temporal_proximity_timing_w3"
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
    "climate_temporal_proximity_timing_w1" = "Baseline (7 Days Before)",
    "climate_temporal_proximity_timing_w2" = "Immediately After Viewing",
    "climate_temporal_proximity_timing_w3" = "15 Days Later"
  )

  results <- list()

  # Only include rows where all three temporal_vars are non-NA
  dt_sub <- dt[!is.na(get(temporal_vars[1])) &
                 !is.na(get(temporal_vars[2])) &
                 !is.na(get(temporal_vars[3])) &
                 !is.na(get(condition_var))]

  # Calculate stats for each wave (overall)
  for (var in temporal_vars) {
    # Skip if variable doesn't exist
    if (!var %in% names(dt_sub)) {
      cat("Warning: Variable", var, "not found in dataset\n")
      next
    }

    # Extract wave number from variable name
    wave_num <- as.numeric(gsub(".*_w([0-9]+)", "\\1", var))

    # Calculate means and SEs by condition
    stats <- dt_sub[!is.na(get(var)),
      .(mean = mean(get(var), na.rm = TRUE),
        se = sd(get(var), na.rm = TRUE) / sqrt(.N),
        n = .N),
      by = condition_var]

    setnames(stats, condition_var, "condition")

    # Create records for each condition (overall)
    for (i in 1:nrow(stats)) {
      results[[length(results) + 1]] <- list(
        wave = wave_num,
        wave_label = wave_labels[var],
        condition = condition_labels[stats$condition[i]],
        mean = round(stats$mean[i], 2),
        se = round(stats$se[i], 3),
        n = stats$n[i],
        political_party = "Overall"
      )
    }
  }

  # Now repeat for each political party (Democrat, Independent, Republican)
  parties <- c("Democrat", "Independent", "Republican")
  for (party in parties) {
    dt_party <- dt_sub[connect_political_party_w1 == party]
    for (var in temporal_vars) {
      # Skip if variable doesn't exist
      if (!var %in% names(dt_party)) {
        cat("Warning: Variable", var, "not found in dataset for party", party, "\n")
        next
      }

      wave_num <- as.numeric(gsub(".*_w([0-9]+)", "\\1", var))

      stats <- dt_party[!is.na(get(var)),
        .(mean = mean(get(var), na.rm = TRUE),
          se = sd(get(var), na.rm = TRUE) / sqrt(.N),
          n = .N),
        by = condition_var]

      setnames(stats, condition_var, "condition")

      for (i in 1:nrow(stats)) {
        results[[length(results) + 1]] <- list(
          wave = wave_num,
          wave_label = wave_labels[var],
          condition = condition_labels[stats$condition[i]],
          mean = round(stats$mean[i], 2),
          se = round(stats$se[i], 3),
          n = stats$n[i],
          political_party = party
        )
      }
    }
  }

  return(results)
}



# Generate all data files
cat("Generating data files...\n")


# Generate knowledge data
cat("Calculating knowledge data...\n")
wave2_knowledge <- calculate_knowledge_stats(2)
wave3_knowledge <- calculate_knowledge_stats(3)
all_knowledge <- c(wave2_knowledge, wave3_knowledge)

# Generate health worry data  
cat("Calculating health worry data...\n")
wave2_worry <- calculate_health_worry_stats(2)
wave3_worry <- calculate_health_worry_stats(3)
all_worry <- c(wave2_worry, wave3_worry)

cat("Calculating system impacts data...\n")
wave2_impacts <- calculate_sys_impacts_stats(2)
wave3_impacts <- calculate_sys_impacts_stats(3)
all_impacts <- c(wave2_impacts, wave3_impacts)

# Generate policy support data
cat("Calculating policy support data...\n")
wave2_policy <- calculate_policy_support_stats(2)
wave3_policy <- calculate_policy_support_stats(3)
all_policy <- c(wave2_policy, wave3_policy)

cat("Calculating climate temporal proximity data...\n")
climate_temporal_data <- calculate_climate_temporal_stats()

cat("Calculating climate belief change data...\n")
climate_belief_change_data <- calculate_climate_belief_change_stats()

cat("Calculating HeatWave Composite Score data...\n")
heatwave_composite_data <- calculate_heatwave_composite_stats()

# Write individual files for React app
write_json(all_knowledge, "public/data-knowledge.json",
           pretty = TRUE, auto_unbox = FALSE)

write_json(all_worry, "public/data-health-worry.json",
           pretty = TRUE, auto_unbox = TRUE)

write_json(all_impacts, "public/data-system-impacts.json",
           pretty = TRUE, auto_unbox = TRUE)

write_json(all_policy, "public/data-policy-support.json",
           pretty = TRUE, auto_unbox = FALSE)

# Write climate temporal proximity data
write_json(climate_temporal_data, "public/data-climate-temporal.json",
           pretty = TRUE, auto_unbox = TRUE)

# Write climate belief change data
write_json(climate_belief_change_data, "public/data-climate-belief-change.json",
           pretty = TRUE, auto_unbox = TRUE)

# Write HeatWave Composite Score data
write_json(heatwave_composite_data, "public/data/data-heatwave-composite.json",
           pretty = TRUE, auto_unbox = TRUE)


# Print summary
cat("Generated JSON files for React app:\n")
cat("- Knowledge data:", length(all_knowledge), "records\n")
cat("- Health worry data:", length(all_worry), "records\n")
cat("- System impacts data:", length(all_impacts), "records\n")
cat("- Policy support data:", length(all_policy), "records\n")
cat("- Climate temporal data:", length(climate_temporal_data), "records\n")
cat("- Climate belief change data:", length(climate_belief_change_data), "records\n")
cat("- HeatWave Composite Score data:", length(heatwave_composite_data), "records\n")


cat("\nDone!\n")

