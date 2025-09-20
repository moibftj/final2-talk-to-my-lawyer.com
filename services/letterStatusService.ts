import supabase from './supabase';
import type { LetterStatus } from '../types';

export interface StatusUpdatePayload {
  letterId: string;
  oldStatus: LetterStatus;
  newStatus: LetterStatus;
  updatedBy: string;
  timestamp: string;
}

export interface StatusHistoryEntry {
  id: string;
  oldStatus: LetterStatus;
  newStatus: LetterStatus;
  changedBy: string;
  changedByEmail: string;
  changedByRole: string;
  notes?: string;
  changedAt: string;
}

export class LetterStatusService {
  private statusUpdateCallbacks: ((payload: StatusUpdatePayload) => void)[] = [];

  // Subscribe to real-time status updates
  subscribeToStatusUpdates(callback: (payload: StatusUpdatePayload) => void) {
    this.statusUpdateCallbacks.push(callback);

    // Subscribe to the letter_updates channel
    const channel = supabase
      .channel('letter_updates')
      .on('broadcast', { event: 'status_updated' }, (payload) => {
        callback(payload.payload as StatusUpdatePayload);
      })
      .subscribe();

    // Return unsubscribe function
    return () => {
      this.statusUpdateCallbacks = this.statusUpdateCallbacks.filter(cb => cb !== callback);
      supabase.removeChannel(channel);
    };
  }

  // Update letter status via Edge Function
  async updateLetterStatus(
    letterId: string,
    newStatus: LetterStatus,
    options?: {
      lawyerId?: string;
      adminNotes?: string;
      notifyUser?: boolean;
    }
  ): Promise<{ success: boolean; message: string; error?: string }> {
    try {
      const { data, error } = await supabase.functions.invoke('update-letter-status', {
        body: {
          letterId,
          newStatus,
          lawyerId: options?.lawyerId,
          adminNotes: options?.adminNotes,
          notifyUser: options?.notifyUser ?? true
        }
      });

      if (error) {
        console.error('Error updating letter status:', error);
        return {
          success: false,
          message: 'Failed to update letter status',
          error: error.message
        };
      }

      return {
        success: true,
        message: data.message || 'Letter status updated successfully'
      };
    } catch (error) {
      console.error('Error in updateLetterStatus:', error);
      return {
        success: false,
        message: 'An unexpected error occurred',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get status history for a letter
  async getLetterStatusHistory(letterId: string): Promise<StatusHistoryEntry[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_letter_status_timeline', { letter_uuid: letterId });

      if (error) {
        console.error('Error fetching status history:', error);
        return [];
      }

      return (data || []).map((entry: any) => ({
        id: entry.id,
        oldStatus: entry.old_status,
        newStatus: entry.new_status,
        changedBy: entry.changed_by,
        changedByEmail: entry.changed_by_email,
        changedByRole: entry.changed_by_role,
        notes: entry.notes,
        changedAt: entry.changed_at
      }));
    } catch (error) {
      console.error('Error in getLetterStatusHistory:', error);
      return [];
    }
  }

  // Get letters that need attention (for admins/lawyers)
  async getLettersRequiringAction(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('letters')
        .select(`
          id,
          title,
          status,
          user_id,
          assigned_lawyer_id,
          due_date_internal,
          created_at,
          updated_at,
          profiles:user_id (email)
        `)
        .in('status', ['submitted', 'in_review'])
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching letters requiring action:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getLettersRequiringAction:', error);
      return [];
    }
  }

  // Assign lawyer to a letter
  async assignLawyer(letterId: string, lawyerId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('letters')
        .update({
          assigned_lawyer_id: lawyerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', letterId);

      if (error) {
        console.error('Error assigning lawyer:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in assignLawyer:', error);
      return false;
    }
  }

  // Set internal due date for a letter
  async setInternalDueDate(letterId: string, dueDate: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('letters')
        .update({
          due_date_internal: dueDate,
          updated_at: new Date().toISOString()
        })
        .eq('id', letterId);

      if (error) {
        console.error('Error setting due date:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error in setInternalDueDate:', error);
      return false;
    }
  }

  // Get status transition options based on current status and user role
  getValidStatusTransitions(
    currentStatus: LetterStatus,
    userRole: 'user' | 'employee' | 'admin' | 'lawyer'
  ): LetterStatus[] {
    const allTransitions: Record<LetterStatus, LetterStatus[]> = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['in_review', 'cancelled'],
      'in_review': ['approved', 'submitted', 'cancelled'],
      'approved': ['completed', 'in_review'],
      'completed': [],
      'cancelled': ['submitted']
    };

    const userTransitions: Record<LetterStatus, LetterStatus[]> = {
      'draft': ['submitted', 'cancelled'],
      'submitted': ['cancelled'],
      'in_review': [],
      'approved': ['completed'],
      'completed': [],
      'cancelled': ['submitted']
    };

    // Users have limited transition options
    if (userRole === 'user') {
      return userTransitions[currentStatus] || [];
    }

    // Admins and lawyers can perform all transitions
    if (userRole === 'admin' || userRole === 'lawyer') {
      return allTransitions[currentStatus] || [];
    }

    // Employees have no status change permissions
    return [];
  }

  // Get status color and styling
  getStatusStyling(status: LetterStatus): {
    color: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
  } {
    const statusStyles: Record<LetterStatus, any> = {
      'draft': {
        color: 'gray',
        backgroundColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        textColor: 'text-gray-700'
      },
      'submitted': {
        color: 'blue',
        backgroundColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700'
      },
      'in_review': {
        color: 'yellow',
        backgroundColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        textColor: 'text-yellow-700'
      },
      'approved': {
        color: 'green',
        backgroundColor: 'bg-green-100',
        borderColor: 'border-green-300',
        textColor: 'text-green-700'
      },
      'completed': {
        color: 'emerald',
        backgroundColor: 'bg-emerald-100',
        borderColor: 'border-emerald-300',
        textColor: 'text-emerald-700'
      },
      'cancelled': {
        color: 'red',
        backgroundColor: 'bg-red-100',
        borderColor: 'border-red-300',
        textColor: 'text-red-700'
      }
    };

    return statusStyles[status] || statusStyles['draft'];
  }

  // Estimate completion time based on current status
  getEstimatedCompletion(status: LetterStatus, createdAt: string): string {
    const created = new Date(createdAt);
    const now = new Date();
    const daysPassed = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));

    const estimates: Record<LetterStatus, string> = {
      'draft': 'Complete your submission',
      'submitted': `1-2 business days`,
      'in_review': `${Math.max(1, 2 - daysPassed)} business day${Math.max(1, 2 - daysPassed) !== 1 ? 's' : ''}`,
      'approved': 'Ready for download',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };

    return estimates[status] || 'Unknown';
  }
}

export const letterStatusService = new LetterStatusService();