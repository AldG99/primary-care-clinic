// src/pages/records/RecordListPage.js (con búsqueda instantánea)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { useTheme } from '../../hooks/useTheme';
import { useAuth } from '../../hooks/useAuth';
import RecordCard from '../../components/RecordCard';
import Button from '../../components/Button';
import Footer from '../../components/Footer';

const RecordListPage = () => {
  const navigate = useNavigate();
  const { colors } = useTheme();
  const { hasPermission, user } = useAuth();

  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState({
    type: null,
    dateRange: null,
    diagnosis: '',
  });

  // Estados para la paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);

  useEffect(() => {
    if (user) {
      loadRecords();
    }
  }, [user]);

  useEffect(() => {
    // Aplicar los filtros cada vez que cambia la consulta de búsqueda o los filtros
    filterRecords();
  }, [searchQuery, records, filters]);

  const loadRecords = async () => {
    setLoading(true);
    try {
      console.log('Intentando cargar registros...');
      const recordsRef = collection(db, 'records');

      // Consulta simple que no requiere índice compuesto
      const q = query(recordsRef, where('createdBy', '==', user.uid));

      const querySnapshot = await getDocs(q);
      console.log('Registros encontrados:', querySnapshot.docs.length);

      if (querySnapshot.empty) {
        console.log('No se encontraron registros en la base de datos');
        setRecords([]);
        setFilteredRecords([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const recordsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Ordenar manualmente por fecha (más reciente primero)
      recordsList.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateB - dateA;
      });

      setRecords(recordsList);
      setFilteredRecords(recordsList);
    } catch (error) {
      console.error('Error al cargar registros:', error);
      console.error('Detalle del error:', error.message, error.code);
      alert('No se pudieron cargar los registros: ' + error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...records];

    // Aplicar filtro de búsqueda por texto (incluso con una sola letra)
    if (searchQuery.trim()) {
      const searchTerms = searchQuery.toLowerCase().split(' ');

      filtered = filtered.filter(record => {
        const searchableText = [
          record.title || '',
          record.patientName || '',
          record.diagnosis || '',
          record.summary || '',
          record.doctor || '',
        ]
          .join(' ')
          .toLowerCase();

        return searchTerms.every(term => searchableText.includes(term));
      });
    }

    // Aplicar filtro por tipo de registro
    if (filters.type) {
      filtered = filtered.filter(record => record.type === filters.type);
    }

    // Aplicar filtro por diagnóstico
    if (filters.diagnosis) {
      filtered = filtered.filter(
        record =>
          record.diagnosis &&
          record.diagnosis
            .toLowerCase()
            .includes(filters.diagnosis.toLowerCase())
      );
    }

    // Aplicar filtro por rango de fechas
    if (filters.dateRange) {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      filtered = filtered.filter(record => {
        // Asegurarse de que date es un objeto Date
        const recordDate = record.date?.toDate
          ? record.date.toDate()
          : new Date(record.date);

        switch (filters.dateRange) {
          case 'today':
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return recordDate >= today && recordDate < tomorrow;

          case 'this-week':
            const dayOfWeek = now.getDay();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - dayOfWeek);
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 7);

            return recordDate >= startOfWeek && recordDate < endOfWeek;

          case 'this-month':
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(
              now.getFullYear(),
              now.getMonth() + 1,
              0
            );
            return recordDate >= startOfMonth && recordDate <= endOfMonth;

          case 'this-year':
            const startOfYear = new Date(now.getFullYear(), 0, 1);
            const endOfYear = new Date(now.getFullYear(), 11, 31);
            return recordDate >= startOfYear && recordDate <= endOfYear;

          default:
            return true;
        }
      });
    }

    setFilteredRecords(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se aplican filtros
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  const handleSearch = value => {
    setSearchQuery(value);
    // No es necesario llamar a filterRecords() explícitamente, ya que el useEffect lo hará
  };

  const handleFilterChange = newFilters => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      type: null,
      dateRange: null,
      diagnosis: '',
    });
  };

  // Calcular registros actuales para la paginación
  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(
    indexOfFirstRecord,
    indexOfLastRecord
  );
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

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
            <Title>Registros médicos</Title>
            {hasPermission('doctor') && (
              <AddButton onClick={() => navigate('/add-record')}>
                <i className="fas fa-plus"></i>
              </AddButton>
            )}
          </TitleContainer>

          <SearchContainer>
            <SearchInputContainer>
              <SearchIcon className="fas fa-search" />
              <SearchInput
                type="text"
                placeholder="Buscar por título, paciente, diagnóstico..."
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
              <FilterLabel>Filtrar por tipo:</FilterLabel>
              <ChipsContainer>
                <Chip
                  active={filters.type === 'consultation'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      type:
                        filters.type === 'consultation' ? null : 'consultation',
                    })
                  }
                >
                  <i className="fas fa-stethoscope"></i> Consulta
                </Chip>
                <Chip
                  active={filters.type === 'lab'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      type: filters.type === 'lab' ? null : 'lab',
                    })
                  }
                >
                  <i className="fas fa-flask"></i> Laboratorio
                </Chip>
                <Chip
                  active={filters.type === 'prescription'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      type:
                        filters.type === 'prescription' ? null : 'prescription',
                    })
                  }
                >
                  <i className="fas fa-prescription"></i> Prescripción
                </Chip>
                <Chip
                  active={filters.type === 'vital_signs'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      type:
                        filters.type === 'vital_signs' ? null : 'vital_signs',
                    })
                  }
                >
                  <i className="fas fa-heartbeat"></i> Signos vitales
                </Chip>
              </ChipsContainer>
            </FilterChips>

            <FilterChips>
              <FilterLabel>Filtrar por fecha:</FilterLabel>
              <ChipsContainer>
                <Chip
                  active={filters.dateRange === 'today'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      dateRange: filters.dateRange === 'today' ? null : 'today',
                    })
                  }
                >
                  <i className="fas fa-calendar-day"></i> Hoy
                </Chip>
                <Chip
                  active={filters.dateRange === 'this-week'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      dateRange:
                        filters.dateRange === 'this-week' ? null : 'this-week',
                    })
                  }
                >
                  <i className="fas fa-calendar-week"></i> Esta semana
                </Chip>
                <Chip
                  active={filters.dateRange === 'this-month'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      dateRange:
                        filters.dateRange === 'this-month'
                          ? null
                          : 'this-month',
                    })
                  }
                >
                  <i className="fas fa-calendar-alt"></i> Este mes
                </Chip>
                <Chip
                  active={filters.dateRange === 'this-year'}
                  onClick={() =>
                    handleFilterChange({
                      ...filters,
                      dateRange:
                        filters.dateRange === 'this-year' ? null : 'this-year',
                    })
                  }
                >
                  <i className="fas fa-calendar"></i> Este año
                </Chip>
              </ChipsContainer>
            </FilterChips>

            {(filters.type || filters.dateRange || searchQuery) && (
              <ClearFiltersButton onClick={clearFilters}>
                <i className="fas fa-times"></i> Limpiar filtros
              </ClearFiltersButton>
            )}
          </FilterOptions>
        </Header>

        {loading && !refreshing ? (
          <LoadingContainer>
            <Spinner />
            <LoadingText>Cargando registros...</LoadingText>
          </LoadingContainer>
        ) : (
          <ListContainer>
            <RefreshRow>
              <ResultsCount>
                {filteredRecords.length}{' '}
                {filteredRecords.length === 1
                  ? 'registro encontrado'
                  : 'registros encontrados'}
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

            {currentRecords.length > 0 ? (
              <>
                <RecordsList>
                  {currentRecords.map(record => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      showPatientInfo={true}
                    />
                  ))}
                </RecordsList>

                {/* Paginación */}
                {filteredRecords.length > recordsPerPage && (
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
                <i className="fas fa-file-medical"></i>
                <EmptyStateText>
                  {searchQuery || filters.type || filters.dateRange
                    ? 'No se encontraron registros con los filtros aplicados'
                    : 'No hay registros médicos aún'}
                </EmptyStateText>

                {(searchQuery || filters.type || filters.dateRange) && (
                  <Button
                    title="Limpiar filtros"
                    onClick={clearFilters}
                    variant="secondary"
                    size="small"
                    style={{ marginTop: '16px' }}
                  />
                )}

                {!searchQuery &&
                  !filters.type &&
                  !filters.dateRange &&
                  hasPermission('doctor') && (
                    <Button
                      title="Crear nuevo registro"
                      onClick={() => navigate('/add-record')}
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

// Nuevos componentes de búsqueda mejorados
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

const RecordsList = styled.div`
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

export default RecordListPage;
