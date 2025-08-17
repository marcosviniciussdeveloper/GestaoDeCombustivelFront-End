// src/utils/formatDate.ts

import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale'; // Importa a localização para português do Brasil

/**
 * Formata uma data ISO para uma string de tempo relativo.
 * Ex: "há 5 minutos", "cerca de 2 horas atrás", "ontem".
 * @param dateString A data em formato de string (ex: "2024-08-17T10:00:00Z")
 * @returns Uma string formatada.
 */
export function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    return formatDistanceToNow(date, {
      addSuffix: true, // Adiciona o sufixo "atrás"
      locale: ptBR,    // Usa o idioma português
    });
  } catch (error) {
    console.error("Erro ao formatar data:", error);
    return "data inválida"; // Retorna um fallback em caso de erro
  }
}
