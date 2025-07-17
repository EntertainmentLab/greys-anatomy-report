export const CONDITIONS = ["treatment", "handoff"]

export const REGIONS = ["Midwest", "Northeast", "South", "West"]

export const COLOR_MAP = {
  control: '#e8c49e',
  treatment: '#a8c4a2', 
  handoff: '#5a7c47'
}

export const CONDITION_LABELS = {
  control: 'Control',
  treatment: 'Heat Wave Episode Only',
  handoff: 'Multiplatform Group'
}

export const CONDITIONS_CONFIG = [
  {
    id: 'treatment',
    label: 'Treatment',
    description: 'Received educational intervention about health effects'
  },
  {
    id: 'handoff',
    label: 'Multiplatform',
    description: 'Knowledge transfer and retention condition'
  }
]

// Wave labels
export const WAVE_LABELS = {
  2: 'Immediately after viewing',
  3: '15 days later'
}

// Knowledge categories
export const KNOWLEDGE_CATEGORIES = [
  'Heart Attacks',
  'Organ Failure', 
  'Premature Labor',
  'Violent Crime'
]

// Knowledge categories labels (mapping for display)
export const KNOWLEDGE_CATEGORIES_LABELS = {
  'Heart Attacks': 'trigger heart attacks',
  'Organ Failure': 'cause organ failure', 
  'Premature Labor': 'trigger premature labor',
  'Violent Crime': 'increase violent crime'
}

// System impact issues for the Likert chart
export const SYSTEM_IMPACT_ISSUES = [
  'Overcrowding',
  'Surgery Cancellation',
  'Er Visits',
  'Resource Shortage',
  'Response Times',
  'Losing Power'
]

// Health issues for worry chart
export const HEALTH_ISSUES = [
  'Death',
  'Worsening Conditions',
  'Heat Stroke',
  'Dehydration'
]

export const HEALTH_ISSUES_LABELS = {
  'Death': 'Increased risk of death',
  'Worsening Conditions': 'Worsening of chronic conditions',
  'Heat Stroke': 'Heat stroke',
  'Dehydration': 'Dehydration or heat exhaustion'
}

export const RESPONSE_CATEGORIES = [
  { key: 'not_worried', label: 'Not worried', color: '#bb466c' },
  { key: 'little_worried', label: 'A little worried', color: '#cc7591' },
  { key: 'moderately_worried', label: 'Moderately worried', color: '#f1f1f1' },
  { key: 'very_worried', label: 'Very worried', color: '#7faddd' },
  { key: 'extremely_worried', label: 'Extremely worried', color: '#196bc1' }
]

// System response categories
export const SYSTEM_RESPONSE_CATEGORIES = [
  { key: 'not_concerned', label: 'Not concerned', color: '#bb466c' },
  { key: 'little_concerned', label: 'A little concerned', color: '#cc7591' },
  { key: 'moderately_concerned', label: 'Moderately concerned', color: '#f1f1f1' },
  { key: 'quite_concerned', label: 'Quite concerned', color: '#7faddd' },
  { key: 'great_deal_concerned', label: 'A great deal concerned', color: '#196bc1' }
]

// Impact categories
export const IMPACT_CATEGORIES = [
  { key: 'no_impact', label: 'No impact', color: '#d32f2f' },
  { key: 'small_impact', label: 'Small impact', color: '#f57c00' },
  { key: 'moderate_impact', label: 'Moderate impact', color: '#fbc02d' },
  { key: 'large_impact', label: 'Large impact', color: '#388e3c' },
  { key: 'very_large_impact', label: 'Very large impact', color: '#1976d2' }
]

// Time point labels for x-axis
export const TIME_POINTS = [
  "Baseline\n(3 Days Before)",
  "Immediately\nAfter Viewing", 
  "5 days",
  "10 days",
  "15 Days\nLater"
]

// High-level constructs categories
export const HIGH_LEVEL_CONSTRUCTS = [
  'Perceived Likelihood of Heat Waves',
  'Heat Wave Threat Severity',
  'Heat Wave Health Impact',
  'Heat Wave Impact Knowledge'
]

// High-level constructs labels (mapping for display)
export const HIGH_LEVEL_CONSTRUCTS_LABELS = {
  'Perceived Likelihood of Heat Waves': 'Perceived Likelihood of Heat Waves',
  'Heat Wave Threat Severity': 'Heat Wave Threat Severity',
  'Heat Wave Health Impact': 'Heat Wave Health Impact',
  'Heat Wave Impact Knowledge': 'Heat Wave Impact Knowledge'
}

// AME Chart constants
export const AME_OUTCOMES = [
  'Heatwave Likelihood of Exposure',
  'Heatwave Threat Severity', 
  'Heatwave Threat Health Impact',
  'Heatwave Impact Knowledge',
  'Heat and Policy Support',
  'Healthcare Worker Responsibility',
  'Climate Change Personal Impact',
  'Climate Change Support for Action'
]

export const AME_CONTRASTS = [
  'Heat Wave Episode Only vs Control',
  'Multiplatform vs Control',
  'Multiplatform vs Heat Wave Episode Only'
]

export const AME_WAVES = [
  'Immediate',
  '15 Days'
]

// Effect size magnitude thresholds
export const EFFECT_THRESHOLDS = {
  LARGE: 0.4,
  MODERATE: 0.1,
  SMALL: 0.0
}

// Effect size labeling function
export const getEffectSize = (estimate, sig, pValue) => {
  if (!sig || pValue >= 0.05) return "No clear change"
  const absEstimate = Math.abs(estimate)
  if (absEstimate <= 0.1) return "Small increase"
  if (absEstimate <= 0.3) return "Moderate increase"
  return "Large increase"
}