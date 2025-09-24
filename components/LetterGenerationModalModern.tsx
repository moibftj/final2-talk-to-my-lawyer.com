import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowRight,
  ArrowLeft,
  FileText,
  User,
  Calendar,
  CheckCircle,
  Download,
  Mail,
  Eye,
  Clock,
  AlertCircle,
  Send,
  MapPin,
  Building,
  Zap,
  Flag,
  Sparkles,
  Save,
  Play,
  Shield,
  Scale,
  Briefcase,
  Phone,
  Globe,
  PlusCircle,
  Minus,
  Star,
  Target,
  Lock
} from 'lucide-react';
import type { LetterRequest } from '../types';

interface LetterGenerationModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSaved: (letterData: LetterRequest) => void;
  editingLetter?: LetterRequest | null;
}

type StepType = 'form' | 'review' | 'timeline' | 'preview';

interface FormData {
  subject: string;
  recipientName: string;
  recipientAddress: string;
  recipientTitle?: string;
  recipientOrganization?: string;
  senderName: string;
  senderAddress?: string;
  description: string;
  urgency: 'normal' | 'urgent' | 'critical';
  letterType: 'demand' | 'notice' | 'formal_request' | 'complaint' | 'cease_desist' | 'other';
  additionalInstructions: string;
  tone: 'professional' | 'firm' | 'friendly' | 'urgent';
  includeDeadline: boolean;
  deadline?: string;
  attachments?: string[];
}

const letterTypes = [
  { value: 'demand', label: 'Demand Letter', description: 'Request payment or action from recipient', icon: Target },
  { value: 'notice', label: 'Formal Notice', description: 'Official notification or announcement', icon: FileText },
  { value: 'formal_request', label: 'Formal Request', description: 'Professional request for information or action', icon: Mail },
  { value: 'complaint', label: 'Complaint Letter', description: 'Express dissatisfaction or dispute', icon: AlertCircle },
  { value: 'cease_desist', label: 'Cease & Desist', description: 'Stop harmful or infringing activities', icon: Shield },
  { value: 'other', label: 'Other', description: 'Custom letter type', icon: FileText },
];

const urgencyLevels = [
  { value: 'normal', label: 'Normal', color: 'blue', description: 'Standard processing time' },
  { value: 'urgent', label: 'Urgent', color: 'orange', description: 'Priority processing' },
  { value: 'critical', label: 'Critical', color: 'red', description: 'Immediate attention required' },
];

const toneOptions = [
  { value: 'professional', label: 'Professional', description: 'Business-appropriate and formal' },
  { value: 'firm', label: 'Firm', description: 'Assertive and direct approach' },
  { value: 'friendly', label: 'Friendly', description: 'Courteous and approachable' },
  { value: 'urgent', label: 'Urgent', description: 'Emphasizes time-sensitivity' },
];

const timelineSteps = [
  {
    id: 'submitted',
    title: 'Request Submitted',
    description: 'Your letter request has been received and is in queue',
    icon: FileText,
    estimatedTime: 'Immediate',
    status: 'completed' as const
  },
  {
    id: 'review',
    title: 'Legal Review',
    description: 'Our attorneys are reviewing your request and requirements',
    icon: Scale,
    estimatedTime: '2-4 hours',
    status: 'current' as const
  },
  {
    id: 'draft',
    title: 'AI Generation',
    description: 'Professional letter being generated with AI assistance',
    icon: Sparkles,
    estimatedTime: '30 minutes',
    status: 'pending' as const
  },
  {
    id: 'quality',
    title: 'Quality Check',
    description: 'Final review and quality assurance',
    icon: CheckCircle,
    estimatedTime: '1 hour',
    status: 'pending' as const
  },
  {
    id: 'ready',
    title: 'Ready for Download',
    description: 'Your letter is complete and ready for use',
    icon: Download,
    estimatedTime: 'Complete',
    status: 'pending' as const
  }
];

// Enhanced Input Component
const FormInput: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ReactNode;
  description?: string;
  rows?: number;
}> = ({ label, type = 'text', value, onChange, placeholder, required, error, icon, description, rows }) => {
  const InputComponent = rows ? 'textarea' : 'input';

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 -mt-1">
          {description}
        </p>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-400 dark:text-gray-500">
            {icon}
          </div>
        )}
        <InputComponent
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full ${rows ? 'min-h-[120px] py-3' : 'h-12 py-3.5'} rounded-xl border-2 bg-white dark:bg-gray-800
            ${icon ? 'pl-11' : 'pl-4'} pr-4 text-sm font-medium resize-none
            text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400
            transition-all duration-300 ease-in-out
            ${error
              ? 'border-red-300 dark:border-red-600 focus:border-red-500 focus:ring-2 focus:ring-red-200 dark:focus:ring-red-900/30'
              : 'border-gray-200 dark:border-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900/30'
            }
            hover:border-gray-300 dark:hover:border-gray-600
          `}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-red-600 dark:text-red-400 flex items-center gap-1"
        >
          <AlertCircle className="w-3 h-3" />
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Option Card Component
const OptionCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description?: string;
  color?: string;
}> = ({ selected, onClick, icon, title, description, color = 'blue' }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`
      p-4 rounded-xl border-2 text-left transition-all duration-300 w-full
      ${selected
        ? `border-${color}-500 bg-${color}-50 dark:bg-${color}-900/20`
        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      }
    `}
  >
    <div className="flex items-start gap-3">
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${selected
          ? `bg-${color}-100 text-${color}-600 dark:bg-${color}-900/30 dark:text-${color}-400`
          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
        }
      `}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className={`
          font-semibold text-sm
          ${selected
            ? `text-${color}-900 dark:text-${color}-100`
            : 'text-gray-900 dark:text-gray-100'
          }
        `}>
          {title}
        </h4>
        {description && (
          <p className={`
            text-xs mt-1
            ${selected
              ? `text-${color}-700 dark:text-${color}-300`
              : 'text-gray-600 dark:text-gray-400'
            }
          `}>
            {description}
          </p>
        )}
      </div>
    </div>
  </motion.button>
);

// Timeline Step Component
const TimelineStep: React.FC<{
  step: typeof timelineSteps[0];
  isLast: boolean;
}> = ({ step, isLast }) => {
  const getStatusColor = () => {
    switch (step.status) {
      case 'completed': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'current': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
      case 'pending': return 'text-gray-400 bg-gray-100 dark:bg-gray-800 dark:text-gray-500';
    }
  };

  const getConnectorColor = () => {
    return step.status === 'completed' ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600';
  };

  return (
    <div className="relative flex items-start gap-4">
      {/* Status Icon */}
      <div className={`
        w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 relative z-10
        ${getStatusColor()}
      `}>
        <step.icon className="w-6 h-6" />
      </div>

      {/* Connector Line */}
      {!isLast && (
        <div className={`
          absolute left-6 top-12 w-0.5 h-16 transform -translate-x-1/2
          ${getConnectorColor()}
        `} />
      )}

      {/* Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
            {step.title}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {step.estimatedTime}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {step.description}
        </p>
        {step.status === 'current' && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
              In Progress
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export const LetterGenerationModalModern: React.FC<LetterGenerationModalProps> = ({
  isOpen = true,
  onClose,
  onSaved,
  editingLetter
}) => {
  const [currentStep, setCurrentStep] = useState<StepType>('form');
  const [formData, setFormData] = useState<FormData>({
    subject: '',
    recipientName: '',
    recipientAddress: '',
    recipientTitle: '',
    recipientOrganization: '',
    senderName: '',
    senderAddress: '',
    description: '',
    urgency: 'normal',
    letterType: 'demand',
    additionalInstructions: '',
    tone: 'professional',
    includeDeadline: false,
    deadline: '',
    attachments: []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<FormData>>({});

  useEffect(() => {
    if (editingLetter) {
      setFormData({
        subject: editingLetter.subject || '',
        recipientName: editingLetter.recipientName || '',
        recipientAddress: editingLetter.recipientAddress || '',
        recipientTitle: editingLetter.recipientTitle || '',
        recipientOrganization: editingLetter.recipientOrganization || '',
        senderName: editingLetter.senderName || '',
        senderAddress: editingLetter.senderAddress || '',
        description: editingLetter.description || '',
        urgency: (editingLetter.urgency as any) || 'normal',
        letterType: (editingLetter.letterType as any) || 'demand',
        additionalInstructions: editingLetter.additionalInstructions || '',
        tone: (editingLetter.tone as any) || 'professional',
        includeDeadline: !!editingLetter.deadline,
        deadline: editingLetter.deadline || '',
        attachments: editingLetter.attachments || []
      });
    }
  }, [editingLetter]);

  const validateForm = (): boolean => {
    const newErrors: Partial<FormData> = {};

    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
    if (!formData.recipientAddress.trim()) newErrors.recipientAddress = 'Recipient address is required';
    if (!formData.senderName.trim()) newErrors.senderName = 'Your name is required';
    if (!formData.description.trim()) newErrors.description = 'Letter description is required';
    if (formData.includeDeadline && !formData.deadline) newErrors.deadline = 'Deadline date is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 'form') {
      if (validateForm()) {
        setCurrentStep('review');
      }
    } else if (currentStep === 'review') {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const letterData: LetterRequest = {
        id: editingLetter?.id || `letter_${Date.now()}`,
        ...formData,
        status: 'pending',
        createdAt: editingLetter?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setCurrentStep('timeline');

      // Simulate progression through timeline
      setTimeout(() => {
        onSaved(letterData);
      }, 3000);

    } catch (error) {
      console.error('Failed to submit letter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'form': return editingLetter ? 'Edit Letter Request' : 'Create New Letter';
      case 'review': return 'Review & Confirm';
      case 'timeline': return 'Letter in Progress';
      case 'preview': return 'Letter Complete';
      default: return 'Letter Generation';
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 'form': return 'Provide details about the letter you need';
      case 'review': return 'Review your information before submission';
      case 'timeline': return 'Track the progress of your letter';
      case 'preview': return 'Your letter is ready for download';
      default: return '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {getStepTitle()}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {getStepDescription()}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto max-h-[calc(90vh-140px)]">
            <AnimatePresence mode="wait">
              {/* Form Step */}
              {currentStep === 'form' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-8"
                >
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                        <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Letter Details
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormInput
                        label="Letter Subject"
                        value={formData.subject}
                        onChange={(value) => updateFormData('subject', value)}
                        placeholder="Brief description of the letter's purpose"
                        required
                        error={errors.subject}
                        icon={<FileText className="w-4 h-4" />}
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Letter Type <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {letterTypes.map((type) => (
                            <OptionCard
                              key={type.value}
                              selected={formData.letterType === type.value}
                              onClick={() => updateFormData('letterType', type.value)}
                              icon={<type.icon className="w-4 h-4" />}
                              title={type.label}
                              description={type.description}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    <FormInput
                      label="Letter Description"
                      value={formData.description}
                      onChange={(value) => updateFormData('description', value)}
                      placeholder="Describe the situation, what you want to accomplish, and any relevant details..."
                      required
                      error={errors.description}
                      rows={4}
                      description="Provide as much detail as possible to help us create an effective letter"
                    />
                  </div>

                  {/* Recipient Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Recipient Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormInput
                        label="Recipient Name"
                        value={formData.recipientName}
                        onChange={(value) => updateFormData('recipientName', value)}
                        placeholder="Full name of the person or organization"
                        required
                        error={errors.recipientName}
                        icon={<User className="w-4 h-4" />}
                      />

                      <FormInput
                        label="Title/Position"
                        value={formData.recipientTitle || ''}
                        onChange={(value) => updateFormData('recipientTitle', value)}
                        placeholder="e.g., CEO, Manager, Director (optional)"
                        icon={<Briefcase className="w-4 h-4" />}
                      />

                      <FormInput
                        label="Organization"
                        value={formData.recipientOrganization || ''}
                        onChange={(value) => updateFormData('recipientOrganization', value)}
                        placeholder="Company or organization name (optional)"
                        icon={<Building className="w-4 h-4" />}
                      />

                      <FormInput
                        label="Recipient Address"
                        value={formData.recipientAddress}
                        onChange={(value) => updateFormData('recipientAddress', value)}
                        placeholder="Full mailing address"
                        required
                        error={errors.recipientAddress}
                        icon={<MapPin className="w-4 h-4" />}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Sender Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Your Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <FormInput
                        label="Your Name"
                        value={formData.senderName}
                        onChange={(value) => updateFormData('senderName', value)}
                        placeholder="Your full name"
                        required
                        error={errors.senderName}
                        icon={<User className="w-4 h-4" />}
                      />

                      <FormInput
                        label="Your Address"
                        value={formData.senderAddress || ''}
                        onChange={(value) => updateFormData('senderAddress', value)}
                        placeholder="Your mailing address (optional)"
                        icon={<MapPin className="w-4 h-4" />}
                        rows={3}
                      />
                    </div>
                  </div>

                  {/* Letter Options */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                        <Settings className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Letter Options
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Urgency */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Urgency Level
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {urgencyLevels.map((level) => (
                            <OptionCard
                              key={level.value}
                              selected={formData.urgency === level.value}
                              onClick={() => updateFormData('urgency', level.value)}
                              icon={<Flag className="w-4 h-4" />}
                              title={level.label}
                              description={level.description}
                              color={level.color}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Tone */}
                      <div className="space-y-3">
                        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Letter Tone
                        </label>
                        <div className="grid grid-cols-1 gap-2">
                          {toneOptions.map((tone) => (
                            <OptionCard
                              key={tone.value}
                              selected={formData.tone === tone.value}
                              onClick={() => updateFormData('tone', tone.value)}
                              icon={<Sparkles className="w-4 h-4" />}
                              title={tone.label}
                              description={tone.description}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Deadline Option */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          onClick={() => updateFormData('includeDeadline', !formData.includeDeadline)}
                          className={`
                            w-6 h-6 rounded-md border-2 flex items-center justify-center transition-all duration-200
                            ${formData.includeDeadline
                              ? 'bg-blue-500 border-blue-500 text-white'
                              : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                            }
                          `}
                        >
                          {formData.includeDeadline && <CheckCircle className="w-4 h-4" />}
                        </motion.button>
                        <label className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          Include Response Deadline
                        </label>
                      </div>

                      {formData.includeDeadline && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <FormInput
                            label="Deadline Date"
                            type="date"
                            value={formData.deadline || ''}
                            onChange={(value) => updateFormData('deadline', value)}
                            error={errors.deadline}
                            icon={<Calendar className="w-4 h-4" />}
                            description="Specify when you need a response by"
                          />
                        </motion.div>
                      )}
                    </div>

                    <FormInput
                      label="Additional Instructions"
                      value={formData.additionalInstructions}
                      onChange={(value) => updateFormData('additionalInstructions', value)}
                      placeholder="Any specific requirements, legal references, or special instructions..."
                      rows={3}
                      description="Optional: Include any special requirements or references"
                    />
                  </div>
                </motion.div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6 space-y-6"
                >
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          Review Your Letter Request
                        </h3>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          Please review all details below before submitting. You can go back to make changes if needed.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div className="space-y-6">
                    {/* Letter Details */}
                    <div className="legal-card p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Letter Details
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Subject</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{formData.subject}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Type</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {letterTypes.find(t => t.value === formData.letterType)?.label}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Urgency</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{formData.urgency}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Tone</p>
                          <p className="font-medium text-gray-900 dark:text-gray-100 capitalize">{formData.tone}</p>
                        </div>
                      </div>
                      {formData.description && (
                        <div className="mt-4">
                          <p className="text-gray-600 dark:text-gray-400 mb-2">Description</p>
                          <p className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            {formData.description}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Recipient Info */}
                    <div className="legal-card p-6">
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Recipient Information
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="font-medium text-gray-900 dark:text-gray-100">{formData.recipientName}</p>
                        {formData.recipientTitle && (
                          <p className="text-gray-600 dark:text-gray-400">{formData.recipientTitle}</p>
                        )}
                        {formData.recipientOrganization && (
                          <p className="text-gray-600 dark:text-gray-400">{formData.recipientOrganization}</p>
                        )}
                        <p className="text-gray-600 dark:text-gray-400 whitespace-pre-line">{formData.recipientAddress}</p>
                      </div>
                    </div>

                    {/* Options */}
                    {(formData.includeDeadline || formData.additionalInstructions) && (
                      <div className="legal-card p-6">
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                          <Settings className="w-4 h-4" />
                          Additional Options
                        </h4>
                        <div className="space-y-3 text-sm">
                          {formData.includeDeadline && formData.deadline && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Response Deadline</p>
                              <p className="font-medium text-gray-900 dark:text-gray-100">
                                {new Date(formData.deadline).toLocaleDateString()}
                              </p>
                            </div>
                          )}
                          {formData.additionalInstructions && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-400 mb-2">Additional Instructions</p>
                              <p className="text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                {formData.additionalInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Timeline Step */}
              {currentStep === 'timeline' && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="p-6"
                >
                  <div className="max-w-2xl mx-auto">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                        Your Letter is Being Created
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">
                        Our AI and legal team are working together to create your professional letter
                      </p>
                    </div>

                    <div className="space-y-4">
                      {timelineSteps.map((step, index) => (
                        <TimelineStep
                          key={step.id}
                          step={step}
                          isLast={index === timelineSteps.length - 1}
                        />
                      ))}
                    </div>

                    <div className="mt-8 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
                      <div className="flex items-start gap-3">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                            Estimated Completion Time
                          </h4>
                          <p className="text-sm text-amber-700 dark:text-amber-300">
                            Your letter should be ready within 4-6 hours. You'll receive an email notification when it's complete.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2">
              {currentStep !== 'timeline' && (
                <>
                  {currentStep === 'review' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep('form')}
                      className="btn-secondary inline-flex items-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Back to Edit
                    </motion.button>
                  )}
                </>
              )}
            </div>

            <div className="flex items-center gap-3">
              {currentStep === 'timeline' ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onClose}
                  className="btn-primary"
                >
                  Close
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleNext}
                  disabled={isSubmitting}
                  className="btn-primary inline-flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Submitting...
                    </>
                  ) : currentStep === 'form' ? (
                    <>
                      Review Request
                      <ArrowRight className="w-4 h-4" />
                    </>
                  ) : (
                    <>
                      Submit Request
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};