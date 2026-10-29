import { useEffect, useLayoutEffect, useRef } from 'react'

// Tríptico "Visão geral" da landing page: três cards com gráfico de barras, assistente de
// automação e fluxo de decisão. Os dois canvas são desenhados na mão (sem imagens) e a
// entrada anima do card do centro para fora quando a seção aparece na tela.

const ALTURAS_BARRAS = [
  20, 33, 48, 56, 51, 47, 39, 31, 53, 55, 60, 56, 100, 92, 76, 67, 62, 65, 59, 70, 74, 87, 83, 77,
]
const INDICE_BARRA_ATIVA = 12

const BRILHOS = [
  { x: 0.01, y: 0.01, tamanho: 0.5 },
  { x: 0.28, y: 0.26, tamanho: 0.72 },
]
const PONTOS_BRILHO = [
  [0.5, 0.06], [0.59, 0.41], [0.94, 0.5], [0.59, 0.59],
  [0.5, 0.94], [0.41, 0.59], [0.06, 0.5], [0.41, 0.41],
]

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

function poligonoArredondado(ctx, pontos, arredondamento) {
  const n = pontos.length
  const cantos = pontos.map((p, i) => {
    const ant = pontos[(i - 1 + n) % n]
    const prox = pontos[(i + 1) % n]
    return {
      ponto: p,
      antes: [p[0] + (ant[0] - p[0]) * arredondamento, p[1] + (ant[1] - p[1]) * arredondamento],
      depois: [p[0] + (prox[0] - p[0]) * arredondamento, p[1] + (prox[1] - p[1]) * arredondamento],
    }
  })
  ctx.beginPath()
  ctx.moveTo(...cantos[0].depois)
  for (let i = 1; i <= n; i++) {
    const c = cantos[i % n]
    ctx.lineTo(...c.antes)
    ctx.quadraticCurveTo(...c.ponto, ...c.depois)
  }
  ctx.closePath()
}

function desenharBrilho(canvas) {
  const { ctx, w, h } = prepararCanvas(canvas)
  BRILHOS.forEach((b) => {
    const tamanho = Math.min(w, h) * b.tamanho
    const pontos = PONTOS_BRILHO.map(([px, py]) => [w * b.x + px * tamanho, h * b.y + py * tamanho])
    poligonoArredondado(ctx, pontos, 0.34)
    ctx.fillStyle = 'rgba(214,232,255,.55)'
    ctx.strokeStyle = '#fff'
    ctx.lineWidth = Math.max(1.1, tamanho * 0.15)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.shadowColor = 'rgba(255,255,255,.78)'
    ctx.shadowBlur = tamanho * 0.06
    ctx.fill()
    ctx.stroke()
    ctx.shadowColor = 'transparent'
    ctx.shadowBlur = 0
  })
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

const movimentoReduzido = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches || !Element.prototype.animate

// Coreografia de entrada: card do centro primeiro, depois os vizinhos; cada card anima em
// camadas (superfície, painel, texto, título, descrição e ícone).
function animarEntrada(secao) {
  const cards = [...secao.querySelectorAll('.tri-card')]
  const largura = window.innerWidth
  const compacto = largura <= 512
  const subida = compacto ? 11 : 16
  const easePosiciona = 'cubic-bezier(.16,1,.3,1)'
  const easeRevela = 'cubic-bezier(.24,.86,.28,1)'

  const medidas = cards.map((card, indice) => ({ card, indice, caixa: card.getBoundingClientRect() }))
  const topo = Math.min(...medidas.map((m) => m.caixa.top))
  const umaLinha = medidas.every((m) => Math.abs(m.caixa.top - topo) <= Math.max(4, m.caixa.height * 0.04))
  const centroTela = largura / 2
  const distanciaCentro = (m) => m.caixa.left + m.caixa.width / 2 - centroTela

  const ordem = umaLinha
    ? [...medidas].sort((a, b) =>
        a.indice === 1 ? -1 : b.indice === 1 ? 1 : Math.abs(distanciaCentro(a)) - Math.abs(distanciaCentro(b)),
      )
    : [...medidas].sort((a, b) => a.caixa.top - b.caixa.top || a.caixa.left - b.caixa.left)

  const animacoes = []
  const animar = (el, quadros, opcoes) => {
    if (el) animacoes.push(el.animate(quadros, { fill: 'both', ...opcoes }))
  }

  ordem.forEach((m, posicao) => {
    const principal = umaLinha && m.indice === 1
    const atraso = umaLinha ? (principal ? 60 : 245 + (posicao - 1) * 85) : 70 + posicao * 115
    const desvio = umaLinha && !principal ? -Math.sign(distanciaCentro(m)) * Math.min(largura * 0.018, 7) : 0
    const { card } = m

    animar(
      card,
      [
        { opacity: 0, transform: `translate3d(${desvio}px, ${subida}px, 0) scale(.985)` },
        { opacity: 1, transform: 'none' },
      ],
      { duration: compacto ? 780 : principal ? 960 : 900, delay: atraso, easing: easePosiciona },
    )
    animar(
      card.querySelector('.tri-painel'),
      [
        { opacity: 0, transform: 'scale(.994)', clipPath: `inset(0 0 ${compacto ? 26 : 34}% 0)` },
        { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' },
      ],
      { duration: compacto ? 620 : 720, delay: atraso + 200, easing: easeRevela },
    )
    animar(
      card.querySelector('.tri-texto'),
      [{ opacity: 0, transform: `translate3d(0, ${compacto ? 8 : 11}px, 0)` }, { opacity: 1, transform: 'none' }],
      { duration: compacto ? 540 : 620, delay: atraso + 330, easing: easePosiciona },
    )
    const descobrir = [
      { opacity: 0, clipPath: 'inset(-30% 0 100% 0)' },
      { opacity: 1, clipPath: 'inset(-30% 0 -30% 0)' },
    ]
    animar(card.querySelector('.tri-texto h3'), descobrir, {
      duration: compacto ? 470 : 540,
      delay: atraso + 350,
      easing: easeRevela,
    })
    animar(card.querySelector('.tri-texto p'), descobrir, {
      duration: compacto ? 430 : 490,
      delay: atraso + 450,
      easing: easeRevela,
    })
    animar(
      card.querySelector('.tri-icone'),
      [{ opacity: 0, transform: 'scale(.88)' }, { opacity: 1, transform: 'none' }],
      { duration: compacto ? 340 : 400, delay: atraso + 540, easing: easePosiciona },
    )
  })

  secao.classList.add('entrada-ativa')
  secao.classList.remove('entrada-pendente')
  return animacoes
}

function useEntrada(ref) {
  useLayoutEffect(() => {
    const secao = ref.current
    if (movimentoReduzido()) return undefined
    secao.classList.add('entrada-pendente')
    let animacoes = []

    const revelar = () => {
      animacoes.forEach((a) => a.cancel())
      secao.classList.remove('entrada-pendente', 'entrada-ativa')
    }

    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada.isIntersecting) return
        observador.disconnect()
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            try {
              animacoes = animarEntrada(secao)
              Promise.all(animacoes.map((a) => a.finished)).then(revelar, revelar)
            } catch {
              revelar()
            }
          }),
        )
      },
      { threshold: 0.25 },
    )
    observador.observe(secao)
    return () => {
      observador.disconnect()
      revelar()
    }
  }, [ref])
}

export default function SiteTriptico() {
  const secao = useRef(null)
  const brilho = useCanvas(desenharBrilho)
  const fluxo = useCanvas(desenharFluxo)
  useEntrada(secao)

  return (
    <section className="tri" ref={secao} aria-label="Visão geral do Córtex">
      <div className="tri-cards">
        <article className="tri-card">
          <div className="tri-painel" aria-label="Gráfico de leads ao longo do dia">
            <div className="tri-linha-tempo">
              <span>08h</span>
              <i />
              <span>12h</span>
              <i />
              <span>18h</span>
            </div>
            <div className="tri-barras" aria-hidden="true">
              {ALTURAS_BARRAS.map((altura, i) => (
                <i
                  key={i}
                  className={`tri-barra ${i === INDICE_BARRA_ATIVA ? 'ativa' : ''}`}
                  style={{ '--h': `${altura}%` }}
                />
              ))}
            </div>
            <div className="tri-valor">R$ 184 mil</div>
            <div className="tri-eixo">
              <span>NOVO</span>
              <span>QUALIFICADO</span>
              <span>PROPOSTA</span>
              <span>VENDA</span>
            </div>
          </div>
          <div className="tri-texto">
            <h3>Visibilidade na hora</h3>
            <p>
              O funil inteiro em tempo
              <br />
              real, lead por lead.
            </p>
            <span className="tri-icone">
              <i className="tri-mais" />
            </span>
          </div>
        </article>

        <article className="tri-card">
          <div className="tri-painel">
            <div className="tri-assistente">
              <span className="tri-selo">
                <i className="tri-mais" />
              </span>
              <span>Córtex IA</span>
            </div>
            <p className="tri-pergunta">O que você quer automatizar?</p>
            <div className="tri-prompt">
              Quando um lead preencher o formulário,
              <br />
              mande o número para a discadora e crie
              <br />a tarefa de contato para o SDR livre.
            </div>
            <div className="tri-automatizar">
              <span>Automatizar</span>
              <canvas ref={brilho} className="tri-magica" aria-hidden="true" />
            </div>
            <i className="tri-cursor" aria-hidden="true" />
          </div>
          <div className="tri-texto">
            <h3>Fluxos automáticos</h3>
            <p>
              Do formulário à ligação
              <br />
              sem ninguém copiar telefone.
            </p>
            <span className="tri-icone">
              <i className="tri-fluxo-icone" />
            </span>
          </div>
        </article>

        <article className="tri-card">
          <div className="tri-painel">
            <div className="tri-metrica">
              <div className="rotulo">Tempo de resposta</div>
              <div className="linha">
                <strong>4,2 s</strong>
                <span>↓ 85% mais rápido</span>
              </div>
            </div>
            <canvas
              ref={fluxo}
              className="tri-decisao"
              aria-label="Caminhos de decisão convergindo para um resultado otimizado"
            />
            <div className="tri-tag acao">Ação: ligar agora</div>
            <div className="tri-tag confianca">Prioridade do lead: 98%</div>
            <div className="tri-tag caminho">Conversão: +14,2%</div>
          </div>
          <div className="tri-texto">
            <h3>Decisões mais rápidas</h3>
            <p>
              O próximo passo de cada
              <br />
              lead, na sua frente.
            </p>
            <span className="tri-icone">
              <i className="tri-raio" />
            </span>
          </div>
        </article>
      </div>
    </section>
  )
}
