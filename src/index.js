import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Importar archivos CSS personalizados
import './styles/globalStyles';

// Importar Font Awesome
import '@fortawesome/fontawesome-free/css/all.min.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
