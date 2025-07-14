import React from 'react';
import { Lock, Crown } from 'lucide-react';
import { cn } from '@renderer/lib/utils';
import { Badge } from '@renderer/components/ui/badge';

interface FeatureLockProps {
  isLocked: boolean;
  children: React.ReactNode;
  featureName?: string;
  showBadge?: boolean;
  blur?: boolean;
  onClick?: () => void;
}

export function FeatureLock({ 
  isLocked, 
  children, 
  featureName, 
  showBadge = true,
  blur = true,
  onClick 
}: FeatureLockProps) {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div 
      className="relative"
      onClick={onClick}
    >
      {/* Locked content */}
      <div className={cn(
        "relative",
        blur && "blur-sm opacity-75",
        onClick && "cursor-pointer"
      )}>
        {children}
      </div>

      {/* Lock overlay */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="bg-white/90 dark:bg-black/90 rounded-full p-3 shadow-lg">
          <Lock className="w-6 h-6 text-gray-600 dark:text-gray-400" />
        </div>
      </div>

      {/* Pro badge */}
      {showBadge && (
        <div className="absolute top-2 right-2">
          <Badge variant="premium" className="pointer-events-none">
            <Crown className="w-3 h-3 mr-1" />
            PRO
          </Badge>
        </div>
      )}

      {/* Feature name tooltip */}
      {featureName && (
        <div className="absolute bottom-2 left-2 right-2 pointer-events-none">
          <div className="bg-black/75 text-white text-xs px-2 py-1 rounded text-center">
            {featureName} - Pro Feature
          </div>
        </div>
      )}
    </div>
  );
}