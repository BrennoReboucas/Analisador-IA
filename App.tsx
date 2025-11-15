
import React, { useState, useEffect } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { usePrompts } from './hooks/usePrompts';
import { Dashboard } from './components/Dashboard';
import { AnalysisDetail } from './components/AnalysisDetail';
import { useAnalyses } from './hooks/useAnalyses';
import { ThemeToggle } from './components/ThemeToggle';
import { useAuth } from './auth/AuthContext';
import { Login } from './components/Login';
import { useApiKey } from './context/ApiKeyContext';
import { ApiKeyPrompt } from './components/ApiKeyPrompt';
import { useDocumentTypes } from './hooks/useDocumentTypes';
import { useUserDataFields } from './hooks/useUserDataFields';

type View = 'dashboard' | 'admin';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const { apiKey, clearApiKey } = useApiKey();
  const [view, setView] = useState<View>('dashboard');
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
        const storedTheme = window.localStorage.getItem('theme') as Theme;
        if (storedTheme) return storedTheme;
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
    }
    return 'light';
  });

  const { documentTypes, addDocumentType, removeDocumentType } = useDocumentTypes();
  const { userDataFields, addUserDataField, removeUserDataField, hasNewFields, acknowledgeNewFields } = useUserDataFields();
  
  // Hooks now depend on the dynamic lists
  const { prompts, updatePrompt, savePrompts, resetPrompts } = usePrompts(user?.id ?? null, documentTypes);
  const { analyses, createAnalysis, updateAnalysis, deleteAnalysis } = useAnalyses(user?.id ?? null, documentTypes, userDataFields);
  
  const [selectedAnalysisId, setSelectedAnalysisId] = useState<string | null>(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Reset view when user logs out
  useEffect(() => {
    if (!user) {
        setView('dashboard');
        setSelectedAnalysisId(null);
    }
  }, [user]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logout();
    clearApiKey();
  };

  const handleSelectAnalysis = (id: string) => setSelectedAnalysisId(id);
  const handleBackToDashboard = () => setSelectedAnalysisId(null);

  if (!user) {
    return <Login />;
  }

  if (!apiKey) {
    return <ApiKeyPrompt />;
  }

  const selectedAnalysis = selectedAnalysisId ? analyses.find(a => a.id === selectedAnalysisId) : null;

  return (
    <div className="min-h-screen font-sans">
      <header className="bg-white dark:bg-slate-800 shadow-md">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-600 dark:text-slate-300 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                 <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
               </svg>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Analisador de Documentos</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-300">
                Olá, <span className="font-bold">{user.username}</span>!
              </span>
              
              {user.role === 'admin' && (
                 <button
                    onClick={() => setView(v => v === 'admin' ? 'dashboard' : 'admin')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    view === 'admin'
                        ? 'bg-slate-800 dark:bg-slate-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                >
                    {view === 'admin' ? 'Ver Dashboard' : 'Painel Admin'}
                </button>
              )}
              
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Sair
              </button>
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>
          </div>
        </nav>
      </header>
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && (
          selectedAnalysis ? (
            <AnalysisDetail
              key={selectedAnalysis.id}
              analysis={selectedAnalysis}
              onUpdateAnalysis={updateAnalysis}
              onBack={handleBackToDashboard}
              prompts={prompts}
              userDataFields={userDataFields}
              onAddField={addUserDataField}
              onRemoveField={removeUserDataField}
              userRole={user.role}
            />
          ) : (
            <Dashboard
              analyses={analyses}
              onSelectAnalysis={handleSelectAnalysis}
              onCreateAnalysis={createAnalysis}
              onDeleteAnalysis={deleteAnalysis}
            />
          )
        )}
        {view === 'admin' && user.role === 'admin' && (
          <AdminPanel
            prompts={prompts}
            onPromptChange={updatePrompt}
            onSave={savePrompts}
            onReset={resetPrompts}
            documentTypes={documentTypes}
            onAddType={addDocumentType}
            onRemoveType={removeDocumentType}
            userDataFields={userDataFields}
            hasNewFields={hasNewFields}
            onAcknowledgeNewFields={acknowledgeNewFields}
          />
        )}
      </main>
       <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
        <p>Desenvolvido por um Engenheiro de Frontend de classe mundial.</p>
      </footer>
    </div>
  );
};

export default App;