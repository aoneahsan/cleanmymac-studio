import React, { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuthStore } from '@renderer/stores/authStore';
import { usePlanLimits } from '@renderer/hooks/usePlanLimits';
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Button } from '@renderer/components/ui/button';
import { Badge } from '@renderer/components/ui/badge';
import { UpgradePrompt } from '@renderer/components/upgrade/UpgradePrompt';
import { LimitIndicator } from '@renderer/components/features/LimitIndicator';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { HardDrive, Zap, Shield, Activity } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';

export function Dashboard() {
  const { user, isProUser } = useAuthStore();
  const navigate = useNavigate();
  const { checkScanLimit, checkCleanupLimit } = usePlanLimits();
  const [usage, setUsage] = useState<{ scan: any; cleanup: any } | null>(null);

  useEffect(() => {
    loadUsage();
  }, []);

  const loadUsage = async () => {
    const [scanUsage, cleanupUsage] = await Promise.all([
      checkScanLimit(),
      checkCleanupLimit(0) // Check current usage without adding
    ]);
    setUsage({ scan: scanUsage, cleanup: cleanupUsage });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Welcome back, {user?.email}
            </p>
          </div>
          <Badge variant={isProUser() ? 'premium' : 'outline'}>
            {isProUser() ? 'Pro Member' : 'Free Plan'}
          </Badge>
        </div>

        {/* Free User Upgrade Prompt */}
        {!isProUser() && (
          <UpgradePrompt />
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Space Freed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 GB</div>
              <p className="text-xs text-gray-500 mt-1">All time</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Last Scan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Never</div>
              <p className="text-xs text-gray-500 mt-1">Run your first scan</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                System Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Good</div>
              <p className="text-xs text-gray-500 mt-1">No issues found</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Plan Usage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usage ? (
                <>
                  <div className="text-2xl font-bold">
                    {isProUser() ? 'Unlimited' : `${usage.scan.used}/${usage.scan.limit} scans`}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {isProUser() ? 'Pro plan' : 'Daily limit'}
                  </p>
                </>
              ) : (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-16"></div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-24 flex-col gap-2"
                onClick={() => navigate({ to: '/smart-scan' })}
              >
                <Zap className="w-6 h-6" />
                <span>Smart Scan</span>
              </Button>
              <FeatureLock isLocked={!isProUser()} featureName="System Junk">
                <Button variant="outline" className="h-24 flex-col gap-2 w-full">
                  <HardDrive className="w-6 h-6" />
                  <span>System Junk</span>
                </Button>
              </FeatureLock>
              <FeatureLock isLocked={!isProUser()} featureName="Privacy Scan">
                <Button variant="outline" className="h-24 flex-col gap-2 w-full">
                  <Shield className="w-6 h-6" />
                  <span>Privacy Scan</span>
                </Button>
              </FeatureLock>
              <FeatureLock isLocked={!isProUser()} featureName="Optimization">
                <Button variant="outline" className="h-24 flex-col gap-2 w-full">
                  <Activity className="w-6 h-6" />
                  <span>Optimization</span>
                </Button>
              </FeatureLock>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}