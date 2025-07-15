import { createRouter, createRoute, createRootRoute } from '@tanstack/react-router';
import { Welcome } from './pages/Welcome';
import { Scanning } from './pages/Scanning';
import { ScanResults } from './pages/ScanResults';
import { Dashboard } from './pages/Dashboard';
import { Settings } from './pages/Settings';
import { SmartScan } from './pages/SmartScan';
import { History } from './pages/History';
import { Tools } from './pages/Tools';
import { Upgrade } from './pages/Upgrade';
import { AppUninstaller } from './pages/AppUninstaller';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { TermsOfService } from './pages/TermsOfService';
import { Contact } from './pages/Contact';
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
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
});

const smartScanRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/smart-scan',
  component: SmartScan,
});

const historyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/history',
  component: History,
});

const toolsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools',
  component: Tools,
});

const upgradeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/upgrade',
  component: Upgrade,
});

const appUninstallerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/app-uninstaller',
  component: AppUninstaller,
});

const privacyPolicyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy-policy',
  component: PrivacyPolicy,
});

const termsOfServiceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms-of-service',
  component: TermsOfService,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
  welcomeRoute,
  scanningRoute,
  scanResultsRoute,
  dashboardRoute,
  settingsRoute,
  smartScanRoute,
  historyRoute,
  toolsRoute,
  upgradeRoute,
  appUninstallerRoute,
  privacyPolicyRoute,
  termsOfServiceRoute,
  contactRoute,
]);

// Create the router
export const router = createRouter({ 
  routeTree,
});

// Register router types
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}