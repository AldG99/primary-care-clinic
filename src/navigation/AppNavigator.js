// src/navigation/AppNavigator.js (corregido sin padding)
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';

// Páginas de autenticación
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';

// Páginas principales
import HomePage from '../pages/HomePage';
import PatientListPage from '../pages/patients/PatientListPage';
import PatientDetailPage from '../pages/patients/PatientDetailPage';
import AddPatientPage from '../pages/patients/AddPatientPage';
// No importamos EditPatientPage porque no existe aún
import RecordListPage from '../pages/records/RecordListPage';
import AddRecordPage from '../pages/records/AddRecordPage';
import RecordDetailPage from '../pages/records/RecordDetailPage';
import AlertsPage from '../pages/alerts/AlertsPage';
// No importamos CreateAlertPage porque no existe aún
import ProfilePage from '../pages/profile/ProfilePage';
import EditProfilePage from '../pages/profile/EditProfilePage';
import SearchPage from '../pages/SearchPage';

// Componentes de navegación
import Navbar from '../components/navigation/Navbar';
import Sidebar from '../components/navigation/Sidebar';

// Componente para rutas protegidas que requieren autenticación
const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  // Usar Navigate en lugar de return <Navigate>
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

// Estructura principal con Sidebar y contenido
const MainLayout = () => {
  const theme = useTheme();

  return (
    <div
      className="app-container"
      style={{
        display: 'flex',
        backgroundColor: theme.colors.background,
        minHeight: '100vh',
        color: theme.colors.text,
      }}
    >
      <Sidebar />
      <div className="content" style={{ flex: 1 }}>
        <Navbar />
        <div className="page-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

// Estructura para rutas de autenticación (sin sidebar)
const AuthLayout = () => {
  const theme = useTheme();

  return (
    <div
      className="auth-container"
      style={{
        backgroundColor: theme.colors.background,
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: theme.colors.text,
      }}
    >
      <Outlet />
    </div>
  );
};

const AppNavigator = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <Router>
      <Routes>
        {/* Rutas de autenticación */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Rutas protegidas con MainLayout */}
        <Route element={<PrivateRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />

            {/* Rutas de pacientes */}
            <Route path="/patients" element={<PatientListPage />} />
            <Route path="/add-patient" element={<AddPatientPage />} />
            <Route
              path="/patients/:patientId"
              element={<PatientDetailPage />}
            />
            {/* Temporalmente comentamos esta ruta hasta que exista el componente
            <Route path="/edit-patient/:patientId" element={<EditPatientPage />} /> */}

            {/* Rutas de registros médicos */}
            <Route path="/records" element={<RecordListPage />} />
            <Route path="/add-record" element={<AddRecordPage />} />
            <Route path="/records/:recordId" element={<RecordDetailPage />} />

            {/* Rutas de alertas */}
            <Route path="/alerts" element={<AlertsPage />} />
            {/* Temporalmente comentamos esta ruta hasta que exista el componente
            <Route path="/create-alert" element={<CreateAlertPage />} /> */}

            {/* Otras rutas */}
            <Route path="/search" element={<SearchPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/edit-profile" element={<EditProfilePage />} />
          </Route>
        </Route>

        {/* Redirección por defecto */}
        <Route
          path="*"
          element={<Navigate to={user ? '/' : '/login'} replace />}
        />
      </Routes>
    </Router>
  );
};

export default AppNavigator;
