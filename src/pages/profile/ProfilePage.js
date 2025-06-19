// src/pages/profile/ProfilePage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, userRole, logout } = useAuth();

  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro que deseas cerrar sesión?')) {
      setLoading(true);
      try {
        // Primero hacer logout
        await logout();

        // Usar un pequeño retraso antes de navegar
        // Esto da tiempo a Firebase para completar la acción de cierre de sesión
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 100);
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ha ocurrido un error al cerrar sesión');
        setLoading(false); // Solo desactivamos loading si hay error
      }
      // No pongamos setLoading(false) aquí, ya que el componente será desmontado
    }
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>Mi perfil</Title>
        </Header>

        <ScrollContent>
          <ProfileHeader>
            <AvatarContainer>
              {user?.photoURL ? (
                <AvatarImage src={user.photoURL} alt="Foto de perfil" />
              ) : (
                <AvatarPlaceholder>
                  {user?.displayName?.charAt(0) || 'U'}
                </AvatarPlaceholder>
              )}
            </AvatarContainer>

            <ProfileInfo>
              <ProfileName>{user?.displayName || 'Usuario'}</ProfileName>
              <ProfileEmail>{user?.email || ''}</ProfileEmail>

              {user?.organization && (
                <ProfileOrganization>{user.organization}</ProfileOrganization>
              )}

              <RoleBadge>
                <RoleText>
                  {userRole === 'doctor' ? 'Médico' : 'Enfermera/o'}
                </RoleText>
              </RoleBadge>
            </ProfileInfo>
          </ProfileHeader>

          <SettingsSection>
            <SectionTitle>Cuenta</SectionTitle>

            <SettingItem onClick={() => navigate('/edit-profile')}>
              <SettingItemLeft>
                <SettingIcon className="fas fa-user" />
                <SettingTitle>Editar perfil</SettingTitle>
              </SettingItemLeft>
              <SettingIcon className="fas fa-chevron-right" />
            </SettingItem>

            <SettingItem onClick={() => {}}>
              <SettingItemLeft>
                <SettingIcon className="fas fa-lock" />
                <SettingTitle>Cambiar contraseña</SettingTitle>
              </SettingItemLeft>
              <SettingIcon className="fas fa-chevron-right" />
            </SettingItem>

            <SettingItem onClick={() => {}}>
              <SettingItemLeft>
                <SettingIcon className="fas fa-bell" />
                <SettingTitle>Notificaciones</SettingTitle>
              </SettingItemLeft>
              <SettingIcon className="fas fa-chevron-right" />
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>Apariencia</SectionTitle>

            <SettingItem>
              <SettingItemLeft>
                <SettingIcon className="fas fa-moon" />
                <SettingTitle>Tema oscuro</SettingTitle>
              </SettingItemLeft>
              <SwitchContainer>
                <SwitchInput
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  id="themeSwitch"
                />
                <SwitchLabel htmlFor="themeSwitch" />
              </SwitchContainer>
            </SettingItem>
          </SettingsSection>

          <SettingsSection>
            <SectionTitle>Información</SectionTitle>

            <SettingItem>
              <SettingItemLeft>
                <SettingIcon className="fas fa-info-circle" />
                <SettingTitle>Versión</SettingTitle>
              </SettingItemLeft>
              <SettingValue>1.0.0</SettingValue>
            </SettingItem>

            <SettingItem onClick={() => {}}>
              <SettingItemLeft>
                <SettingIcon className="fas fa-question-circle" />
                <SettingTitle>Ayuda y soporte</SettingTitle>
              </SettingItemLeft>
              <SettingIcon className="fas fa-chevron-right" />
            </SettingItem>

            <SettingItem onClick={() => {}}>
              <SettingItemLeft>
                <SettingIcon className="fas fa-file-alt" />
                <SettingTitle>Términos y condiciones</SettingTitle>
              </SettingItemLeft>
              <SettingIcon className="fas fa-chevron-right" />
            </SettingItem>

            <SettingItem onClick={() => {}}>
              <SettingItemLeft>
                <SettingIcon className="fas fa-shield-alt" />
                <SettingTitle>Política de privacidad</SettingTitle>
              </SettingItemLeft>
              <SettingIcon className="fas fa-chevron-right" />
            </SettingItem>
          </SettingsSection>

          <LogoutButtonContainer>
            <Button
              title="Cerrar sesión"
              onClick={handleLogout}
              loading={loading}
              variant="danger"
              leftIcon={
                <i
                  className="fas fa-sign-out-alt"
                  style={{ color: '#FFF' }}
                ></i>
              }
            />
          </LogoutButtonContainer>
        </ScrollContent>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

// Estilos
const PageContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 800px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px auto;
  flex-grow: 1;
`;

const Header = styled.div`
  padding: 16px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  justify-content: center;
`;

const Title = styled.h1`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ScrollContent = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const AvatarContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background-color: ${({ theme }) => `${theme.colors.secondary}15`};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  overflow: hidden;
`;

const AvatarImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 40px;
`;

const AvatarPlaceholder = styled.div`
  font-size: 32px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`;

const ProfileInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const ProfileName = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 6px 0;
`;

const ProfileEmail = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 8px 0;
`;

const ProfileOrganization = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 12px 0;
  font-style: italic;
`;

const RoleBadge = styled.div`
  align-self: flex-start;
  padding: 4px 12px;
  border-radius: 20px;
  background-color: ${({ theme }) => `${theme.colors.secondary}15`};
`;

const RoleText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
`;

const SettingsSection = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

const SettingItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.backgroundLight}`};
  }
`;

const SettingItemLeft = styled.div`
  display: flex;
  align-items: center;
`;

const SettingIcon = styled.i`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.secondary};
  margin-right: 16px;
  width: 20px;
  text-align: center;

  &:last-child {
    margin-right: 0;
    color: ${({ theme }) => theme.colors.subtext};
  }
`;

const SettingTitle = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const SettingValue = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

// Estilo del Switch personalizado
const SwitchContainer = styled.div`
  position: relative;
  display: inline-block;
  width: 46px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + label {
    background-color: ${({ theme }) => `${theme.colors.secondary}`};
  }

  &:checked + label:before {
    transform: translateX(22px);
  }

  &:focus + label {
    box-shadow: 0 0 1px ${({ theme }) => theme.colors.secondary};
  }
`;

const SwitchLabel = styled.label`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${({ theme }) => theme.colors.border};
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: '';
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`;

const LogoutButtonContainer = styled.div`
  margin-top: 24px;
  margin-bottom: 16px;
`;

export default ProfilePage;
