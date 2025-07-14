import React from 'react';
import { Outlet } from '@tanstack/react-router';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Outlet />
    </div>
  );
}