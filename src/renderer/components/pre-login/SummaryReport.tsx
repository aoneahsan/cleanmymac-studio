import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@renderer/components/ui/card';
import { Button } from '@renderer/components/ui/button';
import { Progress } from '@renderer/components/ui/progress';
import { Badge } from '@renderer/components/ui/badge';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { 
  HardDrive, 
  FolderOpen, 
  FileText, 
  Download, 
  Trash2,
  Crown,
  ArrowRight,
  CheckCircle,
  InfoIcon
} from 'lucide-react';
import type { ScanSummary } from '@shared/types/scan';
import { SCAN_CATEGORIES } from '@shared/constants/categories';
import { formatBytes } from '@renderer/lib/utils';

interface SummaryReportProps {
  scanResults: ScanSummary;
}

export function SummaryReport({ scanResults }: SummaryReportProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);

  const getCategoryIcon = (categoryId: string) => {
    const icons: Record<string, any> = {
      user_cache: FolderOpen,
      logs: FileText,
      downloads: Download,
      trash: Trash2,
      system_cache: HardDrive,
    };
    return icons[categoryId] || HardDrive;
  };

  const formatCategoryName = (categoryId: string) => {
    const category = Object.values(SCAN_CATEGORIES).find(cat => cat.id === categoryId);
    return category?.name || categoryId;
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back to Home */}
        <Button
          variant="ghost"
          onClick={() => window.location.href = '/'}
          className="mb-4"
        >
          ← Back to Home
        </Button>

        {/* Hero Section */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold">Scan Complete!</h1>
          
          <div className="flex items-center justify-center space-x-4">
            <CheckCircle className="w-8 h-8 text-green-500" />
            <p className="text-xl text-gray-600 dark:text-gray-400">
              We found files that can be safely cleaned
            </p>
          </div>

          {/* Total Space Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-none shadow-xl">
            <CardContent className="p-12 text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                Total space that can be freed:
              </p>
              <p className="text-6xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {formatBytes(scanResults.totalSpace)}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-4">
                {scanResults.itemCount.toLocaleString()} items found
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Category Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">What We Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(scanResults.breakdown).map(([categoryId, category]) => {
              const Icon = getCategoryIcon(categoryId);
              const percentage = (category.size / scanResults.totalSpace) * 100;
              
              return (
                <div key={categoryId} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-500" />
                      <span className="font-medium">{formatCategoryName(categoryId)}</span>
                      <Badge variant="outline" className="text-xs">
                        {category.itemCount} items
                      </Badge>
                    </div>
                    <span className="font-semibold">
                      {formatBytes(category.size)}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Free vs Pro Info */}
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/50">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm">
            <strong>Free users can clean up to 500MB.</strong> Upgrade to Pro to clean 
            all {formatBytes(scanResults.totalSpace)} and unlock advanced features.
          </AlertDescription>
        </Alert>

        {/* CTA Section */}
        <Card className="border-2 border-primary">
          <CardContent className="p-8 text-center space-y-6">
            <h3 className="text-2xl font-semibold">Ready to Clean?</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Create a free account to start cleaning your Mac and reclaim space
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={() => setShowAuthModal(true)}
                className="min-w-[200px]"
              >
                Login to Clean
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setShowAuthModal(true)}
                className="min-w-[200px]"
              >
                Create Free Account
              </Button>
            </div>
            
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Clean up to 500MB free
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
                No credit card required
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Pro Features Preview */}
        <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Unlock Pro Features</CardTitle>
              <Badge variant="premium" className="text-sm">
                <Crown className="w-3 h-3 mr-1" />
                PRO
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Unlimited Cleanup</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Clean all {formatBytes(scanResults.totalSpace)} and more
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Advanced Features</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Privacy cleaner, malware scan, optimization
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Scheduled Scans</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Automatic weekly cleanup
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium">Priority Support</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    24/7 expert assistance
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}