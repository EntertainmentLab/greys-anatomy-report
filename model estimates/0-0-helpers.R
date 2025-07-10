# ================================================================
# HELPER FUNCTIONS
# ================================================================
# This file contains access and utility functions for models and data.
# ================================================================

# Load data configuration
# Data config is loaded by main config file

# ============================================================
# MODEL ACCESS HELPER FUNCTIONS
# ============================================================

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
    "individual_matrix" = individual_labels,  # This correctly references individual_labels
    stop("Unknown category: ", category)
  )
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
