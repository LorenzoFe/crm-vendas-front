# crm-vendas-front
Front-end do CRM de Vendas (React + Vite + Ant Design).
A API fica no repositório [crm-vendas-receptivo](https://github.com/LorenzoFe/crm-vendas-receptivo).

## Requisitos
- Node.js 18 ou mais novo (exigência do Vite 5)
- A API rodando (local: `http://localhost:8080`)

## Rodando
```bash
npm install
npm run dev
```
Abre em http://localhost:5173. Login local padrão da API: `admin@crm.com` / `senha123`.

No Windows, se o PowerShell bloquear o `npm` ("execução de scripts foi desabilitada"), use `npm.cmd install` e `npm.cmd run dev`.

A porta precisa ser a **5173**: a API só aceita chamadas (CORS) de `http://localhost:5173` e `http://localhost:3000`.

## Endereço da API
| Arquivo | Quando vale | Valor |
|---|---|---|
| `.env.development` | `npm run dev` | `VITE_API_URL=http://localhost:8080` |
| `.env.production` | `npm run build` | API publicada no Render |

## Telas
| Rota | Acesso | Tela |
|---|---|---|
| `/area-cliente` | **pública** | Área do Cliente: apresentação, escolha de produtos e formulário de interesse (telefone obrigatório, aceite LGPD) |
| `/login` | pública | Login |
| `/` | logado | Funil de vendas (Kanban) |
| `/painel` | logado | Painel com indicadores |
| `/oportunidades` e `/oportunidades/:id` | logado | Oportunidades, itens, propostas e histórico |
| `/interessados` | `ver_oportunidade` | Interesses da Área do Cliente: converter, descartar e situação no discador (Vonix) |
| `/tarefas`, `/empresas`, `/contatos`, `/produtos` | logado | Cadastros |
| `/config/usuarios` | `gerenciar_usuarios` | Usuários e perfis |

## Discador
Na tela de Interessados, a coluna **Discador** mostra a situação de cada interesse na fila da Vonix
(aguardando envio, na fila, atendido, caixa postal, não atendido, erro, sem telefone, removido).
No detalhe aparecem as datas, as tentativas e o botão **Reenviar à fila** (só quando faz sentido).
**Reenviar faz a Vonix ligar de verdade** para o telefone do interesse.

A configuração do discador fica toda na API (veja o README do crm-vendas-receptivo).

## Organização
```
src/
  api/client.js        axios: api (com token) e apiPublica (Área do Cliente, sem token)
  auth/                sessão, login e rotas protegidas
  layout/AppLayout.jsx menu lateral
  pages/               uma tela por arquivo
  hooks/               listas paginadas e opções de selects
  utils/               formatação (moeda, CNPJ, máscara de telefone) e rótulos de status
```
