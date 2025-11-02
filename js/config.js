// Global Configuration
// Webhook API Endpoints

const WEBHOOKS = {
  // MRZ_SCAN: 'https://api.perceptionist.top/webhook-test/tb_sense_mrz',
  // COUGH_ANALYSIS: 'https://api.perceptionist.top/webhook/cough-data-acq',
  // MRZ_SCAN: 'https://api.perceptionist.top/webhook/tb_sense_mrz',
  COUGH_ANALYSIS: "https://api.perceptionist.top/webhook-test/cough-data-acq",
  // Add more webhook URLs here as needed
  // RESULT_SUBMISSION: 'https://api.perceptionist.top/webhook-test/tb_sense_result',
};

// Make WEBHOOKS globally accessible
window.WEBHOOKS = WEBHOOKS;
