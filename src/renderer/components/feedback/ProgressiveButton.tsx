import React from 'react';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { motion, AnimatePresence } from 'framer-motion';

interface ProgressiveButtonProps {
  label: string;
  onClick: () => void | Promise<void>;
  loading?: boolean;
  progress?: number;
  disabled?: boolean;
  severity?: 'secondary' | 'success' | 'info' | 'warning' | 'danger' | 'help';
  icon?: string;
  className?: string;
  size?: 'small' | 'large';
  outlined?: boolean;
  successLabel?: string;
  loadingLabel?: string;
}

export function ProgressiveButton({
  label,
  onClick,
  loading = false,
  progress,
  disabled = false,
  severity = 'secondary',
  icon,
  className = '',
  size,
  outlined = false,
  successLabel,
  loadingLabel,
}: ProgressiveButtonProps) {
  const [isSuccess, setIsSuccess] = React.useState(false);

  React.useEffect(() => {
    if (progress === 100 && !loading) {
      setIsSuccess(true);
      const timer = setTimeout(() => setIsSuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [progress, loading]);

  const buttonLabel = loading 
    ? (loadingLabel || label)
    : isSuccess 
    ? (successLabel || label)
    : label;

  const buttonIcon = loading 
    ? undefined 
    : isSuccess 
    ? 'pi pi-check' 
    : icon;

  return (
    <div className="relative">
      <Button
        label={buttonLabel}
        icon={buttonIcon}
        onClick={onClick}
        disabled={disabled || loading}
        severity={isSuccess ? 'success' : severity}
        className={`${className} transition-all duration-300 ${
          loading ? 'pl-12' : ''
        }`}
        size={size}
        outlined={outlined}
      />
      
      {loading && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <ProgressSpinner 
            style={{ width: '20px', height: '20px' }} 
            strokeWidth="4"
          />
        </div>
      )}

      {progress !== undefined && progress > 0 && progress < 100 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-purple-500 rounded-b"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      )}
    </div>
  );
}