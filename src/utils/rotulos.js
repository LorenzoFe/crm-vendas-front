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

export function opcoesDe(mapa) {
  return Object.entries(mapa).map(([value, v]) => ({ value, label: typeof v === 'string' ? v : v.texto }))
}

export const ROLES = {
  ADMIN: { texto: 'Administrador', cor: 'purple' },
  GERENTE: { texto: 'Gerente', cor: 'blue' },
  VENDEDOR: { texto: 'Vendedor', cor: 'cyan' },
}
