export const STATUS_OPORTUNIDADE = {
  ATIVA: { texto: 'Ativa', cor: 'blue' },
  GANHA: { texto: 'Ganha', cor: 'green' },
  PERDIDA: { texto: 'Perdida', cor: 'red' },
  EM_PAUSA: { texto: 'Em pausa', cor: 'orange' },
}

export const STATUS_PROPOSTA = {
  RASCUNHO: { texto: 'Rascunho', cor: 'default' },
  ENVIADA: { texto: 'Enviada', cor: 'blue' },
  ACEITA: { texto: 'Aceita', cor: 'green' },
  REJEITADA: { texto: 'Rejeitada', cor: 'red' },
}

export const TIPO_INTERACAO = {
  CHAMADA: 'Ligação',
  EMAIL: 'E-mail',
  REUNIAO: 'Reunião',
  CHAT: 'Chat / WhatsApp',
  VISITA: 'Visita',
}

export const STATUS_TAREFA = {
  PENDENTE: { texto: 'Pendente', cor: 'orange' },
  EM_ANDAMENTO: { texto: 'Em andamento', cor: 'blue' },
  CONCLUIDA: { texto: 'Concluída', cor: 'green' },
}

export const PRIORIDADE_TAREFA = {
  ALTA: { texto: 'Alta', cor: 'red' },
  MEDIA: { texto: 'Média', cor: 'gold' },
  BAIXA: { texto: 'Baixa', cor: 'default' },
}

export const STATUS_INTERESSE = {
  NOVO: { texto: 'Novo', cor: 'gold' },
  CONVERTIDO: { texto: 'Convertido', cor: 'green' },
  DESCARTADO: { texto: 'Descartado', cor: 'default' },
}

export const STATUS_DISCADOR = {
  PENDENTE: { texto: 'Aguardando envio', cor: 'default' },
  SEM_TELEFONE: { texto: 'Sem telefone', cor: 'default' },
  NA_FILA: { texto: 'Na fila', cor: 'processing' },
  ATENDIDO: { texto: 'Atendido', cor: 'green' },
  CAIXA_POSTAL: { texto: 'Caixa postal', cor: 'gold' },
  NAO_ATENDIDO: { texto: 'Não atendido', cor: 'orange' },
  ERRO: { texto: 'Erro no envio', cor: 'red' },
  REMOVIDO: { texto: 'Removido da fila', cor: 'default' },
}

export const DISCADOR_PODE_REENVIAR = ['PENDENTE', 'ERRO', 'NAO_ATENDIDO', 'CAIXA_POSTAL']

export const PREFERENCIA_CONTATO = {
  EMAIL: 'E-mail',
  TELEFONE: 'Telefone',
  WHATSAPP: 'WhatsApp',
}

export const TAMANHOS_EMPRESA = ['Startup', 'PME', 'Grande', 'Corporação']

export function opcoesDe(mapa) {
  return Object.entries(mapa).map(([value, v]) => ({ value, label: typeof v === 'string' ? v : v.texto }))
}

export const ROLES = {
  ADMIN: { texto: 'Administrador', cor: 'purple' },
  GERENTE: { texto: 'Gerente', cor: 'blue' },
  VENDEDOR: { texto: 'Vendedor', cor: 'cyan' },
}
