export type PlanType = 'free' | 'pro' | 'trial';
export type PlanDuration = 'monthly' | 'annual' | 'lifetime';

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  plan: Plan;
  createdAt: Date;
  lastActive: Date;
}

export interface Plan {
  type: PlanType;
  expiresAt?: Date;
  activatedAt?: Date;
  method?: 'manual' | 'stripe' | 'promotion';
  limits: PlanLimits;
}

export interface PlanLimits {
  dailyScans: number;
  cleanupSizeMB: number;
  featuresUnlocked: string[];
  batchOperations: boolean;
  automation: boolean;
  prioritySupport: boolean;
}

export interface Usage {
  scansToday: number;
  totalCleaned: number;
  lastScanDate?: Date;
  monthlyCleanedMB: number;
}

export interface ProRequest {
  id?: string;
  userId: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  country?: string;
  preferredContact: 'email' | 'phone' | 'whatsapp';
  message?: string;
  status: 'pending' | 'contacted' | 'converted' | 'declined';
  submittedAt: Date;
}