# Diretrizes para Agentes de IA

## 1. Padrões de Código
- Utilize `TypeScript` estrito para evitar erros de tipo.
- Comentários de código devem explicar o "porquê" e não o "como", em PT-BR.
- Exemplo de variável: `const listaDeImagensParaUpload = [];`

## 2. Segurança de Dados
- **Moderação:** Nenhuma mensagem deve ser exibida na rota `/mensagem` sem que `esta_aprovado` seja true no Supabase.
- **Validação de Código:** Ao entrar no `/painel`, verificar via RPC ou Server Action se o `codigo_unico` é válido e incrementar o `contagem_acessos`.

## 3. Manipulação de Mídia
- Implementar compressão de imagem no client-side antes do upload.
- Limitar upload de vídeo a 100MB.
- Utilizar a `Web Audio API` para gravação direta, convertendo para `blob` antes do upload para o Storage.

## 4. Geração de QR Code
- No painel administrativo, usar a biblioteca `qr-code-styling` para gerar códigos que incluam a identidade visual (cores da marca).
- A URL do QR Code deve ser absoluta: `https://dominio.com/mensagem/${token_qr}`.