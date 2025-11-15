
import { useState, useCallback, useEffect } from 'react';
import { Analysis, AnalysisOverallStatus, ChecklistStatus, DocumentType, UserData, UserDataField } from '../types';
import { calculateOverallStatus } from '../utils/analysisUtils';

const ANALYSES_STORAGE_KEY_PREFIX = 'document-analyzer-analyses';

const createNewAnalysis = (personName: string, documentTypes: DocumentType[], userDataFields: UserDataField[]): Analysis => {
  const checklist = documentTypes.map(type => ({
      id: type,
      type: type,
      file: null,
      status: ChecklistStatus.PENDING,
      result: null,
  }));
  
  const initialUserData: UserData = {};
  userDataFields.forEach(field => {
    // The `personName` from the creation form populates the 'name' field by default.
    initialUserData[field.key] = field.key === 'name' ? personName : '';
  });

  return {
    id: crypto.randomUUID(),
    personName,
    createdAt: new Date().toISOString(),
    userData: initialUserData,
    checklist,
    overallStatus: AnalysisOverallStatus.PENDING_DOCS,
  };
};

export const useAnalyses = (userId: string | null, documentTypes: DocumentType[], userDataFields: UserDataField[]) => {
  const [analyses, setAnalyses] = useState<Analysis[]>([]);
  
  // Load analyses when userId changes
  useEffect(() => {
    if (!userId) {
      setAnalyses([]);
      return;
    }

    const ANALYSES_STORAGE_KEY = `${ANALYSES_STORAGE_KEY_PREFIX}-${userId}`;
    try {
      const storedAnalyses = window.localStorage.getItem(ANALYSES_STORAGE_KEY);
      if (storedAnalyses) {
        // We need to re-instantiate File objects as they are not serializable
        const parsed = JSON.parse(storedAnalyses) as Analysis[];
        const loadedAnalyses = parsed.map(analysis => ({
            ...analysis,
            // Files are lost on refresh, this is expected behavior
            checklist: analysis.checklist.map(item => ({...item, file: null, status: item.file ? ChecklistStatus.UPLOADED : ChecklistStatus.PENDING })) 
        }));
        setAnalyses(loadedAnalyses);
      } else {
        setAnalyses([]);
      }
    } catch (error) {
      console.error('Error reading analyses from localStorage', error);
      setAnalyses([]);
    }
  }, [userId]);

  // Save analyses when they change
  useEffect(() => {
    if (!userId || analyses.length === 0 && !window.localStorage.getItem(`${ANALYSES_STORAGE_KEY_PREFIX}-${userId}`)) {
      return;
    }

    const ANALYSES_STORAGE_KEY = `${ANALYSES_STORAGE_KEY_PREFIX}-${userId}`;
    try {
      // Create a serializable version of analyses (without File objects)
      const analysesToStore = analyses.map(analysis => {
        const { checklist, ...restOfAnalysis } = analysis;
        const serializableChecklist = checklist.map(item => {
            const { file, ...restOfItem } = item;
            return {
                ...restOfItem,
                // Store file metadata if needed, but not the File object itself
                fileName: file ? file.name : null,
            };
        });
        return { ...restOfAnalysis, checklist: serializableChecklist };
      });
      window.localStorage.setItem(ANALYSES_STORAGE_KEY, JSON.stringify(analysesToStore));
    } catch (error) {
      console.error('Error saving analyses to localStorage', error);
    }
  }, [analyses, userId]);

  const createAnalysis = useCallback((personName: string) => {
    if (!userId || userDataFields.length === 0) return;
    const newAnalysis = createNewAnalysis(personName, documentTypes, userDataFields);
    setAnalyses(prev => [newAnalysis, ...prev]);
  }, [userId, documentTypes, userDataFields]);

  const updateAnalysis = useCallback((updatedAnalysis: Analysis) => {
    if (!userId) return;
    const newStatus = calculateOverallStatus(updatedAnalysis.checklist);
    const analysisWithStatus = { ...updatedAnalysis, overallStatus: newStatus };
    setAnalyses(prev => prev.map(a => a.id === updatedAnalysis.id ? analysisWithStatus : a));
  }, [userId]);
  
  const deleteAnalysis = useCallback((analysisId: string) => {
    if (!userId) return;
    setAnalyses(prev => prev.filter(a => a.id !== analysisId));
  }, [userId]);

  return { analyses, createAnalysis, updateAnalysis, deleteAnalysis };
};