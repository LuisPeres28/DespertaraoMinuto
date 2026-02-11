# 🚀 Guia Completo de Deploy no Netlify

## Pré-requisitos
- Conta no Netlify (https://netlify.com)
- Conta no GitHub/GitLab/Bitbucket
- Projeto Supabase configurado
- Conta EmailJS configurada (opcional)

---

## 📋 PASSO 1: Preparar o Repositório Git

### Se ainda não tem Git configurado:

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Primeiro commit
git commit -m "Initial commit - Sistema de Agendamento Desperto"

# Renomear branch para main
git branch -M main
```

### Criar repositório no GitHub:
1. Vá para https://github.com/new
2. Crie um repositório (público ou privado)
3. **NÃO** adicione README, .gitignore ou licença

### Conectar e enviar código:
```bash
# Adicionar remote (substitua com seu usuário e repositório)
git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git

# Push inicial
git push -u origin main
```

---

## 🌐 PASSO 2: Deploy no Netlify

### 2.1 Importar Projeto
1. Acesse https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Escolha seu provedor Git (GitHub/GitLab/Bitbucket)
4. Autorize o Netlify a acessar seus repositórios
5. Selecione o repositório do projeto

### 2.2 Configurar Build Settings
O Netlify deve detectar automaticamente as configurações do `netlify.toml`:

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Functions directory:** deixe vazio

### 2.3 Adicionar Variáveis de Ambiente
⚠️ **CRÍTICO: Configure ANTES do primeiro deploy!**

1. Vá em **Site settings** → **Environment variables**
2. Click **"Add a variable"** e adicione:

#### Variáveis Obrigatórias do Supabase:
```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

**Como obter:**
- Acesse https://supabase.com/dashboard
- Selecione seu projeto
- Vá em **Settings** → **API**
- Copie **Project URL** e **anon/public key**

#### Variáveis do EmailJS (Opcional):
```
VITE_EMAILJS_SERVICE_ID=seu_service_id
VITE_EMAILJS_TEMPLATE_ID=seu_template_id
VITE_EMAILJS_RESCHEDULE_TEMPLATE_ID=seu_reschedule_template_id
VITE_EMAILJS_PUBLIC_KEY=sua_public_key
```

**Como obter:**
- Acesse https://dashboard.emailjs.com
- Vá em **Email Services** para o Service ID
- Vá em **Email Templates** para os Template IDs
- Vá em **Account** para a Public Key

### 2.4 Fazer Deploy
1. Click **"Deploy site"**
2. Aguarde o build (2-5 minutos)
3. Seu site estará disponível em: `https://nome-aleatorio.netlify.app`

---

## 🔧 PASSO 3: Configurar Domínio Personalizado (Opcional)

### Usando domínio Netlify gratuito:
1. Vá em **Site settings** → **Domain management**
2. Click **"Options"** → **"Edit site name"**
3. Escolha um nome: `seu-nome.netlify.app`

### Usando domínio próprio:
1. Vá em **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Digite seu domínio (ex: `desperto.com`)
4. Configure DNS conforme instruções do Netlify
5. SSL automático será provisionado em alguns minutos

---

## ⚙️ PASSO 4: Configurar Edge Functions do Supabase

As Edge Functions já estão criadas, mas precisam das variáveis de ambiente:

1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **Edge Functions** → **Settings**
4. Adicione as variáveis:

```
EMAILJS_SERVICE_ID=seu_service_id
EMAILJS_TEMPLATE_ID=seu_template_id
EMAILJS_PUBLIC_KEY=sua_public_key
```

---

## 🕐 PASSO 5: Configurar Cron Jobs (Notificações Automáticas)

### No Supabase Dashboard:

1. Vá em **Database** → **Extensions**
2. Habilite a extensão **pg_cron**

3. Execute no **SQL Editor**:

```sql
-- Processar notificações a cada 15 minutos
SELECT cron.schedule(
  'process-notifications-15min',
  '*/15 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/process-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer SUA_ANON_KEY_AQUI',
      'Content-Type', 'application/json'
    )
  ) AS request_id;
  $$
);

-- Verificar agendamentos futuros todo dia às 9h
SELECT cron.schedule(
  'check-upcoming-bookings',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url := 'https://seu-projeto.supabase.co/functions/v1/notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer SUA_ANON_KEY_AQUI',
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object('action', 'check_upcoming')
  ) AS request_id;
  $$
);
```

**Substitua:**
- `seu-projeto.supabase.co` pelo seu Project URL
- `SUA_ANON_KEY_AQUI` pela sua Anon Key

### Verificar Cron Jobs ativos:
```sql
SELECT * FROM cron.job;
```

### Remover Cron Job (se necessário):
```sql
SELECT cron.unschedule('process-notifications-15min');
```

---

## ✅ PASSO 6: Testar o Sistema em Produção

### 6.1 Testar Login
1. Acesse seu site: `https://seu-site.netlify.app`
2. Faça login com as credenciais de teste:
   - **Staff:** `staff@test.com` / `Test123!`
   - **Cliente:** `client@test.com` / `Test123!`

### 6.2 Testar Agendamento
1. Vá para "Novo Agendamento"
2. Crie um agendamento de teste
3. Verifique se o email de confirmação foi enviado

### 6.3 Testar Notificações
1. Crie um agendamento para daqui a 25 horas
2. Aguarde 15 minutos (próxima execução do cron)
3. Verifique se recebeu o email de lembrete

---

## 🔄 Deploy Contínuo

Agora cada vez que você fizer push para o repositório, o Netlify fará deploy automático:

```bash
# Fazer mudanças no código
git add .
git commit -m "Descrição das mudanças"
git push

# Deploy acontece automaticamente!
```

### Ver status do deploy:
1. Acesse https://app.netlify.com
2. Selecione seu site
3. Vá em **Deploys**

---

## 🐛 Troubleshooting

### Build falha com erro de variáveis:
- Verifique se todas as variáveis de ambiente estão configuradas
- Variáveis devem começar com `VITE_`

### Site carrega mas mostra erro de conexão:
- Verifique se o Supabase URL e Key estão corretos
- Teste as credenciais no Supabase Dashboard

### Emails não são enviados:
- Verifique as credenciais do EmailJS
- Teste manualmente no dashboard do EmailJS
- Verifique os logs das Edge Functions no Supabase

### Notificações não funcionam:
- Verifique se os Cron Jobs estão ativos: `SELECT * FROM cron.job;`
- Verifique os logs no Supabase: **Edge Functions** → **Logs**
- Confirme que a extensão `pg_cron` está habilitada

---

## 📊 Monitoramento

### Netlify Analytics:
- Acesse **Analytics** no dashboard do Netlify
- Veja visitas, performance e erros

### Supabase Logs:
- **Database** → **Logs** para logs de queries
- **Edge Functions** → **Logs** para logs de funções
- **Auth** → **Users** para ver usuários cadastrados

---

## 🔐 Segurança em Produção

### Checklist:
- ✅ Variáveis de ambiente configuradas (não commitadas no Git)
- ✅ RLS (Row Level Security) habilitado em todas as tabelas
- ✅ HTTPS habilitado (automático no Netlify)
- ✅ Headers de segurança configurados (no `netlify.toml`)
- ✅ Senhas dos usuários de teste alteradas
- ✅ Backup do banco de dados configurado (Supabase faz automático)

---

## 📞 Suporte

### Documentação:
- Netlify: https://docs.netlify.com
- Supabase: https://supabase.com/docs
- EmailJS: https://www.emailjs.com/docs

### Logs e Debug:
- Netlify Logs: **Site settings** → **Functions** → **Logs**
- Supabase Logs: **Edge Functions** → **Logs**
- Browser Console: F12 no navegador

---

## 🎉 Pronto!

Seu sistema está no ar e funcionando!

**URL do site:** https://seu-site.netlify.app

Próximos passos sugeridos:
1. Configurar domínio personalizado
2. Criar usuários reais (remover usuários de teste)
3. Personalizar emails no EmailJS
4. Configurar backup automático adicional
5. Monitorar uso e performance

---

**Criado em:** 2026-02-11
**Versão:** 1.0
