import { apiService } from "./api";
import type {
  RegisterRequest,
  LoginRequest,
  AuthResponse,
  User,
} from "../types/auth";
import { cookieManager, COOKIE_NAMES } from "../utils/cookies";
import { validateRegistrationForm } from "../utils/validators";

class AuthService {
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const validation = validateRegistrationForm(data);
    if (!validation.isValid) {
      throw new Error(validation.errors[0]);
    }

    try {
      const response = await apiService.post<AuthResponse["data"]>(
        "/auth/register",
        data
      );
      if (response.data.data?.tokens) {
        AuthService.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Registration failed";
      throw new Error(errorMessage);
    }
  }

  static async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse["data"]>(
        "/auth/login",
        data
      );
      if (response.data.data?.tokens) {
        AuthService.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Login failed";
      throw new Error(errorMessage);
    }
  }

  static async logout(): Promise<void> {
    try {
      await apiService.post("/auth/logout");
    } catch (error) {
      console.warn("Logout request failed, but clearing local storage");
    } finally {
      AuthService.clearTokens();
    }
  }

  static async getProfile(): Promise<User> {
    try {
      const response = await apiService.get<{ user: User }>("/auth/profile");
      return response.data.data!.user;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Failed to get profile";
      throw new Error(errorMessage);
    }
  }

  static async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse["data"]>(
        "/auth/refresh",
        {
          refreshToken,
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || "Token refresh failed";
      throw new Error(errorMessage);
    }
  }

  static setTokens(accessToken: string, refreshToken: string): void {
    cookieManager.set(COOKIE_NAMES.ACCESS_TOKEN, accessToken, {
      expires: 1 / 96, 
      secure: true,
      sameSite: "lax",
    });

    cookieManager.set(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, {
      expires: 7,
      secure: true,
      sameSite: "lax",
    });
  }

  static getTokens(): { accessToken: string | null; refreshToken: string | null } {
    return {
      accessToken: cookieManager.get(COOKIE_NAMES.ACCESS_TOKEN),
      refreshToken: cookieManager.get(COOKIE_NAMES.REFRESH_TOKEN),
    };
  }

  static clearTokens(): void {
    cookieManager.clearAuth();
  }

  static isAuthenticated(): boolean {
    const { accessToken } = AuthService.getTokens();
    return !!accessToken;
  }
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!/\d/.test(password)) {
      errors.push("Password must contain at least one number");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
      errors.push("Password must contain at least one symbol");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post('/auth/forgot-password', { email });
      return {
        success: true,
        message: response.data.message || 'Password reset email sent successfully'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to send password reset email');
    }
  }

  static async verifyResetToken(token: string): Promise<{ isValid: boolean }> {
    try {
      await apiService.get(`/auth/verify-reset-token/${token}`);
      return { isValid: true };
    } catch (error: any) {
      return { isValid: false };
    }
  }

  static async resetPassword(token: string, password: string, confirmPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await apiService.post('/auth/reset-password', {
        token,
        password,
        confirmPassword
      });
      return {
        success: true,
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to reset password');
    }
  }

  static async googleAuth(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await apiService.post<AuthResponse["data"]>(
        "/auth/google",
        { token: googleToken }
      );

      if (response.data.data?.tokens) {
        AuthService.setTokens(
          response.data.data.tokens.accessToken,
          response.data.data.tokens.refreshToken
        );
      }

      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Google authentication failed");
    }
  }
}

export const authService = AuthService;
export default AuthService;
