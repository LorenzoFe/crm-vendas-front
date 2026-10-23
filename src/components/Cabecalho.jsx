import { Space, Typography } from 'antd'

export default function Cabecalho({ titulo, acoes }) {
  return (
    <div className="pagina-cabecalho">
      <Typography.Title level={3} style={{ margin: 0 }}>
        {titulo}
      </Typography.Title>
      <Space>{acoes}</Space>
    </div>
  )
}
