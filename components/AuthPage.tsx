import React, { useState, FormEvent } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShinyButton } from './magicui/shiny-button';
import { ShimmerButton } from './magicui/shimmer-button';
import { IconLogo } from '../constants';
import type { UserRole } from '../types';
import { isValidEmail } from '../lib/utils';
import { Tooltip } from './Tooltip';
import { CompletionBanner, useBanners } from './CompletionBanner';
import { BlurFade } from './magicui/blur-fade';
import { SparklesText } from './magicui/sparkles-text';
import { NeonGradientCard } from './magicui/neon-gradient-card';
import { RetroGrid } from './magicui/retro-grid';
import { motion, AnimatePresence } from 'framer-motion';

type View = 'login' | 'signup' | 'forgot_password';

// Enhanced responsive form components
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }> = ({ className, required, children, ...props }) => (
  <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ${className}`} {...props}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const InputWithIcon: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { 
  icon: React.ReactNode; 
  error?: string;
}> = ({ className, icon, error, ...props }) => (
  <div className="relative">
    <div className="relative">
      <input 
        className={`w-full h-12 sm:h-14 pl-12 pr-4 rounded-xl border-2 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 hover:bg-white/80 dark:hover:bg-slate-800/80 ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:bg-red-50/50 dark:focus:bg-red-900/20' 
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800'
        } ${className}`} 
        {...props} 
      />
      <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
        error ? 'text-red-500' : 'text-slate-400'
      }`}>
        {icon}
      </div>
    </div>
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { 
  icon: React.ReactNode;
}> = ({ className, children, icon, ...props }) => (
  <div className="relative">
    <select 
      className={`w-full h-12 sm:h-14 pl-12 pr-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/80 appearance-none ${className}`} 
      {...props}
    >
      {children}
    </select>
    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      {icon}
    </div>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

// Icon components
const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
  </svg>
);

const PasswordIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const CodeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9l-3 3 3 3m8-6l3 3-3 3" />
  </svg>
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
    
    if (view === 'login') {
      showInfo('Signing In', 'Verifying your credentials...');
    } else if (view === 'signup') {
      showInfo('Creating Account', 'Setting up your new account...');
    } else {
      showInfo('Sending Reset Link', 'Processing your password reset request...');
    }
    
    try {
      if (view === 'login') {
        await login(email, password);
        showSuccess('Welcome Back!', 'Successfully signed in to your account.');
      } else if (view === 'signup') {
        await signup(email, password, role, affiliateCode);
        showSuccess('Account Created!', 'Welcome to Law Letter AI. You can now start creating letters.');
      } else { // forgot_password
        await requestPasswordReset(email);
        setSuccessMessage("If an account with that email exists, a password reset link has been sent.");
        showSuccess('Reset Link Sent', 'Check your email for password reset instructions.');
      }
    } catch (err: any) {
      setError(err.message);
      showError('Authentication Failed', err.message || 'Please check your credentials and try again.');
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

  const renderForgotPassword = () => (
    <motion.div
      key="forgot-password"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
          Reset Password
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
          Enter your email to receive a reset link
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" required>Email Address</Label>
          <Tooltip text="Enter the email address associated with your account">
            <InputWithIcon
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={handleEmailChange}
              icon={<EmailIcon />}
              error={emailError}
            />
          </Tooltip>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        {successMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm"
          >
            {successMessage}
          </motion.div>
        )}

        <div className="space-y-4">
          {loading ? (
            <Tooltip text="Processing your password reset request...">
              <ShinyButton disabled className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold">
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing...
              </ShinyButton>
            </Tooltip>
          ) : (
            <Tooltip text="Click to receive a password reset link via email">
              <ShimmerButton 
                type="submit" 
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={!email || !!emailError}
              >
                📧 Send Reset Link
              </ShimmerButton>
            </Tooltip>
          )}

          <Tooltip text="Return to the sign in page">
            <button 
              type="button" 
              onClick={() => switchView('login')} 
              className="w-full text-center text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300 p-2"
            >
              ← Back to Sign In
            </button>
          </Tooltip>
        </div>
      </form>
    </motion.div>
  );

  const renderAuthForm = () => (
    <motion.div
      key={view}
      initial={{ opacity: 0, x: view === 'login' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: view === 'login' ? 20 : -20 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
          {view === 'login' ? 'Welcome Back' : 'Create Account'}
        </h2>
        <p className="text-slate-600 dark:text-slate-400 font-medium text-sm sm:text-base">
          {view === 'login' ? 'Access your AI legal assistant' : 'Join the future of legal writing'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="email" required>Email Address</Label>
          <Tooltip text="Enter your email address for account access">
            <InputWithIcon
              id="email"
              type="email"
              placeholder="Enter your email address"
              required
              value={email}
              onChange={handleEmailChange}
              icon={<EmailIcon />}
              error={emailError}
            />
          </Tooltip>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <Label htmlFor="password" required>Password</Label>
            {view === 'login' && (
              <Tooltip text="Click to reset your password via email">
                <button 
                  type="button" 
                  onClick={() => switchView('forgot_password')} 
                  className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors duration-300"
                >
                  Forgot Password?
                </button>
              </Tooltip>
            )}
          </div>
          <Tooltip text="Enter your password (minimum 6 characters)">
            <InputWithIcon
              id="password"
              type="password"
              required
              minLength={6}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<PasswordIcon />}
            />
          </Tooltip>
        </div>

        {view === 'signup' && (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-6"
            >
              <div>
                <Label htmlFor="role" required>I am a...</Label>
                <Tooltip text="Select your role - Users create letters, Employees track referrals and earn commissions">
                  <Select id="role" value={role} onChange={(e) => setRole(e.target.value as UserRole)} icon={<UserIcon />}>
                    <option value="user">User - Create Legal Letters</option>
                    <option value="employee">Employee - Earn Commissions</option>
                  </Select>
                </Tooltip>
              </div>
              
              <div>
                <Label htmlFor="affiliateCode">Affiliate Code (Optional)</Label>
                <Tooltip text="Enter an employee's affiliate code to give them credit for your referral">
                  <InputWithIcon
                    id="affiliateCode"
                    type="text"
                    placeholder="e.g., EMP123XYZ"
                    value={affiliateCode}
                    onChange={(e) => setAffiliateCode(e.target.value)}
                    icon={<CodeIcon />}
                  />
                </Tooltip>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}

        <div className="space-y-4">
          {loading ? (
            <Tooltip text="Processing your authentication...">
              <ShinyButton disabled className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold">
                <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Processing...
              </ShinyButton>
            </Tooltip>
          ) : (
            <Tooltip text={view === 'login' ? 'Click to sign in to your account' : 'Click to create your new account'}>
              <ShimmerButton 
                type="submit" 
                className="w-full h-12 sm:h-14 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                disabled={!email || !password || !!emailError}
              >
                {view === 'login' ? '🚀 Sign In' : '✨ Create Account'}
              </ShimmerButton>
            </Tooltip>
          )}

          <Tooltip text={view === 'login' ? 'Switch to create a new account' : 'Switch to sign in with existing account'}>
            <button
              type="button"
              onClick={() => switchView(view === 'login' ? 'signup' : 'login')}
              className="w-full text-center text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-300 transition-colors duration-300 p-2"
            >
              {view === 'login' ? "Don't have an account? Create one →" : 'Already have an account? Sign in →'}
            </button>
          </Tooltip>
        </div>
      </form>
    </motion.div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Animated Background */}
      <RetroGrid className="opacity-20" />
      
      {/* Responsive Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 sm:w-80 h-40 sm:h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 sm:w-80 h-40 sm:h-80 bg-purple-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 w-20 sm:w-40 h-20 sm:h-40 bg-indigo-400/10 rounded-full blur-2xl animate-ping delay-2000" />
      </div>
      
      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center p-4 sm:p-6">
        {/* Logo Section - Responsive */}
        <BlurFade delay={0.1} inView>
          <motion.div 
            className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 mb-8 sm:mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg opacity-50" />
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl">
                <IconLogo className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
              </div>
            </div>
            <div className="text-center sm:text-left">
              <SparklesText className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                Law Letter AI
              </SparklesText>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium mt-1">
                AI-Powered Legal Documentation
              </p>
            </div>
          </motion.div>
        </BlurFade>
        
        {/* Auth Card - Fully Responsive */}
        <BlurFade delay={0.3} inView>
          <NeonGradientCard className="w-full max-w-md lg:max-w-lg">
            <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
              {/* Gradient Border Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur-xl -z-10" />
              
              <AnimatePresence mode="wait">
                {view === 'forgot_password' ? renderForgotPassword() : renderAuthForm()}
              </AnimatePresence>
            </div>
          </NeonGradientCard>
        </BlurFade>
        
        {/* Features Preview - Responsive Grid */}
        <BlurFade delay={0.5} inView>
          <div className="mt-6 sm:mt-8 grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-2 sm:gap-4 max-w-2xl px-2">
            {[
              { icon: '🤖', text: 'AI-Powered' },
              { icon: '⚡', text: 'Instant Generation' },
              { icon: '📄', text: 'Professional Templates' },
              { icon: '🔒', text: 'Secure & Private' }
            ].map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1, duration: 0.5 }}
                className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-full border border-white/30 dark:border-slate-700/50 shadow-lg hover:scale-105 transition-transform duration-300"
              >
                <span className="text-sm sm:text-lg">{feature.icon}</span>
                <span className="text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">{feature.text}</span>
              </motion.div>
            ))}
          </div>
        </BlurFade>
      </div>
      
      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};