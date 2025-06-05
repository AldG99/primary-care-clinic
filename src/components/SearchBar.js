// src/components/SearchBar.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';
import Button from './Button';

const SearchBar = ({
  placeholder = 'Buscar...',
  value,
  onChange,
  onSearch,
  onClear,
  onFilter,
  showFilter = false,
  filters = {},
  className,
}) => {
  const { colors } = useTheme();
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState(filters);

  const handleFilterChange = (key, value) => {
    setTempFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    if (onFilter) {
      onFilter(tempFilters);
    }
    setFilterModalVisible(false);
  };

  const clearFilters = () => {
    const emptyFilters = Object.keys(tempFilters).reduce((acc, key) => {
      acc[key] = null;
      return acc;
    }, {});

    setTempFilters(emptyFilters);

    if (onFilter) {
      onFilter(emptyFilters);
    }

    setFilterModalVisible(false);
  };

  const hasActiveFilters = () => {
    return Object.values(filters).some(value => value !== null && value !== '');
  };

  const handleKeyPress = e => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <Container className={className}>
      <SearchBarContainer
        backgroundColor={colors.card}
        borderColor={colors.border}
      >
        <SearchIcon className="fas fa-search" color={colors.subtext} />

        <SearchInput
          placeholder={placeholder}
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          color={colors.text}
          placeholderColor={colors.subtext}
        />

        {value !== '' && (
          <ClearButton onClick={onClear}>
            <i
              className="fas fa-times-circle"
              style={{ color: colors.subtext, fontSize: '16px' }}
            />
          </ClearButton>
        )}

        {showFilter && (
          <FilterButton
            onClick={() => setFilterModalVisible(true)}
            active={hasActiveFilters()}
            activeBg={colors.secondaryLight}
          >
            <i
              className="fas fa-sliders-h"
              style={{
                color: hasActiveFilters() ? colors.secondary : colors.subtext,
                fontSize: '16px',
              }}
            />
          </FilterButton>
        )}
      </SearchBarContainer>

      {filterModalVisible && (
        <ModalOverlay onClick={() => setFilterModalVisible(false)}>
          <ModalContent
            backgroundColor={colors.background}
            onClick={e => e.stopPropagation()}
          >
            <ModalHeader>
              <ModalTitle color={colors.text}>Filtros de búsqueda</ModalTitle>
              <CloseButton onClick={() => setFilterModalVisible(false)}>
                <i
                  className="fas fa-times"
                  style={{ color: colors.text, fontSize: '20px' }}
                />
              </CloseButton>
            </ModalHeader>

            <FiltersContainer>
              <FilterSection>
                <FilterSectionTitle color={colors.text}>
                  Tipo de registro
                </FilterSectionTitle>
                <FilterOptions>
                  {[
                    'Consulta',
                    'Laboratorio',
                    'Prescripción',
                    'Signos vitales',
                    'Procedimiento',
                  ].map(type => (
                    <FilterChip
                      key={type}
                      active={tempFilters.type === type.toLowerCase()}
                      activeBg={colors.secondaryLight}
                      activeBorder={colors.secondary}
                      borderColor={colors.border}
                      onClick={() =>
                        handleFilterChange(
                          'type',
                          tempFilters.type === type.toLowerCase()
                            ? null
                            : type.toLowerCase()
                        )
                      }
                    >
                      <FilterChipText
                        color={
                          tempFilters.type === type.toLowerCase()
                            ? colors.secondary
                            : colors.text
                        }
                      >
                        {type}
                      </FilterChipText>
                    </FilterChip>
                  ))}
                </FilterOptions>
              </FilterSection>

              <FilterSection>
                <FilterSectionTitle color={colors.text}>
                  Rango de fechas
                </FilterSectionTitle>
                <FilterOptions>
                  {['Hoy', 'Esta semana', 'Este mes', 'Este año'].map(date => (
                    <FilterChip
                      key={date}
                      active={tempFilters.dateRange === date.toLowerCase()}
                      activeBg={colors.secondaryLight}
                      activeBorder={colors.secondary}
                      borderColor={colors.border}
                      onClick={() =>
                        handleFilterChange(
                          'dateRange',
                          tempFilters.dateRange === date.toLowerCase()
                            ? null
                            : date.toLowerCase()
                        )
                      }
                    >
                      <FilterChipText
                        color={
                          tempFilters.dateRange === date.toLowerCase()
                            ? colors.secondary
                            : colors.text
                        }
                      >
                        {date}
                      </FilterChipText>
                    </FilterChip>
                  ))}
                </FilterOptions>
              </FilterSection>

              <FilterSection>
                <FilterSectionTitle color={colors.text}>
                  Diagnóstico
                </FilterSectionTitle>
                <FilterInput
                  placeholder="Buscar por diagnóstico"
                  value={tempFilters.diagnosis || ''}
                  onChange={e =>
                    handleFilterChange('diagnosis', e.target.value)
                  }
                  color={colors.text}
                  backgroundColor={colors.card}
                  borderColor={colors.border}
                  placeholderColor={colors.subtext}
                />
              </FilterSection>
            </FiltersContainer>

            <ModalFooter borderColor={colors.border}>
              <ButtonWrapper>
                <Button
                  title="Limpiar filtros"
                  onClick={clearFilters}
                  variant="secondary"
                  size="medium"
                />
              </ButtonWrapper>
              <ButtonWrapper>
                <Button
                  title="Aplicar filtros"
                  onClick={applyFilters}
                  variant="primary"
                  size="medium"
                />
              </ButtonWrapper>
            </ModalFooter>
          </ModalContent>
        </ModalOverlay>
      )}
    </Container>
  );
};

// Estilos
const Container = styled.div`
  margin: 8px 0;
`;

const SearchBarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  padding: 0 12px;
  height: 44px;
  background-color: ${props => props.backgroundColor};
`;

const SearchIcon = styled.i`
  margin-right: 8px;
  font-size: 16px;
  color: ${props => props.color};
`;

const SearchInput = styled.input`
  flex: 1;
  height: 100%;
  font-size: 14px;
  border: none;
  background-color: transparent;
  color: ${props => props.color};
  outline: none;

  &::placeholder {
    color: ${props => props.placeholderColor};
  }
`;

const ClearButton = styled.button`
  padding: 6px;
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus {
    outline: none;
  }
`;

const FilterButton = styled.button`
  padding: 6px;
  border-radius: 4px;
  background: ${props => (props.active ? props.activeBg : 'transparent')};
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus {
    outline: none;
  }
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
  align-items: flex-end;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: ${props => props.backgroundColor};
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  padding-top: 16px;
  width: 100%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 16px 16px;
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.color};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:focus {
    outline: none;
  }
`;

const FiltersContainer = styled.div`
  padding: 0 16px;
  overflow-y: auto;
  max-height: calc(80vh - 130px);
`;

const FilterSection = styled.div`
  margin-bottom: 20px;
`;

const FilterSectionTitle = styled.h4`
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
  color: ${props => props.color};
  margin-top: 0;
`;

const FilterOptions = styled.div`
  display: flex;
  flex-wrap: wrap;
`;

const FilterChip = styled.button`
  padding: 6px 12px;
  border-radius: 16px;
  border: 1px solid
    ${props => (props.active ? props.activeBorder : props.borderColor)};
  background-color: ${props => (props.active ? props.activeBg : 'transparent')};
  margin-right: 8px;
  margin-bottom: 8px;
  cursor: pointer;

  &:focus {
    outline: none;
  }
`;

const FilterChipText = styled.span`
  font-size: 14px;
  color: ${props => props.color};
`;

const FilterInput = styled.input`
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
  width: 100%;
  background-color: ${props => props.backgroundColor};
  color: ${props => props.color};

  &::placeholder {
    color: ${props => props.placeholderColor};
  }

  &:focus {
    outline: none;
  }
`;

const ModalFooter = styled.div`
  display: flex;
  padding: 16px;
  border-top: 1px solid ${props => props.borderColor};
  margin-top: auto;
`;

const ButtonWrapper = styled.div`
  flex: 1;
  padding: 0 4px;
`;

export default SearchBar;
