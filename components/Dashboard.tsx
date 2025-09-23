import React, { useState, useEffect } from 'react';
import { LettersTable } from './LettersTable';
import { LetterGenerationModal } from './LetterGenerationModal';
import { SubscriptionForm } from './SubscriptionForm';
import { apiClient } from '../services/apiClient';
import type { LetterRequest, Subscription } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { CompletionBanner, useBanners } from './CompletionBanner';
import { useAuth } from '../contexts/AuthContext';
import { letterStatusService } from '../services/letterStatusService';

type View = 'dashboard' | 'subscription';

interface UserDashboardProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentView,
  setCurrentView,
}) => {
  const { user } = useAuth();
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [remainingLetters, setRemainingLetters] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLetter, setEditingLetter] = useState<LetterRequest | null>(
    null
  );
  const [showLetterModal, setShowLetterModal] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [letterToDeleteId, setLetterToDeleteId] = useState<string | null>(null);
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    // Subscribe to real-time status updates
    const unsubscribe = letterStatusService.subscribeToStatusUpdates(
      payload => {
        setLetters(prev =>
          prev.map(letter =>
            letter.id === payload.letterId
              ? {
                  ...letter,
                  status: payload.newStatus,
                  updatedAt: payload.timestamp,
                }
              : letter
          )
        );
        showInfo(
          'Status Update',
          `Letter status updated to ${payload.newStatus.replace('_', ' ')}`
        );
      }
    );

    const loadUserData = async () => {
      setIsLoading(true);
      showInfo('Loading Dashboard', 'Fetching your data...');
      try {
        // Load letters and subscription data in parallel
        const [fetchedLetters, userSubscription] = await Promise.all([
          apiClient.fetchLetters(),
          apiClient.getUserSubscription(),
        ]);

        setLetters(fetchedLetters);
        setSubscription(userSubscription);

        // Calculate remaining letters based on subscription
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

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
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

  const handleDeleteRequest = (id: string) => {
    setLetterToDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!letterToDeleteId) return;
    setIsDeletingId(letterToDeleteId);
    const letterToDelete = letters.find(l => l.id === letterToDeleteId);
    showInfo(
      'Deleting Letter',
      `Removing "${letterToDelete?.title || 'letter'}" from your dashboard...`
    );
    try {
      await apiClient.deleteLetter(letterToDeleteId);
      setLetters(prevLetters =>
        prevLetters.filter(l => l.id !== letterToDeleteId)
      );
      showSuccess(
        'Letter Deleted',
        'The letter has been permanently removed from your dashboard.'
      );
    } catch (error) {
      console.error('Failed to delete letter:', error);
      showError(
        'Delete Failed',
        'Unable to delete the letter. Please try again.'
      );
    } finally {
      setIsDeletingId(null);
      setLetterToDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setLetterToDeleteId(null);
  };

  const handleCloseModal = () => {
    setEditingLetter(null);
    setShowLetterModal(false);
  };

  const handleSaveLetter = async (letterData: Partial<LetterRequest>) => {
    try {
      // Check if user has remaining letters for new letter creation
      if (!letterData.id && remainingLetters <= 0) {
        showError(
          'No Credits Remaining',
          'You have used all your letter credits. Please upgrade your subscription.'
        );
        return;
      }

      if (letterData.id) {
        // Update existing letter
        showInfo('Updating Letter', 'Saving your changes...');
        await apiClient.updateLetter(letterData as LetterRequest);
        showSuccess(
          'Letter Updated',
          'Your changes have been saved successfully.'
        );
      } else {
        // Create new letter and decrement remaining count
        showInfo('Creating Letter', 'Saving your new letter...');
        await apiClient.createLetter(letterData);
        setRemainingLetters(prev => prev - 1);
        showSuccess(
          'Letter Created',
          `Your new letter has been saved. ${remainingLetters - 1} credits remaining.`
        );
      }
      setEditingLetter(null);
      setShowLetterModal(false);
      // Reload dashboard data
      if (currentView === 'dashboard') {
        window.location.reload(); // Simple reload for now, can be optimized later
      }
    } catch (error) {
      console.error('Failed to save letter:', error);
      showError('Save Failed', 'Unable to save the letter. Please try again.');
    }
  };

  const handleStatusUpdate = (letterId: string, newStatus: string) => {
    setLetters(prev =>
      prev.map(letter =>
        letter.id === letterId
          ? {
              ...letter,
              status: newStatus as any,
              updatedAt: new Date().toISOString(),
            }
          : letter
      )
    );
  };

  const handleSubscribe = async (planId: string, discountCode?: string) => {
    try {
      showInfo('Processing Subscription', 'Setting up your subscription...');

      // Here you would integrate with your payment processor
      // For now, we'll simulate a successful subscription
      await new Promise(resolve => setTimeout(resolve, 2000));

      showSuccess(
        'Subscription Successful',
        `Welcome to ${planId.replace('_', ' ')} plan! You can now generate letters.`
      );

      // Navigate back to dashboard
      navigateTo('dashboard');
    } catch (error) {
      console.error('Subscription error:', error);
      showError(
        'Subscription Failed',
        'Unable to process subscription. Please try again.'
      );
    }
  };

  if (currentView === 'subscription') {
    return <SubscriptionForm onSubscribe={handleSubscribe} />;
  }

  return (
    <>
      {/* User Stats Header */}
      <div className='mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border'>
        <h2 className='text-xl font-semibold text-gray-800 mb-2'>
          Your Dashboard
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='text-center'>
            <div className='text-2xl font-bold text-blue-600'>
              {letters.length}
            </div>
            <div className='text-sm text-gray-600'>Total Letters</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-green-600'>
              {remainingLetters}
            </div>
            <div className='text-sm text-gray-600'>Credits Remaining</div>
          </div>
          <div className='text-center'>
            <div className='text-2xl font-bold text-purple-600'>
              {subscription?.planType.replace('_', ' ').toUpperCase() ||
                'No Plan'}
            </div>
            <div className='text-sm text-gray-600'>Current Plan</div>
          </div>
        </div>
      </div>

      <LettersTable
        letters={letters}
        onNewLetterClick={handleNewLetter}
        onEditLetterClick={handleEditLetter}
        onDeleteLetter={handleDeleteRequest}
        isDeletingId={isDeletingId}
        isLoading={isLoading}
        onStatusUpdate={handleStatusUpdate}
      />
      <ConfirmationModal
        isOpen={!!letterToDeleteId}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title='Delete Letter'
        message='Are you sure you want to delete this letter? This action cannot be undone.'
        isConfirming={isDeletingId === letterToDeleteId}
      />

      {/* Letter Generation Modal */}
      <LetterGenerationModal
        isOpen={showLetterModal}
        onClose={handleCloseModal}
        onSubmit={handleSaveLetter}
        letterToEdit={editingLetter}
      />

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </>
  );
};
