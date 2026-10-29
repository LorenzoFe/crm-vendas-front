import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { App, Button, Descriptions, Drawer, Popconfirm, Segmented, Space, Table, Tag, Tooltip, Typography } from 'antd'
import { CheckCircleOutlined, CloseCircleOutlined, EyeOutlined, LinkOutlined, PhoneOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { formatarCnpj, formatarTelefone } from '../utils/formatar'
import { DISCADOR_PODE_REENVIAR, PREFERENCIA_CONTATO, STATUS_DISCADOR, STATUS_INTERESSE } from '../utils/rotulos'

function formatarDataHora(data) {
  return data ? dayjs(data).format('DD/MM/YYYY HH:mm') : '-'
}

function TagDiscador({ interesse }) {
  const status = STATUS_DISCADOR[interesse.discadorStatus]
  if (!status) {
    return (
      <Tooltip title="Recebido antes da integração com o discador">
        <Typography.Text type="secondary">-</Typography.Text>
      </Tooltip>
    )
  }
  const tag = <Tag color={status.cor}>{status.texto}</Tag>
  return interesse.discadorErro ? <Tooltip title={interesse.discadorErro}>{tag}</Tooltip> : tag
}

export default function Interessados() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const { temPermissao } = useAuth()
  const podeConverter = temPermissao('criar_oportunidade') && temPermissao('criar_empresa')
  const podeDescartar = temPermissao('editar_oportunidade')
  const [status, setStatus] = useState('NOVO')
  const { itens, carregando, paginacao, recarregar } = useListaPaginada(
    '/interesses',
    { status: status === 'TODOS' ? null : status },
    'id,desc',
  )
  const [detalhe, setDetalhe] = useState(null)
  const [processando, setProcessando] = useState(null)

  async function converter(interesse) {
    setProcessando(interesse.id)
    try {
      const { data } = await api.put(`/interesses/${interesse.id}/converter`)
      message.success('Interesse convertido em oportunidade')
      setDetalhe(null)
      navigate(`/oportunidades/${data.oportunidadeId}`)
    } catch (e) {
      message.error(mensagemDeErro(e))
      recarregar()
    } finally {
      setProcessando(null)
    }
  }

  async function descartar(interesse) {
    setProcessando(interesse.id)
    try {
      await api.put(`/interesses/${interesse.id}/descartar`)
      message.success('Interesse descartado')
      setDetalhe(null)
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setProcessando(null)
    }
  }

  async function reenviarDiscador(interesse) {
    setProcessando(interesse.id)
    try {
      const { data } = await api.put(`/interesses/${interesse.id}/reenviar-discador`)
      if (data.discadorStatus === 'NA_FILA') {
        message.success('Enviado para a fila do discador')
      } else {
        message.warning(`O discador recusou o envio: ${data.discadorErro || 'tente novamente mais tarde'}`)
      }
      setDetalhe(data)
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setProcessando(null)
    }
  }

  function podeReenviar(interesse) {
    return (
      podeDescartar &&
      interesse.status !== 'DESCARTADO' &&
      Boolean(interesse.telefone) &&
      DISCADOR_PODE_REENVIAR.includes(interesse.discadorStatus)
    )
  }

  function acoes(interesse, comTexto = false) {
    if (interesse.status !== 'NOVO') {
      return (
        interesse.oportunidadeId && (
          <Button size="small" icon={<LinkOutlined />} onClick={() => navigate(`/oportunidades/${interesse.oportunidadeId}`)}>
            {comTexto && 'Abrir oportunidade'}
          </Button>
        )
      )
    }
    return (
      <Space>
        {podeConverter && (
          <Popconfirm
            title="Converter em oportunidade?"
            description="Cria (ou reaproveita) empresa e contato e abre a oportunidade no primeiro estágio, com você como vendedor."
            okText="Converter"
            cancelText="Cancelar"
            onConfirm={() => converter(interesse)}
          >
            <Tooltip title={comTexto ? null : 'Converter'}>
              <Button size="small" type="primary" icon={<CheckCircleOutlined />} loading={processando === interesse.id}>
                {comTexto && 'Converter'}
              </Button>
            </Tooltip>
          </Popconfirm>
        )}
        {podeDescartar && (
          <Popconfirm title="Descartar este interesse?" okText="Descartar" cancelText="Cancelar" onConfirm={() => descartar(interesse)}>
            <Tooltip title={comTexto ? null : 'Descartar'}>
              <Button size="small" danger icon={<CloseCircleOutlined />} disabled={processando === interesse.id}>
                {comTexto && 'Descartar'}
              </Button>
            </Tooltip>
          </Popconfirm>
        )}
      </Space>
    )
  }

  const colunas = [
    { title: 'Recebido em', dataIndex: 'dataCriacao', width: 150, render: formatarDataHora },
    { title: 'Empresa', dataIndex: 'empresaNome' },
    {
      title: 'Contato',
      dataIndex: 'nome',
      render: (nome, i) => (
        <>
          {nome}
          <Typography.Text type="secondary" className="cartao-linha">
            {i.email}
          </Typography.Text>
        </>
      ),
    },
    {
      title: 'Produtos',
      dataIndex: 'produtos',
      render: (produtos) => produtos.map((p) => <Tag key={p.id}>{p.nome}</Tag>),
    },
    { title: 'Status', dataIndex: 'status', width: 120, render: (s) => <Tag color={STATUS_INTERESSE[s]?.cor}>{STATUS_INTERESSE[s]?.texto}</Tag> },
    { title: 'Discador', dataIndex: 'discadorStatus', width: 150, render: (_, i) => <TagDiscador interesse={i} /> },
    {
      key: 'acoes',
      width: 130,
      render: (_, i) => (
        <Space>
          <Tooltip title="Ver detalhes">
            <Button size="small" icon={<EyeOutlined />} onClick={() => setDetalhe(i)} />
          </Tooltip>
          {acoes(i)}
        </Space>
      ),
    },
  ]

  return (
    <>
      <Cabecalho
        titulo="Interessados"
        acoes={
          <Segmented
            value={status}
            onChange={setStatus}
            options={[
              { label: 'Novos', value: 'NOVO' },
              { label: 'Convertidos', value: 'CONVERTIDO' },
              { label: 'Descartados', value: 'DESCARTADO' },
              { label: 'Todos', value: 'TODOS' },
            ]}
          />
        }
      />
      <Typography.Paragraph type="secondary">
        Pedidos enviados pela <a href="/area-cliente" target="_blank" rel="noreferrer">Área do Cliente</a>. Converta os interessados
        qualificados em oportunidades ou descarte os que não fazem sentido.
      </Typography.Paragraph>
      <Table rowKey="id" columns={colunas} dataSource={itens} loading={carregando} pagination={paginacao} scroll={{ x: 1050 }} />

      <Drawer title={detalhe?.empresaNome} open={Boolean(detalhe)} onClose={() => setDetalhe(null)} width={520} extra={detalhe && acoes(detalhe, true)}>
        {detalhe && (
          <Descriptions column={1} size="small" bordered>
            <Descriptions.Item label="Status">
              <Tag color={STATUS_INTERESSE[detalhe.status]?.cor}>{STATUS_INTERESSE[detalhe.status]?.texto}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Recebido em">{formatarDataHora(detalhe.dataCriacao)}</Descriptions.Item>
            <Descriptions.Item label="Nome">{detalhe.nome}</Descriptions.Item>
            <Descriptions.Item label="E-mail">{detalhe.email}</Descriptions.Item>
            <Descriptions.Item label="Telefone">{formatarTelefone(detalhe.telefone)}</Descriptions.Item>
            <Descriptions.Item label="Cargo">{detalhe.cargo || '-'}</Descriptions.Item>
            <Descriptions.Item label="Prefere contato por">{PREFERENCIA_CONTATO[detalhe.preferenciaContato] || '-'}</Descriptions.Item>
            <Descriptions.Item label="Empresa">{detalhe.empresaNome}</Descriptions.Item>
            <Descriptions.Item label="CNPJ">{formatarCnpj(detalhe.cnpj)}</Descriptions.Item>
            <Descriptions.Item label="Segmento">{detalhe.segmento || '-'}</Descriptions.Item>
            <Descriptions.Item label="Tamanho">{detalhe.tamanhoEmpresa || '-'}</Descriptions.Item>
            <Descriptions.Item label="Site">{detalhe.site || '-'}</Descriptions.Item>
            <Descriptions.Item label="Produtos">
              {detalhe.produtos.map((p) => (
                <Tag key={p.id}>{p.nome}</Tag>
              ))}
            </Descriptions.Item>
            <Descriptions.Item label="Mensagem">
              <span style={{ whiteSpace: 'pre-wrap' }}>{detalhe.mensagem || '-'}</span>
            </Descriptions.Item>
            <Descriptions.Item label="Consentimento LGPD">{formatarDataHora(detalhe.dataConsentimento)}</Descriptions.Item>
            {detalhe.status !== 'NOVO' && (
              <Descriptions.Item label="Tratado por">
                {detalhe.usuarioTratamentoNome || '-'} em {formatarDataHora(detalhe.dataTratamento)}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}

        {detalhe && (
          <Descriptions
            title="Discador"
            column={1}
            size="small"
            bordered
            style={{ marginTop: 24 }}
            extra={
              podeReenviar(detalhe) && (
                <Popconfirm
                  title="Enviar de novo para o discador?"
                  description={`A equipe vai receber de novo a ligação para ${formatarTelefone(detalhe.telefone)}.`}
                  okText="Enviar"
                  cancelText="Cancelar"
                  onConfirm={() => reenviarDiscador(detalhe)}
                >
                  <Button size="small" icon={<PhoneOutlined />} loading={processando === detalhe.id}>
                    Reenviar à fila
                  </Button>
                </Popconfirm>
              )
            }
          >
            <Descriptions.Item label="Situação">
              <TagDiscador interesse={detalhe} />
            </Descriptions.Item>
            <Descriptions.Item label="Enviado à fila em">{formatarDataHora(detalhe.discadorEnviadoEm)}</Descriptions.Item>
            <Descriptions.Item label="Resultado em">{formatarDataHora(detalhe.discadorResultadoEm)}</Descriptions.Item>
            <Descriptions.Item label="Tentativas de envio">{detalhe.discadorTentativas ?? 0}</Descriptions.Item>
            {detalhe.discadorErro && <Descriptions.Item label="Último erro">{detalhe.discadorErro}</Descriptions.Item>}
          </Descriptions>
        )}
      </Drawer>
    </>
  )
}
