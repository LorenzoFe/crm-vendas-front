import { useEffect, useState } from 'react'
import { Alert, Button, Checkbox, Form, Input, Modal, Result, Select } from 'antd'
import { apiPublica, mensagemDeErro } from '../api/client'
import { mascararTelefone, somenteNumeros, telefoneCompleto, vazioParaNulo } from '../utils/formatar'

// Pop-up de contato aberto pelos botões dos planos. O plano vem do botão clicado e vai junto
// no envio sem aparecer no formulário. Usa o mesmo endpoint público da Área do Cliente, então
// o lead cai em Interessados e segue para a discadora.

const FAIXAS_FATURAMENTO = [
  'Até R$ 50 mil/mês',
  'R$ 50 mil a R$ 200 mil/mês',
  'R$ 200 mil a R$ 500 mil/mês',
  'R$ 500 mil a R$ 1 milhão/mês',
  'Acima de R$ 1 milhão/mês',
]

// A API exige ao menos um produto: usa o produto com o nome do plano, ou o primeiro ativo.
function produtoDoPlano(produtos, plano) {
  const alvo = plano.toLowerCase()
  const doPlano = produtos.find((p) => p.nome?.toLowerCase().includes(alvo))
  return (doPlano ?? produtos[0])?.id
}

export default function SiteFormPlano({ plano, aberto, aoFechar }) {
  const [form] = Form.useForm()
  const [produtos, setProdutos] = useState([])
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState(null)
  const [enviado, setEnviado] = useState(false)

  useEffect(() => {
    if (!aberto || produtos.length) return
    apiPublica
      .get('/publico/produtos')
      .then(({ data }) => setProdutos(data))
      .catch(() => setProdutos([]))
  }, [aberto, produtos.length])

  function fechar() {
    aoFechar()
    setErro(null)
    if (enviado) {
      form.resetFields()
      setEnviado(false)
    }
  }

  async function enviar(valores) {
    const produtoId = produtoDoPlano(produtos, plano)
    if (!produtoId) {
      setErro('Não foi possível carregar os planos agora. Tente novamente em instantes.')
      return
    }
    setEnviando(true)
    setErro(null)
    try {
      const corpo = vazioParaNulo({
        nome: valores.nome,
        email: valores.email,
        telefone: somenteNumeros(valores.telefone),
        empresaNome: valores.empresaNome,
        tamanhoEmpresa: valores.faturamento,
        preferenciaContato: 'TELEFONE',
        mensagem: `Plano: ${plano} · Faturamento: ${valores.faturamento}`,
        produtoIds: [produtoId],
        consentimento: valores.consentimento,
      })
      await apiPublica.post('/publico/interesses', corpo)
      setEnviado(true)
    } catch (e) {
      setErro(mensagemDeErro(e))
    } finally {
      setEnviando(false)
    }
  }

  return (
    <Modal open={aberto} onCancel={fechar} footer={null} width={480} className="site-modal">
      {enviado ? (
        <Result
          status="success"
          title="Recebemos seus dados!"
          subTitle="Fique com o telefone por perto: um especialista vai te ligar em instantes."
          extra={<Button onClick={fechar}>Fechar</Button>}
        />
      ) : (
        <>
          <div className="site-modal-topo">
            <h3>Fale com um especialista</h3>
            <p>Deixe seus dados e a gente te liga em segundos.</p>
          </div>

          {erro && <Alert type="error" message={erro} showIcon style={{ marginBottom: 16 }} />}

          <Form form={form} layout="vertical" onFinish={enviar} requiredMark={false}>
            <Form.Item name="nome" label="Nome" rules={[{ required: true, message: 'Informe seu nome' }]}>
              <Input placeholder="Seu nome" autoComplete="name" />
            </Form.Item>
            <Form.Item
              name="telefone"
              label="Telefone"
              getValueFromEvent={(e) => mascararTelefone(e.target.value)}
              rules={[
                { required: true, message: 'Informe seu telefone' },
                {
                  validator: (_, valor) =>
                    !valor || telefoneCompleto(valor)
                      ? Promise.resolve()
                      : Promise.reject(new Error('Telefone com DDD, ex.: (34) 99999-9999')),
                },
              ]}
            >
              <Input placeholder="(34) 99999-9999" inputMode="tel" autoComplete="tel" />
            </Form.Item>
            <Form.Item
              name="email"
              label="E-mail"
              rules={[
                { required: true, message: 'Informe seu e-mail' },
                { type: 'email', message: 'E-mail inválido' },
              ]}
            >
              <Input placeholder="voce@empresa.com" autoComplete="email" />
            </Form.Item>
            <Form.Item
              name="empresaNome"
              label="Nome da empresa"
              rules={[{ required: true, message: 'Informe o nome da empresa' }]}
            >
              <Input placeholder="Sua empresa" autoComplete="organization" />
            </Form.Item>
            <Form.Item
              name="faturamento"
              label="Faixa de faturamento"
              rules={[{ required: true, message: 'Escolha a faixa de faturamento' }]}
            >
              <Select placeholder="Selecione" options={FAIXAS_FATURAMENTO.map((f) => ({ value: f, label: f }))} />
            </Form.Item>
            <Form.Item
              name="consentimento"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, marcado) =>
                    marcado ? Promise.resolve() : Promise.reject(new Error('É preciso autorizar o contato')),
                },
              ]}
            >
              <Checkbox>Autorizo o contato por telefone e e-mail (LGPD).</Checkbox>
            </Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={enviando}>
              Quero ser contatado
            </Button>
          </Form>
        </>
      )}
    </Modal>
  )
}
