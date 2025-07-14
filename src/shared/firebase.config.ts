// Firebase configuration
// Replace these values with your actual Firebase project config
export const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || '',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || ''
};

// Collection names with project prefix
export const COLLECTIONS = {
  USERS: 'cmp_users',
  LICENSES: 'cmp_licenses',
  SCANS: 'cmp_scans',
  ANALYTICS: 'cmp_analytics',
  PRO_REQUESTS: 'cmp_pro_requests',
  UPGRADE_LOGS: 'cmp_upgrade_logs'
} as const;

// Storage paths with project prefix
export const STORAGE_PATHS = {
  USER_AVATARS: 'cmp_user_avatars',
  SCAN_REPORTS: 'cmp_scan_reports'
} as const;