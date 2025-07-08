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
    "handoff" = "Heat Wave + Handoff"
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
  "handoff" = "Heat Wave + Handoff"
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

  # Calculate stats for each combination (overall)
  for (var in policy_vars) {
    # Extract category name from variable name
    category <- gsub(paste0("policy_support_|_w", wave), "", var)
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
    for (var in policy_vars) {
      category <- gsub(paste0("policy_support_|_w", wave), "", var)
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
    "handoff" = "Heat Wave + Handoff"
  )

  # Wave labels
  wave_labels <- c(
    "climate_temporal_proximity_timing_w1" = "Baseline (3 Days Before)",
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

# Calculate high-level construct data
calculate_high_level_const_stats <- function(wave) {
  
  # Define high-level construct variables for each wave
  if (wave == 2) {
    const_vars <- list(
      "Perceived Likelihood of Heat Waves" = "heatwaves_likelihood_heatwave_w2_scaled",
      "Heat Wave Threat Severity" = "threat_severity_score_w2",
      "Heat Wave Health Impact" = "threat_health_impact_score_w2",
      "Heat Wave Impact Knowledge" = "impact_knowledge_score_w2",
      "Heat and Policy Support" = "heat_policy_support_score_w2",
      "Healthcare Worker Responsibility" = "healthcare_responsibility_score_w2",
      "Climate Change Personal Impact" = "climate_personal_impact_score_w2",
      "Climate Change Support for Action" = "climate_support_for_action_score_w2"
    )
    condition_var <- "condition_w2"
  } else if (wave == 3) {
    const_vars <- list(
      "Perceived Likelihood of Heat Waves" = "heatwaves_likelihood_heatwave_w3_scaled",
      "Heat Wave Threat Severity" = "threat_severity_score_w3",
      "Heat Wave Health Impact" = "threat_health_impact_score_w3",
      "Heat Wave Impact Knowledge" = "impact_knowledge_score_w3",
      "Heat and Policy Support" = "heat_policy_support_score_w3",
      "Healthcare Worker Responsibility" = "healthcare_responsibility_score_w3",
      "Climate Change Personal Impact" = "climate_personal_impact_score_w3",
      "Climate Change Support for Action" = "climate_support_for_action_score_w3"
    )
    condition_var <- "condition_w2" # Still using w2 condition
  }
  
  # Create results list
  results <- list()
  
  # Calculate stats for each construct (overall only)
  for (category in names(const_vars)) {
    var <- const_vars[[category]]
    
    # Skip if variable doesn't exist
    if (!var %in% names(dt)) {
      cat("Warning: Variable", var, "not found in dataset\n")
      next
    }
    
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
        wave = list(wave)
      )
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

# Generate high-level construct data
cat("Calculating high-level construct data...\n")
wave2_high_level <- calculate_high_level_const_stats(2)
wave3_high_level <- calculate_high_level_const_stats(3)
all_high_level <- c(wave2_high_level, wave3_high_level)

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

# Write high-level construct data
write_json(all_high_level, "public/data-high-level-const.json",
           pretty = TRUE, auto_unbox = FALSE)

# Print summary
cat("Generated JSON files for React app:\n")
cat("- Knowledge data:", length(all_knowledge), "records\n")
cat("- Health worry data:", length(all_worry), "records\n")
cat("- System impacts data:", length(all_impacts), "records\n")
cat("- Policy support data:", length(all_policy), "records\n")
cat("- Climate temporal data:", length(climate_temporal_data), "records\n")
cat("- High-level construct data:", length(all_high_level), "records\n")

cat("\nDone!\n")

