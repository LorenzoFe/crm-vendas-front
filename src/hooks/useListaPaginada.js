import { useCallback, useEffect, useState } from 'react'
import { App } from 'antd'
import { api, mensagemDeErro } from '../api/client'

export function useListaPaginada(url, filtros, ordenacao) {
  const { message } = App.useApp()
  const [itens, setItens] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [pagina, setPagina] = useState(1)
  const [tamanho, setTamanho] = useState(10)
  const [total, setTotal] = useState(0)

  const filtrosChave = JSON.stringify(filtros)

  const carregar = useCallback(async () => {
    setCarregando(true)
    try {
      const params = { page: pagina - 1, size: tamanho, sort: ordenacao }
      Object.entries(JSON.parse(filtrosChave)).forEach(([chave, valor]) => {
        if (valor !== undefined && valor !== null && valor !== '') params[chave] = valor
      })
      const { data } = await api.get(url, { params })
      setItens(data.content)
      setTotal(data.page.totalElements)
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setCarregando(false)
    }
  }, [url, filtrosChave, pagina, tamanho, ordenacao, message])

  useEffect(() => {
    carregar()
  }, [carregar])

  useEffect(() => {
    setPagina(1)
  }, [filtrosChave])

  const paginacao = {
    current: pagina,
    pageSize: tamanho,
    total,
    showSizeChanger: true,
    showTotal: (t) => `${t} registro(s)`,
    onChange: (p, s) => {
      setPagina(p)
      setTamanho(s)
    },
  }

  return { itens, carregando, paginacao, recarregar: carregar }
}
