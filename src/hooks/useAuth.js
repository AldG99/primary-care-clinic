// src/hooks/useAuth.js - Mejora opcional

import { useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => {
  const context = useContext(AuthContext);

  // Envolver logout en useCallback para evitar recreaciones innecesarias
  const enhancedLogout = useCallback(async () => {
    try {
      await context.logout();
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    }
  }, [context.logout]);

  return {
    ...context,
    logout: enhancedLogout,
  };
};
