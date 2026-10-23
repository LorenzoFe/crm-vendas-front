import { useState } from 'react'
import { App, Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tag } from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { formatarTelefone, somenteNumeros, vazioParaNulo } from '../utils/formatar'
import { useOpcoesEmpresas, useOpcoesUsuarios } from '../hooks/useOpcoes'

export default function Contatos() {
  const { message } = App.useApp()
  const { temPermissao, usuario } = useAuth()
  const [filtros, setFiltros] = useState({ nome: '', empresaId: null, ativo: true })
  const { itens, carregando, paginacao, recarregar } = useListaPaginada('/contatos', filtros, 'nome,asc')
  const empresas = useOpcoesEmpresas()
  const { opcoes: usuarios, podeEscolher } = useOpcoesUsuarios()
  const [modal, setModal] = useState({ aberto: false, contato: null })
  const [salvando, setSalvando] = useState(false)
  const [form] = Form.useForm()

  function abrir(contato) {
    form.resetFields()
    form.setFieldsValue(contato ?? { usuarioResponsavelId: usuario?.id, empresaId: filtros.empresaId ?? undefined })
    setModal({ aberto: true, contato })
  }

  async function salvar(valores) {
    setSalvando(true)
    try {
      const corpo = vazioParaNulo({ ...valores, telefone: somenteNumeros(valores.telefone) })
      if (modal.contato) {
        await api.put(`/contatos/${modal.contato.id}`, corpo)
        message.success('Contato atualizado')
      } else {
        await api.post('/contatos', corpo)
        message.success('Contato cadastrado')
      }
      setModal({ aberto: false, contato: null })
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(contato) {
    try {
      await api.delete(`/contatos/${contato.id}`)
      message.success('Contato desativado')
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    }
  }

  const colunas = [
    { title: 'Nome', dataIndex: 'nome' },
    { title: 'Empresa', dataIndex: 'empresaNome' },
    { title: 'Cargo', dataIndex: 'cargo', render: (v) => v || '-' },
    { title: 'Telefone', dataIndex: 'telefone', render: formatarTelefone },
    { title: 'E-mail', dataIndex: 'email', render: (v) => v || '-' },
    { title: 'Situação', dataIndex: 'ativo', render: (a) => (a ? <Tag color="green">Ativo</Tag> : <Tag>Inativo</Tag>) },
    {
      title: 'Ações',
      key: 'acoes',
      width: 110,
      render: (_, contato) => (
        <Space>
          {temPermissao('editar_empresa') && <Button size="small" icon={<EditOutlined />} onClick={() => abrir(contato)} />}
          {temPermissao('deletar_empresa') && contato.ativo && (
            <Popconfirm title="Desativar este contato?" okText="Desativar" cancelText="Cancelar" onConfirm={() => desativar(contato)}>
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
        titulo="Contatos"
        acoes={
          temPermissao('criar_empresa') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => abrir(null)}>
              Novo contato
            </Button>
          )
        }
      />
      <Space className="filtros" wrap>
        <Input.Search placeholder="Buscar por nome" allowClear onSearch={(nome) => setFiltros((f) => ({ ...f, nome }))} style={{ width: 260 }} />
        <Select
          placeholder="Filtrar por empresa"
          options={empresas}
          allowClear
          showSearch
          optionFilterProp="label"
          style={{ width: 260 }}
          onChange={(empresaId) => setFiltros((f) => ({ ...f, empresaId: empresaId ?? null }))}
        />
        <Space>
          <Switch checked={!filtros.ativo} onChange={(v) => setFiltros((f) => ({ ...f, ativo: !v }))} />
          Mostrar inativos
        </Space>
      </Space>
      <Table rowKey="id" columns={colunas} dataSource={itens} loading={carregando} pagination={paginacao} scroll={{ x: 900 }} />

      <Modal
        title={modal.contato ? 'Editar contato' : 'Novo contato'}
        open={modal.aberto}
        onCancel={() => setModal({ aberto: false, contato: null })}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={salvando}
        width={600}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={salvar}>
          <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input maxLength={255} />
          </Form.Item>
          <Form.Item name="empresaId" label="Empresa" rules={[{ required: true, message: 'Escolha a empresa' }]}>
            <Select options={empresas} showSearch optionFilterProp="label" placeholder="Selecione" />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="telefone"
                label="Telefone"
                rules={[{ validator: (_, v) => (!v || [10, 11].includes(somenteNumeros(v).length) ? Promise.resolve() : Promise.reject(new Error('Telefone com DDD: 10 ou 11 dígitos'))) }]}
              >
                <Input placeholder="(11) 99999-9999" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="E-mail" rules={[{ type: 'email', message: 'E-mail inválido' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="cargo" label="Cargo">
            <Input maxLength={100} />
          </Form.Item>
          <Form.Item name="usuarioResponsavelId" label="Vendedor responsável" hidden={!podeEscolher}>
            <Select options={usuarios} allowClear showSearch optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
