import { useEffect, useState } from 'react'
import {
  CheckCircleFilled,
  ClockCircleOutlined,
  PhoneFilled,
  ThunderboltFilled,
  UserOutlined,
} from '@ant-design/icons'

// Motion do hero: o lead preenche o formulário, o envio vai para a discadora e a ligação
// aparece em pop-up para o SDR. Tudo é derivado de um único relógio (t, em ms) que roda em
// loop, então cada etapa é só uma janela de tempo.

const DURACAO_LOOP = 10800
const PASSO_MS = 50

const CAMPOS = [
  { rotulo: 'Nome', valor: 'Ana Souza', inicio: 500, duracao: 900 },
  { rotulo: 'Telefone', valor: '(34) 99812-4410', inicio: 1600, duracao: 1200 },
  { rotulo: 'Empresa', valor: 'Clínica Vida', inicio: 3000, duracao: 800 },
]

const ETAPAS = {
  clique: 4100,
  enviado: 4500,
  sinal: 5000,
  naFila: 5700,
  chamada: 6100,
  atendido: 8200,
  saida: 10200,
}

function digitado(campo, t) {
  const progresso = Math.min(1, Math.max(0, (t - campo.inicio) / campo.duracao))
  return campo.valor.slice(0, Math.round(progresso * campo.valor.length))
}

function useRelogio() {
  const reduzido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const [t, setT] = useState(reduzido ? ETAPAS.atendido + 600 : 0)
  useEffect(() => {
    if (reduzido) return undefined
    const id = setInterval(() => setT((atual) => (atual + PASSO_MS) % DURACAO_LOOP), PASSO_MS)
    return () => clearInterval(id)
  }, [reduzido])
  return t
}

export default function SiteHeroDemo() {
  const t = useRelogio()
  const depois = (etapa) => t >= ETAPAS[etapa]
  const saindo = depois('saida')
  const segundosResposta = depois('chamada')
    ? Math.min(4, Math.floor((Math.min(t, ETAPAS.atendido) - ETAPAS.enviado) / 950) + 1)
    : 0
  const campoAtivo = CAMPOS.find((c) => t >= c.inicio && t < c.inicio + c.duracao + 150)

  return (
    <div className={`demo ${saindo ? 'saindo' : ''}`} aria-hidden="true">
      <span className="demo-brilho" />

      <div className={`demo-form ${depois('enviado') ? 'enviado' : ''}`}>
        <div className="demo-form-topo">
          <span className="demo-ponto" />
          <span className="demo-ponto" />
          <span className="demo-ponto" />
          <small>cortex.app/area-cliente</small>
        </div>
        <strong>Fale com um especialista</strong>
        <p>Deixe seu contato e a gente te liga agora.</p>
        {CAMPOS.map((campo) => (
          <label key={campo.rotulo} className={campoAtivo === campo ? 'ativo' : ''}>
            <small>{campo.rotulo}</small>
            <span>
              {digitado(campo, t)}
              {campoAtivo === campo && <i className="demo-caret" />}
            </span>
          </label>
        ))}
        <div className={`demo-enviar ${depois('clique') && !depois('enviado') ? 'pressionado' : ''}`}>
          {depois('enviado') ? (
            <>
              <CheckCircleFilled /> Interesse registrado
            </>
          ) : (
            'Quero ser contatado'
          )}
        </div>
        <i className={`demo-mouse ${depois('clique') ? 'no-botao' : ''}`} />
      </div>

      <div className={`demo-trilha ${depois('sinal') ? 'ativa' : ''}`}>
        <span className="demo-sinal" />
      </div>

      <div className={`demo-fila ${depois('naFila') ? 'visivel' : ''}`}>
        <ThunderboltFilled />
        <div>
          <small>Discadora Vonix</small>
          <strong>{depois('atendido') ? 'Atendido' : depois('chamada') ? 'Chamando SDR…' : 'Na fila'}</strong>
        </div>
      </div>

      <div className={`demo-chamada ${depois('chamada') ? 'visivel' : ''} ${depois('atendido') ? 'atendida' : ''}`}>
        <div className="demo-chamada-topo">
          <span className="demo-tag">{depois('atendido') ? 'Em ligação' : 'Lead novo · ligando'}</span>
          <span className="demo-tempo">
            <ClockCircleOutlined /> {segundosResposta}s
          </span>
        </div>
        <div className="demo-chamada-lead">
          <span className="demo-avatar">
            <UserOutlined />
            {!depois('atendido') && (
              <>
                <i className="onda o1" />
                <i className="onda o2" />
              </>
            )}
          </span>
          <div>
            <strong>Ana Souza</strong>
            <small>(34) 99812-4410 · Clínica Vida</small>
          </div>
        </div>
        <div className="demo-chamada-rodape">
          <small>
            Para: <b>Pedro (SDR)</b>
          </small>
          <span className="demo-atender">
            {depois('atendido') ? <CheckCircleFilled /> : <PhoneFilled />}
          </span>
        </div>
        <div className="demo-resposta">
          Tempo de resposta: <b>{segundosResposta} segundos</b>
        </div>
      </div>
    </div>
  )
}
