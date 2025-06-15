// src/pages/patients/PatientDetailPage.js (versión corregida)
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styled from 'styled-components';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  addDoc,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import RecordCard from '../../components/RecordCard';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const PatientDetailPage = () => {
  const navigate = useNavigate();
  const { patientId } = useParams();
  const { colors } = useTheme();
  const { hasPermission, user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [schedulingAppointment, setSchedulingAppointment] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Una semana a partir de hoy
  );

  useEffect(() => {
    loadPatientData();
  }, [patientId, user]);

  const loadPatientData = async () => {
    setLoading(true);
    try {
      console.log('Intentando cargar datos del paciente:', patientId);

      const patientDoc = await getDoc(doc(db, 'patients', patientId));

      if (!patientDoc.exists()) {
        alert('Error: El paciente no existe o ha sido eliminado');
        navigate(-1);
        return;
      }

      const patientData = {
        id: patientDoc.id,
        ...patientDoc.data(),
      };

      if (patientData.createdBy !== user.uid) {
        alert('Acceso denegado: No tienes permiso para ver este paciente');
        navigate(-1);
        return;
      }

      console.log(
        'Datos del paciente cargados:',
        patientData.firstName,
        patientData.lastName
      );
      setPatient(patientData);

      try {
        console.log('Intentando cargar registros del paciente...');
        const recordsRef = collection(db, 'records');

        const q = query(
          recordsRef,
          where('patientId', '==', patientId),
          where('createdBy', '==', user.uid)
        );

        const recordsSnapshot = await getDocs(q);
        console.log('Registros encontrados:', recordsSnapshot.docs.length);

        const recordsList = recordsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        recordsList.sort((a, b) => {
          const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
          const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
          return dateB - dateA;
        });

        setRecords(recordsList);
      } catch (recordError) {
        console.error('Error al cargar registros:', recordError);
        setRecords([]);
        alert(
          'Error de carga: No se pudieron cargar los registros médicos: ' +
            recordError.message
        );
      }
    } catch (error) {
      console.error('Error al cargar datos del paciente:', error);
      alert('Error: Ha ocurrido un error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = birthDateString => {
    if (!birthDateString) return '';

    const birthDate = new Date(birthDateString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const formatDate = dateString => {
    if (!dateString) return '';

    try {
      const date = new Date(dateString);

      if (isNaN(date.getTime())) return 'Fecha inválida';

      return date.toLocaleDateString('es-MX', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Error en fecha';
    }
  };

  const handleEditPatient = () => {
    setShowActionsModal(false);
    navigate(`/edit-patient/${patientId}`);
  };

  const handleScheduleAppointment = async () => {
    try {
      const appointmentDateISO = appointmentDate + 'T12:00:00.000Z';

      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        upcomingAppointment: appointmentDateISO,
        lastUpdated: serverTimestamp(),
      });

      const scheduledDate = new Date(appointmentDateISO);

      const alert = {
        title: `Cita con ${patient.firstName} ${patient.lastName}`,
        description: `Cita programada para el paciente`,
        type: 'appointment',
        priority: 'medium',
        scheduledDate: scheduledDate,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        assignedTo: [user.uid],
        completed: false,
        patientId: patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhotoURL: patient.photoURL,
      };

      await addDoc(collection(db, 'alerts'), alert);

      setSchedulingAppointment(false);
      setShowActionsModal(false);
      alert('Éxito: Cita programada correctamente');
      loadPatientData();
    } catch (error) {
      console.error('Error al programar cita:', error);
      alert('Error: No se pudo programar la cita');
    }
  };

  const handleDeletePatient = () => {
    setShowActionsModal(false);

    const confirmDelete = window.confirm(
      '¿Estás seguro de que deseas eliminar a este paciente? Esta acción no se puede deshacer.'
    );

    if (confirmDelete) {
      try {
        const patientRef = doc(db, 'patients', patientId);
        deleteDoc(patientRef)
          .then(() => {
            alert('Éxito: Paciente eliminado correctamente');
            navigate('/patients');
          })
          .catch(error => {
            console.error('Error al eliminar paciente:', error);
            alert('Error: No se pudo eliminar el paciente');
          });
      } catch (error) {
        console.error('Error al eliminar paciente:', error);
        alert('Error: No se pudo eliminar el paciente');
      }
    }
  };

  const handleCreateRecord = () => {
    navigate('/add-record', {
      state: {
        patientId,
        patientName: `${patient.firstName} ${patient.lastName}`,
        patientPhotoURL: patient.photoURL,
      },
    });
  };

  const updateLastVisit = async () => {
    try {
      const patientRef = doc(db, 'patients', patientId);
      await updateDoc(patientRef, {
        lastVisit: new Date().toISOString(),
        lastUpdated: serverTimestamp(),
      });

      loadPatientData();

      alert('Éxito: Se ha registrado la visita actual');
    } catch (error) {
      console.error('Error al actualizar última visita:', error);
      alert('Error: Ha ocurrido un error al registrar la visita');
    }
  };

  if (loading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <Spinner />
          <LoadingText>Cargando datos del paciente...</LoadingText>
        </LoadingContainer>
        <Footer />
      </PageContainer>
    );
  }

  if (!patient) {
    return (
      <PageContainer>
        <ErrorContainer>
          <i
            className="fas fa-exclamation-triangle"
            style={{ fontSize: '32px', color: colors.error }}
          />
          <ErrorText>No se pudo cargar la información del paciente</ErrorText>
          <Button
            title="Volver"
            onClick={() => navigate('/patients')}
            variant="secondary"
          />
        </ErrorContainer>
        <Footer />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </BackButton>

          <Title>Detalles del Paciente</Title>

          {hasPermission('doctor') && (
            <ActionsButton onClick={() => setShowActionsModal(true)}>
              <i className="fas fa-cog"></i>
            </ActionsButton>
          )}
        </Header>

        <Content>
          <PatientHeader>
            <AvatarContainer>
              {patient.photoURL ? (
                <AvatarImage
                  src={patient.photoURL}
                  alt={`${patient.firstName} ${patient.lastName}`}
                />
              ) : (
                <AvatarInitials>
                  {patient.firstName[0]}
                  {patient.lastName[0]}
                </AvatarInitials>
              )}
            </AvatarContainer>

            <PatientInfo>
              <PatientName>
                {patient.firstName} {patient.lastName}
              </PatientName>

              <PatientSubInfo>
                {calculateAge(patient.birthDate)} años -{' '}
                {patient.gender === 'male' ? 'Masculino' : 'Femenino'}
              </PatientSubInfo>

              <ContactInfo>
                <i className="fas fa-phone"></i>
                <ContactText>{patient.phone}</ContactText>
              </ContactInfo>

              {patient.email && (
                <ContactInfo>
                  <i className="fas fa-envelope"></i>
                  <ContactText>{patient.email}</ContactText>
                </ContactInfo>
              )}
            </PatientInfo>
          </PatientHeader>

          <ActionButtonsContainer>
            <Button
              title="Registrar visita"
              onClick={updateLastVisit}
              variant="secondary"
              size="small"
              leftIcon={<i className="fas fa-calendar-check"></i>}
              style={{ flex: 1, marginRight: '10px' }}
            />

            <Button
              title="Nuevo registro"
              onClick={handleCreateRecord}
              variant="primary"
              size="small"
              leftIcon={<i className="fas fa-plus-circle"></i>}
              style={{ flex: 1 }}
            />
          </ActionButtonsContainer>

          <TabsContainer>
            <Tab
              active={activeTab === 'overview'}
              onClick={() => setActiveTab('overview')}
            >
              Resumen
            </Tab>

            <Tab
              active={activeTab === 'records'}
              onClick={() => setActiveTab('records')}
            >
              Registros ({records.length})
            </Tab>
          </TabsContainer>

          {activeTab === 'overview' ? (
            <OverviewContainer>
              <InfoSection>
                <SectionTitle>Información personal</SectionTitle>

                <InfoRow>
                  <InfoLabel>Fecha de nacimiento:</InfoLabel>
                  <InfoValue>{formatDate(patient.birthDate)}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Ocupación:</InfoLabel>
                  <InfoValue>
                    {patient.occupation || 'No especificada'}
                  </InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Dirección:</InfoLabel>
                  <InfoValue>{patient.address || 'No especificada'}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Última visita:</InfoLabel>
                  <InfoValue>
                    {patient.lastVisit
                      ? formatDate(patient.lastVisit)
                      : 'Sin visitas registradas'}
                  </InfoValue>
                </InfoRow>

                {patient.upcomingAppointment && (
                  <InfoRow>
                    <InfoLabel>Próxima cita:</InfoLabel>
                    <InfoValueHighlighted>
                      {formatDate(patient.upcomingAppointment)}
                    </InfoValueHighlighted>
                  </InfoRow>
                )}
              </InfoSection>

              <InfoSection>
                <SectionTitle>Información médica</SectionTitle>

                <InfoRow>
                  <InfoLabel>Alergias:</InfoLabel>
                  <InfoValue>{patient.allergies || 'No registradas'}</InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Medicamentos actuales:</InfoLabel>
                  <InfoValue>
                    {patient.medications || 'No registrados'}
                  </InfoValue>
                </InfoRow>

                <InfoRow>
                  <InfoLabel>Notas:</InfoLabel>
                  <InfoValue>
                    {patient.notes || 'Sin notas adicionales'}
                  </InfoValue>
                </InfoRow>
              </InfoSection>

              {records.length > 0 && (
                <LatestRecords>
                  <LatestRecordsHeader>
                    <SectionTitle>Últimos registros</SectionTitle>
                    <ViewAllText onClick={() => setActiveTab('records')}>
                      Ver todos
                    </ViewAllText>
                  </LatestRecordsHeader>

                  {records.slice(0, 2).map(record => (
                    <RecordCard key={record.id} record={record} />
                  ))}
                </LatestRecords>
              )}
            </OverviewContainer>
          ) : (
            <RecordsContainer>
              {records.length > 0 ? (
                records.map(record => (
                  <RecordCard key={record.id} record={record} />
                ))
              ) : (
                <EmptyState>
                  <i className="fas fa-file-medical"></i>
                  <EmptyStateText>
                    No hay registros médicos para este paciente
                  </EmptyStateText>

                  <Button
                    title="Crear nuevo registro"
                    onClick={handleCreateRecord}
                    variant="primary"
                    size="small"
                    style={{ marginTop: '16px' }}
                  />
                </EmptyState>
              )}
            </RecordsContainer>
          )}
        </Content>
      </ContentContainer>

      {/* Modal para acciones */}
      {showActionsModal && (
        <ModalOverlay onClick={() => setShowActionsModal(false)}>
          <ActionsContainer onClick={e => e.stopPropagation()}>
            <ActionsTitle>Acciones del paciente</ActionsTitle>

            <ActionButton onClick={handleEditPatient}>
              <i className="fas fa-edit"></i>
              <ActionText>Editar información</ActionText>
            </ActionButton>

            <ActionButton
              onClick={() => {
                setShowActionsModal(false);
                setSchedulingAppointment(true);
              }}
            >
              <i className="fas fa-calendar-alt"></i>
              <ActionText>Programar cita</ActionText>
            </ActionButton>

            <DeleteButton onClick={handleDeletePatient}>
              <i className="fas fa-trash"></i>
              <DeleteText>Eliminar paciente</DeleteText>
            </DeleteButton>

            <CancelButton onClick={() => setShowActionsModal(false)}>
              Cancelar
            </CancelButton>
          </ActionsContainer>
        </ModalOverlay>
      )}

      {/* Modal para programar cita */}
      {schedulingAppointment && (
        <ModalOverlay onClick={() => setSchedulingAppointment(false)}>
          <ModalContainer onClick={e => e.stopPropagation()}>
            <ModalTitle>Programar cita</ModalTitle>

            <DateInputContainer>
              <InputLabel>Fecha de la cita:</InputLabel>
              <DateInput
                type="date"
                value={appointmentDate}
                onChange={e => setAppointmentDate(e.target.value)}
              />
            </DateInputContainer>

            <ModalFooter>
              <Button
                title="Cancelar"
                onClick={() => setSchedulingAppointment(false)}
                variant="secondary"
                style={{ flex: 1, marginRight: '10px' }}
              />
              <Button
                title="Guardar"
                onClick={handleScheduleAppointment}
                variant="primary"
                style={{ flex: 1 }}
              />
            </ModalFooter>
          </ModalContainer>
        </ModalOverlay>
      )}

      <Footer />
    </PageContainer>
  );
};

// Estilos
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
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

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 50vh;
  text-align: center;
  padding: 0 20px;
`;

const ErrorText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin: 16px 0;
`;

const Spinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: ${({ theme }) => theme.colors.secondary};
  animation: spin 1s linear infinite;

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
  margin-top: 16px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const BackButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionsButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 8px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const Content = styled.div`
  padding: 20px;
`;

const PatientHeader = styled.div`
  display: flex;
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const AvatarContainer = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.secondaryLight};
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
`;

const AvatarInitials = styled.div`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`;

const PatientInfo = styled.div`
  flex: 1;
`;

const PatientName = styled.h2`
  font-size: 22px;
  font-weight: bold;
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const PatientSubInfo = styled.p`
  font-size: 14px;
  margin: 0 0 12px 0;
  color: ${({ theme }) => theme.colors.subtext};
`;

const ContactInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 6px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};

  i {
    color: ${({ theme }) => theme.colors.secondary};
    margin-right: 8px;
  }
`;

const ContactText = styled.span`
  font-size: 14px;
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 20px;
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 14px;
  font-weight: ${props => (props.active ? '600' : '400')};
  color: ${props =>
    props.active ? props.theme.colors.secondary : props.theme.colors.subtext};
  cursor: pointer;
  border-bottom: ${props =>
    props.active ? `2px solid ${props.theme.colors.secondary}` : 'none'};

  &:hover {
    color: ${({ theme }) => theme.colors.secondary};
  }
`;

const OverviewContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const InfoSection = styled.div`
  padding: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 20px;
  background-color: ${({ theme }) => theme.colors.white};
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoRow = styled.div`
  margin-bottom: 14px;
`;

const InfoLabel = styled.p`
  font-size: 14px;
  margin: 0 0 4px 0;
  color: ${({ theme }) => theme.colors.subtext};
`;

const InfoValue = styled.p`
  font-size: 14px;
  margin: 0;
  color: ${({ theme }) => theme.colors.text};
`;

const InfoValueHighlighted = styled(InfoValue)`
  color: ${({ theme }) => theme.colors.accent};
  font-weight: 600;
`;

const LatestRecords = styled.div`
  margin-bottom: 20px;
`;

const LatestRecordsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ViewAllText = styled.button`
  background: none;
  border: none;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const RecordsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin: 20px 0;
  background-color: ${({ theme }) => theme.colors.white};

  i {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 16px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin: 16px 0;
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ActionsContainer = styled.div`
  width: 90%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalContainer = styled.div`
  width: 90%;
  max-width: 400px;
  background-color: ${({ theme }) => theme.colors.card};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ActionsTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 24px 0;
  text-align: center;
  color: ${({ theme }) => theme.colors.text};
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  padding: 16px;
  background: none;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  width: 100%;
  text-align: left;
  cursor: pointer;

  i {
    color: ${({ theme }) => theme.colors.secondary};
    margin-right: 16px;
    font-size: 18px;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const ActionText = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
`;

const DeleteButton = styled(ActionButton)`
  i {
    color: ${({ theme }) => theme.colors.error};
  }
`;

const DeleteText = styled.span`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.error};
`;

const CancelButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: ${({ theme }) => theme.colors.border};
  border: none;
  border-radius: 8px;
  margin-top: 20px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.borderDark};
  }
`;

const DateInputContainer = styled.div`
  margin-bottom: 24px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
  color: ${({ theme }) => theme.colors.text};
`;

const DateInput = styled.input`
  width: 100%;
  padding: 12px;
  font-size: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: space-between;
`;

export default PatientDetailPage;
