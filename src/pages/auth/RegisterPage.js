// src/pages/auth/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'doctor',
    organization: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!formData.email) {
      newErrors.email = 'El correo electrónico es obligatorio';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
    }

    if (!formData.password) {
      newErrors.password = 'La contraseña es obligatoria';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar registro
  const handleRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const displayName = `${formData.firstName} ${formData.lastName}`;
      await register(
        formData.email,
        formData.password,
        displayName,
        formData.role,
        formData.organization
      );
    } catch (error) {
      console.error('Error al registrar usuario:', error);
      let errorMessage = 'Error al registrar usuario';

      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Ya existe una cuenta con este correo electrónico';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Correo electrónico inválido';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Error de conexión. Verifica tu conexión a internet';
          break;
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <RegisterContainer>
        <ScrollContent>
          <Header>
            <BackButton onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
            </BackButton>
            <Title>Crear cuenta</Title>
          </Header>

          <FormContainer>
            <NameRow>
              <Input
                label="Nombre"
                placeholder="Nombre"
                value={formData.firstName}
                onChange={e => handleChange('firstName', e.target.value)}
                error={errors.firstName}
                touched={touched.firstName}
                className="nameInput"
              />

              <Input
                label="Apellido"
                placeholder="Apellido"
                value={formData.lastName}
                onChange={e => handleChange('lastName', e.target.value)}
                error={errors.lastName}
                touched={touched.lastName}
                className="nameInput"
              />
            </NameRow>

            <Input
              label="Correo electrónico"
              placeholder="tucorreo@ejemplo.com"
              value={formData.email}
              onChange={e => handleChange('email', e.target.value)}
              type="email"
              autoCapitalize="none"
              error={errors.email}
              touched={touched.email}
              leftIcon={<i className="far fa-envelope"></i>}
            />

            <Input
              label="Contraseña"
              placeholder="Contraseña (min. 6 caracteres)"
              value={formData.password}
              onChange={e => handleChange('password', e.target.value)}
              type="password"
              error={errors.password}
              touched={touched.password}
              leftIcon={<i className="fas fa-lock"></i>}
            />

            <Input
              label="Confirmar contraseña"
              placeholder="Confirmar contraseña"
              value={formData.confirmPassword}
              onChange={e => handleChange('confirmPassword', e.target.value)}
              type="password"
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
              leftIcon={<i className="fas fa-lock"></i>}
            />

            <Input
              label="Organización/Institución"
              placeholder="Nombre de clínica, hospital o consultorio"
              value={formData.organization}
              onChange={e => handleChange('organization', e.target.value)}
              leftIcon={<i className="far fa-building"></i>}
            />

            <RoleLabel>Rol en el sistema</RoleLabel>
            <RoleContainer>
              <RoleButton
                active={formData.role === 'doctor'}
                onClick={() => handleChange('role', 'doctor')}
              >
                <i className="fas fa-user-md"></i>
                <RoleText active={formData.role === 'doctor'}>Médico</RoleText>
              </RoleButton>

              <RoleButton
                active={formData.role === 'nurse'}
                onClick={() => handleChange('role', 'nurse')}
              >
                <i className="fas fa-heartbeat"></i>
                <RoleText active={formData.role === 'nurse'}>
                  Enfermera/o
                </RoleText>
              </RoleButton>
            </RoleContainer>

            <Button
              title="Registrarse"
              onClick={handleRegister}
              loading={loading}
              fullWidth
              className="registerButton"
            />
          </FormContainer>

          <Footer>
            <FooterText>¿Ya tienes una cuenta?</FooterText>
            <LoginText onClick={() => navigate('/login')}>
              Iniciar sesión
            </LoginText>
          </Footer>
        </ScrollContent>
      </RegisterContainer>
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

const RegisterContainer = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px;
`;

const ScrollContent = styled.div`
  display: flex;
  flex-direction: column;
  padding: 32px;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 24px;
`;

const BackButton = styled.button`
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-right: 16px;
  cursor: pointer;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
`;

const NameRow = styled.div`
  display: flex;
  gap: 16px;

  & > div {
    flex: 1;
  }
`;

const RoleLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
  margin-top: 8px;
`;

const RoleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
`;

const RoleButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.secondary : theme.colors.border};
  border-radius: 8px;
  padding: 12px 16px;
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.secondary}15` : 'transparent'};
  flex: 1;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.secondary}25` : `${theme.colors.background}`};
  }

  i {
    margin-right: 8px;
    color: ${({ theme, active }) =>
      active ? theme.colors.secondary : theme.colors.subtext};
    font-size: 18px;
  }
`;

const RoleText = styled.span`
  font-size: 14px;
  color: ${({ theme, active }) =>
    active ? theme.colors.secondary : theme.colors.text};
  font-weight: ${({ active }) => (active ? '600' : '400')};
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

const LoginText = styled.button`
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

export default RegisterPage;
