import React, { useState, useRef } from 'react';
import { X, Download, Mail, Print, Eye, Copy, Check } from 'lucide-react';
import jsPDF from 'jspdf';
import { emailService } from '../services/emailService';
import type { LetterRequest } from '../types';
import { ShinyButton } from './magicui/shiny-button';
import { CompletionBanner, useBanners } from './CompletionBanner';
import { LoaderOne } from './ui/loader-one';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  letter: LetterRequest;
  onStatusUpdate?: (newStatus: string) => void;
}

type DeliveryMethod = 'download' | 'email' | 'print';

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  letter,
  onStatusUpdate
}) => {
  const [selectedMethod, setSelectedMethod] = useState<DeliveryMethod>('download');
  const [emailForm, setEmailForm] = useState({
    to: letter.recipientInfo?.email || '',
    subject: `Legal Letter: ${letter.title}`,
    message: 'Please find attached your legal letter.'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const { banners, showSuccess, showError, showInfo } = useBanners();

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsProcessing(true);
    showInfo('Generating PDF', 'Creating your letter as a PDF document...');

    try {
      const pdf = new jsPDF();
      const content = letter.aiGeneratedContent || letter.finalContent || '';

      // Set up PDF formatting
      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);

      // Add header with letter info
      pdf.setFontSize(16);
      pdf.setFont('times', 'bold');
      pdf.text(letter.title, 20, 20);

      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

      // Add sender info
      if (letter.senderInfo?.name) {
        pdf.text(`From: ${letter.senderInfo.name}`, 20, 40);
      }
      if (letter.senderInfo?.address) {
        pdf.text(`${letter.senderInfo.address}`, 20, 45);
      }

      // Add recipient info
      if (letter.recipientInfo?.name) {
        pdf.text(`To: ${letter.recipientInfo.name}`, 20, 55);
      }
      if (letter.recipientInfo?.address) {
        pdf.text(`${letter.recipientInfo.address}`, 20, 60);
      }

      // Add letter content
      pdf.setFontSize(12);
      const splitContent = pdf.splitTextToSize(content, 170);
      pdf.text(splitContent, 20, 80);

      // Save the PDF
      const fileName = `${letter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      pdf.save(fileName);

      showSuccess('PDF Downloaded', 'Your letter has been saved as a PDF file.');

      // Update status if this is the first download
      if (letter.status === 'approved' && onStatusUpdate) {
        onStatusUpdate('completed');
      }
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      showError('Download Failed', 'Unable to generate PDF. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendEmail = async () => {
    if (!emailForm.to) {
      showError('Email Required', 'Please enter a recipient email address.');
      return;
    }

    setIsProcessing(true);
    showInfo('Sending Email', 'Preparing and sending your letter via email...');

    try {
      // First generate PDF for attachment
      const pdf = new jsPDF();
      const content = letter.aiGeneratedContent || letter.finalContent || '';

      pdf.setFont('times', 'normal');
      pdf.setFontSize(12);
      pdf.setFontSize(16);
      pdf.setFont('times', 'bold');
      pdf.text(letter.title, 20, 20);

      pdf.setFontSize(10);
      pdf.setFont('times', 'normal');
      pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 30);

      if (letter.senderInfo?.name) {
        pdf.text(`From: ${letter.senderInfo.name}`, 20, 40);
      }
      if (letter.recipientInfo?.name) {
        pdf.text(`To: ${letter.recipientInfo.name}`, 20, 50);
      }

      pdf.setFontSize(12);
      const splitContent = pdf.splitTextToSize(content, 170);
      pdf.text(splitContent, 20, 70);

      const pdfBlob = pdf.output('blob');

      // Send email with attachment
      const emailData = {
        to: emailForm.to,
        subject: emailForm.subject,
        body: `${emailForm.message}\n\n---\nLetter Content:\n\n${content}`,
        attachments: [{
          filename: `${letter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
          content: pdfBlob
        }]
      };

      await emailService.sendEmail(emailData);

      showSuccess('Email Sent', `Your letter has been sent to ${emailForm.to}`);

      // Update status
      if (onStatusUpdate) {
        onStatusUpdate('completed');
      }

      onClose();
    } catch (error) {
      console.error('Failed to send email:', error);
      showError('Email Failed', 'Unable to send email. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrint = () => {
    setIsProcessing(true);
    showInfo('Preparing Print', 'Opening print dialog...');

    try {
      // Create a new window with the letter content
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = letter.aiGeneratedContent || letter.finalContent || '';

        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>${letter.title}</title>
              <style>
                body {
                  font-family: 'Times New Roman', serif;
                  font-size: 12pt;
                  line-height: 1.6;
                  margin: 1in;
                  color: #000;
                }
                .header {
                  margin-bottom: 20px;
                }
                .title {
                  font-size: 16pt;
                  font-weight: bold;
                  margin-bottom: 10px;
                }
                .info {
                  font-size: 10pt;
                  margin-bottom: 5px;
                }
                .content {
                  white-space: pre-wrap;
                  margin-top: 20px;
                }
                @media print {
                  body { margin: 0.5in; }
                }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="title">${letter.title}</div>
                <div class="info">Generated on: ${new Date().toLocaleDateString()}</div>
                ${letter.senderInfo?.name ? `<div class="info">From: ${letter.senderInfo.name}</div>` : ''}
                ${letter.senderInfo?.address ? `<div class="info">${letter.senderInfo.address}</div>` : ''}
                ${letter.recipientInfo?.name ? `<div class="info">To: ${letter.recipientInfo.name}</div>` : ''}
                ${letter.recipientInfo?.address ? `<div class="info">${letter.recipientInfo.address}</div>` : ''}
              </div>
              <div class="content">${content}</div>
            </body>
          </html>
        `);

        printWindow.document.close();
        printWindow.print();
        printWindow.close();

        showSuccess('Print Ready', 'Print dialog opened successfully.');

        // Update status
        if (letter.status === 'approved' && onStatusUpdate) {
          onStatusUpdate('completed');
        }
      } else {
        throw new Error('Unable to open print window');
      }
    } catch (error) {
      console.error('Failed to print:', error);
      showError('Print Failed', 'Unable to open print dialog. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyContent = async () => {
    try {
      const content = letter.aiGeneratedContent || letter.finalContent || '';
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      showSuccess('Content Copied', 'Letter content copied to clipboard.');

      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy content:', error);
      showError('Copy Failed', 'Unable to copy content to clipboard.');
    }
  };

  const deliveryMethods = [
    {
      id: 'download' as DeliveryMethod,
      title: 'Download PDF',
      description: 'Save letter as PDF file',
      icon: Download,
      action: handleDownloadPDF
    },
    {
      id: 'email' as DeliveryMethod,
      title: 'Send Email',
      description: 'Email letter to recipient',
      icon: Mail,
      action: handleSendEmail
    },
    {
      id: 'print' as DeliveryMethod,
      title: 'Print Letter',
      description: 'Print physical copy',
      icon: Print,
      action: handlePrint
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <Eye className="w-6 h-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Letter Preview</h2>
              <p className="text-gray-600">{letter.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-[calc(90vh-200px)]">
          {/* Preview Content */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="bg-white rounded-lg shadow-sm border p-8 max-w-4xl mx-auto" ref={contentRef}>
              {/* Letter Header */}
              <div className="mb-8 pb-4 border-b">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{letter.title}</h1>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Generated on: {new Date().toLocaleDateString()}</div>
                  {letter.senderInfo?.name && <div>From: {letter.senderInfo.name}</div>}
                  {letter.senderInfo?.address && <div>{letter.senderInfo.address}</div>}
                  {letter.recipientInfo?.name && <div>To: {letter.recipientInfo.name}</div>}
                  {letter.recipientInfo?.address && <div>{letter.recipientInfo.address}</div>}
                </div>
              </div>

              {/* Letter Content */}
              <div className="prose prose-lg max-w-none">
                <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                  {letter.aiGeneratedContent || letter.finalContent || 'No content available.'}
                </div>
              </div>
            </div>
          </div>

          {/* Delivery Options Sidebar */}
          <div className="w-80 border-l bg-white p-6 overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Options</h3>

            {/* Quick Actions */}
            <div className="mb-6">
              <button
                onClick={handleCopyContent}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-3"
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 mr-2 text-green-600" />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Content
                  </>
                )}
              </button>
            </div>

            {/* Delivery Methods */}
            <div className="space-y-4">
              {deliveryMethods.map((method) => {
                const Icon = method.icon;
                const isSelected = selectedMethod === method.id;

                return (
                  <div
                    key={method.id}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedMethod(method.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <Icon className={`w-5 h-5 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div className="flex-1">
                        <h4 className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-900'}`}>
                          {method.title}
                        </h4>
                        <p className={`text-sm ${isSelected ? 'text-blue-700' : 'text-gray-600'}`}>
                          {method.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Email Form */}
            {selectedMethod === 'email' && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-3">Email Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">To:</label>
                    <input
                      type="email"
                      value={emailForm.to}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, to: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      placeholder="recipient@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Subject:</label>
                    <input
                      type="text"
                      value={emailForm.subject}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-800 mb-1">Message:</label>
                    <textarea
                      value={emailForm.message}
                      onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="mt-6">
              <ShinyButton
                onClick={deliveryMethods.find(m => m.id === selectedMethod)?.action}
                disabled={isProcessing}
                className="w-full py-3"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center">
                    <LoaderOne />
                    <span className="ml-2">Processing...</span>
                  </div>
                ) : (
                  deliveryMethods.find(m => m.id === selectedMethod)?.title
                )}
              </ShinyButton>
            </div>

            {/* Letter Info */}
            <div className="mt-8 pt-6 border-t">
              <h4 className="font-medium text-gray-900 mb-3">Letter Information</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div><strong>Type:</strong> {letter.letterType}</div>
                <div><strong>Status:</strong> {letter.status}</div>
                <div><strong>Priority:</strong> {letter.priority}</div>
                <div><strong>Created:</strong> {new Date(letter.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
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