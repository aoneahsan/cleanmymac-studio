import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db } from '@renderer/lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp,
  doc,
  updateDoc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { COLLECTIONS } from '@shared/firebase.config';
import { useAuthStore } from './authStore';

export interface ScanResult {
  id?: string;
  userId: string;
  timestamp: Date;
  type: 'smart' | 'system' | 'privacy' | 'optimization';
  totalJunkFound: number; // in bytes
  itemsFound: {
    systemJunk?: number;
    applicationCaches?: number;
    mailAttachments?: number;
    trashBins?: number;
    largeOldFiles?: number;
    photoJunk?: number;
    downloads?: number;
    logs?: number;
  };
  duration: number; // in seconds
  status: 'completed' | 'interrupted';
}

export interface CleanupResult {
  id?: string;
  userId: string;
  scanId: string; // Reference to the scan
  timestamp: Date;
  totalCleaned: number; // in bytes
  itemsCleaned: {
    systemJunk?: number;
    applicationCaches?: number;
    mailAttachments?: number;
    trashBins?: number;
    largeOldFiles?: number;
    photoJunk?: number;
    downloads?: number;
    logs?: number;
  };
  duration: number; // in seconds
  status: 'completed' | 'partial' | 'failed';
  errors?: string[];
}

export interface UserStats {
  totalScans: number;
  totalCleanups: number;
  totalSpaceFreed: number; // in bytes
  totalTimeSaved: number; // in seconds
  lastScanDate?: Date;
  lastCleanupDate?: Date;
  averageJunkPerScan: number;
  averageSpacePerCleanup: number;
  mostCleanedCategory: string;
  cleanupStreak: number;
  currentStreak: number;
  longestStreak: number;
  firstScanDate?: Date;
}

interface HistoryState {
  recentScans: ScanResult[];
  recentCleanups: CleanupResult[];
  scanHistory: ScanResult[];
  cleanupHistory: CleanupResult[];
  userStats: UserStats | null;
  isLoading: boolean;
  
  // Actions
  loadHistory: () => Promise<void>;
  addScanResult: (scan: Omit<ScanResult, 'id' | 'userId'>) => Promise<string>;
  addCleanupResult: (cleanup: Omit<CleanupResult, 'id' | 'userId'>) => Promise<void>;
  updateUserStats: () => Promise<void>;
  getLifetimeStats: () => Promise<UserStats>;
  getScanHistory: (limit?: number) => Promise<ScanResult[]>;
  getCleanupHistory: (limit?: number) => Promise<CleanupResult[]>;
  getMonthlyStats: () => Promise<{ month: string; cleaned: number }[]>;
  getUserStats: () => UserStats;
}

const initialStats: UserStats = {
  totalScans: 0,
  totalCleanups: 0,
  totalSpaceFreed: 0,
  totalTimeSaved: 0,
  averageJunkPerScan: 0,
  averageSpacePerCleanup: 0,
  mostCleanedCategory: 'systemJunk',
  cleanupStreak: 0,
  currentStreak: 0,
  longestStreak: 0,
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      recentScans: [],
      recentCleanups: [],
      scanHistory: [],
      cleanupHistory: [],
      userStats: null,
      isLoading: false,

      loadHistory: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        set({ isLoading: true });
        try {
          // Load recent scans
          const scansQuery = query(
            collection(db, COLLECTIONS.SCANS),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(10)
          );
          const scansSnapshot = await getDocs(scansQuery);
          const scans = scansSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as ScanResult[];

          // Load recent cleanups
          const cleanupsQuery = query(
            collection(db, COLLECTIONS.CLEANUPS),
            where('userId', '==', user.uid),
            orderBy('timestamp', 'desc'),
            limit(10)
          );
          const cleanupsSnapshot = await getDocs(cleanupsQuery);
          const cleanups = cleanupsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as CleanupResult[];

          // Load user stats
          const statsDoc = await getDoc(doc(db, COLLECTIONS.USER_STATS, user.uid));
          const stats = statsDoc.exists() 
            ? { ...statsDoc.data(), 
                lastScanDate: statsDoc.data().lastScanDate?.toDate(),
                lastCleanupDate: statsDoc.data().lastCleanupDate?.toDate(),
                firstScanDate: statsDoc.data().firstScanDate?.toDate(),
              } as UserStats
            : initialStats;

          set({ 
            recentScans: scans, 
            recentCleanups: cleanups, 
            userStats: stats,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to load history:', error);
          set({ isLoading: false });
        }
      },

      addScanResult: async (scan) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        const scanData = {
          ...scan,
          userId: user.uid,
          timestamp: Timestamp.fromDate(scan.timestamp),
        };

        const docRef = await addDoc(collection(db, COLLECTIONS.SCANS), scanData);
        
        // Update local state
        const newScan = { ...scan, id: docRef.id, userId: user.uid };
        set((state) => ({
          recentScans: [newScan, ...state.recentScans].slice(0, 10),
        }));

        // Update user stats
        await get().updateUserStats();

        return docRef.id;
      },

      addCleanupResult: async (cleanup) => {
        const user = useAuthStore.getState().user;
        if (!user) throw new Error('User not authenticated');

        const cleanupData = {
          ...cleanup,
          userId: user.uid,
          timestamp: Timestamp.fromDate(cleanup.timestamp),
        };

        const docRef = await addDoc(collection(db, COLLECTIONS.CLEANUPS), cleanupData);
        
        // Update local state
        const newCleanup = { ...cleanup, id: docRef.id, userId: user.uid };
        set((state) => ({
          recentCleanups: [newCleanup, ...state.recentCleanups].slice(0, 10),
        }));

        // Update user stats
        await get().updateUserStats();
      },

      updateUserStats: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return;

        try {
          // Get all scans and cleanups
          const [scansSnapshot, cleanupsSnapshot] = await Promise.all([
            getDocs(query(
              collection(db, COLLECTIONS.SCANS),
              where('userId', '==', user.uid)
            )),
            getDocs(query(
              collection(db, COLLECTIONS.CLEANUPS),
              where('userId', '==', user.uid)
            )),
          ]);

          const scans = scansSnapshot.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as ScanResult[];

          const cleanups = cleanupsSnapshot.docs.map(doc => ({
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate(),
          })) as CleanupResult[];

          // Calculate stats
          const totalSpaceFreed = cleanups.reduce((sum, c) => sum + c.totalCleaned, 0);
          const totalTimeSaved = scans.reduce((sum, s) => sum + s.duration, 0) +
                               cleanups.reduce((sum, c) => sum + c.duration, 0);
          
          // Calculate most cleaned category
          const categoryTotals: Record<string, number> = {};
          cleanups.forEach(cleanup => {
            Object.entries(cleanup.itemsCleaned).forEach(([category, bytes]) => {
              categoryTotals[category] = (categoryTotals[category] || 0) + (bytes || 0);
            });
          });
          const mostCleanedCategory = Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'systemJunk';

          // Calculate cleanup streak
          const sortedCleanups = cleanups
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          let streak = 0;
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          for (let i = 0; i < sortedCleanups.length; i++) {
            const cleanupDate = new Date(sortedCleanups[i].timestamp);
            cleanupDate.setHours(0, 0, 0, 0);
            const daysDiff = Math.floor((today.getTime() - cleanupDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysDiff === i) {
              streak++;
            } else {
              break;
            }
          }

          const stats: UserStats = {
            totalScans: scans.length,
            totalCleanups: cleanups.length,
            totalSpaceFreed,
            totalTimeSaved,
            lastScanDate: scans[0]?.timestamp,
            lastCleanupDate: cleanups[0]?.timestamp,
            firstScanDate: scans[scans.length - 1]?.timestamp,
            averageJunkPerScan: scans.length > 0 
              ? scans.reduce((sum, s) => sum + s.totalJunkFound, 0) / scans.length 
              : 0,
            averageSpacePerCleanup: cleanups.length > 0
              ? totalSpaceFreed / cleanups.length
              : 0,
            mostCleanedCategory,
            cleanupStreak: streak,
            currentStreak: streak,
            longestStreak: Math.max(streak, get().userStats?.longestStreak || 0),
          };

          // Save to Firestore
          await setDoc(doc(db, COLLECTIONS.USER_STATS, user.uid), {
            ...stats,
            lastScanDate: stats.lastScanDate ? Timestamp.fromDate(stats.lastScanDate) : null,
            lastCleanupDate: stats.lastCleanupDate ? Timestamp.fromDate(stats.lastCleanupDate) : null,
            firstScanDate: stats.firstScanDate ? Timestamp.fromDate(stats.firstScanDate) : null,
            updatedAt: Timestamp.now(),
          });

          set({ userStats: stats });
        } catch (error) {
          console.error('Failed to update user stats:', error);
        }
      },

      getLifetimeStats: async () => {
        const { userStats } = get();
        if (userStats) return userStats;
        
        await get().loadHistory();
        return get().userStats || initialStats;
      },

      getScanHistory: async (limitCount = 50) => {
        const user = useAuthStore.getState().user;
        if (!user) return [];

        const scansQuery = query(
          collection(db, COLLECTIONS.SCANS),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
        
        const snapshot = await getDocs(scansQuery);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as ScanResult[];
      },

      getCleanupHistory: async (limitCount = 50) => {
        const user = useAuthStore.getState().user;
        if (!user) return [];

        const cleanupsQuery = query(
          collection(db, COLLECTIONS.CLEANUPS),
          where('userId', '==', user.uid),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
        
        const snapshot = await getDocs(cleanupsQuery);
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as CleanupResult[];
      },

      getMonthlyStats: async () => {
        const user = useAuthStore.getState().user;
        if (!user) return [];

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const cleanupsQuery = query(
          collection(db, COLLECTIONS.CLEANUPS),
          where('userId', '==', user.uid),
          where('timestamp', '>=', Timestamp.fromDate(sixMonthsAgo)),
          orderBy('timestamp', 'asc')
        );
        
        const snapshot = await getDocs(cleanupsQuery);
        const cleanups = snapshot.docs.map(doc => ({
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate(),
        })) as CleanupResult[];

        // Group by month
        const monthlyStats: Record<string, number> = {};
        cleanups.forEach(cleanup => {
          const monthKey = cleanup.timestamp.toISOString().slice(0, 7);
          monthlyStats[monthKey] = (monthlyStats[monthKey] || 0) + cleanup.totalCleaned;
        });

        return Object.entries(monthlyStats).map(([month, cleaned]) => ({
          month,
          cleaned,
        }));
      },

      getUserStats: () => {
        return get().userStats || initialStats;
      },
    }),
    {
      name: 'history-storage',
      partialize: (state) => ({
        // Only persist recent data for offline access
        recentScans: state.recentScans.slice(0, 5),
        recentCleanups: state.recentCleanups.slice(0, 5),
        userStats: state.userStats,
      }),
    }
  )
);