// src/pages/profile/EditProfilePage.js
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase';
import { useAuth } from '../../hooks/useAuth';
import { useTheme } from '../../hooks/useTheme';
import Input from '../../components/Input';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const EditProfilePage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { user, refreshUserProfile } = useAuth();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    organization: user?.organization || '',
  });

  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && user.photoURL) {
      setProfileImage(user.photoURL);
      setImagePreview(user.photoURL);
    }
  }, [user]);

  const handleImageChange = e => {
    const file = e.target.files[0];
    if (file) {
      // Guardar el archivo para subirlo después
      setProfileImage(file);

      // Crear URL para previsualización
      const previewURL = URL.createObjectURL(file);
      setImagePreview(previewURL);
    }
  };

  const uploadImage = async file => {
    if (!file || typeof file === 'string') return file; // Si es URL, ya está subida

    try {
      setImageUploading(true);
      const imageRef = ref(storage, `profile_images/${user.uid}_${Date.now()}`);

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

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const updateData = {
        displayName: formData.displayName,
        phone: formData.phone,
        organization: formData.organization,
      };

      // Si el profileImage es un File (no una string URL), súbelo
      if (profileImage && typeof profileImage !== 'string') {
        const imageUrl = await uploadImage(profileImage);
        if (imageUrl) {
          updateData.photoURL = imageUrl;
        }
      }

      await updateDoc(doc(db, 'users', user.uid), updateData);

      if (refreshUserProfile) {
        await refreshUserProfile();
      }

      navigate(-1);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      alert('No se pudo actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer>
      <FormContainer>
        <Header>
          <BackButton onClick={() => navigate(-1)}>
            <i className="fas fa-arrow-left"></i>
          </BackButton>
          <Title>Editar Perfil</Title>
          <EmptySpace />
        </Header>

        <ContentScroll>
          {/* Input oculto para subir imágenes */}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            ref={fileInputRef}
            style={{ display: 'none' }}
          />

          {/* Imagen de perfil */}
          <ProfileSection>
            <ProfileImageContainer onClick={() => fileInputRef.current.click()}>
              {imagePreview ? (
                <ProfileImg src={imagePreview} alt="Foto de perfil" />
              ) : (
                <ProfilePlaceholder>
                  {user?.displayName?.charAt(0) || 'U'}
                </ProfilePlaceholder>
              )}
              <CameraIcon>
                <i className="fas fa-camera"></i>
              </CameraIcon>
            </ProfileImageContainer>

            <ChangePhotoText onClick={() => fileInputRef.current.click()}>
              Cambiar foto de perfil
            </ChangePhotoText>
          </ProfileSection>

          <FormSection>
            <Input
              label="Nombre completo"
              placeholder="Nombre y apellido"
              value={formData.displayName}
              onChange={e =>
                setFormData(prev => ({ ...prev, displayName: e.target.value }))
              }
              leftIcon={
                <i
                  className="fas fa-user"
                  style={{ color: colors.secondary }}
                ></i>
              }
            />

            <Input
              label="Correo electrónico"
              placeholder="correo@ejemplo.com"
              value={formData.email}
              onChange={e =>
                setFormData(prev => ({ ...prev, email: e.target.value }))
              }
              leftIcon={
                <i
                  className="fas fa-envelope"
                  style={{ color: colors.secondary }}
                ></i>
              }
              disabled={true}
            />

            <Input
              label="Teléfono"
              placeholder="Número de teléfono"
              value={formData.phone}
              onChange={e =>
                setFormData(prev => ({ ...prev, phone: e.target.value }))
              }
              leftIcon={
                <i
                  className="fas fa-phone"
                  style={{ color: colors.secondary }}
                ></i>
              }
              type="tel"
            />

            <Input
              label="Organización/Institución"
              placeholder="Nombre de clínica, hospital o consultorio"
              value={formData.organization}
              onChange={e =>
                setFormData(prev => ({ ...prev, organization: e.target.value }))
              }
              leftIcon={
                <i
                  className="fas fa-building"
                  style={{ color: colors.secondary }}
                ></i>
              }
            />
          </FormSection>

          <ButtonContainer>
            <Button
              title="Cancelar"
              onClick={() => navigate(-1)}
              variant="secondary"
              style={{ flex: 1, marginRight: '12px' }}
            />

            <Button
              title="Guardar cambios"
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
  width: 140px;
  height: 140px;
  border-radius: 70px;
  background-color: ${({ theme }) => `${theme.colors.secondary}15`};
  position: relative;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;

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
  font-size: 56px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.secondary};
`;

const CameraIcon = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
`;

const ChangePhotoText = styled.span`
  margin-top: 12px;
  color: ${({ theme }) => theme.colors.secondary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;
`;

const ButtonContainer = styled.div`
  display: flex;
  margin-top: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export default EditProfilePage;
