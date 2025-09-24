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
import { ShimmerButton } from './magicui/shimmer-button';
import { AuthPageModern } from './AuthPageModern';
import {
  Scale,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader2,
  ArrowRight,
  KeyRound
} from 'lucide-react';

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

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => (
  <label
    className={`block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 ${className}`}
    {...props}
  />
);

const SecurityIndicator: React.FC<{ strength: number }> = ({ strength }) => {
  const getStrengthLabel = () => {
    switch (strength) {
      case 0: return 'Very Weak';
      case 1: return 'Weak';
      case 2: return 'Fair';
      case 3: return 'Good';
      case 4: return 'Strong';
      default: return '';
    }
  };

  const getStrengthColor = () => {
    switch (strength) {
      case 0: return 'bg-red-500';
      case 1: return 'bg-orange-500';
      case 2: return 'bg-yellow-500';
      case 3: return 'bg-blue-500';
      case 4: return 'bg-green-500';
      default: return 'bg-gray-300';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600 dark:text-gray-400">Password Strength</span>
        <span className={`text-xs font-medium ${
          strength >= 3 ? 'text-green-600 dark:text-green-400' :
          strength >= 2 ? 'text-yellow-600 dark:text-yellow-400' :
          'text-red-600 dark:text-red-400'
        }`}>
          {getStrengthLabel()}
        </span>
      </div>
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
              i <= strength ? getStrengthColor() : 'bg-gray-200 dark:bg-gray-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export const ResetPasswordPageModern: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { updateUserPassword } = useAuth();

  const calculatePasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const passwordStrength = calculatePasswordStrength(password);
  const passwordsMatch = password && confirmPassword && password === confirmPassword;
  const hasPasswordError = password.length > 0 && password.length < 6;
  const hasConfirmError = confirmPassword.length > 0 && password !== confirmPassword;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateUserPassword(password);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-green-950/20 dark:to-blue-950/10 relative overflow-hidden flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Password Updated Successfully!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
            Your password has been updated. You can now sign in with your new password.
          </p>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <ShimmerButton
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2"
            >
              Continue to Sign In
              <ArrowRight className="w-4 h-4" />
            </ShimmerButton>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 dark:from-gray-950 dark:via-blue-950/20 dark:to-indigo-950/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(71,85,105,0.15)_1px,transparent_0)] [background-size:20px_20px] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(148,163,184,0.1)_1px,transparent_0)]" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-l from-blue-500/10 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-r from-indigo-500/10 to-transparent rounded-full blur-3xl" />

      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {/* Logo and Branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-center gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-lg">
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent">
                Talk to My Lawyer
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Professional Legal Document Services
              </p>
            </div>
          </div>

          {/* Security indicators */}
          <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure Reset</span>
            </div>
            <div className="flex items-center gap-1">
              <KeyRound className="w-4 h-4 text-blue-500" />
              <span>Encrypted</span>
            </div>
          </div>
        </motion.div>

        {/* Password Reset Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-sm bg-white/95 dark:bg-gray-800/95 border-white/20 dark:border-gray-700/20 shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Set New Password
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                Choose a strong password to keep your account secure.
              </CardDescription>
            </CardHeader>

            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6 px-6">
                {/* New Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Enter your new password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                      isValid={password.length >= 6 && passwordStrength >= 3}
                      hasError={hasPasswordError}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {password && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SecurityIndicator strength={passwordStrength} />
                    </motion.div>
                  )}

                  {hasPasswordError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Password must be at least 6 characters
                    </motion.p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      minLength={6}
                      placeholder="Confirm your new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      icon={<Lock className="w-4 h-4" />}
                      isValid={passwordsMatch}
                      hasError={hasConfirmError}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-12 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {hasConfirmError && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
                    >
                      <AlertCircle className="w-3 h-3" />
                      Passwords do not match
                    </motion.p>
                  )}

                  {passwordsMatch && confirmPassword && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1"
                    >
                      <CheckCircle className="w-3 h-3" />
                      Passwords match
                    </motion.p>
                  )}
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                    Password Requirements:
                  </h4>
                  <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
                    <li className={`flex items-center gap-2 ${password.length >= 8 ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${password.length >= 8 ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      At least 8 characters
                    </li>
                    <li className={`flex items-center gap-2 ${/[A-Z]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${/[A-Z]/.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      One uppercase letter
                    </li>
                    <li className={`flex items-center gap-2 ${/[0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${/[0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      One number
                    </li>
                    <li className={`flex items-center gap-2 ${/[^A-Za-z0-9]/.test(password) ? 'text-green-600 dark:text-green-400' : ''}`}>
                      <div className={`w-2 h-2 rounded-full ${/[^A-Za-z0-9]/.test(password) ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} />
                      One special character
                    </li>
                  </ul>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-4 px-6 pt-6">
                {/* Error Message */}
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
                        Updating Password...
                      </span>
                    </div>
                  ) : (
                    <ShimmerButton
                      type="submit"
                      className="w-full h-12 text-base font-semibold"
                      disabled={!passwordsMatch || password.length < 6}
                    >
                      Update Password
                    </ShimmerButton>
                  )}
                </motion.div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400"
        >
          <p>© 2024 Talk to My Lawyer. Your security is our priority.</p>
        </motion.div>
      </div>
    </div>
  );
};