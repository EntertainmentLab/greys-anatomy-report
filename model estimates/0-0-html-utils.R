# ================================================================
# HTML UTILITIES
# ================================================================
# This file contains HTML styling and generation functions.
# ================================================================

# Load data configuration
# Data config is loaded by main config file

# ============================================================
# HTML STYLING TEMPLATE
# ============================================================
get_html_style <- function() {
    return(paste0(
        "body { font-family: 'Times New Roman', Times, serif; font-size: 12pt; line-height: 1.4; margin: 40px auto; max-width: 1200px; background-color: white; color: #333; }\n",
        "h1 { font-size: 18pt; font-weight: bold; text-align: center; margin: 20px 0 30px 0; color: #000; }\n",
        "h2 { font-size: 14pt; font-weight: bold; margin: 30px 0 15px 0; color: #000; border-bottom: 1px solid #ccc; padding-bottom: 5px; }\n",
        "h3 { font-size: 11pt; font-weight: bold; margin: 25px 0 10px 0; color: #333; background-color: #f5f5f5; padding: 5px; border-bottom: 1px solid #ddd; }\n",
        "table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 11pt; }\n",
        "th { background-color: white; color: #000; padding: 8px 6px; text-align: center; font-weight: bold; border-top: 2px solid #000; border-bottom: 1px solid #000; }\n",
        "th.main-header { border-bottom: none; }\n",
        "th.sub-header { font-size: 10pt; border-top: none; border-bottom: 1px solid #000; font-style: italic; }\n",
        "td { padding: 6px 6px; text-align: center; vertical-align: top; border: none; font-size: 10pt; }\n",
        "tr:last-child td { border-bottom: 1px solid #ccc; }\n",
        ".outcome-col { text-align: left; font-weight: normal; min-width: 180px; }\n",
        ".ci { font-size: 9pt; color: #666; font-style: italic; }\n",
        ".fdr { font-size: 8pt; color: #888; font-style: italic; }\n",
        ".note { margin-top: 15px; font-size: 10pt; line-height: 1.3; }\n",
        ".note-title { font-style: italic; }\n",
        ".section-break { margin-top: 40px; }\n",
        ".category-row { background-color: #f5f5f5; font-weight: bold; border-top: 1px solid #ccc; }\n",
        ".category-row td { text-align: left; }\n",
        ".purpose { margin-bottom: 30px; font-size: 11pt; line-height: 1.4; background-color: #f9f9f9; padding: 15px; border-left: 4px solid #ccc; }\n",
        ".purpose-title { font-weight: bold; margin-bottom: 10px; }\n",
        ".subtitle { text-align: center; font-size: 12pt; font-weight: normal; margin-top: 0; margin-bottom: 30px; color: #444; border-bottom: none; padding-bottom: 0; }\n",
        "/* Border styles for improved table readability */\n",
        ".contrast-border { border-left: 1px solid #ccc; position: relative; z-index: 20; }\n", 
        ".wave-border { border-left: none; }\n", 
        ".subgroup-border { border-left: none; }\n",
        ".immediate-section { background-color: #fcfcfc; }\n",
        ".followup-section { background-color: #f2f2f2; }\n", 
        "tr.category-row td { position: relative; z-index: 5; }\n", 
        "th, td { position: relative; }\n", 
        "td.contrast-border, th.contrast-border { border-left: 1px solid #ccc !important; }\n" 
    ))
}

# ============================================================
# COMMON HTML GENERATION FUNCTIONS
# ============================================================
create_html_header <- function(title, subtitle = NULL) {
    html_content <- paste0(
        "<!DOCTYPE html>\n<html>\n<head>\n<meta charset='utf-8'>\n",
        "<title>", title, "</title>\n",
        "<style>\n", get_html_style(), "</style>\n</head>\n<body>\n",
        "<h1>", title, "</h1>\n"
    )
    
    if (!is.null(subtitle)) {
        html_content <- paste0(
            html_content,
            "<h2 class='subtitle'>",
            subtitle, "</h2>\n"
        )
    }
    
    return(html_content)
}

create_html_footer <- function(note_text) {
    return(paste0(
        "<div class='note'>\n",
        "<span class='note-title'>Note:</span> ",
        note_text, "\n",
        "</div>\n",
        "</body>\n</html>"
    ))
}

# ============================================================
# COMMON UTILITY FUNCTIONS
# ============================================================
add_significance_stars <- function(p_values) {
    case_when(
        p_values < 0.001 ~ "***",
        p_values < 0.01 ~ "**", 
        p_values < 0.05 ~ "*",
        p_values < 0.1 ~ "†",
        TRUE ~ ""
    )
}

format_estimate_with_ci <- function(estimate, std_error, p_value, use_fdr = FALSE, fdr_p = NULL) {
    ci_lower <- estimate - 1.96 * std_error
    ci_upper <- estimate + 1.96 * std_error
    
    if (use_fdr && !is.null(fdr_p)) {
        stars <- add_significance_stars(fdr_p)
        fdr_text <- paste0("<br><span class='fdr'>FDR p = ", sprintf("%.3f", fdr_p), "</span>")
    } else {
        stars <- add_significance_stars(p_value)
        fdr_text <- ""
    }
    
    return(paste0(
        sprintf("%.3f", estimate), stars, "<br><span class='ci'>",
        "(", sprintf("%.3f", ci_lower), ", ", sprintf("%.3f", ci_upper), ")</span>",
        fdr_text
    ))
}

# Helper function to create dual-wave table HTML
create_dual_wave_table_html <- function(contrast_data) {
    if (is.null(contrast_data) || nrow(contrast_data) == 0) {
        return("<p>No data available for this section.</p>\n")
    }
    
    # Extract unique contrasts and create column structure
    all_cols <- colnames(contrast_data)
    
    # Check if category column exists
    has_category <- "category" %in% all_cols
    data_cols <- if (has_category) all_cols[!all_cols %in% c("outcome", "category")] else all_cols[!all_cols %in% c("outcome")]
    
    # Extract contrast types (treatment vs control, etc.)
    contrast_types <- unique(gsub("_(Immediate|\\+ 15 days)$", "", data_cols))
    
    table_html <- "<table>\n<thead>\n"
    
    # Main header row - empty top left corner and contrast borders
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col main-header' style='border-top: none; border-bottom: none;'></th>\n")
    for (i in seq_along(contrast_types)) {
        contrast <- contrast_types[i]
        formatted_contrast <- gsub("treatment vs control", "Heat Wave Episode Only vs. Control", contrast)
        formatted_contrast <- gsub("handoff vs control", "Multiplatform vs. Control", formatted_contrast)
        formatted_contrast <- gsub("handoff vs treatment", "Multiplatform vs. Heat Wave Episode Only", formatted_contrast)

        # Add contrast border to all contrast groups except the first
        if (i == 1) {
            table_html <- paste0(table_html, "<th colspan='2' class='main-header'>", formatted_contrast, "</th>\n")
        } else {
            table_html <- paste0(table_html, "<th colspan='2' class='main-header contrast-border'>", formatted_contrast, "</th>\n")
        }
    }
    table_html <- paste0(table_html, "</tr>\n")
    
    # Sub-header row with wave labels - empty top left corner
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col sub-header' style='border-top: none; border-bottom: none;'></th>\n")
    for (i in seq_along(contrast_types)) {
        # Add contrast border to all contrast groups except the first
        if (i == 1) {
            table_html <- paste0(table_html, "<th class='sub-header'>Immediate</th>\n")
            table_html <- paste0(table_html, "<th class='sub-header'>+ 15 days</th>\n")
        } else {
            table_html <- paste0(table_html, "<th class='sub-header contrast-border'>Immediate</th>\n")
            table_html <- paste0(table_html, "<th class='sub-header'>+ 15 days</th>\n")
        }
    }
    table_html <- paste0(table_html, "</tr>\n</thead>\n<tbody>\n")
    
    # Data rows
    current_category <- ""
    for (i in 1:nrow(contrast_data)) {
        # Add category header if changed and if category column exists
        if (has_category && contrast_data$category[i] != current_category) {
            current_category <- contrast_data$category[i]
            table_html <- paste0(table_html, "<tr class='category-row'>\n")
            table_html <- paste0(table_html, "<td colspan='", 1 + 2 * length(contrast_types), "'>", current_category, "</td>\n")
            table_html <- paste0(table_html, "</tr>\n")
        }
        
        table_html <- paste0(table_html, "<tr>\n<td class='outcome-col'>", contrast_data$outcome[i], "</td>\n")
        
        for (j in seq_along(contrast_types)) {
            contrast <- contrast_types[j]
            immediate_col <- paste0(contrast, "_Immediate")
            followup_col <- paste0(contrast, "_+ 15 days")
            
            immediate_val <- if (immediate_col %in% names(contrast_data)) contrast_data[[immediate_col]][i] else NA
            followup_val <- if (followup_col %in% names(contrast_data)) contrast_data[[followup_col]][i] else NA
            
            immediate_content <- if (!is.na(immediate_val)) immediate_val else "—"
            followup_content <- if (!is.na(followup_val)) followup_val else "—"
            
            # Add contrast border to all contrast groups except the first
            if (j == 1) {
                table_html <- paste0(table_html, "<td>", immediate_content, "</td>\n")
            } else {
                table_html <- paste0(table_html, "<td class='contrast-border'>", immediate_content, "</td>\n")
            }
            table_html <- paste0(table_html, "<td>", followup_content, "</td>\n")
        }
        table_html <- paste0(table_html, "</tr>\n")
    }
    
    table_html <- paste0(table_html, "</tbody>\n</table>\n")
    return(table_html)
}

# Unified function for subgroup comparison tables (4 columns per contrast)
create_subgroup_comparison_table_html <- function(contrast_data, subgroup_labels = c("Group A", "Group B")) {
    if (is.null(contrast_data) || nrow(contrast_data) == 0) {
        return("<p>No data available for this analysis.</p>\n")
    }
    
    # Get unique contrast types and structure
    contrast_types <- c("treatment vs control", "handoff vs control", "handoff vs treatment")
    waves <- c("Immediate", "+ 15 days")
    
    table_html <- "<table>\n<thead>\n"
    
    # Main header row - empty top left corner and contrast borders
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col main-header' style='border-top: none; border-bottom: none;'></th>\n")
    for (i in seq_along(contrast_types)) {
        contrast <- contrast_types[i]
        formatted_contrast <- gsub("treatment vs control", "Heat Wave Episode Only vs. Control", contrast)
        formatted_contrast <- gsub("handoff vs control", "Multiplatform vs. Control", formatted_contrast)
        formatted_contrast <- gsub("handoff vs treatment", "Multiplatform vs. Heat Wave Episode Only", formatted_contrast)

        # Add contrast border to all contrast groups except the first
        if (i == 1) {
            table_html <- paste0(table_html, "<th colspan='4' class='main-header'>", formatted_contrast, "</th>\n")
        } else {
            table_html <- paste0(table_html, "<th colspan='4' class='main-header contrast-border'>", formatted_contrast, "</th>\n")
        }
    }
    table_html <- paste0(table_html, "</tr>\n")
    
    # Sub-header row - waves - empty top left corner
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col sub-header' style='border-top: none; border-bottom: none;'></th>\n")
    for (i in seq_along(contrast_types)) {
        for (j in seq_along(waves)) {
            wave <- waves[j]
            # Apply contrast border to first column of each contrast group except the first
            if (i == 1 && j == 1) {
                table_html <- paste0(table_html, "<th colspan='2' class='sub-header'>", wave, "</th>\n")
            } else if (j == 1) {
                table_html <- paste0(table_html, "<th colspan='2' class='sub-header contrast-border'>", wave, "</th>\n")
            } else {
                table_html <- paste0(table_html, "<th colspan='2' class='sub-header'>", wave, "</th>\n")
            }
        }
    }
    table_html <- paste0(table_html, "</tr>\n")
    
    # Third header row - subgroups - empty top left corner
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col sub-header' style='border-top: none; border-bottom: none;'></th>\n")
    for (i in seq_along(contrast_types)) {
        for (j in seq_along(waves)) {
            # Apply contrast border to first column of each contrast group except the first
            if (i == 1 && j == 1) {
                table_html <- paste0(table_html, "<th class='sub-header'>", subgroup_labels[1], "</th>\n")
                table_html <- paste0(table_html, "<th class='sub-header'>", subgroup_labels[2], "</th>\n")
            } else if (j == 1) {
                table_html <- paste0(table_html, "<th class='sub-header contrast-border'>", subgroup_labels[1], "</th>\n")
                table_html <- paste0(table_html, "<th class='sub-header'>", subgroup_labels[2], "</th>\n")
            } else {
                table_html <- paste0(table_html, "<th class='sub-header'>", subgroup_labels[1], "</th>\n")
                table_html <- paste0(table_html, "<th class='sub-header'>", subgroup_labels[2], "</th>\n")
            }
        }
    }
    table_html <- paste0(table_html, "</tr>\n</thead>\n<tbody>\n")
    
    # Data rows organized by category (if category column exists)
    has_category <- "category" %in% colnames(contrast_data)
    current_category <- ""
    for (i in 1:nrow(contrast_data)) {
        # Add category header if changed and if category column exists
        if (has_category && contrast_data$category[i] != current_category) {
            current_category <- contrast_data$category[i]
            table_html <- paste0(table_html, "<tr class='category-row'>\n")
            table_html <- paste0(table_html, "<td colspan='", 1 + 4 * length(contrast_types), "'>", current_category, "</td>\n")
            table_html <- paste0(table_html, "</tr>\n")
        }
        
        table_html <- paste0(table_html, "<tr>\n<td class='outcome-col'>", contrast_data$outcome[i], "</td>\n")
        
        for (i_contrast in seq_along(contrast_types)) {
            contrast <- contrast_types[i_contrast]
            for (j_wave in seq_along(waves)) {
                wave <- waves[j_wave]
                
                # Determine background class by wave
                bg_class <- if (j_wave == 1) "immediate-section" else "followup-section"
                
                # Determine if border needed (only between contrast types and only for first contrast)
                border_class <- if (i_contrast > 1 && j_wave == 1) " contrast-border" else ""
                
                # Combine classes for first column of each wave
                cell_class <- paste0(bg_class, border_class)
                
                # First subgroup column
                col_name <- paste(contrast, wave, subgroup_labels[1], sep = "_")
                cell_value <- if (col_name %in% names(contrast_data)) contrast_data[[col_name]][i] else NA
                cell_content <- if (!is.na(cell_value)) cell_value else "—"
                table_html <- paste0(table_html, "<td class='", cell_class, "'>", cell_content, "</td>\n")
                
                # Second subgroup column (same background, no border)
                col_name <- paste(contrast, wave, subgroup_labels[2], sep = "_")
                cell_value <- if (col_name %in% names(contrast_data)) contrast_data[[col_name]][i] else NA
                cell_content <- if (!is.na(cell_value)) cell_value else "—"
                table_html <- paste0(table_html, "<td class='", bg_class, "'>", cell_content, "</td>\n")
            }
        }
        table_html <- paste0(table_html, "</tr>\n")
    }
    
    table_html <- paste0(table_html, "</tbody>\n</table>\n")
    return(table_html)
}

# Wrapper functions for backwards compatibility and clarity
create_political_table_html <- function(contrast_data) {
    return(create_subgroup_comparison_table_html(contrast_data, c("Democrat", "Republican")))
}

create_subgroup_table_html <- function(contrast_data) {
    # Debug output
    if (!is.null(contrast_data)) {
        cat("Heat wave subgroup table - dimensions:", dim(contrast_data), "\n")
        cat("Heat wave subgroup table - columns:", names(contrast_data), "\n")
    } else {
        cat("Heat wave subgroup table - contrast_data is NULL\n")
        return("<p>No heat wave experience data available.</p>\n")
    }
    
    return(create_subgroup_comparison_table_html(contrast_data, c("No Exp", "Any Exp")))
}

# Helper function to create individual matrix table HTML
create_individual_matrix_table_html <- function(contrast_data) {
    if (is.null(contrast_data) || nrow(contrast_data) == 0) {
        return("<p>No individual matrix data available.</p>\n")
    }
    
    # Extract unique contrasts and create column structure
    all_cols <- colnames(contrast_data)
    
    # Check if category column exists
    has_category <- "category" %in% all_cols
    data_cols <- if (has_category) all_cols[!all_cols %in% c("outcome", "category")] else all_cols[!all_cols %in% c("outcome")]
    
    # Extract contrast types (treatment vs control, etc.)
    contrast_types <- unique(gsub("_(Immediate|\\+ 15 days)$", "", data_cols))
    
    table_html <- "<table>\n<thead>\n"
    
    # Main header row
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col main-header'></th>\n")
    for (i in seq_along(contrast_types)) {
        contrast <- contrast_types[i]
        formatted_contrast <- gsub("treatment vs control", "Heat Wave Episode Only vs. Control", contrast)
        formatted_contrast <- gsub("handoff vs control", "Multiplatform vs. Control", formatted_contrast)
        formatted_contrast <- gsub("handoff vs treatment", "Multiplatform vs. Heat Wave Episode Only", formatted_contrast)

        # Add contrast border to all contrast groups except the first
        if (i == 1) {
            table_html <- paste0(table_html, "<th colspan='2' class='main-header'>", formatted_contrast, "</th>\n")
        } else {
            table_html <- paste0(table_html, "<th colspan='2' class='main-header contrast-border'>", formatted_contrast, "</th>\n")
        }
    }
    table_html <- paste0(table_html, "</tr>\n")
    
    # Sub-header row with wave labels
    table_html <- paste0(table_html, "<tr>\n<th class='outcome-col sub-header'></th>\n")
    for (i in seq_along(contrast_types)) {
        # Add contrast border to all contrast groups except the first
        if (i == 1) {
            table_html <- paste0(table_html, "<th class='sub-header'>Immediate</th>\n")
            table_html <- paste0(table_html, "<th class='sub-header'>+ 15 days</th>\n")
        } else {
            table_html <- paste0(table_html, "<th class='sub-header contrast-border'>Immediate</th>\n")
            table_html <- paste0(table_html, "<th class='sub-header'>+ 15 days</th>\n")
        }
    }
    table_html <- paste0(table_html, "</tr>\n</thead>\n<tbody>\n")
    
    # Data rows
    current_category <- ""
    for (i in 1:nrow(contrast_data)) {
        # Add category header if changed and if category column exists
        if (has_category && contrast_data$category[i] != current_category) {
            current_category <- contrast_data$category[i]
            table_html <- paste0(table_html, "<tr class='category-row'>\n")
            table_html <- paste0(table_html, "<td colspan='", 1 + 2 * length(contrast_types), "'>", current_category, "</td>\n")
            table_html <- paste0(table_html, "</tr>\n")
        }
        
        table_html <- paste0(table_html, "<tr>\n<td class='outcome-col'>", contrast_data$outcome[i], "</td>\n")
        
        for (j in seq_along(contrast_types)) {
            contrast <- contrast_types[j]
            immediate_col <- paste0(contrast, "_Immediate")
            followup_col <- paste0(contrast, "_+ 15 days")
            
            immediate_val <- if (immediate_col %in% names(contrast_data)) contrast_data[[immediate_col]][i] else NA
            followup_val <- if (followup_col %in% names(contrast_data)) contrast_data[[followup_col]][i] else NA
            
            immediate_content <- if (!is.na(immediate_val)) immediate_val else "—"
            followup_content <- if (!is.na(followup_val)) followup_val else "—"
            
            # Add contrast border to all contrast groups except the first
            if (j == 1) {
                table_html <- paste0(table_html, "<td>", immediate_content, "</td>\n")
            } else {
                table_html <- paste0(table_html, "<td class='contrast-border'>", immediate_content, "</td>\n")
            }
            table_html <- paste0(table_html, "<td>", followup_content, "</td>\n")
        }
        table_html <- paste0(table_html, "</tr>\n")
    }
    
    table_html <- paste0(table_html, "</tbody>\n</table>\n")
    return(table_html)
}