// src/pages/records/AddRecordPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { APP_CONFIG } from '../../constants/config';
import Footer from '../../components/Footer';

const AddRecordPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { colors } = useTheme();
  const { user } = useAuth();

  // Obtener datos del paciente preseleccionado de la ubicación state (si existe)
  const preSelectedPatientId = location.state?.patientId;
  const preSelectedPatientName = location.state?.patientName;
  const preSelectedPatientPhotoURL = location.state?.patientPhotoURL;

  const [formData, setFormData] = useState({
    title: '',
    type: 'consultation',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    summary: '',
    treatmentPlan: '',
    medications: '',
    observations: '',
    followUpDate: '',
    tags: '',
  });

  const [patientSearch, setPatientSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showPatientSearch, setShowPatientSearch] = useState(
    !preSelectedPatientId
  );
  const [selectedPatient, setSelectedPatient] = useState(
    preSelectedPatientId
      ? {
          id: preSelectedPatientId,
          name: preSelectedPatientName,
          photoURL: preSelectedPatientPhotoURL || null,
        }
      : null
  );

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (preSelectedPatientId && preSelectedPatientName) {
      setSelectedPatient({
        id: preSelectedPatientId,
        name: preSelectedPatientName,
        photoURL: preSelectedPatientPhotoURL || null,
      });
    }
  }, [
    preSelectedPatientId,
    preSelectedPatientName,
    preSelectedPatientPhotoURL,
  ]);

  useEffect(() => {
    if (patientSearch.trim().length >= 2) {
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

      const searchTerms = patientSearch.toLowerCase().split(' ');

      const filtered = patientsList.filter(patient => {
        const firstName = (patient.firstName || '').toLowerCase();
        const lastName = (patient.lastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`;

        return searchTerms.every(term => fullName.includes(term));
      });

      filtered.sort((a, b) => {
        const lastNameComparison = a.lastName.localeCompare(b.lastName);
        if (lastNameComparison !== 0) return lastNameComparison;
        return a.firstName.localeCompare(b.firstName);
      });

      setSearchResults(filtered);
    } catch (error) {
      console.error('Error al buscar pacientes:', error);
      alert('No se pudieron cargar los pacientes');
    }
  };

  const handleSelectPatient = patient => {
    setSelectedPatient({
      id: patient.id,
      name: `${patient.firstName} ${patient.lastName}`,
      photoURL: patient.photoURL || null,
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

    if (!selectedPatient) {
      newErrors.patient = 'Debe seleccionar un paciente';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }

    if (!formData.date.trim()) {
      newErrors.date = 'La fecha es obligatoria';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date)) {
      newErrors.date = 'Formato inválido. Usa YYYY-MM-DD';
    }

    if (
      formData.followUpDate &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.followUpDate)
    ) {
      newErrors.followUpDate = 'Formato inválido. Usa YYYY-MM-DD';
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
      const recordData = {
        title: formData.title,
        type: formData.type,
        date: new Date(formData.date),
        diagnosis: formData.diagnosis || '',
        summary: formData.summary || '',
        treatmentPlan: formData.treatmentPlan || '',
        medications: formData.medications || '',
        observations: formData.observations || '',
        followUpDate: formData.followUpDate
          ? new Date(formData.followUpDate)
          : null,
        doctor: user.displayName || 'N/A',
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        patientId: selectedPatient.id,
        patientName: selectedPatient.name,
        ...(selectedPatient.photoURL && {
          patientPhotoURL: selectedPatient.photoURL,
        }),
      };

      if (formData.tags && formData.tags.trim() !== '') {
        recordData.tags = formData.tags.split(',').map(tag => tag.trim());
      }

      await addDoc(collection(db, 'records'), recordData);

      alert('Registro guardado correctamente');
      navigate(-1);
    } catch (error) {
      console.error('Error al guardar registro:', error);
      alert('Ha ocurrido un error al guardar el registro');
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
          <Title>Nuevo Registro Médico</Title>
          <EmptySpace />
        </Header>

        <ContentScroll>
          <Section>
            <SectionTitle>Paciente</SectionTitle>

            {selectedPatient && !showPatientSearch ? (
              <SelectedPatient>
                <PatientInfo>
                  <i
                    className="fas fa-user"
                    style={{ color: colors.secondary, marginRight: '12px' }}
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
                  error={errors.patient}
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
            <SectionTitle>Información del registro</SectionTitle>

            <Input
              label="Título*"
              placeholder="Título del registro"
              value={formData.title}
              onChange={e => handleChange('title', e.target.value)}
              error={errors.title}
              touched={touched.title}
            />

            <TypeSelector>
              <Label>Tipo de registro</Label>

              <TypeOptions>
                {APP_CONFIG.recordTypes.map(type => (
                  <TypeOption
                    key={type.id}
                    active={formData.type === type.id}
                    onClick={() => handleChange('type', type.id)}
                  >
                    <TypeIcon
                      className={`fas fa-${mapIoniconsToFontAwesome(
                        type.icon
                      )}`}
                    />
                    <span>{type.label}</span>
                  </TypeOption>
                ))}
              </TypeOptions>
            </TypeSelector>

            <FormGroup>
              <Label>Fecha*</Label>
              <DateInput
                type="date"
                value={formData.date}
                onChange={e => handleChange('date', e.target.value)}
                error={errors.date}
              />
              {errors.date && <ErrorText>{errors.date}</ErrorText>}
            </FormGroup>

            <Input
              label="Diagnóstico"
              placeholder="Diagnóstico"
              value={formData.diagnosis}
              onChange={e => handleChange('diagnosis', e.target.value)}
            />

            <FormGroup>
              <Label>Resumen</Label>
              <TextArea
                placeholder="Breve resumen del registro"
                value={formData.summary}
                onChange={e => handleChange('summary', e.target.value)}
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Plan de tratamiento</Label>
              <TextArea
                placeholder="Plan de tratamiento"
                value={formData.treatmentPlan}
                onChange={e => handleChange('treatmentPlan', e.target.value)}
                rows={3}
              />
            </FormGroup>

            <Input
              label="Medicamentos"
              placeholder="Medicamentos recetados (separados por coma)"
              value={formData.medications}
              onChange={e => handleChange('medications', e.target.value)}
            />

            <FormGroup>
              <Label>Observaciones</Label>
              <TextArea
                placeholder="Observaciones adicionales"
                value={formData.observations}
                onChange={e => handleChange('observations', e.target.value)}
                rows={3}
              />
            </FormGroup>

            <FormGroup>
              <Label>Fecha de seguimiento</Label>
              <DateInput
                type="date"
                value={formData.followUpDate}
                onChange={e => handleChange('followUpDate', e.target.value)}
                error={errors.followUpDate}
              />
              {errors.followUpDate && (
                <ErrorText>{errors.followUpDate}</ErrorText>
              )}
            </FormGroup>

            <Input
              label="Etiquetas"
              placeholder="Etiquetas separadas por coma (opcional)"
              value={formData.tags}
              onChange={e => handleChange('tags', e.target.value)}
            />
          </Section>

          <ButtonContainer>
            <Button
              title="Cancelar"
              onClick={() => navigate(-1)}
              variant="secondary"
              style={{ flex: 1, marginRight: '12px' }}
            />

            <Button
              title="Guardar registro"
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

// Función para mapear iconos de Ionicons a Font Awesome
const mapIoniconsToFontAwesome = ionicon => {
  const iconMap = {
    'medical-outline': 'stethoscope',
    'fitness-outline': 'heartbeat',
    'flask-outline': 'flask',
    'document-text-outline': 'file-alt',
    'pulse-outline': 'procedures',
    'bandage-outline': 'band-aid',
    'image-outline': 'images',
    'clipboard-outline': 'clipboard',
    // Añadir más mapeos según sea necesario
  };

  return iconMap[ionicon] || 'file-medical'; // Valor por defecto
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

const EmptySpace = styled.div`
  width: 24px;
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
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
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

const FormGroup = styled.div`
  margin-bottom: 20px;
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
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 10px;
`;

const TypeOption = styled.button`
  display: flex;
  align-items: center;
  padding: 8px 14px;
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
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.secondary}25` : theme.colors.backgroundLight};
  }
`;

const TypeIcon = styled.i`
  margin-right: 8px;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: 8px;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  background-color: ${({ theme }) => theme.colors.white};

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) =>
      error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 3px
      ${({ theme, error }) =>
        error ? `${theme.colors.error}20` : `${theme.colors.primary}20`};
  }
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

const ErrorText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-size: 13px;
  margin: 4px 0 0 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export default AddRecordPage;
