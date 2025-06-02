// src/components/Card.js
import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';

const Card = ({
  title,
  subtitle,
  content,
  footer,
  onClick,
  leftIcon,
  rightIcon,
  className,
  elevation = 2,
  variant = 'default',
  disabled = false,
  bordered = false,
}) => {
  const { colors, theme } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: colors.secondaryLight,
          borderColor: colors.secondary,
        };
      case 'accent':
        return {
          backgroundColor:
            theme === 'light' ? `${colors.accent}20` : `${colors.accent}40`,
          borderColor: colors.accent,
        };
      case 'warning':
        return {
          backgroundColor:
            theme === 'light' ? `${colors.warning}20` : `${colors.warning}40`,
          borderColor: colors.warning,
        };
      case 'error':
        return {
          backgroundColor:
            theme === 'light' ? `${colors.error}20` : `${colors.error}40`,
          borderColor: colors.error,
        };
      case 'success':
        return {
          backgroundColor:
            theme === 'light' ? `${colors.success}20` : `${colors.success}40`,
          borderColor: colors.success,
        };
      default:
        return {
          backgroundColor: colors.card,
          borderColor: colors.border,
        };
    }
  };

  const variantStyle = getVariantStyle();

  // Determinar si debemos renderizar un botón o un div
  const isClickable = onClick && !disabled;

  return (
    <CardContainer
      as={isClickable ? 'button' : 'div'}
      onClick={isClickable ? onClick : undefined}
      backgroundColor={variantStyle.backgroundColor}
      borderColor={variantStyle.borderColor}
      bordered={bordered}
      elevation={elevation}
      isDark={theme === 'dark'}
      disabled={disabled}
      isButton={isClickable}
      className={className}
    >
      {(title || leftIcon || rightIcon) && (
        <CardHeader>
          {leftIcon && <LeftIconContainer>{leftIcon}</LeftIconContainer>}
          <TitleContainer>
            {title && <CardTitle color={colors.text}>{title}</CardTitle>}
            {subtitle && (
              <CardSubtitle color={colors.subtext}>{subtitle}</CardSubtitle>
            )}
          </TitleContainer>
          {rightIcon && <RightIconContainer>{rightIcon}</RightIconContainer>}
        </CardHeader>
      )}

      {content && <CardContent>{content}</CardContent>}

      {footer && <CardFooter borderColor={colors.border}>{footer}</CardFooter>}
    </CardContainer>
  );
};

// Estilos
const CardContainer = styled.div`
  border-radius: 10px;
  overflow: hidden;
  margin: 8px 0;
  background-color: ${props => props.backgroundColor};
  border: ${props =>
    props.bordered ? `1px solid ${props.borderColor}` : 'none'};
  box-shadow: ${props =>
    props.isDark
      ? '0 2px 4px rgba(0, 0, 0, 0.3)'
      : `0 ${props.elevation}px ${props.elevation * 2}px rgba(0, 0, 0, 0.1)`};
  transition: transform 0.2s, box-shadow 0.2s;

  ${props =>
    props.isButton &&
    `
    cursor: pointer;
    text-align: left;
    width: 100%;
    padding: 0;
    font-family: inherit;
    outline: none;
    
    &:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 ${props.elevation + 2}px ${
      (props.elevation + 2) * 2
    }px rgba(0, 0, 0, ${props.isDark ? '0.4' : '0.15'});
    }
    
    &:active:not(:disabled) {
      transform: translateY(0);
    }
    
    &:disabled {
      opacity: 0.7;
      cursor: not-allowed;
    }
  `}
`;

const CardHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: 16px;
`;

const LeftIconContainer = styled.div`
  margin-right: 12px;
`;

const TitleContainer = styled.div`
  flex: 1;
`;

const CardTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: ${props => props.color};
`;

const CardSubtitle = styled.p`
  font-size: 14px;
  margin: 4px 0 0 0;
  color: ${props => props.color};
`;

const RightIconContainer = styled.div`
  margin-left: 12px;
`;

const CardContent = styled.div`
  padding: 0 16px 16px 16px;
`;

const CardFooter = styled.div`
  padding: 16px;
  border-top: 1px solid ${props => props.borderColor};
`;

export default Card;
