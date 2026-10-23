import { useState } from 'react'
import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Space, Switch, Table, Tag } from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { formatarMoeda, vazioParaNulo } from '../utils/formatar'

export default function Produtos() {
  const { message } = App.useApp()
  const { temRole } = useAuth()
  const podeEditar = temRole('ADMIN', 'GERENTE')
  const [nome, setNome] = useState('')
  const [mostrarInativos, setMostrarInativos] = useState(false)
  const { itens, carregando, paginacao, recarregar } = useListaPaginada(
    '/produtos',
    { nome, ativo: !mostrarInativos },
    'nome,asc',
  )
  const [modal, setModal] = useState({ aberto: false, produto: null })
  const [salvando, setSalvando] = useState(false)
  const [form] = Form.useForm()

  function abrir(produto) {
    form.resetFields()
    if (produto) form.setFieldsValue(produto)
    setModal({ aberto: true, produto })
  }

  async function salvar(valores) {
    setSalvando(true)
    try {
      const corpo = vazioParaNulo(valores)
      if (modal.produto) {
        await api.put(`/produtos/${modal.produto.id}`, corpo)
        message.success('Produto atualizado')
      } else {
        await api.post('/produtos', corpo)
        message.success('Produto cadastrado')
      }
      setModal({ aberto: false, produto: null })
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(produto) {
    try {
      await api.delete(`/produtos/${produto.id}`)
      message.success('Produto desativado')
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    }
  }

  const colunas = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Categoria', dataIndex: 'categoria', render: (v) => v || '-' },
    { title: 'Preço', dataIndex: 'precoUnitario', align: 'right', render: formatarMoeda },
    {
      title: 'Situação',
      dataIndex: 'ativo',
      render: (ativo) => (ativo ? <Tag color="green">Ativo</Tag> : <Tag>Inativo</Tag>),
    },
  ]
  if (podeEditar) {
    colunas.push({
      title: 'Ações',
      key: 'acoes',
      width: 110,
      render: (_, produto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />} onClick={() => abrir(produto)} />
          {produto.ativo && (
            <Popconfirm title="Desativar este produto?" okText="Desativar" cancelText="Cancelar" onConfirm={() => desativar(produto)}>
              <Button size="small" danger icon={<StopOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    })
  }

  return (
    <>
      <Cabecalho
        titulo="Produtos"
        acoes={
          podeEditar && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => abrir(null)}>
              Novo produto
            </Button>
          )
        }
      />
      <Space className="filtros" wrap>
        <Input.Search placeholder="Buscar por nome" allowClear onSearch={setNome} style={{ width: 260 }} />
        <Space>
          <Switch checked={mostrarInativos} onChange={setMostrarInativos} />
          Mostrar inativos
        </Space>
      </Space>
      <Table rowKey="id" columns={colunas} dataSource={itens} loading={carregando} pagination={paginacao} />

      <Modal
        title={modal.produto ? 'Editar produto' : 'Novo produto'}
        open={modal.aberto}
        onCancel={() => setModal({ aberto: false, produto: null })}
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
          <Form.Item name="descricao" label="Descrição">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="precoUnitario" label="Preço unitário" rules={[{ required: true, message: 'Informe o preço' }]}>
            <InputNumber min={0} precision={2} prefix="R$" decimalSeparator="," style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="categoria" label="Categoria">
            <Input maxLength={100} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
