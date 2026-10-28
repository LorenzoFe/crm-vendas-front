import { useCallback, useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { useNavigate, useParams } from 'react-router-dom'
import {
  App, Button, Card, Col, DatePicker, Descriptions, Empty, Form, Input, InputNumber, Modal, Popconfirm, Result, Row,
  Select, Space, Spin, Table, Tag, Timeline, Typography,
} from 'antd'
import { ArrowLeftOutlined, CloseCircleOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons'
import FormOportunidade from '../components/FormOportunidade'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useOpcoesEstagios, useOpcoesProdutos } from '../hooks/useOpcoes'
import { formatarData, formatarMoeda, vazioParaNulo } from '../utils/formatar'
import { PRIORIDADE_TAREFA, STATUS_OPORTUNIDADE, STATUS_PROPOSTA, TIPO_INTERACAO, opcoesDe } from '../utils/rotulos'

export default function OportunidadeDetalhe() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const { temPermissao, usuario } = useAuth()
  const estagios = useOpcoesEstagios()
  const produtos = useOpcoesProdutos()
  const [dados, setDados] = useState(null)
  const [historico, setHistorico] = useState([])
  const [erro, setErro] = useState(null)
  const [modal, setModal] = useState(null)
  const [salvando, setSalvando] = useState(false)
  const [form] = Form.useForm()

  const carregar = useCallback(async () => {
    try {
      const [completa, hist] = await Promise.all([
        api.get(`/oportunidades/${id}/completa`),
        api.get(`/oportunidades/${id}/historico`, { params: { size: 50 } }),
      ])
      setDados(completa.data)
      setHistorico(hist.data.content)
      setErro(null)
    } catch (e) {
      setErro(mensagemDeErro(e))
    }
  }, [id])

  useEffect(() => {
    carregar()
  }, [carregar])

  async function executar(acao, sucesso) {
    try {
      await acao()
      if (sucesso) message.success(sucesso)
      await carregar()
      return true
    } catch (e) {
      message.error(mensagemDeErro(e))
      return false
    }
  }

  function abrirModal(tipo) {
    form.resetFields()
    setModal(tipo)
  }

  async function enviarModal(valores) {
    setSalvando(true)
    const acoes = {
      item: () => api.post(`/oportunidades/${id}/itens`, vazioParaNulo(valores)),
      interacao: () => api.post('/interacoes', { ...valores, oportunidadeId: Number(id) }),
      nota: () => api.post('/notas', { ...valores, oportunidadeId: Number(id) }),
      tarefa: () =>
        api.post('/tarefas', {
          ...valores,
          dataVencimento: valores.dataVencimento ? valores.dataVencimento.format('YYYY-MM-DD') : null,
          responsavelId: usuario.id,
          oportunidadeId: Number(id),
        }),
      perder: () => api.put(`/oportunidades/${id}/perder`, valores),
    }
    const mensagens = { item: 'Item adicionado', interacao: 'Interação registrada', nota: 'Nota adicionada', tarefa: 'Tarefa criada', perder: 'Oportunidade marcada como perdida' }
    const ok = await executar(acoes[modal], mensagens[modal])
    setSalvando(false)
    if (ok) setModal(null)
  }

  if (erro) {
    return <Result status="warning" title="Não foi possível abrir a oportunidade" subTitle={erro} extra={<Button onClick={() => navigate('/oportunidades')}>Voltar</Button>} />
  }
  if (!dados) {
    return <div className="centro"><Spin size="large" /></div>
  }

  const o = dados.oportunidade
  const ativa = o.status === 'ATIVA'
  const podeEditar = ativa && temPermissao('editar_oportunidade')
  const totalItens = dados.itens.reduce((s, i) => s + Number(i.subtotal ?? 0), 0)

  const colunasItens = [
    { title: 'Produto', dataIndex: 'produtoNome' },
    { title: 'Qtd.', dataIndex: 'quantidade', align: 'right', width: 70 },
    { title: 'Preço unit.', dataIndex: 'precoUnitario', align: 'right', render: formatarMoeda },
    { title: 'Subtotal', dataIndex: 'subtotal', align: 'right', render: formatarMoeda },
  ]
  if (podeEditar) {
    colunasItens.push({
      key: 'remover',
      width: 50,
      render: (_, item) => (
        <Popconfirm title="Remover este item?" okText="Remover" cancelText="Cancelar" onConfirm={() => executar(() => api.delete(`/oportunidades/${id}/itens/${item.id}`), 'Item removido')}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    })
  }

  const colunasPropostas = [
    { title: 'Número', dataIndex: 'numero' },
    { title: 'Valor', dataIndex: 'valorTotal', align: 'right', render: formatarMoeda },
    { title: 'Emissão', dataIndex: 'dataEmissao', render: formatarData },
    { title: 'Vencimento', dataIndex: 'dataVencimento', render: formatarData },
    { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={STATUS_PROPOSTA[s]?.cor}>{STATUS_PROPOSTA[s]?.texto ?? s}</Tag> },
    {
      key: 'acoes',
      render: (_, p) =>
        temPermissao('editar_proposta') && ativa && (
          <Space>
            {p.status === 'RASCUNHO' && (
              <Button size="small" onClick={() => executar(() => api.put(`/propostas/${p.id}/enviar`), 'Proposta enviada')}>Enviar</Button>
            )}
            {p.status === 'ENVIADA' && (
              <>
                <Popconfirm title="Confirmar aceite? A oportunidade será marcada como GANHA." okText="Aceitar" cancelText="Cancelar" onConfirm={() => executar(() => api.put(`/propostas/${p.id}/aceitar`), 'Proposta aceita! Oportunidade ganha.')}>
                  <Button size="small" type="primary">Aceitar</Button>
                </Popconfirm>
                <Button size="small" danger onClick={() => executar(() => api.put(`/propostas/${p.id}/rejeitar`), 'Proposta rejeitada')}>Rejeitar</Button>
              </>
            )}
          </Space>
        ),
    },
  ]

  return (
    <>
      <Space style={{ marginBottom: 12 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)}>Voltar</Button>
      </Space>

      <Card style={{ marginBottom: 16 }}>
        <div className="pagina-cabecalho">
          <Space align="center" wrap>
            <Typography.Title level={3} style={{ margin: 0 }}>{o.titulo}</Typography.Title>
            <Tag color={STATUS_OPORTUNIDADE[o.status]?.cor}>{STATUS_OPORTUNIDADE[o.status]?.texto}</Tag>
          </Space>
          {podeEditar && (
            <Space wrap>
              <Button icon={<EditOutlined />} onClick={() => setModal('editar')}>Editar</Button>
              <Button danger icon={<CloseCircleOutlined />} onClick={() => abrirModal('perder')}>Marcar como perdida</Button>
            </Space>
          )}
        </div>
        <Descriptions column={{ xs: 1, sm: 2, lg: 3 }} size="small">
          <Descriptions.Item label="Empresa">{o.empresaNome}</Descriptions.Item>
          <Descriptions.Item label="Contato">{o.contatoNome ?? '-'}</Descriptions.Item>
          <Descriptions.Item label="Vendedor">{o.vendedorNome}</Descriptions.Item>
          <Descriptions.Item label="Estágio">
            {podeEditar ? (
              <Select
                size="small"
                value={o.estagioId}
                style={{ minWidth: 160 }}
                options={estagios.map((e) => ({ value: e.id, label: `${e.nome} (${e.probabilidadeConversao ?? 0}%)` }))}
                onChange={(estagioId) => executar(() => api.put(`/oportunidades/${id}/mudar-estagio`, { estagioId }), 'Estágio atualizado')}
              />
            ) : (
              o.estagioNome
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Valor estimado">{formatarMoeda(o.valorEstimado)}</Descriptions.Item>
          <Descriptions.Item label="Previsão">{formatarData(o.dataFechamentoEsperada)}</Descriptions.Item>
          {o.valorReal != null && <Descriptions.Item label="Valor fechado">{formatarMoeda(o.valorReal)}</Descriptions.Item>}
          {o.dataFechamentoReal && <Descriptions.Item label="Fechada em">{formatarData(o.dataFechamentoReal)}</Descriptions.Item>}
          {o.motivoPerda && <Descriptions.Item label="Motivo da perda">{o.motivoPerda}</Descriptions.Item>}
          {o.descricao && <Descriptions.Item label="Descrição" span="filled">{o.descricao}</Descriptions.Item>}
        </Descriptions>
      </Card>

      <Row gutter={16}>
        <Col xs={24} xl={14}>
          <Card
            title={`Itens · ${formatarMoeda(totalItens)}`}
            style={{ marginBottom: 16 }}
            extra={podeEditar && <Button size="small" icon={<PlusOutlined />} onClick={() => abrirModal('item')}>Adicionar</Button>}
          >
            <Table rowKey="id" size="small" columns={colunasItens} dataSource={dados.itens} pagination={false} locale={{ emptyText: 'Nenhum produto adicionado' }} />
          </Card>

          <Card
            title="Propostas"
            style={{ marginBottom: 16 }}
            extra={
              ativa && temPermissao('criar_proposta') && (
                <Button size="small" type="primary" disabled={dados.itens.length === 0} onClick={() => executar(() => api.post(`/propostas/gerar-de-oportunidade/${id}`), 'Proposta gerada')}>
                  Gerar proposta
                </Button>
              )
            }
          >
            <Table rowKey="id" size="small" columns={colunasPropostas} dataSource={dados.propostas} pagination={false} scroll={{ x: 600 }} locale={{ emptyText: 'Nenhuma proposta. Adicione itens e gere a proposta.' }} />
          </Card>
        </Col>

        <Col xs={24} xl={10}>
          <Card
            title="Histórico"
            extra={
              <Space wrap>
                <Button size="small" onClick={() => abrirModal('interacao')}>Interação</Button>
                <Button size="small" onClick={() => abrirModal('nota')}>Nota</Button>
                <Button size="small" onClick={() => abrirModal('tarefa')}>Tarefa</Button>
              </Space>
            }
          >
            {historico.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nenhum registro ainda" />
            ) : (
              <Timeline
                items={historico.map((h) => ({
                  color: h.origem === 'NOTA' ? 'gray' : 'blue',
                  children: (
                    <>
                      <Typography.Text strong>
                        {h.origem === 'NOTA' ? 'Nota' : TIPO_INTERACAO[h.tipo] ?? h.tipo}
                      </Typography.Text>
                      <Typography.Text type="secondary"> · {dayjs(h.dataEvento).format('DD/MM/YYYY HH:mm')}</Typography.Text>
                      <div>{h.conteudo}</div>
                    </>
                  ),
                }))}
              />
            )}
          </Card>
        </Col>
      </Row>

      <FormOportunidade
        aberto={modal === 'editar'}
        oportunidade={o}
        onFechar={() => setModal(null)}
        onSalvo={() => {
          setModal(null)
          carregar()
        }}
      />

      <Modal
        open={['item', 'interacao', 'nota', 'tarefa', 'perder'].includes(modal)}
        title={{ item: 'Adicionar produto', interacao: 'Registrar interação', nota: 'Adicionar nota', tarefa: 'Nova tarefa', perder: 'Marcar como perdida' }[modal]}
        onCancel={() => setModal(null)}
        onOk={() => form.submit()}
        okText="Salvar"
        cancelText="Cancelar"
        okButtonProps={{ danger: modal === 'perder' }}
        confirmLoading={salvando}
        forceRender
      >
        <Form form={form} layout="vertical" onFinish={enviarModal}>
          {modal === 'item' && (
            <>
              <Form.Item name="produtoId" label="Produto" rules={[{ required: true, message: 'Escolha o produto' }]}>
                <Select
                  showSearch
                  optionFilterProp="label"
                  options={produtos.map((p) => ({ value: p.id, label: `${p.nome} · ${formatarMoeda(p.precoUnitario)}` }))}
                />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="quantidade" label="Quantidade" initialValue={1} rules={[{ required: true, message: 'Informe a quantidade' }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="precoUnitario" label="Preço negociado" tooltip="Deixe vazio para usar o preço do catálogo">
                    <InputNumber min={0} precision={2} prefix="R$" decimalSeparator="," style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          {modal === 'interacao' && (
            <>
              <Form.Item name="tipo" label="Tipo" initialValue="CHAMADA" rules={[{ required: true }]}>
                <Select options={opcoesDe(TIPO_INTERACAO)} />
              </Form.Item>
              <Form.Item name="descricao" label="O que aconteceu" rules={[{ required: true, message: 'Descreva a interação' }]}>
                <Input.TextArea rows={4} />
              </Form.Item>
            </>
          )}
          {modal === 'nota' && (
            <Form.Item name="conteudo" label="Nota" rules={[{ required: true, message: 'Escreva a nota' }]}>
              <Input.TextArea rows={4} />
            </Form.Item>
          )}
          {modal === 'tarefa' && (
            <>
              <Form.Item name="titulo" label="Tarefa" rules={[{ required: true, message: 'Informe a tarefa' }]}>
                <Input maxLength={255} placeholder="Ex.: Retornar ligação do cliente" />
              </Form.Item>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item name="prioridade" label="Prioridade" initialValue="MEDIA" rules={[{ required: true }]}>
                    <Select options={opcoesDe(PRIORIDADE_TAREFA)} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="dataVencimento" label="Vencimento">
                    <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
              </Row>
            </>
          )}
          {modal === 'perder' && (
            <Form.Item name="motivo" label="Motivo da perda" rules={[{ required: true, message: 'Informe o motivo' }]}>
              <Input maxLength={255} placeholder="Ex.: Preço acima do orçamento" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </>
  )
}
