import { useState } from 'react'
import { App, Button, Col, Form, Input, Modal, Popconfirm, Row, Select, Space, Switch, Table, Tag } from 'antd'
import { EditOutlined, PlusOutlined, StopOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { useOpcoesUsuarios } from '../hooks/useOpcoes'
import { formatarCnpj, formatarTelefone, somenteNumeros, vazioParaNulo } from '../utils/formatar'

const TAMANHOS = ['Startup', 'PME', 'Grande', 'Corporação'].map((t) => ({ value: t, label: t }))

export default function Empresas() {
  const { message } = App.useApp()
  const { temPermissao, usuario } = useAuth()
  const [filtros, setFiltros] = useState({ nome: '', segmento: '', ativo: true })
  const { itens, carregando, paginacao, recarregar } = useListaPaginada('/empresas', filtros, 'nomeRazaoSocial,asc')
  const { opcoes: usuarios, podeEscolher } = useOpcoesUsuarios()
  const [modal, setModal] = useState({ aberto: false, empresa: null })
  const [salvando, setSalvando] = useState(false)
  const [form] = Form.useForm()

  function abrir(empresa) {
    form.resetFields()
    form.setFieldsValue(empresa ?? { usuarioResponsavelId: usuario?.id })
    setModal({ aberto: true, empresa })
  }

  async function salvar(valores) {
    setSalvando(true)
    try {
      const corpo = vazioParaNulo({
        ...valores,
        cnpj: somenteNumeros(valores.cnpj),
        telefone: somenteNumeros(valores.telefone),
      })
      if (modal.empresa) {
        await api.put(`/empresas/${modal.empresa.id}`, corpo)
        message.success('Empresa atualizada')
      } else {
        await api.post('/empresas', corpo)
        message.success('Empresa cadastrada')
      }
      setModal({ aberto: false, empresa: null })
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  async function desativar(empresa) {
    try {
      await api.delete(`/empresas/${empresa.id}`)
      message.success('Empresa desativada')
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    }
  }

  const colunas = [
    { title: 'Nome / razão social', dataIndex: 'nomeRazaoSocial' },
    { title: 'CNPJ', dataIndex: 'cnpj', render: formatarCnpj },
    { title: 'Segmento', dataIndex: 'segmento', render: (v) => v || '-' },
    { title: 'Telefone', dataIndex: 'telefone', render: formatarTelefone },
    { title: 'Responsável', dataIndex: 'usuarioResponsavelNome', render: (v) => v || '-' },
    { title: 'Situação', dataIndex: 'ativo', render: (a) => (a ? <Tag color="green">Ativa</Tag> : <Tag>Inativa</Tag>) },
    {
      title: 'Ações',
      key: 'acoes',
      width: 110,
      render: (_, empresa) => (
        <Space>
          {temPermissao('editar_empresa') && <Button size="small" icon={<EditOutlined />} onClick={() => abrir(empresa)} />}
          {temPermissao('deletar_empresa') && empresa.ativo && (
            <Popconfirm title="Desativar esta empresa?" okText="Desativar" cancelText="Cancelar" onConfirm={() => desativar(empresa)}>
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
        titulo="Empresas"
        acoes={
          temPermissao('criar_empresa') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => abrir(null)}>
              Nova empresa
            </Button>
          )
        }
      />
      <Space className="filtros" wrap>
        <Input.Search placeholder="Buscar por nome" allowClear onSearch={(nome) => setFiltros((f) => ({ ...f, nome }))} style={{ width: 260 }} />
        <Input.Search placeholder="Segmento" allowClear onSearch={(segmento) => setFiltros((f) => ({ ...f, segmento }))} style={{ width: 200 }} />
        <Space>
          <Switch checked={!filtros.ativo} onChange={(v) => setFiltros((f) => ({ ...f, ativo: !v }))} />
          Mostrar inativas
        </Space>
      </Space>
      <Table rowKey="id" columns={colunas} dataSource={itens} loading={carregando} pagination={paginacao} scroll={{ x: 900 }} />

      <Modal
        title={modal.empresa ? 'Editar empresa' : 'Nova empresa'}
        open={modal.aberto}
        onCancel={() => setModal({ aberto: false, empresa: null })}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        confirmLoading={salvando}
        width={640}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={salvar}>
          <Form.Item name="nomeRazaoSocial" label="Nome / razão social" rules={[{ required: true, message: 'Informe o nome' }]}>
            <Input maxLength={255} />
          </Form.Item>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="cnpj"
                label="CNPJ"
                rules={[{ validator: (_, v) => (!v || somenteNumeros(v).length === 14 ? Promise.resolve() : Promise.reject(new Error('CNPJ deve ter 14 dígitos'))) }]}
              >
                <Input placeholder="00.000.000/0000-00" />
              </Form.Item>
            </Col>
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
              <Form.Item name="segmento" label="Segmento">
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="tamanhoEmpresa" label="Tamanho">
                <Select options={TAMANHOS} allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="E-mail" rules={[{ type: 'email', message: 'E-mail inválido' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item name="site" label="Site">
                <Input />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item name="usuarioResponsavelId" label="Vendedor responsável" hidden={!podeEscolher}>
            <Select options={usuarios} allowClear showSearch optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
