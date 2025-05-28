// src/styles/globalStyles.js
import { createGlobalStyle, css } from 'styled-components';
import { COLORS } from '../constants/colors';

// Estilos comunes reutilizables como mixins
export const mixins = {
  flexCenter: css`
    display: flex;
    justify-content: center;
    align-items: center;
  `,
  flexColumn: css`
    display: flex;
    flex-direction: column;
  `,
  flexRow: css`
    display: flex;
    flex-direction: row;
  `,
  spaceBetween: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
  `,
  card: css`
    border-radius: 12px;
    padding: 20px;
    background-color: ${({ theme }) => theme.colors.white};
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  `,
};

// Estilos componentes comunes
export const commonStyles = {
  container: css`
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background-color: ${({ theme }) => theme.colors.background};
  `,

  contentContainer: css`
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 1100px;
    background-color: ${({ theme }) => theme.colors.white};
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    overflow: hidden;
    margin: 20px auto;
    flex-grow: 1;
  `,

  header: css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  `,

  title: css`
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  `,

  backButton: css`
    background: none;
    border: none;
    font-size: 18px;
    color: ${({ theme }) => theme.colors.text};
    cursor: pointer;
    width: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  `,

  content: css`
    flex: 1;
    padding: 24px;
    overflow-y: auto;
  `,

  section: css`
    margin-bottom: 32px;
  `,

  sectionHeader: css`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
  `,

  sectionTitle: css`
    font-size: 20px;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.text};
    margin: 0;
  `,

  sectionLink: css`
    background: none;
    border: none;
    font-size: 15px;
    color: ${({ theme }) => theme.colors.secondary};
    cursor: pointer;
    padding: 0;

    &:hover {
      text-decoration: underline;
    }
  `,

  emptyState: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 24px;
    border: 1px dashed ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    text-align: center;
    margin: 16px 0;
  `,

  emptyStateText: css`
    font-size: 16px;
    color: ${({ theme }) => theme.colors.text};
    margin: 16px 0 0 0;
  `,

  footer: css`
    padding: 20px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    background-color: ${({ theme }) => theme.colors.white};
  `,

  textInput: css`
    width: 100%;
    padding: 12px 16px;
    border: 1px solid ${({ theme }) => theme.colors.border};
    border-radius: 8px;
    font-size: 15px;
    color: ${({ theme }) => theme.colors.text};
    background-color: ${({ theme }) => theme.colors.white};

    &:focus {
      outline: none;
      border-color: ${({ theme }) => theme.colors.primary};
      box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
    }

    &::placeholder {
      color: ${({ theme }) => theme.colors.textMuted};
    }
  `,

  errorText: css`
    color: ${({ theme }) => theme.colors.error};
    font-size: 13px;
    margin: 4px 0 0 0;
  `,

  loadingContainer: css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: 40px 0;
  `,

  spinner: css`
    width: 40px;
    height: 40px;
    border: 3px solid ${({ theme }) => `${theme.colors.secondary}30`};
    border-top: 3px solid ${({ theme }) => theme.colors.secondary};
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 16px;

    @keyframes spin {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }
  `,

  loadingText: css`
    color: ${({ theme }) => theme.colors.subtext};
    font-size: 16px;
  `,
};

// Crear estilos globales
export const createGlobalStyles = (theme = 'light') => {
  const colors = COLORS[theme];

  return {
    colors,
    ...commonStyles,
    ...mixins,
  };
};

// Estilos globales de CSS para toda la aplicación
export const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: 'Roboto', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.text};
    line-height: 1.5;
  }
  
  button, input, select, textarea {
    font-family: inherit;
  }
  
  a {
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: 0;
    font-weight: 600;
    line-height: 1.3;
  }
  
  p {
    margin: 0;
  }
  
  /* Responsive breakpoints */
  @media (max-width: 768px) {
    .hide-mobile {
      display: none !important;
    }
  }
  
  @media (min-width: 769px) {
    .hide-desktop {
      display: none !important;
    }
  }
`;

// Ejemplo de uso:
// En ThemeProvider
// <ThemeProvider theme={{ colors: COLORS['light'] }}>
//   <GlobalStyle />
//   <App />
// </ThemeProvider>

// En componentes
// import { commonStyles, mixins } from '../styles/globalStyles';
// const Container = styled.div`
//   ${commonStyles.container}
// `;

export default createGlobalStyles;
