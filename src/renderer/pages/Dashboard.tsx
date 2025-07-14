import React from 'react';
import { useAuthStore } from '@renderer/stores/authStore';

export function Dashboard() {
  const { user } = useAuthStore();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <p>Welcome, {user?.email}</p>
      {/* TODO: Implement dashboard */}
    </div>
  );
}