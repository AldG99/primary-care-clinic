import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import './firebase';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

// For web, we need to add global styles
import './styles/global.css';

const container = document.getElementById('root');
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <AlertProvider>
          <App />
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>
);
