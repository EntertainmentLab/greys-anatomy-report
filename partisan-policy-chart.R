library(ggplot2)
library(dplyr)
library(jsonlite)

# Read the policy data
policy_data_raw <- fromJSON("public/data/data-policy-support.json")

# Process the data - extract values from nested arrays
policy_processed <- policy_data_raw %>%
  mutate(
    condition = sapply(condition, function(x) x[1]),
    category = sapply(category, function(x) x[1]),
    mean = sapply(mean, function(x) x[1]),
    se = sapply(se, function(x) x[1]),
    wave = sapply(wave, function(x) x[1]),
    political_party = sapply(political_party, function(x) x[1]),
    n = sapply(n, function(x) x[1])
  )

# Filter for Wave 2, Democrat and Republican, control and treatment, both policies
policy_data <- policy_processed %>%
  filter(
    wave == 2,
    political_party %in% c("Democrat", "Republican"),
    condition %in% c("control", "treatment"),
    category %in% c("Government Investment", "Cooling Centers")
  ) %>%
  select(condition, political_party, category, mean) %>%
  mutate(
    condition = case_when(
      condition == "control" ~ "Control Episode",
      condition == "treatment" ~ "Heat-Wave Episode"
    ),
    condition = factor(condition, levels = c("Control Episode", "Heat-Wave Episode")),
    # Use actual policy wording with narrower wrapping
    category_short = case_when(
      category == "Government Investment" ~ "Federal, State, and Local Governments\nshould invest resources to ensure that\nhospitals can run safely and effectively\nin severe heat waves",
      category == "Cooling Centers" ~ "State and local governments should provide\nair-conditioned public spaces for people\nto use during severe heat waves to prevent\nheat-related health issues"
    )
  )

# Create the plot with facets for each policy - horizontal layout
p <- ggplot(policy_data, aes(y = political_party, x = mean, fill = condition)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(round(mean), "%")), 
            position = position_dodge(width = 0.7), 
            hjust = -0.1, size = 4, fontface = "bold") +
  facet_wrap(~category_short, scales = "free_y") +
  scale_fill_manual(values = c("Control Episode" = "#94a3b8", "Heat-Wave Episode" = "#ef4444"),
                    name = NULL) +
  scale_x_continuous(limits = c(0, 95), 
                    breaks = seq(0, 90, 20),
                    labels = paste0(seq(0, 90, 20), "%")) +
  labs(
    title = "Support for Heat-Related Health Policies by Political Party",
    subtitle = '"Do you support or oppose the following policies?"',
    x = "Percentage Support",
    y = NULL,
    fill = NULL
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(size = 18, face = "bold", hjust = 0.5, margin = margin(b = 5)),
    plot.subtitle = element_text(size = 12, hjust = 0.5, color = "gray40", margin = margin(b = 20)),
    legend.position = "bottom",
    legend.text = element_text(size = 12),
    axis.text.y = element_text(size = 11, face = "bold"),
    axis.text.x = element_text(size = 11),
    axis.title.x = element_text(size = 12, margin = margin(t = 15)),
    strip.text = element_text(size = 11, face = "plain", lineheight = 0.9),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_line(color = "gray90", linewidth = 0.5),
    plot.margin = margin(20, 40, 20, 20),
    legend.margin = margin(t = 15)
  )

# Calculate and display differences for each policy
policy_effects <- policy_data %>%
  group_by(category_short, political_party) %>%
  summarise(
    effect = mean[condition == "Heat-Wave Episode"] - mean[condition == "Control Episode"],
    .groups = "drop"
  )

# Add effect size labels for Republican Heat-Wave Episode bars only
republican_gains <- policy_data %>%
  filter(political_party == "Republican") %>%
  group_by(category_short) %>%
  summarise(
    effect = mean[condition == "Heat-Wave Episode"] - mean[condition == "Control Episode"],
    heat_wave_mean = mean[condition == "Heat-Wave Episode"],
    .groups = "drop"
  ) %>%
  mutate(
    label_x = heat_wave_mean + 12,  # Position label much further to the right of the bar
    effect_label = paste0("+", round(effect, 1), "%")
  )

p <- p +
  geom_text(data = republican_gains,
            aes(y = "Republican", x = label_x, label = effect_label),
            size = 3, color = "red", fontface = "bold",
            vjust = 0.25, inherit.aes = FALSE)

cat("\nPolicy effects by party:\n")
print(policy_effects)

# Save as high-quality PNG
ggsave("partisan_policy_chart.png", plot = p, 
       width = 10, height = 6, dpi = 300, bg = "white")

# Also save as PDF for vector graphics
ggsave("partisan_policy_chart.pdf", plot = p, 
       width = 10, height = 6, bg = "white")

# Print the data used for verification
print("Data used in chart:")
print(policy_data)

cat("Chart saved as 'partisan_policy_chart.png' and 'partisan_policy_chart.pdf'\n")