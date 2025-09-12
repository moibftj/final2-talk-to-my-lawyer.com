import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { LETTER_TEMPLATES, IconSpinner } from '../constants';
import { ShinyButton } from './magicui/shiny-button';
import { ShimmerButton } from './magicui/shimmer-button';
import { SparklesText } from './magicui/sparkles-text';
import { BlurFade } from './magicui/blur-fade';
import { NeonGradientCard } from './magicui/neon-gradient-card';
import { RetroGrid } from './magicui/retro-grid';
import { Spotlight } from './magicui/spotlight';
import { generateLetterDraft, LetterTone, LetterLength } from '../services/aiService';
import { isValidEmail } from '../lib/utils';
import type { LetterRequest, LetterTemplate } from '../types';
import { Tooltip } from './Tooltip';
import { CompletionBanner, useBanners } from './CompletionBanner';
import { motion, AnimatePresence } from 'framer-motion';

// Enhanced responsive form components
const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement> & { required?: boolean }> = ({ className, required, children, ...props }) => (
  <label className={`block text-sm font-semibold text-slate-700 dark:text-slate-200 mb-2 ${className}`} {...props}>
    {children}
    {required && <span className="text-red-500 ml-1">*</span>}
  </label>
);

const InputWithIcon: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { 
  icon?: React.ReactNode; 
  error?: string;
}> = ({ className, icon, error, ...props }) => (
  <div className="relative">
    <div className="relative">
      <input 
        className={`w-full h-12 sm:h-14 ${icon ? 'pl-12' : 'pl-4'} pr-4 rounded-xl border-2 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 hover:bg-white/80 dark:hover:bg-slate-800/80 ${
          error 
            ? 'border-red-400 focus:border-red-500 focus:bg-red-50/50 dark:focus:bg-red-900/20' 
            : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800'
        } ${className}`} 
        {...props} 
      />
      {icon && (
        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${
          error ? 'text-red-500' : 'text-slate-400'
        }`}>
          {icon}
        </div>
      )}
    </div>
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement> & { 
  icon?: React.ReactNode;
}> = ({ className, children, icon, ...props }) => (
  <div className="relative">
    <select 
      className={`w-full h-12 sm:h-14 ${icon ? 'pl-12' : 'pl-4'} pr-10 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/80 appearance-none ${className}`} 
      {...props}
    >
      {children}
    </select>
    {icon && (
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
        {icon}
      </div>
    )}
    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  </div>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { 
  error?: string;
}> = ({ className, error, ...props }) => (
  <div className="relative">
    <textarea 
      className={`w-full min-h-[120px] p-4 rounded-xl border-2 transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/20 hover:bg-white/80 dark:hover:bg-slate-800/80 resize-none ${
        error 
          ? 'border-red-400 focus:border-red-500 focus:bg-red-50/50 dark:focus:bg-red-900/20' 
          : 'border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800'
      } ${className}`} 
      {...props} 
    />
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          className="flex items-center gap-2 mt-2 text-sm text-red-600 dark:text-red-400"
        >
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

// Icon components
const TemplateIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TitleIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
  </svg>
);

const ToneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 16h14L17 4M11 9v8M13 9v8" />
  </svg>
);

const LengthIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EmailIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);

const SaveIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const FormattedDraft: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[Information Not Provided\])/g);
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <div className="whitespace-pre-wrap text-slate-800 dark:text-slate-200 leading-relaxed">
        {parts.map((part, index) => {
          if (part === '[Information Not Provided]') {
            return (
              <motion.span 
                key={index} 
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="inline-block bg-gradient-to-r from-red-100 to-orange-100 dark:from-red-900/50 dark:to-orange-900/50 text-red-700 dark:text-red-300 font-semibold px-2 py-1 rounded-md border border-red-200 dark:border-red-700"
              >
                {part}
              </motion.span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    </div>
  );
};

interface LetterRequestFormProps {
  onFormSubmit: (letterData: Partial<LetterRequest>) => Promise<void>;
  onCancel: () => void;
  letterToEdit?: LetterRequest | null;
}

export const LetterRequestForm: React.FC<LetterRequestFormProps> = ({ onFormSubmit, onCancel, letterToEdit }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<LetterTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [title, setTitle] = useState('');
  const [additionalContext, setAdditionalContext] = useState('');
  const [tone, setTone] = useState<LetterTone>('Formal');
  const [length, setLength] = useState<LetterLength>('Medium');
  
  const [aiDraft, setAiDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [showSendForm, setShowSendForm] = useState(false);
  const [attorneyEmail, setAttorneyEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [sendSuccess, setSendSuccess] = useState(false);

  const { banners, showSuccess, showError, showInfo } = useBanners();

  useEffect(() => {
    if (letterToEdit) {
      const template = LETTER_TEMPLATES.find(t => t.value === letterToEdit.letterType) || null;
      setSelectedTemplate(template);
      setTitle(letterToEdit.title);
      setFormData(letterToEdit.templateData || {});
      setAdditionalContext(letterToEdit.description || '');
      setAiDraft(letterToEdit.aiGeneratedContent || '');
    } else {
        // Set default template
        const defaultTemplate = LETTER_TEMPLATES[0];
        setSelectedTemplate(defaultTemplate);
        setFormData(
          defaultTemplate.requiredFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {})
        );
    }
  }, [letterToEdit]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template = LETTER_TEMPLATES.find(t => t.value === e.target.value) || null;
    setSelectedTemplate(template);
    setFormData(
      template ? template.requiredFields.reduce((acc, field) => ({ ...acc, [field]: '' }), {}) : {}
    );
  };

  const handleFieldChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerateDraft = async () => {
    if (!selectedTemplate) return;
    setIsGenerating(true);
    setError(null);
    setAiDraft('');
    showInfo('Generating Draft', 'AI is analyzing your inputs and creating a professional letter...');
    try {
      const draft = await generateLetterDraft({
        title,
        templateBody: selectedTemplate.body,
        templateFields: formData,
        additionalContext,
        tone,
        length,
      });
      setAiDraft(draft);
      showSuccess('Draft Generated!', 'Your AI-powered letter draft is ready for review.');
    } catch (err: any) {
      setError(err.message);
      showError('Generation Failed', err.message || 'Unable to generate draft. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLetter = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    showInfo('Saving Letter', 'Saving your letter to the dashboard...');
    try {
        const letterData: Partial<LetterRequest> = {
            id: letterToEdit?.id,
            title,
            letterType: selectedTemplate.value,
            description: additionalContext,
            templateData: formData,
            aiGeneratedContent: aiDraft,
            status: letterToEdit?.status || 'draft',
            priority: letterToEdit?.priority || 'medium',
        };
        await onFormSubmit(letterData);
        showSuccess('Letter Saved!', 'Your letter has been saved to your dashboard.');
    } catch (error) {
        console.error("Failed to save letter:", error);
        setError("Could not save the letter. Please try again.");
        showError('Save Failed', 'Could not save the letter. Please try again.');
    } finally {
        setIsSaving(false);
    }
  };

  const handleSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    showInfo('Sending Email', `Sending your letter draft to ${attorneyEmail}...`);
    console.log(`Simulating sending email to: ${attorneyEmail} with content: ${aiDraft}`);
    // Simulate API call
    setTimeout(() => {
        setSendSuccess(true);
        setIsSending(false);
        showSuccess('Email Sent!', `Your letter draft has been successfully sent to ${attorneyEmail}`);
        setTimeout(() => {
            setShowSendForm(false);
            setSendSuccess(false);
            setAttorneyEmail('');
        }, 3000);
    }, 1000);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setAttorneyEmail(email);
    if (email && !isValidEmail(email)) {
        setEmailError("Please enter a valid email.");
    } else {
        setEmailError(null);
    }
  };
  
  const handleExportPdf = () => {
    if (!aiDraft) return;
    setIsExporting(true);
    showInfo('Exporting PDF', 'Creating your PDF document...');
    // Simulate processing time
    setTimeout(() => {
        const doc = new jsPDF();
        const margin = 15;
        const pageWidth = doc.internal.pageSize.getWidth();
        const usableWidth = pageWidth - margin * 2;
        
        doc.setFontSize(16);
        doc.text(title, pageWidth / 2, margin, { align: 'center' });
        
        doc.setFontSize(12);
        const lines = doc.splitTextToSize(aiDraft, usableWidth);
        doc.text(lines, margin, margin + 15);
        
        const safeFilename = title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'letter_draft';
        doc.save(`${safeFilename}.pdf`);
        setIsExporting(false);
        showSuccess('PDF Exported!', `${safeFilename}.pdf has been downloaded to your device.`);
    }, 500);
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-indigo-950">
      {/* Background Effects */}
      <RetroGrid className="opacity-10" />
      <Spotlight className="absolute -top-40 left-0 md:left-60 md:-top-20" fill="rgba(99, 102, 241, 0.3)" />
      
      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-60 h-60 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 min-h-screen p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <BlurFade delay={0.1} inView>
          <div className="max-w-7xl mx-auto mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
                  {letterToEdit ? 'Edit Letter' : 'Create Legal Letter'}
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-2 text-sm sm:text-base">
                  Generate professional legal documents with AI assistance
                </p>
              </div>
              <Tooltip text="Cancel and return to dashboard">
                <button 
                  onClick={onCancel} 
                  className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-300 rounded-lg hover:bg-white/50 dark:hover:bg-slate-800/50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  <span className="hidden sm:inline">Back</span>
                </button>
              </Tooltip>
            </div>
          </div>
        </BlurFade>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
          {/* Left Column - Form */}
          <BlurFade delay={0.2} inView>
            <NeonGradientCard className="w-full">
              <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl blur-xl -z-10" />
                
                <div className="space-y-6">
                  {/* Template Selection */}
                  <div>
                    <Label htmlFor="template" required>Select Template</Label>
                    <Tooltip text="Choose a legal letter template that best matches your situation">
                      <Select 
                        id="template" 
                        value={selectedTemplate?.value || ''} 
                        onChange={handleTemplateChange}
                        icon={<TemplateIcon />}
                      >
                        {LETTER_TEMPLATES.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </Select>
                    </Tooltip>
                    {selectedTemplate && (
                      <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-xs text-slate-500 dark:text-slate-400 mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
                      >
                        ℹ️ {selectedTemplate.description}
                      </motion.p>
                    )}
                  </div>

                  {/* Dynamic Template Fields */}
                  <AnimatePresence>
                    {selectedTemplate && selectedTemplate.requiredFields.map((field, index) => (
                      <motion.div
                        key={field}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Label htmlFor={field} required>{field}</Label>
                        <Tooltip text={`Enter the ${field.toLowerCase()} for this legal matter`}>
                          <InputWithIcon 
                            id={field} 
                            value={formData[field] || ''} 
                            onChange={(e) => handleFieldChange(field, e.target.value)}
                            placeholder={`Enter ${field.toLowerCase()}`}
                          />
                        </Tooltip>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Letter Title */}
                  <div>
                    <Label htmlFor="title" required>Letter Title</Label>
                    <Tooltip text="Enter a clear, descriptive title for your letter">
                      <InputWithIcon
                        id="title" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="e.g., Final Demand for Payment"
                        icon={<TitleIcon />}
                      />
                    </Tooltip>
                  </div>

                  {/* Additional Context */}
                  <div>
                    <Label htmlFor="context">Additional Context (Optional)</Label>
                    <Tooltip text="Add any specific details, background information, or special circumstances" size="md">
                      <Textarea
                        id="context" 
                        value={additionalContext} 
                        onChange={(e) => setAdditionalContext(e.target.value)} 
                        placeholder="Provide any extra details the AI should consider..."
                      />
                    </Tooltip>
                  </div>

                  {/* Tone and Length */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tone" required>Tone of Voice</Label>
                      <Tooltip text="Choose the appropriate tone for your legal matter - formal for standard communications, aggressive for demands">
                        <Select 
                          id="tone" 
                          value={tone} 
                          onChange={e => setTone(e.target.value as LetterTone)}
                          icon={<ToneIcon />}
                        >
                          <option value="Formal">Formal</option>
                          <option value="Aggressive">Aggressive</option>
                          <option value="Conciliatory">Conciliatory</option>
                          <option value="Neutral">Neutral</option>
                        </Select>
                      </Tooltip>
                    </div>
                    
                    <div>
                      <Label htmlFor="length" required>Letter Length</Label>
                      <Tooltip text="Select letter length - Short (1 paragraph), Medium (2-3 paragraphs), Long (detailed)">
                        <Select 
                          id="length" 
                          value={length} 
                          onChange={e => setLength(e.target.value as LetterLength)}
                          icon={<LengthIcon />}
                        >
                          <option value="Short">Short</option>
                          <option value="Medium">Medium</option>
                          <option value="Long">Long</option>
                        </Select>
                      </Tooltip>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <div className="pt-4">
                    {isGenerating ? (
                      <Tooltip text="AI is generating your letter draft...">
                        <ShinyButton disabled className="w-full h-14 text-lg font-semibold">
                          <svg className="w-5 h-5 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <SparklesText>Generating AI Draft...</SparklesText>
                        </ShinyButton>
                      </Tooltip>
                    ) : (
                      <Tooltip text="Use AI to generate a professional legal letter based on your inputs">
                        <ShimmerButton 
                          onClick={handleGenerateDraft} 
                          className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                        >
                          ✨ Generate AI Draft
                        </ShimmerButton>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </NeonGradientCard>
          </BlurFade>

          {/* Right Column - Preview */}
          <BlurFade delay={0.4} inView>
            <div className="sticky top-8">
              <NeonGradientCard className="w-full">
                <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-blue-500/10 to-purple-500/10 rounded-2xl blur-xl -z-10" />
                  
                  {/* Header */}
                  <div className="p-6 sm:p-8 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-200">
                      AI Draft Preview
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
                      Your generated content will appear here
                    </p>
                  </div>

                  {/* Content */}
                  <div className="p-6 sm:p-8 min-h-[400px]">
                    {isGenerating && (
                      <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-3/4"></div>
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-full"></div>
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-5/6"></div>
                        <div className="h-4 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded w-4/5"></div>
                      </div>
                    )}
                    
                    {error && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-400 text-sm"
                      >
                        {error}
                      </motion.div>
                    )}
                    
                    {!isGenerating && !error && aiDraft && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                      >
                        <FormattedDraft text={aiDraft} />
                      </motion.div>
                    )}
                    
                    {!isGenerating && !error && !aiDraft && (
                      <div className="text-center py-12">
                        <div className="text-6xl mb-4">📄</div>
                        <p className="text-slate-500 dark:text-slate-400 font-medium">
                          Your AI-generated draft will appear here
                        </p>
                        <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
                          Fill out the form and click "Generate AI Draft" to begin
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  {aiDraft && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 }}
                      className="p-6 sm:p-8 border-t border-slate-200 dark:border-slate-700 space-y-4"
                    >
                      {/* Primary Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Tooltip text="Save this letter to your dashboard for later use" position="bottom">
                          <ShimmerButton 
                            onClick={handleSaveLetter} 
                            disabled={isSaving}
                            className="flex-1 h-12 font-semibold bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                          >
                            {isSaving ? (
                              <>
                                <IconSpinner className="w-5 h-5 mr-2 animate-spin" />
                                Saving...
                              </>
                            ) : (
                              <>
                                <SaveIcon />
                                <span className="ml-2">Save Letter</span>
                              </>
                            )}
                          </ShimmerButton>
                        </Tooltip>
                      </div>

                      {/* Secondary Actions */}
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Tooltip text="Download your letter as a PDF file" position="bottom">
                          <button 
                            onClick={handleExportPdf} 
                            disabled={isExporting}
                            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all duration-300 disabled:opacity-50"
                          >
                            {isExporting ? (
                              <>
                                <IconSpinner className="w-5 h-5 animate-spin" />
                                Exporting...
                              </>
                            ) : (
                              <>
                                <DownloadIcon />
                                Export PDF
                              </>
                            )}
                          </button>
                        </Tooltip>
                        
                        <Tooltip text="Send the letter draft directly to an attorney via email" position="bottom">
                          <button 
                            onClick={() => setShowSendForm(prev => !prev)}
                            className="flex-1 flex items-center justify-center gap-2 h-12 px-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white/70 dark:bg-slate-800/70 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition-all duration-300"
                          >
                            <EmailIcon />
                            Send Email
                          </button>
                        </Tooltip>
                      </div>

                      {/* Email Form */}
                      <AnimatePresence>
                        {showSendForm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-slate-200 dark:border-slate-700 pt-4"
                          >
                            {sendSuccess ? (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-4"
                              >
                                <div className="text-4xl mb-2">✅</div>
                                <p className="text-green-600 dark:text-green-400 font-medium">
                                  Draft sent successfully!
                                </p>
                              </motion.div>
                            ) : (
                              <form onSubmit={handleSendEmail} className="space-y-4">
                                <div>
                                  <Label htmlFor="attorney-email" required>Attorney's Email</Label>
                                  <InputWithIcon 
                                    id="attorney-email" 
                                    type="email" 
                                    placeholder="attorney@lawfirm.com"
                                    value={attorneyEmail}
                                    onChange={handleEmailChange}
                                    icon={<EmailIcon />}
                                    error={emailError}
                                    required
                                  />
                                </div>
                                
                                <Tooltip text="Send the draft letter to the attorney's email address">
                                  <ShimmerButton 
                                    type="submit" 
                                    className="w-full h-12 font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" 
                                    disabled={!attorneyEmail || !!emailError || isSending}
                                  >
                                    {isSending ? (
                                      <>
                                        <IconSpinner className="w-5 h-5 mr-2 animate-spin" />
                                        Sending...
                                      </>
                                    ) : (
                                      '📧 Send Draft'
                                    )}
                                  </ShimmerButton>
                                </Tooltip>
                              </form>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </div>
              </NeonGradientCard>
            </div>
          </BlurFade>
        </div>
      </div>
      
      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};