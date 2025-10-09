import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { authService } from '../services/authService';
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
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const googleAuthMutation = useMutation({
    mutationFn: authService.googleAuth,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      queryClient.clear();
      setError(null);
    },
    onError: (error: Error) => {
      setError(error.message);
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
