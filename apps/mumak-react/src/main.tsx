import { ThemeProvider } from '@/components/theme-provider';
import '@mumak/ui/globals.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './app';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <App />
    </ThemeProvider>
  </StrictMode>
);
