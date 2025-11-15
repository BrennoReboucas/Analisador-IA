import { GoogleGenAI } from '@google/genai';
import { prepareFileForGemini } from '../utils/fileUtils';
import { UserData } from '../types';

/**
 * Analyzes a document (image or PDF) using the Gemini API.
 * @param file The file to analyze.
 * @param prompt The prompt for the analysis.
 * @param userData The user data to inject into the prompt.
 * @param apiKey The user-provided Gemini API Key.
 * @returns The text response from the Gemini model.
 */
export const analyzeDocument = async (file: File, prompt: string, userData: UserData, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return 'API Error: A chave da API do Gemini não foi fornecida.';
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';

    const { parts: fileParts, text: fileText } = await prepareFileForGemini(file);
    
    let finalPrompt = prompt;

    // Dynamically replace all user data placeholders based on the keys in userData
    for (const key in userData) {
        if (Object.prototype.hasOwnProperty.call(userData, key)) {
            finalPrompt = finalPrompt.replace(new RegExp(`{${key}}`, 'g'), userData[key]);
        }
    }

    // Special handling for composite variables like {fullAddress}
    if (finalPrompt.includes('{fullAddress}')) {
        const addressParts = [
            userData.address,
            userData.neighborhood,
            userData.city,
        ].filter(Boolean); // Filter out empty parts
        const zip = userData.zipCode ? `- CEP: ${userData.zipCode}`: '';
        const fullAddress = `${addressParts.join(', ')} ${zip}`.trim();
        finalPrompt = finalPrompt.replace(/{fullAddress}/g, fullAddress);
    }


    // If it's a text file, construct a combined prompt. Otherwise, use the original.
    const fullPrompt = fileText
        ? `Analise o conteúdo do arquivo de texto abaixo e depois siga as instruções.\n\nCONTEÚDO DO ARQUIVO:\n---\n${fileText}\n---\n\nINSTRUÇÕES:\n${finalPrompt}`
        : finalPrompt;

    const textPart = { text: fullPrompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [...fileParts, textPart] },
    });
    
    return response.text.trim();

  } catch (error) {
    console.error('Error in Gemini API call:', error);
    if (error instanceof Error) {
        if (error.message.includes('API key not valid')) {
            return 'API Error: A chave da API fornecida é inválida. Por favor, verifique e tente novamente.';
        }
        return `API Error: ${error.message}`;
    }
    return 'An unknown error occurred during API call.';
  }
};