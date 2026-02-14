# Configuração Resend - Envio de Emails Automáticos

## Por que Resend?

EmailJS não funciona em servidores (edge functions), apenas no browser. Resend é:
- ✅ Gratuito até 3000 emails/mês (100/dia)
- ✅ Feito para edge functions e APIs
- ✅ Setup em 5 minutos
- ✅ Sem cartão de crédito necessário

---

## Passo 1: Criar Conta Resend (2 minutos)

1. Vai a: **https://resend.com/signup**
2. Regista com email e password
3. Confirma o email
4. Faz login em: **https://resend.com/login**

---

## Passo 2: Obter API Key (1 minuto)

1. Após login, clica em **"API Keys"** no menu lateral
2. Clica no botão **"Create API Key"**
3. Preenche:
   - **Name**: `Desperto Notifications`
   - **Permission**: Deixa "Full access" (ou escolhe "Sending access")
4. Clica **"Add"**
5. **COPIA A KEY** (começa com `re_...`)
   - ⚠️ Só aparece uma vez! Guarda num lugar seguro

---

## Passo 3: Adicionar Secret no Supabase (1 minuto)

### Opção A: Via Supabase Dashboard (MAIS FÁCIL)

1. Vai ao teu projeto Supabase: https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy
2. Menu lateral: **Project Settings** → **Edge Functions**
3. Scroll até **Secrets**
4. Clica **"Add new secret"**
5. Preenche:
   - **Name**: `RESEND_API_KEY`
   - **Value**: Cola a key que copiaste (re_...)
6. Clica **"Save"**

### Opção B: Via SQL Editor

1. Vai ao Supabase Dashboard → **SQL Editor**
2. Clica **"New query"**
3. Cola este comando (substitui `COLA_A_TUA_KEY_AQUI` pela tua key):

```sql
SELECT vault.create_secret('RESEND_API_KEY', 'COLA_A_TUA_KEY_AQUI');
```

4. Clica **"Run"**

---

## Passo 4: Verificar que Funcionou

Depois de configurares a key, o sistema começará a enviar emails automaticamente!

Para testar, podes:

1. Criar uma nova booking no sistema
2. Aguardar 1-2 minutos
3. Verificar se o email chegou

Ou testar manualmente no SQL Editor:

```sql
-- Ver notificações pendentes
SELECT * FROM notifications WHERE status = 'pending' LIMIT 5;

-- Forçar processamento imediato (o cron faz isto automaticamente)
SELECT net.http_post(
  url := 'https://dnswlrvleqvsueawxzfy.supabase.co/functions/v1/process-notifications',
  headers := jsonb_build_object(
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM4MTIyMiwiZXhwIjoyMDc0OTU3MjIyfQ.yl7b9TgaJYVmNMC1hQ-D60fwCZ7jwPp8EsK5dkBmguc'
  )
);

-- Ver notificações enviadas
SELECT * FROM notifications WHERE status = 'sent' ORDER BY sent_at DESC LIMIT 10;
```

---

## O Que Acontece Agora?

Com o Resend configurado:

1. ✅ Cada booking confirmada gera notificações automáticas
2. ✅ Email de confirmação enviado imediatamente
3. ✅ SMS de confirmação (se telefone configurado)
4. ✅ Lembretes automáticos:
   - 24 horas antes
   - 2 horas antes
   - 1 hora antes
5. ✅ Cron job processa notificações a cada minuto
6. ✅ Emails enviados via Resend (até 3000/mês grátis)

---

## Problemas Comuns

### "Invalid API key"
- Verifica que copiaste a key completa (começa com `re_`)
- Certifica-te que criaste o secret com o nome exato: `RESEND_API_KEY`

### "Domain not verified"
- Resend usa `onboarding@resend.dev` por padrão (funciona sempre)
- Para usar teu domínio (`contato@despertoportugal.com`), precisas:
  1. Adicionar domínio em Resend Dashboard
  2. Configurar registos DNS
  3. Aguardar verificação
  4. Atualizar edge function com novo email

### Emails não chegam
- Verifica spam/lixo
- Verifica que o email está correto na booking
- Vê logs no Supabase: Dashboard → Edge Functions → Logs

---

## Próximos Passos (Opcional)

### 1. Domínio Personalizado

Para emails virem de `contato@despertoportugal.com`:

1. Resend Dashboard → **Domains**
2. Clica **"Add Domain"**
3. Adiciona: `despertoportugal.com`
4. Copia os registos DNS mostrados
5. Adiciona-os no teu fornecedor de domínio (GoDaddy, Cloudflare, etc)
6. Aguarda verificação (até 24h)
7. Atualiza edge function:

```typescript
// Em supabase/functions/send-email/index.ts, linha ~65
from: 'Desperto Coaching <contato@despertoportugal.com>',
```

### 2. Templates Bonitos

Podes criar templates HTML personalizados para cada tipo de email:
- Confirmação de booking
- Lembrete 24h
- Lembrete 2h
- Lembrete 1h

---

## Custos

**Plano Gratuito:**
- 3,000 emails/mês
- 100 emails/dia
- Todos os features

**Plano Pago (se precisares):**
- $20/mês = 50,000 emails
- $80/mês = 500,000 emails

Para um negócio de coaching, o plano grátis é suficiente!
