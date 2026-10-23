import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { api, lerSessao, limparSessao, salvarSessao } from '../api/client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(() => lerSessao())

  const login = useCallback(async (email, senha) => {
    const { data } = await api.post('/auth/login', { email, senha })
    salvarSessao(data.token, data.usuario)
    setSessao({ token: data.token, usuario: data.usuario })
    return data.usuario
  }, [])

  const logout = useCallback(() => {
    limparSessao()
    setSessao(null)
  }, [])

  const valor = useMemo(() => {
    const usuario = sessao?.usuario ?? null
    return {
      usuario,
      autenticado: Boolean(sessao),
      login,
      logout,
      temPermissao: (permissao) => Boolean(usuario?.permissoes?.includes(permissao)),
      temRole: (...roles) => roles.some((role) => usuario?.roles?.includes(role)),
    }
  }, [sessao, login, logout])

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
