import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { useAuth } from '../auth/AuthContext'

export function useOpcoesUsuarios() {
  const { temPermissao, usuario } = useAuth()
  const podeListar = temPermissao('gerenciar_usuarios')
  const [opcoes, setOpcoes] = useState([])

  useEffect(() => {
    if (!podeListar) {
      setOpcoes(usuario ? [{ value: usuario.id, label: usuario.nome }] : [])
      return
    }
    api
      .get('/usuarios', { params: { size: 100, sort: 'nome,asc' } })
      .then(({ data }) => setOpcoes(data.content.filter((u) => u.ativo).map((u) => ({ value: u.id, label: u.nome }))))
      .catch(() => setOpcoes([]))
  }, [podeListar, usuario])

  return { opcoes, podeEscolher: podeListar }
}

export function useOpcoesEmpresas() {
  const [opcoes, setOpcoes] = useState([])
  useEffect(() => {
    api
      .get('/empresas', { params: { size: 200, sort: 'nomeRazaoSocial,asc', ativo: true } })
      .then(({ data }) => setOpcoes(data.content.map((e) => ({ value: e.id, label: e.nomeRazaoSocial }))))
      .catch(() => setOpcoes([]))
  }, [])
  return opcoes
}
