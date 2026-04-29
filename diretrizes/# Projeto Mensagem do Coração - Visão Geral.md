# Projeto: Mensagem do Coração

## 1. Visão Geral
Plataforma web para personalização de presentes (cestas de Dia das Mães), permitindo que compradores (presenteadores) façam upload de mídia e mensagens, que serão visualizadas pelas mães (presenteadas) através de um QR Code único.

## 2. Stack Técnica
- **Framework:** Next.js 14+ (App Router)
- **Estilização:** Tailwind CSS + Shadcn/UI
- **Backend/BaaS:** Supabase (Database, Auth, Storage)
- **Linguagem:** TypeScript
- **IA:** Integração Client-side com OpenAI/Anthropic
- **Deploy:** Vercel

## 3. Fluxo de Acesso
1.  **Presenteador:** Acessa via `Código Único` (Ex: MAE-2025-XXXX). Possui limite de acessos ao painel de edição.
2.  **Presenteada:** Acessa via `URL de Token` (QR Code). Visualização pública, porém depende de aprovação do administrador.
3.  **Admin:** Acessa via Login (Email/Senha). Gerencia cestas e modera conteúdos.

## 4. Diretrizes de Código (PT-BR)
- **Nomenclatura:** Variáveis, funções e comentários devem ser escritos em **Português (Brasil)**.
- **Padrão de Variáveis:** `camelCase` (ex: `cestaId`, `mensagemTexto`).
- **Padrão de Constantes:** `SNAKE_UPPER_CASE` (ex: `LIMITE_ACESSO_MAXIMO`).