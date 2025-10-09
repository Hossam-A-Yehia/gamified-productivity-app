import React from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

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
  const { googleAuth } = useAuth();
  
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`flex justify-center ${className}`}
      >
        <div className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-center">
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex justify-center ${className}`}
    >
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        text={text}
        theme="outline"
        size="large"
        width="100%"
        logo_alignment="left"
      />
    </motion.div>
  );
};

export default GoogleSignIn;
