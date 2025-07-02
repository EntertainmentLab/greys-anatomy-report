export const CATEGORIES = ["Cancer", "Violent Crime", "Premature Labor", "Organ Failure", "Heart Attacks"]

export const CONDITIONS = ["control", "treatment", "handoff"]

export const REGIONS = ["Midwest", "Northeast", "South", "West"]

export const HEALTH_ISSUES = ["Death", "Worsening Conditions", "Heat Stroke", "Dehydration"]

export const COLOR_MAP = {
  control: '#f0c4a0',
  treatment: '#a8c4a2', 
  handoff: '#5a7c47'
}

export const CONDITION_LABELS = {
  control: 'Control',
  treatment: 'Heat Wave',
  handoff: 'Heat Wave + Handoff'
}

export const RESPONSE_CATEGORIES = [
  { key: 'not_worried', label: 'Not worried', color: '#bb466c' },
  { key: 'little_worried', label: 'A little worried', color: '#cc7591' },
  { key: 'moderately_worried', label: 'Moderately worried', color: '#f1f1f1' },
  { key: 'very_worried', label: 'Very worried', color: '#7faddd' },
  { key: 'extremely_worried', label: 'Extremely worried', color: '#196bc1' }
]

export const CONDITIONS_CONFIG = [
  {
    id: 'control',
    label: 'Control',
    description: 'No intervention - baseline knowledge measurement'
  },
  {
    id: 'treatment',
    label: 'Treatment',
    description: 'Received educational intervention about health effects'
  },
  {
    id: 'handoff',
    label: 'Handoff',
    description: 'Knowledge transfer and retention condition'
  }
]

export const WAVE_LABELS = {
  2: 'Immediately after viewing',
  3: '15 days later'
}

export const SYSTEM_IMPACT_ISSUES = ["Cancellation of surgeries", "Hospitals losing power", "Staff or resource shortages", "Hospitals overcrowding", "Increased ER visits", "Increased response times"]

export const SYSTEM_RESPONSE_CATEGORIES = [
  { key: 'not_at_all', label: 'Not at all', color: '#bb466c' },
  { key: 'a_little_amount', label: 'A little amount', color: '#cc7591' },
  { key: 'a_moderate_amount', label: 'A moderate amount', color: '#f1f1f1' },
  { key: 'quite_a_bit', label: 'Quite a bit', color: '#7faddd' },
  { key: 'a_great_deal', label: 'A great deal', color: '#196bc1' }
]

// Add these to your existing constants.js file

// Climate temporal proximity wave labels
export const CLIMATE_TEMPORAL_WAVES = [
  { wave: 1, label: "Baseline\n(3 Days Before)", shortLabel: "Baseline" },
  { wave: 2, label: "Immediately\nAfter Viewing", shortLabel: "Immediate" },
  { wave: 3, label: "15 Days\nLater", shortLabel: "15 Days Later" }
]

// Climate temporal proximity conditions with colors
export const CLIMATE_CONDITIONS = [
  { name: "Control", color: "#e879b9" },      // Pink
  { name: "Heat Wave", color: "#60a5fa" },     // Light blue
  { name: "Heat Wave + Handoff", color: "#2563eb" } // Dark blue
]

// Time point labels for x-axis
export const TIME_POINTS = [
  "Baseline\n(3 Days Before)",
  "Immediately\nAfter Viewing", 
  "5 days",
  "10 days",
  "15 Days\nLater"
]