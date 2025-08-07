// src/components/navigation/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import './Sidebar.scss';

const Sidebar = () => {
  const { colors } = useTheme();
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  // Apply theme colors to CSS variables
  React.useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--theme-colors-white', colors.white);
    root.style.setProperty('--theme-colors-border', colors.border);
    root.style.setProperty('--theme-colors-text', colors.text);
    root.style.setProperty(
      '--theme-colors-background-light',
      colors.backgroundLight
    );
    root.style.setProperty('--theme-colors-secondary', colors.secondary);
    root.style.setProperty(
      '--theme-colors-secondary-light',
      colors.secondaryLight
    );
  }, [colors]);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  // Determine if a route is active
  const isActive = path => {
    return location.pathname === path;
  };

  // Construir clases CSS dinámicamente
  const buildSidebarClassName = () => {
    const classes = ['sidebar'];

    if (!expanded) {
      classes.push('sidebar--collapsed');
    }

    return classes.join(' ');
  };

  const buildNavItemClassName = path => {
    const classes = ['sidebar__nav-item'];

    if (isActive(path)) {
      classes.push('sidebar__nav-item--active');
    }

    return classes.join(' ');
  };

  const sidebarClassName = buildSidebarClassName();

  return (
    <aside className={sidebarClassName}>
      <div className="sidebar__logo-container">
        <div className="sidebar__logo-img">
          <img src="/assets/logo.png" alt="MediNote Logo" />
        </div>
        {expanded && <h1 className="sidebar__app-name">MediNote</h1>}
        <button
          className="sidebar__toggle-button"
          onClick={toggleSidebar}
          aria-label={expanded ? 'Colapsar sidebar' : 'Expandir sidebar'}
        >
          <i className={`fas fa-chevron-${expanded ? 'left' : 'right'}`}></i>
        </button>
      </div>

      <div className="sidebar__nav-links">
        <NavLink to="/" className={buildNavItemClassName('/')}>
          <i className="sidebar__nav-icon fas fa-home"></i>
          {expanded && <span className="sidebar__nav-text">Inicio</span>}
        </NavLink>

        <NavLink to="/patients" className={buildNavItemClassName('/patients')}>
          <i className="sidebar__nav-icon fas fa-users"></i>
          {expanded && <span className="sidebar__nav-text">Pacientes</span>}
        </NavLink>

        <NavLink to="/records" className={buildNavItemClassName('/records')}>
          <i className="sidebar__nav-icon fas fa-file-medical"></i>
          {expanded && <span className="sidebar__nav-text">Registros</span>}
        </NavLink>

        <NavLink to="/alerts" className={buildNavItemClassName('/alerts')}>
          <i className="sidebar__nav-icon fas fa-bell"></i>
          {expanded && <span className="sidebar__nav-text">Alertas</span>}
        </NavLink>

        <NavLink to="/search" className={buildNavItemClassName('/search')}>
          <i className="sidebar__nav-icon fas fa-search"></i>
          {expanded && <span className="sidebar__nav-text">Buscar</span>}
        </NavLink>
      </div>

      <div className="sidebar__bottom-links">
        <NavLink to="/settings" className={buildNavItemClassName('/settings')}>
          <i className="sidebar__nav-icon fas fa-cog"></i>
          {expanded && <span className="sidebar__nav-text">Configuración</span>}
        </NavLink>

        <NavLink to="/profile" className={buildNavItemClassName('/profile')}>
          <i className="sidebar__nav-icon fas fa-user"></i>
          {expanded && <span className="sidebar__nav-text">Perfil</span>}
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
