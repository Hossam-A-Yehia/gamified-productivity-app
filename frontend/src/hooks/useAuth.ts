import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
import { showToast } from '../utils/toast';
import type { User, RegisterRequest, LoginRequest } from '../types/auth';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  register: (data: RegisterRequest) => Promise<void>;
  login: (data: LoginRequest) => Promise<void>;
  googleAuth: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
  isRegistering: boolean;
  isLoggingIn: boolean;
  isLoggingOut: boolean;
  isGoogleAuthenticating: boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const {
    data: user,
    isLoading,
    error: profileError,
  } = useQuery({
    queryKey: ['auth', 'profile'],
    queryFn: authService.getProfile,
    enabled: authService.isAuthenticated(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setError(null);
      showToast.success('Registration Successful! 🎉', 'Welcome to your productivity journey!');
    },
    onError: (error: Error) => {
      setError(error.message);
      showToast.error('Registration Failed', error.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setError(null);
      if (response.data?.user) {
        showToast.loginSuccess(response.data.user.name);
      } else {
        showToast.success('Welcome back! 👋', 'Successfully logged in');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      showToast.error('Login Failed', error.message);
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: authService.googleAuth,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setError(null);
      if (response.data?.user) {
        showToast.success('Google Sign-in Successful! 🚀', `Welcome, ${response.data.user.name}!`);
      } else {
        showToast.success('Google Sign-in Successful! 🚀', 'Successfully authenticated with Google');
      }
    },
    onError: (error: Error) => {
      setError(error.message);
      showToast.error('Google Sign-in Failed', error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      setError(null);
      showToast.logoutSuccess();
    },
    onError: (error: Error) => {
      setError(error.message);
      showToast.error('Logout Failed', error.message);
    },
  });

  const register = useCallback(
    async (data: RegisterRequest) => {
      await registerMutation.mutateAsync(data);
    },
    [registerMutation]
  );

  const login = useCallback(
    async (data: LoginRequest) => {
      await loginMutation.mutateAsync(data);
    },
    [loginMutation]
  );

  const googleAuth = useCallback(
    async (token: string) => {
      await googleAuthMutation.mutateAsync(token);
    },
    [googleAuthMutation]
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  useEffect(() => {
    if (profileError) {
      setError(profileError.message);
    }
  }, [profileError]);

  return {
    user: user || null,
    isAuthenticated: authService.isAuthenticated() && !!user,
    isLoading,
    error,
    register,
    login,
    googleAuth,
    logout,
    clearError,
    isRegistering: registerMutation.isPending,
    isLoggingIn: loginMutation.isPending,
    isGoogleAuthenticating: googleAuthMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
