import React from 'react';
import { CheckCircle, Clock } from 'lucide-react';
import type { LetterStatus } from '../types';

interface TimelineStep {
  status: LetterStatus;
  label: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface LetterTimelineProps {
  currentStatus: LetterStatus;
}

const STATUS_ORDER: LetterStatus[] = ['submitted', 'in_review', 'approved', 'completed'];

const STATUS_CONFIG: Record<LetterStatus, { label: string; description: string }> = {
  submitted: {
    label: 'Request Received',
    description: 'Your letter request has been submitted and is pending review'
  },
  in_review: {
    label: 'Under Attorney Review',
    description: 'An attorney is reviewing your letter draft'
  },
  approved: {
    label: 'Approved',
    description: 'Your letter has been approved and is ready for delivery'
  },
  completed: {
    label: 'Completed',
    description: 'Your letter has been sent successfully'
  },
  draft: {
    label: 'Draft',
    description: 'Letter is in draft mode'
  },
  cancelled: {
    label: 'Cancelled',
    description: 'Request has been cancelled'
  }
};

export const LetterTimeline: React.FC<LetterTimelineProps> = ({ currentStatus }) => {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);

  const steps: TimelineStep[] = STATUS_ORDER.map((status, index) => ({
    status,
    ...STATUS_CONFIG[status],
    completed: index < currentIndex,
    current: index === currentIndex
  }));

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Letter Progress
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {STATUS_CONFIG[currentStatus].label}
        </span>
      </div>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200 dark:bg-gray-700">
          <div
            className="h-full bg-blue-500 transition-all duration-500 ease-in-out"
            style={{
              width: `${(currentIndex / (STATUS_ORDER.length - 1)) * 100}%`
            }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step) => (
            <div key={step.status} className="flex flex-col items-center">
              {/* Step circle */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  step.completed
                    ? 'bg-green-500 border-green-500 text-white'
                    : step.current
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400'
                }`}
              >
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : step.current ? (
                  <Clock className="w-5 h-5" />
                ) : (
                  <div className="w-3 h-3 rounded-full bg-current" />
                )}
              </div>

              {/* Step label */}
              <div className="mt-2 text-center max-w-24">
                <div
                  className={`text-xs font-medium ${
                    step.completed || step.current
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {step.label}
                </div>
                {step.current && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};