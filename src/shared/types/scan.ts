export interface ScanProgress {
  percentage: number;
  phase: string;
  currentItem?: string;
  itemsScanned: number;
  totalItems?: number;
}

export interface ScanCategory {
  id: string;
  type: string;
  name: string;
  description: string;
  size: number;
  itemCount: number;
  items: ScanItem[];
  icon?: string;
}

export interface ScanItem {
  path: string;
  size: number;
  type: string;
  lastModified?: Date;
  canDelete: boolean;
}

export interface ScanSummary {
  totalSpace: number;
  breakdown: Record<string, ScanCategory>;
  categories: ScanCategory[];
  itemCount: number;
  scanTime: number;
  freeSpace?: number;
  totalDiskSpace?: number;
}

export interface ScanResult {
  summary: ScanSummary;
  categories: ScanCategory[];
  recommendations: string[];
  timestamp: number;
}