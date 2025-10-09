import React, { useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import './GoogleSignIn.css';

interface GoogleSignInProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
  className?: string;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  onSuccess,
  onError,
  text = 'signin_with',
  className = ''
}) => {
  const { googleAuth, isGoogleAuthenticating } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`w-full ${className}`}
      >
        <div className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Google Sign-In not configured
          </p>
        </div>
      </motion.div>
    );
  }

  const handleSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error('No credential received from Google');
      }

      await googleAuth(credentialResponse.credential);
      onSuccess?.();
    } catch (error: any) {
      onError?.(error.message || 'Google authentication failed');
    }
  };

  const handleError = () => {
    onError?.('Google authentication failed');
  };

  const buttonText = {
    signin_with: 'Continue with Google',
    signup_with: 'Sign up with Google',
    continue_with: 'Continue with Google'
  }[text];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`w-full ${className}`}
    >
      <div className="google-signin-wrapper relative w-full">
        <motion.div
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="custom-google-button relative overflow-hidden bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border-2 border-gray-200 dark:border-gray-600 rounded-xl shadow-lg hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-500 transition-all duration-300 group"
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 0.1 : 0 }}
            className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 pointer-events-none"
          />
          <div className="relative flex items-center justify-center gap-3 px-6 py-4">
            {isGoogleAuthenticating ? (
              <div className="loading-spinner w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full" />
            ) : (
              <motion.svg 
                className="google-logo w-5 h-5 flex-shrink-0" 
                viewBox="0 0 24 24"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </motion.svg>
            )}
            
            <motion.span 
              className="text-transition text-base font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors duration-200"
              whileHover={{ x: 2 }}
            >
              {isGoogleAuthenticating ? 'Signing in...' : buttonText}
            </motion.span>

            {!isGoogleAuthenticating && (
              <svg
                className="arrow-slide w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </div>

          <motion.div
            className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100 pointer-events-none"
            animate={isHovered ? { x: ['-100%', '100%'] } : {}}
            transition={{ duration: 0.8, ease: "easeInOut" }}
          />

          <div className="absolute inset-0 opacity-0">
            <GoogleLogin
              onSuccess={handleSuccess}
              onError={handleError}
              useOneTap={false}
              auto_select={false}
              width="100%"
              size="large"
            />
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GoogleSignIn;
