
import { useState, useCallback, useEffect } from 'react';
import { DocumentType, PromptConfig } from '../types';
import { INITIAL_PROMPTS } from '../constants';

const PROMPTS_STORAGE_KEY_PREFIX = 'document-analyzer-prompts';
const DEFAULT_NEW_PROMPT = `Este é um novo tipo de documento. Por favor, defina um prompt de análise. Verifique se o nome corresponde a "{name}". Responda APENAS com "CORRETO" ou "INCORRETO" com o motivo.`;

export const usePrompts = (userId: string | null, documentTypes: DocumentType[]) => {
  const [prompts, setPrompts] = useState<PromptConfig>({});

  useEffect(() => {
    if (!userId) {
        setPrompts(INITIAL_PROMPTS); // Reset to default if no user
        return;
    };
    
    const PROMPTS_STORAGE_KEY = `${PROMPTS_STORAGE_KEY_PREFIX}-${userId}`;
    
    try {
      const storedPrompts = window.localStorage.getItem(PROMPTS_STORAGE_KEY);
      if (storedPrompts) {
        const parsedPrompts = JSON.parse(storedPrompts);
        setPrompts(parsedPrompts);
      } else {
        setPrompts(INITIAL_PROMPTS);
      }
    } catch (error) {
      console.error('Error reading prompts from localStorage', error);
      setPrompts(INITIAL_PROMPTS);
    }
  }, [userId]);
  
  // Sync prompts with the master list of document types
  useEffect(() => {
    // Wait until both documentTypes and prompts are loaded
    if (documentTypes.length === 0 || !userId) return;

    setPrompts(currentPrompts => {
      let promptsUpdated = false;
      const newPrompts = { ...currentPrompts };
      
      documentTypes.forEach(docType => {
        if (!(docType in newPrompts)) {
          newPrompts[docType] = DEFAULT_NEW_PROMPT;
          promptsUpdated = true;
        }
      });
      
      return promptsUpdated ? newPrompts : currentPrompts;
    });
  }, [documentTypes, userId]);

  const updatePrompt = useCallback((docType: DocumentType, newPrompt: string) => {
    setPrompts((prevPrompts) => ({
      ...prevPrompts,
      [docType]: newPrompt,
    }));
  }, []);

  const savePrompts = useCallback(() => {
    if (!userId) return;
    const PROMPTS_STORAGE_KEY = `${PROMPTS_STORAGE_KEY_PREFIX}-${userId}`;
    try {
      window.localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
    } catch (error) {
      console.error('Error saving prompts to localStorage', error);
    }
  }, [prompts, userId]);
  
  const resetPrompts = useCallback(() => {
    if (!userId) return;
    const PROMPTS_STORAGE_KEY = `${PROMPTS_STORAGE_KEY_PREFIX}-${userId}`;

    const resetState = { ...INITIAL_PROMPTS };
    documentTypes.forEach(docType => {
        if (!resetState[docType]) {
            resetState[docType] = DEFAULT_NEW_PROMPT;
        }
    });

    setPrompts(resetState);
    try {
      window.localStorage.setItem(PROMPTS_STORAGE_KEY, JSON.stringify(resetState));
    } catch (error) {
      console.error('Error resetting prompts in localStorage', error);
    }
  }, [userId, documentTypes]);

  return { prompts, updatePrompt, savePrompts, resetPrompts };
};