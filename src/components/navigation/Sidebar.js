// src/components/navigation/Sidebar.js
import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

const Sidebar = () => {
  const { colors } = useTheme();
  const { hasPermission } = useAuth();
  const location = useLocation();
  const [expanded, setExpanded] = useState(true);

  const toggleSidebar = () => {
    setExpanded(!expanded);
  };

  // Determine if a route is active
  const isActive = path => {
    return location.pathname === path;
  };

  return (
    <SidebarContainer expanded={expanded}>
      <LogoContainer>
        {/* Reemplazamos el icono por la imagen del logo */}
        <AppLogoImg>
          <img src="/assets/logo.png" alt="MediNote Logo" />
        </AppLogoImg>
        {expanded && <AppName>MediNote</AppName>}
        <ToggleButton onClick={toggleSidebar}>
          <i className={`fas fa-chevron-${expanded ? 'left' : 'right'}`}></i>
        </ToggleButton>
      </LogoContainer>

      <NavLinks>
        <NavItem to="/" active={isActive('/')}>
          <NavIcon className="fas fa-home"></NavIcon>
          {expanded && <NavText>Inicio</NavText>}
        </NavItem>

        <NavItem to="/patients" active={isActive('/patients')}>
          <NavIcon className="fas fa-users"></NavIcon>
          {expanded && <NavText>Pacientes</NavText>}
        </NavItem>

        <NavItem to="/records" active={isActive('/records')}>
          <NavIcon className="fas fa-file-medical"></NavIcon>
          {expanded && <NavText>Registros</NavText>}
        </NavItem>

        <NavItem to="/alerts" active={isActive('/alerts')}>
          <NavIcon className="fas fa-bell"></NavIcon>
          {expanded && <NavText>Alertas</NavText>}
        </NavItem>

        <NavItem to="/search" active={isActive('/search')}>
          <NavIcon className="fas fa-search"></NavIcon>
          {expanded && <NavText>Buscar</NavText>}
        </NavItem>
      </NavLinks>

      <BottomLinks>
        <NavItem to="/settings" active={isActive('/settings')}>
          <NavIcon className="fas fa-cog"></NavIcon>
          {expanded && <NavText>Configuración</NavText>}
        </NavItem>

        <NavItem to="/profile" active={isActive('/profile')}>
          <NavIcon className="fas fa-user"></NavIcon>
          {expanded && <NavText>Perfil</NavText>}
        </NavItem>
      </BottomLinks>
    </SidebarContainer>
  );
};

// Estilos
const SidebarContainer = styled.aside`
  display: flex;
  flex-direction: column;
  width: ${({ expanded }) => (expanded ? '240px' : '60px')};
  background-color: ${props => props.theme.colors.white};
  border-right: 1px solid ${props => props.theme.colors.border};
  transition: width 0.3s ease;
  overflow: hidden;
  height: 100vh;
  position: sticky;
  top: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid ${props => props.theme.colors.border};
  position: relative;
`;

// Reemplazamos AppLogo con AppLogoImg
const AppLogoImg = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain; /* Para asegurar que el logo se vea completo */
  }
`;

const AppName = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.text};
  white-space: nowrap;
`;

const ToggleButton = styled.button`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
`;

// Resto de los estilos se mantienen igual
const NavLinks = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  flex: 1;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  color: ${props =>
    props.active ? props.theme.colors.secondary : props.theme.colors.text};
  text-decoration: none;
  font-weight: ${props => (props.active ? '600' : '400')};
  background-color: ${props =>
    props.active ? props.theme.colors.secondaryLight : 'transparent'};
  border-left: 3px solid
    ${props => (props.active ? props.theme.colors.secondary : 'transparent')};

  &:hover {
    background-color: ${props => props.theme.colors.backgroundLight};
  }
`;

const NavIcon = styled.i`
  font-size: 16px;
  width: 24px;
  text-align: center;
`;

const NavText = styled.span`
  margin-left: 12px;
  white-space: nowrap;
`;

const BottomLinks = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px 0;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

export default Sidebar;
