// Global Configuration
// Webhook API Endpoints

const WEBHOOKS = {
  COUGH_ANALYSIS: "https://api.perceptionist.top/webhook/cough-data-analysis",
  COUGH_STORAGE: "https://api.perceptionist.top/webhook/cough-data-store",
  // COUGH_ANALYSIS: "https://api.perceptionist.top/webhook/cough-data-analysis",
  // COUGH_STORAGE: "https://api.perceptionist.top/webhook/cough-data-store",
  // Add more webhook URLs here as needed
  // RESULT_SUBMISSION: 'https://api.perceptionist.top/webhook-test/tb_sense_result',
};

// Make WEBHOOKS globally accessible
window.WEBHOOKS = WEBHOOKS;
