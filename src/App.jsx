import { Navigate, Route, Routes } from 'react-router-dom'
import RotaProtegida from './auth/RotaProtegida'
import AppLayout from './layout/AppLayout'
import Login from './pages/Login'
import Kanban from './pages/Kanban'
import Empresas from './pages/Empresas'
import Contatos from './pages/Contatos'
import Produtos from './pages/Produtos'
import Oportunidades from './pages/Oportunidades'
import OportunidadeDetalhe from './pages/OportunidadeDetalhe'
import Painel from './pages/Painel'
import Tarefas from './pages/Tarefas'
import Usuarios from './pages/Usuarios'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
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
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
