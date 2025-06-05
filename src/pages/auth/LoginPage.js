// src/pages/auth/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      let errorMessage = 'Error al iniciar sesión';

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <LoginContainer>
        <ScrollContent>
          <HeaderContainer>
            <LogoContainer>
              <Logo src="/assets/logo.png" alt="MediNote Logo" />
            </LogoContainer>

            <Title>MediNote</Title>
            <Subtitle>Gestión de registros médicos</Subtitle>
          </HeaderContainer>

          <FormContainer>
            <Input
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              autoCapitalize="none"
              error={errors.email}
              touched={email !== ''}
              leftIcon={<i className="far fa-envelope"></i>}
            />

            <Input
              label="Contraseña"
              placeholder="Tu contraseña"
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              error={errors.password}
              touched={password !== ''}
              leftIcon={<i className="fas fa-lock"></i>}
            />

            <ForgotPassword>
              <ForgotPasswordText>¿Olvidaste tu contraseña?</ForgotPasswordText>
            </ForgotPassword>

            <Button
              title="Iniciar sesión"
              onClick={handleLogin}
              loading={loading}
              fullWidth
              className="loginButton"
            />
          </FormContainer>

          <Footer>
            <FooterText>¿No tienes una cuenta?</FooterText>
            <SignupText onClick={() => navigate('/register')}>
              Regístrate
            </SignupText>
          </Footer>
        </ScrollContent>
      </LoginContainer>
    </PageContainer>
  );
};

// Estilos
const PageContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  align-items: center;
  justify-content: center;
`;

const LoginContainer = styled.div`
  width: 100%;
  max-width: 450px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px;
`;

const ScrollContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 40px 32px;
`;

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 40px;
`;

const LogoContainer = styled.div`
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
`;

const Logo = styled.img`
  width: 100%;
  height: 100%;
  object-fit: contain;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
`;

const ForgotPassword = styled.button`
  align-self: flex-end;
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  margin-top: -12px;
  margin-bottom: 8px;
`;

const ForgotPasswordText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondary};

  &:hover {
    text-decoration: underline;
  }
`;

const Footer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 16px;
`;

const FooterText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
  margin-right: 4px;
`;

const SignupText = styled.button`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.accent};
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

export default LoginPage;
