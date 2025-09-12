
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { IconLogo, IconUser } from '../constants';

interface HeaderProps {
    userDashboardView?: 'dashboard' | 'new_letter_form';
    setUserDashboardView?: (view: 'dashboard' | 'new_letter_form') => void;
}

export const Header: React.FC<HeaderProps> = ({ userDashboardView, setUserDashboardView }) => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="relative z-20 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-3 min-w-0">
            <IconLogo className="h-8 w-8 text-blue-400 flex-shrink-0" />
            <span className="text-xl sm:text-2xl font-bold text-white truncate">Law Letter AI</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {user && user.role === 'user' && userDashboardView === 'new_letter_form' && setUserDashboardView && (
              <button 
                onClick={() => setUserDashboardView('dashboard')}
                className="text-sm font-medium text-gray-300 hover:text-white transition-colors hidden sm:block px-4 py-2 rounded-md hover:bg-white/10"
              >
                My Letters
              </button>
            )}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  onBlur={() => setTimeout(() => setIsMenuOpen(false), 200)} // Delay allows click inside dropdown
                  className="p-2 rounded-full hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500"
                  aria-label="User Menu"
                  aria-haspopup="true"
                  aria-expanded={isMenuOpen}
                >
                  <IconUser className="h-6 w-6 text-gray-300" />
                </button>
                {isMenuOpen && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-md shadow-lg border border-slate-200 dark:border-slate-700 z-50"
                    role="menu"
                    aria-orientation="vertical"
                  >
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                        <p className="font-semibold text-sm text-gray-900 dark:text-white truncate" title={user.email}>{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        role="menuitem"
                    >
                        Log Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};