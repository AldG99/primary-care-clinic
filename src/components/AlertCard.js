// src/components/AlertCard.js
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import Button from './Button';

const AlertCard = ({ alert, onComplete }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';

    const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getAlertTypeInfo = type => {
    switch (type) {
      case 'appointment':
        return {
          icon: 'calendar-alt',
          label: 'Cita',
          color: colors.secondary,
        };
      case 'medication':
        return {
          icon: 'pills',
          label: 'Medicación',
          color: colors.error,
        };
      case 'follow_up':
        return {
          icon: 'user-md',
          label: 'Seguimiento',
          color: colors.info,
        };
      case 'lab_results':
        return {
          icon: 'flask',
          label: 'Resultados lab',
          color: colors.success,
        };
      case 'task':
        return {
          icon: 'tasks',
          label: 'Tarea',
          color: colors.warning,
        };
      default:
        return {
          icon: 'bell',
          label: 'Recordatorio',
          color: colors.accent,
        };
    }
  };

  const getPriorityColor = priority => {
    switch (priority) {
      case 'high':
        return colors.error;
      case 'medium':
        return colors.warning;
      case 'low':
        return colors.info;
      default:
        return colors.secondary;
    }
  };

  const alertTypeInfo = getAlertTypeInfo(alert.type);
  const priorityColor = getPriorityColor(alert.priority);

  const handlePatientPress = () => {
    if (alert.patientId) {
      navigate(`/patients/${alert.patientId}`);
    }
  };

  return (
    <CardContainer completed={alert.completed}>
      <CardHeader>
        <TypeContainer backgroundColor={`${alertTypeInfo.color}15`}>
          <i
            className={`fas fa-${alertTypeInfo.icon}`}
            style={{ color: alertTypeInfo.color }}
          ></i>
        </TypeContainer>

        <HeaderContent>
          <Title completed={alert.completed}>{alert.title}</Title>
          <Subtitle>
            <PriorityBadge color={priorityColor}>
              <PriorityDot color={priorityColor} />
              <PriorityText>
                {alert.priority === 'high'
                  ? 'Alta'
                  : alert.priority === 'medium'
                  ? 'Media'
                  : 'Baja'}
              </PriorityText>
            </PriorityBadge>

            <DateText>{formatDate(alert.scheduledDate)}</DateText>
          </Subtitle>
        </HeaderContent>

        {alert.completed && (
          <CompletedBadge>
            <i className="fas fa-check-circle"></i>
          </CompletedBadge>
        )}
      </CardHeader>

      {alert.description && (
        <Description completed={alert.completed}>
          {alert.description}
        </Description>
      )}

      {alert.patientId && alert.patientName && (
        <PatientContainer onClick={handlePatientPress}>
          <PatientContent>
            {alert.patientPhotoURL ? (
              <PatientAvatar
                src={alert.patientPhotoURL}
                alt={alert.patientName}
              />
            ) : (
              <PatientInitials>
                {alert.patientName.charAt(0).toUpperCase()}
              </PatientInitials>
            )}
            <PatientName>{alert.patientName}</PatientName>
          </PatientContent>
          <i
            className="fas fa-chevron-right"
            style={{ fontSize: '14px', color: colors.subtext }}
          ></i>
        </PatientContainer>
      )}

      {onComplete && (
        <FooterContainer>
          <Button
            title="Marcar como completado"
            onClick={onComplete}
            variant="secondary"
            size="small"
            fullWidth
          />
        </FooterContainer>
      )}

      {alert.completed && alert.completedAt && (
        <CompletedInfo>
          Completado el{' '}
          {new Date(alert.completedAt).toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </CompletedInfo>
      )}
    </CardContainer>
  );
};

// Estilos
const CardContainer = styled.div`
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme, completed }) =>
    completed ? theme.colors.backgroundLight : theme.colors.white};
  padding: 16px;
  margin-bottom: 16px;
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  position: relative;
`;

const TypeContainer = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${props => props.backgroundColor};
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
  flex-shrink: 0;

  i {
    font-size: 18px;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme, completed }) =>
    completed ? theme.colors.textMuted : theme.colors.text};
  margin: 0 0 6px 0;
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
`;

const Subtitle = styled.div`
  display: flex;
  align-items: center;
`;

const PriorityBadge = styled.div`
  display: flex;
  align-items: center;
  margin-right: 12px;
`;

const PriorityDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 4px;
  background-color: ${props => props.color};
  margin-right: 6px;
`;

const PriorityText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const DateText = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Description = styled.p`
  font-size: 14px;
  margin: 12px 0;
  color: ${({ theme, completed }) =>
    completed ? theme.colors.textMuted : theme.colors.text};
  text-decoration: ${({ completed }) => (completed ? 'line-through' : 'none')};
`;

const CompletedBadge = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  color: ${({ theme }) => theme.colors.success};
  font-size: 16px;
`;

const PatientContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => `${theme.colors.backgroundLight}`};
  border-radius: 6px;
  padding: 8px 12px;
  margin: 12px 0;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.secondary}10`};
  }
`;

const PatientContent = styled.div`
  display: flex;
  align-items: center;
`;

const PatientAvatar = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  margin-right: 8px;
  object-fit: cover;
`;

const PatientInitials = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
`;

const PatientName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const FooterContainer = styled.div`
  margin-top: 16px;
`;

const CompletedInfo = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.success};
  text-align: right;
  margin: 8px 0 0 0;
  font-style: italic;
`;

export default AlertCard;
