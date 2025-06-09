// src/pages/records/RecordDetailPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Button from '../../components/Button';
import Footer from '../../components/Footer';
import { formatDate } from '../../utils/dateUtils';

const RecordDetailPage = () => {
  const navigate = useNavigate();
  const { recordId } = useParams();
  const { colors } = useTheme();
  const { hasPermission, user } = useAuth();
  const [record, setRecord] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecordData();
  }, [recordId, user]);

  const loadRecordData = async () => {
    setLoading(true);
    try {
      const recordDoc = await getDoc(doc(db, 'records', recordId));
      if (!recordDoc.exists()) {
        alert('El registro no existe o ha sido eliminado');
        navigate(-1);
        return;
      }

      const recordData = {
        id: recordDoc.id,
        ...recordDoc.data(),
      };

      if (recordData.createdBy !== user.uid) {
        alert('No tienes permiso para ver este registro');
        navigate(-1);
        return;
      }

      setRecord(recordData);

      if (recordData.patientId) {
        const patientDoc = await getDoc(
          doc(db, 'patients', recordData.patientId)
        );
        if (patientDoc.exists()) {
          const patientData = {
            id: patientDoc.id,
            ...patientDoc.data(),
          };
          if (patientData.createdBy !== user.uid) {
            console.warn('El paciente no pertenece al usuario actual');
          } else {
            setPatient(patientData);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos del registro:', error);
      alert('Ha ocurrido un error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const getRecordTypeInfo = type => {
    switch (type) {
      case 'consultation':
        return {
          icon: 'stethoscope',
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
          icon: 'file-medical',
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
          icon: 'calendar-alt',
          label: 'Seguimiento',
          color: colors.accent,
        };
      case 'procedure':
        return {
          icon: 'band-aid',
          label: 'Procedimiento',
          color: colors.error,
        };
      default:
        return {
          icon: 'file-alt',
          label: 'Registro',
          color: colors.secondary,
        };
    }
  };

  const createFollowupAlert = () => {
    if (!record || !patient) return;
    navigate('/create-alert', {
      state: {
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        initialData: {
          title: `Seguimiento: ${
            record.title || getRecordTypeInfo(record.type).label
          }`,
          description: `Seguimiento para ${patient.firstName} ${
            patient.lastName
          }${record.diagnosis ? `. Diagnóstico: ${record.diagnosis}` : ''}`,
          type: 'follow_up',
        },
      },
    });
  };

  const goToPatientDetail = () => {
    if (patient) {
      navigate(`/patient/${patient.id}`);
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Cargando datos del registro...</LoadingText>
        </LoadingContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (!record) {
    return (
      <PageContainer>
        <ErrorContainer>
          <i
            className="fas fa-exclamation-circle"
            style={{ fontSize: '48px', color: colors.error }}
          ></i>
          <ErrorText>No se pudo cargar el registro</ErrorText>
          <Button
            title="Volver"
            onClick={() => navigate(-1)}
            variant="secondary"
            style={{ marginTop: '16px' }}
          />
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  const recordTypeInfo = getRecordTypeInfo(record.type);

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </BackButton>
          <Title>Detalle del Registro</Title>
          {hasPermission('doctor') && (
            <EditButton
              onClick={() => {
                // Opción 1: Mostrar un mensaje
                alert('La funcionalidad de edición está en desarrollo');
              }}
            >
              <i className="fas fa-edit"></i>
            </EditButton>
          )}
        </Header>

        <ScrollContent>
          <RecordHeader>
            <TypeContainer color={recordTypeInfo.color}>
              <i className={`fas fa-${recordTypeInfo.icon}`}></i>
            </TypeContainer>
            <RecordInfo>
              <RecordTitle>{record.title || recordTypeInfo.label}</RecordTitle>
              <RecordDate>{formatDate(record.date)}</RecordDate>
              {record.doctor && (
                <RecordDoctor>Dr. {record.doctor}</RecordDoctor>
              )}
            </RecordInfo>
          </RecordHeader>

          {patient && (
            <PatientCard onClick={goToPatientDetail}>
              <PatientInfo>
                <i
                  className="fas fa-user"
                  style={{ color: colors.secondary, marginRight: '12px' }}
                ></i>
                <div>
                  <PatientName>
                    {patient.firstName} {patient.lastName}
                  </PatientName>
                  <PatientSubInfo>Ver detalle del paciente</PatientSubInfo>
                </div>
              </PatientInfo>
              <i
                className="fas fa-chevron-right"
                style={{ color: colors.subtext }}
              ></i>
            </PatientCard>
          )}

          <Sections>
            {record.diagnosis && (
              <Section>
                <SectionTitle>Diagnóstico</SectionTitle>
                <SectionContent>{record.diagnosis}</SectionContent>
              </Section>
            )}

            {record.summary && (
              <Section>
                <SectionTitle>Resumen</SectionTitle>
                <SectionContent>{record.summary}</SectionContent>
              </Section>
            )}

            {record.treatmentPlan && (
              <Section>
                <SectionTitle>Plan de tratamiento</SectionTitle>
                <SectionContent>{record.treatmentPlan}</SectionContent>
              </Section>
            )}

            {record.medications && (
              <Section>
                <SectionTitle>Medicamentos</SectionTitle>
                <SectionContent>{record.medications}</SectionContent>
              </Section>
            )}

            {record.observations && (
              <Section>
                <SectionTitle>Observaciones</SectionTitle>
                <SectionContent>{record.observations}</SectionContent>
              </Section>
            )}

            {record.followUpDate && (
              <Section>
                <SectionTitle>Fecha de seguimiento</SectionTitle>
                <HighlightedContent>
                  {formatDate(record.followUpDate)}
                </HighlightedContent>
              </Section>
            )}

            {record.tags && record.tags.length > 0 && (
              <Section>
                <SectionTitle>Etiquetas</SectionTitle>
                <TagsContainer>
                  {record.tags.map((tag, index) => (
                    <Tag key={index}>
                      <TagText>{tag}</TagText>
                    </Tag>
                  ))}
                </TagsContainer>
              </Section>
            )}
          </Sections>
        </ScrollContent>

        <ActionFooter>
          <Button
            title="Crear recordatorio de seguimiento"
            onClick={createFollowupAlert}
            variant="secondary"
            leftIcon={
              <i
                className="fas fa-calendar-alt"
                style={{ color: colors.secondary }}
              ></i>
            }
            style={{ width: '100%' }}
          />
        </ActionFooter>
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
  position: relative;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const EditButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  width: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ScrollContent = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  padding-bottom: 100px; /* Espacio para el botón inferior */
`;

const RecordHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 12px;
  margin-bottom: 24px;
`;

const TypeContainer = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 28px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  background-color: ${({ color }) => `${color}20`};
  color: ${({ color }) => color};
  font-size: 24px;
`;

const RecordInfo = styled.div`
  flex: 1;
`;

const RecordTitle = styled.h2`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 8px 0;
`;

const RecordDate = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0 0 4px 0;
`;

const RecordDoctor = styled.p`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
`;

const PatientCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 24px;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
`;

const PatientName = styled.p`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 4px 0;
`;

const PatientSubInfo = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
  margin: 0;
`;

const Sections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Section = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

const SectionTitle = styled.h3`
  font-size: 17px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 12px 0;
`;

const SectionContent = styled.p`
  font-size: 15px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
  white-space: pre-line;
`;

const HighlightedContent = styled(SectionContent)`
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 500;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.div`
  padding: 4px 10px;
  border-radius: 20px;
  background-color: ${({ theme }) => `${theme.colors.secondary}15`};
  border: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const TagText = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.secondary};
`;

const ActionFooter = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 -4px 10px rgba(0, 0, 0, 0.05);
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => `${theme.colors.secondary}30`};
  border-top: 3px solid ${({ theme }) => theme.colors.secondary};
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.p`
  color: ${({ theme }) => theme.colors.subtext};
  font-size: 16px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  flex: 1;
`;

const ErrorText = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  text-align: center;
  margin: 16px 0;
`;

export default RecordDetailPage;
