import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePreAuthStore } from '@renderer/stores/preAuthStore';
import { SummaryReport } from '@renderer/components/pre-login/SummaryReport';

export function ScanResults() {
  const navigate = useNavigate();
  const { scanResults } = usePreAuthStore();

  // Redirect to home if no scan results
  React.useEffect(() => {
    if (!scanResults) {
      void navigate({ to: '/' });
    }
  }, [scanResults, navigate]);

  if (!scanResults) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <SummaryReport scanResults={scanResults} />
    </div>
  );
}