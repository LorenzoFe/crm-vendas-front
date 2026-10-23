import axios from 'axios'

const CHAVE_TOKEN = 'crm.token'
const CHAVE_USUARIO = 'crm.usuario'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 120000,
})

export function salvarSessao(token, usuario) {
  localStorage.setItem(CHAVE_TOKEN, token)
  localStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario))
}

export function lerSessao() {
  const token = localStorage.getItem(CHAVE_TOKEN)
  const usuario = localStorage.getItem(CHAVE_USUARIO)
  return token && usuario ? { token, usuario: JSON.parse(usuario) } : null
}

export function limparSessao() {
  localStorage.removeItem(CHAVE_TOKEN)
  localStorage.removeItem(CHAVE_USUARIO)
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(CHAVE_TOKEN)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (resposta) => resposta,
  (erro) => {
    const naTelaDeLogin = window.location.pathname === '/login'
    if (erro.response?.status === 401 && !naTelaDeLogin) {
      limparSessao()
      window.location.assign('/login')
    }
    return Promise.reject(erro)
  },
)

export function mensagemDeErro(erro) {
  const dados = erro.response?.data
  if (dados?.campos) {
    return Object.values(dados.campos).join(' | ')
  }
  if (dados?.detail) {
    return dados.detail
  }
  if (erro.code === 'ECONNABORTED') {
    return 'O servidor demorou para responder. Tente novamente em instantes.'
  }
  if (!erro.response) {
    return 'Não foi possível conectar ao servidor.'
  }
  return 'Erro inesperado. Tente novamente.'
}
