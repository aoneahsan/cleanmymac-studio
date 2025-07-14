import React from 'react';
import { Progress } from '@renderer/components/ui/progress';
import { Alert, AlertDescription } from '@renderer/components/ui/alert';
import { Button } from '@renderer/components/ui/button';
import { InfoIcon, Crown } from 'lucide-react';
import { formatBytes } from '@renderer/lib/utils';
import { cn } from '@renderer/lib/utils';

interface LimitIndicatorProps {
  used: number;
  limit: number;
  type: 'scan' | 'cleanup';
  showUpgrade?: boolean;
  onUpgradeClick?: () => void;
}

export function LimitIndicator({ 
  used, 
  limit, 
  type,
  showUpgrade = true,
  onUpgradeClick 
}: LimitIndicatorProps) {
  const percentage = limit > 0 ? (used / limit) * 100 : 0;
  const isAtLimit = used >= limit;
  
  const formatValue = (value: number) => {
    if (type === 'cleanup') {
      return formatBytes(value);
    }
    return value.toString();
  };

  const formatLimit = (limit: number) => {
    if (limit === -1) return 'Unlimited';
    return formatValue(limit);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">
            {type === 'scan' ? 'Daily Scans' : 'Monthly Cleanup'}
          </span>
          <span className="font-medium">
            {formatValue(used)} / {formatLimit(limit)}
          </span>
        </div>
        
        {limit > 0 && (
          <Progress 
            value={Math.min(percentage, 100)} 
            className={cn(
              "h-2",
              isAtLimit && "bg-red-100 dark:bg-red-900/20"
            )}
          />
        )}
      </div>

      {isAtLimit && (
        <Alert variant="destructive">
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            You've reached your {type === 'scan' ? 'daily scan' : 'monthly cleanup'} limit.
            {showUpgrade && ' Upgrade to Pro for unlimited access.'}
          </AlertDescription>
        </Alert>
      )}

      {showUpgrade && isAtLimit && (
        <Button 
          variant="gradient" 
          className="w-full"
          onClick={onUpgradeClick}
        >
          <Crown className="w-4 h-4 mr-2" />
          Upgrade to Pro
        </Button>
      )}
    </div>
  );
}