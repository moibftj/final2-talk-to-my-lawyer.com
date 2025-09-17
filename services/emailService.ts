import supabase from './supabase';

interface EmailRequest {
  to: string;
  subject: string;
  html: string;
}

interface MailerSendResponse {
  success: boolean;
  message?: string;
  errors?: any;
}

class EmailService {
  private async makeRequest(data: EmailRequest): Promise<MailerSendResponse> {
    try {
      const { data: response, error } = await supabase.functions.invoke('send-email', {
        body: data
      });

      if (error) {
        console.error('Email service error:', error);
        throw new Error(error.message || 'Failed to send email');
      }

      return {
        success: true,
        ...(response || {})
      };

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || `MailerSend API error: ${response.status}`);
      }
      
      return result;
    } catch (error) {
      console.error('MailerSend API Error:', error);
      throw error;
    }
  }

  async sendEmail(emailData: SendEmailRequest): Promise<MailerSendResponse> {
    return await this.makeRequest('email', 'POST', emailData);
  }

  async sendVerificationEmail(email: string, verificationLink: string, userName?: string): Promise<void> {
    const emailData: SendEmailRequest = {
      from: {
        email: 'noreply@lawletterai.com',
        name: 'Law Letter AI'
      },
      to: [{
        email: email,
        name: userName || email.split('@')[0]
      }],
      subject: 'Verify Your Email Address - Law Letter AI',
      html: this.getVerificationEmailTemplate(verificationLink, userName || email.split('@')[0]),
      text: this.getVerificationEmailTextTemplate(verificationLink, userName || email.split('@')[0])
    };

    try {
      await this.sendEmail(emailData);
      console.log(`Verification email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send verification email:', error);
      throw new Error('Failed to send verification email');
    }
  }

  async sendWelcomeEmail(email: string, userName?: string): Promise<void> {
    const emailData: SendEmailRequest = {
      from: {
        email: 'noreply@lawletterai.com',
        name: 'Law Letter AI'
      },
      to: [{
        email: email,
        name: userName || email.split('@')[0]
      }],
      subject: 'Welcome to Law Letter AI!',
      html: this.getWelcomeEmailTemplate(userName || email.split('@')[0]),
      text: this.getWelcomeEmailTextTemplate(userName || email.split('@')[0])
    };

    try {
      await this.sendEmail(emailData);
      console.log(`Welcome email sent successfully to ${email}`);
    } catch (error) {
      console.error('Failed to send welcome email:', error);
      // Don't throw here as welcome email is not critical
    }
  }

  private getVerificationEmailTemplate(verificationLink: string, userName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Law Letter AI</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3B82F6; }
        .logo { color: #3B82F6; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 0; }
        .button { display: inline-block; padding: 12px 30px; background-color: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .button:hover { background-color: #2563EB; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⚖️ Law Letter AI</div>
    </div>
    
    <div class="content">
        <h2>Welcome to Law Letter AI, ${userName}!</h2>
        <p>Thank you for signing up. To complete your registration and start creating professional legal letters, please verify your email address by clicking the button below:</p>
        
        <p style="text-align: center;">
            <a href="${verificationLink}" class="button">Verify Your Email Address</a>
        </p>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p style="word-break: break-all; background: #F3F4F6; padding: 10px; border-radius: 4px;">${verificationLink}</p>
        
        <p>Once verified, you'll be able to:</p>
        <ul>
            <li>Generate professional legal letters with AI</li>
            <li>Access our template library</li>
            <li>Save and manage your letters</li>
            <li>Export letters as PDF</li>
        </ul>
        
        <p>This link will expire in 24 hours for security reasons.</p>
        
        <p>If you didn't create an account with Law Letter AI, you can safely ignore this email.</p>
    </div>
    
    <div class="footer">
        <p>© 2024 Law Letter AI. Professional legal document generation powered by AI.</p>
        <p>This email was sent from a notification-only address. Please do not reply to this email.</p>
    </div>
</body>
</html>
    `.trim();
  }

  private getVerificationEmailTextTemplate(verificationLink: string, userName: string): string {
    return `
Welcome to Law Letter AI, ${userName}!

Thank you for signing up. To complete your registration and start creating professional legal letters, please verify your email address by visiting this link:

${verificationLink}

Once verified, you'll be able to:
- Generate professional legal letters with AI
- Access our template library
- Save and manage your letters
- Export letters as PDF

This link will expire in 24 hours for security reasons.

If you didn't create an account with Law Letter AI, you can safely ignore this email.

© 2024 Law Letter AI. Professional legal document generation powered by AI.
    `.trim();
  }

  private getWelcomeEmailTemplate(userName: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Law Letter AI!</title>
    <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #3B82F6; }
        .logo { color: #3B82F6; font-size: 24px; font-weight: bold; }
        .content { padding: 30px 0; }
        .button { display: inline-block; padding: 12px 30px; background-color: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; padding: 20px 0; border-top: 1px solid #E5E7EB; font-size: 14px; color: #6B7280; }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo">⚖️ Law Letter AI</div>
    </div>
    
    <div class="content">
        <h2>Welcome to Law Letter AI, ${userName}! 🎉</h2>
        <p>Your email has been verified successfully, and your account is now active!</p>
        
        <p>You're now ready to:</p>
        <ul>
            <li><strong>Generate AI-powered legal letters</strong> - From demand letters to cease and desist notices</li>
            <li><strong>Access our template library</strong> - Professional templates for various legal situations</li>
            <li><strong>Save and organize</strong> - Keep all your letters in one secure dashboard</li>
            <li><strong>Export as PDF</strong> - Download professional-quality documents</li>
        </ul>
        
        <p style="text-align: center;">
            <a href="https://lawletterai.com" class="button">Start Creating Letters</a>
        </p>
        
        <p>Need help getting started? Our AI assistant will guide you through the process step by step.</p>
        
        <p>Thank you for choosing Law Letter AI!</p>
    </div>
    
    <div class="footer">
        <p>© 2024 Law Letter AI. Professional legal document generation powered by AI.</p>
    </div>
</body>
</html>
    `.trim();
  }

  private getWelcomeEmailTextTemplate(userName: string): string {
    return `
Welcome to Law Letter AI, ${userName}! 

Your email has been verified successfully, and your account is now active!

You're now ready to:
- Generate AI-powered legal letters - From demand letters to cease and desist notices
- Access our template library - Professional templates for various legal situations  
- Save and organize - Keep all your letters in one secure dashboard
- Export as PDF - Download professional-quality documents

Visit https://lawletterai.com to start creating letters.

Need help getting started? Our AI assistant will guide you through the process step by step.

Thank you for choosing Law Letter AI!

© 2024 Law Letter AI. Professional legal document generation powered by AI.
    `.trim();
  }
}

export const emailService = new EmailService();