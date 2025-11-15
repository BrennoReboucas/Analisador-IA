
import React, { useState, useCallback, ChangeEvent, FocusEvent, useEffect } from 'react';
import { PromptConfig, DocumentChecklistItem, ChecklistStatus, UserData, DocumentType, Analysis, UserDataField, Role } from '../types';
import { analyzeDocument } from '../services/geminiService';
import { DocumentChecklistItem as ChecklistItem } from './DocumentChecklistItem';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { useApiKey } from '../context/ApiKeyContext';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AnalysisDetailProps {
  analysis: Analysis;
  onUpdateAnalysis: (analysis: Analysis) => void;
  onBack: () => void;
  prompts: PromptConfig;
  userDataFields: UserDataField[];
  onAddField: (newField: Omit<UserDataField, 'isProtected'>) => void;
  onRemoveField: (key: string) => void;
  userRole: Role;
}

const NewFieldForm: React.FC<{ onAddField: (newField: Omit<UserDataField, 'isProtected'>) => void }> = ({ onAddField }) => {
    const [label, setLabel] = useState('');
    const [key, setKey] = useState('');

    const handleAdd = () => {
        if (!label.trim() || !key.trim()) {
            alert('Rótulo e Chave do Campo são obrigatórios.');
            return;
        }
        if (!/^[a-zA-Z0-9_]+$/.test(key)) {
            alert('A Chave do Campo deve conter apenas letras, números e underscores.');
            return;
        }
        onAddField({ label, key, type: 'text' });
        setLabel('');
        setKey('');
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 mt-4 p-4 border-t border-slate-200 dark:border-slate-700">
            <input 
                type="text" 
                value={label} 
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Rótulo do Campo (Ex: Renda Mensal)"
                className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-900 dark:text-slate-100"
            />
            <input 
                type="text" 
                value={key} 
                onChange={(e) => setKey(e.target.value.replace(/\s/g, ''))}
                placeholder="Chave (Ex: rendaMensal)"
                className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-900 dark:text-slate-100"
            />
            <button 
                onClick={handleAdd} 
                className="px-4 py-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors disabled:bg-slate-400 flex items-center justify-center gap-2"
            >
                <PlusIcon /> Adicionar Campo
            </button>
        </div>
    );
};


export const AnalysisDetail: React.FC<AnalysisDetailProps> = ({ 
    analysis, onUpdateAnalysis, onBack, prompts, userDataFields, onAddField, onRemoveField, userRole 
}) => {
  const [checklist, setChecklist] = useState<DocumentChecklistItem[]>(analysis.checklist);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [userData, setUserData] = useState<UserData>(analysis.userData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { apiKey } = useApiKey();

  // When userData or checklist changes, call the parent update function
  useEffect(() => {
    onUpdateAnalysis({ ...analysis, userData, checklist });
  }, [userData, checklist]);


  const handleFileSelect = (type: DocumentType, file: File) => {
    setChecklist(prev =>
      prev.map(item =>
        item.type === type ? { ...item, file, status: ChecklistStatus.UPLOADED } : item
      )
    );
  };
  
  const handleRemoveFile = (type: DocumentType) => {
    setChecklist(prev =>
      prev.map(item =>
        item.type === type ? { ...item, file: null, status: ChecklistStatus.PENDING, result: null } : item
      )
    );
  };

  const validateField = (key: string, value: string, validationType?: 'cpf' | 'zipCode' | 'dateOfBirth'): string => {
    if (!value) return 'Este campo é obrigatório.';

    switch (validationType) {
        case 'cpf':
            return value.length === 11 ? '' : 'CPF inválido. Deve conter 11 dígitos.';
        case 'zipCode':
            return value.length === 8 ? '' : 'CEP inválido. Deve conter 8 dígitos.';
        case 'dateOfBirth':
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (isNaN(selectedDate.getTime())) return 'Data inválida.';
            if (selectedDate > today) return 'A data de nascimento não pode ser no futuro.';
            return '';
        default:
            return '';
    }
  };

  const isFormValid = userDataFields.every(field => !validateField(field.key, userData[field.key] || '', field.validation));
  
  const handleAnalyzeAll = useCallback(async () => {
    if (!isFormValid) {
      alert('Por favor, preencha todos os campos de informações corretamente para verificação.');
      return;
    }
    
    const itemsToAnalyze = checklist.filter(item => item.status === ChecklistStatus.UPLOADED && item.file);

    if (itemsToAnalyze.length === 0) {
        alert('Não há novos documentos para analisar.');
        return;
    }

    if (!apiKey) {
      alert('A chave da API do Gemini não está configurada. Não é possível continuar.');
      return;
    }

    setIsAnalyzing(true);

    let tempChecklist = [...checklist];

    for (const item of itemsToAnalyze) {
      tempChecklist = tempChecklist.map(i => i.id === item.id ? { ...i, status: ChecklistStatus.ANALYZING } : i);
      setChecklist(tempChecklist);

      try {
        const result = await analyzeDocument(item.file!, prompts[item.type], userData, apiKey);
        tempChecklist = tempChecklist.map(i => i.id === item.id ? { ...i, status: ChecklistStatus.SUCCESS, result } : i);
      } catch (error) {
        console.error('Error analyzing document:', error);
        const errorMessage = error instanceof Error ? error.message : 'Ocorreu um erro desconhecido.';
        tempChecklist = tempChecklist.map(i => i.id === item.id ? { ...i, status: ChecklistStatus.ERROR, result: `Falha na análise: ${errorMessage}` } : i);
      }
      setChecklist(tempChecklist);
    }

    setIsAnalyzing(false);
  }, [checklist, prompts, userData, apiKey, isFormValid]);
  
  const handleUserDataChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = userDataFields.find(f => f.key === name);
    let sanitizedValue = value;

    if (field?.validation === 'cpf' || field?.validation === 'zipCode') {
        sanitizedValue = value.replace(/\D/g, ''); // Allow only numbers
        const maxLength = field.validation === 'cpf' ? 11 : 8;
        if (sanitizedValue.length > maxLength) {
            sanitizedValue = sanitizedValue.slice(0, maxLength);
        }
    }
    
    setUserData(prev => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
        const error = validateField(name, sanitizedValue, field?.validation);
        setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const field = userDataFields.find(f => f.key === name);
    const error = validateField(name, value, field?.validation);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const pendingItems = checklist.filter(item => item.status === ChecklistStatus.PENDING);
  const completedItems = checklist.filter(item => item.status !== ChecklistStatus.PENDING).sort((a,b) => a.type.localeCompare(b.type));
  const activeItem = pendingItems[0] || null;
  const canAnalyze = checklist.some(item => item.status === ChecklistStatus.UPLOADED);

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-900 dark:text-slate-100";
  const errorInputClasses = "border-red-500 text-red-900 focus:border-red-500 focus:ring-red-500 dark:border-red-500 dark:text-red-300";


  return (
    <div className="space-y-8">
        <div className="flex items-center gap-4">
            <button
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Voltar para a lista de análises"
            >
            <ChevronLeftIcon />
            </button>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Painel do Analista: <span className="text-slate-600 dark:text-slate-400">{analysis.personName}</span></h2>
        </div>

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">1. Informações para Verificação</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userDataFields.map((field) => (
                <div key={field.key} className={field.key === 'name' || field.key === 'address' ? 'lg:col-span-2' : ''}>
                    <label htmlFor={field.key} className="block text-sm font-medium text-slate-700 dark:text-slate-300">{field.label}</label>
                    <input 
                        type={field.type}
                        name={field.key} 
                        id={field.key} 
                        value={userData[field.key] || ''} 
                        onChange={handleUserDataChange} 
                        onBlur={handleBlur}
                        placeholder={field.validation === 'cpf' || field.validation === 'zipCode' ? "Apenas números" : ''}
                        className={`${inputClasses} ${errors[field.key] ? errorInputClasses : ''}`} />
                    {errors[field.key] && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors[field.key]}</p>}
                </div>
            ))}
        </div>
      </div>

      {userRole === 'admin' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Gerenciar Campos de Verificação</h3>
            <div className="space-y-2">
                {userDataFields.filter(f => !f.isProtected).map(field => (
                    <div key={field.key} className="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-md">
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{field.label} ({`{${field.key}}`})</span>
                        <button onClick={() => onRemoveField(field.key)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
            <NewFieldForm onAddField={onAddField} />
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
          <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
             <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">2. Análise de Documentos</h3>
             <button
                onClick={handleAnalyzeAll}
                disabled={isAnalyzing || !canAnalyze || !isFormValid}
                className="px-6 py-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors disabled:bg-slate-400 dark:disabled:bg-slate-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                {isAnalyzing && (
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                )}
                {isAnalyzing ? 'Analisando...' : 'Analisar Documentos Enviados'}
             </button>
          </div>
        <div className="space-y-6">
            <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b dark:border-slate-700 pb-2 mb-4">Aguardando Envio</h4>
                <div className="space-y-3">
                    {pendingItems.map(item => (
                        <ChecklistItem 
                            key={item.id}
                            item={item}
                            isActive={item.id === activeItem?.id}
                            onFileSelect={handleFileSelect}
                            onRemoveFile={handleRemoveFile}
                        />
                    ))}
                </div>
                 {pendingItems.length === 0 && (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <p className="text-slate-500 dark:text-slate-400 font-medium">Todos os documentos necessários foram enviados.</p>
                        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Clique em "Analisar Documentos Enviados" para continuar.</p>
                    </div>
                 )}
            </div>

            {completedItems.length > 0 && (
                <div>
                <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200 border-b dark:border-slate-700 pb-2 mb-4">Enviados & Analisados</h4>
                <div className="space-y-3">
                    {completedItems.map(item => (
                        <ChecklistItem 
                            key={item.id}
                            item={item}
                            isActive={false}
                            onFileSelect={handleFileSelect}
                            onRemoveFile={handleRemoveFile}
                        />
                    ))}
                </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};