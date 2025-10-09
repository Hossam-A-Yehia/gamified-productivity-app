import * as Yup from 'yup';

export interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export const validationSchema = Yup.object({
  email: Yup.string()
    .email('Please enter a valid email address')
    .required('Email is required'),
  password: Yup.string()
    .min(1, 'Password is required')
    .required('Password is required'),
  rememberMe: Yup.boolean()
});

export const initialValues: FormData = {
  email: '',
  password: '',
  rememberMe: false
};

export const createHandleSubmit = (login: any) => {
  return async (values: FormData) => {
    try {
      await login({ email: values.email, password: values.password });
      if (values.rememberMe) {
        localStorage.setItem('rememberMe', 'true');
      }
    } catch (err) {
    }
  };
};