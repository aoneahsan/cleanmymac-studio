import React, { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Button } from '@renderer/components/ui/button';
import { Badge } from '@renderer/components/ui/badge';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { Progress } from '@renderer/components/ui/progress';
import { Checkbox } from '@renderer/components/ui/checkbox';
import { FeatureLock } from '@renderer/components/features/FeatureLock';
import { LimitIndicator } from '@renderer/components/features/LimitIndicator';
import { usePlanLimits } from '@renderer/hooks/usePlanLimits';
import { useScanStore } from '@renderer/stores/scanStore';
import { Zap, Trash2, FileText, Download, Package, AlertCircle, Crown } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';
import type { ScanCategory, ScanItem } from '@shared/types/scan';

interface CategoryCardProps {
  category: ScanCategory;
  isLocked: boolean;
  isSelected: boolean;
  onToggle: () => void;
  onViewDetails: () => void;
}

function CategoryCard({ category, isLocked, isSelected, onToggle, onViewDetails }: CategoryCardProps) {
  const Icon = ({
    cache: Trash2,
    logs: FileText,
    downloads: Download,
    trash: Trash2,
    applications: Package,
  } as Record<string, any>)[category.type] || Trash2;

  return (
    <FeatureLock 
      isLocked={isLocked} 
      featureName={category.name}
      showBadge={false}
    >
      <Card className={`${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox 
                checked={isSelected} 
                onCheckedChange={onToggle}
                disabled={isLocked}
              />
              <Icon className="w-5 h-5 text-gray-600" />
              <CardTitle className="text-base">{category.name}</CardTitle>
            </div>
            <Badge variant="outline">{formatBytes(category.size)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">{category.items.length} items</p>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onViewDetails}
              disabled={isLocked}
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </FeatureLock>
  );
}

export function SmartScan() {
  const navigate = useNavigate();
  const { scanResults, isScanning, startScan } = useScanStore();
  const { checkScanLimit, checkCleanupLimit, isProUser, formatLimitMessage } = usePlanLimits();
  
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [scanLimit, setScanLimit] = useState<any>(null);
  const [cleanupLimit, setCleanupLimit] = useState<any>(null);
  const [isCheckingLimits, setIsCheckingLimits] = useState(true);

  useEffect(() => {
    checkLimits();
  }, []);

  const checkLimits = async () => {
    setIsCheckingLimits(true);
    try {
      const scan = await checkScanLimit();
      setScanLimit(scan);
      
      if (scanResults) {
        const cleanup = await checkCleanupLimit(getTotalSelectedSize());
        setCleanupLimit(cleanup);
      }
    } finally {
      setIsCheckingLimits(false);
    }
  };

  const handleStartScan = async () => {
    const scanCheck = await checkScanLimit();
    setScanLimit(scanCheck);
    
    if (!scanCheck.allowed) {
      return;
    }

    startScan((progress) => {
      // Progress callback
    });
  };

  const getTotalSelectedSize = () => {
    if (!scanResults) return 0;
    
    return scanResults.categories
      .filter((cat: ScanCategory) => selectedCategories.has(cat.type))
      .reduce((acc: number, cat: ScanCategory) => acc + cat.size, 0);
  };

  const handleCategoryToggle = (categoryType: string) => {
    const newSelected = new Set(selectedCategories);
    if (newSelected.has(categoryType)) {
      newSelected.delete(categoryType);
    } else {
      newSelected.add(categoryType);
    }
    setSelectedCategories(newSelected);
  };

  const handleCleanup = async () => {
    const selectedSize = getTotalSelectedSize();
    const cleanupCheck = await checkCleanupLimit(selectedSize);
    setCleanupLimit(cleanupCheck);
    
    if (!cleanupCheck.allowed) {
      return;
    }

    // TODO: Implement actual cleanup
    console.log('Cleaning up selected categories:', selectedCategories);
  };

  const getLockedCategories = () => {
    if (isProUser) return new Set<string>();
    
    // Free users can only clean cache and trash
    return new Set(['logs', 'downloads', 'applications']);
  };

  const lockedCategories = getLockedCategories();

  if (isCheckingLimits) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Progress className="w-32 mx-auto mb-4" value={50} />
          <p>Checking your plan limits...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Zap className="w-8 h-8 text-blue-600" />
              Smart Scan
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Find and clean unnecessary files to free up space
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate({ to: '/dashboard' })}>
            Back to Dashboard
          </Button>
        </div>

        {/* Scan Limit Indicator */}
        {!isProUser && scanLimit && (
          <Card>
            <CardContent className="p-6">
              <LimitIndicator
                type="scan"
                used={scanLimit.used}
                limit={scanLimit.limit}
                onUpgradeClick={() => navigate({ to: '/dashboard' })}
              />
            </CardContent>
          </Card>
        )}

        {/* Scan Button or Results */}
        {!scanResults ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Zap className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold mb-2">Ready to Scan</h2>
              <p className="text-gray-600 mb-6">
                Smart Scan will analyze your system and find files that can be safely cleaned
              </p>
              <Button 
                size="lg" 
                variant="gradient"
                onClick={handleStartScan}
                disabled={isScanning || (scanLimit && !scanLimit.allowed)}
              >
                {isScanning ? 'Scanning...' : 'Start Smart Scan'}
              </Button>
              
              {scanLimit && !scanLimit.allowed && (
                <Alert variant="destructive" className="mt-4 max-w-md mx-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {formatLimitMessage(scanLimit, 'scan')}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Scan Results Summary */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
              <CardContent className="p-8">
                <div className="text-center">
                  <p className="text-5xl font-bold mb-2">{formatBytes(scanResults.totalSpace)}</p>
                  <p className="text-lg text-gray-600">Total space that can be freed</p>
                </div>
              </CardContent>
            </Card>

            {/* Categories */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Select items to clean</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {scanResults.categories.map((category: ScanCategory) => (
                  <CategoryCard
                    key={category.type}
                    category={category}
                    isLocked={lockedCategories.has(category.type)}
                    isSelected={selectedCategories.has(category.type)}
                    onToggle={() => handleCategoryToggle(category.type)}
                    onViewDetails={() => console.log('View details for', category.type)}
                  />
                ))}
              </div>
            </div>

            {/* Cleanup Action */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold">
                      Selected: {formatBytes(getTotalSelectedSize())}
                    </p>
                    <p className="text-sm text-gray-600">
                      {selectedCategories.size} categories selected
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {!isProUser && cleanupLimit && (
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          Monthly limit: {formatBytes(cleanupLimit.remaining || 0)} remaining
                        </p>
                      </div>
                    )}
                    
                    <Button
                      size="lg"
                      variant="gradient"
                      onClick={handleCleanup}
                      disabled={selectedCategories.size === 0 || (cleanupLimit && !cleanupLimit.allowed)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Clean Selected
                    </Button>
                  </div>
                </div>
                
                {cleanupLimit && !cleanupLimit.allowed && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {formatLimitMessage(cleanupLimit, 'cleanup')}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>

            {/* Pro Features Teaser */}
            {!isProUser && (
              <Card className="border-dashed border-2 border-purple-300 bg-purple-50/50 dark:bg-purple-900/10">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Crown className="w-5 h-5 text-purple-600" />
                        Unlock Pro Features
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Get unlimited scans, clean all file types, and remove the 500MB monthly limit
                      </p>
                    </div>
                    <Button 
                      variant="gradient"
                      onClick={() => navigate({ to: '/dashboard' })}
                    >
                      Upgrade to Pro
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}