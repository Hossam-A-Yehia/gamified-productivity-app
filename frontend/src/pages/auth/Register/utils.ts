import * as Yup from 'yup';

export interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const validationSchema = Yup.object({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters long')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/, 'Password must contain at least one symbol')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password')
});

export const initialValues: FormData = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
};

export const createHandleSubmit = (register: any, navigate: any, setShowSuccess: any) => {
  return async (values: FormData) => {
    try {
      await register(values);
      setShowSuccess(true);
      
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      // Error handling is done by the useAuth hook
    }
  };
};

export const calculatePasswordStrength = (password: string): number => {
  let strength = 0;
  if (password.length >= 8) strength += 20;
  if (/[a-z]/.test(password)) strength += 20;
  if (/[A-Z]/.test(password)) strength += 20;
  if (/\d/.test(password)) strength += 20;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) strength += 20;
  return strength;
};

export const getPasswordStrengthColor = (strength: number): 'error' | 'warning' | 'success' => {
  if (strength < 40) return 'error';
  if (strength < 80) return 'warning';
  return 'success';
};

export const getPasswordStrengthText = (strength: number): string => {
  if (strength < 40) return 'Weak';
  if (strength < 80) return 'Medium';
  return 'Strong';
};
