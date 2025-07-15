import React, { useEffect } from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { router } from './router';
import { useAuthStore } from './stores/authStore';
import { SafeAreaProvider } from './contexts/SafeAreaContext';
import { ToastContainer } from 'react-toastify';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeOneSignal } from './lib/notifications';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: 3,
    },
  },
});

function App() {
  const { initializeAuth, user } = useAuthStore();

  useEffect(() => {
    // Initialize Firebase Auth listener
    initializeAuth();
    
    // Initialize OneSignal with error handling
    initializeOneSignal().catch(console.error);
  }, []);

  useEffect(() => {
    // Set OneSignal user ID when user logs in
    if (user) {
      import('./lib/notifications').then(({ setOneSignalUserId, setOneSignalTags }) => {
        setOneSignalUserId(user.uid);
        setOneSignalTags({
          plan: user.plan.type,
          email: user.email,
        });
      });
    }
  }, [user]);

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <RouterProvider router={router} />
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{
            bottom: 'env(safe-area-inset-bottom, 20px)',
            right: 'env(safe-area-inset-right, 20px)',
          }}
        />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;