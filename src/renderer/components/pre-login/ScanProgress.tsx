import React from 'react';
import { usePreAuthStore } from '@renderer/stores/preAuthStore';
import { Progress } from '@renderer/components/ui/progress';
import { Card, CardContent } from '@renderer/components/ui/card';
import { Loader2, HardDrive } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';

export function ScanProgress() {
  const { scanProgress, scanPhase, isScanning, error } = usePreAuthStore();

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-8">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center space-y-4">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-semibold">Scan Error</h2>
            <p className="text-gray-600 dark:text-gray-400">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-8">
      <Card className="max-w-lg w-full">
        <CardContent className="p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <HardDrive className="w-16 h-16 text-blue-500" />
                {isScanning && (
                  <Loader2 className="w-16 h-16 text-blue-500 absolute top-0 left-0 animate-spin" />
                )}
              </div>
            </div>
            
            <h2 className="text-2xl font-semibold">Analyzing Your Mac</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Please wait while we scan your system...
            </p>
          </div>

          {/* Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{Math.round(scanProgress)}%</span>
            </div>
            
            <Progress value={scanProgress} className="h-3" />
            
            <p className="text-sm text-gray-500 dark:text-gray-500 text-center animate-pulse">
              {scanPhase}
            </p>
          </div>

          {/* Scanning Animation */}
          <div className="grid grid-cols-3 gap-2 pt-4">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full bg-gray-200 dark:bg-gray-700 ${
                  i < (scanProgress / 100) * 9 ? 'bg-blue-500' : ''
                } transition-colors duration-500`}
                style={{
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>

          {/* Info */}
          <div className="text-center text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>This scan is read-only and won't make any changes</p>
            <p>Your privacy is protected - no data is sent to servers</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}