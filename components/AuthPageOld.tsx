import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from './Card';
import { ShinyButton } from './magicui/shiny-button';
import { ShimmerButton } from './magicui/shimmer-button';
import { IconLogo } from '../constants';
import type { UserRole } from '../types';
import { isValidEmail } from '../lib/utils';
import { Tooltip } from './Tooltip';
import { CompletionBanner, useBanners } from './CompletionBanner';

type View = 'login' | 'signup' | 'forgot_password';

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => (
  <label
    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
    {...props}
  />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => (
  <input
    className={`mt-1 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  children,
  ...props
}) => (
  <select
    className={`mt-1 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<View>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [affiliateCode, setAffiliateCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { login, signup, requestPasswordReset } = useAuth();
  const { banners, showSuccess, showError, showInfo } = useBanners();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError('Please enter a valid email address.');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (emailError) return;

    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (view === 'login') {
      showInfo('Signing In', 'Verifying your credentials...');
    } else if (view === 'signup') {
      showInfo('Creating Account', 'Setting up your new account...');
    } else {
      showInfo(
        'Sending Reset Link',
        'Processing your password reset request...'
      );
    }

    try {
      if (view === 'login') {
        await login(email, password);
        showSuccess('Welcome Back!', 'Successfully signed in to your account.');
      } else if (view === 'signup') {
        await signup(email, password, role, affiliateCode);
        showSuccess(
          'Account Created!',
          'Welcome to Law Letter AI. You can now start creating letters.'
        );
      } else {
        // forgot_password
        await requestPasswordReset(email);
        setSuccessMessage(
          'If an account with that email exists, a password reset link has been sent.'
        );
        showSuccess(
          'Reset Link Sent',
          'Check your email for password reset instructions.'
        );
      }
    } catch (err: any) {
      setError(err.message);
      showError(
        'Authentication Failed',
        err.message || 'Please check your credentials and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchView = (newView: View) => {
    setView(newView);
    setEmail('');
    setPassword('');
    setError(null);
    setSuccessMessage(null);
    setEmailError(null);
  };

  const renderContent = () => {
    if (view === 'forgot_password') {
      return (
        <>
          <CardHeader>
            <CardTitle className='text-2xl'>Reset Password</CardTitle>
            <CardDescription>
              Enter your email to receive a password reset link.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className='space-y-4'>
              <div className='space-y-1'>
                <Label htmlFor='email'>Email Address</Label>
                <Tooltip text='Enter the email address associated with your account'>
                  <Input
                    id='email'
                    type='email'
                    placeholder='you@example.com'
                    required
                    value={email}
                    onChange={handleEmailChange}
                  />
                </Tooltip>
                {emailError && (
                  <p className='text-xs text-red-500 mt-1'>{emailError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter className='flex flex-col gap-4'>
              {error && (
                <p className='text-sm text-red-500 text-center'>{error}</p>
              )}
              {successMessage && (
                <p className='text-sm text-green-600 dark:text-green-500 text-center'>
                  {successMessage}
                </p>
              )}

              {loading ? (
                <Tooltip text='Processing your password reset request...'>
                  <ShinyButton disabled className='w-full'>
                    Processing...
                  </ShinyButton>
                </Tooltip>
              ) : (
                <Tooltip text='Click to receive a password reset link via email'>
                  <ShimmerButton
                    type='submit'
                    className='w-full'
                    disabled={!email || !!emailError}
                  >
                    Send Reset Link
                  </ShimmerButton>
                </Tooltip>
              )}

              <Tooltip text='Return to the sign in page'>
                <button
                  type='button'
                  onClick={() => switchView('login')}
                  className='text-sm text-blue-600 hover:underline dark:text-blue-400'
                >
                  Back to Sign In
                </button>
              </Tooltip>
            </CardFooter>
          </form>
        </>
      );
    }

    return (
      <>
        <CardHeader>
          <CardTitle className='text-2xl'>
            {view === 'login' ? 'Welcome Back' : 'Create an Account'}
          </CardTitle>
          <CardDescription>
            {view === 'login'
              ? 'Sign in to access your dashboard.'
              : 'Enter your details to get started.'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-4'>
            <div className='space-y-1'>
              <Label htmlFor='email'>Email Address</Label>
              <Tooltip text='Enter your email address for account access'>
                <Input
                  id='email'
                  type='email'
                  placeholder='you@example.com'
                  required
                  value={email}
                  onChange={handleEmailChange}
                />
              </Tooltip>
              {emailError && (
                <p className='text-xs text-red-500 mt-1'>{emailError}</p>
              )}
            </div>
            <div className='space-y-1'>
              <div className='flex justify-between items-baseline'>
                <Label htmlFor='password'>Password</Label>
                {view === 'login' && (
                  <Tooltip text='Click to reset your password via email'>
                    <button
                      type='button'
                      onClick={() => switchView('forgot_password')}
                      className='text-xs text-blue-600 hover:underline dark:text-blue-400'
                    >
                      Forgot Password?
                    </button>
                  </Tooltip>
                )}
              </div>
              <Tooltip text='Enter your password (minimum 6 characters)'>
                <Input
                  id='password'
                  type='password'
                  required
                  minLength={6}
                  placeholder='••••••••'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </Tooltip>
            </div>
            {view === 'signup' && (
              <>
                <div className='space-y-1'>
                  <Label htmlFor='role'>I am a...</Label>
                  <Tooltip text='Select your role - Users create letters, Employees track referrals and earn commissions'>
                    <Select
                      id='role'
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                    >
                      <option value='user'>User</option>
                      <option value='employee'>Employee</option>
                    </Select>
                  </Tooltip>
                </div>
                <div className='space-y-1'>
                  <Label htmlFor='affiliateCode'>
                    Affiliate Code (Optional)
                  </Label>
                  <Tooltip text="Enter an employee's affiliate code to give them credit for your referral">
                    <Input
                      id='affiliateCode'
                      type='text'
                      placeholder='e.g., EMP123XYZ'
                      value={affiliateCode}
                      onChange={e => setAffiliateCode(e.target.value)}
                    />
                  </Tooltip>
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className='flex flex-col gap-4'>
            {error && (
              <p className='text-sm text-red-500 text-center'>{error}</p>
            )}

            {loading ? (
              <Tooltip text='Processing your authentication...'>
                <ShinyButton disabled className='w-full'>
                  Processing...
                </ShinyButton>
              </Tooltip>
            ) : (
              <Tooltip
                text={
                  view === 'login'
                    ? 'Click to sign in to your account'
                    : 'Click to create your new account'
                }
              >
                <ShimmerButton
                  type='submit'
                  className='w-full'
                  disabled={!email || !password || !!emailError}
                >
                  {view === 'login' ? 'Sign In' : 'Sign Up'}
                </ShimmerButton>
              </Tooltip>
            )}

            <Tooltip
              text={
                view === 'login'
                  ? 'Switch to create a new account'
                  : 'Switch to sign in with existing account'
              }
            >
              <button
                type='button'
                onClick={() =>
                  switchView(view === 'login' ? 'signup' : 'login')
                }
                className='text-sm text-blue-600 hover:underline dark:text-blue-400'
              >
                {view === 'login'
                  ? 'Need an account? Sign Up'
                  : 'Already have an account? Sign In'}
              </button>
            </Tooltip>
          </CardFooter>
        </form>
      </>
    );
  };

  return (
    <div className='min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4'>
      <div className='flex items-center gap-3 mb-8'>
        <IconLogo className='h-10 w-10 text-blue-600 dark:text-blue-400' />
        <span className='text-3xl font-bold text-gray-900 dark:text-white'>
          Law Letter AI
        </span>
      </div>
      <Card className='w-full max-w-md'>{renderContent()}</Card>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};
