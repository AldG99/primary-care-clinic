// src/pages/HomePage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import { useAlerts } from '../hooks/useAlerts';
import PatientCard from '../components/PatientCard';
import RecordCard from '../components/RecordCard';
import AlertCard from '../components/AlertCard';
import Button from '../components/Button';
import Footer from '../components/Footer';

const HomePage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { user, userRole } = useAuth();
  const { alerts } = useAlerts();
  const [recentPatients, setRecentPatients] = useState([]);
  const [recentRecords, setRecentRecords] = useState([]);
  const [todayAlerts, setTodayAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    if (alerts) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const filtered = alerts
        .filter(alert => {
          const alertDate = new Date(alert.scheduledDate);
          alertDate.setHours(0, 0, 0, 0);
          return alertDate.getTime() === today.getTime();
        })
        .slice(0, 3);
      setTodayAlerts(filtered);
    }
  }, [alerts]);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const patientsQuery = query(
        collection(db, 'patients'),
        where('createdBy', '==', user.uid),
        orderBy('lastUpdated', 'desc'),
        limit(3)
      );
      const patientsSnapshot = await getDocs(patientsQuery);
      const patientsData = patientsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentPatients(patientsData);

      const recordsQuery = query(
        collection(db, 'records'),
        where('createdBy', '==', user.uid),
        orderBy('date', 'desc'),
        limit(3)
      );
      const recordsSnapshot = await getDocs(recordsQuery);
      const recordsData = recordsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecentRecords(recordsData);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    let greeting = '';
    if (hour < 12) {
      greeting = 'Buenos días';
    } else if (hour < 18) {
      greeting = 'Buenas tardes';
    } else {
      greeting = 'Buenas noches';
    }
    return greeting;
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <GreetingContainer>
            <Greeting>{getGreeting()},</Greeting>
            <UserName>{user?.displayName || 'Usuario'}</UserName>
          </GreetingContainer>
          <ProfileButton onClick={() => navigate('/profile')}>
            {user?.photoURL ? (
              <ProfileImage src={user.photoURL} alt="Foto de perfil" />
            ) : (
              <i className="fas fa-user"></i>
            )}
          </ProfileButton>
        </Header>
        <MainContent>
          <RefreshButton onClick={handleRefresh} disabled={refreshing}>
            {refreshing ? (
              <i className="fas fa-sync fa-spin"></i>
            ) : (
              <i className="fas fa-sync"></i>
            )}
            <span>Actualizar</span>
          </RefreshButton>
          <Section>
            <SectionHeader>
              <SectionTitle>Alertas de hoy</SectionTitle>
              <ViewAllLink onClick={() => navigate('/alerts')}>
                Ver todo
              </ViewAllLink>
            </SectionHeader>
            {todayAlerts.length > 0 ? (
              <CardsList>
                {todayAlerts.map(alert => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </CardsList>
            ) : (
              <EmptyState>
                <i
                  className="fas fa-check-circle"
                  style={{ color: colors.success }}
                ></i>
                <EmptyStateText>
                  No hay alertas pendientes para hoy
                </EmptyStateText>
              </EmptyState>
            )}
            <Button
              title="Crear recordatorio"
              onClick={() => navigate('/create-alert')}
              variant="secondary"
              size="small"
              leftIcon={
                <i
                  className="fas fa-plus-circle"
                  style={{ color: colors.secondary }}
                ></i>
              }
              style={{ width: '100%', marginTop: '16px' }}
            />
          </Section>
          <Section>
            <SectionHeader>
              <SectionTitle>Pacientes recientes</SectionTitle>
              <ViewAllLink onClick={() => navigate('/patients')}>
                Ver todo
              </ViewAllLink>
            </SectionHeader>
            {recentPatients.length > 0 ? (
              <CardsList>
                {recentPatients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </CardsList>
            ) : (
              <EmptyState>
                <i
                  className="fas fa-users"
                  style={{ color: colors.secondary }}
                ></i>
                <EmptyStateText>
                  No hay pacientes registrados aún
                </EmptyStateText>
              </EmptyState>
            )}
            <Button
              title="Registrar paciente"
              onClick={() => navigate('/add-patient')}
              variant="secondary"
              size="small"
              leftIcon={
                <i
                  className="fas fa-plus-circle"
                  style={{ color: colors.secondary }}
                ></i>
              }
              style={{ width: '100%', marginTop: '16px' }}
            />
          </Section>
          <Section>
            <SectionHeader>
              <SectionTitle>Últimos registros</SectionTitle>
              <ViewAllLink onClick={() => navigate('/records')}>
                Ver todo
              </ViewAllLink>
            </SectionHeader>
            {recentRecords.length > 0 ? (
              <CardsList>
                {recentRecords.map(record => (
                  <RecordCard
                    key={record.id}
                    record={record}
                    showPatientInfo={true}
                  />
                ))}
              </CardsList>
            ) : (
              <EmptyState>
                <i
                  className="fas fa-file-medical"
                  style={{ color: colors.secondary }}
                ></i>
                <EmptyStateText>No hay registros médicos aún</EmptyStateText>
              </EmptyState>
            )}
            <Button
              title="Nuevo registro"
              onClick={() => navigate('/add-record')}
              variant="secondary"
              size="small"
              leftIcon={
                <i
                  className="fas fa-plus-circle"
                  style={{ color: colors.secondary }}
                ></i>
              }
              style={{ width: '100%', marginTop: '16px' }}
            />
          </Section>
        </MainContent>
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
  max-width: 1100px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px auto;
  flex-grow: 1;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const GreetingContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const Greeting = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const UserName = styled.h1`
  font-size: 24px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 4px 0 0 0;
`;

const ProfileButton = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: ${({ theme }) => `${theme.colors.secondary}15`};
  color: ${({ theme }) => theme.colors.secondary};
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  cursor: pointer;
  font-size: 20px;
  transition: background-color 0.2s;
  overflow: hidden;
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.secondary}25`};
  }
`;

const ProfileImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const MainContent = styled.main`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  align-self: flex-end;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  cursor: pointer;
  margin-bottom: 8px;
  transition: all 0.2s;
  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const SectionTitle = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const ViewAllLink = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  color: ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  padding: 0;
  &:hover {
    text-decoration: underline;
  }
`;

const CardsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  margin-bottom: 12px;
  i {
    font-size: 24px;
    margin-right: 12px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export default HomePage;
