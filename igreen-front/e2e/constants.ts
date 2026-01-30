// E2E Test Constants
// Extract timeout values to a centralized location for easier maintenance

export const E2E_TIMEOUTS = {
  // Visibility timeouts
  DEFAULT_VISIBLE: 10000,
  LOGO_VISIBLE: 10000,
  TICKET_VISIBLE: 15000,
  DASHBOARD_LOAD: 15000,
  
  // Navigation timeouts
  PAGE_NAVIGATION: 10000,
  
  // API timeouts
  API_RESPONSE: 5000,
  
  // Wait timeouts
  NETWORK_IDLE: 3000,
  ELEMENT_WAIT: 5000,
} as const;

export type E2ETimeoutKey = keyof typeof E2E_TIMEOUTS;
