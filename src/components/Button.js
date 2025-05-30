// src/components/Button.js
import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';

const Button = ({
  title,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = false,
  size = 'medium',
  leftIcon,
  rightIcon,
  className,
  textClassName,
}) => {
  const { colors } = useTheme();

  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: disabled
            ? colors.secondary + '80'
            : colors.secondary,
          borderColor: colors.secondary,
          color: '#FFF',
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          borderColor: colors.secondary,
          color: colors.secondary,
        };
      case 'accent':
        return {
          backgroundColor: disabled ? colors.accent + '80' : colors.accent,
          borderColor: colors.accent,
          color: '#FFF',
        };
      case 'danger':
        return {
          backgroundColor: disabled ? colors.error + '80' : colors.error,
          borderColor: colors.error,
          color: '#FFF',
        };
      default:
        return {
          backgroundColor: disabled
            ? colors.secondary + '80'
            : colors.secondary,
          borderColor: colors.secondary,
          color: '#FFF',
        };
    }
  };

  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '12px',
        };
      case 'medium':
        return {
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '14px',
        };
      case 'large':
        return {
          padding: '14px 20px',
          borderRadius: '10px',
          fontSize: '16px',
        };
      default:
        return {
          padding: '10px 16px',
          borderRadius: '8px',
          fontSize: '14px',
        };
    }
  };

  const variantStyle = getVariantStyle();
  const sizeStyle = getSizeStyle();

  return (
    <StyledButton
      onClick={disabled || loading ? null : onClick}
      disabled={disabled || loading}
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      variantBg={variantStyle.backgroundColor}
      variantBorder={variantStyle.borderColor}
      sizeRadius={sizeStyle.borderRadius}
      sizePadding={sizeStyle.padding}
      className={className}
    >
      {leftIcon && !loading && <IconWrapper>{leftIcon}</IconWrapper>}

      {loading ? (
        <Spinner color={variant === 'secondary' ? colors.secondary : '#FFF'} />
      ) : (
        <ButtonText
          color={variantStyle.color}
          size={sizeStyle.fontSize}
          className={textClassName}
        >
          {title}
        </ButtonText>
      )}

      {rightIcon && !loading && <IconWrapper>{rightIcon}</IconWrapper>}
    </StyledButton>
  );
};

// Estilos
const StyledButton = styled.button`
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  gap: 8px;
  border: 1px solid ${props => props.variantBorder};
  min-width: 100px;
  background-color: ${props => props.variantBg};
  border-radius: ${props => props.sizeRadius};
  padding: ${props => props.sizePadding};
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  width: ${props => (props.fullWidth ? '100%' : 'auto')};
  transition: all 0.2s ease;
  outline: none;

  &:hover:not(:disabled) {
    filter: brightness(0.95);
  }

  &:active:not(:disabled) {
    transform: translateY(1px);
  }
`;

const ButtonText = styled.span`
  font-weight: 600;
  text-align: center;
  color: ${props => props.color};
  font-size: ${props => props.size};
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Spinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid ${props => props.color};
  border-radius: 50%;
  border-top: 2px solid transparent;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

export default Button;
