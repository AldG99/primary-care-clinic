// src/pages/patients/AddPatientPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const AddPatientPage = () => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    birthDate: '',
    gender: 'male',
    phone: '',
    email: '',
    address: '',
    occupation: '',
    allergies: '',
    medications: '',
    notes: '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (!hasPermission('doctor')) {
      alert('No tienes permisos para registrar pacientes.');
      navigate(-1);
    }
  }, [hasPermission, navigate]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);

      // Crear URL para previsualización
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const uploadImage = async file => {
    if (!file) return null;

    try {
      setImageUploading(true);

      const imageRef = ref(
        storage,
        `patient_images/${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}`
      );

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      return downloadURL;
    } catch (error) {
      console.error('Error al subir imagen:', error);
      throw error;
    } finally {
      setImageUploading(false);
    }
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

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'El nombre es obligatorio';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'El apellido es obligatorio';
    }

    if (!formData.birthDate.trim()) {
      newErrors.birthDate = 'La fecha de nacimiento es obligatoria';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.birthDate)) {
      newErrors.birthDate = 'Formato inválido. Usa YYYY-MM-DD';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es obligatorio';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Correo electrónico inválido';
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
      let photoURL = null;

      if (profileImage) {
        photoURL = await uploadImage(profileImage);
      }

      const patientData = {
        ...formData,
        photoURL,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        createdBy: user.uid,
      };

      await addDoc(collection(db, 'patients'), patientData);

      alert('Paciente registrado correctamente');
      navigate(-1);
    } catch (error) {
      console.error('Error al guardar paciente:', error);
      alert('Ha ocurrido un error al guardar el paciente');
    } finally {
      setLoading(false);
    }
  };

  // Input oculto para subir imágenes
  const fileInputRef = React.useRef(null);

  return (
    <PageContainer>
      <FormContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </BackButton>
          <Title>Nuevo Paciente</Title>
          <EmptySpace />
        </Header>

        <ContentScroll>
          <ProfileSection>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />

            <ProfileImageContainer onClick={() => fileInputRef.current.click()}>
              {imagePreview ? (
                <ProfileImg src={imagePreview} alt="Foto de perfil" />
              ) : (
                <ProfilePlaceholder>
                  <i className="fas fa-user"></i>
                </ProfilePlaceholder>
              )}
              <CameraIcon>
                <i className="fas fa-camera"></i>
              </CameraIcon>
            </ProfileImageContainer>

            <PhotoText onClick={() => fileInputRef.current.click()}>
              {imagePreview ? 'Cambiar foto' : 'Añadir foto (opcional)'}
            </PhotoText>
          </ProfileSection>

          <Section>
            <SectionTitle>Información personal</SectionTitle>

            <Row>
              <HalfField>
                <Input
                  label="Nombre*"
                  placeholder="Nombre"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  error={errors.firstName}
                  touched={touched.firstName}
                />
              </HalfField>

              <HalfField>
                <Input
                  label="Apellido*"
                  placeholder="Apellido"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  error={errors.lastName}
                  touched={touched.lastName}
                />
              </HalfField>
            </Row>

            <Row>
              <HalfField>
                <Input
                  label="Fecha de nacimiento*"
                  placeholder="YYYY-MM-DD"
                  value={formData.birthDate}
                  onChange={e => handleChange('birthDate', e.target.value)}
                  error={errors.birthDate}
                  touched={touched.birthDate}
                  type="date"
                />
              </HalfField>

              <HalfField>
                <Label>Género*</Label>
                <GenderOptions>
                  <GenderOption
                    active={formData.gender === 'male'}
                    onClick={() => handleChange('gender', 'male')}
                  >
                    Masculino
                  </GenderOption>

                  <GenderOption
                    active={formData.gender === 'female'}
                    onClick={() => handleChange('gender', 'female')}
                  >
                    Femenino
                  </GenderOption>
                </GenderOptions>
              </HalfField>
            </Row>
          </Section>

          <Section>
            <SectionTitle>Información de contacto</SectionTitle>

            <InputWithIcon>
              <Input
                label="Teléfono*"
                placeholder="Teléfono"
                value={formData.phone}
                onChange={e => handleChange('phone', e.target.value)}
                type="tel"
                error={errors.phone}
                touched={touched.phone}
              />
              <InputIcon className="fas fa-phone"></InputIcon>
            </InputWithIcon>

            <InputWithIcon>
              <Input
                label="Correo electrónico"
                placeholder="Correo electrónico"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                type="email"
                error={errors.email}
                touched={touched.email}
              />
              <InputIcon className="fas fa-envelope"></InputIcon>
            </InputWithIcon>

            <InputWithIcon>
              <Input
                label="Dirección"
                placeholder="Dirección"
                value={formData.address}
                onChange={e => handleChange('address', e.target.value)}
              />
              <InputIcon className="fas fa-map-marker-alt"></InputIcon>
            </InputWithIcon>

            <InputWithIcon>
              <Input
                label="Ocupación"
                placeholder="Ocupación"
                value={formData.occupation}
                onChange={e => handleChange('occupation', e.target.value)}
              />
              <InputIcon className="fas fa-briefcase"></InputIcon>
            </InputWithIcon>
          </Section>

          <Section>
            <SectionTitle>Información médica</SectionTitle>

            <FormGroup>
              <Label>Alergias</Label>
              <TextArea
                placeholder="Alergias (separadas por coma)"
                value={formData.allergies}
                onChange={e => handleChange('allergies', e.target.value)}
                rows={2}
              />
            </FormGroup>

            <FormGroup>
              <Label>Medicamentos actuales</Label>
              <TextArea
                placeholder="Medicamentos actuales (separados por coma)"
                value={formData.medications}
                onChange={e => handleChange('medications', e.target.value)}
                rows={2}
              />
            </FormGroup>

            <FormGroup>
              <Label>Notas adicionales</Label>
              <TextArea
                placeholder="Notas médicas o información adicional"
                value={formData.notes}
                onChange={e => handleChange('notes', e.target.value)}
                rows={4}
              />
            </FormGroup>
          </Section>

          <ButtonContainer>
            <Button
              title="Cancelar"
              onClick={() => navigate(-1)}
              variant="secondary"
              style={{ flex: 1, marginRight: '12px' }}
            />

            <Button
              title="Guardar paciente"
              onClick={handleSave}
              loading={loading || imageUploading}
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

const EmptySpace = styled.div`
  width: 24px;
`;

const ContentScroll = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 32px;
`;

const ProfileImageContainer = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${({ theme }) => `${theme.colors.secondary}15`};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }
`;

const ProfileImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ProfilePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  color: ${({ theme }) => theme.colors.secondary};
`;

const CameraIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const PhotoText = styled.span`
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
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

const Row = styled.div`
  display: flex;
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
  }
`;

const HalfField = styled.div`
  flex: 1;
  min-width: 0; /* Para evitar que crezca más allá del contenedor */
`;

const Label = styled.label`
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 10px;
`;

const GenderOptions = styled.div`
  display: flex;
  gap: 12px;
`;

const GenderOption = styled.button`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
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

const InputWithIcon = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const InputIcon = styled.i`
  position: absolute;
  right: 16px;
  top: 42px; /* Ajustar según la posición del input bajo la etiqueta */
  color: ${({ theme }) => theme.colors.secondary};
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
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

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 12px;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export default AddPatientPage;
