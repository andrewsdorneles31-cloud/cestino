# Frontend e Experiência do Usuário

## 1. Design System
- **Paleta de Cores:** - Primária: `#8B0000` (Vinho)
  - Secundária: `#FFC0CB` (Rosa claro)
  - Destaque: `#D4AF37` (Dourado)
  - Fundo: `#FFFFFF` (Branco)
- **Tipografia:** Playfair Display (Títulos) e Lato (Corpo).

## 2. Rotas Principais
- `/`: Home com input do `Código Único`.
- `/painel`: Editor do presenteador (Uploads, IA, Texto).
- `/mensagem/[token_qr]`: Visualização da presenteada (Design emocional).
- `/admin`: Dashboard de controle (Protegido por Supabase Auth).

## 3. Lógica do Assistente de IA
O componente de IA deve seguir estas regras:
1.  Solicitar a chave da API (OpenAI ou Anthropic) ao usuário.
2.  Armazenar em `sessionStorage.setItem('chave_ia', valor)`.
3.  **Proibido:** Enviar esta chave para qualquer banco de dados ou log do servidor.
4.  Realizar a chamada diretamente do cliente (browser) para a API da IA.
5.  Prompt do Sistema: *"Você é um assistente especialista em mensagens afetivas... [ver detalhes no prompt original]"*.

## 4. Animações
Utilizar `framer-motion` para:
- Efeito de pétalas ou corações caindo na página da presenteada.
- Transições suaves entre as seções do formulário no painel.