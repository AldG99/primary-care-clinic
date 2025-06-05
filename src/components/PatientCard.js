// src/components/PatientCard.js (con fecha de nacimiento)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { calculateAge } from '../utils/dateUtils';
import Card from './Card';

const PatientCard = ({ patient }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const handlePress = () => {
    // Asegúrate de que la ruta sea consistente con AppNavigator.js
    navigate(`/patients/${patient.id}`);
  };

  const getGenderIcon = () => {
    return patient.gender === 'male' ? 'mars' : 'venus';
  };

  // Función para formatear fecha de nacimiento
  const formatBirthDate = dateString => {
    if (!dateString) return '';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <Card
      title={`${patient.firstName} ${patient.lastName}`}
      subtitle={
        patient.birthDate
          ? `${calculateAge(patient.birthDate)} años - ${
              patient.gender === 'male' ? 'Masculino' : 'Femenino'
            }`
          : ''
      }
      leftIcon={
        <IconContainer backgroundColor={`${colors.secondary}20`}>
          {patient.photoURL ? (
            <PatientPhoto src={patient.photoURL} alt={patient.firstName} />
          ) : (
            <i
              className={`fas fa-${getGenderIcon()}`}
              style={{ color: colors.secondary, fontSize: '18px' }}
            />
          )}
        </IconContainer>
      }
      rightIcon={
        <i
          className="fas fa-chevron-right"
          style={{ fontSize: '16px', color: colors.subtext }}
        />
      }
      content={
        <ContentContainer>
          {patient.phone && (
            <InfoRow>
              <InfoIcon className="fas fa-phone" color={colors.secondary} />
              <InfoText>{patient.phone}</InfoText>
            </InfoRow>
          )}

          {/* Agregamos la fecha de nacimiento */}
          {patient.birthDate && (
            <InfoRow>
              <InfoIcon
                className="fas fa-birthday-cake"
                color={colors.secondary}
              />
              <InfoText>
                Fecha de nacimiento: {formatBirthDate(patient.birthDate)}
              </InfoText>
            </InfoRow>
          )}

          {patient.lastVisit && (
            <InfoRow>
              <InfoIcon
                className="fas fa-calendar-check"
                color={colors.secondary}
              />
              <InfoText>
                Última visita:{' '}
                {new Date(patient.lastVisit).toLocaleDateString('es-MX', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </InfoText>
            </InfoRow>
          )}

          {patient.upcomingAppointment && (
            <InfoRow>
              <InfoIcon className="fas fa-calendar-alt" color={colors.accent} />
              <InfoText color={colors.accent}>
                Próxima cita:{' '}
                {new Date(patient.upcomingAppointment).toLocaleDateString(
                  'es-MX',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }
                )}
              </InfoText>
            </InfoRow>
          )}
        </ContentContainer>
      }
      onClick={handlePress}
    />
  );
};

// Estilos
const IconContainer = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${props => props.backgroundColor};
  overflow: hidden;
`;

const PatientPhoto = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ContentContainer = styled.div`
  margin-top: 8px;
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  &:last-child {
    margin-bottom: 0;
  }
`;

const InfoIcon = styled.i`
  color: ${props => props.color};
  font-size: 14px;
  width: 20px;
  margin-right: 8px;
  text-align: center;
`;

const InfoText = styled.span`
  font-size: 14px;
  color: ${props => props.color || props.theme.colors.text};
`;

export default PatientCard;
