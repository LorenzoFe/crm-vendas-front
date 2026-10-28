import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { App, Card, Col, Empty, List, Progress, Row, Spin, Statistic, Table, Tag, Typography } from 'antd'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { formatarData, formatarMoeda } from '../utils/formatar'
import { PRIORIDADE_TAREFA } from '../utils/rotulos'

export default function Painel() {
  const { message } = App.useApp()
  const { usuario, temPermissao } = useAuth()
  const navigate = useNavigate()
  const [pipeline, setPipeline] = useState(null)
  const [performance, setPerformance] = useState(null)
  const [urgentes, setUrgentes] = useState([])
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function carregar() {
      const pedidos = [
        api.get(`/usuarios/${usuario.id}/performance`).then(({ data }) => setPerformance(data)),
        api.get('/tarefas/urgentes', { params: { dias: 7, size: 10 } }).then(({ data }) => setUrgentes(data.content)),
      ]
      if (temPermissao('ver_oportunidade')) {
        pedidos.push(api.get('/oportunidades/pipeline').then(({ data }) => setPipeline(data)))
      }
      const resultados = await Promise.allSettled(pedidos)
      const falha = resultados.find((r) => r.status === 'rejected')
      if (falha) message.error(mensagemDeErro(falha.reason))
      setCarregando(false)
    }
    carregar()
  }, [usuario, temPermissao, message])

  if (carregando) {
    return <div className="centro"><Spin size="large" /></div>
  }

  const maiorValor = Math.max(1, ...(pipeline?.estagios ?? []).map((e) => Number(e.valorEstimado)))

  return (
    <>
      <Typography.Title level={3}>Painel</Typography.Title>

      {pipeline && (
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col xs={24} md={8}>
            <Card><Statistic title="Oportunidades ativas" value={pipeline.quantidadeTotal} /></Card>
          </Col>
          <Col xs={24} md={8}>
            <Card><Statistic title="Valor em negociação" value={formatarMoeda(pipeline.valorEstimadoTotal)} /></Card>
          </Col>
          <Col xs={24} md={8}>
            <Card><Statistic title="Previsão ponderada" value={formatarMoeda(pipeline.valorPonderadoTotal)} /></Card>
          </Col>
        </Row>
      )}

      <Row gutter={16}>
        {pipeline && (
          <Col xs={24} xl={12}>
            <Card title="Pipeline por estágio" style={{ marginBottom: 16 }}>
              <Table
                rowKey="estagioId"
                size="small"
                pagination={false}
                dataSource={pipeline.estagios}
                columns={[
                  { title: 'Estágio', dataIndex: 'nome' },
                  { title: 'Qtd.', dataIndex: 'quantidade', align: 'right', width: 60 },
                  {
                    title: 'Valor',
                    dataIndex: 'valorEstimado',
                    render: (v) => (
                      <>
                        <div>{formatarMoeda(v)}</div>
                        <Progress percent={Math.round((Number(v) / maiorValor) * 100)} showInfo={false} size="small" />
                      </>
                    ),
                  },
                  { title: 'Ponderado', dataIndex: 'valorPonderado', align: 'right', render: formatarMoeda },
                ]}
              />
            </Card>
          </Col>
        )}

        <Col xs={24} xl={12}>
          {performance && (
            <Card title={`Meu desempenho (${formatarData(performance.inicio)} a ${formatarData(performance.fim)})`} style={{ marginBottom: 16 }}>
              <Row gutter={[16, 16]}>
                <Col span={8}><Statistic title="Ganhas" value={performance.ganhas} valueStyle={{ color: '#3f8600' }} /></Col>
                <Col span={8}><Statistic title="Perdidas" value={performance.perdidas} valueStyle={{ color: '#cf1322' }} /></Col>
                <Col span={8}><Statistic title="Conversão" value={performance.taxaConversao} suffix="%" /></Col>
                <Col span={8}><Statistic title="Total vendido" value={formatarMoeda(performance.totalVendido)} /></Col>
                <Col span={8}><Statistic title="Ticket médio" value={formatarMoeda(performance.ticketMedio)} /></Col>
                <Col span={8}><Statistic title="Ciclo médio" value={performance.cicloMedioDias} suffix="dias" /></Col>
              </Row>
            </Card>
          )}

          <Card title="Tarefas urgentes (próximos 7 dias)" extra={<a onClick={() => navigate('/tarefas')}>Ver todas</a>}>
            {urgentes.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Nada urgente" />
            ) : (
              <List
                size="small"
                dataSource={urgentes}
                renderItem={(t) => (
                  <List.Item
                    onClick={() => t.oportunidadeId && navigate(`/oportunidades/${t.oportunidadeId}`)}
                    style={{ cursor: t.oportunidadeId ? 'pointer' : 'default' }}
                  >
                    <List.Item.Meta title={t.titulo} description={`Vence em ${formatarData(t.dataVencimento)}`} />
                    <Tag color={PRIORIDADE_TAREFA[t.prioridade]?.cor}>{PRIORIDADE_TAREFA[t.prioridade]?.texto}</Tag>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </>
  )
}
