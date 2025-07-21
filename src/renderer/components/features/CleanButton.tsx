import React, { useState } from 'react';
import { Button } from '@renderer/components/ui/button';
import { Progress } from '@renderer/components/ui/progress';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  Shield,
  Info
} from 'lucide-react';
import { useAuthStore } from '@renderer/stores/authStore';
import { useQuery, useMutation } from '@tanstack/react-query';
import { formatBytes } from '@renderer/lib/utils';
import { ScanItem } from '@shared/types/scan';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@renderer/components/ui/dialog';

interface CleanButtonProps {
  items: ScanItem[];
  totalSize: number;
  onCleanComplete?: (freedSpace: number) => void;
}

interface CleanResult {
  success: boolean;
  cleaned: ScanItem[];
  failed: ScanItem[];
  totalSizeFreed: number;
  errors: Array<{ item: ScanItem; error: string }>;
}

export function CleanButton({ items, totalSize, onCleanComplete }: CleanButtonProps) {
  const { user } = useAuthStore();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [cleanProgress, setCleanProgress] = useState(0);
  const [cleanedSize, setCleanedSize] = useState(0);

  // Check if user can clean based on plan limits
  const canClean = () => {
    if (!user) return false;
    if (user.plan.type === 'pro') return true;
    
    // Free plan: 500MB limit
    const freeLimit = 500 * 1024 * 1024; // 500MB in bytes
    return totalSize <= freeLimit;
  };

  const exceedsLimit = () => {
    if (user?.plan.type === 'pro') return false;
    const freeLimit = 500 * 1024 * 1024;
    return totalSize > freeLimit;
  };

  // Dry run query to preview what will be cleaned
  const dryRunQuery = useQuery({
    queryKey: ['cleaner-dry-run', items],
    queryFn: async () => {
      const result = await window.electron.ipcRenderer.invoke('cleaner:clean-items', {
        items,
        dryRun: true
      });
      return result as CleanResult;
    },
    enabled: showConfirmDialog && canClean()
  });

  // Actual cleaning mutation
  const cleanMutation = useMutation({
    mutationFn: async () => {
      const result = await window.electron.ipcRenderer.invoke('cleaner:clean-items', {
        items,
        dryRun: false
      });
      return result as CleanResult;
    },
    onSuccess: (result) => {
      setCleanedSize(result.totalSizeFreed);
      if (onCleanComplete) {
        onCleanComplete(result.totalSizeFreed);
      }
    }
  });

  const handleClean = () => {
    if (!canClean()) return;
    setShowConfirmDialog(true);
  };

  const confirmClean = async () => {
    setShowConfirmDialog(false);
    
    // Start cleaning with progress tracking
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      if (progress <= 90) {
        setCleanProgress(progress);
      }
    }, 200);

    try {
      await cleanMutation.mutateAsync();
      setCleanProgress(100);
    } finally {
      clearInterval(interval);
    }
  };

  if (!user) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Please log in to clean files
        </AlertDescription>
      </Alert>
    );
  }

  if (exceedsLimit()) {
    return (
      <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
        <AlertTriangle className="h-4 w-4 text-orange-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Free plan limit exceeded</p>
            <p className="text-sm">
              You can clean up to 500MB on the free plan. This scan found {formatBytes(totalSize)}.
            </p>
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => window.location.href = '/settings/subscription'}
            >
              Upgrade to Pro
            </Button>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (cleanMutation.isSuccess) {
    return (
      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription>
          <div className="space-y-2">
            <p className="font-medium">Cleaning completed successfully!</p>
            <p className="text-sm">
              Freed {formatBytes(cleanedSize)} of disk space
            </p>
            {cleanMutation.data?.failed && cleanMutation.data.failed.length > 0 && (
              <p className="text-sm text-orange-600">
                {cleanMutation.data.failed.length} items could not be cleaned
              </p>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (cleanMutation.isPending) {
    return (
      <div className="space-y-4">
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertDescription>
            Cleaning files... Please do not close the application
          </AlertDescription>
        </Alert>
        <Progress value={cleanProgress} className="h-2" />
        <p className="text-sm text-gray-500 text-center">
          {cleanProgress}% complete
        </p>
      </div>
    );
  }

  return (
    <>
      <Button
        size="lg"
        onClick={handleClean}
        disabled={!canClean() || items.length === 0}
        className="w-full"
      >
        <Trash2 className="mr-2 h-4 w-4" />
        Clean {formatBytes(totalSize)}
      </Button>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Confirm Cleaning</DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertDescription>
                  <p className="font-medium mb-2">Safety First</p>
                  <p className="text-sm">
                    We've analyzed these files and confirmed they can be safely deleted.
                    System-critical files are protected and won't be touched.
                  </p>
                </AlertDescription>
              </Alert>

              {dryRunQuery.isLoading && (
                <div className="text-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Analyzing files...</p>
                </div>
              )}

              {dryRunQuery.data && (
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Files to clean:</span>
                    <span className="font-medium">{dryRunQuery.data.cleaned.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Space to free:</span>
                    <span className="font-medium">{formatBytes(dryRunQuery.data.totalSizeFreed)}</span>
                  </div>
                  {dryRunQuery.data.failed.length > 0 && (
                    <Alert className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                      <AlertTriangle className="h-4 w-4 text-orange-600" />
                      <AlertDescription className="text-xs">
                        {dryRunQuery.data.failed.length} protected files will be skipped
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              )}

              <p className="text-sm text-gray-500">
                This action cannot be undone. Make sure you have backups of any important data.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClean}
              disabled={dryRunQuery.isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clean Now
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}