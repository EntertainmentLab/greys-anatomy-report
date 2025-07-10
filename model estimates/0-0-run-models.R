# ================================================================
# MODEL CREATION INTERFACE
# ================================================================
# This file provides a clean interface for creating models
# without polluting the global environment.
# ================================================================

# Load configuration
source("model estimates/0-0-config.R")

# Data is already loaded in config file

# Create all models using factory pattern
ALL_MODELS <- create_all_models()

cat("All models created using factory pattern.\n")
cat("Access models using: get_models(ALL_MODELS, 'category', wave)\n")
cat("Available categories:", paste(names(ALL_MODELS), collapse = ", "), "\n")

