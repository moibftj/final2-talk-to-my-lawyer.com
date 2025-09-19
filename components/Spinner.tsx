import React from 'react';
import { LoaderOne } from './ui/loader-one';

export const Spinner: React.FC = () => (
  <div className='flex items-center justify-center min-h-screen bg-slate-50 dark:bg-gray-950'>
    <div className='flex flex-col items-center space-y-4'>
      <LoaderOne size='lg' />
      <p className='text-sm text-gray-600 dark:text-gray-400 animate-pulse'>
        Loading...
      </p>
    </div>
  </div>
);
