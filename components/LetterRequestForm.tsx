import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from './Card';
import { LETTER_TEMPLATES } from '../constants';
import { LoaderOne } from './ui/loader-one';
import { ShinyButton } from './magicui/shiny-button';
import { ShimmerButton } from './magicui/shimmer-button';
import { SparklesText } from './magicui/sparkles-text';
import { Tooltip } from './Tooltip';
import { CompletionBanner, useBanners } from './CompletionBanner';
import {
  generateLetterDraft,
  LetterTone,
  LetterLength,
} from '../services/aiService';
import { isValidEmail } from '../lib/utils';
import type { LetterRequest, LetterTemplate } from '../types';

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  className,
  ...props
}) => (
  <label
    className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`}
    {...props}
  />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({
  className,
  ...props
}) => (
  <input
    className={`mt-1 flex h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
    {...props}
  />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({
  className,
  children,
  ...props
}) => (
  <select
    className={`mt-1 flex h-8 sm:h-9 md:h-10 lg:h-11 xl:h-12 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
    {...props}
  >
    {children}
  </select>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({
  className,
  ...props
}) => (
  <textarea
    className={`mt-1 flex min-h-[60px] sm:min-h-[80px] md:min-h-[100px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm md:text-base ring-offset-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200 ${className}`}
    {...props}
  />
);

const IconDownload: React.FC<React.SVGProps<SVGSVGElement>> = props => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='none'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' />
    <polyline points='7 10 12 15 17 10' />
    <line x1='12' y1='15' x2='12' y2='3' />
  </svg>
);

const FormattedDraft: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[Information Not Provided\])/g);
  return (
    <div className='prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-300'>
      <p className='whitespace-pre-wrap'>
        {parts.map((part, index) => {
          if (part === '[Information Not Provided]') {
            return (
              <strong
                key={index}
                className='text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1 rounded-sm'
              >
                {part}
              </strong>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    </div>
  );
};

interface LetterRequestFormProps {
  onFormSubmit: (letterData: Partial<LetterRequest>) => Promise<void>;
  onCancel: () => void;
  letterToEdit?: LetterRequest | null;
}

export const LetterRequestForm: React.FC<LetterRequestFormProps> = ({
  onFormSubmit,
  onCancel,
  letterToEdit,
}) => {
  const { banners, showSuccess, showError, showInfo } = useBanners();
  const [selectedTemplate, setSelectedTemplate] =
    useState<LetterTemplate | null>(null);
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

  useEffect(() => {
    if (letterToEdit) {
      const template =
        LETTER_TEMPLATES.find(t => t.value === letterToEdit.letterType) || null;
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
        defaultTemplate.requiredFields.reduce(
          (acc, field) => ({ ...acc, [field]: '' }),
          {}
        )
      );
    }
  }, [letterToEdit]);

  const handleTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const template =
      LETTER_TEMPLATES.find(t => t.value === e.target.value) || null;
    setSelectedTemplate(template);
    setFormData(
      template
        ? template.requiredFields.reduce(
            (acc, field) => ({ ...acc, [field]: '' }),
            {}
          )
        : {}
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
    showInfo(
      'Generating Draft',
      'AI is analyzing your inputs and creating a professional letter...'
    );
    try {
      let letterId = letterToEdit?.id;

      // If this is a new letter, save it first to get an ID
      if (!letterId) {
        const letterData = {
          title,
          letterType: selectedTemplate.value,
          description: additionalContext,
          templateData: formData,
          status: 'submitted' as const,
        };
        await onFormSubmit(letterData);
        letterId = crypto.randomUUID();
      }

      const draft = await generateLetterDraft({
        title,
        templateBody: selectedTemplate.body,
        templateFields: formData,
        additionalContext,
        tone,
        length,
        letterId, // Pass the letter ID
      });
      setAiDraft(draft);
      showSuccess(
        'Draft Generated!',
        'Your AI-powered letter draft is ready for review.'
      );
    } catch (err: any) {
      setError(err.message);
      showError(
        'Generation Failed',
        err.message || 'Unable to generate draft. Please try again.'
      );
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
        id: letterToEdit?.id, // Keep id if editing
        title,
        letterType: selectedTemplate.value,
        description: additionalContext,
        templateData: formData,
        aiGeneratedContent: aiDraft,
        status: letterToEdit?.status || 'draft',
        priority: letterToEdit?.priority || 'medium',
      };
      await onFormSubmit(letterData);
      showSuccess(
        'Letter Saved!',
        'Your letter has been saved to your dashboard.'
      );
    } catch (error) {
      console.error('Failed to save letter:', error);
      setError('Could not save the letter. Please try again.');
      showError('Save Failed', 'Could not save the letter. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    showInfo(
      'Sending Email',
      `Sending your letter draft to ${attorneyEmail}...`
    );

    try {
      // For now, create a mailto link with the letter content
      const subject = encodeURIComponent(`Legal Letter Draft: ${title}`);
      const body = encodeURIComponent(
        `Dear Attorney,\n\nPlease find below a draft legal letter for review:\n\n${aiDraft}\n\nBest regards,\n${formData['Your Name'] || 'Client'}`
      );
      const mailtoLink = `mailto:${attorneyEmail}?subject=${subject}&body=${body}`;

      // Open the email client
      window.open(mailtoLink, '_blank');

      setSendSuccess(true);
      setIsSending(false);
      showSuccess(
        'Email Client Opened!',
        `Your email client has been opened with the letter draft. Please send it to ${attorneyEmail}`
      );

      setTimeout(() => {
        setShowSendForm(false);
        setSendSuccess(false);
        setAttorneyEmail('');
      }, 3000);
    } catch (error) {
      console.error('Error sending email:', error);
      setIsSending(false);
      showError('Email Error', 'Failed to open email client. Please try again.');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setAttorneyEmail(email);
    if (email && !isValidEmail(email)) {
      setEmailError('Please enter a valid email.');
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

      const safeFilename =
        title.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'letter_draft';
      doc.save(`${safeFilename}.pdf`);
      setIsExporting(false);
      showSuccess(
        'PDF Exported!',
        `${safeFilename}.pdf has been downloaded to your device.`
      );
    }, 500);
  };

  return (
    <div className='w-full max-w-[320px] sm:max-w-2xl md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto p-2 sm:p-4 lg:p-6 xl:p-8'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-start'>
        <Card>
          <CardHeader>
            <CardTitle className='text-lg sm:text-xl md:text-2xl'>
              {letterToEdit ? 'Edit Letter' : 'Create a New Letter'}
            </CardTitle>
            <CardDescription className='text-xs sm:text-sm md:text-base'>
              Fill in the details below to generate an AI-powered draft.
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-3 sm:space-y-4 px-3 sm:px-4 lg:px-6'>
            <div>
              <Label htmlFor='template'>Select a Template</Label>
              <Tooltip text='Choose a legal letter template that best matches your situation'>
                <Select
                  id='template'
                  value={selectedTemplate?.value || ''}
                  onChange={handleTemplateChange}
                >
                  {LETTER_TEMPLATES.map(t => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Tooltip>
              {selectedTemplate && (
                <p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
                  {selectedTemplate.description}
                </p>
              )}
            </div>

            {selectedTemplate &&
              selectedTemplate.requiredFields.map(field => (
                <div key={field}>
                  <Label htmlFor={field}>{field}</Label>
                  <Tooltip
                    text={`Enter the ${field.toLowerCase()} for this legal matter`}
                  >
                    <Input
                      id={field}
                      value={formData[field] || ''}
                      onChange={e => handleFieldChange(field, e.target.value)}
                    />
                  </Tooltip>
                </div>
              ))}

            <div>
              <Label htmlFor='title'>Subject / Title of Letter</Label>
              <Tooltip text='Enter a clear, descriptive title for your letter'>
                <Input
                  id='title'
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder='e.g., Final Demand for Payment'
                />
              </Tooltip>
            </div>

            <div>
              <Label htmlFor='context'>Additional Context (Optional)</Label>
              <Tooltip
                text='Add any specific details, background information, or special circumstances'
                size='md'
              >
                <Textarea
                  id='context'
                  value={additionalContext}
                  onChange={e => setAdditionalContext(e.target.value)}
                  placeholder='Provide any extra details the AI should consider...'
                />
              </Tooltip>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
              <div>
                <Label htmlFor='tone'>Tone of Voice</Label>
                <Tooltip text='Choose the appropriate tone for your legal matter - formal for standard communications, aggressive for demands'>
                  <Select
                    id='tone'
                    value={tone}
                    onChange={e => setTone(e.target.value as LetterTone)}
                  >
                    <option>Formal</option>
                    <option>Aggressive</option>
                    <option>Conciliatory</option>
                    <option>Neutral</option>
                  </Select>
                </Tooltip>
              </div>
              <div>
                <Label htmlFor='length'>Desired Length</Label>
                <Tooltip text='Select letter length - Short (1 paragraph), Medium (2-3 paragraphs), Long (detailed)'>
                  <Select
                    id='length'
                    value={length}
                    onChange={e => setLength(e.target.value as LetterLength)}
                  >
                    <option>Short</option>
                    <option>Medium</option>
                    <option>Long</option>
                  </Select>
                </Tooltip>
              </div>
            </div>
          </CardContent>
          <CardFooter className='flex flex-col sm:flex-row justify-between gap-3 sm:gap-4 px-3 sm:px-4 lg:px-6'>
            <Tooltip text='Cancel and return to dashboard'>
              <button
                onClick={onCancel}
                className='text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200'
              >
                Cancel
              </button>
            </Tooltip>
            {isGenerating ? (
              <Tooltip text='AI is generating your letter draft...'>
                <ShinyButton disabled className='h-8 sm:h-9 md:h-10 lg:h-11'>
                  <SparklesText>Generating...</SparklesText>
                </ShinyButton>
              </Tooltip>
            ) : (
              <Tooltip text='Use AI to generate a professional legal letter based on your inputs'>
                <ShimmerButton
                  onClick={handleGenerateDraft}
                  className='h-8 sm:h-9 md:h-10 lg:h-11'
                >
                  Generate AI Draft
                </ShimmerButton>
              </Tooltip>
            )}
          </CardFooter>
        </Card>

        <div className='lg:sticky lg:top-24'>
          <Card>
            <CardHeader>
              <CardTitle className='text-base sm:text-lg md:text-xl'>
                AI Draft Preview
              </CardTitle>
              <CardDescription className='text-xs sm:text-sm'>
                The AI-generated content will appear here for your review.
              </CardDescription>
            </CardHeader>
            <CardContent className='min-h-[200px] sm:min-h-[300px] md:min-h-[400px] bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-3 sm:p-4 lg:p-6'>
              {isGenerating && (
                <div className='space-y-3 animate-pulse'>
                  <div className='h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4'></div>
                  <div className='h-4 bg-slate-300 dark:bg-slate-700 rounded w-full'></div>
                  <div className='h-4 bg-slate-300 dark:bg-slate-700 rounded w-5/6'></div>
                </div>
              )}
              {error && <p className='text-red-500 text-sm'>{error}</p>}
              {!isGenerating && !error && aiDraft && (
                <FormattedDraft text={aiDraft} />
              )}
              {!isGenerating && !error && !aiDraft && (
                <p className='text-sm text-gray-500'>
                  Your draft will be displayed here once generated.
                </p>
              )}
            </CardContent>
            <CardFooter className='flex flex-col gap-3 sm:gap-4 items-stretch pt-4 sm:pt-6 px-3 sm:px-4 lg:px-6'>
              <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 justify-end'>
                <Tooltip
                  text='Download your letter as a PDF file'
                  position='bottom'
                >
                  <button
                    onClick={handleExportPdf}
                    disabled={!aiDraft || isExporting}
                    className='flex items-center justify-center gap-2 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {isExporting ? (
                      <LoaderOne size='sm' className='w-4 h-4' />
                    ) : (
                      <IconDownload className='w-4 h-4' />
                    )}
                    {isExporting ? 'Exporting...' : 'Export as PDF'}
                  </button>
                </Tooltip>
                <Tooltip
                  text='Send the letter draft directly to an attorney via email'
                  position='bottom'
                >
                  <button
                    onClick={() => {
                      setShowSendForm(prev => !prev);
                      setSendSuccess(false);
                    }}
                    disabled={!aiDraft}
                    className='text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2 rounded-md transition-colors border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    Send via Attorney's Email
                  </button>
                </Tooltip>
                <Tooltip
                  text='Save this letter to your dashboard for later use'
                  position='bottom'
                >
                  <ShimmerButton
                    onClick={handleSaveLetter}
                    disabled={!aiDraft || isSaving}
                    className='h-8 sm:h-9 md:h-10 lg:h-11'
                  >
                    {isSaving ? (
                      <span className='flex items-center gap-2'>
                        <LoaderOne size='sm' className='w-4 h-4' />
                        Saving...
                      </span>
                    ) : (
                      'Save Letter'
                    )}
                  </ShimmerButton>
                </Tooltip>
              </div>
              {showSendForm && (
                <div className='p-4 border-t border-slate-200 dark:border-slate-700/50 mt-2'>
                  {sendSuccess ? (
                    <p className='text-sm text-center text-green-600 dark:text-green-500'>
                      Draft sent successfully!
                    </p>
                  ) : (
                    <form onSubmit={handleSendEmail} className='space-y-3'>
                      <h4 className='text-sm font-semibold'>Send Draft</h4>
                      <div>
                        <Label htmlFor='attorney-email' className='sr-only'>
                          Email address
                        </Label>
                        <Input
                          id='attorney-email'
                          type='email'
                          placeholder='email address'
                          value={attorneyEmail}
                          onChange={handleEmailChange}
                          required
                        />
                        {emailError && (
                          <p className='text-xs text-red-500 mt-1'>
                            {emailError}
                          </p>
                        )}
                      </div>
                      <Tooltip text="Send the draft letter to the attorney's email address">
                        <ShimmerButton
                          type='submit'
                          className='w-full h-8 sm:h-9 md:h-10 lg:h-11'
                          disabled={!attorneyEmail || !!emailError || isSending}
                        >
                          {isSending ? (
                            <span className='flex items-center justify-center gap-2'>
                              <LoaderOne size='sm' className='w-4 h-4' />
                              Sending...
                            </span>
                          ) : (
                            'Send'
                          )}
                        </ShimmerButton>
                      </Tooltip>
                    </form>
                  )}
                </div>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>

      {/* Render all banners */}
      {banners.map(banner => (
        <CompletionBanner key={banner.id} {...banner} />
      ))}
    </div>
  );
};
