import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import RotaProtegida from './auth/RotaProtegida'

// Cada tela vira um pedaço separado do bundle: quem abre a landing (/site) não baixa o CRM inteiro.
const TemaAntd = lazy(() => import('./TemaAntd'))
const AppLayout = lazy(() => import('./layout/AppLayout'))
const Login = lazy(() => import('./pages/Login'))
const Kanban = lazy(() => import('./pages/Kanban'))
const Empresas = lazy(() => import('./pages/Empresas'))
const Contatos = lazy(() => import('./pages/Contatos'))
const Produtos = lazy(() => import('./pages/Produtos'))
const Oportunidades = lazy(() => import('./pages/Oportunidades'))
const OportunidadeDetalhe = lazy(() => import('./pages/OportunidadeDetalhe'))
const Painel = lazy(() => import('./pages/Painel'))
const Tarefas = lazy(() => import('./pages/Tarefas'))
const Usuarios = lazy(() => import('./pages/Usuarios'))
const AreaCliente = lazy(() => import('./pages/AreaCliente'))
const Interessados = lazy(() => import('./pages/Interessados'))
const Site = lazy(() => import('./pages/Site'))

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/site" element={<Site />} />
        <Route element={<TemaAntd />}>
          <Route path="/login" element={<Login />} />
          <Route path="/area-cliente" element={<AreaCliente />} />
          <Route element={<RotaProtegida />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<Kanban />} />
              <Route path="/painel" element={<Painel />} />
              <Route path="/tarefas" element={<Tarefas />} />
              <Route path="/oportunidades" element={<Oportunidades />} />
              <Route path="/oportunidades/:id" element={<OportunidadeDetalhe />} />
              <Route path="/empresas" element={<Empresas />} />
              <Route path="/contatos" element={<Contatos />} />
              <Route path="/produtos" element={<Produtos />} />
              <Route path="/config/usuarios" element={<Usuarios />} />
              <Route path="/interessados" element={<Interessados />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}
