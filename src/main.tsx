import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { hydrateLocalStorageFromCloud, installCloudStorageSync } from './lib/cloudStorage';
import { registerServiceWorker } from './registerServiceWorker';
import { applyStoredTheme } from './components/ThemeToggle';

const root = document.getElementById('root')!;

const CLOUD_BOOT_RELOAD_KEY = 'CONSTRUCTION_PRO_CLOUD_BOOT_RELOAD';

const startApp = () => {
  // Render immediately. The login screen must not wait for a sleeping host,
  // Supabase DNS, or a slow network request.
  applyStoredTheme();
  const hydration = hydrateLocalStorageFromCloud();
  registerServiceWorker();

  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  // If cloud data was applied after the first paint, reload once so the
  // existing context initializers read that data. The session marker prevents
  // a reload loop on the next boot.
  void hydration.then((result) => {
    installCloudStorageSync();
    if (
      result === 'cloud' &&
      sessionStorage.getItem(CLOUD_BOOT_RELOAD_KEY) !== 'true'
    ) {
      sessionStorage.setItem(CLOUD_BOOT_RELOAD_KEY, 'true');
      window.location.reload();
    } else {
      sessionStorage.removeItem(CLOUD_BOOT_RELOAD_KEY);
    }
  });
};

startApp();
