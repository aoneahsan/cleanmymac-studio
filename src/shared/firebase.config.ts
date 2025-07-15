// Firebase configuration
// This will be populated from environment variables in the renderer process
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Collection names with project prefix
export const COLLECTIONS = {
  USERS: 'cmp_users',
  LICENSES: 'cmp_licenses',
  SCANS: 'cmp_scans',
  CLEANUPS: 'cmp_cleanups',
  USER_STATS: 'cmp_user_stats',
  ANALYTICS: 'cmp_analytics',
  PRO_REQUESTS: 'cmp_pro_requests',
  UPGRADE_LOGS: 'cmp_upgrade_logs'
} as const;

// Storage paths with project prefix
export const STORAGE_PATHS = {
  USER_AVATARS: 'cmp_user_avatars',
  SCAN_REPORTS: 'cmp_scan_reports'
} as const;