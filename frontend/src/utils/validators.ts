import { VALIDATION_RULES } from './constants';

import { VALIDATION_MESSAGES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export const validateEmail = (email: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!email) {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePassword = (password: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!password) {
    errors.push('Password is required');
    return { isValid: false, errors };
  }
  
  if (password.length < VALIDATION_RULES.PASSWORD_MIN_LENGTH) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_MIN_LENGTH);
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_LOWERCASE);
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_UPPERCASE);
  }
  
  if (!/\d/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_NUMBER);
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
    errors.push(VALIDATION_MESSAGES.PASSWORD_SYMBOL);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateName = (name: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!name) {
    errors.push('Name is required');
  } else if (name.trim().length < VALIDATION_RULES.NAME_MIN_LENGTH) {
    errors.push(`Name must be at least ${VALIDATION_RULES.NAME_MIN_LENGTH} characters long`);
  } else if (name.trim().length > VALIDATION_RULES.NAME_MAX_LENGTH) {
    errors.push(`Name cannot exceed ${VALIDATION_RULES.NAME_MAX_LENGTH} characters`);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validatePasswordConfirmation = (password: string, confirmPassword: string): ValidationResult => {
  const errors: string[] = [];
  
  if (!confirmPassword) {
    errors.push('Please confirm your password');
  } else if (password !== confirmPassword) {
    errors.push('Passwords do not match');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateRegistrationForm = (data: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}): ValidationResult => {
  const nameValidation = validateName(data.name);
  const emailValidation = validateEmail(data.email);
  const passwordValidation = validatePassword(data.password);
  const confirmPasswordValidation = validatePasswordConfirmation(data.password, data.confirmPassword);
  
  const allErrors = [
    ...nameValidation.errors,
    ...emailValidation.errors,
    ...passwordValidation.errors,
    ...confirmPasswordValidation.errors,
  ];
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
  };
};
