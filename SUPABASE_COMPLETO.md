# DADOS COMPLETOS DO SUPABASE - DESPERTO
**Data de Geração:** 2025-12-20
**Sistema:** Plataforma de Gestão de Agendamentos e Terapias

---

## 📋 ÍNDICE
1. [Informações de Conexão](#informações-de-conexão)
2. [Extensões PostgreSQL](#extensões-postgresql)
3. [Tipos Enumerados (ENUMs)](#tipos-enumerados-enums)
4. [Estrutura das Tabelas](#estrutura-das-tabelas)
5. [Dados Existentes](#dados-existentes)
6. [Funções do Banco de Dados](#funções-do-banco-de-dados)
7. [Políticas RLS (Row Level Security)](#políticas-rls-row-level-security)
8. [Índices](#índices)
9. [Histórico de Migrações](#histórico-de-migrações)
10. [Edge Functions](#edge-functions)

---

## 🔌 INFORMAÇÕES DE CONEXÃO

### URL do Projeto
```
https://scztvsxakexamtsmsrou.supabase.co
```

### Chaves de API
**Anon Key (Pública):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNjenR2c3hha2V4YW10c21zcm91Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MDU4MjAsImV4cCI6MjA3MzE4MTgyMH0.gCyw20IRy1aPculhxndz9lBFpoZJbg1yiQ8gV2qNQpk
```

### Configuração EmailJS
- **Service ID:** service_eqp55ju
- **Template ID:** template_w3awkf1
- **Public Key:** yxdL1IoXHXaC3Q-Cw

---

## 🔧 EXTENSÕES POSTGRESQL

### Extensões Ativas
| Nome | Schema | Versão | Descrição |
|------|--------|--------|-----------|
| **plpgsql** | pg_catalog | 1.0 | PL/pgSQL procedural language |
| **pgcrypto** | extensions | 1.3 | Funções criptográficas |
| **pg_graphql** | graphql | 1.5.11 | Suporte GraphQL |
| **pg_stat_statements** | extensions | 1.11 | Estatísticas de SQL |
| **uuid-ossp** | extensions | 1.1 | Geração de UUIDs |
| **supabase_vault** | vault | 0.3.1 | Extensão Vault do Supabase |

---

## 📊 TIPOS ENUMERADOS (ENUMs)

### user_type
```sql
'client', 'admin', 'therapist'
```

### booking_status
```sql
'pending', 'confirmed', 'completed', 'cancelled'
```

### payment_status
```sql
'pending', 'paid', 'partial', 'overdue', 'refunded'
```

### payment_method
```sql
'card', 'cash', 'paypal', 'mbway', 'multibanco', 'coupon'
```

---

## 🗄️ ESTRUTURA DAS TABELAS

### 1. **users**
Tabela principal de utilizadores do sistema.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | uuid_generate_v4() |
| username | text | UNIQUE, NOT NULL | - |
| email | text | UNIQUE, NOT NULL | - |
| password_hash | text | NOT NULL | - |
| user_type | user_type | NOT NULL | 'client' |
| is_active | boolean | - | true |
| failed_login_attempts | integer | - | 0 |
| lockout_until | timestamptz | NULLABLE | - |
| last_login_ip | text | NULLABLE | - |
| last_login_at | timestamptz | NULLABLE | - |
| phone_number | text | NULLABLE | - |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 9 utilizadores

---

### 2. **user_profiles**
Perfis e informações adicionais dos utilizadores.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | uuid_generate_v4() |
| user_id | uuid | FK → users(id) | - |
| full_name | text | NOT NULL | - |
| phone | text | NULLABLE | - |
| bio | text | NULLABLE | - |
| avatar_url | text | NULLABLE | - |
| specialties | text[] | - | '{}' |
| availability_config | jsonb | - | '{}' |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 9 perfis

---

### 3. **services**
Serviços oferecidos pelos terapeutas.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| name | text | NOT NULL | - |
| description | text | NULLABLE | - |
| duration | integer | NOT NULL | 60 |
| price | numeric(10,2) | NOT NULL | - |
| category | text | - | 'coaching' |
| therapist_id | uuid | FK → users(id) | - |
| is_active | boolean | - | true |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 4 serviços

---

### 4. **bookings**
Agendamentos de consultas.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| client_id | uuid | FK → users(id), NOT NULL | - |
| therapist_id | uuid | FK → users(id), NOT NULL | - |
| service_id | uuid | FK → services(id), NOT NULL | - |
| booking_date | timestamptz | NOT NULL | - |
| status | booking_status | - | 'pending' |
| payment_status | payment_status | - | 'pending' |
| notes | text | NULLABLE | - |
| reminder_sent | boolean | - | false |
| reschedule_request | jsonb | NULLABLE | - |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 agendamentos

---

### 5. **payments**
Registos de pagamentos.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| booking_id | uuid | FK → bookings(id), NOT NULL | - |
| amount | numeric(10,2) | NOT NULL | - |
| method | payment_method | NOT NULL | - |
| status | payment_status | - | 'pending' |
| transaction_id | text | NULLABLE | - |
| invoice_number | text | NULLABLE | - |
| payment_date | timestamptz | - | now() |
| created_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 pagamentos

---

### 6. **therapist_notes**
Notas dos terapeutas sobre clientes.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| therapist_id | uuid | FK → users(id), NOT NULL | - |
| client_id | uuid | FK → users(id), NOT NULL | - |
| title | text | NOT NULL | - |
| content | text | NOT NULL | - |
| is_private | boolean | - | true |
| session_date | timestamptz | NULLABLE | - |
| tags | text[] | - | '{}' |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 notas

---

### 7. **business_settings**
Configurações do negócio.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| key | text | UNIQUE, NOT NULL | - |
| value | jsonb | NOT NULL | - |
| updated_by | uuid | FK → users(id) | - |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 configurações

---

### 8. **coupons**
Sistema de cupões/vouchers.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| code | text | UNIQUE, NOT NULL | - |
| password | text | NOT NULL | - |
| discount_type | text | - | 'percentage' |
| discount_value | numeric(10,2) | NOT NULL | - |
| max_uses | integer | - | 1 |
| used_count | integer | - | 0 |
| valid_from | timestamptz | - | now() |
| valid_until | timestamptz | NULLABLE | - |
| is_active | boolean | - | true |
| created_by | uuid | FK → users(id) | - |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 cupões

---

### 9. **coupon_usages**
Histórico de utilização de cupões.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| coupon_id | uuid | FK → coupons(id), NOT NULL | - |
| booking_id | uuid | FK → bookings(id), NOT NULL | - |
| user_id | uuid | FK → users(id), NOT NULL | - |
| used_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 utilizações

---

### 10. **password_reset_tokens**
Tokens para reset de password.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| user_id | uuid | FK → users(id), NOT NULL | - |
| token_hash | text | NOT NULL | - |
| expires_at | timestamptz | NOT NULL | - |
| used | boolean | - | false |
| created_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 tokens

---

### 11. **two_factor_auth_settings**
Configurações de autenticação de dois fatores.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| user_id | uuid | UNIQUE, FK → users(id), NOT NULL | - |
| enabled | boolean | - | false |
| method | text | - | 'email' |
| phone_number | text | NULLABLE | - |
| backup_codes | text[] | NULLABLE | - |
| created_at | timestamptz | - | now() |
| updated_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 0 configurações

---

### 12. **predefined_security_questions**
Perguntas de segurança predefinidas.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| question_text | text | UNIQUE, NOT NULL | - |
| is_active | boolean | - | true |
| created_at | timestamptz | - | now() |

**RLS:** Ativado ✓
**Registos:** 5 perguntas

---

### 13. **security_questions**
Perguntas de segurança dos utilizadores.

**Colunas:**
| Nome | Tipo | Constraints | Default |
|------|------|-------------|---------|
| id | uuid | PRIMARY KEY | gen_random_uuid() |
| user_id | uuid | FK → users(id), NOT NULL | - |
| question_id | uuid | FK → predefined_security_questions(id), NOT NULL | - |
| answer_hash | text | NOT NULL | - |
| created_at | timestamptz | - | now() |

**Constraints Únicos:** (user_id, question_id)
**RLS:** Ativado ✓
**Registos:** 0 respostas

---

## 💾 DADOS EXISTENTES

### Utilizadores (9 registos)

#### 1. Admin - Desperto
- **ID:** a5098205-19fd-4fd9-93ee-5b308a49dd1a
- **Username:** admin
- **Email:** euestoudesperto@gmail.com
- **Tipo:** admin
- **Nome Completo:** Administrador Desperto
- **Status:** Ativo
- **Último Login:** 2025-12-19 12:21:49 UTC
- **IP:** 78.137.213.85

#### 2. Luis Peres (Terapeuta)
- **ID:** e579ea96-481b-4042-92f5-3babccf4a055
- **Username:** luisperes
- **Email:** luisperes28@gmail.com
- **Tipo:** therapist
- **Nome Completo:** Luis Peres
- **Status:** Ativo
- **Último Login:** 2025-12-19 12:22:47 UTC
- **IP:** 78.137.213.85

#### 3. Christina Loureiro (Terapeuta)
- **ID:** 6875e79a-a31b-4444-9fa6-80ca70ab4f03
- **Username:** christina
- **Email:** csloureiro88@gmail.com
- **Tipo:** therapist
- **Nome Completo:** Christina Loureiro
- **Telefone:** +351 912 345 678
- **Status:** Ativo
- **Bio:** Terapeuta especializada em coaching e desenvolvimento pessoal.
- **Avatar:** /Christina/Christina.jpg
- **Último Login:** 2025-12-19 12:20:22 UTC

#### 4. Cliente Teste
- **ID:** addfbaf8-e422-49d2-a721-335ecfc70471
- **Username:** cliente
- **Email:** cliente@teste.com
- **Tipo:** client
- **Nome Completo:** Cliente Teste
- **Status:** Ativo
- **Último Login:** 2025-10-05 17:29:23 UTC

#### 5. Luis Guerreiro
- **ID:** 019948ea-5db9-4794-b917-ae7086f62da4
- **Username:** luisperes28
- **Email:** luisperes28@msn.com
- **Tipo:** client
- **Nome Completo:** Luis Guerreiro
- **Status:** Ativo
- **Último Login:** 2025-12-19 17:38:34 UTC

#### 6. Marta Peres
- **ID:** 10ef2c06-4344-4317-8897-41c538b9dfb6
- **Username:** mdperes1997
- **Email:** mdperes1997@gmail.com
- **Tipo:** client
- **Nome Completo:** Marta Peres
- **Telefone:** 962249703
- **Status:** Ativo
- **Último Login:** 2025-10-11 19:10:03 UTC

#### 7. Chris
- **ID:** 50d210ee-ae6a-49cd-a80f-7faa97a98f63
- **Username:** csloureiro
- **Email:** csloureiro@live.com.pt
- **Tipo:** client
- **Nome Completo:** Chris
- **Telefone:** 916246110
- **Status:** Ativo

#### 8. Luis Pires
- **ID:** 8e23d295-c7ca-48e5-aa93-5ea490577aeb
- **Username:** lpires074
- **Email:** lpires074@gmaail.com
- **Tipo:** client
- **Nome Completo:** Luis Pires
- **Status:** Ativo

#### 9. Luis Peras
- **ID:** aeba86c3-e784-4d4f-820d-eeb0b6760f60
- **Username:** psicoterapiaucem
- **Email:** psicoterapiaucem@gmail.com
- **Tipo:** client
- **Nome Completo:** Luis Peras
- **Telefone:** 962695336
- **Status:** Ativo
- **Último Login:** 2025-12-17 21:01:35 UTC

---

### Serviços (4 registos)
Todos os serviços são do terapeuta Luis Peres.

#### 1. Sessão de Coaching Individual
- **ID:** f009739d-aafc-4fb8-b198-57b3d55bc781
- **Duração:** 60 minutos
- **Preço:** €50.00
- **Categoria:** coaching
- **Descrição:** Sessão personalizada de coaching para desenvolvimento pessoal

#### 2. Consulta de Orientação Vocacional
- **ID:** 5edafb3b-b623-4ddf-8406-5c4e0ed3b51a
- **Duração:** 90 minutos
- **Preço:** €75.00
- **Categoria:** vocacional
- **Descrição:** Apoio na escolha de carreira e orientação profissional

#### 3. Terapia de Casal
- **ID:** c326f003-bf9f-49b6-b717-14ddbd7013c4
- **Duração:** 90 minutos
- **Preço:** €80.00
- **Categoria:** terapia
- **Descrição:** Sessão de terapia para casais

#### 4. Workshop de Gestão de Stress
- **ID:** 3dd49240-109d-44d1-a3b8-7abc341124e9
- **Duração:** 120 minutos
- **Preço:** €100.00
- **Categoria:** workshop
- **Descrição:** Workshop prático sobre técnicas de gestão de stress

---

### Perguntas de Segurança Predefinidas (5 registos)

1. **Qual era o nome do seu primeiro animal de estimação?**
   - ID: d2e27ae3-b8f5-461a-bb05-5baa0098876e

2. **Em que cidade nasceu?**
   - ID: c2f4ffca-d8c4-4b57-b90d-adbd9f9f5b4d

3. **Qual é o nome de solteira da sua mãe?**
   - ID: b0c372a1-9ff8-4df1-9beb-afe1c3c18fe3

4. **Qual foi o nome da sua primeira escola?**
   - ID: 4dc13c7d-606a-4e1d-b3fa-e184d54bd99d

5. **Qual é o seu livro favorito?**
   - ID: eb5f5a09-6d29-4382-a146-68edf75d3ac2

---

## ⚙️ FUNÇÕES DO BANCO DE DADOS

### 1. authenticate_user(p_identifier, p_password)
**Retorna:** jsonb
**Tipo:** SECURITY DEFINER
**Descrição:** Autentica um utilizador por email ou username.

**Funcionalidade:**
- Busca utilizador por email ou username
- Verifica se a conta está ativa
- Valida a password com bcrypt
- Retorna sucesso/erro em formato JSON com dados do utilizador

**Estrutura de Retorno:**
```json
{
  "success": true/false,
  "error": "mensagem de erro (se aplicável)",
  "user": {
    "id": "uuid",
    "user_type": "tipo",
    "username": "username",
    "email": "email",
    "full_name": "nome completo"
  }
}
```

---

### 2. create_user(username, email, password, full_name, user_type)
**Retorna:** uuid
**Tipo:** SECURITY DEFINER
**Descrição:** Cria um novo utilizador com perfil.

**Parâmetros:**
- username_input: text
- email_input: text
- password_input: text
- full_name_input: text
- user_type_input: user_type (default: 'client')

**Funcionalidade:**
- Hash da password com bcrypt
- Insere utilizador na tabela users
- Cria perfil correspondente
- Retorna o ID do novo utilizador

---

### 3. hash_password(password)
**Retorna:** text
**Tipo:** SECURITY DEFINER
**Descrição:** Gera hash bcrypt de uma password.

**Custo:** 10 rounds (bf, 10)

---

### 4. verify_password(password, hash) e verify_password(user_id, password)
**Retorna:** boolean
**Tipo:** SECURITY DEFINER
**Descrição:** Verifica se uma password corresponde ao hash.

**Duas Versões:**
1. Verifica password contra hash fornecido
2. Verifica password do utilizador por ID

---

### 5. set_current_user(user_id)
**Retorna:** void
**Tipo:** SECURITY DEFINER
**Descrição:** Define o utilizador atual para RLS.

Define a variável de configuração `app.current_user_id` para uso nas políticas RLS.

---

### 6. update_updated_at_column()
**Retorna:** trigger
**Tipo:** TRIGGER FUNCTION
**Descrição:** Atualiza automaticamente o campo updated_at.

Executado antes de cada UPDATE nas tabelas:
- users
- user_profiles
- services
- bookings
- therapist_notes
- coupons
- two_factor_auth_settings

---

## 🔒 POLÍTICAS RLS (ROW LEVEL SECURITY)

### users
| Política | Operação | Condição |
|----------|----------|----------|
| Allow public read access for authentication | SELECT | true (acesso público) |
| Allow user registration | INSERT | true (permite registo) |
| Allow user self-update | UPDATE | true (permite auto-atualização) |

---

### user_profiles
| Política | Operação | Condição |
|----------|----------|----------|
| Allow public profile read | SELECT | true (perfis públicos) |
| Allow profile insert | INSERT | true |
| Allow profile update | UPDATE | true |

---

### services
| Política | Operação | Condição |
|----------|----------|----------|
| services_select_policy | SELECT | is_active = true OU admin OU terapeuta dono |
| services_insert_policy | INSERT | admin OU terapeuta dono |
| services_update_policy | UPDATE | admin OU terapeuta dono |
| services_delete_policy | DELETE | admin OU terapeuta dono |

---

### bookings
| Política | Operação | Condição |
|----------|----------|----------|
| Public can create bookings | INSERT | true (permite agendamentos públicos) |
| Users can view bookings | SELECT | admin OU client_id = user OU therapist_id = user |
| Users can update bookings | UPDATE | admin OU client_id = user |
| Admins can delete bookings | DELETE | admin |

---

### payments
| Política | Operação | Condição |
|----------|----------|----------|
| payments_select_policy | SELECT | admin OU dono do booking |
| payments_insert_policy | INSERT | admin OU utilizador não autenticado (sistema) |
| payments_update_policy | UPDATE | admin |
| payments_delete_policy | DELETE | admin |

---

### therapist_notes
| Política | Operação | Condição |
|----------|----------|----------|
| Users can view and manage notes | ALL | admin OU therapist_id = user |

---

### business_settings
| Política | Operação | Condição |
|----------|----------|----------|
| business_settings_select_policy | SELECT | true (público) |
| business_settings_insert_policy | INSERT | admin |
| business_settings_update_policy | UPDATE | admin |
| business_settings_delete_policy | DELETE | admin |

---

### coupons
| Política | Operação | Condição |
|----------|----------|----------|
| coupons_select_policy | SELECT | (is_active AND válido) OU admin |
| coupons_insert_policy | INSERT | admin |
| coupons_update_policy | UPDATE | admin |
| coupons_delete_policy | DELETE | admin |

---

### coupon_usages
| Política | Operação | Condição |
|----------|----------|----------|
| Users can view coupon usages | SELECT | admin OU user_id = user |
| System can create coupon usages | INSERT | true |

---

### password_reset_tokens
| Política | Operação | Condição |
|----------|----------|----------|
| Anyone can create password reset tokens | INSERT | true |
| Users can view their own tokens | SELECT | user_id = user |

---

### two_factor_auth_settings
| Política | Operação | Condição |
|----------|----------|----------|
| Users can manage their 2FA settings | ALL | user_id = user |

---

### predefined_security_questions
| Política | Operação | Condição |
|----------|----------|----------|
| Anyone can view predefined questions | SELECT | is_active = true |

---

### security_questions
| Política | Operação | Condição |
|----------|----------|----------|
| Users can manage their security questions | ALL | user_id = user |

---

## 🔍 ÍNDICES

### users
- `users_pkey`: PRIMARY KEY (id)
- `users_username_key`: UNIQUE (username)
- `users_email_key`: UNIQUE (email)
- `idx_users_username`: INDEX (username)
- `idx_users_email`: INDEX (email)

### user_profiles
- `user_profiles_pkey`: PRIMARY KEY (id)
- `idx_profiles_user_id`: INDEX (user_id)

### services
- `services_pkey`: PRIMARY KEY (id)
- `idx_services_therapist_id`: INDEX (therapist_id)

### bookings
- `bookings_pkey`: PRIMARY KEY (id)
- `idx_bookings_client_id`: INDEX (client_id)
- `idx_bookings_therapist_id`: INDEX (therapist_id)

### payments
- `payments_pkey`: PRIMARY KEY (id)
- `idx_payments_booking_id`: INDEX (booking_id)

### therapist_notes
- `therapist_notes_pkey`: PRIMARY KEY (id)
- `idx_therapist_notes_therapist_id`: INDEX (therapist_id)
- `idx_therapist_notes_client_id`: INDEX (client_id)

### business_settings
- `business_settings_pkey`: PRIMARY KEY (id)
- `business_settings_key_key`: UNIQUE (key)

### coupons
- `coupons_pkey`: PRIMARY KEY (id)
- `coupons_code_key`: UNIQUE (code)

### coupon_usages
- `coupon_usages_pkey`: PRIMARY KEY (id)
- `idx_coupon_usages_coupon_id`: INDEX (coupon_id)
- `idx_coupon_usages_user_id`: INDEX (user_id)

### password_reset_tokens
- `password_reset_tokens_pkey`: PRIMARY KEY (id)

### two_factor_auth_settings
- `two_factor_auth_settings_pkey`: PRIMARY KEY (id)
- `two_factor_auth_settings_user_id_key`: UNIQUE (user_id)

### predefined_security_questions
- `predefined_security_questions_pkey`: PRIMARY KEY (id)
- `predefined_security_questions_question_text_key`: UNIQUE (question_text)

### security_questions
- `security_questions_pkey`: PRIMARY KEY (id)
- `security_questions_user_id_question_id_key`: UNIQUE (user_id, question_id)

---

## 📜 HISTÓRICO DE MIGRAÇÕES

### Migrações Aplicadas (16 total)

1. **20251002142821_initial_setup.sql**
   - Setup inicial do sistema
   - Criação de users e user_profiles
   - Funções de autenticação
   - Políticas RLS básicas

2. **20251002144037_create_core_tables.sql**
   - Criação de todas as tabelas principais
   - Sistema de agendamentos completo
   - Sistema de pagamentos
   - Sistema de cupões
   - Autenticação avançada (2FA, perguntas segurança)

3. **20251010174541_fix_rpc_permissions.sql**
   - Correção de permissões RPC

4. **20251010174558_fix_set_current_user_permissions.sql**
   - Correção de permissões da função set_current_user

5. **20251010175827_grant_hash_password_permissions.sql**
   - Concessão de permissões para função hash_password

6. **20251217092758_fix_public_booking_rls.sql**
   - Correção de políticas RLS para agendamentos públicos
   - Permite criação de agendamentos sem autenticação
   - Mantém segurança para leitura/atualização/eliminação

7. **20251217144818_fix_security_performance_issues.sql**
   - Otimização de performance de segurança

8. **20251217145053_fix_remaining_security_issues.sql**
   - Correção de problemas de segurança restantes

9. **20251217145553_fix_all_remaining_security_issues.sql**
   - Correção final de todos os problemas de segurança

10. **20251217145859_optimize_indexes_and_rls_performance.sql**
    - Otimização de índices e performance RLS

11. **20251217150622_fix_authentication_functions.sql**
    - Correção de funções de autenticação

12. **20251217150949_fix_authenticate_user_function.sql**
    - Correção específica da função authenticate_user

13. **20251217151025_fix_authenticate_search_path.sql**
    - Correção do search_path da autenticação

14. **20251217185724_fix_pgcrypto_search_path.sql**
    - Correção do search_path do pgcrypto

15. **20251219230359_fix_authenticate_return_json.sql**
    - Correção do retorno JSON da autenticação

16. **20251219230612_fix_authenticate_pgcrypto_schema.sql**
    - Correção final do schema pgcrypto na autenticação

---

## 🚀 EDGE FUNCTIONS

### Funções Implementadas

#### 1. auth
**Localização:** `supabase/functions/auth/index.ts`
**Descrição:** Gestão de autenticação de utilizadores

#### 2. bookings
**Localização:** `supabase/functions/bookings/index.ts`
**Descrição:** Gestão de agendamentos

#### 3. create-payment-intent
**Localização:** `supabase/functions/create-payment-intent/index.ts`
**Descrição:** Criação de intenções de pagamento (Stripe)

#### 4. easypay-mbway
**Localização:** `supabase/functions/easypay-mbway/index.ts`
**Descrição:** Integração com EasyPay para pagamentos MB WAY

#### 5. notifications
**Localização:** `supabase/functions/notifications/index.ts`
**Descrição:** Sistema de notificações

#### 6. stripe-webhook
**Localização:** `supabase/functions/stripe-webhook/index.ts`
**Descrição:** Webhook para processar eventos do Stripe

---

## 📊 ESTATÍSTICAS DO BANCO DE DADOS

### Resumo Geral
- **Total de Tabelas:** 13
- **Total de Utilizadores:** 9
  - Admins: 1
  - Terapeutas: 2
  - Clientes: 6
- **Total de Serviços:** 4
- **Total de Agendamentos:** 0
- **Total de Pagamentos:** 0
- **Total de Cupões:** 0
- **Total de Notas:** 0

### Estado das Tabelas
| Tabela | Registos | RLS | Índices |
|--------|----------|-----|---------|
| users | 9 | ✓ | 5 |
| user_profiles | 9 | ✓ | 2 |
| services | 4 | ✓ | 2 |
| bookings | 0 | ✓ | 3 |
| payments | 0 | ✓ | 2 |
| therapist_notes | 0 | ✓ | 3 |
| business_settings | 0 | ✓ | 2 |
| coupons | 0 | ✓ | 2 |
| coupon_usages | 0 | ✓ | 3 |
| password_reset_tokens | 0 | ✓ | 1 |
| two_factor_auth_settings | 0 | ✓ | 2 |
| predefined_security_questions | 5 | ✓ | 2 |
| security_questions | 0 | ✓ | 2 |

---

## 🔐 SEGURANÇA

### Medidas Implementadas

1. **Row Level Security (RLS)**
   - Ativado em todas as 13 tabelas
   - Políticas específicas por tipo de utilizador
   - Controlo granular de acesso

2. **Autenticação**
   - Passwords hash com bcrypt (10 rounds)
   - Sistema de lockout após tentativas falhadas
   - Registo de IPs e datas de login
   - Suporte para 2FA

3. **Proteção de Dados**
   - Funções SECURITY DEFINER
   - Search path seguro nas funções
   - Validação de tipos de utilizador
   - Tokens com expiração

4. **Auditoria**
   - Campos created_at em todas as tabelas
   - Campos updated_at com triggers automáticos
   - Registo de quem criou/modificou (onde aplicável)

---

## 📝 NOTAS IMPORTANTES

### Credenciais de Teste

**Administrador:**
- Username: admin
- Email: euestoudesperto@gmail.com
- Password: [Hash armazenado]

**Terapeuta:**
- Username: luisperes
- Email: luisperes28@gmail.com
- Password: [Hash armazenado]

**Cliente:**
- Username: cliente
- Email: cliente@teste.com
- Password: [Hash armazenado]

### Funcionalidades Ativas
- ✅ Sistema de autenticação
- ✅ Gestão de utilizadores e perfis
- ✅ Gestão de serviços
- ✅ Sistema de agendamentos
- ✅ Sistema de pagamentos
- ✅ Sistema de cupões
- ✅ Notas de terapeuta
- ✅ Configurações de negócio
- ✅ Reset de password
- ✅ Autenticação de dois fatores
- ✅ Perguntas de segurança

### Próximos Passos Sugeridos
1. Configurar notificações automáticas
2. Implementar sistema de lembretes
3. Adicionar relatórios e estatísticas
4. Configurar backup automático
5. Implementar logs de auditoria avançados

---

**Documento gerado automaticamente em 2025-12-20**
**Sistema:** Desperto - Plataforma de Gestão de Agendamentos
**Versão do Banco de Dados:** PostgreSQL 17 (Supabase)
