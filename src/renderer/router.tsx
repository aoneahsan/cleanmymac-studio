import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Welcome } from './pages/Welcome';
import { Scanning } from './pages/Scanning';
import { ScanResults } from './pages/ScanResults';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { AppLayout } from './components/layout/AppLayout';

// Create root route
const rootRoute = createRootRoute({
  component: AppLayout,
});

// Public routes (no auth required)
const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Welcome,
});

const scanningRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scanning',
  component: Scanning,
});

const scanResultsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/scan-results',
  component: ScanResults,
});

// Protected routes (auth required)
const dashboardRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/dashboard',
  component: Dashboard,
  beforeLoad: async ({ context }) => {
    // Check if user is authenticated
    if (!context.auth.user) {
      throw new Error('Not authenticated');
    }
  },
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
  beforeLoad: async ({ context }) => {
    if (!context.auth.user) {
      throw new Error('Not authenticated');
    }
  },
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  welcomeRoute,
  scanningRoute,
  scanResultsRoute,
  dashboardRoute,
  settingsRoute,
]);

// Create the router
export const router = createRouter({ 
  routeTree,
  context: {
    auth: undefined!,
  },
});

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}