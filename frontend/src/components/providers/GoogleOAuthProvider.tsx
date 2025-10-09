import React from 'react';
import { GoogleOAuthProvider as GoogleProvider } from '@react-oauth/google';

interface GoogleOAuthProviderProps {
  children: React.ReactNode;
}

const GoogleOAuthProvider: React.FC<GoogleOAuthProviderProps> = ({ children }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  if (!clientId) {
    return <>{children}</>;
  }

  try {
    return (
      <GoogleProvider clientId={clientId}>
        {children}
      </GoogleProvider>
    );
  } catch (error) {
    return <>{children}</>;
  }
};

export default GoogleOAuthProvider;
