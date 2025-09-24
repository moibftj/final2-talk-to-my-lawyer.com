import React, { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import {
  Scale,
  Shield,
  Mail,
  Lock,
  ArrowLeft,
  UserCheck,
  Briefcase,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  Star,
  Users,
  FileText
} from 'lucide-react';

type View = 'login' | 'signup' | 'forgot_password';

// Modern form components with enhanced styling
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => (
  <label
    className={`block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 ${className}`}
    {...props}
  />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement> & {
  icon?: React.ReactNode;
  isValid?: boolean;
  hasError?: boolean;
}> = ({
  className,
  icon,
  isValid,
  hasError,
  ...props
}) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500">
        {icon}
      </div>
    )}
    <input
      className={`
        w-full h-12 rounded-xl border-2 bg-white dark:bg-gray-800
        ${icon ? 'pl-11' : 'pl-4'} pr-12 py-3.5 text-sm font-medium
        text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400
        transition-all duration-300 ease-in-out
        ${hasError
          ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30'
          : isValid
            ? 'border-green-300 dark:border-green-600 focus:border-green-500 focus:ring-2 focus:ring-green-200 dark:focus:ring-green-900/30'
            : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
        }
        hover:border-gray-300 dark:hover:border-gray-600
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    />
    {(isValid || hasError) && (
      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
        {isValid && <CheckCircle className="w-5 h-5 text-green-500" />}
        {hasError && <AlertCircle className="w-5 h-5 text-red-500" />}
      </div>
    )}
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & {
  icon?: React.ReactNode;
}> = ({
  className,
  icon,
  children,
  ...props
}) => (
  <div className="relative">
    {icon && (
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 z-10">
        {icon}
      </div>
    )}
    <select
      className={`
        w-full h-12 rounded-xl border-2 bg-white dark:bg-gray-800
        ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 text-sm font-medium
        text-gray-900 dark:text-gray-100
        border-gray-200 dark:border-gray-700
        focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30
        hover:border-gray-300 dark:hover:border-gray-600
        transition-all duration-300 ease-in-out
        appearance-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </select>
    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m19 9-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const FeatureCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
}> = ({ icon, title, description }) => (
  <motion.div
    whileHover={{ scale: 1.02 }}
    className="p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50"
  >
    <div className="flex items-start gap-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{title}</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  </motion.div>
);

interface AuthPageProps {
  initialView?: 'login' | 'signup';
  onBackToLanding?: () => void;
}

export const AuthPageModern: React.FC<AuthPageProps> = ({
  initialView = 'login',
  onBackToLanding,
}) => {
  const [view, setView] = useState<View>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
          'Please Check Email For Verification Link',
          "We've sent a verification link to your email address. Please check your inbox and click the link to activate your account."
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
    setShowPassword(false);
  };

  const getViewTitle = () => {
    switch (view) {
      case 'login':
        return 'Welcome Back';
      case 'signup':
        return 'Create Your Account';
      case 'forgot_password':
        return 'Reset Password';
      default:
        return 'Authentication';
    }
  };

  const getViewDescription = () => {
    switch (view) {
      case 'login':
        return 'Sign in to access your legal dashboard and manage your letters.';
      case 'signup':
        return 'Join thousands of users who trust us with their legal document needs.';
      case 'forgot_password':
        return 'Enter your email address and we\'ll send you a secure reset link.';
      default:
        return '';
    }
  };

  const isFormValid = () => {
    if (view === 'forgot_password') {
      return email && !emailError;
    }
    return email && password && !emailError && password.length >= 6;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.15)_1px,transparent_0)] [background-size:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.1)_1px,transparent_0)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur-3xl" />

      {/* Back to Landing Button */}
      {onBackToLanding && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="absolute top-6 left-6 z-20"
        >
          <button
            onClick={onBackToLanding}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-lg border border-gray-200/50 dark:border-gray-700/50 transition-all duration-200 hover:shadow-md hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </button>
        </motion.div>
      )}

      <div className="relative min-h-screen flex">
        {/* Left Side - Branding and Features */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-lg"
          >
            {/* Logo and Branding */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-lg">
                <Scale className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Talk to My Lawyer
                </h1>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Professional Legal Document Services
                </p>
              </div>
            </div>

            {/* Value Proposition */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Streamline Your Legal Documentation
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate professional legal letters with AI assistance, track their progress,
                and manage all your legal documents in one secure platform.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <FeatureCard
                icon={<FileText className="w-4 h-4 text-blue-600" />}
                title="AI-Powered Letter Generation"
                description="Create professional legal letters using advanced AI that understands legal requirements and formatting."
              />
              <FeatureCard
                icon={<Shield className="w-4 h-4 text-green-600" />}
                title="Secure & Confidential"
                description="Your legal documents are protected with enterprise-grade security and client-attorney privilege."
              />
              <FeatureCard
                icon={<Users className="w-4 h-4 text-purple-600" />}
                title="Expert Review Process"
                description="All documents undergo review by qualified legal professionals before delivery."
              />
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 flex items-center gap-6 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="font-medium">4.9/5 Rating</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>10,000+ Users</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="flex-1 lg:w-1/2 flex flex-col justify-center px-6 sm:px-8 lg:px-12">
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md mx-auto"
          >
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
                  <Scale className="w-7 h-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                  Talk to My Lawyer
                </h1>
              </div>
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-green-500" />
                  <span>Secure</span>
                </div>
                <div className="flex items-center gap-1">
                  <Scale className="w-3 h-3 text-blue-500" />
                  <span>Professional</span>
                </div>
              </div>
            </div>

            {/* Auth Card */}
            <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-white/20 dark:border-gray-700/20 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5">
              <CardHeader className="text-center pb-6">
                <motion.div
                  key={view}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {getViewTitle()}
                  </CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                    {getViewDescription()}
                  </CardDescription>
                </motion.div>
              </CardHeader>

              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 px-6">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={view}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {/* Email Field */}
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="your.email@example.com"
                          required
                          value={email}
                          onChange={handleEmailChange}
                          icon={<Mail className="w-4 h-4" />}
                          isValid={email && !emailError}
                          hasError={!!emailError}
                        />
                        {emailError && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                          >
                            <AlertCircle className="w-3 h-3" />
                            {emailError}
                          </motion.p>
                        )}
                      </div>

                      {/* Password Field (for login and signup) */}
                      {view !== 'forgot_password' && (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label htmlFor="password">Password</Label>
                            {view === 'login' && (
                              <button
                                type="button"
                                onClick={() => switchView('forgot_password')}
                                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                              >
                                Forgot Password?
                              </button>
                            )}
                          </div>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              required
                              minLength={6}
                              placeholder="Enter your password"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              icon={<Lock className="w-4 h-4" />}
                              isValid={password.length >= 6}
                              hasError={password.length > 0 && password.length < 6}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {password.length > 0 && password.length < 6 && (
                            <motion.p
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1"
                            >
                              <AlertCircle className="w-3 h-3" />
                              Password must be at least 6 characters
                            </motion.p>
                          )}
                        </div>
                      )}

                      {/* Role and Affiliate Code (for signup only) */}
                      {view === 'signup' && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="role">Account Type</Label>
                            <Select
                              id="role"
                              value={role}
                              onChange={e => setRole(e.target.value as UserRole)}
                              icon={role === 'user' ? <UserCheck className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                            >
                              <option value="user">Individual User - Create and manage legal letters</option>
                              <option value="employee">Employee/Affiliate - Earn commissions from referrals</option>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="affiliateCode">
                              Referral Code <span className="text-gray-400 font-normal">(Optional)</span>
                            </Label>
                            <Input
                              id="affiliateCode"
                              type="text"
                              placeholder="Enter referral code if you have one"
                              value={affiliateCode}
                              onChange={e => setAffiliateCode(e.target.value)}
                              icon={<UserCheck className="w-4 h-4" />}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Have a referral code? Enter it to give credit to the person who referred you.
                            </p>
                          </div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </CardContent>

                <CardFooter className="flex flex-col gap-4 px-6 pt-6">
                  {/* Error and Success Messages */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
                      >
                        <p className="text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {error}
                        </p>
                      </motion.div>
                    )}

                    {successMessage && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="w-full p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg"
                      >
                        <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 flex-shrink-0" />
                          {successMessage}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Submit Button */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full"
                  >
                    {loading ? (
                      <div className="w-full h-12 bg-gray-100 dark:bg-gray-700 rounded-xl flex items-center justify-center">
                        <Loader2 className="w-5 h-5 animate-spin text-gray-600 dark:text-gray-400" />
                        <span className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-400">
                          Processing...
                        </span>
                      </div>
                    ) : (
                      <ShimmerButton
                        type="submit"
                        className="w-full h-12 text-base font-semibold"
                        disabled={!isFormValid()}
                      >
                        {view === 'login' && 'Sign In to Dashboard'}
                        {view === 'signup' && 'Create My Account'}
                        {view === 'forgot_password' && 'Send Reset Link'}
                      </ShimmerButton>
                    )}
                  </motion.div>

                  {/* View Switcher */}
                  <div className="text-center space-y-2">
                    {view === 'forgot_password' ? (
                      <button
                        type="button"
                        onClick={() => switchView('login')}
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors duration-200"
                      >
                        Remember your password? Sign In
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
                        className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white font-medium transition-colors duration-200"
                      >
                        {view === 'login'
                          ? "Don't have an account? Create one"
                          : 'Already have an account? Sign In'}
                      </button>
                    )}
                  </div>
                </CardFooter>
              </form>
            </Card>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400"
            >
              <p>© 2024 Talk to My Lawyer. Secure, professional legal document services.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};