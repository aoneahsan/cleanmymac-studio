import React, { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { useAuthStore } from './stores/authStore';

function App() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    // Initialize Firebase Auth listener
    const unsubscribe = initializeAuth();
    return () => unsubscribe();
  }, []);

  return (
    <RouterProvider 
      router={router} 
      context={{
        auth: useAuthStore.getState(),
      }}
    />
  );
}

export default App;