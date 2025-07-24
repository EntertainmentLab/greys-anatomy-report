library(ggplot2)
library(dplyr)
library(jsonlite)

# Read the knowledge data
knowledge_data <- fromJSON("public/data/data-knowledge.json")

# Process the data - extract values from nested arrays
knowledge_processed <- knowledge_data %>%
  mutate(
    condition = sapply(condition, function(x) x[1]),
    category = sapply(category, function(x) x[1]),
    mean = sapply(mean, function(x) x[1]),
    se = sapply(se, function(x) x[1]),
    wave = sapply(wave, function(x) x[1]),
    political_party = sapply(political_party, function(x) x[1]),
    n = sapply(n, function(x) x[1])
  )

# Filter for Wave 2 (immediate), Overall political party, control and treatment only
chart_data <- knowledge_processed %>%
  filter(
    wave == 2,
    political_party == "Overall",
    condition %in% c("control", "treatment")
  ) %>%
  select(condition, category, mean)

# Define question labels in desired order with line breaks for wrapping
question_labels <- data.frame(
  category = c("Heart Attacks", "Organ Failure", "Premature Labor", "Violent Crime"),
  label = c(
    "Trigger heart attacks\namong the vulnerable",
    "Cause organ failure", 
    "Trigger premature labor\nin pregnant women",
    "Increase violent crime"
  ),
  stringsAsFactors = FALSE
)

# Join with labels and reshape for plotting
plot_data <- chart_data %>%
  left_join(question_labels, by = "category") %>%
  mutate(
    condition = case_when(
      condition == "control" ~ "Control Episode",
      condition == "treatment" ~ "Heat-Wave Episode"
    ),
    # Reorder categories by effect size (treatment - control)
    label = factor(label, levels = rev(question_labels$label))
  )

# Create the plot
p <- ggplot(plot_data, aes(x = mean, y = label, fill = condition)) +
  geom_col(position = position_dodge(width = 0.7), width = 0.6) +
  geom_text(aes(label = paste0(round(mean), "%")), 
            position = position_dodge(width = 0.7), 
            hjust = -0.1, size = 4, fontface = "bold") +
  scale_fill_manual(values = c("Control Episode" = "#94a3b8", 
                              "Heat-Wave Episode" = "#ef4444")) +
  scale_x_continuous(limits = c(0, 85), 
                    breaks = seq(0, 80, 20),
                    labels = paste0(seq(0, 80, 20), "%")) +
  labs(
    title = "Knowledge About Heat Health Risks",
    subtitle = '"Please indicate how certain you are about whether the following statements are true or false.\nExtreme heat exposure can..."',
    x = "Percentage Certain Statement is True",
    y = NULL,
    fill = NULL
  ) +
  theme_minimal(base_size = 14) +
  theme(
    plot.title = element_text(size = 18, face = "bold", hjust = 0.5, margin = margin(b = 5)),
    plot.subtitle = element_text(size = 12, hjust = 0.5, color = "gray40", margin = margin(b = 20)),
    legend.position = "bottom",
    legend.text = element_text(size = 12),
    axis.text.y = element_text(size = 11, margin = margin(r = 10)),
    axis.text.x = element_text(size = 11),
    axis.title.x = element_text(size = 12, margin = margin(t = 15)),
    panel.grid.major.y = element_blank(),
    panel.grid.minor = element_blank(),
    panel.grid.major.x = element_line(color = "gray90", size = 0.5),
    plot.margin = margin(20, 40, 20, 20)
  )

# Save as high-quality PNG
ggsave("knowledge_simple_chart.png", plot = p, 
       width = 10, height = 6, dpi = 300, bg = "white")

# Also save as PDF for vector graphics
ggsave("knowledge_simple_chart.pdf", plot = p, 
       width = 10, height = 6, bg = "white")

# Print the data used for verification
print("Data used in chart:")
print(plot_data)

cat("\nChart saved as 'knowledge_simple_chart.png' and 'knowledge_simple_chart.pdf'\n")