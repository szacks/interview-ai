/**
 * Application Configuration
 * Centralized configuration for the frontend application.
 * All values use environment variables with sensible defaults.
 */

export const appConfig = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080/api',
    timeout: parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000', 10),
  },

  // WebSocket Configuration
  websocket: {
    reconnectDelay: parseInt(process.env.NEXT_PUBLIC_WS_RECONNECT_DELAY || '5000', 10),
    heartbeatIncoming: parseInt(process.env.NEXT_PUBLIC_WS_HEARTBEAT_IN || '10000', 10),
    heartbeatOutgoing: parseInt(process.env.NEXT_PUBLIC_WS_HEARTBEAT_OUT || '10000', 10),
  },

  // Application Metadata
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || 'InterviewAI',
    version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  },

  // Feature Flags
  features: {
    enableDebugLogs: process.env.NEXT_PUBLIC_ENABLE_DEBUG_LOGS === 'true',
    enableAnalytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true',
  },
} as const;

// Type-safe config access
export type AppConfig = typeof appConfig;

// Helper to check if running in development
export const isDevelopment = () => appConfig.app.environment === 'development';

// Helper to check if running in production
export const isProduction = () => appConfig.app.environment === 'production';

// Export individual sections for easier imports
export const { api: apiConfig, websocket: wsConfig, app: appMetadata, features } = appConfig;
