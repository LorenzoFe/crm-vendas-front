import { useEffect, useRef } from 'react'
import { CheckCircleFilled, PhoneFilled, TeamOutlined, ThunderboltFilled, UserOutlined } from '@ant-design/icons'

// Seção "Por que times de inbound escolhem o Córtex": o resultado (tempo de resposta) num card
// grande com o fluxo convergindo desenhado em canvas, justificado por dois recursos ao lado:
// distribuição de leads e discagem automática.

// Faixas: os vários leads chegando pela esquerda e convergindo num atendimento só à direita.
const FAIXAS_FLUXO = [
  { origem: [0.08, 0.26], destino: [0.29, 0.32], cor: 'rgba(145,202,255,.60)' },
  { origem: [0.23, 0.42], destino: [0.3, 0.335], cor: 'rgba(80,160,255,.70)' },
  { origem: [0.5, 0.75], destino: [0.32, 0.355], cor: 'rgba(64,145,255,.82)' },
  { origem: [0.69, 0.98], destino: [0.33, 0.365], cor: 'rgba(128,190,255,.54)' },
  { origem: [0.39, 0.51], destino: [0.31, 0.345], cor: 'rgba(22,119,255,.96)' },
]
const FIOS_FLUXO = [
  { origem: 0.05, destino: 0.3, alfa: 0.68 },
  { origem: 0.2, destino: 0.315, alfa: 0.6 },
  { origem: 0.62, destino: 0.342, alfa: 0.84 },
  { origem: 0.82, destino: 0.352, alfa: 0.74 },
  { origem: 0.97, destino: 0.36, alfa: 0.64 },
]
const FORMA_FLUXO = { seguraOrigem: 0.38, aproximaDestino: 0.74, larguraFio: 0.00135 }

const SDRS = [
  { nome: 'Ana', status: 'Em ligação' },
  { nome: 'Pedro', status: 'Livre', livre: true },
  { nome: 'Carla', status: 'Em ligação' },
]

const ETAPAS_DISCAGEM = ['Formulário enviado', 'Na fila da discadora', 'Chamando o SDR', 'Atendido']

// Ajusta o canvas à densidade de pixels da tela e devolve o contexto já escalado.
function prepararCanvas(canvas) {
  const { width, height } = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const ctx = canvas.getContext('2d')
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  return { ctx, w: width, h: height }
}

function desenharFluxo(canvas) {
  const { ctx, w, h } = prepararCanvas(canvas)
  const { seguraOrigem, aproximaDestino, larguraFio } = FORMA_FLUXO
  FAIXAS_FLUXO.forEach(({ origem: [oTopo, oBase], destino: [dTopo, dBase], cor }) => {
    ctx.beginPath()
    ctx.moveTo(0, h * oTopo)
    ctx.bezierCurveTo(w * seguraOrigem, h * oTopo, w * aproximaDestino, h * dTopo, w, h * dTopo)
    ctx.lineTo(w, h * dBase)
    ctx.bezierCurveTo(w * aproximaDestino, h * dBase, w * seguraOrigem, h * oBase, 0, h * oBase)
    ctx.closePath()
    ctx.fillStyle = cor
    ctx.fill()
  })
  ctx.lineWidth = Math.max(0.72, w * larguraFio)
  FIOS_FLUXO.forEach(({ origem, destino, alfa }) => {
    ctx.beginPath()
    ctx.moveTo(0, h * origem)
    ctx.bezierCurveTo(w * seguraOrigem, h * origem, w * aproximaDestino, h * destino, w, h * destino)
    ctx.strokeStyle = `rgba(255,255,255,${alfa})`
    ctx.stroke()
  })
}

function useCanvas(desenhar) {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const observador = new ResizeObserver(() => desenhar(canvas))
    observador.observe(canvas)
    return () => observador.disconnect()
  }, [desenhar])
  return ref
}

export default function SitePorQue() {
  const fluxo = useCanvas(desenharFluxo)

  return (
    <section className="site-secao" id="recursos">
      <div className="site-titulo">
        <h2>Por que times de inbound escolhem o Córtex</h2>
        <p>Dois recursos trabalhando juntos derrubam o tempo de resposta de minutos para segundos.</p>
      </div>

      <div className="pq-grade">
        <article className="pq-card pq-resultado">
          <div className="pq-painel">
            <div className="pq-metrica">
              <small>Tempo de resposta</small>
              <div>
                <strong>4,2 s</strong>
                <span>↓ 85% mais rápido</span>
              </div>
            </div>
            <canvas
              ref={fluxo}
              className="pq-fluxo"
              aria-label="Vários leads chegando e convergindo num atendimento rápido"
            />
            <span className="pq-tag t1">Lead novo na fila</span>
            <span className="pq-tag t2">SDR livre: Pedro</span>
            <span className="pq-tag t3">Discagem automática</span>
          </div>
          <div className="pq-texto">
            <h3>Resposta em segundos</h3>
            <p>
              Cada lead que chega é distribuído para quem está livre e discado na hora. O resultado
              aparece direto no tempo de resposta.
            </p>
            <span className="pq-icone">
              <ThunderboltFilled />
            </span>
          </div>
        </article>

        <div className="pq-coluna">
          <article className="pq-card">
            <div className="pq-painel pq-distribuicao">
              <span className="pq-lead">
                <UserOutlined /> Lead novo
              </span>
              <div className="pq-sdrs">
                {SDRS.map((sdr) => (
                  <div key={sdr.nome} className={sdr.livre ? 'livre' : ''}>
                    <span className="avatar">{sdr.nome.charAt(0)}</span>
                    <strong>{sdr.nome}</strong>
                    <em>{sdr.livre ? <CheckCircleFilled /> : null} {sdr.status}</em>
                  </div>
                ))}
              </div>
            </div>
            <div className="pq-texto">
              <h3>Distribuição de leads</h3>
              <p>
                O Córtex identifica o SDR disponível e entrega o lead para ele. Nenhum lead fica parado
                esperando alguém pegar.
              </p>
              <span className="pq-icone">
                <TeamOutlined />
              </span>
            </div>
          </article>

          <article className="pq-card">
            <div className="pq-painel pq-discagem">
              <div className="pq-chamada">
                <span className="telefone">
                  <PhoneFilled />
                  <i className="onda o1" />
                  <i className="onda o2" />
                </span>
                <div>
                  <strong>Ligando para Ana Souza</strong>
                  <small>(34) 99812-4410</small>
                </div>
              </div>
              <ol className="pq-etapas">
                {ETAPAS_DISCAGEM.map((etapa, i) => (
                  <li key={etapa} style={{ '--i': i }}>
                    {etapa}
                  </li>
                ))}
              </ol>
            </div>
            <div className="pq-texto">
              <h3>Discagem automática</h3>
              <p>
                O número vai para a discadora assim que o formulário é enviado. O SDR só atende, e o
                status da ligação volta para o CRM.
              </p>
              <span className="pq-icone">
                <PhoneFilled />
              </span>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
