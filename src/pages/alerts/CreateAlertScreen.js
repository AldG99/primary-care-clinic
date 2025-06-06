// src/pages/alerts/CreateAlertPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  getDocs,
  where,
  orderBy,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const CreateAlertPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const { user, hasPermission } = useAuth();

  // Extract patient data from location state (if available)
  const preselectedPatientId = location.state?.patientId;
  const preselectedPatientName = location.state?.patientName;

  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showPatientSearch, setShowPatientSearch] = useState(
    !preselectedPatientId
  );
  const [selectedPatient, setSelectedPatient] = useState(
    preselectedPatientId
      ? { id: preselectedPatientId, name: preselectedPatientName }
      : null
  );

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'appointment',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '09:00',
    priority: 'medium',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!hasPermission('doctor') && !hasPermission('nurse')) {
      alert('No tienes permisos para crear recordatorios.');
      navigate(-1);
    }
  }, [hasPermission, navigate]);

  useEffect(() => {
    if (patientSearch.trim().length >= 1) {
      searchPatients();
    } else {
      setSearchResults([]);
    }
  }, [patientSearch]);

  const searchPatients = async () => {
    try {
      const patientsRef = collection(db, 'patients');
      const q = query(patientsRef);
      const querySnapshot = await getDocs(q);

      const patientsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const searchTermLower = patientSearch.toLowerCase();

      const filtered = patientsList.filter(patient => {
        const firstName = (patient.firstName || '').toLowerCase();
        const lastName = (patient.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`;

        return fullName.includes(searchTermLower);
      });

      filtered.sort((a, b) => {
        const nameA = `${a.firstName} ${a.lastName}`.toLowerCase();
        const nameB = `${b.firstName} ${b.lastName}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
    }
  };

  const handleSelectPatient = patient => {
    setSelectedPatient({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
    });
    setShowPatientSearch(false);
    setSearchResults([]);
    setPatientSearch('');
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));

    if (value.trim() !== '' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.scheduledDate.trim()) {
      newErrors.scheduledDate = 'La fecha es obligatoria';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.scheduledDate)) {
      newErrors.scheduledDate = 'Formato inválido. Usa YYYY-MM-DD';
    }

    if (!formData.scheduledTime.trim()) {
      newErrors.scheduledTime = 'La hora es obligatoria';
    } else if (!/^\d{2}:\d{2}$/.test(formData.scheduledTime)) {
      newErrors.scheduledTime = 'Formato inválido. Usa HH:MM';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert('Por favor corrige los errores del formulario');
      return;
    }

    setLoading(true);
    try {
      const [year, month, day] = formData.scheduledDate.split('-');
      const [hour, minute] = formData.scheduledTime.split(':');
      const scheduledDate = new Date(year, month - 1, day, hour, minute);

      const alertData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        priority: formData.priority,
        scheduledDate,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        assignedTo: [user.uid],
        completed: false,
      };

      if (selectedPatient) {
        alertData.patientId = selectedPatient.id;
        alertData.patientName = selectedPatient.name;
      }

      await addDoc(collection(db, 'alerts'), alertData);

      alert('Recordatorio creado correctamente');
      navigate(-1);
    } catch (error) {
      console.error('Error al guardar alerta:', error);
      alert('Ha ocurrido un error al guardar el recordatorio');
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

  return (
    <PageContainer>
      <FormContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </BackButton>
          <Title>Nuevo recordatorio</Title>
          <div style={{ width: '24px' }}></div>{' '}
          {/* Placeholder para alineación */}
        </Header>

        <ContentScroll>
          <Section>
            <SectionTitle>Asociar a paciente (opcional)</SectionTitle>

            {selectedPatient && !showPatientSearch ? (
              <SelectedPatient>
                <PatientInfo>
                  <i
                    className="fas fa-user"
                    style={{ color: colors.secondary, marginRight: '8px' }}
                  ></i>
                  <PatientName>{selectedPatient.name}</PatientName>
                </PatientInfo>

                <ChangePatientButton onClick={() => setShowPatientSearch(true)}>
                  Cambiar
                </ChangePatientButton>
              </SelectedPatient>
            ) : (
              <div>
                <Input
                  placeholder="Buscar paciente por nombre..."
                  value={patientSearch}
                  onChange={e => setPatientSearch(e.target.value)}
                  leftIcon={
                    <i
                      className="fas fa-search"
                      style={{ color: colors.secondary }}
                    ></i>
                  }
                />

                {searchResults.length > 0 && (
                  <SearchResults>
                    {searchResults.map(patient => (
                      <PatientItem
                        key={patient.id}
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <PatientItemName>
                          {patient.firstName} {patient.lastName}
                        </PatientItemName>
                        <PatientItemInfo>
                          {calculateAge(patient.birthDate)} años -{' '}
                          {patient.gender === 'male' ? 'M' : 'F'}
                        </PatientItemInfo>
                      </PatientItem>
                    ))}
                  </SearchResults>
                )}

                {patientSearch.trim().length >= 2 &&
                  searchResults.length === 0 && (
                    <NoResults>No se encontraron pacientes</NoResults>
                  )}
              </div>
            )}
          </Section>

          <Section>
            <SectionTitle>Información del recordatorio</SectionTitle>

            <Input
              label="Título*"
              placeholder="Título del recordatorio"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              error={errors.title}
              touched={touched.title}
            />

            <TextArea
              placeholder="Descripción o detalles adicionales"
              value={formData.description}
              onChange={e => handleChange('description', e.target.value)}
              rows={3}
            />

            <TypeSelector>
              <Label>Tipo de recordatorio</Label>

              <TypeOptions>
                {[
                  {
                    id: 'appointment',
                    label: 'Cita',
                    icon: 'calendar-alt',
                  },
                  {
                    id: 'medication',
                    label: 'Medicación',
                    icon: 'pills',
                  },
                  {
                    id: 'follow_up',
                    label: 'Seguimiento',
                    icon: 'heartbeat',
                  },
                  {
                    id: 'lab_results',
                    label: 'Resultados lab',
                    icon: 'flask',
                  },
                  { id: 'task', label: 'Tarea', icon: 'tasks' },
                ].map(type => (
                  <TypeOption
                    key={type.id}
                    active={formData.type === type.id}
                    onClick={() => handleChange('type', type.id)}
                  >
                    <i
                      className={`fas fa-${type.icon}`}
                      style={{
                        marginRight: '8px',
                        color:
                          formData.type === type.id
                            ? colors.secondary
                            : colors.subtext,
                      }}
                    ></i>
                    <span>{type.label}</span>
                  </TypeOption>
                ))}
              </TypeOptions>
            </TypeSelector>

            <Row>
              <DateTimeField>
                <Label>Fecha*</Label>
                <InputWithIcon>
                  <Input
                    placeholder="YYYY-MM-DD"
                    value={formData.scheduledDate}
                    onChange={e =>
                      handleChange('scheduledDate', e.target.value)
                    }
                    error={errors.scheduledDate}
                    touched={touched.scheduledDate}
                    type="date"
                  />
                  <InputIcon className="far fa-calendar"></InputIcon>
                </InputWithIcon>
              </DateTimeField>

              <DateTimeField>
                <Label>Hora*</Label>
                <InputWithIcon>
                  <Input
                    placeholder="HH:MM"
                    value={formData.scheduledTime}
                    onChange={e =>
                      handleChange('scheduledTime', e.target.value)
                    }
                    error={errors.scheduledTime}
                    touched={touched.scheduledTime}
                    type="time"
                  />
                  <InputIcon className="far fa-clock"></InputIcon>
                </InputWithIcon>
              </DateTimeField>
            </Row>

            <PrioritySelector>
              <Label>Prioridad</Label>

              <PriorityOptions>
                {[
                  { id: 'low', label: 'Baja', color: colors.info },
                  { id: 'medium', label: 'Media', color: colors.warning },
                  { id: 'high', label: 'Alta', color: colors.error },
                ].map(priority => (
                  <PriorityOption
                    key={priority.id}
                    active={formData.priority === priority.id}
                    color={priority.color}
                    onClick={() => handleChange('priority', priority.id)}
                  >
                    <PriorityDot color={priority.color} />
                    <span>{priority.label}</span>
                  </PriorityOption>
                ))}
              </PriorityOptions>
            </PrioritySelector>
          </Section>

          <ButtonContainer>
            <Button
              title="Cancelar"
              onClick={() => navigate(-1)}
              variant="secondary"
              style={{ flex: 1, marginRight: '12px' }}
            />

            <Button
              title="Guardar recordatorio"
              onClick={handleSave}
              loading={loading}
              style={{ flex: 1 }}
            />
          </ButtonContainer>
        </ContentScroll>
      </FormContainer>
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

const FormContainer = styled.div`
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

const ContentScroll = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const Section = styled.div`
  margin-bottom: 32px;
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 20px 0;
`;

const SelectedPatient = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
`;

const PatientName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

const ChangePatientButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.secondary};
  font-weight: 500;
  font-size: 14px;
  cursor: pointer;
  padding: 6px 12px;

  &:hover {
    text-decoration: underline;
  }
`;

const SearchResults = styled.div`
  background-color: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  margin-top: 4px;
  max-height: 240px;
  overflow-y: auto;
  z-index: 10;
  position: relative;
`;

const PatientItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }
`;

const PatientItemName = styled.div`
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 4px;
`;

const PatientItemInfo = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const NoResults = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 14px;
  margin-top: 8px;
  padding: 4px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.white};
  resize: vertical;
  margin-bottom: 20px;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}20;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textMuted};
  }
`;

const Label = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
`;

const TypeSelector = styled.div`
  margin-bottom: 24px;
`;

const TypeOptions = styled.div`
  display: flex;
  overflow-x: auto;
  padding-bottom: 8px;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.backgroundLight};
    border-radius: 4px;
  }

  &::-webkit-scrollbar-thumb {
    background: ${({ theme }) => theme.colors.border};
    border-radius: 4px;
  }
`;

const TypeOption = styled.button`
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 20px;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.secondary : theme.colors.border};
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.secondary}15` : 'transparent'};
  color: ${({ theme, active }) =>
    active ? theme.colors.secondary : theme.colors.text};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  font-size: 14px;
  margin-right: 12px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.secondary}25` : theme.colors.backgroundLight};
  }
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 24px;
`;

const DateTimeField = styled.div`
  flex: 1;
`;

const InputWithIcon = styled.div`
  position: relative;
`;

const InputIcon = styled.i`
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.colors.secondary};
  pointer-events: none;
`;

const PrioritySelector = styled.div`
  margin-bottom: 24px;
`;

const PriorityOptions = styled.div`
  display: flex;
  gap: 12px;
`;

const PriorityOption = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid
    ${({ theme, active, color }) => (active ? color : theme.colors.border)};
  background-color: ${({ active, color }) =>
    active ? `${color}15` : 'transparent'};
  color: ${({ active, color, theme }) => (active ? color : theme.colors.text)};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  font-size: 14px;
  flex: 1;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ color, active }) =>
      active ? `${color}25` : '#f5f5f5'};
  }
`;

const PriorityDot = styled.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  margin-right: 8px;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 12px;
`;

export default CreateAlertPage;
