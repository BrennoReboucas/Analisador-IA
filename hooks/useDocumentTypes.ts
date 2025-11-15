
import { useState, useCallback, useEffect } from 'react';
import { INITIAL_DOCUMENT_TYPES } from '../constants';
import { DocumentType } from '../types';

const DOC_TYPES_STORAGE_KEY = 'document-analyzer-doc-types';

export const useDocumentTypes = () => {
  const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(DOC_TYPES_STORAGE_KEY);
      if (stored) {
        setDocumentTypes(JSON.parse(stored));
      } else {
        // Initialize from constants if nothing is in storage
        setDocumentTypes(INITIAL_DOCUMENT_TYPES);
      }
    } catch (error) {
      console.error('Error reading document types from localStorage', error);
      setDocumentTypes(INITIAL_DOCUMENT_TYPES);
    }
  }, []);

  const saveToStorage = (types: DocumentType[]) => {
    try {
      window.localStorage.setItem(DOC_TYPES_STORAGE_KEY, JSON.stringify(types));
    } catch (error) {
      console.error('Error saving document types to localStorage', error);
    }
  };

  const addDocumentType = useCallback((newType: string) => {
    setDocumentTypes(prev => {
      if (prev.includes(newType)) {
        alert('Este tipo de documento já existe.');
        return prev;
      }
      const newTypes = [...prev, newType];
      saveToStorage(newTypes);
      return newTypes;
    });
  }, []);

  const removeDocumentType = useCallback((typeToRemove: string) => {
    setDocumentTypes(prev => {
      const newTypes = prev.filter(t => t !== typeToRemove);
      saveToStorage(newTypes);
      return newTypes;
    });
  }, []);

  return { documentTypes, addDocumentType, removeDocumentType };
};
