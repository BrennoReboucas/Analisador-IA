
import React, { useState, useEffect } from 'react';
import { DocumentType, PromptConfig, UserDataField } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { PromptVariablesMenu } from './PromptVariablesMenu';

interface AdminPanelProps {
  prompts: PromptConfig;
  onPromptChange: (docType: DocumentType, newPrompt: string) => void;
  onSave: () => void;
  onReset: () => void;
  documentTypes: DocumentType[];
  onAddType: (newType: string) => void;
  onRemoveType: (typeToRemove: string) => void;
  userDataFields: UserDataField[];
  hasNewFields: boolean;
  onAcknowledgeNewFields: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ 
    prompts, 
    onPromptChange, 
    onSave, 
    onReset,
    documentTypes,
    onAddType,
    onRemoveType,
    userDataFields,
    hasNewFields,
    onAcknowledgeNewFields
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [showNewFieldsNotification, setShowNewFieldsNotification] = useState(false);

  useEffect(() => {
    if (hasNewFields) {
      setShowNewFieldsNotification(true);
    }
  }, [hasNewFields]);

  const handleSave = () => {
    onSave();
    setIsSaved(true);
    setShowNewFieldsNotification(false); // Hide notification on save
    onAcknowledgeNewFields();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleReset = () => {
    if (window.confirm("Você tem certeza que deseja restaurar todos os prompts para o padrão?")) {
        onReset();
    }
  }
  
  const handleAddType = () => {
    const trimmedType = newDocType.trim();
    if (trimmedType) {
        onAddType(trimmedType);
        setNewDocType('');
    }
  };
  
  const handleRemoveType = (typeToRemove: DocumentType) => {
    if (window.confirm(`Você tem certeza que deseja remover o tipo de documento "${typeToRemove}"?\n\nIsso não afetará análises existentes, mas impedirá que seja usado em novas análises.`)) {
        onRemoveType(typeToRemove);
    }
  };
  
  const handleInsertVariable = (docType: DocumentType, variable: string) => {
    const textarea = document.getElementById(docType) as HTMLTextAreaElement;
    if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + variable + text.substring(end);
        
        onPromptChange(docType, newText);

        // After state update, focus and set cursor position
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = textarea.selectionEnd = start + variable.length;
        }, 0);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-slate-100">Painel de Administração</h2>

      {showNewFieldsNotification && (
        <div className="mb-4 p-4 border border-yellow-200 bg-yellow-50 text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 rounded-lg">
            <h3 className="font-bold">Novos campos de verificação foram adicionados!</h3>
            <p className="text-sm">Lembre-se de revisar e salvar seus prompts para incluir as novas variáveis disponíveis.</p>
        </div>
      )}

      <div className="mb-8 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">Gerenciar Tipos de Documento</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Adicione ou remova os tipos de documentos que serão solicitados na análise.</p>
        <div className="flex flex-col sm:flex-row gap-2">
            <input 
                type="text" 
                value={newDocType} 
                onChange={(e) => setNewDocType(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddType()}
                placeholder="Ex: Certidão de Nascimento"
                className="flex-grow block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-900 dark:text-slate-100"
            />
            <button 
                onClick={handleAddType} 
                disabled={!newDocType.trim()}
                className="px-4 py-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                <PlusIcon/> Adicionar
            </button>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-slate-100">Configuração de Prompts</h3>
      <p className="mb-6 text-slate-600 dark:text-slate-400">
        Edite os prompts de análise para cada tipo de documento. Use o botão "+ Variáveis" para inserir os dados do usuário na análise.
      </p>
      
      <div className="space-y-6">
        {documentTypes.map((docType) => (
          <div key={docType}>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor={docType} className="block text-md font-semibold text-slate-700 dark:text-slate-300">
                {docType}
              </label>
              <div className="flex items-center gap-4">
                <PromptVariablesMenu fields={userDataFields} onVariableSelect={(v) => handleInsertVariable(docType, v)} />
                <button onClick={() => handleRemoveType(docType)} className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" aria-label={`Remover ${docType}`}>
                  <TrashIcon />
                </button>
              </div>
            </div>
            <textarea
              id={docType}
              rows={4}
              className="w-full p-3 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:ring-slate-500 focus:border-slate-500 transition bg-white dark:bg-slate-700 dark:text-slate-100"
              value={prompts[docType] || ''}
              onChange={(e) => onPromptChange(docType, e.target.value)}
            />
          </div>
        ))}
        {documentTypes.length === 0 && (
            <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                <h3 className="text-lg text-slate-600 dark:text-slate-300 font-medium">Nenhum tipo de documento configurado.</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Adicione um novo tipo de documento para começar.</p>
            </div>
        )}
      </div>
      <div className="mt-8 flex items-center justify-end space-x-4">
        <button 
          onClick={handleReset}
          className="px-6 py-2 rounded-md font-semibold text-slate-700 bg-slate-200 hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors"
        >
          Restaurar Padrões
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
        >
          {isSaved ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
        </button>
      </div>
    </div>
  );
};