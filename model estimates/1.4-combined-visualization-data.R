# ============================================================
# COMBINED VISUALIZATION DATA
# ============================================================
# This script combines results from two different analyses:
# 1. AME Analysis (1.2) - Provides statistically valid p-values for inference
# 2. Scaled Visualization (1.3) - Provides standardized estimates for plotting
#
# WHY WE DO THIS:
# - 1.2 uses proper unweighted regression models appropriate for inference
# - 1.3 uses scaled/standardized measures that are comparable across outcomes
# - We want to plot the standardized estimates but use the valid p-values
#
# RESULT: 
# - Estimates, SEs, CIs from 1.3 (for comparable visualization)
# - P-values and significance from 1.2 (for valid statistical inference)
# ============================================================

library(jsonlite)
library(dplyr)

# Load both datasets
cat("Loading AME results (1.2) for statistical inference...\n")
ame_inference <- fromJSON("public/data-ame_results.json", flatten = TRUE)

cat("Loading scaled visualization results (1.3) for plotting...\n") 
scaled_viz <- fromJSON("public/data-scaled_visualization_results.json", flatten = TRUE)

# Check if both datasets loaded successfully
if (nrow(ame_inference) == 0) {
  stop("ERROR: AME results (1.2) not found or empty. Run 1.2-primary-ame.R first.")
}

if (nrow(scaled_viz) == 0) {
  stop("ERROR: Scaled visualization results (1.3) not found or empty. Run 1.3-scaled-visualization-models.R first.")
}

cat("AME inference data:", nrow(ame_inference), "rows\n")
cat("Scaled visualization data:", nrow(scaled_viz), "rows\n")

# Create merge keys for both datasets
ame_inference$merge_key <- paste(ame_inference$outcome, ame_inference$wave, ame_inference$contrast, sep = "|")
scaled_viz$merge_key <- paste(scaled_viz$outcome, scaled_viz$wave, scaled_viz$contrast, sep = "|")

# Check for mismatches
ame_keys <- unique(ame_inference$merge_key)
viz_keys <- unique(scaled_viz$merge_key)

missing_in_viz <- setdiff(ame_keys, viz_keys)
missing_in_ame <- setdiff(viz_keys, ame_keys)

if (length(missing_in_viz) > 0) {
  cat("WARNING: These combinations are in AME but not in scaled viz:\n")
  cat(paste(missing_in_viz, collapse = "\n"), "\n")
}

if (length(missing_in_ame) > 0) {
  cat("WARNING: These combinations are in scaled viz but not in AME:\n")
  cat(paste(missing_in_ame, collapse = "\n"), "\n")
}

# Merge datasets - prioritize AME p-values over scaled viz p-values
viz_data_for_merge <- scaled_viz %>%
  select(outcome, wave, contrast, 
         estimate, std.error, ci_lower, ci_upper, t.value, n,  # From scaled viz
         merge_key)

ame_pvals_for_merge <- ame_inference %>%
  select(merge_key, 
         p.value, p.value.fdr, sig_raw, sig_fdr) %>%  # From AME inference
  rename(p.value_ame = p.value,
         p.value.fdr_ame = p.value.fdr,
         sig_raw_ame = sig_raw,
         sig_fdr_ame = sig_fdr)

# Join and prioritize AME p-values
combined_data <- viz_data_for_merge %>%
  left_join(ame_pvals_for_merge, by = "merge_key") %>%
  left_join(
    scaled_viz %>% select(merge_key, p.value, p.value.fdr, sig_raw, sig_fdr),
    by = "merge_key",
    suffix = c("", "_viz")
  ) %>%
  mutate(
    # Use AME p-values if available, otherwise use scaled viz p-values
    p.value = coalesce(p.value_ame, p.value),
    p.value.fdr = coalesce(p.value.fdr_ame, p.value.fdr),
    sig_raw = coalesce(sig_raw_ame, sig_raw),
    sig_fdr = coalesce(sig_fdr_ame, sig_fdr)
  ) %>%
  select(-merge_key, -ends_with("_ame"), -ends_with("_viz"))

# Verify the merge worked
cat("Combined data:", nrow(combined_data), "rows\n")

# Check for any missing p-values after merge
missing_pvals <- sum(is.na(combined_data$p.value))
if (missing_pvals > 0) {
  cat("WARNING:", missing_pvals, "rows are missing p-values after merge\n")
}

# Add metadata to document what we did
combined_data$data_source_note <- "Estimates from scaled models (1.3), p-values from AME models (1.2)"

# Round numeric columns for consistency
combined_data <- combined_data %>%
  mutate(
    estimate = round(estimate, 2),
    std.error = round(std.error, 2),
    t.value = round(t.value, 3),
    p.value = round(p.value, 3),
    p.value.fdr = round(p.value.fdr, 3),
    ci_lower = round(ci_lower, 2),
    ci_upper = round(ci_upper, 2)
  )

# Save combined results
output_file <- "public/data-combined_visualization_results.json"
write_json(combined_data, output_file, pretty = TRUE)

cat("\n============================================================\n")
cat("COMBINED VISUALIZATION DATA CREATED\n")
cat("============================================================\n")
cat("File:", output_file, "\n")
cat("Rows:", nrow(combined_data), "\n")
cat("Estimates source: Scaled visualization models (1.3)\n")
cat("P-values source: AME inference models (1.2)\n")
cat("============================================================\n")

# Print summary by outcome to verify
cat("\nSummary by outcome:\n")
summary_table <- combined_data %>%
  group_by(outcome) %>%
  summarise(
    contrasts = n(),
    waves = n_distinct(wave),
    .groups = "drop"
  )
print(summary_table)

cat("\nDone! Use this file for visualization with statistically valid inference.\n")