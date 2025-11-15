
import { useState, useCallback, useEffect } from 'react';
import { UserDataField } from '../types';

const USER_DATA_FIELDS_STORAGE_KEY = 'document-analyzer-user-data-fields';

const INITIAL_USER_DATA_FIELDS: UserDataField[] = [
  { key: 'name', label: 'Nome Completo', type: 'text', isProtected: true },
  { key: 'cpf', label: 'CPF', type: 'tel', validation: 'cpf', isProtected: true },
  { key: 'dateOfBirth', label: 'Data de Nascimento', type: 'date', validation: 'dateOfBirth', isProtected: true },
  { key: 'address', label: 'Endereço (Rua, Nº)', type: 'text', isProtected: true },
  { key: 'neighborhood', label: 'Bairro', type: 'text', isProtected: true },
  { key: 'city', label: 'Cidade', type: 'text', isProtected: true },
  { key: 'zipCode', label: 'CEP', type: 'tel', validation: 'zipCode', isProtected: true },
];

export const useUserDataFields = () => {
  const [userDataFields, setUserDataFields] = useState<UserDataField[]>([]);
  const [hasNewFields, setHasNewFields] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(USER_DATA_FIELDS_STORAGE_KEY);
      if (stored) {
        setUserDataFields(JSON.parse(stored));
      } else {
        setUserDataFields(INITIAL_USER_DATA_FIELDS);
      }
    } catch (error) {
      console.error('Error reading user data fields from localStorage', error);
      setUserDataFields(INITIAL_USER_DATA_FIELDS);
    }
  }, []);

  const saveToStorage = (fields: UserDataField[]) => {
    try {
      window.localStorage.setItem(USER_DATA_FIELDS_STORAGE_KEY, JSON.stringify(fields));
    } catch (error) {
      console.error('Error saving user data fields to localStorage', error);
    }
  };

  const addUserDataField = useCallback((newField: Omit<UserDataField, 'isProtected'>) => {
    setUserDataFields(prev => {
      if (prev.some(f => f.key === newField.key || f.label === newField.label)) {
        alert('Um campo com esta chave ou rótulo já existe.');
        return prev;
      }
      const newFields = [...prev, { ...newField, isProtected: false }];
      saveToStorage(newFields);
      setHasNewFields(true);
      return newFields;
    });
  }, []);

  const removeUserDataField = useCallback((keyToRemove: string) => {
    setUserDataFields(prev => {
      const fieldToRemove = prev.find(f => f.key === keyToRemove);
      if (fieldToRemove?.isProtected) {
          alert('Este campo é protegido e não pode ser removido.');
          return prev;
      }
      const newFields = prev.filter(f => f.key !== keyToRemove);
      saveToStorage(newFields);
      return newFields;
    });
  }, []);

  const acknowledgeNewFields = useCallback(() => {
    setHasNewFields(false);
  }, []);

  return { userDataFields, addUserDataField, removeUserDataField, hasNewFields, acknowledgeNewFields };
};