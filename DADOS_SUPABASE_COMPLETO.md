# 📊 DADOS COMPLETOS DO SUPABASE - PROJETO DESPERTO

---

## 🔑 CREDENCIAIS E CONFIGURAÇÃO

### URL do Projeto
```
https://dnswlrvleqvsueawxzfy.supabase.co
```

### Anon Key (Chave Pública)
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODEyMjIsImV4cCI6MjA3NDk1NzIyMn0.bsg6sfD9d2CT5EiiGWOKtl1FeaeN1DnDYiUtLeqkOmQ
```

### Project Reference
```
dnswlrvleqvsueawxzfy
```

### Dashboard Supabase
```
https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy
```

---

## 🗄️ ESTRUTURA DA BASE DE DADOS

### Tabelas Criadas (14 tabelas)

1. **users** (9 registos) - Utilizadores do sistema
2. **user_profiles** (3 registos) - Perfis dos utilizadores
3. **services** (0 registos) - Serviços oferecidos
4. **bookings** (0 registos) - Marcações
5. **payments** (0 registos) - Pagamentos
6. **therapist_notes** (0 registos) - Notas dos terapeutas
7. **business_settings** (0 registos) - Configurações do negócio
8. **coupons** (0 registos) - Cupões de desconto
9. **coupon_usages** (0 registos) - Uso de cupões
10. **password_reset_tokens** (0 registos) - Tokens de reset de password
11. **two_factor_auth_settings** (0 registos) - Configurações 2FA
12. **predefined_security_questions** (0 registos) - Perguntas de segurança
13. **security_questions** (0 registos) - Respostas às perguntas de segurança

---

## 👥 UTILIZADORES REGISTADOS (9 utilizadores)

### 1. Luis Peres (Therapist/Admin)
- **ID:** `e579ea96-481b-4042-92f5-3babccf4a055`
- **Username:** `luisperes`
- **Email:** `luisperes28@gmail.com`
- **Tipo:** Therapist
- **Status:** Ativo
- **Criado em:** 2 Outubro 2025

### 2. Luis Peres (Client)
- **ID:** `019948ea-5db9-4794-b917-ae7086f62da4`
- **Username:** `luisperes28`
- **Email:** `luisperes28@msn.com`
- **Tipo:** Client
- **Status:** Ativo
- **Criado em:** 10 Outubro 2025

### 3. Cliente Teste
- **ID:** `addfbaf8-e422-49d2-a721-335ecfc70471`
- **Username:** `cliente`
- **Email:** `cliente@teste.com`
- **Tipo:** Client
- **Status:** Ativo
- **Password:** `123456`
- **Criado em:** 2 Outubro 2025

### 4. Cristina Loureiro
- **ID:** `50d210ee-ae6a-49cd-a80f-7faa97a98f63`
- **Username:** `csloureiro`
- **Email:** `csloureiro@live.com.pt`
- **Tipo:** Client
- **Status:** Ativo
- **Criado em:** 16 Dezembro 2025

### 5. LP Teste
- **ID:** `8e23d295-c7ca-48e5-aa93-5ea490577aeb`
- **Username:** `lpires074`
- **Email:** `lpires074@gmaail.com`
- **Tipo:** Client
- **Status:** Ativo
- **Criado em:** 17 Dezembro 2025

---

## 🔐 FUNÇÕES DO SUPABASE (RPC Functions)

### 1. `authenticate_user`
**Função:** Autenticar utilizador com bcrypt
**Parâmetros:**
- `p_identifier` (string) - Email ou username
- `p_password` (string) - Password em texto simples

**Retorna:**
```json
{
  "user_id": "uuid",
  "username": "string",
  "email": "string",
  "user_type": "client|therapist|admin",
  "full_name": "string"
}
```

**Exemplo de uso:**
```sql
SELECT * FROM authenticate_user('luisperes28@gmail.com', 'sua_password')
```

### 2. `hash_password`
**Função:** Criar hash bcrypt de uma password
**Parâmetros:**
- `password` (string) - Password em texto simples

**Retorna:** Hash bcrypt da password

**Exemplo de uso:**
```sql
SELECT hash_password('123456')
```

### 3. `set_current_user`
**Função:** Definir contexto do utilizador para RLS
**Parâmetros:**
- `user_id_input` (uuid) - ID do utilizador

**Retorna:** void

**Exemplo de uso:**
```sql
SELECT set_current_user('e579ea96-481b-4042-92f5-3babccf4a055')
```

### 4. `create_user`
**Função:** Criar novo utilizador
**Parâmetros:**
- `username_input` (string)
- `email_input` (string)
- `password_input` (string)
- `full_name_input` (string)
- `user_type_input` (optional) - default: 'client'

**Retorna:** UUID do novo utilizador

---

## 🔒 SEGURANÇA (RLS - Row Level Security)

### Status RLS por Tabela
- ✅ `users` - RLS Ativado
- ✅ `user_profiles` - RLS Ativado
- ✅ `services` - RLS Ativado
- ✅ `bookings` - RLS Ativado
- ✅ `payments` - RLS Ativado
- ✅ `therapist_notes` - RLS Ativado
- ✅ `business_settings` - RLS Ativado
- ✅ `coupons` - RLS Ativado
- ✅ `coupon_usages` - RLS Ativado
- ✅ `password_reset_tokens` - RLS Ativado
- ✅ `two_factor_auth_settings` - RLS Ativado
- ✅ `predefined_security_questions` - RLS Ativado
- ✅ `security_questions` - RLS Ativado

**Todas as tabelas têm RLS ativado para máxima segurança!**

---

## 📋 DETALHES DAS TABELAS PRINCIPAIS

### 1. USERS (Utilizadores)
**Colunas:**
- `id` (uuid) - Primary Key
- `username` (text) - Unique
- `email` (text) - Unique
- `password_hash` (text) - Hash bcrypt
- `user_type` (enum) - client, therapist, admin
- `is_active` (boolean) - default: true
- `phone_number` (text, nullable)
- `failed_login_attempts` (integer) - default: 0
- `lockout_until` (timestamptz, nullable)
- `last_login_ip` (text, nullable)
- `last_login_at` (timestamptz, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Registos atuais:** 9 utilizadores

### 2. USER_PROFILES (Perfis)
**Colunas:**
- `id` (uuid) - Primary Key
- `user_id` (uuid) - Foreign Key → users.id
- `full_name` (text)
- `phone` (text, nullable)
- `bio` (text, nullable)
- `avatar_url` (text, nullable)
- `specialties` (text[], array)
- `availability_config` (jsonb)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Registos atuais:** 3 perfis

### 3. SERVICES (Serviços)
**Colunas:**
- `id` (uuid) - Primary Key
- `name` (text)
- `description` (text, nullable)
- `duration` (integer) - minutos, default: 60
- `price` (numeric)
- `category` (text) - default: 'coaching'
- `therapist_id` (uuid) - Foreign Key → users.id
- `is_active` (boolean) - default: true
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Registos atuais:** 0 serviços

### 4. BOOKINGS (Marcações)
**Colunas:**
- `id` (uuid) - Primary Key
- `client_id` (uuid) - Foreign Key → users.id
- `therapist_id` (uuid) - Foreign Key → users.id
- `service_id` (uuid) - Foreign Key → services.id
- `booking_date` (timestamptz)
- `status` (enum) - pending, confirmed, completed, cancelled
- `payment_status` (enum) - pending, paid, partial, overdue, refunded
- `notes` (text, nullable)
- `reminder_sent` (boolean) - default: false
- `reschedule_request` (jsonb, nullable)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Registos atuais:** 0 marcações

### 5. PAYMENTS (Pagamentos)
**Colunas:**
- `id` (uuid) - Primary Key
- `booking_id` (uuid) - Foreign Key → bookings.id
- `amount` (numeric)
- `method` (enum) - card, cash, paypal, mbway, multibanco, coupon
- `status` (enum) - pending, paid, partial, overdue, refunded
- `transaction_id` (text, nullable)
- `invoice_number` (text, nullable)
- `payment_date` (timestamptz)
- `created_at` (timestamptz)

**Registos atuais:** 0 pagamentos

### 6. COUPONS (Cupões)
**Colunas:**
- `id` (uuid) - Primary Key
- `code` (text) - Unique, código do cupão
- `password` (text) - Password para usar o cupão
- `discount_type` (text) - percentage ou fixed
- `discount_value` (numeric)
- `max_uses` (integer) - default: 1
- `used_count` (integer) - default: 0
- `valid_from` (timestamptz)
- `valid_until` (timestamptz, nullable)
- `is_active` (boolean) - default: true
- `created_by` (uuid) - Foreign Key → users.id
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

**Registos atuais:** 0 cupões

---

## 🔗 RELAÇÕES ENTRE TABELAS (Foreign Keys)

```
users (9)
├── user_profiles (3) - user_id → users.id
├── services (0) - therapist_id → users.id
├── bookings (0)
│   ├── client_id → users.id
│   ├── therapist_id → users.id
│   └── service_id → services.id
├── payments (0) - booking_id → bookings.id
├── therapist_notes (0)
│   ├── therapist_id → users.id
│   └── client_id → users.id
├── coupons (0) - created_by → users.id
├── coupon_usages (0)
│   ├── coupon_id → coupons.id
│   ├── booking_id → bookings.id
│   └── user_id → users.id
├── password_reset_tokens (0) - user_id → users.id
├── two_factor_auth_settings (0) - user_id → users.id
└── security_questions (0)
    ├── user_id → users.id
    └── question_id → predefined_security_questions.id
```

---

## 📧 CONFIGURAÇÃO DE EMAIL (EmailJS)

### Service ID
```
service_eqp55ju
```

### Template ID (Normal)
```
template_w3awkf1
```

### Template ID (Reagendamento)
```
your_reschedule_template_id_here
```

### Public Key
```
yxdL1IoXHXaC3Q-Cw
```

---

## 🌐 VARIÁVEIS DE AMBIENTE

### Para desenvolvimento local (.env)
```bash
VITE_SUPABASE_URL=https://dnswlrvleqvsueawxzfy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODEyMjIsImV4cCI6MjA3NDk1NzIyMn0.bsg6sfD9d2CT5EiiGWOKtl1FeaeN1DnDYiUtLeqkOmQ

VITE_EMAILJS_SERVICE_ID=service_eqp55ju
VITE_EMAILJS_TEMPLATE_ID=template_w3awkf1
VITE_EMAILJS_RESCHEDULE_TEMPLATE_ID=your_reschedule_template_id_here
VITE_EMAILJS_PUBLIC_KEY=yxdL1IoXHXaC3Q-Cw
```

### Para Netlify
Adicionar as mesmas variáveis em:
```
Netlify Dashboard → Site → Site configuration → Environment variables
```

---

## 🔧 ENDPOINTS DA API

### Base URL
```
https://dnswlrvleqvsueawxzfy.supabase.co
```

### REST API
```
https://dnswlrvleqvsueawxzfy.supabase.co/rest/v1/
```

### Auth API
```
https://dnswlrvleqvsueawxzfy.supabase.co/auth/v1/
```

### Realtime
```
wss://dnswlrvleqvsueawxzfy.supabase.co/realtime/v1/websocket
```

### Storage
```
https://dnswlrvleqvsueawxzfy.supabase.co/storage/v1/
```

---

## 📊 ESTATÍSTICAS DO PROJETO

- **Total de tabelas:** 14
- **Total de utilizadores:** 9
- **Perfis criados:** 3
- **RLS ativado:** ✅ Em todas as tabelas
- **Funções RPC:** 4
- **Migrations aplicadas:** 20
- **Status geral:** ✅ Totalmente funcional

---

## 🔐 CREDENCIAIS DE ACESSO PARA TESTES

### Admin/Therapist
```
Email: luisperes28@gmail.com
Username: luisperes
Password: [sua password]
```

### Cliente Teste 1
```
Email: cliente@teste.com
Username: cliente
Password: 123456
```

### Cliente Teste 2
```
Email: luisperes28@msn.com
Username: luisperes28
Password: [sua password]
```

### Cliente Teste 3
```
Email: csloureiro@live.com.pt
Username: csloureiro
Password: [sua password]
```

---

## 🚀 COMO USAR ESTES DADOS

### 1. Configurar variáveis no Netlify
Copiar as variáveis da secção "Variáveis de Ambiente" e adicionar no Netlify.

### 2. Aceder ao Dashboard Supabase
Usar o link: https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy

### 3. Executar queries SQL
Usar o SQL Editor no Dashboard Supabase ou a função `execute_sql`.

### 4. Testar autenticação
Usar a função `authenticate_user` com as credenciais de teste.

### 5. Criar novos utilizadores
Usar a função `create_user` ou o endpoint de signup.

---

## 📝 NOTAS IMPORTANTES

1. ⚠️ **SEGURANÇA:** Nunca partilhar a Service Role Key (key de admin)
2. ✅ A Anon Key é segura para usar no frontend
3. 🔒 Todas as tabelas têm RLS ativado
4. 📧 EmailJS está configurado mas o template de reagendamento precisa ser criado
5. 🔐 As passwords são armazenadas com hash bcrypt (seguro)
6. 📊 O sistema suporta autenticação 2FA (não configurado ainda)
7. 🎫 Sistema de cupões implementado (sem cupões criados ainda)
8. 📱 Suporte para multiple métodos de pagamento: card, cash, paypal, mbway, multibanco

---

**Última atualização:** 18 Dezembro 2025
**Projeto:** Desperto
**Database:** PostgreSQL (Supabase)
**Região:** East US (Ohio)
