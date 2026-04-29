# Definição de Dados (Supabase)

## 1. Tabelas (Schema)

### Tabela: `cestas` (baskets)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid | Chave primária |
| `codigo_unico` | text | Código de acesso do presenteador (ex: MAE-2025-...) |
| `maximo_acessos` | int4 | Limite de vezes que o painel pode ser aberto |
| `contagem_acessos` | int4 | Contador atual de acessos |
| `token_qr` | text | Token único para a URL da presenteada |
| `status` | text | 'ativo', 'publicado', 'bloqueado' |
| `criado_em` | timestamptz | Data de criação |

### Tabela: `mensagens` (messages)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid | Chave primária |
| `id_cesta` | uuid | FK para `cestas` |
| `texto_mensagem` | text | Conteúdo original do usuário |
| `texto_formatado` | text | Conteúdo refinado pela IA |
| `url_audio` | text | Link do bucket de áudio |
| `url_video` | text | Link do bucket de vídeo |
| `urls_imagens` | jsonb | Array de links das imagens |
| `esta_aprovado` | boolean | Status de moderação (default: false) |
| `atualizado_em` | timestamptz | Data da última alteração |

### Tabela: `logs_acesso` (access_logs)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| `id` | uuid | Chave primária |
| `id_cesta` | uuid | FK para `cestas` |
| `acessado_em` | timestamptz | Timestamp do acesso |
| `endereco_ip` | text | IP do usuário |

## 2. Storage (Buckets)
- `imagens`: Permissões de leitura pública, escrita autenticada/token.
- `audios`: Armazenamento de arquivos `.mp3`, `.wav`.
- `videos`: Armazenamento de arquivos `.mp4`, `.mov`.

## 3. Segurança (RLS)
- As mensagens só podem ser lidas na rota pública se `esta_aprovado` for `true`.
- O acesso ao painel de edição exige validação de `codigo_unico` e `contagem_acessos < maximo_acessos`.