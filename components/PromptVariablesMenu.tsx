
import React, { useState, useRef, useEffect } from 'react';
import { UserDataField } from '../types';
import { PlusIcon } from './icons/PlusIcon';

interface PromptVariablesMenuProps {
  fields: UserDataField[];
  onVariableSelect: (variable: string) => void;
}

export const PromptVariablesMenu: React.FC<PromptVariablesMenuProps> = ({ fields, onVariableSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsOpen(prev => !prev);

  const handleSelect = (key: string) => {
    onVariableSelect(key);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const allFields = [...fields, { key: 'fullAddress', label: 'Endereço Completo' }];

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div>
        <button
          type="button"
          onClick={toggleMenu}
          className="inline-flex justify-center items-center gap-1 w-full rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-3 py-1 bg-white dark:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800 focus:ring-slate-500"
        >
          <PlusIcon /> Variáveis
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-slate-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {allFields.map((field) => (
              <a
                href="#"
                key={field.key}
                onClick={(e) => {
                  e.preventDefault();
                  handleSelect(`{${field.key}}`);
                }}
                className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                role="menuitem"
              >
                <span className="font-semibold">{field.label}</span>
                <code className="ml-2 text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded-md">{`{${field.key}}`}</code>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};