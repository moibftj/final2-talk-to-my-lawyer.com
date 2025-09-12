import { apiClient } from './apiClient';

export type LetterTone = 'Formal' | 'Aggressive' | 'Conciliatory' | 'Neutral';
export type LetterLength = 'Short' | 'Medium' | 'Long';

interface LetterDetails {
    title: string;
    templateBody: string;
    templateFields: Record<string, string>;
    additionalContext: string;
    tone?: LetterTone;
    length?: LetterLength;
}

/**
 * Sends letter details to the secure backend to generate an AI draft.
 * The actual API call to Google Gemini happens on the server.
 */
export const generateLetterDraft = async (details: LetterDetails): Promise<string> => {
    try {
        const draft = await apiClient.generateDraft(details);
        return draft;
    } catch (error) {
        console.error("Error calling backend to generate draft:", error);
        // Propagate a user-friendly error message
        throw new Error("Failed to generate letter draft from AI. Please check the console for more details.");
    }
};
