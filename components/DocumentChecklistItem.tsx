import React, { useCallback, useState } from 'react';
// FIX: Renamed imported type to avoid name collision with the component.
import { DocumentChecklistItem as DocumentChecklistItemType, ChecklistStatus, DocumentType } from '../types';
import { CheckIcon } from './icons/CheckIcon';
import { XIcon } from './icons/XIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { PendingIcon } from './icons/PendingIcon';
import { UploadIcon } from './icons/UploadIcon';

interface DocumentChecklistItemProps {
  item: DocumentChecklistItemType;
  isActive: boolean;
  onFileSelect: (type: DocumentType, file: File) => void;
  onRemoveFile: (type: DocumentType) => void;
}

const getResultInfo = (result: string | null) => {
    if (!result) return { color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700', text: '' };
    if (result.startsWith('CORRETO')) return { color: 'text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/50', text: result };
    if (result.startsWith('INCORRETO')) return { color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50', text: result };
    if (result.startsWith('API Error') || result.startsWith('Falha')) return { color: 'text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/50', text: result };
    return { color: 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700', text: result };
}

const StatusIcon: React.FC<{ status: ChecklistStatus, result: string | null }> = ({ status, result }) => {
    switch (status) {
        case ChecklistStatus.UPLOADED: return <div className="text-green-500"><CheckIcon /></div>;
        case ChecklistStatus.ANALYZING: return <div className="text-blue-500"><SpinnerIcon /></div>;
        case ChecklistStatus.SUCCESS:
            return result?.startsWith("CORRETO") ? <div className="text-green-600"><CheckIcon /></div> : <div className="text-red-600"><XIcon /></div>;
        case ChecklistStatus.ERROR: return <div className="text-red-600"><XIcon /></div>;
        default: return null;
    }
}

export const DocumentChecklistItem: React.FC<DocumentChecklistItemProps> = ({ item, isActive, onFileSelect, onRemoveFile }) => {
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (files: FileList | null) => {
        if (files && files.length > 0) {
            onFileSelect(item.type, files[0]);
        }
    };
    
    const onDragOver = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLLabelElement>) => {
        e.preventDefault();
        setIsDragging(false);
        handleFileChange(e.dataTransfer.files);
    }, [item.type]);


    if (item.status === ChecklistStatus.PENDING) {
        const baseClasses = "border p-4 rounded-lg flex items-center gap-4 transition-all";
        const activeClasses = "border-slate-500 dark:border-slate-400 bg-slate-50 dark:bg-slate-800/50 border-2 border-dashed shadow-md cursor-pointer";
        const inactiveClasses = "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 opacity-60";
        const dragOverClasses = "ring-2 ring-slate-500 ring-offset-2";
        
        return (
             <div className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses}`}>
                 <div className={`flex-shrink-0 ${isActive ? 'text-slate-600 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'}`}>
                    {isActive ? <UploadIcon /> : <PendingIcon /> }
                 </div>
                 <label 
                    htmlFor={isActive ? `file-upload-${item.id}`: undefined} 
                    className={`flex-1 ${isActive ? 'cursor-pointer' : 'cursor-default'} ${isDragging ? dragOverClasses: ''}`}
                    onDragOver={isActive ? onDragOver : undefined}
                    onDragLeave={isActive ? onDragLeave : undefined}
                    onDrop={isActive ? onDrop : undefined}
                >
                    <p className={`font-semibold ${isActive ? 'text-slate-800 dark:text-slate-100': 'text-slate-500 dark:text-slate-400'}`}>{item.type}</p>
                    {isActive && <p className="text-sm text-slate-500 dark:text-slate-400">Clique para selecionar ou arraste o arquivo aqui</p>}
                    <input id={`file-upload-${item.id}`} type="file" className="sr-only" onChange={(e) => handleFileChange(e.target.files)} disabled={!isActive} accept="image/*,.pdf,.txt"/>
                 </label>
             </div>
        );
    }
  
    // Render completed/in-progress items
    const resultInfo = getResultInfo(item.result);

    return (
        <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-4 rounded-lg flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex items-center gap-4 flex-1 w-full">
                <div className="flex-shrink-0">
                    <StatusIcon status={item.status} result={item.result} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.type}</p>
                    {item.file && <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{item.file.name}</p>}
                </div>
            </div>
            
            {item.result && (
                <div className={`flex-1 w-full md:w-auto p-2 rounded-md text-sm font-mono ${resultInfo.color}`}>
                    {resultInfo.text}
                </div>
            )}
            
            <button onClick={() => onRemoveFile(item.type)} className="text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex-shrink-0" aria-label={`Remover ${item.type}`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
            </button>
        </div>
    );
};