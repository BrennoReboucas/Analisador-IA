import React, { useState } from 'react';
import { Analysis } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { StatusBadge } from './icons/StatusIcons';

interface DashboardProps {
    analyses: Analysis[];
    onSelectAnalysis: (id: string) => void;
    onCreateAnalysis: (personName: string) => void;
    onDeleteAnalysis: (id: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ analyses, onSelectAnalysis, onCreateAnalysis, onDeleteAnalysis }) => {
    const [newPersonName, setNewPersonName] = useState('');
    
    const handleCreate = () => {
        if (newPersonName.trim()) {
            onCreateAnalysis(newPersonName.trim());
            setNewPersonName('');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleCreate();
        }
    }

    const handleDelete = (analysisId: string, personName: string) => {
        if (window.confirm(`Você tem certeza que deseja excluir a análise de "${personName}"? Esta ação não pode ser desfeita.`)) {
            onDeleteAnalysis(analysisId);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard de Análises</h2>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={newPersonName}
                        onChange={(e) => setNewPersonName(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Nome do Analisado"
                        className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-900 dark:text-slate-100"
                    />
                    <button
                        onClick={handleCreate}
                        disabled={!newPersonName.trim()}
                        className="px-4 py-2 rounded-md font-semibold text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        <PlusIcon />
                        Criar Nova Análise
                    </button>
                </div>
            </div>
            
            <div className="space-y-3">
                {analyses.length > 0 ? (
                    analyses.map(analysis => (
                        <div key={analysis.id} className="border border-slate-200 dark:border-slate-700 p-4 rounded-lg flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                           <div className="flex-1 cursor-pointer" onClick={() => onSelectAnalysis(analysis.id)}>
                             <p className="font-semibold text-slate-800 dark:text-slate-200">{analysis.personName}</p>
                             <p className="text-sm text-slate-500 dark:text-slate-400">
                                Criado em: {new Date(analysis.createdAt).toLocaleDateString()}
                             </p>
                           </div>
                           <div className="flex items-center gap-4">
                            <StatusBadge status={analysis.overallStatus} />
                            <button 
                                onClick={(e) => { e.stopPropagation(); handleDelete(analysis.id, analysis.personName); }} 
                                className="text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                aria-label={`Excluir análise de ${analysis.personName}`}
                            >
                                <TrashIcon />
                            </button>
                           </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                        <h3 className="text-lg text-slate-600 dark:text-slate-300 font-medium">Nenhuma análise iniciada.</h3>
                        <p className="text-slate-500 dark:text-slate-400 mt-1">Crie uma nova análise para começar a verificar documentos.</p>
                    </div>
                )}
            </div>
        </div>
    );
};