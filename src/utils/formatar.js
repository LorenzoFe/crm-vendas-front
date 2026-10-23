import dayjs from 'dayjs'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarMoeda(valor) {
  return moeda.format(Number(valor ?? 0))
}

export function formatarData(data) {
  return data ? dayjs(data).format('DD/MM/YYYY') : '-'
}

export function somenteNumeros(texto) {
  return texto ? String(texto).replace(/\D/g, '') : texto
}

export function formatarCnpj(cnpj) {
  const n = somenteNumeros(cnpj)
  if (!n || n.length !== 14) return cnpj || '-'
  return n.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
}

export function formatarTelefone(telefone) {
  const n = somenteNumeros(telefone)
  if (!n) return '-'
  if (n.length === 11) return n.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
  if (n.length === 10) return n.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
  return telefone
}

export function vazioParaNulo(objeto) {
  return Object.fromEntries(
    Object.entries(objeto).map(([chave, valor]) => [chave, typeof valor === 'string' && valor.trim() === '' ? null : valor]),
  )
}
