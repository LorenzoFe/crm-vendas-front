import dayjs from 'dayjs'

const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export function formatarMoeda(valor) {
  return moeda.format(Number(valor ?? 0))
}

export function formatarData(data) {
  return data ? dayjs(data).format('DD/MM/YYYY') : '-'
}
