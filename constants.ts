import { InitialDocumentTypes, PromptConfig } from './types';

export const INITIAL_PROMPTS: PromptConfig = {
  [InitialDocumentTypes.TERMO_RESPONSABILIDADE]: `Analise este termo de responsabilidade. Verifique se o nome completo corresponde a "{name}", o CPF a "{cpf}" e a data de nascimento a "{dateOfBirth}". Responda APENAS com "CORRETO" se todos estiverem presentes e corretos, ou "INCORRETO" com o motivo.`,
  [InitialDocumentTypes.CARTA_RECOMENDACAO]: `Analise esta carta de recomendação. Verifique se o nome completo do recomendado corresponde a "{name}". Verifique também se há uma data válida no documento. Responda APENAS com "CORRETO" se todas as condições forem atendidas, ou "INCORRETO" com o motivo.`,
  [InitialDocumentTypes.RELATORIO_PEDIDO]: `Analise este relatório de pedido. Extraia o valor total do pedido. Responda APENAS com o valor total formatado como "Valor Total: R$ X.XXX,XX". Se não encontrar, responda "Valor não encontrado".`,
  [InitialDocumentTypes.COMPROVANTE_ENDERECO]: `Analise este comprovante de endereço. Verifique se o nome corresponde a "{name}", se o endereço é compatível com "{fullAddress}" e se a data de emissão é recente (últimos 3 meses). Responda APENAS com "CORRETO" ou "INCORRETO" com o motivo.`,
  [InitialDocumentTypes.IDENTIDADE]: `Analise este documento de identidade. Verifique se o nome completo corresponde a "{name}", o CPF a "{cpf}" e a data de nascimento a "{dateOfBirth}". Responda APENAS com "CORRETO" ou "INCORRETO" com o motivo.`,
};

export const INITIAL_DOCUMENT_TYPES = Object.values(InitialDocumentTypes);