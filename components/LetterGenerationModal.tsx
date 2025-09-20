import React, { useState, useEffect } from 'react';
import { X, ArrowLeft, ArrowRight, FileText, User, Settings, Send } from 'lucide-react';
import { LETTER_TEMPLATES } from '../constants';
import { generateLetterDraft, LetterTone, LetterLength } from '../services/aiService';
import { isValidEmail } from '../lib/utils';
import type { LetterRequest, LetterTemplate } from '../types';
import { LoaderOne } from './ui/loader-one';
import { ShinyButton } from './magicui/shiny-button';
import { CompletionBanner, useBanners } from './CompletionBanner';

interface LetterGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (letterData: Partial<LetterRequest>) => Promise<void>;
  letterToEdit?: LetterRequest | null;
}

type Step = 'template' | 'details' | 'generation' | 'preview';

const stepConfig = {
  template: { title: 'Choose Template', icon: FileText, description: 'Select the type of letter you need' },
  details: { title: 'Letter Details', icon: User, description: 'Provide recipient and context information' },
  generation: { title: 'AI Generation', icon: Settings, description: 'Customize tone and generate your letter' },
  preview: { title: 'Review & Send', icon: Send, description: 'Review your letter and choose delivery method' }
};

interface FormData {
  selectedTemplate: LetterTemplate | null;
  title: string;
  recipientName: string;
  recipientAddress: string;
  recipientEmail: string;
  senderName: string;
  senderAddress: string;
  additionalContext: string;
  templateFields: Record<string, string>;
  tone: LetterTone;
  length: LetterLength;
  generatedContent: string;
}

export const LetterGenerationModal: React.FC<LetterGenerationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  letterToEdit
}) => {
  const [currentStep, setCurrentStep] = useState<Step>('template');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { banners, showSuccess, showError, showInfo } = useBanners();

  const [formData, setFormData] = useState<FormData>({
    selectedTemplate: null,
    title: '',
    recipientName: '',
    recipientAddress: '',
    recipientEmail: '',
    senderName: '',
    senderAddress: '',
    additionalContext: '',
    templateFields: {},
    tone: 'professional',
    length: 'medium',
    generatedContent: ''
  });

  // Initialize form data when editing
  useEffect(() => {
    if (letterToEdit) {
      const template = LETTER_TEMPLATES.find(t => t.value === letterToEdit.letterType);
      setFormData({
        selectedTemplate: template || null,
        title: letterToEdit.title || '',
        recipientName: letterToEdit.recipientInfo?.name || '',
        recipientAddress: letterToEdit.recipientInfo?.address || '',
        recipientEmail: letterToEdit.recipientInfo?.email || '',
        senderName: letterToEdit.senderInfo?.name || '',
        senderAddress: letterToEdit.senderInfo?.address || '',
        additionalContext: letterToEdit.description || '',
        templateFields: letterToEdit.templateData || {},
        tone: 'professional',
        length: 'medium',
        generatedContent: letterToEdit.aiGeneratedContent || ''
      });
      if (letterToEdit.aiGeneratedContent) {
        setCurrentStep('preview');
      }
    }
  }, [letterToEdit]);

  const steps: Step[] = ['template', 'details', 'generation', 'preview'];
  const currentStepIndex = steps.indexOf(currentStep);

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const canProceedToNext = (): boolean => {
    switch (currentStep) {
      case 'template':
        return !!formData.selectedTemplate;
      case 'details':
        return !!(formData.title && formData.recipientName && formData.senderName);
      case 'generation':
        return !!formData.generatedContent;
      case 'preview':
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceedToNext() && currentStepIndex < steps.length - 1) {
      setCurrentStep(steps[currentStepIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStep(steps[currentStepIndex - 1]);
    }
  };

  const handleGenerateLetter = async () => {
    if (!formData.selectedTemplate) return;

    setIsGenerating(true);
    showInfo('Generating Letter', 'AI is crafting your personalized letter...');

    try {
      const generatedContent = await generateLetterDraft({
        title: formData.title,
        templateBody: formData.selectedTemplate.body,
        templateFields: formData.templateFields,
        additionalContext: formData.additionalContext,
        tone: formData.tone,
        length: formData.length
      });

      updateFormData({ generatedContent });
      showSuccess('Letter Generated', 'Your letter has been successfully generated!');
      handleNext();
    } catch (error) {
      console.error('Failed to generate letter:', error);
      showError('Generation Failed', 'Unable to generate letter. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.selectedTemplate) return;

    setIsSubmitting(true);
    showInfo('Saving Letter', 'Saving your letter to dashboard...');

    try {
      const letterData: Partial<LetterRequest> = {
        ...(letterToEdit?.id && { id: letterToEdit.id }),
        title: formData.title,
        letterType: formData.selectedTemplate.value,
        description: formData.additionalContext,
        recipientInfo: {
          name: formData.recipientName,
          address: formData.recipientAddress,
          email: formData.recipientEmail
        },
        senderInfo: {
          name: formData.senderName,
          address: formData.senderAddress
        },
        templateData: formData.templateFields,
        aiGeneratedContent: formData.generatedContent,
        status: 'submitted',
        priority: 'medium'
      };

      await onSubmit(letterData);
      onClose();
    } catch (error) {
      console.error('Failed to submit letter:', error);
      showError('Submit Failed', 'Unable to save letter. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {letterToEdit ? 'Edit Letter' : 'Generate New Letter'}
            </h2>
            <p className="text-gray-600 mt-1">{stepConfig[currentStep].description}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 bg-gray-50 border-b">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const StepIcon = stepConfig[step].icon;
              const isActive = currentStep === step;
              const isCompleted = index < currentStepIndex;

              return (
                <div key={step} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isActive
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-gray-300 text-gray-500'
                  }`}>
                    <StepIcon className="w-5 h-5" />
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div className={`text-sm font-medium ${
                      isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {stepConfig[step].title}
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-green-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {currentStep === 'template' && (
            <TemplateSelection
              selectedTemplate={formData.selectedTemplate}
              onSelectTemplate={(template) => updateFormData({ selectedTemplate: template })}
            />
          )}

          {currentStep === 'details' && (
            <DetailsForm
              formData={formData}
              updateFormData={updateFormData}
            />
          )}

          {currentStep === 'generation' && (
            <GenerationSettings
              formData={formData}
              updateFormData={updateFormData}
              onGenerate={handleGenerateLetter}
              isGenerating={isGenerating}
            />
          )}

          {currentStep === 'preview' && (
            <PreviewStep
              formData={formData}
              onRegenerateRequest={() => setCurrentStep('generation')}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t bg-gray-50">
          <button
            onClick={handlePrevious}
            disabled={currentStepIndex === 0}
            className="flex items-center px-4 py-2 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </button>

          <div className="flex items-center space-x-3">
            {currentStep === 'preview' ? (
              <ShinyButton
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2"
              >
                {isSubmitting ? 'Saving...' : letterToEdit ? 'Update Letter' : 'Save Letter'}
              </ShinyButton>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceedToNext()}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Render banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};

// Template Selection Step
const TemplateSelection: React.FC<{
  selectedTemplate: LetterTemplate | null;
  onSelectTemplate: (template: LetterTemplate) => void;
}> = ({ selectedTemplate, onSelectTemplate }) => (
  <div>
    <h3 className="text-lg font-semibold mb-4">Choose Letter Template</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {LETTER_TEMPLATES.map((template) => (
        <div
          key={template.value}
          onClick={() => onSelectTemplate(template)}
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            selectedTemplate?.value === template.value
              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <h4 className="font-medium text-gray-900">{template.label}</h4>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        </div>
      ))}
    </div>
  </div>
);

// Details Form Step
const DetailsForm: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
}> = ({ formData, updateFormData }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-semibold mb-4">Letter Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Letter Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Letter Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Brief description of your letter"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Context</label>
            <textarea
              value={formData.additionalContext}
              onChange={(e) => updateFormData({ additionalContext: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Any specific details or requirements for your letter"
            />
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Recipient Information</h4>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name *</label>
            <input
              type="text"
              value={formData.recipientName}
              onChange={(e) => updateFormData({ recipientName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Address</label>
            <textarea
              value={formData.recipientAddress}
              onChange={(e) => updateFormData({ recipientAddress: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email</label>
            <input
              type="email"
              value={formData.recipientEmail}
              onChange={(e) => updateFormData({ recipientEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="font-medium text-gray-700 mb-4">Sender Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
            <input
              type="text"
              value={formData.senderName}
              onChange={(e) => updateFormData({ senderName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Address</label>
            <textarea
              value={formData.senderAddress}
              onChange={(e) => updateFormData({ senderAddress: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Generation Settings Step
const GenerationSettings: React.FC<{
  formData: FormData;
  updateFormData: (updates: Partial<FormData>) => void;
  onGenerate: () => void;
  isGenerating: boolean;
}> = ({ formData, updateFormData, onGenerate, isGenerating }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold mb-4">AI Generation Settings</h3>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Tone</label>
        <select
          value={formData.tone}
          onChange={(e) => updateFormData({ tone: e.target.value as LetterTone })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="professional">Professional</option>
          <option value="formal">Formal</option>
          <option value="assertive">Assertive</option>
          <option value="friendly">Friendly</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
        <select
          value={formData.length}
          onChange={(e) => updateFormData({ length: e.target.value as LetterLength })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>
    </div>

    <div className="text-center">
      <button
        onClick={onGenerate}
        disabled={isGenerating}
        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105"
      >
        {isGenerating ? (
          <div className="flex items-center">
            <LoaderOne />
            <span className="ml-2">Generating Letter...</span>
          </div>
        ) : (
          'Generate Letter with AI'
        )}
      </button>
    </div>
  </div>
);

// Preview Step
const PreviewStep: React.FC<{
  formData: FormData;
  onRegenerateRequest: () => void;
}> = ({ formData, onRegenerateRequest }) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Letter Preview</h3>
      <button
        onClick={onRegenerateRequest}
        className="px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
      >
        Regenerate
      </button>
    </div>

    <div className="border rounded-lg p-6 bg-gray-50 max-h-96 overflow-y-auto">
      <div className="prose prose-sm max-w-none">
        <div className="whitespace-pre-wrap text-gray-800">
          {formData.generatedContent || 'No content generated yet.'}
        </div>
      </div>
    </div>

    <div className="text-sm text-gray-600">
      <strong>Recipient:</strong> {formData.recipientName} ({formData.recipientEmail})<br />
      <strong>Template:</strong> {formData.selectedTemplate?.label}<br />
      <strong>Tone:</strong> {formData.tone} | <strong>Length:</strong> {formData.length}
    </div>
  </div>
);