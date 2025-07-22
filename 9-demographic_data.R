# Load libraries and data
source("../Greys-Anatomy/data/libraries.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Helper - Likert to Numbers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Misc Helpers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Data Merging Helpers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Data Download Helpers.R")
source("../Greys-Anatomy/data/2-Processing/00 - Helpers/Health Risk Text Scoring.R")

# Load the processed data
dt <- readRDS("../Greys-Anatomy/data/1-Data/processed_data/complete_data_for_analysis.rds")
dt <- dt[wave_2_analysis_ready == TRUE & wave_3_analysis_ready == TRUE,]

# Transform education variable to years of education
# Create education mapping
education_mapping <- data.table(
  education_level = c(
    "No formal education",
    "Less than a high school diploma",
    "High school graduate - high school diploma or the equivalent (for example: GED)",
    "Some college, but no degree",
    "Associate degree (for example: AA, AS)",
    "Bachelor's degree (for example: BA, AB, BS)",
    "Master's degree (for example: MA, MS, MEng, MEd, MSW, MBA)",
    "Professional degree (for example: MD, DDS, DVM, LLB, JD)",
    "Doctorate degree (for example: PhD, EdD)"
  ),
  education_years = c(0, 10, 12, 13, 14, 16, 18, 19, 20)
)

# Create new variable connect_education_w1_years
dt[, connect_education_w1_years := education_mapping$education_years[match(connect_education_w1, education_mapping$education_level)]]

dt[, str(connect_education_w1_years)]

#make connect_age_w1 numeric
dt[, connect_age_w1 := as.numeric(connect_age_w1)]

# yes = 1, no = 0, "Don't know" = NA
dt[, demos_heat_sensitivity_w1 :=
  ifelse(demos_heat_sensitivity_w1_raw == "Yes", 1,
  ifelse(demos_heat_sensitivity_w1_raw == "No", 0,
      NA_real_))]

# check
table(dt$demos_heat_sensitivity_w1, useNA = "always")

# Transform political party variable - combine "Prefer not to say" and "Something else" into "Other"
dt[, connect_political_party_w1_clean :=
  ifelse(connect_political_party_w1 %in% c("Prefer not to say", "Something else"), "Other",
         as.character(connect_political_party_w1))]

dt[, connect_political_party_w1_clean := as.factor(connect_political_party_w1_clean)]


# Transform ethnicity variable - 0 for non-Hispanic, 1 for Hispanic/Latino/Spanish origin
dt[, connect_ethnicity_hispanic :=
  ifelse(connect_ethnicity_w1 == "No, not of Hispanic, Latino, or Spanish origin", 0, 1)]

# Transform gender variable - Man, Woman, and Non-binary or Other
dt[, connect_gender_w1_clean :=
  ifelse(connect_gender_w1 == "Man", "Man",
  ifelse(connect_gender_w1 == "Woman", "Woman",
         "Non-binary or Other"))]

dt[, connect_gender_w1_clean := as.factor(connect_gender_w1_clean)]

# Transform race variable with remapping
dt[, connect_race_w1_clean :=
  ifelse(connect_race_w1 == "American Indian or Alaska Native", "Native American",
  ifelse(connect_race_w1 %in% c("Asian Indian", "Chinese", "Filipino", "Japanese", "Korean", "Vietnamese"), "Asian",
  ifelse(connect_race_w1 == "Black or African American", "Black",
  ifelse(connect_race_w1 == "White", "White",
  ifelse(connect_race_w1 %in% c("Hawaiian", "Samoan"), "Pacific Islander",
         as.character(connect_race_w1))))))]

dt[, connect_race_w1_clean := as.factor(connect_race_w1_clean)]

# Transform US regions variable - extract region name and add states as label attribute
# First, extract the region name (everything before " - ")
dt[, connect_us_regions_w1_clean := gsub(" - .*", "", connect_us_regions_w1)]

# Create a mapping of regions to their states for the label attribute
region_labels <- c(
  "Midwest" = "IA, IL, IN, KS, MI, MN, MO, NE, ND, OH, SD, WI",
  "South" = "AL, AR, DC, DE, FL, GA, KY, LA, MD, MS, NC, OK, SC, TN, TX, VA, WV",
  "West" = "AK, AZ, CA, CO, HI, ID, MT, NM, NV, OR, UT, WA, WY",
  "Northeast" = "CT, MA, ME, NH, NJ, NY, PA, RI, VT"
)

# Convert to factor and add label attribute
dt[, connect_us_regions_w1_clean := factor(connect_us_regions_w1_clean)]
attr(dt$connect_us_regions_w1_clean, "label") <- region_labels

# Check the transformation
table(dt$connect_us_regions_w1_clean, useNA = "always")

##############################################################################
# Create html table for demographic summary
##############################################################################

# Create demographic summary
library(htmlTable)

# Function to detect if numeric variable is binary
is_binary <- function(x) {
  unique_vals <- unique(na.omit(x))
  return(length(unique_vals) == 2 && all(unique_vals %in% c(0, 1)))
}

# Function to format numeric variables with improved presentation
format_numeric <- function(x, var_name) {
  if (is_binary(x)) {
    pct <- round(mean(x, na.rm = TRUE) * 100, 1)
    return(list(type = "binary", value = paste0(pct, "%")))
  } else {
    mean_val <- round(mean(x, na.rm = TRUE), 1)
    sd_val <- round(sd(x, na.rm = TRUE), 1)
    # Format with commas for large numbers
    if (var_name == "connect_household_income_w1") {
      mean_val_formatted <- paste0("$", format(round(mean_val, 0), big.mark = ","))
      sd_val_formatted <- format(round(sd_val, 0), big.mark = ",")
      return(list(type = "continuous", value = paste0(mean_val_formatted, " (SD: $", sd_val_formatted, ")")))
    } else {
      return(list(type = "continuous", value = paste0(mean_val, " (SD: ", sd_val, ")")))
    }
  }
}

# Function to format factor variables with cleaner presentation and sorting
format_factor <- function(x) {
  tbl <- table(x, useNA = "no")
  pct <- round(prop.table(tbl) * 100, 1)
  # Sort by percentage (highest to lowest)
  sorted_idx <- order(pct, decreasing = TRUE)
  pct <- pct[sorted_idx]
  # Format with indentation for better readability
  result <- paste0("• ", names(pct), ": ", pct, "%", collapse = "<br>")
  return(result)
}

# Create summary tables
demographics_summary <- data.frame(
  Label = character(),
  Summary = character(),
  stringsAsFactors = FALSE
)

# Basic Demographics
basic_demos <- list(
  age = list(var = "connect_age_w1", label = "Age (years)"),
  education = list(var = "connect_education_w1_years", label = "Education (years)"),
  gender = list(var = "connect_gender_w1_clean", label = "Gender"),
  region = list(var = "connect_us_regions_w1_clean", label = "US region"),
  income = list(var = "connect_household_income_w1", label = "Household income ($)"),
  hispanic = list(var = "connect_ethnicity_hispanic", label = "Hispanic/Latino"),
  race = list(var = "connect_race_w1_clean", label = "Race"),
  children = list(var = "connect_children_count_w1", label = "Number of children")
)

# Political Variables
political_vars <- list(
  orientation = list(var = "demos_pol_orient_w1", label = "Left/Right political leaning (0-10)"),
  party = list(var = "connect_political_party_w1_clean", label = "Political party affiliation"),
  trust = list(var = "demos_social_trust_w1", label = "Generally trust people")
)

# Climate and Health Variables
climate_health_vars <- list(
  hospitalized = list(var = "demos_hospitalized_w1", label = "Has ever been hospitalized"),
  chronic = list(var = "demos_chronic_conditions_w1", label = "Has chronic conditions"),
  heat_sensitive = list(var = "demos_heat_sensitivity_w1", label = "Is sensitive to severe heat"),
  severe_heat = list(var = "demos_extreme_weather_severeheat_w1", label = "Experienced severe heat"),
  wildfire = list(var = "demos_extreme_weather_wildfire_w1", label = "Experienced wildfire"),
  flooding = list(var = "demos_extreme_weather_flooding_w1", label = "Experienced flooding"),
  drought = list(var = "demos_extreme_weather_drought_w1", label = "Experienced drought"),
  coastal_storm = list(var = "demos_extreme_weather_coastalsto_w1", label = "Experienced coastal storm"),
  other_extreme = list(var = "demos_extreme_weather_otherextre_w1", label = "Experienced other extreme weather")

)

# Function to process variable list and create summary rows
process_vars <- function(var_list, section_name) {
  rows <- data.frame(
    Label = character(),
    Summary = character(),
    stringsAsFactors = FALSE
  )

  # Add section header as a clean row
  rows <- rbind(rows, data.frame(
    Label = paste0('<span style="font-weight: 700; color: #1976d2; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px;">', section_name, '</span>'),
    Summary = '',
    stringsAsFactors = FALSE
  ))

  # Add separator line after header
  rows <- rbind(rows, data.frame(
    Label = '<hr style="margin: 4px 0; border: none; border-top: 2px solid #e3f2fd;">',
    Summary = '<hr style="margin: 4px 0; border: none; border-top: 2px solid #e3f2fd;">',
    stringsAsFactors = FALSE
  ))

  for (item in var_list) {
    if (item$var %in% names(dt)) {
      if (is.numeric(dt[[item$var]])) {
        result <- format_numeric(dt[[item$var]], item$var)
        summary_text <- result$value
      } else if (is.factor(dt[[item$var]])) {
        summary_text <- format_factor(dt[[item$var]])
      } else {
        summary_text <- "Variable type not supported"
      }

      rows <- rbind(rows, data.frame(
        Label = item$label,
        Summary = summary_text,
        stringsAsFactors = FALSE
      ))
    }
  }

  return(rows)
}

# Process all sections
all_rows <- rbind(
  process_vars(basic_demos, "Demographic Characteristics"),
  process_vars(political_vars, "Political Affiliation"),
  process_vars(climate_health_vars, "Climate Experience and Health Status")
)

# Add custom CSS for alternating row colors
css_string <- '
<style>
  .gmisc_table tbody tr:nth-child(odd) {
    background-color: #ffffff;
  }
  .gmisc_table tbody tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  .gmisc_table td:first-child {
    width: 35%;
  }
  .gmisc_table td:last-child {
    width: 65%;
  }
</style>
'

# Create HTML table manually to avoid header issues
build_html_table <- function(data) {
  # Start table
  html <- '<table class="gmisc_table" style="width: 100%; text-align: left; border-collapse: collapse; font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; font-size: 14px; line-height: 1.5; border: 1px solid #dee2e6;">'
  html <- paste0(html, '<tbody>')

  # Add rows
  for (i in 1:nrow(data)) {
    html <- paste0(html, '<tr>')
    html <- paste0(html, '<td style="padding: 8px 12px; text-align: left; vertical-align: top; width: 35%;">', data$Label[i], '</td>')
    html <- paste0(html, '<td style="padding: 8px 12px; text-align: left; vertical-align: top; width: 65%;">', data$Summary[i], '</td>')
    html <- paste0(html, '</tr>')
  }

  html <- paste0(html, '</tbody>')

  # Add footer
  html <- paste0(html, '<tfoot><tr><td colspan="2" style="font-size: 12px; color: #6c757d; font-style: italic; padding: 12px; background-color: #f8f9fa; border-top: 1px solid #dee2e6;">',
                 'Percentages may not sum to 100 due to rounding.</td></tr></tfoot>')
  html <- paste0(html, '</table>')
  return(html)
}

# Create HTML output
html_output <- paste0(
  css_string,
  '<h2 style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; color: #212529; margin-bottom: 8px;">Participant Demographics <span style="font-weight: normal; font-size: 16px; color: #6c757d;">(N = ', format(nrow(dt), big.mark = ","), ')</span></h2>',
  '<p style="font-family: -apple-system, BlinkMacSystemFont, \'Segoe UI\', Roboto, \'Helvetica Neue\', Arial, sans-serif; font-size: 14px; color: #6c757d; margin-bottom: 16px; line-height: 1.5;">',
  'Percentages are shown for yes/no questions and categories. Averages are shown for numeric measures like age and income.',
  '</p>',
  build_html_table(all_rows)
)

# Save HTML file
writeLines(html_output, "public/demographic_summary.html")

cat("\nDemographic summary saved to:\n")
cat("- public/demographic_summary.html\n")

