import supabase from './supabase';
import type { LetterRequest } from '../types';
import type { LetterTone, LetterLength } from './aiService';

// This file is the single source of truth for all frontend-to-backend communication.
// It uses the Supabase client to interact with the database and Edge Functions.

const handleSupabaseError = (error: any, context: string) => {
    console.error(`Error in ${context}:`, error);
    throw new Error(error.message || `An unknown error occurred in ${context}.`);
};

// Helper to map Supabase's snake_case to our app's camelCase
const mapLetterFromSupabase = (l: any): LetterRequest => ({
    id: l.id,
    userId: l.user_id,
    lawyerId: l.lawyer_id,
    title: l.title,
    letterType: l.letter_type,
    description: l.description,
    recipientInfo: l.recipient_info,
    senderInfo: l.sender_info,
    status: l.status,
    priority: l.priority,
    dueDate: l.due_date,
    aiGeneratedContent: l.ai_generated_content,
    templateData: l.template_data,
    finalContent: l.final_content,
    createdAt: l.created_at,
    updatedAt: l.updated_at,
});


// --- LETTERS API (DATABASE) ---

const fetchLetters = async (): Promise<LetterRequest[]> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
        .from('letters')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

    if (error) handleSupabaseError(error, 'fetchLetters');
    return (data || []).map(mapLetterFromSupabase);
};

const createLetter = async (letterData: Partial<LetterRequest>): Promise<LetterRequest> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const letterToInsert = {
        user_id: user.id,
        title: letterData.title,
        letter_type: letterData.letterType,
        description: letterData.description,
        template_data: letterData.templateData,
        ai_generated_content: letterData.aiGeneratedContent,
        status: letterData.status || 'draft',
        priority: letterData.priority || 'medium',
        recipient_info: letterData.recipientInfo || {},
        sender_info: letterData.senderInfo || {},
    };

    const { data, error } = await supabase
        .from('letters')
        .insert(letterToInsert)
        .select()
        .single();
    
    if (error) handleSupabaseError(error, 'createLetter');
    return mapLetterFromSupabase(data);
};

const updateLetter = async (letterData: LetterRequest): Promise<LetterRequest> => {
    const letterToUpdate = {
        title: letterData.title,
        letter_type: letterData.letterType,
        description: letterData.description,
        template_data: letterData.templateData,
        ai_generated_content: letterData.aiGeneratedContent,
        status: letterData.status,
        priority: letterData.priority,
        updated_at: new Date().toISOString(), // Manually update timestamp
    };
    
    const { data, error } = await supabase
        .from('letters')
        .update(letterToUpdate)
        .eq('id', letterData.id)
        .select()
        .single();
    
    if (error) handleSupabaseError(error, 'updateLetter');
    return mapLetterFromSupabase(data);
};

const deleteLetter = async (id: string): Promise<void> => {
    const { error } = await supabase
        .from('letters')
        .delete()
        .eq('id', id);

    if (error) handleSupabaseError(error, 'deleteLetter');
};

// --- AI SERVICE API (EDGE FUNCTION) ---
interface GenerateDraftPayload {
    title: string;
    templateBody: string;
    templateFields: Record<string, string>;
    additionalContext: string;
    tone?: LetterTone;
    length?: LetterLength;
}
const generateDraft = async (payload: GenerateDraftPayload): Promise<string> => {
    const { data, error } = await supabase.functions.invoke('generate-draft', {
        body: payload,
    });

    if (error) handleSupabaseError(error, 'generateDraft function');
    if (data.error) throw new Error(data.error);
    return data.draft;
};

// --- ADMIN API (EDGE FUNCTIONS) ---

const fetchAllUsers = async (): Promise<{ id: string; email: string | undefined; role: string | undefined; }[]> => {
    const { data, error } = await supabase.functions.invoke('get-all-users');
    if (error) handleSupabaseError(error, 'fetchAllUsers function');
    return data.users;
};

const fetchAllLetters = async (): Promise<any[]> => {
    const { data, error } = await supabase.functions.invoke('get-all-letters');
    if (error) handleSupabaseError(error, 'fetchAllLetters function');
    return data.letters;
};


export const apiClient = {
    // Letters (Database)
    fetchLetters,
    createLetter,
    updateLetter,
    deleteLetter,

    // AI Service (Edge Function)
    generateDraft,

    // Admin (Edge Functions)
    fetchAllUsers,
    fetchAllLetters,
};