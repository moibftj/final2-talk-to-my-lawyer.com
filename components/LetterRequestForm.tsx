import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from './Card';
import { LETTER_TEMPLATES, IconSpinner } from '../constants';
import { ShinyButton } from './magicui/shiny-button';
import { ShimmerButton } from './magicui/shimmer-button';
import { SparklesText } from './magicui/sparkles-text';
import { generateLetterDraft, LetterTone, LetterLength } from '../services/aiService';
import { isValidEmail } from '../lib/utils';
import type { LetterRequest, LetterTemplate } from '../types';

const Label: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({ className, ...props }) => (
  <label className={`block text-sm font-medium text-gray-700 dark:text-gray-300 ${className}`} {...props} />
);

const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({ className, ...props }) => (
  <input className={`mt-1 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = ({ className, children, ...props }) => (
    <select className={`mt-1 flex h-10 w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props}>
        {children}
    </select>
);

const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({ className, ...props }) => (
    <textarea className={`mt-1 flex min-h-[80px] w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`} {...props} />
);

const IconDownload: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const FormattedDraft: React.FC<{ text: string }> = ({ text }) => {
  const parts = text.split(/(\[Information Not Provided\])/g);
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none text-gray-800 dark:text-gray-300">
      <p className="whitespace-pre-wrap">
        {parts.map((part, index) => {
          if (part === '[Information Not Provided]') {
            return (
              <strong key={index} className="text-red-500 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-1 rounded-sm">
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveLetter = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
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
    } catch (error) {
        console.error("Failed to save letter:", error);
        setError("Could not save the letter. Please try again.");
    } finally {
        setIsSaving(false);
    }
  };

    const handleSendEmail = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSending(true);
        console.log(`Simulating sending email to: ${attorneyEmail} with content: ${aiDraft}`);
        // Simulate API call
        setTimeout(() => {
            setSendSuccess(true);
            setIsSending(false);
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
        }, 500);
    };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Card>
        <CardHeader>
          <CardTitle>{letterToEdit ? 'Edit Letter' : 'Create a New Letter'}</CardTitle>
          <CardDescription>Fill in the details below to generate an AI-powered draft.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template">Select a Template</Label>
            <Select id="template" value={selectedTemplate?.value || ''} onChange={handleTemplateChange}>
              {LETTER_TEMPLATES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            {selectedTemplate && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{selectedTemplate.description}</p>}
          </div>

          {selectedTemplate && selectedTemplate.requiredFields.map(field => (
            <div key={field}>
              <Label htmlFor={field}>{field}</Label>
              <Input id={field} value={formData[field] || ''} onChange={(e) => handleFieldChange(field, e.target.value)} />
            </div>
          ))}

          <div>
            <Label htmlFor="title">Subject / Title of Letter</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Final Demand for Payment" />
          </div>

          <div>
            <Label htmlFor="context">Additional Context (Optional)</Label>
            <Textarea id="context" value={additionalContext} onChange={(e) => setAdditionalContext(e.target.value)} placeholder="Provide any extra details the AI should consider..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <Label htmlFor="tone">Tone of Voice</Label>
                <Select id="tone" value={tone} onChange={e => setTone(e.target.value as LetterTone)}>
                    <option>Formal</option>
                    <option>Aggressive</option>
                    <option>Conciliatory</option>
                    <option>Neutral</option>
                </Select>
            </div>
             <div>
                <Label htmlFor="length">Desired Length</Label>
                <Select id="length" value={length} onChange={e => setLength(e.target.value as LetterLength)}>
                    <option>Short</option>
                    <option>Medium</option>
                    <option>Long</option>
                </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <button onClick={onCancel} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white">Cancel</button>
          {isGenerating ? (
            <ShinyButton disabled>
                <SparklesText>Generating...</SparklesText>
            </ShinyButton>
          ) : (
            <ShimmerButton onClick={handleGenerateDraft}>Generate AI Draft</ShimmerButton>
          )}
        </CardFooter>
      </Card>
      
      <div className="lg:sticky top-24">
        <Card>
          <CardHeader>
            <CardTitle>AI Draft Preview</CardTitle>
            <CardDescription>The AI-generated content will appear here for your review.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-[300px] bg-slate-100/50 dark:bg-slate-800/50 rounded-lg p-4">
            {isGenerating && (
              <div className="space-y-3 animate-pulse">
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-3/4"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-full"></div>
                <div className="h-4 bg-slate-300 dark:bg-slate-700 rounded w-5/6"></div>
              </div>
            )}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {!isGenerating && !error && aiDraft && <FormattedDraft text={aiDraft} />}
            {!isGenerating && !error && !aiDraft && <p className="text-sm text-gray-500">Your draft will be displayed here once generated.</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4 items-stretch pt-6">
             <div className="flex flex-col sm:flex-row gap-2 justify-end">
                <button onClick={handleExportPdf} disabled={!aiDraft || isExporting} className="flex items-center justify-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition-colors border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed">
                    {isExporting ? <IconSpinner className="w-4 h-4 animate-spin" /> : <IconDownload className="w-4 h-4" />}
                    {isExporting ? 'Exporting...' : 'Export as PDF'}
                </button>
                <button 
                  onClick={() => { setShowSendForm(prev => !prev); setSendSuccess(false); }}
                  disabled={!aiDraft}
                  className="text-sm font-medium px-4 py-2 rounded-md transition-colors border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send via Attorney's Email
                </button>
                 <ShimmerButton onClick={handleSaveLetter} disabled={!aiDraft || isSaving}>
                    {isSaving ? (
                        <span className="flex items-center gap-2">
                            <IconSpinner className="h-4 w-4 animate-spin" />
                            Saving...
                        </span>
                    ) : (
                        'Save Letter'
                    )}
                </ShimmerButton>
             </div>
             {showSendForm && (
                 <div className="p-4 border-t border-slate-200 dark:border-slate-700/50 mt-2">
                    {sendSuccess ? (
                        <p className="text-sm text-center text-green-600 dark:text-green-500">Draft sent successfully!</p>
                    ) : (
                        <form onSubmit={handleSendEmail} className="space-y-3">
                            <h4 className="text-sm font-semibold">Send Draft</h4>
                            <div>
                                <Label htmlFor="attorney-email" className="sr-only">Email address</Label>
                                <Input 
                                    id="attorney-email" 
                                    type="email" 
                                    placeholder="email address"
                                    value={attorneyEmail}
                                    onChange={handleEmailChange}
                                    required
                                />
                                {emailError && <p className="text-xs text-red-500 mt-1">{emailError}</p>}
                            </div>
                            <ShimmerButton type="submit" className="w-full" disabled={!attorneyEmail || !!emailError || isSending}>
                                 {isSending ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <IconSpinner className="h-4 w-4 animate-spin" />
                                        Sending...
                                    </span>
                                ) : (
                                    'Send'
                                )}
                            </ShimmerButton>
                        </form>
                    )}
                 </div>
             )}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};