import React, { useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePreAuthStore } from '@renderer/stores/preAuthStore';
import { ScanProgress } from '@renderer/components/pre-login/ScanProgress';

export function Scanning() {
  const navigate = useNavigate();
  const { startPreAuthScan, isScanning, scanResults, error } = usePreAuthStore();

  useEffect(() => {
    // Start scan when component mounts
    startPreAuthScan();
  }, []);

  useEffect(() => {
    // Navigate to results when scan completes
    if (!isScanning && scanResults) {
      setTimeout(() => {
        navigate({ to: '/scan-results' });
      }, 500); // Small delay for better UX
    }
  }, [isScanning, scanResults, navigate]);

  useEffect(() => {
    // Handle errors
    if (error) {
      console.error('Scan error:', error);
      // Could show error modal or navigate back
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <ScanProgress />
    </div>
  );
}