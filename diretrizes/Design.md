Design Doc: Mensagem do Coração
Autor: Equipe de Engenharia de Software

Status: Revisão Inicial

Data: 21 de abril de 2026

1. Contexto e Objetivos
O projeto visa criar uma experiência digital para o Dia das Mães, onde um comprador (Presenteador) personaliza uma mensagem multimídia vinculada a uma cesta física. A Presenteada acessa o conteúdo via QR Code.

Objetivos Principais
Simplicidade de Acesso: A presenteada não deve precisar de login para ver sua surpresa.

Segurança e Privacidade: Garantir que a chave de API da IA do usuário permaneça privada e que as mensagens passem por moderação antes da publicação.

Experiência Emocional: Interface focada em dispositivos móveis com animações suaves e design elegante.

2. Design Proposto
2.1 Visão Geral da Arquitetura
Utilizaremos uma arquitetura Serverless baseada em Next.js e Supabase. O estado da aplicação será dividido entre o banco de dados relacional (PostgreSQL) e o armazenamento de objetos (S3-compatible Storage).

2.2 Componentes do Sistema
Camada de Aplicação (Next.js):

App Router para roteamento e Server Components para busca de dados eficiente.

Client Components para captura de mídia (áudio/vídeo) e integração com APIs de IA.

Camada de Dados (Supabase):

PostgreSQL para metadados e logs.

Storage para arquivos pesados.

Real-time (opcional) para status de aprovação de mensagens.

2.3 Modelo de Dados (Variáveis em PT-BR)


// Exemplo de interface para a tabela de Cestas
interface Cesta {
  id: string;
  codigo_unico: string;      // Acesso do comprador
  token_qr: string;          // Identificador público
  limite_de_acessos: number;
  total_acessos_atuais: number;
  status_cesta: 'ativo' | 'bloqueado';
}

// Exemplo de interface para Mensagens
interface MensagemConteudo {
  id_cesta: string;
  texto_bruto: string;
  texto_formatado_ia: string;
  lista_imagens_url: string[];
  audio_url?: string;
  video_url?: string;
  aprovacao_pendente: boolean;
}


3. Detalhes de Implementação
3.1 Fluxo de IA (Privacidade da Chave)
Para evitar custos de servidor e garantir a privacidade, a integração com OpenAI/Anthropic ocorrerá estritamente no lado do cliente:

O usuário insere sua chave no navegador.

A chave é salva em sessionStorage.

A requisição é feita diretamente do navegador para os endpoints da OpenAI/Anthropic.

O resultado (texto formatado) é enviado ao nosso backend para armazenamento.

3.2 Estratégia de Mídia
Imagens: Serão processadas para geração de thumbnails e otimização de carregamento.

Áudio: Capturado via MediaRecorder API, salvo como .webm ou .wav e enviado ao bucket audios.

4. Alternativas Consideradas
Alternativa A: Proxy de IA no Backend. * Prós: Melhor controle de erros.

Contras: Exporia a chave do usuário ao nosso servidor e aumentaria a latência/custo. Descartado em favor da privacidade do usuário.

Alternativa B: Autenticação via Email para Presenteadores.

Prós: Mais seguro a longo prazo.

Contras: Fricção excessiva para um produto sazonal. O uso de codigo_unico (voucher) é mais intuitivo para quem compra cestas físicas. Escolhido.

5. Segurança e Privacidade
Row Level Security (RLS): Implementaremos políticas no Supabase onde apenas o administrador autenticado pode ler os logs de IP e deletar cestas.

Proteção contra Brute Force: O sistema deve bloquear temporariamente tentativas excessivas de acesso baseadas no mesmo IP para o campo codigo_unico.

Moderação Manual: O status aprovacao_pendente será true por padrão. Nenhuma mensagem será servida na rota pública sem o "de acordo" do administrador.

6. Plano de Testes
Testes de Integração: Validar se o upload de 100MB de vídeo não quebra a conexão no Vercel (limites de timeout).

Teste de UX: Garantir que o player de áudio funcione corretamente em navegadores mobile (iOS Safari/Chrome Android).

Validação de Negócio: Garantir que após o total_acessos_atuais atingir o limite_de_acessos, o presenteador não consiga mais editar a mensagem.