// src/components/Footer.js
import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';

const Footer = () => {
  const { colors } = useTheme();
  const year = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <AppName>MediNote</AppName>
        <Copyright>&copy; {year} Todos los derechos reservados</Copyright>
      </FooterContent>
    </FooterContainer>
  );
};

const FooterContainer = styled.footer`
  padding: 16px 24px;
  background-color: ${props => props.theme.colors.white};
  border-top: 1px solid ${props => props.theme.colors.border};
  margin-top: auto;
`;

const FooterContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const AppName = styled.p`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.secondary};
  margin-bottom: 4px;
`;

const Copyright = styled.p`
  font-size: 12px;
  color: ${props => props.theme.colors.subtext};
`;

export default Footer;
