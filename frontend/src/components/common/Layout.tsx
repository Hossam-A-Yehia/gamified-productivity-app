import React from 'react';
import { Navigation } from './Navigation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navigation />
            <div className="lg:pl-72">
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
