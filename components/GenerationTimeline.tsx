import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Clock, FileText, Eye, Mail, CreditCard } from 'lucide-react';

interface GenerationTimelineProps {
  onComplete: () => void;
  hasSubscription: boolean;
  onSubscribe: () => void;
}

interface TimelineStep {
  id: number;
  title: string;
  description: string;
  icon: typeof FileText;
  duration: number; // in milliseconds
}

export const GenerationTimeline: React.FC<GenerationTimelineProps> = ({
  onComplete,
  hasSubscription,
  onSubscribe,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [showActions, setShowActions] = useState(false);

  const steps: TimelineStep[] = [
    {
      id: 0,
      title: 'Thanks For Submitting Details',
      description: 'Your letter request has been received successfully',
      icon: CheckCircle,
      duration: 2000,
    },
    {
      id: 1,
      title: 'Attorneys are reviewing your request',
      description: 'Our legal team is analyzing your requirements',
      icon: FileText,
      duration: 2500,
    },
    {
      id: 2,
      title: 'Your Letter 1st Draft is Generated',
      description: 'AI-powered draft has been created with legal language',
      icon: FileText,
      duration: 2500,
    },
    {
      id: 3,
      title: 'Letter Ready for Review',
      description: hasSubscription
        ? 'Your letter is ready to preview and send'
        : 'Subscribe to preview and send your letter',
      icon: hasSubscription ? Eye : CreditCard,
      duration: 1500,
    },
  ];

  useEffect(() => {
    if (currentStep < steps.length) {
      const timer = setTimeout(() => {
        setCompletedSteps(prev => [...prev, currentStep]);
        if (currentStep < steps.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // All steps completed
          setTimeout(() => {
            setShowActions(true);
          }, 500);
        }
      }, steps[currentStep].duration);

      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const progressPercentage = ((completedSteps.length) / steps.length) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-slate-800 mb-2"
        >
          Generating Your Legal Letter
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-slate-600"
        >
          Please wait while we process your request
        </motion.p>
      </div>

      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        </div>
      </div>

      {/* Timeline Steps */}
      <div className="space-y-6">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isCompleted = completedSteps.includes(index);
          const isCurrent = currentStep === index;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              <div className="flex items-start gap-4">
                {/* Icon Circle */}
                <motion.div
                  className={`relative flex items-center justify-center w-14 h-14 rounded-full border-2 transition-all ${
                    isCompleted
                      ? 'bg-green-500 border-green-500'
                      : isCurrent
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-slate-100 border-slate-300'
                  }`}
                  animate={
                    isCurrent
                      ? {
                          scale: [1, 1.1, 1],
                          transition: { repeat: Infinity, duration: 1.5 },
                        }
                      : {}
                  }
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 200,
                        damping: 10,
                      }}
                    >
                      <CheckCircle className="w-7 h-7 text-white" />
                    </motion.div>
                  ) : (
                    <Icon
                      className={`w-7 h-7 ${
                        isCurrent ? 'text-blue-600' : 'text-slate-400'
                      }`}
                    />
                  )}

                  {/* Animated Checkmark Pop */}
                  {isCompleted && (
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-500"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 1.5, opacity: 0 }}
                      transition={{ duration: 0.6 }}
                    />
                  )}
                </motion.div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <motion.h3
                    className={`text-lg font-semibold mb-1 ${
                      isCompleted
                        ? 'text-green-700'
                        : isCurrent
                        ? 'text-blue-700'
                        : 'text-slate-500'
                    }`}
                    animate={
                      isCurrent
                        ? { opacity: [0.7, 1, 0.7] }
                        : { opacity: 1 }
                    }
                    transition={
                      isCurrent
                        ? { repeat: Infinity, duration: 2 }
                        : {}
                    }
                  >
                    {step.title}
                  </motion.h3>
                  <p className="text-slate-600 text-sm">{step.description}</p>

                  {isCurrent && !isCompleted && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2 mt-2 text-sm text-blue-600"
                    >
                      <Clock className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </motion.div>
                  )}
                </div>

                {/* Connecting Line */}
                {index < steps.length - 1 && (
                  <div className="absolute left-7 top-14 w-0.5 h-12 -ml-px">
                    <motion.div
                      className={`w-full ${
                        isCompleted ? 'bg-green-500' : 'bg-slate-300'
                      }`}
                      initial={{ height: 0 }}
                      animate={{ height: isCompleted ? '100%' : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Action Buttons */}
      <AnimatePresence>
        {showActions && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200"
          >
            {hasSubscription ? (
              <>
                <button
                  onClick={onComplete}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <Eye className="w-5 h-5" />
                  Preview Letter
                </button>
                <button
                  onClick={onComplete}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-700 text-white rounded-lg font-semibold hover:bg-slate-800 transition-all"
                >
                  <Mail className="w-5 h-5" />
                  Send via Email
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onSubscribe}
                  className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <CreditCard className="w-5 h-5" />
                  Subscribe to Preview
                </button>
                <div className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-slate-200 text-slate-500 rounded-lg font-semibold cursor-not-allowed">
                  <Eye className="w-5 h-5" />
                  Preview Locked
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subscription Banner for Non-Subscribers */}
      {!hasSubscription && showActions && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-slate-800 mb-1">
                Subscription Required
              </h4>
              <p className="text-sm text-slate-600 mb-3">
                Your letter has been generated! Subscribe now to preview, edit, and send your professional legal correspondence.
              </p>
              <button
                onClick={onSubscribe}
                className="text-sm font-semibold text-purple-600 hover:text-purple-700 underline"
              >
                View Pricing Plans →
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
