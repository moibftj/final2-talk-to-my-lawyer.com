import React from 'react';
import { Check, Clock, FileText, Eye, Send, AlertCircle } from 'lucide-react';
import type { LetterStatus } from '../types';

interface TimelineStep {
  id: LetterStatus;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
}

const timelineSteps: TimelineStep[] = [
  {
    id: 'submitted',
    title: 'Request Received',
    description: 'Your letter request has been submitted and is queued for review',
    icon: FileText
  },
  {
    id: 'in_review',
    title: 'Under Attorney Review',
    description: 'A qualified attorney is reviewing and refining your letter',
    icon: Eye
  },
  {
    id: 'approved',
    title: 'Approved & Ready',
    description: 'Your letter has been approved and is ready for download or sending',
    icon: Check
  },
  {
    id: 'completed',
    title: 'Delivered',
    description: 'Your letter has been successfully delivered to the recipient',
    icon: Send
  }
];

interface StatusTimelineProps {
  currentStatus: LetterStatus;
  createdAt: string;
  updatedAt: string;
  className?: string;
  showEstimates?: boolean;
}

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  currentStatus,
  createdAt,
  updatedAt,
  className = '',
  showEstimates = true
}) => {
  const getCurrentStepIndex = (status: LetterStatus): number => {
    const stepIndex = timelineSteps.findIndex(step => step.id === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex(currentStatus);

  const getStepStatus = (stepIndex: number): 'completed' | 'current' | 'pending' | 'error' => {
    if (currentStatus === 'cancelled') {
      return stepIndex === currentStepIndex ? 'error' : stepIndex < currentStepIndex ? 'completed' : 'pending';
    }

    if (stepIndex < currentStepIndex) return 'completed';
    if (stepIndex === currentStepIndex) return 'current';
    return 'pending';
  };

  const getEstimatedTime = (stepIndex: number): string => {
    const now = new Date();
    const created = new Date(createdAt);

    switch (stepIndex) {
      case 0: // Request Received
        return 'Immediate';
      case 1: // Under Review
        return showEstimates ? '1-2 business days' : '';
      case 2: // Approved
        return showEstimates ? '2-3 business days' : '';
      case 3: // Delivered
        return showEstimates ? '3-4 business days' : '';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Letter Status</h3>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Created: {formatDate(createdAt)}</span>
          <span>•</span>
          <span>Updated: {formatDate(updatedAt)}</span>
        </div>
      </div>

      <div className="space-y-8">
        {timelineSteps.map((step, index) => {
          const status = getStepStatus(index);
          const StepIcon = step.icon;
          const isLast = index === timelineSteps.length - 1;

          return (
            <div key={step.id} className="relative flex items-start">
              {/* Timeline line */}
              {!isLast && (
                <div
                  className={`absolute left-5 top-12 w-0.5 h-16 ${
                    status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}

              {/* Step indicator */}
              <div className="relative flex-shrink-0">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    status === 'completed'
                      ? 'bg-green-500 border-green-500 text-white'
                      : status === 'current'
                      ? 'bg-blue-500 border-blue-500 text-white animate-pulse'
                      : status === 'error'
                      ? 'bg-red-500 border-red-500 text-white'
                      : 'bg-white border-gray-300 text-gray-400'
                  }`}
                >
                  {status === 'completed' ? (
                    <Check className="w-5 h-5" />
                  ) : status === 'current' ? (
                    <Clock className="w-5 h-5" />
                  ) : status === 'error' ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <StepIcon className="w-5 h-5" />
                  )}
                </div>

                {/* Pulse animation for current step */}
                {status === 'current' && (
                  <div className="absolute -inset-1 rounded-full bg-blue-500 opacity-20 animate-ping" />
                )}
              </div>

              {/* Step content */}
              <div className="ml-4 flex-1 min-w-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4
                      className={`text-sm font-medium ${
                        status === 'completed' || status === 'current'
                          ? 'text-gray-900'
                          : status === 'error'
                          ? 'text-red-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                      {status === 'current' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Current
                        </span>
                      )}
                      {status === 'error' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      )}
                    </h4>
                    <p
                      className={`mt-1 text-sm ${
                        status === 'completed' || status === 'current'
                          ? 'text-gray-600'
                          : status === 'error'
                          ? 'text-red-500'
                          : 'text-gray-400'
                      }`}
                    >
                      {status === 'error' ? 'Letter request was cancelled' : step.description}
                    </p>
                  </div>

                  {/* Time estimate */}
                  {showEstimates && status !== 'error' && (
                    <div className="ml-4 text-right">
                      <div
                        className={`text-xs ${
                          status === 'completed'
                            ? 'text-green-600'
                            : status === 'current'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                      >
                        {status === 'completed' ? '✓ Complete' : getEstimatedTime(index)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional details for current step */}
                {status === 'current' && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700">
                        {index === 1 && 'Your letter is being reviewed by our legal team'}
                        {index === 2 && 'Your letter is ready for download and delivery'}
                        {index === 3 && 'Preparing to send your letter to the recipient'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Error details */}
                {status === 'error' && (
                  <div className="mt-3 p-3 bg-red-50 rounded-md border border-red-200">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">
                        This letter request was cancelled. Please create a new request if needed.
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress summary */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">
            Progress: {currentStatus === 'cancelled' ? 'Cancelled' : `${currentStepIndex + 1} of ${timelineSteps.length} steps`}
          </span>
          <div className="flex items-center space-x-2">
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  currentStatus === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                }`}
                style={{
                  width: `${currentStatus === 'cancelled' ? 100 : ((currentStepIndex + 1) / timelineSteps.length) * 100}%`
                }}
              />
            </div>
            <span className="text-gray-500">
              {currentStatus === 'cancelled' ? '0%' : `${Math.round(((currentStepIndex + 1) / timelineSteps.length) * 100)}%`}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Compact version for use in tables or cards
export const StatusTimelineCompact: React.FC<{
  currentStatus: LetterStatus;
  className?: string;
}> = ({ currentStatus, className = '' }) => {
  const getCurrentStepIndex = (status: LetterStatus): number => {
    const stepIndex = timelineSteps.findIndex(step => step.id === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const currentStepIndex = getCurrentStepIndex(currentStatus);
  const currentStep = timelineSteps[currentStepIndex];

  if (!currentStep) return null;

  const StepIcon = currentStep.icon;

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div
        className={`flex items-center justify-center w-6 h-6 rounded-full ${
          currentStatus === 'completed'
            ? 'bg-green-100 text-green-600'
            : currentStatus === 'cancelled'
            ? 'bg-red-100 text-red-600'
            : 'bg-blue-100 text-blue-600'
        }`}
      >
        {currentStatus === 'cancelled' ? (
          <AlertCircle className="w-3 h-3" />
        ) : currentStatus === 'completed' ? (
          <Check className="w-3 h-3" />
        ) : (
          <StepIcon className="w-3 h-3" />
        )}
      </div>
      <span className="text-sm font-medium text-gray-700">{currentStep.title}</span>
      <div className="flex-1 bg-gray-200 rounded-full h-1">
        <div
          className={`h-1 rounded-full transition-all duration-300 ${
            currentStatus === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
          }`}
          style={{
            width: `${currentStatus === 'cancelled' ? 100 : ((currentStepIndex + 1) / timelineSteps.length) * 100}%`
          }}
        />
      </div>
    </div>
  );
};