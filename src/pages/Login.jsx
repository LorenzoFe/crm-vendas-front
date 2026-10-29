import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Alert, Button, Card, Form, Input, Typography } from 'antd'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import { useAuth } from '../auth/AuthContext'
import { mensagemDeErro } from '../api/client'

export default function Login() {
  const { autenticado, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState(null)

  if (autenticado) {
    return <Navigate to="/" replace />
  }

  async function entrar({ email, senha }) {
    setCarregando(true)
    setErro(null)
    try {
      await login(email, senha)
      navigate(location.state?.de ?? '/', { replace: true })
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setCarregando(false)
    }
  }

  return (
    <div className="login-fundo">
      <Card className="login-card">
        <img src="/logo-cortex.webp" alt="" className="login-logo" />
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
          Córtex
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ textAlign: 'center' }}>
          Entre com seu e-mail e senha
        </Typography.Paragraph>

        {erro && <Alert type="error" message={erro} showIcon style={{ marginBottom: 16 }} />}

        <Form layout="vertical" onFinish={entrar} requiredMark={false}>
          <Form.Item
            name="email"
            label="E-mail"
            rules={[
              { required: true, message: 'Informe o e-mail' },
              { type: 'email', message: 'E-mail inválido' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="voce@empresa.com" autoFocus />
          </Form.Item>
          <Form.Item name="senha" label="Senha" rules={[{ required: true, message: 'Informe a senha' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Sua senha" />
          </Form.Item>
          <Button type="primary" htmlType="submit" block loading={carregando}>
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  )
}
