import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import { App, Button, Segmented, Table, Tag, Tooltip } from 'antd'
import { CheckOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import { api, mensagemDeErro } from '../api/client'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { formatarData } from '../utils/formatar'
import { PRIORIDADE_TAREFA, STATUS_TAREFA } from '../utils/rotulos'

export default function Tarefas() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [visao, setVisao] = useState('urgentes')
  const url = visao === 'urgentes' ? '/tarefas/urgentes' : '/tarefas'
  const filtros = visao === 'urgentes' ? { dias: 7 } : {}
  const { itens, carregando, paginacao, recarregar } = useListaPaginada(url, filtros)

  async function concluir(tarefa) {
    try {
      await api.put(`/tarefas/${tarefa.id}/concluir`)
      message.success('Tarefa concluída')
      recarregar()
    } catch (e) {
      message.error(mensagemDeErro(e))
    }
  }

  const hoje = dayjs().startOf('day')
  const colunas = [
    { title: 'Tarefa', dataIndex: 'titulo' },
    { title: 'Responsável', dataIndex: 'responsavelNome' },
    {
      title: 'Vencimento',
      dataIndex: 'dataVencimento',
      render: (d, t) => {
        const atrasada = d && t.status !== 'CONCLUIDA' && dayjs(d).isBefore(hoje)
        return atrasada ? <Tag color="red">{formatarData(d)} · atrasada</Tag> : formatarData(d)
      },
    },
    { title: 'Prioridade', dataIndex: 'prioridade', render: (p) => <Tag color={PRIORIDADE_TAREFA[p]?.cor}>{PRIORIDADE_TAREFA[p]?.texto}</Tag> },
    { title: 'Status', dataIndex: 'status', render: (s) => <Tag color={STATUS_TAREFA[s]?.cor}>{STATUS_TAREFA[s]?.texto}</Tag> },
    {
      title: 'Oportunidade',
      dataIndex: 'oportunidadeId',
      render: (id) => (id ? <a onClick={() => navigate(`/oportunidades/${id}`)}>Abrir</a> : '-'),
    },
    {
      key: 'acoes',
      width: 60,
      render: (_, t) =>
        t.status !== 'CONCLUIDA' && (
          <Tooltip title="Concluir">
            <Button size="small" type="primary" icon={<CheckOutlined />} onClick={() => concluir(t)} />
          </Tooltip>
        ),
    },
  ]

  return (
    <>
      <Cabecalho
        titulo="Tarefas"
        acoes={
          <Segmented
            value={visao}
            onChange={setVisao}
            options={[
              { label: 'Urgentes (7 dias)', value: 'urgentes' },
              { label: 'Todas', value: 'todas' },
            ]}
          />
        }
      />
      <Table rowKey="id" columns={colunas} dataSource={itens} loading={carregando} pagination={paginacao} scroll={{ x: 800 }} />
    </>
  )
}
