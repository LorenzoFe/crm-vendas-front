import { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { App, Col, DatePicker, Form, Input, InputNumber, Modal, Row, Select } from 'antd'
import { api, mensagemDeErro } from '../api/client'
import { useAuth } from '../auth/AuthContext'
import { useOpcoesContatos, useOpcoesEmpresas, useOpcoesEstagios, useOpcoesUsuarios } from '../hooks/useOpcoes'
import { vazioParaNulo } from '../utils/formatar'

export default function FormOportunidade({ aberto, oportunidade, onFechar, onSalvo }) {
  const { message } = App.useApp()
  const { usuario } = useAuth()
  const [form] = Form.useForm()
  const [salvando, setSalvando] = useState(false)
  const empresaId = Form.useWatch('empresaId', form)
  const empresas = useOpcoesEmpresas()
  const contatos = useOpcoesContatos(empresaId)
  const estagios = useOpcoesEstagios()
  const { opcoes: vendedores } = useOpcoesUsuarios()

  useEffect(() => {
    if (!aberto) return
    form.resetFields()
    if (oportunidade) {
      form.setFieldsValue({
        ...oportunidade,
        dataFechamentoEsperada: oportunidade.dataFechamentoEsperada ? dayjs(oportunidade.dataFechamentoEsperada) : null,
      })
    } else {
      form.setFieldsValue({ vendedorId: usuario?.id })
    }
  }, [aberto, oportunidade, form, usuario])

  async function salvar(valores) {
    setSalvando(true)
    try {
      const corpo = vazioParaNulo({
        ...valores,
        dataFechamentoEsperada: valores.dataFechamentoEsperada ? valores.dataFechamentoEsperada.format('YYYY-MM-DD') : null,
      })
      const { data } = oportunidade
        ? await api.put(`/oportunidades/${oportunidade.id}`, corpo)
        : await api.post('/oportunidades', corpo)
      message.success(oportunidade ? 'Oportunidade atualizada' : 'Oportunidade criada')
      onSalvo(data)
    } catch (e) {
      message.error(mensagemDeErro(e))
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Modal
      title={oportunidade ? 'Editar oportunidade' : 'Nova oportunidade'}
      open={aberto}
      onCancel={onFechar}
      onOk={() => form.submit()}
      okText="Salvar"
      cancelText="Cancelar"
      confirmLoading={salvando}
      width={640}
      forceRender
    >
      <Form form={form} layout="vertical" onFinish={salvar}>
        <Form.Item name="titulo" label="Título" rules={[{ required: true, message: 'Informe o título' }]}>
          <Input maxLength={255} placeholder="Ex.: Licença anual - Acme" />
        </Form.Item>
        <Row gutter={16}>
          <Col xs={24} sm={12}>
            <Form.Item name="empresaId" label="Empresa" rules={[{ required: true, message: 'Escolha a empresa' }]}>
              <Select
                options={empresas}
                showSearch
                optionFilterProp="label"
                placeholder="Selecione"
                onChange={() => form.setFieldValue('contatoId', null)}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="contatoId" label="Contato">
              <Select options={contatos} allowClear showSearch optionFilterProp="label" placeholder={empresaId ? 'Selecione' : 'Escolha a empresa antes'} disabled={!empresaId} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="valorEstimado" label="Valor estimado">
              <InputNumber min={0} precision={2} prefix="R$" decimalSeparator="," style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="dataFechamentoEsperada" label="Previsão de fechamento">
              <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="vendedorId" label="Vendedor" rules={[{ required: true, message: 'Escolha o vendedor' }]}>
              <Select options={vendedores} showSearch optionFilterProp="label" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item name="estagioId" label="Estágio" tooltip="Se não escolher, começa no primeiro estágio do funil">
              <Select options={estagios.map((e) => ({ value: e.id, label: e.nome }))} allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name="descricao" label="Descrição">
          <Input.TextArea rows={3} />
        </Form.Item>
      </Form>
    </Modal>
  )
}
