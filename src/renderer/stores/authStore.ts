import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { auth, db } from '@renderer/lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { COLLECTIONS } from '@shared/firebase.config';
import type { User, Plan } from '@shared/types/user';
import { PLAN_LIMITS } from '@shared/constants/limits';

interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => void;
  canUseFeature: (feature: string) => boolean;
  isProUser: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      firebaseUser: null,
      isLoading: false,
      isInitialized: false,
      error: null,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await signInWithEmailAndPassword(auth, email, password);
          // User data will be loaded by auth state listener
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Login failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      signup: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const result = await createUserWithEmailAndPassword(auth, email, password);
          
          // Create user document in Firestore
          const newUser: User = {
            uid: result.user.uid,
            email: result.user.email!,
            plan: {
              type: 'free',
              limits: PLAN_LIMITS.free,
            },
            createdAt: new Date(),
            lastActive: new Date(),
          };
          
          await setDoc(doc(db, COLLECTIONS.USERS, result.user.uid), {
            ...newUser,
            createdAt: new Date(),
            lastActive: new Date(),
          });
          
          set({ user: newUser, firebaseUser: result.user, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Signup failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      logout: async () => {
        set({ isLoading: true });
        try {
          await signOut(auth);
          set({ user: null, firebaseUser: null, isLoading: false });
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Logout failed';
          set({ error: message, isLoading: false });
          throw error;
        }
      },
      
      initializeAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser) {
            set({ isLoading: true });
            try {
              // Fetch user data from Firestore
              const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
              
              if (userDoc.exists()) {
                const userData = userDoc.data();
                const user: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email!,
                  displayName: firebaseUser.displayName || undefined,
                  photoURL: firebaseUser.photoURL || undefined,
                  plan: userData.plan || { type: 'free', limits: PLAN_LIMITS.free },
                  createdAt: userData.createdAt?.toDate() || new Date(),
                  lastActive: new Date(),
                };
                
                // Update last active
                await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), {
                  lastActive: new Date(),
                }, { merge: true });
                
                set({ user, firebaseUser, isLoading: false, isInitialized: true });
              } else {
                // Create user document if it doesn't exist
                const newUser: User = {
                  uid: firebaseUser.uid,
                  email: firebaseUser.email!,
                  displayName: firebaseUser.displayName || undefined,
                  photoURL: firebaseUser.photoURL || undefined,
                  plan: { type: 'free', limits: PLAN_LIMITS.free },
                  createdAt: new Date(),
                  lastActive: new Date(),
                };
                
                await setDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid), newUser);
                set({ user: newUser, firebaseUser, isLoading: false, isInitialized: true });
              }
            } catch (error) {
              console.error('Error loading user data:', error);
              set({ isLoading: false, isInitialized: true });
            }
          } else {
            set({ user: null, firebaseUser: null, isLoading: false, isInitialized: true });
          }
        });
        
        // Return unsubscribe function
        return unsubscribe;
      },
      
      canUseFeature: (feature: string) => {
        const { user } = get();
        if (!user) return false;
        
        if (user.plan.type === 'pro' || user.plan.type === 'trial') {
          return true;
        }
        
        return user.plan.limits.featuresUnlocked.includes(feature) || 
               user.plan.limits.featuresUnlocked.includes('*');
      },
      
      isProUser: () => {
        const { user } = get();
        return user?.plan.type === 'pro' || user?.plan.type === 'trial';
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        // Don't persist sensitive data
      }),
    }
  )
);