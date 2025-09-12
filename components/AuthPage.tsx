import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';
import { ShinyButton } from './magicui/shiny-button';
import { ShimmerButton } from './magicui/shimmer-button';
import { IconLogo } from '../constants';
import type { UserRole } from '../types';
import { isValidEmail } from '../lib/utils';

type View = 'login' | 'signup' | 'forgot_password';

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props} />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={`mt-1 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
    <select className={`mt-1 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
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

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    if (newEmail && !isValidEmail(newEmail)) {
        setEmailError("Please enter a valid email address.");
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
    try {
      if (view === 'login') {
        await login(email, password);
      } else if (view === 'signup') {
        await signup(email, password, role, affiliateCode);
      } else { // forgot_password
        await requestPasswordReset(email);
        setSuccessMessage("If an account with that email exists, a password reset link has been sent.");
      }
    } catch (err: any) {
      setError(err.message);
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
  }

  const renderContent = () => {
    if (view === 'forgot_password') {
        return (
            <>
                <CardHeader>
                    <CardTitle className="text-2xl">Reset Password</CardTitle>
                    <CardDescription>Enter your email to receive a password reset link.</CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4">
                        <div className="space-y-1">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="you@example.com"
                            required
                            value={email}
                            onChange={handleEmailChange}
                          />
                          {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                        {successMessage && <p className="text-sm text-green-600 dark:text-green-500 text-center">{successMessage}</p>}
                        
                        {loading ? (
                            <ShinyButton disabled className="w-full">Processing...</ShinyButton>
                        ) : (
                            <ShimmerButton type="submit" className="w-full" disabled={!email || !!emailError}>
                                Send Reset Link
                            </ShimmerButton>
                        )}

                        <button type="button" onClick={() => switchView('login')} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                            Back to Sign In
                        </button>
                    </CardFooter>
                </form>
            </>
        )
    }

    return (
        <>
            <CardHeader>
              <CardTitle className="text-2xl">{view === 'login' ? 'Welcome Back' : 'Create an Account'}</CardTitle>
              <CardDescription>
                {view === 'login' ? 'Sign in to access your dashboard.' : 'Enter your details to get started.'}
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    required
                    value={email}
                    onChange={handleEmailChange}
                  />
                  {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                </div>
                <div className="space-y-1">
                    <div className="flex justify-between items-baseline">
                        <Label htmlFor="password">Password</Label>
                        {view === 'login' && (
                            <button type="button" onClick={() => switchView('forgot_password')} className="text-xs text-blue-600 hover:underline dark:text-blue-400">Forgot Password?</button>
                        )}
                    </div>
                  <Input
                    id="password"
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {view === 'signup' && (
                  <>
                    <div className="space-y-1">
                      <Label htmlFor="role">I am a...</Label>
                      <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                          <option value="user">User</option>
                          <option value="employee">Employee</option>
                      </Select>
                    </div>
                     <div className="space-y-1">
                        <Label htmlFor="affiliateCode">Affiliate Code (Optional)</Label>
                        <Input 
                            id="affiliateCode"
                            type="text"
                            placeholder="e.g., EMP123XYZ"
                            value={affiliateCode}
                            onChange={(e) => setAffiliateCode(e.target.value)}
                        />
                    </div>
                  </>
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                {error && <p className="text-sm text-red-500 text-center">{error}</p>}
                
                {loading ? (
                    <ShinyButton disabled className="w-full">
                        Processing...
                    </ShinyButton>
                ) : (
                    <ShimmerButton type="submit" className="w-full" disabled={!email || !password || !!emailError}>
                        {view === 'login' ? 'Sign In' : 'Sign Up'}
                    </ShimmerButton>
                )}

                <button
                  type="button"
                  onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                  className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                >
                  {view === 'login' ? 'Need an account? Sign Up' : 'Already have an account? Sign In'}
                </button>
              </CardFooter>
            </form>
        </>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 flex flex-col items-center justify-center p-4">
      <div className="flex items-center gap-3 mb-8">
        <IconLogo className="h-10 w-10 text-blue-600 dark:text-blue-400" />
        <span className="text-3xl font-bold text-gray-900 dark:text-white">Law Letter AI</span>
      </div>
      <Card className="w-full max-w-md">
        {renderContent()}
      </Card>
    </div>
  );
};