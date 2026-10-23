import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Avatar, Button, Layout, Menu, Space, Tag, Typography } from 'antd'
import { AppstoreOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext'

const { Header, Sider, Content } = Layout

export default function AppLayout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const itens = [{ key: '/', icon: <AppstoreOutlined />, label: 'Funil de vendas' }]

  function sair() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider breakpoint="lg" collapsedWidth={0} theme="dark">
        <div className="logo">CRM Vendas</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={itens}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header className="cabecalho">
          <Space>
            <Avatar icon={<UserOutlined />} />
            <Typography.Text strong>{usuario?.nome}</Typography.Text>
            {usuario?.roles?.map((role) => (
              <Tag key={role} color="blue">
                {role}
              </Tag>
            ))}
            <Button icon={<LogoutOutlined />} onClick={sair}>
              Sair
            </Button>
          </Space>
        </Header>
        <Content className="conteudo">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
