
export type Role = 'admin' | 'user';

export interface User {
    id: string;
    username: string;
    password?: string; // Password should not be stored in client-side state long-term
    role: Role;
}

// Changed from an enum to a string type to allow dynamic creation of document types.
export type DocumentType = string;

export enum InitialDocumentTypes {
  TERMO_RESPONSABILIDADE = 'Termo de Responsabilidade',
  CARTA_RECOMENDACAO = 'Carta de Recomendação',
  RELATORIO_PEDIDO = 'Relatório de Pedido com Valores',
  COMPROVANTE_ENDERECO = 'Comprovante de Endereço',
  IDENTIDADE = 'Foto de Identidade',
}

export type PromptConfig = Record<DocumentType, string>;

export enum ChecklistStatus {
  PENDING = 'PENDING',
  UPLOADED = 'UPLOADED',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface DocumentChecklistItem {
  id: DocumentType;
  type: DocumentType;
  file: File | null;
  status: ChecklistStatus;
  result: string | null;
}

/**
 * Defines the structure for a user data field that can be dynamically managed by an admin.
 */
export interface UserDataField {
  key: string; // e.g., 'name', 'cpf', 'userIncome'
  label: string; // e.g., 'Nome Completo', 'CPF', 'Renda do Usuário'
  type: 'text' | 'date' | 'tel';
  validation?: 'cpf' | 'zipCode' | 'dateOfBirth';
  isProtected?: boolean; // If true, cannot be deleted by the admin
}

// UserData is now a flexible object based on configured fields.
export interface UserData extends Record<string, string> {}


export enum AnalysisOverallStatus {
    PENDING_DOCS = 'Pendente de Documentos',
    COMPLETED_SUCCESS = 'Concluído com Sucesso',
    COMPLETED_PENDING = 'Concluído com Pendências',
}

export interface Analysis {
    id: string;
    personName: string;
    createdAt: string;
    userData: UserData;
    checklist: DocumentChecklistItem[];
    overallStatus: AnalysisOverallStatus;
}