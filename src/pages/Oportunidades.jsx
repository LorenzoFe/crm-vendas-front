import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Select, Space, Table, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import Cabecalho from '../components/Cabecalho'
import FormOportunidade from '../components/FormOportunidade'
import { useAuth } from '../auth/AuthContext'
import { useListaPaginada } from '../hooks/useListaPaginada'
import { useOpcoesEmpresas, useOpcoesEstagios } from '../hooks/useOpcoes'
import { formatarData, formatarMoeda } from '../utils/formatar'
import { STATUS_OPORTUNIDADE, opcoesDe } from '../utils/rotulos'

export default function Oportunidades() {
  const { temPermissao } = useAuth()
  const navigate = useNavigate()
  const [filtros, setFiltros] = useState({ status: 'ATIVA', estagioId: null, empresaId: null })
  const { itens, carregando, paginacao, recarregar } = useListaPaginada('/oportunidades', filtros, 'dataCriacao,desc')
  const empresas = useOpcoesEmpresas()
  const estagios = useOpcoesEstagios()
  const [formAberto, setFormAberto] = useState(false)

  const colunas = [
    { title: 'Título', dataIndex: 'titulo' },
    { title: 'Empresa', dataIndex: 'empresaNome' },
    { title: 'Estágio', dataIndex: 'estagioNome' },
    { title: 'Vendedor', dataIndex: 'vendedorNome' },
    { title: 'Valor', dataIndex: 'valorEstimado', align: 'right', render: formatarMoeda },
    { title: 'Previsão', dataIndex: 'dataFechamentoEsperada', render: formatarData },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (s) => <Tag color={STATUS_OPORTUNIDADE[s]?.cor}>{STATUS_OPORTUNIDADE[s]?.texto ?? s}</Tag>,
    },
  ]

  return (
    <>
      <Cabecalho
        titulo="Oportunidades"
        acoes={
          temPermissao('criar_oportunidade') && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setFormAberto(true)}>
              Nova oportunidade
            </Button>
          )
        }
      />
      <Space className="filtros" wrap>
        <Select
          value={filtros.status}
          options={opcoesDe(STATUS_OPORTUNIDADE)}
          allowClear
          placeholder="Status"
          style={{ width: 160 }}
          onChange={(status) => setFiltros((f) => ({ ...f, status: status ?? null }))}
        />
        <Select
          options={estagios.map((e) => ({ value: e.id, label: e.nome }))}
          allowClear
          placeholder="Estágio"
          style={{ width: 180 }}
          onChange={(estagioId) => setFiltros((f) => ({ ...f, estagioId: estagioId ?? null }))}
        />
        <Select
          options={empresas}
          allowClear
          showSearch
          optionFilterProp="label"
          placeholder="Empresa"
          style={{ width: 240 }}
          onChange={(empresaId) => setFiltros((f) => ({ ...f, empresaId: empresaId ?? null }))}
        />
      </Space>
      <Table
        rowKey="id"
        columns={colunas}
        dataSource={itens}
        loading={carregando}
        pagination={paginacao}
        scroll={{ x: 900 }}
        onRow={(o) => ({ onClick: () => navigate(`/oportunidades/${o.id}`), style: { cursor: 'pointer' } })}
      />
      <FormOportunidade
        aberto={formAberto}
        onFechar={() => setFormAberto(false)}
        onSalvo={(nova) => {
          setFormAberto(false)
          recarregar()
          navigate(`/oportunidades/${nova.id}`)
        }}
      />
    </>
  )
}
