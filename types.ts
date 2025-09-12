// Based on ENUMs in the database schema
export type UserRole = 'user' | 'employee' | 'admin';
export type LetterStatus = 'draft' | 'submitted' | 'in_review' | 'approved' | 'completed' | 'cancelled';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type SubscriptionStatus = 'inactive' | 'active' | 'past_due' | 'cancelled' | 'unpaid';
export type MessageType = 'text' | 'system' | 'file';
export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'cancelled' | 'refunded';

// User interface
export interface User {
  email: string;
  role: UserRole;
}

// Letter Template structure
export interface LetterTemplate {
  value: string;
  label: string;
  description: string;
  body: string;
  requiredFields: string[];
}

// Based on letter_requests table
export interface LetterRequest {
  id: string; // UUID
  userId: string; // UUID
  lawyerId?: string; // UUID
  title: string;
  letterType: string; // Corresponds to the LetterTemplate's value
  description: string; // Now used for additional context
  recipientInfo: Record<string, any>; // JSONB
  senderInfo: Record<string, any>; // JSONB
  status: LetterStatus;
  priority: PriorityLevel;
  dueDate?: string; // DATE
  aiGeneratedContent?: string;
  templateData?: Record<string, string>; // Stores user input for template fields
  finalContent?: string;
  createdAt: string; // TIMESTAMPTZ
  updatedAt: string; // TIMESTAMPTZ
}