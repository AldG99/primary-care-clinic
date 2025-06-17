// src/pages/patients/PatientListPage.js (con búsqueda instantánea)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import PatientCard from '../../components/PatientCard';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const PatientListPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { hasPermission, user } = useAuth();

  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Estados para filtros adicionales
  const [filters, setFilters] = useState({
    gender: null,
    hasAppointment: false,
  });

  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsPerPage] = useState(10);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    filterPatients();
  }, [searchQuery, patients, filters]);

  const loadPatients = async () => {
    setLoading(true);
    try {
      console.log('Intentando cargar pacientes...');
      const patientsRef = collection(db, 'patients');

      const q = query(patientsRef, where('createdBy', '==', user.uid));

      const querySnapshot = await getDocs(q);

      console.log('Pacientes encontrados:', querySnapshot.docs.length);

      if (querySnapshot.empty) {
        console.log('No se encontraron pacientes en la base de datos');
        setPatients([]);
        setFilteredPatients([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const patientsList = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
        };
      });

      // Ordenar por apellido (opcional, puedes cambiar el criterio)
      patientsList.sort((a, b) => a.lastName.localeCompare(b.lastName));

      setPatients(patientsList);
      setFilteredPatients(patientsList);
    } catch (error) {
      console.error('Error al cargar pacientes:', error);
      console.error('Detalle del error:', error.message, error.code);
      alert('No se pudieron cargar los pacientes: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterPatients = () => {
    if (!patients) return;

    let filtered = [...patients];

    // Filtrar por términos de búsqueda (incluso una sola letra)
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(' ');

      filtered = filtered.filter(patient => {
        const fullName = `${patient.firstName.toLowerCase()} ${patient.lastName.toLowerCase()}`;
        const email = patient.email?.toLowerCase() || '';
        const phone = patient.phone || '';
        const searchableText = `${fullName} ${email} ${phone}`;

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Aplicar filtro por género si está seleccionado
    if (filters.gender) {
      filtered = filtered.filter(patient => patient.gender === filters.gender);
    }

    // Aplicar filtro para pacientes con cita próxima
    if (filters.hasAppointment) {
      filtered = filtered.filter(
        patient =>
          patient.upcomingAppointment &&
          new Date(patient.upcomingAppointment) > new Date()
      );
    }

    setFilteredPatients(filtered);
    setCurrentPage(1); // Resetear a primera página cuando se filtran resultados
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPatients();
  };

  const handleSearch = value => {
    setSearchQuery(value);
    // No es necesario llamar a filterPatients() explícitamente, ya que el useEffect lo hará
  };

  const handleFilterChange = newFilters => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      gender: null,
      hasAppointment: false,
    });
  };

  // Calcular pacientes actuales para la paginación
  const indexOfLastPatient = currentPage * patientsPerPage;
  const indexOfFirstPatient = indexOfLastPatient - patientsPerPage;
  const currentPatients = filteredPatients.slice(
    indexOfFirstPatient,
    indexOfLastPatient
  );
  const totalPages = Math.ceil(filteredPatients.length / patientsPerPage);

  // Funciones para la paginación
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <PageContainer>
      <ContentContainer>
        <Header>
          <TitleContainer>
            <Title>Pacientes</Title>
            {hasPermission('doctor') && (
              <AddButton onClick={() => navigate('/add-patient')}>
                <i className="fas fa-plus"></i>
              </AddButton>
            )}
          </TitleContainer>

          <SearchContainer>
            <SearchInputContainer>
              <SearchIcon className="fas fa-search" />
              <SearchInput
                type="text"
                placeholder="Buscar por nombre, correo o teléfono..."
                value={searchQuery}
                onChange={e => handleSearch(e.target.value)}
              />
              {searchQuery && (
                <ClearSearchButton onClick={() => handleSearch('')}>
                  <i className="fas fa-times"></i>
                </ClearSearchButton>
              )}
            </SearchInputContainer>
          </SearchContainer>

          <FilterOptions>
            <FilterChips>
              <FilterLabel>Filtrar por género:</FilterLabel>
              <ChipsContainer>
                <Chip
                  active={filters.gender === 'male'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      gender: filters.gender === 'male' ? null : 'male',
                    })
                  }
                >
                  <i className="fas fa-mars"></i> Masculino
                </Chip>
                <Chip
                  active={filters.gender === 'female'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      gender: filters.gender === 'female' ? null : 'female',
                    })
                  }
                >
                  <i className="fas fa-venus"></i> Femenino
                </Chip>
              </ChipsContainer>
            </FilterChips>

            <FilterChips>
              <ToggleChip
                active={filters.hasAppointment}
                onClick={() =>
                  handleFilterChange({
                    ...filters,
                    hasAppointment: !filters.hasAppointment,
                  })
                }
              >
                <i className="fas fa-calendar-check"></i> Solo pacientes con
                cita programada
              </ToggleChip>
            </FilterChips>

            {(filters.gender || filters.hasAppointment || searchQuery) && (
              <ClearFiltersButton onClick={clearFilters}>
                <i className="fas fa-times"></i> Limpiar filtros
              </ClearFiltersButton>
            )}
          </FilterOptions>
        </Header>

        {loading && !refreshing ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>Cargando pacientes...</LoadingText>
          </LoadingContainer>
        ) : (
          <ListContainer>
            <RefreshRow>
              <ResultsCount>
                {filteredPatients.length}{' '}
                {filteredPatients.length === 1
                  ? 'paciente encontrado'
                  : 'pacientes encontrados'}
              </ResultsCount>
              <RefreshButton onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <i className="fas fa-sync fa-spin"></i>
                ) : (
                  <i className="fas fa-sync"></i>
                )}
                <span>Actualizar</span>
              </RefreshButton>
            </RefreshRow>

            {currentPatients.length > 0 ? (
              <>
                <PatientsList>
                  {currentPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))}
                </PatientsList>

                {/* Paginación */}
                {filteredPatients.length > patientsPerPage && (
                  <Pagination>
                    <PaginationButton
                      onClick={goToPreviousPage}
                      disabled={currentPage === 1}
                    >
                      <i className="fas fa-chevron-left"></i> Anterior
                    </PaginationButton>

                    <PageInfo>
                      Página {currentPage} de {totalPages}
                    </PageInfo>

                    <PaginationButton
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente <i className="fas fa-chevron-right"></i>
                    </PaginationButton>
                  </Pagination>
                )}
              </>
            ) : (
              <EmptyState>
                <i className="fas fa-users"></i>
                <EmptyStateText>
                  {searchQuery || filters.gender || filters.hasAppointment
                    ? 'No se encontraron pacientes con los filtros aplicados'
                    : 'No hay pacientes registrados aún'}
                </EmptyStateText>

                {(searchQuery || filters.gender || filters.hasAppointment) && (
                  <Button
                    title="Limpiar filtros"
                    onClick={clearFilters}
                    variant="secondary"
                    size="small"
                    style={{ marginTop: '16px' }}
                  />
                )}

                {!searchQuery &&
                  !filters.gender &&
                  !filters.hasAppointment &&
                  hasPermission('doctor') && (
                    <Button
                      title="Registrar paciente"
                      onClick={() => navigate('/add-patient')}
                      variant="primary"
                      size="small"
                      style={{ marginTop: '16px' }}
                    />
                  )}
              </EmptyState>
            )}
          </ListContainer>
        )}
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

const TitleContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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

// Componentes de búsqueda mejorados
const SearchContainer = styled.div`
  margin-bottom: 16px;
`;

const SearchInputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 16px;
  height: 48px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 24px;
  transition: all 0.2s;

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.secondary}20;
  }
`;

const SearchIcon = styled.i`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.subtext};
  margin-right: 12px;
`;

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  background: transparent;
  border: none;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.subtext};
  }
`;

const ClearSearchButton = styled.button`
  background: transparent;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  margin-left: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.subtext};
  transition: color 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.text};
  }

  i {
    font-size: 16px;
  }
`;

const FilterOptions = styled.div`
  margin-top: 16px;
`;

const FilterChips = styled.div`
  margin-top: 12px;
`;

const FilterLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
  margin-right: 12px;
`;

const ChipsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
`;

const Chip = styled.button`
  display: flex;
  align-items: center;
  padding: 6px 12px;
  background-color: ${({ theme, active }) =>
    active ? theme.colors.secondaryLight : theme.colors.backgroundLight};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.secondary : theme.colors.border};
  border-radius: 20px;
  font-size: 13px;
  color: ${({ theme, active }) =>
    active ? theme.colors.secondary : theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? theme.colors.secondaryLight : theme.colors.border};
  }

  i {
    margin-right: 6px;
  }
`;

const ToggleChip = styled(Chip)`
  margin-top: 8px;
  background-color: ${({ theme, active }) =>
    active ? `${theme.colors.success}15` : theme.colors.backgroundLight};
  border: 1px solid
    ${({ theme, active }) =>
      active ? theme.colors.success : theme.colors.border};
  color: ${({ theme, active }) =>
    active ? theme.colors.success : theme.colors.text};

  &:hover {
    background-color: ${({ theme, active }) =>
      active ? `${theme.colors.success}25` : theme.colors.border};
  }
`;

const ClearFiltersButton = styled.button`
  display: flex;
  align-items: center;
  margin-top: 16px;
  padding: 8px 16px;
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 20px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.backgroundLight};
  }

  i {
    margin-right: 6px;
  }
`;

const ListContainer = styled.div`
  flex: 1;
  padding: 24px;
  overflow-y: auto;
`;

const RefreshRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ResultsCount = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.subtext};
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 4px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  border: 1px solid ${({ theme }) => theme.colors.primary};
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}10`};
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const PatientsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 24px;
  gap: 16px;
`;

const PaginationButton = styled.button`
  padding: 8px 16px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.backgroundLight};
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme, disabled }) =>
    disabled ? theme.colors.textMuted : theme.colors.text};
  font-size: 14px;
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.2s;
  opacity: ${({ disabled }) => (disabled ? 0.7 : 1)};

  &:hover:not([disabled]) {
    background-color: ${({ theme }) => theme.colors.border};
  }

  i {
    margin: 0 4px;
  }
`;

const PageInfo = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 0;
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
  padding: 40px 24px;
  border: 1px dashed ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  text-align: center;
  margin: 16px 0;

  i {
    font-size: 32px;
    color: ${({ theme }) => theme.colors.secondary};
    margin-bottom: 16px;
  }
`;

const EmptyStateText = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;
`;

export default PatientListPage;
