// src/components/navigation/Navbar.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';

const Navbar = () => {
  const navigate = useNavigate();
  const { colors, theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  return (
    <NavbarContainer>
      <LeftSection>
        <MenuButton onClick={toggleMenu} className="show-mobile">
          <i className="fas fa-bars"></i>
        </MenuButton>
      </LeftSection>

      <RightSection>
        <IconButton onClick={toggleTheme}>
          <i className={`fas fa-${theme === 'light' ? 'moon' : 'sun'}`}></i>
        </IconButton>

        <IconButton onClick={() => navigate('/alerts')}>
          <i className="fas fa-bell"></i>
        </IconButton>

        <ProfileButton onClick={() => navigate('/profile')}>
          {user?.photoURL ? (
            <ProfileImage src={user.photoURL} alt="Foto de perfil" />
          ) : (
            <ProfileInitial>
              {user?.displayName?.charAt(0) || 'U'}
            </ProfileInitial>
          )}
        </ProfileButton>
      </RightSection>
    </NavbarContainer>
  );
};

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background-color: ${props => props.theme.colors.white};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  margin-bottom: 20px;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  padding: 4px;
  display: none;

  @media (max-width: 768px) {
    display: block;
  }
`;

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${props => props.theme.colors.backgroundLight};
  color: ${props => props.theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.secondaryLight};
  }
`;

const ProfileButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.theme.colors.secondaryLight};
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  overflow: hidden;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfileInitial = styled.span`
  font-size: 18px;
  font-weight: bold;
  color: ${props => props.theme.colors.secondary};
`;

export default Navbar;
