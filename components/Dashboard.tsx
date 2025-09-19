import React, { useState, useEffect } from 'react';
import { LettersTable } from './LettersTable';
import { LetterRequestForm } from './LetterRequestForm';
import { apiClient } from '../services/apiClient';
import type { LetterRequest } from '../types';
import { ConfirmationModal } from './ConfirmationModal';
import { CompletionBanner, useBanners } from './CompletionBanner';

type View = 'dashboard' | 'new_letter_form';

interface UserDashboardProps {
  currentView: View;
  setCurrentView: (view: View) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({
  currentView,
  setCurrentView,
}) => {
  const [letters, setLetters] = useState<LetterRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingLetter, setEditingLetter] = useState<LetterRequest | null>(
    null
  );
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [letterToDeleteId, setLetterToDeleteId] = useState<string | null>(null);
  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    const loadLetters = async () => {
      setIsLoading(true);
      showInfo('Loading Letters', 'Fetching your saved letters...');
      try {
        const fetchedLetters = await apiClient.fetchLetters();
        setLetters(fetchedLetters);
        if (fetchedLetters.length > 0) {
          showSuccess(
            'Letters Loaded',
            `Found ${fetchedLetters.length} letter${fetchedLetters.length !== 1 ? 's' : ''} in your dashboard.`
          );
        }
      } catch (error) {
        console.error('Failed to fetch letters:', error);
        showError(
          'Loading Failed',
          'Unable to load your letters. Please refresh the page.'
        );
      } finally {
        setIsLoading(false);
      }
    };
    if (currentView === 'dashboard') {
      loadLetters();
    }
  }, [currentView]);

  const navigateTo = (view: View) => setCurrentView(view);

  const handleEditLetter = (letter: LetterRequest) => {
    setEditingLetter(letter);
    navigateTo('new_letter_form');
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

  const handleCancelForm = () => {
    setEditingLetter(null);
    navigateTo('dashboard');
  };

  const handleSaveLetter = async (letterData: Partial<LetterRequest>) => {
    try {
      if (letterData.id) {
        // Update existing letter
        showInfo('Updating Letter', 'Saving your changes...');
        await apiClient.updateLetter(letterData as LetterRequest);
        showSuccess(
          'Letter Updated',
          'Your changes have been saved successfully.'
        );
      } else {
        // Create new letter
        showInfo('Creating Letter', 'Saving your new letter...');
        await apiClient.createLetter(letterData);
        showSuccess(
          'Letter Created',
          'Your new letter has been saved to the dashboard.'
        );
      }
      setEditingLetter(null);
      navigateTo('dashboard');
    } catch (error) {
      console.error('Failed to save letter:', error);
      showError('Save Failed', 'Unable to save the letter. Please try again.');
    }
  };

  if (currentView === 'new_letter_form') {
    return (
      <LetterRequestForm
        onFormSubmit={handleSaveLetter}
        onCancel={handleCancelForm}
        letterToEdit={editingLetter}
      />
    );
  }

  return (
    <>
      <LettersTable
        letters={letters}
        onNewLetterClick={() => {
          setEditingLetter(null);
          navigateTo('new_letter_form');
        }}
        onEditLetterClick={handleEditLetter}
        onDeleteLetter={handleDeleteRequest}
        isDeletingId={isDeletingId}
        isLoading={isLoading}
      />
      <ConfirmationModal
        isOpen={!!letterToDeleteId}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title='Delete Letter'
        message='Are you sure you want to delete this letter? This action cannot be undone.'
        isConfirming={isDeletingId === letterToDeleteId}
      />

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </>
  );
};
