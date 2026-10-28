import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { DndContext, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from '@dnd-kit/core'
import { Alert, App, Badge, Card, Empty, Spin, Typography } from 'antd'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { formatarData, formatarMoeda } from '../utils/formatar'

function CartaoOportunidade({ oportunidade, podeArrastar }) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: oportunidade.id,
    disabled: !podeArrastar,
  })

  const estilo = {
    transform: transform ? `translate(${transform.x}px, ${transform.y}px)` : undefined,
    opacity: isDragging ? 0.6 : 1,
    cursor: podeArrastar ? 'grab' : 'default',
    zIndex: isDragging ? 10 : 'auto',
  }

  return (
    <div ref={setNodeRef} style={estilo} {...listeners} {...attributes}>
      <Card size="small" className="cartao" hoverable onClick={() => navigate(`/oportunidades/${oportunidade.id}`)}>
        <Typography.Text strong>{oportunidade.titulo}</Typography.Text>
        <div className="cartao-linha">{oportunidade.empresaNome}</div>
        {oportunidade.contatoNome && <div className="cartao-linha">{oportunidade.contatoNome}</div>}
        <div className="cartao-rodape">
          <Typography.Text strong>{formatarMoeda(oportunidade.valorEstimado)}</Typography.Text>
          <Typography.Text type="secondary">{oportunidade.vendedorNome}</Typography.Text>
        </div>
        {oportunidade.dataFechamentoEsperada && (
          <Typography.Text type="secondary" className="cartao-linha">
            Previsão: {formatarData(oportunidade.dataFechamentoEsperada)}
          </Typography.Text>
        )}
      </Card>
    </div>
  )
}

function ColunaEstagio({ estagio, podeArrastar }) {
  const { setNodeRef, isOver } = useDroppable({ id: estagio.id })
  const total = estagio.oportunidades.reduce((soma, o) => soma + Number(o.valorEstimado ?? 0), 0)

  return (
    <div ref={setNodeRef} className={`coluna ${isOver ? 'coluna-sobre' : ''}`}>
      <div className="coluna-cabecalho">
        <Typography.Text strong>{estagio.nome}</Typography.Text>
        <Badge count={estagio.oportunidades.length} showZero color="#1677ff" />
      </div>
      <Typography.Text type="secondary" className="coluna-resumo">
        {formatarMoeda(total)} · {estagio.probabilidadeConversao ?? 0}%
      </Typography.Text>
      <div className="coluna-cartoes">
        {estagio.oportunidades.length === 0 ? (
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Sem oportunidades" />
        ) : (
          estagio.oportunidades.map((o) => (
            <CartaoOportunidade key={o.id} oportunidade={o} podeArrastar={podeArrastar} />
          ))
        )}
      </div>
    </div>
  )
}

export default function Kanban() {
  const { message } = App.useApp()
  const { temPermissao } = useAuth()
  const [estagios, setEstagios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const sensores = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const podeArrastar = temPermissao('editar_oportunidade')

  const carregar = useCallback(async () => {
    setErro(null)
    try {
      const { data } = await api.get('/oportunidades/kanban')
      setEstagios(data)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setCarregando(false)
    }
  }, [])

  useEffect(() => {
    carregar()
  }, [carregar])

  const estagioDaOportunidade = useMemo(() => {
    const mapa = new Map()
    estagios.forEach((e) => e.oportunidades.forEach((o) => mapa.set(o.id, e.id)))
    return mapa
  }, [estagios])

  async function soltar({ active, over }) {
    if (!over) return
    const oportunidadeId = active.id
    const origem = estagioDaOportunidade.get(oportunidadeId)
    const destino = over.id
    if (origem === destino) return

    const anterior = estagios
    const oportunidade = estagios.find((e) => e.id === origem).oportunidades.find((o) => o.id === oportunidadeId)
    setEstagios((atual) =>
      atual.map((e) => {
        if (e.id === origem) return { ...e, oportunidades: e.oportunidades.filter((o) => o.id !== oportunidadeId) }
        if (e.id === destino) return { ...e, oportunidades: [...e.oportunidades, oportunidade] }
        return e
      }),
    )

    try {
      await api.put(`/oportunidades/${oportunidadeId}/mudar-estagio`, { estagioId: destino })
      message.success('Estágio atualizado')
    } catch (e) {
      setEstagios(anterior)
      message.error(mensagemDeErro(e))
    }
  }

  if (carregando) {
    return (
      <div className="centro">
        <Spin size="large" tip="Carregando funil... (o servidor pode levar até 1 minuto para acordar)">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    )
  }

  return (
    <>
      <Typography.Title level={3}>Funil de vendas</Typography.Title>
      {erro && <Alert type="error" message={erro} showIcon style={{ marginBottom: 16 }} />}
      {!podeArrastar && (
        <Alert type="info" message="Você pode visualizar o funil, mas não tem permissão para mover oportunidades." showIcon style={{ marginBottom: 16 }} />
      )}
      <DndContext sensors={sensores} onDragEnd={soltar}>
        <div className="kanban">
          {estagios.map((estagio) => (
            <ColunaEstagio key={estagio.id} estagio={estagio} podeArrastar={podeArrastar} />
          ))}
        </div>
      </DndContext>
    </>
  )
}
