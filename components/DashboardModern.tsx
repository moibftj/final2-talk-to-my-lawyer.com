import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Plus,
  CreditCard,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  Crown,
  BarChart3,
  Briefcase,
  Download,
  Mail,
  Eye,
  Edit,
  Trash2,
  Star,
  Zap,
  Shield,
  Award,
  Activity,
  Filter,
  Search,
  ArrowRight,
  ChevronRight,
  Globe,
  Users
} from 'lucide-react';
import { LettersTable } from './LettersTable';
import { LetterGenerationModal } from './LetterGenerationModal';
import { SubscriptionForm } from './SubscriptionForm';
import { apiClient } from '../services/apiClient';
import type { LetterRequest, Subscription } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { CompletionBanner, useBanners } from './CompletionBanner';
import { useAuth } from '../contexts/AuthContext';

type View = 'dashboard' | 'subscription';

interface UserDashboardProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

// Modern Stat Card Component
const StatCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'blue' | 'green' | 'purple' | 'orange';
  onClick?: () => void;
}> = ({ icon, label, value, change, trend, color = 'blue', onClick }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600 text-blue-600',
    green: 'from-green-500 to-green-600 text-green-600',
    purple: 'from-purple-500 to-purple-600 text-purple-600',
    orange: 'from-orange-500 to-orange-600 text-orange-600',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        legal-card legal-card-hover p-6 relative overflow-hidden cursor-pointer
        bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-800 dark:to-gray-800/50
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-32 h-32 transform translate-x-8 -translate-y-8">
          <div className={`w-full h-full rounded-full bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} opacity-20`} />
        </div>
      </div>

      <div className="relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color].split(' ')[0]} ${colorClasses[color].split(' ')[1]} flex items-center justify-center text-white mb-4`}>
              {icon}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {value}
            </p>
          </div>
          {change && (
            <div className={`
              flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
              ${trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}
            `}>
              <TrendingUp className="w-3 h-3" />
              {change}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Quick Action Card Component
const QuickActionCard: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  onClick: () => void;
  color?: 'blue' | 'green' | 'purple' | 'orange';
  disabled?: boolean;
}> = ({ icon, title, description, buttonText, onClick, color = 'blue', disabled = false }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  };

  return (
    <motion.div
      whileHover={!disabled ? { scale: 1.02 } : {}}
      className={`
        legal-card p-6 relative overflow-hidden
        ${disabled ? 'opacity-60 cursor-not-allowed' : 'legal-card-hover cursor-pointer'}
      `}
      onClick={!disabled ? onClick : undefined}
    >
      <div className="flex items-start gap-4">
        <div className={`
          w-12 h-12 rounded-xl bg-gradient-to-br ${colorClasses[color]}
          flex items-center justify-center text-white flex-shrink-0
        `}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 leading-relaxed">
            {description}
          </p>
          <motion.button
            whileHover={!disabled ? { x: 4 } : {}}
            className={`
              inline-flex items-center gap-2 text-sm font-medium transition-colors
              ${disabled
                ? 'text-gray-400 dark:text-gray-600'
                : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
              }
            `}
            disabled={disabled}
          >
            {buttonText}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

// Recent Letter Card Component
const RecentLetterCard: React.FC<{
  letter: LetterRequest;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}> = ({ letter, onView, onEdit, onDelete }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'approved': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'under_review': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'pending': return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-700 dark:text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'approved': return <Star className="w-4 h-4" />;
      case 'under_review': return <Clock className="w-4 h-4" />;
      case 'pending': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      className="legal-card legal-card-hover p-4"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
            {letter.subject || 'Untitled Letter'}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            To: {letter.recipientName || 'Unknown Recipient'}
          </p>
        </div>
        <div className={`
          inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium
          ${getStatusColor(letter.status)}
        `}>
          {getStatusIcon(letter.status)}
          {letter.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          {new Date(letter.createdAt).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-1">
          {onView && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onView}
              className="p-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          )}
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
            >
              <Edit className="w-4 h-4" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const UserDashboardModern: React.FC<UserDashboardProps> = ({
  currentView,
  setCurrentView,
}) => {
  const { user } = useAuth();
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [remainingLetters, setRemainingLetters] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLetter, setEditingLetter] = useState<LetterRequest | null>(null);
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [letterToDeleteId, setLetterToDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      showInfo('Loading Dashboard', 'Fetching your data...');
      try {
        const [fetchedLetters, userSubscription] = await Promise.all([
          apiClient.fetchLetters(),
          apiClient.getUserSubscription(),
        ]);

        setLetters(fetchedLetters);
        setSubscription(userSubscription);

        if (userSubscription) {
          const usedLetters = fetchedLetters.filter(
            l => l.status === 'completed'
          ).length;
          let totalAllowed = 0;
          switch (userSubscription.planType) {
            case 'one_letter':
              totalAllowed = 1;
              break;
            case 'four_monthly':
              totalAllowed = 4;
              break;
            case 'eight_yearly':
              totalAllowed = 8;
              break;
          }
          setRemainingLetters(Math.max(0, totalAllowed - usedLetters));
        }

        if (fetchedLetters.length > 0) {
          showSuccess(
            'Dashboard Loaded',
            `Found ${fetchedLetters.length} letter${fetchedLetters.length !== 1 ? 's' : ''} and ${remainingLetters} remaining credits.`
          );
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        showError(
          'Loading Failed',
          'Unable to load your dashboard. Please refresh the page.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (currentView === 'dashboard') {
      loadUserData();
    }
  }, [currentView]);

  const navigateTo = (view: View) => setCurrentView(view);

  const handleEditLetter = (letter: LetterRequest) => {
    setEditingLetter(letter);
    setShowLetterModal(true);
  };

  const handleNewLetter = () => {
    if (remainingLetters <= 0) {
      showError(
        'No Credits Remaining',
        'Please upgrade your subscription to create more letters.'
      );
      return;
    }
    setEditingLetter(null);
    setShowLetterModal(true);
  };

  const handleDeleteLetter = async (letterId: string) => {
    if (isDeletingId) return;
    setIsDeletingId(letterId);
    try {
      await apiClient.deleteLetter(letterId);
      setLetters(prev => prev.filter(l => l.id !== letterId));
      showSuccess('Letter Deleted', 'The letter has been successfully deleted.');
    } catch (error) {
      showError('Deletion Failed', 'Failed to delete the letter. Please try again.');
    } finally {
      setIsDeletingId(null);
      setLetterToDeleteId(null);
    }
  };

  const handleLetterModalSaved = (letter: LetterRequest) => {
    if (editingLetter) {
      setLetters(prev => prev.map(l => l.id === letter.id ? letter : l));
    } else {
      setLetters(prev => [letter, ...prev]);
      setRemainingLetters(prev => Math.max(0, prev - 1));
    }
    setShowLetterModal(false);
  };

  const getFilteredLetters = () => {
    return letters.filter(letter => {
      const matchesSearch = searchTerm === '' ||
        letter.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        letter.recipientName?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || letter.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  };

  const recentLetters = letters.slice(0, 3);
  const completedLetters = letters.filter(l => l.status === 'completed').length;
  const pendingLetters = letters.filter(l => l.status === 'pending' || l.status === 'under_review').length;

  if (currentView === 'subscription') {
    return (
      <div className="container-fluid">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <SubscriptionForm />
        </motion.div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-fluid">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="heading-2 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}!
          </h1>
          <p className="body-regular">
            Manage your legal documents and track their progress in one secure place.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleNewLetter}
            disabled={remainingLetters <= 0}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create New Letter
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="Total Letters"
          value={letters.length}
          color="blue"
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Completed"
          value={completedLetters}
          color="green"
        />
        <StatCard
          icon={<Clock className="w-6 h-6" />}
          label="In Progress"
          value={pendingLetters}
          color="orange"
        />
        <StatCard
          icon={<Zap className="w-6 h-6" />}
          label="Credits Remaining"
          value={remainingLetters}
          color="purple"
          onClick={() => remainingLetters <= 0 && navigateTo('subscription')}
        />
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        <QuickActionCard
          icon={<Plus className="w-6 h-6" />}
          title="Create New Letter"
          description="Generate a professional legal letter with AI assistance"
          buttonText="Start Writing"
          onClick={handleNewLetter}
          disabled={remainingLetters <= 0}
          color="blue"
        />
        <QuickActionCard
          icon={<Crown className="w-6 h-6" />}
          title="Upgrade Plan"
          description="Get more credits and premium features"
          buttonText="View Plans"
          onClick={() => navigateTo('subscription')}
          color="purple"
        />
      </motion.div>

      {/* Recent Letters & Full Table */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Letters */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="xl:col-span-1"
        >
          <div className="legal-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3">Recent Letters</h2>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentLetters.length > 0 ? (
                recentLetters.map((letter) => (
                  <RecentLetterCard
                    key={letter.id}
                    letter={letter}
                    onEdit={() => handleEditLetter(letter)}
                    onDelete={() => setLetterToDeleteId(letter.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No letters yet</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Create your first letter to get started
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* All Letters Table */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-2"
        >
          <div className="legal-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="heading-3">All Letters</h2>
              <div className="flex items-center gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search letters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="Filter letters by status"
                  className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="under_review">Under Review</option>
                  <option value="approved">Approved</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <LettersTable
              letters={getFilteredLetters()}
              onEdit={handleEditLetter}
              onDelete={(letter) => setLetterToDeleteId(letter.id)}
              isDeleting={(id) => isDeletingId === id}
            />
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showLetterModal && (
          <LetterGenerationModal
            editingLetter={editingLetter}
            onClose={() => setShowLetterModal(false)}
            onSaved={handleLetterModalSaved}
          />
        )}

        {letterToDeleteId && (
          <ConfirmationModal
            isOpen={true}
            onClose={() => setLetterToDeleteId(null)}
            onConfirm={() => handleDeleteLetter(letterToDeleteId)}
            title="Delete Letter"
            message="Are you sure you want to delete this letter? This action cannot be undone."
            confirmText="Delete"
            isDestructive={true}
          />
        )}
      </AnimatePresence>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};