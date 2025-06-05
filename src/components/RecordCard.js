// src/components/RecordCard.js - Final Version
import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme';
import Card from './Card';

const RecordCard = ({ record, showPatientInfo = false }) => {
  const navigate = useNavigate();
  const { colors } = useTheme();

  const formatDate = timestamp => {
    if (!timestamp) return 'N/A';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);

    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRecordTypeInfo = type => {
    switch (type) {
      case 'consultation':
        return {
          icon: 'notes-medical',
          label: 'Consulta',
          color: colors.info,
        };
      case 'lab':
        return {
          icon: 'flask',
          label: 'Resultados de Laboratorio',
          color: colors.success,
        };
      case 'prescription':
        return {
          icon: 'file-prescription',
          label: 'Prescripción',
          color: colors.secondary,
        };
      case 'vital_signs':
        return {
          icon: 'heartbeat',
          label: 'Signos Vitales',
          color: colors.warning,
        };
      case 'followup':
        return {
          icon: 'calendar-check',
          label: 'Seguimiento',
          color: colors.accent,
        };
      case 'procedure':
        return {
          icon: 'procedures',
          label: 'Procedimiento',
          color: colors.error,
        };
      default:
        return {
          icon: 'file-medical',
          label: 'Registro',
          color: colors.secondary,
        };
    }
  };

  const recordTypeInfo = getRecordTypeInfo(record.type);

  const handlePress = () => {
    navigate(`/records/${record.id}`);
  };

  return (
    <Card
      title={record.title || recordTypeInfo.label}
      subtitle={`${formatDate(record.date)}`}
      leftIcon={
        <IconContainer backgroundColor={`${recordTypeInfo.color}20`}>
          <i
            className={`fas fa-${recordTypeInfo.icon}`}
            style={{ color: recordTypeInfo.color, fontSize: '18px' }}
          />
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
          {showPatientInfo && record.patientName && (
            <PatientInfo>
              {record.patientPhotoURL ? (
                <PatientAvatar
                  src={record.patientPhotoURL}
                  alt={record.patientName}
                />
              ) : (
                <i
                  className="far fa-user"
                  style={{
                    color: colors.secondary,
                    fontSize: '16px',
                    marginRight: '8px',
                  }}
                />
              )}
              <PatientName color={colors.text}>
                {record.patientName}
              </PatientName>
            </PatientInfo>
          )}

          {record.diagnosis && (
            <InfoRow>
              <InfoLabel color={colors.subtext}>Diagnóstico:</InfoLabel>
              <InfoValue color={colors.text}>{record.diagnosis}</InfoValue>
            </InfoRow>
          )}

          {record.doctor && (
            <InfoRow>
              <InfoLabel color={colors.subtext}>Médico:</InfoLabel>
              <InfoValue color={colors.text}>{record.doctor}</InfoValue>
            </InfoRow>
          )}

          {record.summary && (
            <Summary color={colors.text}>{record.summary}</Summary>
          )}

          {record.tags && record.tags.length > 0 && (
            <TagsContainer>
              {record.tags.map((tag, index) => (
                <Tag
                  key={index}
                  backgroundColor={colors.secondaryLight}
                  borderColor={colors.secondary}
                >
                  <TagText color={colors.secondary}>{tag}</TagText>
                </Tag>
              ))}
            </TagsContainer>
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
`;

const ContentContainer = styled.div`
  margin-top: 8px;
`;

const PatientInfo = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 10px;
`;

const PatientAvatar = styled.img`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
`;

const PatientName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.color};
`;

const InfoRow = styled.div`
  display: flex;
  flex-direction: row;
  margin-bottom: 6px;
`;

const InfoLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  margin-right: 6px;
  color: ${props => props.color};
`;

const InfoValue = styled.span`
  font-size: 14px;
  flex: 1;
  color: ${props => props.color};
`;

const Summary = styled.p`
  font-size: 14px;
  margin-top: 6px;
  margin-bottom: 10px;
  color: ${props => props.color};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const Tag = styled.div`
  padding: 4px 8px;
  border-radius: 12px;
  border: 1px solid ${props => props.borderColor};
  background-color: ${props => props.backgroundColor};
  margin-right: 6px;
  margin-bottom: 6px;
`;

const TagText = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: ${props => props.color};
`;

export default RecordCard;
