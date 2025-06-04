// src/components/Input.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../hooks/useTheme';

const Input = ({
  label,
  placeholder,
  value,
  onChange,
  type,
  multiline,
  rows,
  error,
  touched,
  leftIcon,
  rightIcon,
  customRightIcon,
  onRightIconPress,
  disabled = false,
  className,
  ...props
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const showError = error && touched;
  const isPassword = type === 'password';

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  // Determinar el tipo de entrada correcto
  const inputType = isPassword
    ? isPasswordVisible
      ? 'text'
      : 'password'
    : type;

  return (
    <InputContainer className={className}>
      {label && <InputLabel color={colors.text}>{label}</InputLabel>}
      <InputWrapper
        borderColor={
          showError
            ? colors.error
            : isFocused
            ? colors.secondary
            : colors.border
        }
        backgroundColor={
          disabled ? `${colors.secondaryLight}30` : colors.background
        }
      >
        {leftIcon && <IconContainer>{leftIcon}</IconContainer>}

        {multiline ? (
          <StyledTextarea
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            rows={rows || 4}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textColor={colors.text}
            placeholderColor={colors.subtext}
            {...props}
          />
        ) : (
          <StyledInput
            type={inputType}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            textColor={colors.text}
            placeholderColor={colors.subtext}
            {...props}
          />
        )}

        {isPassword && (
          <IconButton onClick={togglePasswordVisibility} type="button">
            <i
              className={`fas fa-${isPasswordVisible ? 'eye-slash' : 'eye'}`}
              style={{ color: colors.subtext, fontSize: '16px' }}
            />
          </IconButton>
        )}

        {customRightIcon && (
          <IconButton
            onClick={onRightIconPress}
            disabled={!onRightIconPress}
            type="button"
          >
            {customRightIcon}
          </IconButton>
        )}

        {rightIcon && <IconContainer>{rightIcon}</IconContainer>}
      </InputWrapper>

      {showError && <ErrorText color={colors.error}>{error}</ErrorText>}
    </InputContainer>
  );
};

// Estilos
const InputContainer = styled.div`
  margin-bottom: 16px;
  width: 100%;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.color};
`;

const InputWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  border: 1px solid ${props => props.borderColor};
  border-radius: 8px;
  background-color: ${props => props.backgroundColor};
  overflow: hidden;
`;

const baseInputStyles = `
  flex: 1;
  padding: 12px;
  font-size: 14px;
  border: none;
  outline: none;
  background-color: transparent;
  font-family: inherit;
  
  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const StyledInput = styled.input`
  ${baseInputStyles}
  color: ${props => props.textColor};

  &::placeholder {
    color: ${props => props.placeholderColor};
  }
`;

const StyledTextarea = styled.textarea`
  ${baseInputStyles}
  color: ${props => props.textColor};
  min-height: 100px;
  resize: vertical;

  &::placeholder {
    color: ${props => props.placeholderColor};
  }
`;

const IconContainer = styled.div`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const IconButton = styled.button`
  padding: 10px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: none;
  border: none;
  cursor: pointer;

  &:disabled {
    cursor: default;
    opacity: 0.5;
  }

  &:focus {
    outline: none;
  }
`;

const ErrorText = styled.p`
  margin-top: 4px;
  font-size: 12px;
  color: ${props => props.color};
`;

export default Input;
