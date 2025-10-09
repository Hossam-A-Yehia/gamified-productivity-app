import * as Yup from 'yup';
import { authService } from '../../../services/authService';

export const validationSchema = Yup.object({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/, 'Password must contain at least one symbol')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export const initialValues = {
  password: '',
  confirmPassword: '',
};

export type ResetPasswordFormValues = typeof initialValues;

export const createHandleSubmit = (
  token: string,
  onSuccess: (message: string) => void,
  onError: (error: string) => void
) => {
  return async (values: ResetPasswordFormValues) => {
    try {
      const result = await authService.resetPassword(token, values.password, values.confirmPassword);
      onSuccess(result.message);
    } catch (error: any) {
      onError(error.message || 'Failed to reset password');
    }
  };
};
