import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Header } from './components/Header';
import { Spotlight } from './components/magicui/spotlight';
import { SparklesText } from './components/magicui/sparkles-text';
import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './components/AuthPage';
import { LandingPage } from './components/LandingPage';
import { Spinner } from './components/Spinner';

// Lazy load role-specific dashboards for code splitting
const UserDashboard = lazy(() =>
  import('./components/Dashboard').then(module => ({
    default: module.UserDashboard,
  }))
);
const EmployeeDashboard = lazy(() =>
  import('./components/EmployeeDashboard').then(module => ({
    default: module.EmployeeDashboard,
  }))
);
const AdminDashboard = lazy(() =>
  import('./components/AdminDashboard').then(module => ({
    default: module.AdminDashboard,
  }))
);
const ResetPasswordPage = lazy(() =>
  import('./components/ResetPasswordPage').then(module => ({
    default: module.ResetPasswordPage,
  }))
);

type UserDashboardView = 'dashboard' | 'new_letter_form' | 'subscription';
type AppView = 'landing' | 'auth' | 'dashboard';
type AuthView = 'login' | 'signup';

const App: React.FC = () => {
  const { user, isLoading, authEvent } = useAuth();
  const [userDashboardView, setUserDashboardView] =
    useState<UserDashboardView>('dashboard');
  const [appView, setAppView] = useState<AppView>('landing');
  const [authView, setAuthView] = useState<AuthView>('signup');

  if (isLoading) {
    return <Spinner />;
  }

  // Supabase sends a PASSWORD_RECOVERY event when the user clicks the reset link.
  // We use this to show the password update form.
  if (authEvent === 'PASSWORD_RECOVERY') {
    return (
      <Suspense fallback={<Spinner />}>
        <ResetPasswordPage />
      </Suspense>
    );
  }

  // Handle navigation between views
  const handleGetStarted = () => {
    setAuthView('signup');
    setAppView('auth');
  };

  const handleLogin = () => {
    setAuthView('login');
    setAppView('auth');
  };

  const handleBackToLanding = () => {
    setAppView('landing');
  };

  // Show landing page if no user and not in auth view
  if (!user) {
    if (appView === 'auth') {
      return (
        <AuthPage
          initialView={authView}
          onBackToLanding={handleBackToLanding}
        />
      );
    }
    return (
      <LandingPage onGetStarted={handleGetStarted} onLogin={handleLogin} />
    );
  }

  const renderDashboard = () => {
    return (
      <Suspense fallback={<Spinner />}>
        {(() => {
          switch (user.role) {
            case 'admin':
              return <AdminDashboard />;
            case 'employee':
              return <EmployeeDashboard />;
            case 'user':
            default:
              return (
                <UserDashboard
                  currentView={userDashboardView}
                  setCurrentView={setUserDashboardView}
                />
              );
          }
        })()}
      </Suspense>
    );
  };

  const getTitle = () => {
    switch (user.role) {
      case 'admin':
        return 'Admin Panel';
      case 'employee':
        return 'Affiliate Dashboard';
      case 'user':
      default:
        return 'Your Legal Dashboard';
    }
  };

  const getDescription = () => {
    switch (user.role) {
      case 'admin':
        return 'Manage users, letters, and system settings.';
      case 'employee':
        return 'Track your referrals and earnings.';
      case 'user':
      default:
        return 'Generate, manage, and track your legal letters with AI.';
    }
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-gray-950 text-gray-800 dark:text-gray-200 font-sans'>
      <Spotlight className='relative flex h-96 w-full flex-col items-center justify-center overflow-hidden rounded-b-2xl border-b border-slate-800 bg-gradient-to-br from-gray-950 to-slate-900'>
        <Header
          userDashboardView={
            user.role === 'user' ? userDashboardView : undefined
          }
          setUserDashboardView={
            user.role === 'user' ? setUserDashboardView : undefined
          }
          onBackToLanding={handleBackToLanding}
        />
        <div className='text-center absolute bottom-12 z-10 p-4'>
          <h1 className='text-4xl font-bold tracking-tighter text-gray-100 sm:text-5xl'>
            <SparklesText>{getTitle()}</SparklesText>
          </h1>
          <p className='mt-4 text-lg text-gray-400'>{getDescription()}</p>
        </div>
      </Spotlight>

      <main className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-20'>
        {renderDashboard()}
      </main>
    </div>
  );
};

export default App;
