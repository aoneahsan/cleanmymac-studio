# Firebase Configuration for Mac App Store Sandbox

This guide explains how to configure Firebase for a sandboxed Electron app distributed through the Mac App Store.

## Overview

Mac App Store apps run in a sandbox environment with restricted network access and file system permissions. This requires special Firebase configuration to ensure proper functionality.

## Firebase Project Setup

### 1. Create Separate Projects

Create two Firebase projects:
- `cleanmymac-pro-dev` - For development and testing
- `cleanmymac-pro-prod` - For production Mac App Store release

### 2. Enable Required Services

In each project, enable:
- Authentication (Email/Password, Google, GitHub)
- Cloud Firestore
- Cloud Storage
- Analytics (production only)

## Security Rules

### Firestore Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scan history - users can only access their own
    match /scanHistory/{userId}/scans/{scanId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Settings - users can only access their own
    match /settings/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public data (app info, updates)
    match /public/{document=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

### Storage Rules

```javascript
// storage.rules
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User-specific storage
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Scan reports
    match /reports/{userId}/{reportId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Public assets
    match /public/{allPaths=**} {
      allow read: if true;
      allow write: if false;
    }
  }
}
```

## Client Configuration

### 1. Environment Variables

Create `.env.development` and `.env.production`:

```bash
# .env.development
VITE_FIREBASE_API_KEY=dev_api_key
VITE_FIREBASE_AUTH_DOMAIN=cleanmymac-pro-dev.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cleanmymac-pro-dev
VITE_FIREBASE_STORAGE_BUCKET=cleanmymac-pro-dev.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=dev_sender_id
VITE_FIREBASE_APP_ID=dev_app_id
VITE_FIREBASE_MEASUREMENT_ID=dev_measurement_id

# .env.production
VITE_FIREBASE_API_KEY=prod_api_key
VITE_FIREBASE_AUTH_DOMAIN=cleanmymac-pro-prod.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=cleanmymac-pro-prod
VITE_FIREBASE_STORAGE_BUCKET=cleanmymac-pro-prod.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=prod_sender_id
VITE_FIREBASE_APP_ID=prod_app_id
VITE_FIREBASE_MEASUREMENT_ID=prod_measurement_id
```

### 2. Update Firebase Configuration

```typescript
// src/renderer/lib/firebase.ts
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableNetwork, disableNetwork } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';
import { enableIndexedDbPersistence } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Enable offline persistence for Firestore
enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('The current browser does not support offline persistence');
  }
});

// Analytics only in production
export const analytics = !import.meta.env.DEV && typeof window !== 'undefined' 
  ? getAnalytics(app) 
  : null;

// Network state management for sandbox
let isOnline = navigator.onLine;

window.addEventListener('online', async () => {
  isOnline = true;
  await enableNetwork(db);
});

window.addEventListener('offline', async () => {
  isOnline = false;
  await disableNetwork(db);
});

export { isOnline };
```

### 3. OAuth Configuration for Sandbox

Update authentication to handle sandbox restrictions:

```typescript
// src/renderer/lib/auth-sandbox.ts
import { 
  signInWithRedirect, 
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  getRedirectResult
} from 'firebase/auth';
import { auth } from './firebase';

// Use popup for sandboxed environment
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  provider.addScope('profile');
  provider.addScope('email');
  
  try {
    // Try popup first (works better in sandbox)
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    // Fallback to redirect if popup blocked
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
      // Handle redirect result on app startup
    }
    throw error;
  }
}

export async function signInWithGitHub() {
  const provider = new GithubAuthProvider();
  provider.addScope('user:email');
  
  try {
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (error) {
    if (error.code === 'auth/popup-blocked') {
      await signInWithRedirect(auth, provider);
    }
    throw error;
  }
}

// Check for redirect result on app startup
export async function handleAuthRedirect() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return result.user;
    }
  } catch (error) {
    console.error('Auth redirect error:', error);
  }
  return null;
}
```

## Network Permissions

### 1. Update Entitlements

Ensure network client entitlement is enabled:

```xml
<!-- build/entitlements.mas.plist -->
<key>com.apple.security.network.client</key>
<true/>
```

### 2. Configure Allowed Domains

Add Firebase domains to Content Security Policy:

```typescript
// electron/main.ts
mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  callback({
    responseHeaders: {
      ...details.responseHeaders,
      'Content-Security-Policy': [
        "default-src 'self'",
        "connect-src 'self' https://*.googleapis.com https://*.firebaseio.com https://*.firebaseapp.com wss://*.firebaseio.com",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https:",
        "font-src 'self' data:"
      ].join('; ')
    }
  });
});
```

## Offline Support

### 1. Implement Offline Queue

```typescript
// src/renderer/lib/offline-queue.ts
import { db } from './firebase';

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: string;
  docId?: string;
  data?: any;
  timestamp: number;
}

class OfflineQueue {
  private queue: QueuedOperation[] = [];
  
  constructor() {
    this.loadQueue();
    window.addEventListener('online', () => this.processQueue());
  }
  
  private loadQueue() {
    const saved = localStorage.getItem('offline-queue');
    if (saved) {
      this.queue = JSON.parse(saved);
    }
  }
  
  private saveQueue() {
    localStorage.setItem('offline-queue', JSON.stringify(this.queue));
  }
  
  add(operation: Omit<QueuedOperation, 'id' | 'timestamp'>) {
    this.queue.push({
      ...operation,
      id: crypto.randomUUID(),
      timestamp: Date.now()
    });
    this.saveQueue();
  }
  
  async processQueue() {
    const operations = [...this.queue];
    this.queue = [];
    
    for (const op of operations) {
      try {
        switch (op.type) {
          case 'create':
            await db.collection(op.collection).add(op.data);
            break;
          case 'update':
            await db.collection(op.collection).doc(op.docId).update(op.data);
            break;
          case 'delete':
            await db.collection(op.collection).doc(op.docId).delete();
            break;
        }
      } catch (error) {
        // Re-queue failed operations
        this.queue.push(op);
      }
    }
    
    this.saveQueue();
  }
}

export const offlineQueue = new OfflineQueue();
```

### 2. Update Store Actions

```typescript
// src/renderer/stores/scanStore.ts
import { offlineQueue } from '@renderer/lib/offline-queue';
import { isOnline } from '@renderer/lib/firebase';

async function saveScanResult(result: ScanResult) {
  if (isOnline) {
    try {
      await db.collection('scanHistory')
        .doc(user.uid)
        .collection('scans')
        .add(result);
    } catch (error) {
      // Queue for later if fails
      offlineQueue.add({
        type: 'create',
        collection: `scanHistory/${user.uid}/scans`,
        data: result
      });
    }
  } else {
    // Queue immediately if offline
    offlineQueue.add({
      type: 'create',
      collection: `scanHistory/${user.uid}/scans`,
      data: result
    });
  }
}
```

## Testing Sandbox Configuration

### 1. Local Testing

```bash
# Run with sandbox simulation
npm run electron:dev -- --enable-sandbox
```

### 2. Test Offline Functionality

1. Start the app
2. Sign in with test account
3. Disconnect network
4. Perform operations (scans, settings changes)
5. Reconnect network
6. Verify data syncs properly

### 3. Validate Network Requests

Use Chrome DevTools Network tab to ensure:
- All requests go to allowed domains
- No blocked requests
- Proper fallback for offline mode

## Deployment Checklist

- [ ] Separate Firebase projects for dev/prod
- [ ] Security rules deployed
- [ ] Environment variables configured
- [ ] Offline persistence enabled
- [ ] Network permissions in entitlements
- [ ] CSP headers configured
- [ ] OAuth redirect URIs updated
- [ ] Offline queue implemented
- [ ] Error handling for network failures
- [ ] Analytics disabled in development

## Monitoring

### 1. Firebase Console

Monitor in Firebase Console:
- Authentication success/failure rates
- Firestore usage and errors
- Storage bandwidth
- Security rule denials

### 2. Application Logs

Log important events:
```typescript
// Network state changes
// Auth state changes  
// Offline queue operations
// Sync conflicts
```

### 3. User Feedback

Implement in-app feedback for:
- Sync status
- Offline mode indicator
- Error notifications

## Troubleshooting

### Common Issues

1. **OAuth popup blocked**: Use popup with fallback to redirect
2. **Network requests fail**: Check entitlements and CSP
3. **Offline data lost**: Ensure IndexedDB persistence
4. **Sync conflicts**: Implement conflict resolution

### Debug Commands

```javascript
// Check auth state
firebase.auth().currentUser

// Check Firestore connection
firebase.firestore()._delegate._databaseId

// Force offline mode
firebase.firestore().disableNetwork()

// Check pending writes
firebase.firestore()._delegate._syncEngine
```