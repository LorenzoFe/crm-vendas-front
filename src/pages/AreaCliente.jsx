import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, Card, Checkbox, Col, Divider, Form, Input, Radio, Result, Row, Select, Typography } from 'antd'
import { BarChartOutlined, FunnelPlotOutlined, SafetyCertificateOutlined, SendOutlined, TeamOutlined } from '@ant-design/icons'
import { apiPublica, mensagemDeErro } from '../api/client'
import { mascararTelefone, somenteNumeros, telefoneCompleto, vazioParaNulo } from '../utils/formatar'
import { PREFERENCIA_CONTATO, TAMANHOS_EMPRESA, opcoesDe } from '../utils/rotulos'

const VANTAGENS = [
  { icone: <FunnelPlotOutlined />, titulo: 'Funil de vendas visual', texto: 'Acompanhe cada negociação da prospecção ao fechamento, com quadro Kanban.' },
  { icone: <TeamOutlined />, titulo: 'Clientes organizados', texto: 'Empresas, contatos, interações, tarefas e notas em um só lugar.' },
  { icone: <BarChartOutlined />, titulo: 'Propostas e resultados', texto: 'Gere propostas a partir das oportunidades e acompanhe a performance da equipe.' },
]

export default function AreaCliente() {
  const [form] = Form.useForm()
  const [produtos, setProdutos] = useState([])
  const [erroProdutos, setErroProdutos] = useState(null)
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    apiPublica
      .get('/publico/produtos')
      .then(({ data }) => setProdutos(data))
      .catch((e) => setErroProdutos(mensagemDeErro(e)))
  }, [])

  async function enviar(valores) {
    setEnviando(true)
    setErro(null)
    try {
      // O lead não escolhe produto: o interesse vai com o plano padrão (a API exige um produto).
      const padrao = produtos.find((p) => p.nome?.toLowerCase().includes('essencial')) ?? produtos[0]
      if (!padrao) {
        setErro(erroProdutos ?? 'Não foi possível enviar agora. Tente novamente em instantes.')
        return
      }
      const corpo = vazioParaNulo({
        ...valores,
        produtoIds: [padrao.id],
        telefone: somenteNumeros(valores.telefone),
        cnpj: somenteNumeros(valores.cnpj),
      })
      await apiPublica.post('/publico/interesses', corpo)
      setEnviado(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  function novoEnvio() {
    form.resetFields()
    setEnviado(false)
  }

  return (
    <div className="area-cliente">
      <header className="area-cliente-topo">
        <span className="area-cliente-marca">
          <img src="/logo-cortex.webp" alt="" /> Córtex
        </span>
        <Link to="/login">Já é da equipe? Entrar</Link>
      </header>

      <section className="area-cliente-hero">
        <Typography.Title level={1} className="area-cliente-hero-titulo">
          Venda mais com um CRM feito para a sua equipe
        </Typography.Title>
        <Typography.Paragraph className="area-cliente-hero-texto">
          Conte para nós o que a sua empresa precisa. Nossa equipe comercial entra em contato
          para apresentar a melhor opção.
        </Typography.Paragraph>
        <Button type="primary" size="large" href="#formulario-interesse">
          Quero conhecer
        </Button>
      </section>

      <main className="area-cliente-conteudo">
        <Row gutter={[16, 16]}>
          {VANTAGENS.map((v) => (
            <Col xs={24} md={8} key={v.titulo}>
              <Card className="area-cliente-vantagem">
                <div className="area-cliente-vantagem-icone">{v.icone}</div>
                <Typography.Title level={5}>{v.titulo}</Typography.Title>
                <Typography.Text type="secondary">{v.texto}</Typography.Text>
              </Card>
            </Col>
          ))}
        </Row>

        <Card id="formulario-interesse" className="area-cliente-formulario">
          {enviado ? (
            <Result
              status="success"
              title="Recebemos o seu interesse!"
              subTitle="Obrigado pelo contato. Nossa equipe comercial vai analisar e falar com você em breve."
              extra={<Button onClick={novoEnvio}>Enviar outro interesse</Button>}
            />
          ) : (
            <>
              <Typography.Title level={3} style={{ marginTop: 0 }}>
                Tenho interesse
              </Typography.Title>
              <Typography.Paragraph type="secondary">Preencha os dados abaixo. Os campos com * são obrigatórios.</Typography.Paragraph>

              {erro && <Alert type="error" message={erro} showIcon closable onClose={() => setErro(null)} style={{ marginBottom: 16 }} />}

              <Form form={form} layout="vertical" onFinish={enviar} initialValues={{ preferenciaContato: 'EMAIL' }} scrollToFirstError>
                <Divider orientation="left">1. Sobre você</Divider>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="nome" label="Nome completo" rules={[{ required: true, whitespace: true, message: 'Informe seu nome' }]}>
                      <Input maxLength={255} autoComplete="name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="E-mail"
                      rules={[
                        { required: true, message: 'Informe seu e-mail' },
                        { type: 'email', message: 'E-mail inválido' },
                      ]}
                    >
                      <Input maxLength={255} autoComplete="email" placeholder="voce@empresa.com" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="telefone"
                      label="Telefone / WhatsApp"
                      tooltip="Nossa equipe comercial liga para este número"
                      normalize={mascararTelefone}
                      rules={[
                        { required: true, message: 'Informe um telefone para contato' },
                        {
                          validator: (_, v) =>
                            !v || telefoneCompleto(v) ? Promise.resolve() : Promise.reject(new Error('Informe DDD + número completo')),
                        },
                      ]}
                    >
                      <Input maxLength={16} inputMode="tel" autoComplete="tel" placeholder="(11) 9 9999-8888" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="cargo" label="Cargo">
                      <Input maxLength={100} placeholder="Ex.: Gerente comercial" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">2. Sua empresa</Divider>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="empresaNome" label="Nome / razão social" rules={[{ required: true, whitespace: true, message: 'Informe o nome da empresa' }]}>
                      <Input maxLength={255} autoComplete="organization" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="cnpj" label="CNPJ" normalize={somenteNumeros} rules={[{ pattern: /^\d{14}$/, message: 'CNPJ com 14 dígitos' }]}>
                      <Input maxLength={18} placeholder="00.000.000/0000-00 (opcional)" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="segmento" label="Segmento">
                      <Input maxLength={100} placeholder="Ex.: Varejo, Indústria" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="tamanhoEmpresa" label="Tamanho">
                      <Select allowClear options={TAMANHOS_EMPRESA.map((t) => ({ value: t, label: t }))} placeholder="Selecione" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={8}>
                    <Form.Item name="site" label="Site">
                      <Input maxLength={255} placeholder="www.suaempresa.com.br" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">3. Como podemos ajudar</Divider>
                <Form.Item name="preferenciaContato" label="Prefiro ser contatado por">
                  <Radio.Group options={opcoesDe(PREFERENCIA_CONTATO)} optionType="button" />
                </Form.Item>
                <Form.Item name="mensagem" label="Conte um pouco sobre a sua necessidade">
                  <Input.TextArea rows={4} maxLength={2000} showCount placeholder="Ex.: somos 8 vendedores e hoje controlamos tudo em planilha..." />
                </Form.Item>

                <div className="campo-isca" aria-hidden="true">
                  <Form.Item name="paginaPessoal" label="Página pessoal">
                    <Input tabIndex={-1} autoComplete="off" />
                  </Form.Item>
                </div>

                <Form.Item
                  name="consentimento"
                  valuePropName="checked"
                  rules={[{ validator: (_, v) => (v ? Promise.resolve() : Promise.reject(new Error('É preciso autorizar o contato'))) }]}
                >
                  <Checkbox>
                    <SafetyCertificateOutlined /> Autorizo o contato da equipe comercial e o uso destes dados para essa finalidade, conforme a LGPD. *
                  </Checkbox>
                </Form.Item>

                <Button type="primary" htmlType="submit" size="large" icon={<SendOutlined />} loading={enviando} disabled={produtos.length === 0}>
                  Enviar interesse
                </Button>
              </Form>
            </>
          )}
        </Card>
      </main>

      <footer className="area-cliente-rodape">Córtex · CRM de inbound</footer>
    </div>
  )
}
