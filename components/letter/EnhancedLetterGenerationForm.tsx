import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User,
  MapPin,
  Scale,
  Send,
  FileText,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
  Eye,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../services/supabase';
import { AnimatedTimeline } from './AnimatedTimeline';

interface LetterFormData {
  senderName: string;
  senderAddress: string;
  attorneyName: string;
  recipientName: string;
  matter: string;
  desiredResolution: string;
  letterType: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
}

interface EnhancedLetterGenerationFormProps {
  onClose: () => void;
  onLetterCreated?: (letterId: string) => void;
}

const LETTER_TYPES = [
  { value: 'demand', label: 'Demand Letter', description: 'Request payment or action' },
  { value: 'cease_desist', label: 'Cease and Desist', description: 'Stop unwanted behavior' },
  { value: 'complaint', label: 'Formal Complaint', description: 'File a formal complaint' },
  { value: 'response', label: 'Response Letter', description: 'Respond to correspondence' },
  { value: 'notice', label: 'Legal Notice', description: 'Provide legal notification' },
  { value: 'settlement', label: 'Settlement Offer', description: 'Propose settlement terms' },
  { value: 'general', label: 'General Legal Letter', description: 'Custom legal correspondence' },
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low Priority', color: 'bg-gray-100 text-gray-700' },
  { value: 'medium', label: 'Medium Priority', color: 'bg-blue-100 text-blue-700' },
  { value: 'high', label: 'High Priority', color: 'bg-orange-100 text-orange-700' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
];

export const EnhancedLetterGenerationForm: React.FC<EnhancedLetterGenerationFormProps> = ({
  onClose,
  onLetterCreated
}) => {
  const { user, profile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LetterFormData>({
    senderName: '',
    senderAddress: '',
    attorneyName: '',
    recipientName: '',
    matter: '',
    desiredResolution: '',
    letterType: '',
    priority: 'medium'
  });
  const [errors, setErrors] = useState<Partial<LetterFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [letterId, setLetterId] = useState<string | null>(null);
  const [showTimeline, setShowTimeline] = useState(false);

  const validateStep = (step: number): boolean => {
    const newErrors: Partial<LetterFormData> = {};

    switch (step) {
      case 1:
        if (!formData.senderName.trim()) newErrors.senderName = 'Sender name is required';
        if (!formData.senderAddress.trim()) newErrors.senderAddress = 'Sender address is required';
        if (!formData.attorneyName.trim()) newErrors.attorneyName = 'Attorney/Law firm name is required';
        break;
      case 2:
        if (!formData.recipientName.trim()) newErrors.recipientName = 'Recipient name is required';
        if (!formData.letterType) newErrors.letterType = 'Letter type is required';
        break;
      case 3:
        if (!formData.matter.trim()) newErrors.matter = 'Matter/subject is required';
        if (!formData.desiredResolution.trim()) newErrors.desiredResolution = 'Desired resolution is required';
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LetterFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3) || !user) return;

    setIsSubmitting(true);

    try {
      // Check if user has subscription and remaining letters
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single();

      if (subError || !subscription) {
        throw new Error('No active subscription found. Please subscribe to generate letters.');
      }

      if (subscription.letters_used >= subscription.letters_allowed) {
        throw new Error('You have used all your letter credits. Please upgrade your subscription.');
      }

      // Create letter entry
      const { data: letter, error: letterError } = await supabase
        .from('letters')
        .insert({
          user_id: user.id,
          title: `${formData.letterType.replace('_', ' ')} - ${formData.matter}`,
          letter_type: formData.letterType,
          sender_name: formData.senderName,
          sender_address: formData.senderAddress,
          attorney_name: formData.attorneyName,
          recipient_name: formData.recipientName,
          matter: formData.matter,
          desired_resolution: formData.desiredResolution,
          priority: formData.priority,
          status: 'submitted',
          timeline_status: 'received'
        })
        .select()
        .single();

      if (letterError) throw letterError;

      // Initialize timeline
      await supabase.rpc('update_letter_timeline', {
        letter_id_param: letter.id,
        new_status: 'received',
        message_param: 'Your letter request has been received and is being processed.'
      });

      // Update subscription usage
      await supabase
        .from('subscriptions')
        .update({ letters_used: subscription.letters_used + 1 })
        .eq('id', subscription.id);

      // Trigger AI generation (this would call the generate-draft edge function)
      const { error: generationError } = await supabase.functions.invoke('generate-draft', {
        body: {
          letterId: letter.id,
          letterRequest: formData,
          userId: user.id
        }
      });

      if (generationError) {
        console.error('Error generating draft:', generationError);
        // Don't fail the submission, just log the error
      }

      setLetterId(letter.id);
      setShowTimeline(true);

      if (onLetterCreated) {
        onLetterCreated(letter.id);
      }

    } catch (error: any) {
      console.error('Error submitting letter:', error);
      setErrors({ matter: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  if (showTimeline && letterId) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Letter Submitted!</h2>
            <p className="text-gray-600">Your letter is now being processed by our AI system.</p>
          </div>

          <AnimatedTimeline letterId={letterId} />

          <div className="flex justify-center mt-8">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Generate Legal Letter</h2>
            <p className="text-gray-600 mt-1">Step {currentStep} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Progress</span>
            <span className="text-sm font-medium text-gray-500">{Math.round((currentStep / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              className="bg-blue-600 h-2 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <User className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Sender Information</h3>
                <p className="text-gray-600">Tell us about you and your legal representation</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={formData.senderName}
                    onChange={(e) => handleInputChange('senderName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.senderName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., John Smith"
                  />
                  {errors.senderName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.senderName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attorney/Law Firm Name *
                  </label>
                  <input
                    type="text"
                    autoComplete="organization"
                    value={formData.attorneyName}
                    onChange={(e) => handleInputChange('attorneyName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.attorneyName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Smith & Associates Law Firm"
                  />
                  {errors.attorneyName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.attorneyName}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Address *
                </label>
                <textarea
                  autoComplete="street-address"
                  value={formData.senderAddress}
                  onChange={(e) => handleInputChange('senderAddress', e.target.value)}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.senderAddress ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., 123 Main Street, Suite 100, City, State 12345"
                />
                {errors.senderAddress && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.senderAddress}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <Send className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Letter Details</h3>
                <p className="text-gray-600">Specify the recipient and type of letter</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    autoComplete="name"
                    value={formData.recipientName}
                    onChange={(e) => handleInputChange('recipientName', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.recipientName ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="e.g., Jane Doe or ABC Company"
                  />
                  {errors.recipientName && (
                    <p className="text-red-500 text-sm mt-1 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.recipientName}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority Level
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => handleInputChange('priority', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PRIORITY_LEVELS.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Letter Type *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {LETTER_TYPES.map(type => (
                    <motion.div
                      key={type.value}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInputChange('letterType', type.value)}
                      className={`p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        formData.letterType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{type.label}</h4>
                      <p className="text-sm text-gray-600">{type.description}</p>
                    </motion.div>
                  ))}
                </div>
                {errors.letterType && (
                  <p className="text-red-500 text-sm mt-2 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.letterType}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              variants={stepVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Letter Content</h3>
                <p className="text-gray-600">Describe the matter and desired outcome</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matter/Subject *
                </label>
                <textarea
                  value={formData.matter}
                  onChange={(e) => handleInputChange('matter', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.matter ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Describe the issue, dispute, or matter that needs to be addressed in detail..."
                />
                {errors.matter && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.matter}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Desired Resolution *
                </label>
                <textarea
                  value={formData.desiredResolution}
                  onChange={(e) => handleInputChange('desiredResolution', e.target.value)}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.desiredResolution ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="What specific outcome do you want? What action should the recipient take?"
                />
                {errors.desiredResolution && (
                  <p className="text-red-500 text-sm mt-1 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.desiredResolution}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={currentStep === 1 ? onClose : handlePrevious}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            {currentStep === 1 ? 'Cancel' : 'Previous'}
          </button>

          {currentStep < 3 ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleNext}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>Next</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Generate Letter</span>
                </>
              )}
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};