// src/context/ThemeContext.js (versión corregida)
import React, { createContext, useState, useEffect } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components';
import { COLORS } from '../constants/colors';

// Create a context for the theme
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Intentar obtener el tema guardado de localStorage, o usar 'light' como valor predeterminado
  const savedTheme = localStorage.getItem('themePreference') || 'light';
  // Initial theme state from localStorage or default to 'light'
  const [themeName, setThemeName] = useState(savedTheme);
  // Theme colors based on current theme
  const [themeColors, setThemeColors] = useState(COLORS[savedTheme]);

  // Aplicar el tema solo en el montaje inicial si no hay preferencia guardada
  useEffect(() => {
    // Solo usar preferencia del sistema si no hay tema guardado
    if (!localStorage.getItem('themePreference') && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      // Set initial theme based on system preference only if no saved preference
      const updateTheme = e => {
        const newTheme = e.matches ? 'dark' : 'light';
        setThemeName(newTheme);
        setThemeColors(COLORS[newTheme]);
        localStorage.setItem('themePreference', newTheme);
      };

      // Initialize with current preference
      updateTheme(mediaQuery);

      // Listen for preference changes
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', updateTheme);
        return () => mediaQuery.removeEventListener('change', updateTheme);
      } else if (mediaQuery.addListener) {
        // For older browsers
        mediaQuery.addListener(updateTheme);
        return () => mediaQuery.removeListener(updateTheme);
      }
    }
  }, []);

  // Toggle theme manually and save to localStorage
  const toggleTheme = () => {
    const newTheme = themeName === 'light' ? 'dark' : 'light';
    setThemeName(newTheme);
    setThemeColors(COLORS[newTheme]);
    // Guardar el tema seleccionado en localStorage
    localStorage.setItem('themePreference', newTheme);
    // Optional: set a data attribute on HTML for CSS selectors
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Update data-theme attribute when theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeName);
  }, [themeName]);

  // Create the theme object with all necessary properties
  const theme = {
    theme: themeName,
    colors: themeColors,
    toggleTheme,
  };

  // Provide the theme context and also wrap with styled-components ThemeProvider
  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
