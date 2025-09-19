import { SendEmailRequest, EmailRequest } from '../types';

// Email service configuration
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export class EmailService {
  private baseUrl: string;
  private headers: Record<string, string>;

  constructor() {
    this.baseUrl = `${SUPABASE_URL}/functions/v1`;
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
    };
  }

  async sendEmail(request: SendEmailRequest): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/send-email`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Email sending failed: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Email sending error:', error);
      return false;
    }
  }

  async sendTemplateEmail(
    request: EmailRequest,
    templateId: string,
    templateData: Record<string, any>
  ): Promise<boolean> {
    const sendRequest: SendEmailRequest = {
      ...request,
      templateId,
      templateData,
    };

    return this.sendEmail(sendRequest);
  }

  async sendNotificationEmail(
    to: string,
    subject: string,
    body: string
  ): Promise<boolean> {
    const request: SendEmailRequest = {
      to,
      subject,
      body,
    };

    return this.sendEmail(request);
  }

  async sendLetterStatusUpdate(
    userEmail: string,
    letterTitle: string,
    status: string
  ): Promise<boolean> {
    const request: SendEmailRequest = {
      to: userEmail,
      subject: `Letter Status Update: ${letterTitle}`,
      body: `Your letter "${letterTitle}" status has been updated to: ${status}`,
    };

    return this.sendEmail(request);
  }
}

export const emailService = new EmailService();