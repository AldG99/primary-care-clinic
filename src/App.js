// src/App.js
import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AlertProvider } from './context/AlertContext';
import AppNavigator from './navigation/AppNavigator';
import { GlobalStyle } from './styles/globalStyles';
import './firebase'; // Import Firebase configuration

function App() {
  return (
    <ThemeProvider>
      <GlobalStyle />
      <AuthProvider>
        <AlertProvider>
          <AppNavigator />
        </AlertProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
