// src/pages/alerts/AlertsPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import {
  collection,
  query,
  getDocs,
  where,
  doc,
  updateDoc,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import { useAlerts } from '../../hooks/useAlerts';
import AlertCard from '../../components/AlertCard';
import Footer from '../../components/Footer';

const AlertsPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { hasPermission, user } = useAuth();
  const { alerts, loading: alertsContextLoading } = useAlerts();

  const [localAlerts, setLocalAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    if (user) {
      loadAlertsDirectly();
    }
  }, [user]);

  useEffect(() => {
    if (alerts && alerts.length > 0) {
      console.log('Alertas recibidas del contexto:', alerts.length);
      setLocalAlerts(alerts);
      setLoading(false);
    }
  }, [alerts]);

  const loadAlertsDirectly = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Intentando cargar alertas directamente...');
      const alertsRef = collection(db, 'alerts');

      const q = query(
        alertsRef,
        where('assignedTo', 'array-contains', user.uid)
      );

      const querySnapshot = await getDocs(q);
      console.log('Alertas encontradas:', querySnapshot.docs.length);

      if (querySnapshot.empty) {
        console.log('No se encontraron alertas');
        setLocalAlerts([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const alertsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const scheduledDate =
          data.scheduledDate instanceof Timestamp
            ? data.scheduledDate.toDate()
            : new Date(data.scheduledDate);

        return {
          id: doc.id,
          ...data,
          scheduledDate,
        };
      });

      console.log('Alertas procesadas:', alertsList.length);

      alertsList.sort((a, b) => {
        const dateA = a.scheduledDate;
        const dateB = b.scheduledDate;
        return dateA - dateB;
      });

      setLocalAlerts(alertsList);
    } catch (error) {
      console.error('Error al cargar alertas directamente:', error);
      alert('No se pudieron cargar las alertas: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getFilteredAlerts = () => {
    if (!localAlerts || localAlerts.length === 0) return [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch (activeTab) {
      case 'pending':
        return localAlerts.filter(alert => !alert.completed);
      case 'today':
        return localAlerts.filter(alert => {
          const alertDate = new Date(alert.scheduledDate);
          return alertDate >= today && alertDate < tomorrow;
        });
      case 'upcoming':
        return localAlerts.filter(alert => {
          const alertDate = new Date(alert.scheduledDate);
          return alertDate >= tomorrow;
        });
      case 'completed':
        return localAlerts.filter(alert => alert.completed);
      default:
        return localAlerts;
    }
  };

  const markAsCompleted = async alertId => {
    try {
      const alertRef = doc(db, 'alerts', alertId);
      await updateDoc(alertRef, {
        completed: true,
        completedAt: new Date().toISOString(),
      });

      setLocalAlerts(prev =>
        prev.map(alert =>
          alert.id === alertId
            ? {
                ...alert,
                completed: true,
                completedAt: new Date().toISOString(),
              }
            : alert
        )
      );
    } catch (error) {
      console.error('Error al marcar alerta como completada:', error);
      alert('No se pudo marcar la alerta como completada: ' + error.message);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAlertsDirectly();
  };

  const filteredAlerts = getFilteredAlerts();

  return (
    <PageContainer>
      <AlertsContainer>
        <Header>
          <TitleContainer>
            <Title>Alertas</Title>
            {hasPermission('doctor') && (
              <AddButton onClick={() => navigate('/create-alert')}>
                <i className="fas fa-plus"></i>
              </AddButton>
            )}
          </TitleContainer>

          <TabsContainer>
            <Tab
              active={activeTab === 'pending'}
              onClick={() => setActiveTab('pending')}
            >
              Pendientes
            </Tab>
            <Tab
              active={activeTab === 'today'}
              onClick={() => setActiveTab('today')}
            >
              Hoy
            </Tab>
            <Tab
              active={activeTab === 'upcoming'}
              onClick={() => setActiveTab('upcoming')}
            >
              Próximas
            </Tab>
            <Tab
              active={activeTab === 'completed'}
              onClick={() => setActiveTab('completed')}
            >
              Completadas
            </Tab>
          </TabsContainer>
        </Header>

        <ContentArea>
          {loading ? (
            <LoadingContainer>
              <Spinner />
              <LoadingText>Cargando alertas...</LoadingText>
            </LoadingContainer>
          ) : (
            <AlertsList>
              <RefreshButton onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <i className="fas fa-sync fa-spin"></i>
                ) : (
                  <i className="fas fa-sync"></i>
                )}
                <span>Actualizar</span>
              </RefreshButton>

              {filteredAlerts.length > 0 ? (
                filteredAlerts.map(alert => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onComplete={
                      !alert.completed ? () => markAsCompleted(alert.id) : null
                    }
                  />
                ))
              ) : (
                <EmptyState>
                  <i className="far fa-bell"></i>
                  <EmptyStateText>
                    {activeTab === 'pending'
                      ? 'No hay alertas pendientes'
                      : activeTab === 'today'
                      ? 'No hay alertas para hoy'
                      : activeTab === 'upcoming'
                      ? 'No hay alertas programadas'
                      : 'No hay alertas completadas'}
                  </EmptyStateText>
                  <EmptyStateSubtext>
                    Total de alertas disponibles: {localAlerts.length}
                  </EmptyStateSubtext>
                </EmptyState>
              )}
            </AlertsList>
          )}
        </ContentArea>
      </AlertsContainer>
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

const AlertsContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  max-width: 1100px;
  background-color: ${({ theme }) => theme.colors.white};
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  margin: 20px auto;
`;

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

const AddButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: ${({ theme }) => theme.colors.secondary};
  color: white;
  border: none;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 16px;

  &:hover {
    background-color: ${({ theme }) => theme.colors.secondaryDark};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  margin-bottom: 8px;
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

const Tab = styled.button`
  padding: 8px 20px;
  border-radius: 20px;
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.secondary : theme.colors.border};
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.secondary}15` : 'transparent'};
  color: ${({ theme, active }) =>
    active ? theme.colors.secondary : theme.colors.subtext};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  font-size: 14px;
  margin-right: 12px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.secondary}25` : `${theme.colors.background}`};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.secondary}30;
  }
`;

const ContentArea = styled.div`
  flex: 1;
  padding: 24px;
`;

const AlertsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
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
  margin-bottom: 16px;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 0;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  text-align: center;

  i {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 16px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: 8px;
`;

const EmptyStateSubtext = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

export default AlertsPage;
