import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './Card';
import { STATUS_STYLES, IconFilePlus, IconEdit, IconTrash, getTemplateLabel, IconSpinner } from '../constants';
import { ShimmerButton } from './magicui/shimmer-button';
import { NeonGradientCard } from './magicui/neon-gradient-card';
import { BlurFade } from './magicui/blur-fade';
import { LetterRequestForm } from './LetterRequestForm';
import { apiClient } from '../services/apiClient';
import type { LetterRequest } from '../types';
import { Tooltip } from './Tooltip';
import { ConfirmationModal } from './ConfirmationModal';

type View = 'dashboard' | 'new_letter_form';

const LetterListSkeleton: React.FC = () => (
    <Card className="w-full animate-pulse">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
             <div>
                <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-48"></div>
                <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-64 mt-2"></div>
            </div>
            <div className="h-10 bg-slate-300 dark:bg-slate-700 rounded-lg w-32"></div>
        </CardHeader>
        <CardContent className="p-0 border-t border-gray-200 dark:border-gray-800">
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-3 px-4">
                    <div className="flex-1 min-w-0">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded w-3/5"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/5 mt-2"></div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                        <div className="h-5 bg-slate-200 dark:bg-slate-700 rounded-full w-20"></div>
                        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24 hidden md:block"></div>
                        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>
                </div>
            ))}
        </CardContent>
    </Card>
);

const LetterRow: React.FC<{ letter: LetterRequest; onEdit: (letter: LetterRequest) => void; onDelete: (id: string) => void; isDeleting: boolean; }> = ({ letter, onEdit, onDelete, isDeleting }) => {
  const style = STATUS_STYLES[letter.status];
  return (
    <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors duration-150">
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 dark:text-white truncate">{letter.title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
          {getTemplateLabel(letter.letterType)}
        </p>
      </div>
      <div className="flex items-center space-x-2 ml-4">
         <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${style.bg} ${style.text} capitalize`}>
            {letter.status.replace('_', ' ')}
        </span>
        <time className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
            Updated {new Date(letter.updatedAt).toLocaleDateString()}
        </time>
        <Tooltip text="Edit Letter">
            <button onClick={() => onEdit(letter)} className="text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isDeleting}>
                <IconEdit className="h-4 w-4" />
            </button>
        </Tooltip>
        <Tooltip text="Delete Letter">
             <button onClick={() => onDelete(letter.id)} className="text-gray-400 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isDeleting}>
                {isDeleting ? <IconSpinner className="h-4 w-4 animate-spin" /> : <IconTrash className="h-4 w-4" />}
            </button>
        </Tooltip>
      </div>
    </div>
  );
};

const LetterList: React.FC<{ letters: LetterRequest[], onNewLetterClick: () => void, onEditLetterClick: (letter: LetterRequest) => void, onDeleteLetter: (id: string) => void, isDeletingId: string | null }> = ({ letters, onNewLetterClick, onEditLetterClick, onDeleteLetter, isDeletingId }) => {
  return (
    <NeonGradientCard className="w-full" borderRadius={12}>
        <Card className="bg-white/95 dark:bg-slate-900/95">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>My Letter Requests</CardTitle>
              <CardDescription>View and manage all your generated letters.</CardDescription>
            </div>
            <Tooltip text="Create a new AI-generated letter">
                <ShimmerButton onClick={onNewLetterClick}>
                    <span className="flex items-center gap-2">
                        <IconFilePlus className="h-4 w-4" />
                        New Letter
                    </span>
                </ShimmerButton>
            </Tooltip>
          </CardHeader>
          <CardContent className="p-0">
            <div className="border-t border-gray-200 dark:border-gray-800">
                {letters.length > 0 ? (
                    letters.map((letter, idx) => (
                        <BlurFade key={letter.id} delay={0.25 + idx * 0.05} inView>
                            <LetterRow letter={letter} onEdit={onEditLetterClick} onDelete={onDeleteLetter} isDeleting={isDeletingId === letter.id} />
                        </BlurFade>
                    ))
                ) : (
                    <BlurFade delay={0.25} inView>
                        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                            <p>You haven't created any letters yet.</p>
                            <p className="text-sm mt-1">Click "New Letter" to get started.</p>
                        </div>
                    </BlurFade>
                )}
            </div>
          </CardContent>
        </Card>
    </NeonGradientCard>
  );
};

interface UserDashboardProps {
    currentView: View;
    setCurrentView: (view: View) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ currentView, setCurrentView }) => {
    const [letters, setLetters] = useState<LetterRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingLetter, setEditingLetter] = useState<LetterRequest | null>(null);
    const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
    const [letterToDeleteId, setLetterToDeleteId] = useState<string | null>(null);

    useEffect(() => {
        const loadLetters = async () => {
            setIsLoading(true);
            try {
                const fetchedLetters = await apiClient.fetchLetters();
                setLetters(fetchedLetters);
            } catch (error) {
                console.error("Failed to fetch letters:", error);
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
        try {
            await apiClient.deleteLetter(letterToDeleteId);
            setLetters(prevLetters => prevLetters.filter(l => l.id !== letterToDeleteId));
        } catch (error) {
            console.error("Failed to delete letter:", error);
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
      if (letterData.id) {
        // Update existing letter
        await apiClient.updateLetter(letterData as LetterRequest);
      } else {
        // Create new letter
        await apiClient.createLetter(letterData);
      }
      setEditingLetter(null);
      navigateTo('dashboard');
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
      {isLoading ? (
        <LetterListSkeleton />
      ) : (
        <LetterList 
          letters={letters} 
          onNewLetterClick={() => {
            setEditingLetter(null);
            navigateTo('new_letter_form')}
          }
          onEditLetterClick={handleEditLetter}
          onDeleteLetter={handleDeleteRequest}
          isDeletingId={isDeletingId}
        />
      )}
      <ConfirmationModal
          isOpen={!!letterToDeleteId}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Letter"
          message="Are you sure you want to delete this letter? This action cannot be undone."
          isConfirming={isDeletingId === letterToDeleteId}
      />
    </>
  );
};