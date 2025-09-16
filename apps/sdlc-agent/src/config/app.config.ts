// Application configuration
export const APP_CONFIG = {
  // API endpoints
  api: {
    baseUrl: 'http://localhost:8000',
    endpoints: {
      models: '/models',
      modelsSet: '/models/set',
      requirementsAssess: '/requirements/assess',
      requirementsRecommend: '/requirements/recommend',
      requirementsImplementImprovements: '/requirements/implement-improvements',
      improvementStart: '/improvement/start',
      improvementDecision: '/improvement/decision',
      improvementStatus: '/improvement/status',
      generateApiSpec: '/generate/api-specification',
      generateDataModel: '/generate/data-model',
      generateDatabaseSchema: '/generate/database-schema',
      generateBusinessLogic: '/generate/business-logic',
      generateTestSuite: '/generate/test-suite',
      uploadFile: '/upload/file',
      getBoilerplates: '/boilerplates',
      getBoilerplateReadme: '/boilerplate/readme'
    }
  },
  
  // Timeout configurations (in milliseconds)
  timeouts: {
    // Improvement workflow timeouts
    improvementFetch: 180000,     // 180 seconds for fetch request
    improvementModal: 185000,      // 185 seconds for modal (slightly longer than fetch)
    
    // General API timeouts
    defaultFetch: 30000,           // 30 seconds default
    longRunningFetch: 120000,      // 120 seconds for long operations
    
    // UI timeouts
    modalAutoClose: 5000,          // 5 seconds for success modals
    notificationDuration: 3000,    // 3 seconds for notifications
    
    // Polling intervals
    statusPollingInterval: 2000,   // 2 seconds for status checks
    maxPollingAttempts: 90        // Max 90 attempts (3 minutes with 2s interval)
  },
  
  // Quality thresholds
  quality: {
    targetScore: 85,               // Target quality score for YOLO
    minAcceptableScore: 70,        // Minimum acceptable score
    maxYoloIterations: 5,          // Maximum iterations for YOLO cycle
    scoreImprovement: 10           // Expected score improvement per iteration
  },
  
  // UI settings
  ui: {
    maxFileSize: 10485760,         // 10MB max file size
    maxLogEntries: 100,            // Maximum activity log entries to display
    animationDuration: 500,        // Animation duration in ms
    debounceDelay: 300            // Debounce delay for input fields
  },
  
  // Feature flags
  features: {
    enableTemporalWorkflow: false, // Use Temporal workflow for improvements
    enableMockMode: false,         // Enable mock mode for testing
    enableDebugLogging: true,      // Enable debug console logging
    enableAutoSave: false,         // Auto-save requirements
    enableYoloMode: true          // Enable YOLO automation
  }
};

// Type-safe config getter with path support
export function getConfig<T = any>(path: string): T {
  const keys = path.split('.');
  let value: any = APP_CONFIG;
  
  for (const key of keys) {
    value = value?.[key];
    if (value === undefined) {
      console.warn(`Config key not found: ${path}`);
      return undefined as T;
    }
  }
  
  return value as T;
}

// Export individual timeout values for convenience
export const TIMEOUTS = APP_CONFIG.timeouts;
export const API_CONFIG = APP_CONFIG.api;
export const QUALITY_CONFIG = APP_CONFIG.quality;
export const UI_CONFIG = APP_CONFIG.ui;
export const FEATURES = APP_CONFIG.features;