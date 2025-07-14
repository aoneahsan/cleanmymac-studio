import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { WelcomeHero } from '@renderer/components/pre-login/WelcomeHero';

export function Welcome() {
  const navigate = useNavigate();

  const handleStartScan = () => {
    navigate({ to: '/scanning' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <WelcomeHero onStartScan={handleStartScan} />
    </div>
  );
}