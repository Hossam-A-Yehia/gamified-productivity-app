import * as Yup from 'yup';
import { authService } from '../../../services/authService';

export const validationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
});

export const initialValues = {
  email: '',
};

export type ForgotPasswordFormValues = typeof initialValues;

export const createHandleSubmit = (
  onSuccess: (message: string) => void,
  onError: (error: string) => void
) => {
  return async (values: ForgotPasswordFormValues) => {
    try {
      const result = await authService.forgotPassword(values.email);
      onSuccess(result.message);
    } catch (error: any) {
      onError(error.message || 'Failed to send password reset email');
    }
  };
};
