export const SearchConfig = {
  // UI Configuration
  debounceDelayMs: 300,
  maxLiveSuggestions: 8,
  minQueryLength: 2,

  // Ranking Weights
  weights: {
    exactProductMatch: 100,
    partialTitleMatch: 90,
    categoryMatch: 80,
    keywordMatch: 70,
    tagMatch: 60,
    descriptionMatch: 30,
  },

  // Thresholds
  typoThreshold: 2, // Maximum Levenshtein distance to consider a match (if enabled)
  categoryIntentThreshold: 80, // Minimum score to assume Category Intent
  
  // Default values
  popularSearches: [
    'coffee table',
    'organic soap',
    'macrame tote',
    'wooden chair',
    'return gift'
  ]
};
