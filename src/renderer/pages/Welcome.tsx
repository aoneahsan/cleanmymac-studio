import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { WelcomeHero } from '@renderer/components/pre-login/WelcomeHero';

export function Welcome() {
  const navigate = useNavigate();

  const handleStartScan = () => {
    void navigate({ to: '/scanning' });
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <WelcomeHero onStartScan={handleStartScan} />
    </div>
  );
}