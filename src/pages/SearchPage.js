// src/pages/SearchPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../hooks/useAuth';
import SearchBar from '../components/SearchBar';
import PatientCard from '../components/PatientCard';
import RecordCard from '../components/RecordCard';
import Footer from '../components/Footer';

// Importa los servicios
import PatientService from '../api/patientService';
import RecordService from '../api/recordService';

const SearchPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { user } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('patients');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setHasSearched(true);

    try {
      if (activeTab === 'patients') {
        const patients = await PatientService.searchByName(
          searchQuery,
          user.uid
        );
        setSearchResults(patients);
      } else {
        const records = await RecordService.searchByDiagnosis(
          searchQuery,
          user.uid
        );
        setSearchResults(records);
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      alert('Ocurrió un error al realizar la búsqueda');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = tab => {
    setActiveTab(tab);
    setSearchResults([]);
    setHasSearched(false);
  };

  const handleClear = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <Title>Búsqueda</Title>

          <SearchBar
            placeholder={`Buscar ${
              activeTab === 'patients' ? 'pacientes' : 'registros'
            }...`}
            value={searchQuery}
            onChange={value => setSearchQuery(value)}
            onSearch={handleSearch}
            onClear={handleClear}
          />

          <TabsContainer>
            <Tab
              active={activeTab === 'patients'}
              onClick={() => handleTabChange('patients')}
            >
              Pacientes
            </Tab>
            <Tab
              active={activeTab === 'records'}
              onClick={() => handleTabChange('records')}
            >
              Registros médicos
            </Tab>
          </TabsContainer>
        </Header>

        <ResultsContainer>
          {loading ? (
            <LoadingContainer>
              <Spinner />
              <LoadingText>Buscando...</LoadingText>
            </LoadingContainer>
          ) : (
            <>
              {hasSearched && (
                <ResultsInfo>
                  {searchResults.length > 0 ? (
                    <ResultsCount>
                      {searchResults.length}{' '}
                      {searchResults.length === 1
                        ? activeTab === 'patients'
                          ? 'paciente encontrado'
                          : 'registro encontrado'
                        : activeTab === 'patients'
                        ? 'pacientes encontrados'
                        : 'registros encontrados'}
                    </ResultsCount>
                  ) : (
                    <NoResultsMessage>
                      No se encontraron resultados para "{searchQuery}"
                    </NoResultsMessage>
                  )}
                </ResultsInfo>
              )}

              {!hasSearched && (
                <InitialStateContainer>
                  <i
                    className="fas fa-search"
                    style={{ fontSize: '48px', color: colors.secondaryLight }}
                  ></i>
                  <InitialStateText>
                    Ingresa un término de búsqueda para encontrar{' '}
                    {activeTab === 'patients'
                      ? 'pacientes'
                      : 'registros médicos'}
                  </InitialStateText>
                </InitialStateContainer>
              )}

              {searchResults.length > 0 && (
                <ResultsList>
                  {activeTab === 'patients'
                    ? // Renderizar lista de pacientes
                      searchResults.map(patient => (
                        <PatientCard key={patient.id} patient={patient} />
                      ))
                    : // Renderizar lista de registros
                      searchResults.map(record => (
                        <RecordCard
                          key={record.id}
                          record={record}
                          showPatientInfo={true}
                        />
                      ))}
                </ResultsList>
              )}
            </>
          )}
        </ResultsContainer>
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

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 16px 0;
`;

const TabsContainer = styled.div`
  display: flex;
  margin-top: 16px;
`;

const Tab = styled.button`
  padding: 8px 20px;
  border-radius: 8px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.secondaryLight : 'transparent'};
  color: ${({ theme, active }) =>
    active ? theme.colors.secondary : theme.colors.text};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.secondary : theme.colors.border};
  font-weight: ${({ active }) => (active ? '600' : '400')};
  margin-right: 10px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? theme.colors.secondaryLight : theme.colors.backgroundLight};
  }
`;

const ResultsContainer = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const ResultsInfo = styled.div`
  margin-bottom: 20px;
`;

const ResultsCount = styled.h2`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  font-weight: 500;
  margin: 0;
`;

const NoResultsMessage = styled.div`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  font-weight: 500;
`;

const InitialStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 24px;
  text-align: center;
`;

const InitialStateText = styled.p`
  font-size: 18px;
  color: ${({ theme }) => theme.colors.subtext};
  margin-top: 16px;
`;

const ResultsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 0;
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

export default SearchPage;
