import { useState } from 'react'
import { App, Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { formatarData, vazioParaNulo } from '../utils/formatar'
import { ROLES, opcoesDe } from '../utils/rotulos'

export default function Usuarios() {
  const { message } = App.useApp()
  const { usuario: logado } = useAuth()
  const { itens, carregando, paginacao, recarregar } = useListaPaginada('/usuarios', {}, 'nome,asc')
  const [modal, setModal] = useState({ aberto: false, usuario: null })
  const [salvando, setSalvando] = useState(false)
  const [form] = Form.useForm()

  function abrir(usuario) {
    form.resetFields()
    if (usuario) form.setFieldsValue(usuario)
    else form.setFieldsValue({ roles: ['VENDEDOR'] })
    setModal({ aberto: true, usuario })
  }

  async function salvar(valores) {
    setSalvando(true)
    try {
      const { roles, ...dados } = vazioParaNulo(valores)
      const editando = modal.usuario
      if (editando) {
        await api.put(`/usuarios/${editando.id}`, dados)
        const mudouRoles = [...roles].sort().join() !== [...editando.roles].sort().join()
        if (mudouRoles) await api.put(`/usuarios/${editando.id}/roles`, { roles })
        message.success('Usuário atualizado')
      } else {
        await api.post('/usuarios', { ...dados, roles })
        message.success('Usuário cadastrado')
      }
      setModal({ aberto: false, usuario: null })
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(usuario) {
    try {
      await api.delete(`/usuarios/${usuario.id}`)
      message.success('Usuário desativado')
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    }
  }

  const colunas = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'E-mail', dataIndex: 'email' },
    { title: 'Departamento', dataIndex: 'departamento', render: (v) => v || '-' },
    {
      title: 'Perfis',
      dataIndex: 'roles',
      render: (roles) => roles.map((r) => <Tag key={r} color={ROLES[r]?.cor}>{ROLES[r]?.texto ?? r}</Tag>),
    },
    { title: 'Desde', dataIndex: 'dataCriacao', render: formatarData },
    {
      title: 'Situação',
      dataIndex: 'ativo',
      render: (ativo) => (ativo ? <Tag color="green">Ativo</Tag> : <Tag>Inativo</Tag>),
    },
    {
      title: 'Ações',
      key: 'acoes',
      width: 110,
      render: (_, usuario) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => abrir(usuario)} />
          {usuario.ativo && usuario.id !== logado?.id && (
            <Popconfirm title="Desativar este usuário?" okText="Desativar" cancelText="Cancelar" onConfirm={() => desativar(usuario)}>
              <Button size="small" danger icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Cabecalho
        titulo="Usuários"
        acoes={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => abrir(null)}>
            Novo usuário
          </Button>
        }
      />
      <Table rowKey="id" columns={colunas} dataSource={itens} loading={carregando} pagination={paginacao} scroll={{ x: 800 }} />

      <Modal
        title={modal.usuario ? 'Editar usuário' : 'Novo usuário'}
        open={modal.aberto}
        onCancel={() => setModal({ aberto: false, usuario: null })}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={salvando}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={salvar}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="email" label="E-mail" rules={[{ required: true, type: 'email', message: 'Informe um e-mail válido' }]}>
            <Input maxLength={255} />
          </Form.Item>
          {!modal.usuario && (
            <Form.Item name="senha" label="Senha" rules={[{ required: true, min: 6, message: 'A senha deve ter pelo menos 6 caracteres' }]}>
              <Input.Password maxLength={100} autoComplete="new-password" />
            </Form.Item>
          )}
          <Form.Item name="departamento" label="Departamento">
            <Input maxLength={100} placeholder="Ex.: Comercial" />
          </Form.Item>
          <Form.Item name="roles" label="Perfis" rules={[{ required: true, message: 'Escolha pelo menos um perfil' }]}>
            <Select mode="multiple" options={opcoesDe(ROLES)} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
