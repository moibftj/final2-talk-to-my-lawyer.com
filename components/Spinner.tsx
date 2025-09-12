
import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-950">
    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);
