import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ApiOutlined,
  ArrowRightOutlined,
  BarChartOutlined,
  BellOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  DownOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FormOutlined,
  GithubOutlined,
  InstagramOutlined,
  LinkedinOutlined,
  PhoneOutlined,
  RobotOutlined,
  StarFilled,
  TeamOutlined,
  ThunderboltOutlined,
  UserOutlined,
} from '@ant-design/icons'
import SiteHeroDemo from './SiteHeroDemo'
import SiteTriptico from './SiteTriptico'
import { LOGOS } from './siteLogos'
import '../site.css'

// Landing page pública do Córtex. Estrutura baseada na referência aprovada pelo Moises;
// textos são o primeiro rascunho e ainda vão ser refinados.

const LINKS_MENU = [
  { href: '#recursos', rotulo: 'Recursos' },
  { href: '#como-funciona', rotulo: 'Como funciona' },
  { href: '#planos', rotulo: 'Planos' },
  { href: '#faq', rotulo: 'FAQ' },
]

const PASSOS = [
  {
    aba: 'Lead chega',
    titulo: 'O lead entra sozinho',
    texto: 'O formulário público cria o interessado na hora, com aceite LGPD e os produtos que ele escolheu.',
  },
  {
    aba: 'Discadora liga',
    titulo: 'A discadora liga em segundos',
    texto: 'O número vai direto para a fila da Vonix. O primeiro SDR livre atende, sem ninguém copiar telefone.',
  },
  {
    aba: 'SDR qualifica',
    titulo: 'O SDR qualifica e agenda',
    texto: 'Com um clique o interessado vira oportunidade no funil, com tarefas, notas e histórico no card.',
  },
  {
    aba: 'Gestor acompanha',
    titulo: 'O gestor enxerga tudo',
    texto: 'Painel com leads por estágio, conversão, motivos de perda e o desempenho de cada vendedor.',
  },
]

const CASOS = [
  { icone: <ThunderboltOutlined />, titulo: 'Speed-to-lead de verdade.', texto: 'Lead novo vai para a discadora no mesmo minuto em que preenche o formulário.' },
  { icone: <TeamOutlined />, titulo: 'Pré-vendas organizado.', texto: 'Fila de interessados com status da ligação: na fila, atendido, caixa postal ou não atendido.' },
  { icone: <BarChartOutlined />, titulo: 'Funil sem planilha.', texto: 'Arraste a oportunidade entre estágios e veja o valor do pipeline atualizado na hora.' },
  { icone: <FormOutlined />, titulo: 'Propostas em um clique.', texto: 'Gere a proposta a partir dos itens da oportunidade, envie e registre o aceite.' },
]

const PLANOS = [
  {
    nome: 'Essencial',
    icone: <UserOutlined />,
    descricao: 'Para quem está organizando o primeiro funil.',
    mensal: 49,
    itens: ['Até 3 usuários', 'Funil Kanban', 'Empresas e contatos', 'Tarefas e notas', 'Suporte por e-mail'],
  },
  {
    nome: 'Equipe',
    icone: <TeamOutlined />,
    descricao: 'Para times de pré-vendas que vivem de inbound.',
    mensal: 99,
    destaque: true,
    itens: ['Usuários ilimitados', 'Área do Cliente (formulário)', 'Discadora integrada', 'Propostas e histórico', 'Painel de desempenho', 'Perfis e permissões'],
  },
  {
    nome: 'Operação',
    icone: <ApiOutlined />,
    descricao: 'Para operações com vários funis e gestores.',
    mensal: 199,
    itens: ['Tudo do Equipe', 'Vários funis', 'Relatórios avançados', 'IA sobre a base (em breve)', 'Suporte prioritário'],
  },
]

function Logo({ claro = false }) {
  return (
    <span className={`site-logo ${claro ? 'claro' : ''}`}>
      <img className="site-logo-icone" src="/logo-cortex.png" alt="" />
      córtex
    </span>
  )
}

function LogoMarca({ logo }) {
  if (logo.id === 'linkedin') {
    return <span className="site-marca-in">in</span>
  }
  if (logo.id === 'twilio') {
    return (
      <svg viewBox="0 0 24 24" fill={logo.cor}>
        <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm0 20.8a8.8 8.8 0 1 1 0-17.6 8.8 8.8 0 0 1 0 17.6Z" />
        <circle cx="9.2" cy="9.2" r="2.3" />
        <circle cx="14.8" cy="9.2" r="2.3" />
        <circle cx="9.2" cy="14.8" r="2.3" />
        <circle cx="14.8" cy="14.8" r="2.3" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 24 24" fill={logo.cor}>
      <path d={logo.path} />
    </svg>
  )
}

const MARCAS_ORBITA = [
  ...LOGOS.filter((l) => ['make', 'googleads', 'aircall', 'n8n'].includes(l.id)),
  { id: 'linkedin', nome: 'LinkedIn', cor: '#0a66c2' },
  ...LOGOS.filter((l) => ['meta', 'vonage'].includes(l.id)),
  { id: 'twilio', nome: 'Twilio', cor: '#f22f46' },
]

function Orbita() {
  return (
    <div className="site-orbita" aria-hidden="true">
      <span className="site-arco a1" />
      <span className="site-arco a2" />
      {MARCAS_ORBITA.map((logo, i) => (
        <span key={logo.id} className={`site-orbita-icone o${i + 1}`} title={logo.nome}>
          <LogoMarca logo={logo} />
        </span>
      ))}
    </div>
  )
}

function BotaoVidro({ to, children }) {
  return (
    <Link to={to} className="site-btn vidro">
      {children}
      <span className="site-btn-seta">
        <ArrowRightOutlined />
      </span>
    </Link>
  )
}

function Hero({ id }) {
  return (
    <div className="site-hero-conteudo" id={id}>
      <h1>
        Ligue automaticamente <br className="quebra-desktop" />
        para seus leads em <br className="quebra-desktop" />
        <span className="site-destaque">menos de 5s</span>
      </h1>
      <p>
        Reduza seu tempo de contato para menos de 5s com uma plataforma que integra VoIP e seu canal
        inbound em um único fluxo de vendas.
      </p>
      <div className="site-botoes">
        <Link to="/login" className="site-btn escuro">
          Começar agora
        </Link>
        <Link to="/area-cliente" className="site-btn cinza">
          Ver demonstração
        </Link>
      </div>
    </div>
  )
}

function DemoIntegracao() {
  return (
    <section className="site-secao site-demo-secao" id="como-funciona-ao-vivo">
      <div className="site-demo-texto">
        <small>Speed-to-lead</small>
        <h2>
          Do formulário à ligação
          <br />
          em segundos
        </h2>
        <p>
          O lead preenche o formulário, o Córtex manda o número direto para a fila da discadora e o
          primeiro SDR livre já recebe a chamada. Sem copiar telefone, sem esperar o dia seguinte.
        </p>
        <ul>
          <li>
            <CheckCircleFilled /> Interesse registrado com aceite LGPD
          </li>
          <li>
            <CheckCircleFilled /> Número na fila da Vonix na hora
          </li>
          <li>
            <CheckCircleFilled /> Status da ligação de volta no CRM
          </li>
        </ul>
        <BotaoVidro to="/area-cliente">Testar o formulário</BotaoVidro>
      </div>
      <SiteHeroDemo />
    </section>
  )
}

function Bento() {
  const colunas = [
    { nome: 'Novos', itens: ['Clínica Vida', 'Loja Norte'] },
    { nome: 'Qualificados', itens: ['Grupo Alfa'] },
    { nome: 'Proposta', itens: ['TechSul', 'Rede Mais'] },
  ]
  return (
    <section className="site-secao" id="recursos">
      <div className="site-titulo">
        <h2>Por que times de inbound escolhem o Córtex</h2>
        <p>Recursos pensados para quem precisa atender o lead enquanto ele ainda está quente.</p>
      </div>
      <div className="site-bento">
        <div className="site-bento-item grande">
          <div className="site-bento-visual gradiente">
            <img className="site-app-icone" src="/logo-cortex.png" alt="" />
            <div className="site-bento-rostos">
              {['#ffd666', '#91caff', '#ffadd2', '#b7eb8f', '#d3adf7', '#87e8de'].map((cor) => (
                <span key={cor} style={{ background: cor }}>
                  <UserOutlined />
                </span>
              ))}
            </div>
            <span className="site-chip">
              <ThunderboltOutlined /> Distribuição automática
            </span>
          </div>
          <h3>Speed-to-lead</h3>
          <p>Todo lead novo vai direto para a fila da discadora e cai no primeiro SDR livre.</p>
        </div>

        <div className="site-bento-item">
          <div className="site-bento-visual">
            <div className="site-mini-kanban">
              {colunas.map((col) => (
                <div key={col.nome}>
                  <small>{col.nome}</small>
                  {col.itens.map((item) => (
                    <span key={item}>{item}</span>
                  ))}
                </div>
              ))}
            </div>
          </div>
          <h3>Funil flexível</h3>
          <p>Arraste oportunidades entre estágios e acompanhe o valor de cada etapa.</p>
        </div>

        <div className="site-bento-item">
          <div className="site-bento-visual">
            <div className="site-mini-discador">
              {[
                ['Ana Souza', 'Atendido', 'verde'],
                ['Pedro Reis', 'Na fila', 'azul'],
                ['Carla Dias', 'Caixa postal', 'laranja'],
              ].map(([nome, status, cor]) => (
                <div key={nome}>
                  <PhoneOutlined />
                  <span>{nome}</span>
                  <em className={cor}>{status}</em>
                </div>
              ))}
              <span className="site-chip escuro">
                <PhoneOutlined /> Reenviar à fila
              </span>
            </div>
          </div>
          <h3>Discadora integrada</h3>
          <p>O status de cada ligação volta para o CRM: atendido, não atendido ou caixa postal.</p>
        </div>

        <div className="site-bento-item largo">
          <div className="site-bento-visual">
            <div className="site-mini-tabela">
              <div className="cabeca">
                <span>TAREFAS DE HOJE</span>
                <span className="site-mock-pilula">
                  <ClockCircleOutlined /> 3 urgentes
                </span>
              </div>
              {[
                ['Ligar para Clínica Vida', 'Alta', '09:30', 'Ana'],
                ['Enviar proposta TechSul', 'Média', '11:00', 'Pedro'],
                ['Follow-up Grupo Alfa', 'Alta', '14:15', 'Carla'],
                ['Reunião Rede Mais', 'Baixa', '16:00', 'Ana'],
              ].map(([titulo, prio, hora, resp]) => (
                <div key={titulo} className="linha">
                  <span>{titulo}</span>
                  <em className={prio === 'Alta' ? 'laranja' : 'azul'}>{prio}</em>
                  <span>{hora}</span>
                  <span>{resp}</span>
                </div>
              ))}
            </div>
          </div>
          <h3>Tarefas e agenda</h3>
          <p>Cada ligação, e-mail e reunião vira tarefa com responsável, prazo e prioridade.</p>
        </div>
      </div>
    </section>
  )
}

function ComoFunciona() {
  const [ativo, setAtivo] = useState(0)
  const passo = PASSOS[ativo]
  return (
    <section className="site-secao" id="como-funciona">
      <div className="site-titulo">
        <h2>Do formulário ao fechamento</h2>
        <p>Quatro passos, e o sistema faz a parte chata sozinho.</p>
      </div>
      <div className="site-abas">
        {PASSOS.map((p, i) => (
          <button key={p.aba} className={i === ativo ? 'ativa' : ''} onClick={() => setAtivo(i)}>
            {p.aba}
          </button>
        ))}
      </div>
      <div className="site-passo">
        <div className="site-passo-texto">
          <small>Passo {ativo + 1}</small>
          <h3>{passo.titulo}</h3>
          <p>{passo.texto}</p>
          <Link to="/login" className="site-btn escuro">
            Começar agora
          </Link>
        </div>
        <div className="site-fluxo">
          <div className="no gatilho">
            <small>
              <BellOutlined /> Gatilho
            </small>
            <span>Novo interessado</span>
          </div>
          <div className="no validar">
            <small>
              <CheckCircleFilled /> Validar
            </small>
            <span>Telefone e aceite LGPD</span>
          </div>
          <div className="no acao a1">
            <small>Ação</small>
            <span>Enviar para a Vonix</span>
          </div>
          <div className="no acao a2">
            <small>Ação</small>
            <span>Criar tarefa de contato</span>
          </div>
          <div className="no acao a3">
            <small>Ação</small>
            <span>Converter em oportunidade</span>
          </div>
          <div className="no ia">
            <small>
              <DatabaseOutlined /> Registro
            </small>
            <span>Status da ligação no CRM</span>
          </div>
          <svg className="site-fluxo-linhas" viewBox="0 0 400 300" preserveAspectRatio="none">
            <path d="M80 50 V110 M80 150 V250 M80 130 H200 M200 70 V230 M200 70 H260 M200 150 H260 M200 230 H260" />
          </svg>
        </div>
      </div>
    </section>
  )
}

function Casos() {
  return (
    <section className="site-secao">
      <div className="site-titulo esquerda">
        <h2>
          Veja como o Córtex
          <br />
          resolve o dia a dia do inbound.
        </h2>
      </div>
      <div className="site-casos">
        {CASOS.map((c) => (
          <div key={c.titulo} className="site-caso">
            <div className="site-caso-ilustra">{c.icone}</div>
            <h3>{c.titulo}</h3>
            <p>{c.texto}</p>
            <a href="#planos">
              Saiba mais <span><ArrowRightOutlined /></span>
            </a>
          </div>
        ))}
      </div>
    </section>
  )
}

function Integracoes() {
  return (
    <section className="site-secao">
      <div className="site-titulo">
        <h2>Tudo conectado num lugar só</h2>
        <p>Formulário, discadora, funil e painel conversando entre si, sem copiar e colar.</p>
      </div>
      <div className="site-integra">
        <span className="anel r1" />
        <span className="anel r2" />
        <span className="anel r3" />
        <img className="site-app-icone grande" src="/logo-cortex.png" alt="" />
        {MARCAS_ORBITA.slice(0, 6).map((logo, i) => (
          <span key={logo.id} className={`site-integra-icone i${i + 1}`} title={logo.nome}>
            <LogoMarca logo={logo} />
          </span>
        ))}
      </div>
    </section>
  )
}

function Planos() {
  const [anual, setAnual] = useState(false)
  return (
    <section className="site-secao" id="planos">
      <div className="site-titulo">
        <h2>Planos simples, sem surpresa</h2>
        <p>Cada plano libera um conjunto de funcionalidades. Mude quando quiser.</p>
      </div>
      <div className="site-toggle">
        <button className={!anual ? 'ativo' : ''} onClick={() => setAnual(false)}>
          Mensal
        </button>
        <button className={anual ? 'ativo' : ''} onClick={() => setAnual(true)}>
          Anual
        </button>
      </div>
      <div className="site-planos">
        {PLANOS.map((p) => (
          <div key={p.nome} className={`site-plano ${p.destaque ? 'destaque vidro' : ''}`}>
            <div className="nome">
              {p.icone} {p.nome}
            </div>
            <p>{p.descricao}</p>
            <div className="preco">
              <strong>R$ {anual ? Math.round(p.mensal * 0.8) : p.mensal}</strong>
              <small>/usuário/mês</small>
            </div>
            <ul>
              {p.itens.map((item) => (
                <li key={item}>
                  <CheckCircleFilled /> {item}
                </li>
              ))}
            </ul>
            <Link to="/login" className={`site-btn ${p.destaque ? 'escuro' : 'claro'} cheio`}>
              Começar agora
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

const PERGUNTAS = [
  {
    pergunta: 'O que é speed-to-lead e por que ele importa?',
    resposta:
      'É o tempo entre o lead pedir contato e alguém do seu time falar com ele. No inbound, cada minuto de espera derruba a chance de conversão, porque o lead esfria e procura o concorrente. O Córtex liga em segundos, enquanto ele ainda está com o seu site aberto.',
  },
  {
    pergunta: 'Como o lead chega no Córtex?',
    resposta:
      'Pela Área do Cliente: um formulário público, com aceite LGPD, onde a pessoa deixa nome, telefone, empresa e os produtos de interesse. O interesse aparece na hora na tela de Interessados e pode virar oportunidade no funil com um clique.',
  },
  {
    pergunta: 'Como funciona a ligação automática?',
    resposta:
      'Assim que o formulário é enviado, o número vai para a fila da discadora (hoje integrada com a Vonix). O primeiro SDR livre recebe a chamada e o resultado (atendido, não atendido, caixa postal) volta para o CRM, com data e número de tentativas.',
  },
  {
    pergunta: 'Preciso ter closer no time?',
    resposta:
      'Não. O Córtex foi pensado para gestor comercial e pré-vendas. Se a sua operação tem closer, ele entra como mais um perfil e toca a negociação e a proposta dentro do mesmo funil.',
  },
  {
    pergunta: 'Quem pode ver e mexer em cada coisa?',
    resposta:
      'Cada usuário tem um perfil (administrador, gerente ou vendedor) e cada perfil libera só as telas e ações certas. O acesso é por login com token, e o gestor controla quem entra e quem é desativado.',
  },
]

function Faq() {
  const [aberta, setAberta] = useState(0)
  return (
    <section className="site-secao site-faq" id="faq">
      <div className="site-titulo">
        <h2>Perguntas frequentes</h2>
        <p>O que todo gestor pergunta antes de colocar o Córtex na operação.</p>
      </div>
      <div className="site-faq-lista">
        {PERGUNTAS.map((item, i) => (
          <div key={item.pergunta} className={`site-faq-item ${aberta === i ? 'aberta' : ''}`}>
            <button onClick={() => setAberta(aberta === i ? -1 : i)} aria-expanded={aberta === i}>
              {item.pergunta}
              <DownOutlined />
            </button>
            <div className="site-faq-resposta">
              <p>{item.resposta}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function Rodape() {
  const colunas = [
    { titulo: 'Produto', links: ['Recursos', 'Discadora', 'Painel', 'Planos'] },
    { titulo: 'Recursos', links: ['Documentação', 'API', 'Área do Cliente', 'Suporte'] },
    { titulo: 'Projeto', links: ['Sobre o Córtex', 'Equipe', 'GitHub', 'Contato'] },
  ]
  return (
    <footer className="site-rodape">
      <div className="site-rodape-topo">
        <img className="site-app-icone" src="/logo-cortex.png" alt="" />
        <span className="site-wordmark">córtex</span>
      </div>
      <div className="site-rodape-links">
        <div className="sobre">
          <p>O CRM de inbound para times de pré-vendas. Responda antes, venda mais rápido.</p>
          <div className="redes">
            <InstagramOutlined />
            <LinkedinOutlined />
            <GithubOutlined />
          </div>
        </div>
        {colunas.map((col) => (
          <div key={col.titulo}>
            <strong>{col.titulo}</strong>
            {col.links.map((link) => (
              <a key={link} href="#recursos">
                {link}
              </a>
            ))}
          </div>
        ))}
      </div>
      <small>© 2026 Córtex · Projetos Integrados II · UNIUBE</small>
    </footer>
  )
}

// Revela cada seção com fade-up quando ela entra na tela.
function useRevelarAoRolar(ref) {
  useEffect(() => {
    const alvos = ref.current.querySelectorAll('.site-secao')
    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('visivel')
            observador.unobserve(entrada.target)
          }
        })
      },
      { threshold: 0.12 },
    )
    alvos.forEach((alvo) => {
      alvo.classList.add('revelar')
      observador.observe(alvo)
    })
    return () => observador.disconnect()
  }, [ref])
}

export default function Site() {
  const raiz = useRef(null)
  useRevelarAoRolar(raiz)

  return (
    <div className="site" ref={raiz}>
      <header className="site-menu">
        <Logo />
        <nav>
          {LINKS_MENU.map((l) => (
            <a key={l.href} href={l.href}>
              {l.rotulo}
            </a>
          ))}
        </nav>
      </header>

      <section className="site-hero">
        <Orbita />
        <Hero />
      </section>

      <DemoIntegracao />

      <SiteTriptico />

      <Bento />
      <ComoFunciona />
      <Casos />
      <Integracoes />
      <Planos />

      <Faq />

      <Rodape />
    </div>
  )
}
