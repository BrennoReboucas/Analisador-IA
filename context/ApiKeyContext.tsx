import React, { createContext, useState, useContext, ReactNode, useMemo, useCallback } from 'react';

interface ApiKeyContextType {
  apiKey: string | null;
  setApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

const API_KEY_STORAGE_KEY = 'gemini-api-key';

export const ApiKeyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [apiKey, setApiKeyState] = useState<string | null>(() => {
    try {
      return window.sessionStorage.getItem(API_KEY_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to read API key from session storage', error);
      return null;
    }
  });

  const setApiKey = useCallback((key: string) => {
    try {
      window.sessionStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKeyState(key);
    } catch (error) {
      console.error('Failed to save API key to session storage', error);
    }
  }, []);
  
  const clearApiKey = useCallback(() => {
    try {
        window.sessionStorage.removeItem(API_KEY_STORAGE_KEY);
        setApiKeyState(null);
    } catch (error) {
        console.error('Failed to remove API key from session storage', error);
    }
  }, []);


  const value = useMemo(() => ({ apiKey, setApiKey, clearApiKey }), [apiKey, setApiKey, clearApiKey]);

  return <ApiKeyContext.Provider value={value}>{children}</ApiKeyContext.Provider>;
};

export const useApiKey = (): ApiKeyContextType => {
  const context = useContext(ApiKeyContext);
  if (context === undefined) {
    throw new Error('useApiKey must be used within an ApiKeyProvider');
  }
  return context;
};
