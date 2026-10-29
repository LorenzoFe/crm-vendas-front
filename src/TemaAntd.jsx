import { Outlet } from 'react-router-dom'
import { App as AntApp, ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

// Tema e idioma do Ant Design. Fica fora do main.jsx para a landing (/site) não carregar o antd:
// as telas do CRM usam como rota de layout (Outlet) e o pop-up dos planos usa com children.

dayjs.locale('pt-br')

export default function TemaAntd({ children }) {
  return (
    <ConfigProvider locale={ptBR} theme={{ token: { colorPrimary: '#1677ff', borderRadius: 8 } }}>
      <AntApp>{children ?? <Outlet />}</AntApp>
    </ConfigProvider>
  )
}
