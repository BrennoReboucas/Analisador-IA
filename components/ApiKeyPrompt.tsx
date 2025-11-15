import React, { useState, FormEvent } from 'react';
import { useApiKey } from '../context/ApiKeyContext';

export const ApiKeyPrompt: React.FC = () => {
    const [key, setKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { setApiKey } = useApiKey();

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (!key.trim()) return;
        setIsLoading(true);
        // Simulate a small delay for user feedback
        setTimeout(() => {
            setApiKey(key.trim());
            setIsLoading(false);
        }, 500);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900">
            <div className="w-full max-w-lg p-8 space-y-8 bg-white dark:bg-slate-800 rounded-lg shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Chave da API do Gemini</h1>
                    <p className="mt-2 text-slate-500 dark:text-slate-400">
                        Para continuar, por favor, insira sua chave da API do Google Gemini.
                    </p>
                    <a 
                        href="https://aistudio.google.com/app/apikey" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 underline mt-1 inline-block"
                    >
                        Obtenha sua chave da API no Google AI Studio
                    </a>
                </div>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div>
                        <label
                            htmlFor="api-key"
                            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                        >
                            Sua Chave da API
                        </label>
                        <input
                            id="api-key"
                            name="api-key"
                            type="password"
                            autoComplete="off"
                            required
                            value={key}
                            onChange={(e) => setKey(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500 sm:text-sm text-slate-900 dark:text-slate-100"
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading || !key.trim()}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-800 hover:bg-slate-700 dark:bg-slate-600 dark:hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50"
                        >
                            {isLoading ? 'Salvando...' : 'Salvar e Continuar'}
                        </button>
                    </div>
                </form>
                 <footer className="text-center pt-4 text-xs text-slate-400 dark:text-slate-500 border-t border-slate-200 dark:border-slate-700">
                    <p>Sua chave da API é armazenada apenas na sessão do seu navegador e não é enviada para nossos servidores.</p>
                </footer>
            </div>
        </div>
    );
};
