import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// PrimeReact imports
import 'primereact/resources/themes/lara-dark-purple/theme.css'; // theme
import 'primereact/resources/primereact.min.css'; // core css
import 'primeicons/primeicons.css'; // icons
import { PrimeReactProvider } from 'primereact/api';

// Custom styles
import './styles/primereact-overrides.css';
import './styles/onboarding.css';

// React Toastify
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <App />
    </PrimeReactProvider>
  </React.StrictMode>
);