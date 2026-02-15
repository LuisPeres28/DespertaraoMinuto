# 🚨 PROBLEMA: Emails e SMS Não Estão Sendo Enviados

## ✅ O QUE ESTÁ FUNCIONANDO

1. **Sistema de Notificações**: O sistema está criando notificações corretamente quando uma consulta é marcada
2. **Triggers da Base de Dados**: Os triggers estão funcionando e criando as notificações
3. **Cron Job**: Existe um cron job que processa notificações a cada minuto
4. **Edge Functions**: As funções de envio estão deployadas e ativas

## ❌ O PROBLEMA

As notificações estão sendo criadas mas **FALHANDO NO ENVIO** por 2 motivos:

### 1. Secrets Não Configurados no Supabase

As Edge Functions precisam de variáveis secretas que **NÃO estão configuradas no Supabase**:

- `SENDGRID_API_KEY` - Para enviar emails
- `TWILIO_ACCOUNT_SID` - Para enviar SMS
- `TWILIO_AUTH_TOKEN` - Para enviar SMS
- `TWILIO_PHONE_NUMBER` - Para enviar SMS

**Erros na Base de Dados:**
```
"SENDGRID_API_KEY not configured"
"Twilio credentials not configured"
```

### 2. SendGrid em Modo de Teste

A SendGrid está configurada mas em **modo de teste**, o que significa:

✅ **Funciona**: Enviar emails para `euestoudesperto@gmail.com`
❌ **Não Funciona**: Enviar emails para outros endereços

**Erro na Base de Dados:**
```
"You can only send testing emails to your own email address (euestoudesperto@gmail.com).
To send emails to other recipients, please verify a domain at resend.com/domains"
```

---

## 🔧 SOLUÇÕES

### SOLUÇÃO 1: Configurar Secrets no Supabase (URGENTE)

**Passos:**

1. Aceder ao painel do Supabase: https://supabase.com/dashboard
2. Ir para o projeto `dnswlrvleqvsueawxzfy`
3. Ir a **Settings** → **Edge Functions** → **Manage secrets**
4. Adicionar os seguintes secrets:

```bash
# Para Emails (SendGrid)
SENDGRID_API_KEY=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

# Para SMS (Twilio) - OPCIONAL (deixar em branco por agora)
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

**IMPORTANTE:** Depois de adicionar os secrets, as Edge Functions vão **automaticamente** começar a funcionar!

### SOLUÇÃO 2A: Verificar Domínio na SendGrid (RECOMENDADO)

Para enviar emails para QUALQUER cliente (não só para euestoudesperto@gmail.com):

1. Aceder a SendGrid: https://app.sendgrid.com/
2. Ir para **Settings** → **Sender Authentication** → **Domain Authentication**
3. Verificar um domínio (ex: desperto.pt)
4. Atualizar a Edge Function `send-email` para usar o domínio verificado no campo `from`

**Vantagens:**
- Emails profissionais (ex: noreply@desperto.pt)
- Melhor taxa de entrega
- Sem limite de destinatários

### SOLUÇÃO 2B: Usar Modo de Teste (TEMPORÁRIO)

Se quiser testar rapidamente SEM verificar domínio:

**Limitação:** Só funciona para emails enviados para `euestoudesperto@gmail.com`

Para testar:
1. Configurar o secret `SENDGRID_API_KEY` (Solução 1)
2. Criar uma marcação com o email `euestoudesperto@gmail.com`
3. Verificar se recebe o email

### SOLUÇÃO 3: Configurar SMS (OPCIONAL)

Para enviar SMS, precisa:

1. Criar conta no Twilio: https://www.twilio.com/
2. Obter as credenciais:
   - Account SID
   - Auth Token
   - Número de telefone Twilio
3. Adicionar os secrets no Supabase (ver Solução 1)

**Nota:** O sistema está em "modo simulação" para SMS. As notificações SMS são marcadas como "enviadas" mas não são realmente enviadas até configurar o Twilio.

---

## 🔍 VERIFICAR SE ESTÁ A FUNCIONAR

### 1. Verificar Logs das Edge Functions

1. Ir ao Supabase Dashboard
2. Ir para **Edge Functions** → **Logs**
3. Procurar por logs da função `process-notifications`
4. Deve ver: `✅ Email sent successfully` em vez de erros

### 2. Verificar Base de Dados

Execute este SQL no Supabase SQL Editor:

```sql
-- Ver últimas notificações
SELECT
  type,
  status,
  recipient_email,
  created_at,
  sent_at,
  error_message
FROM notifications
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC
LIMIT 10;
```

**Status esperados após configurar:**
- ✅ `status = 'sent'` → Email/SMS enviado com sucesso
- ❌ `status = 'failed'` → Erro ao enviar (ver `error_message`)
- ⏳ `status = 'pending'` → Aguardando envio

### 3. Testar Criando uma Marcação

1. Criar uma nova marcação no sistema
2. Aguardar 1-2 minutos (o cron job processa a cada minuto)
3. Verificar se recebeu o email de confirmação
4. Verificar a tabela `notifications` para ver o status

---

## 📊 ESTADO ATUAL DAS NOTIFICAÇÕES

Verificação da base de dados mostra:

- **Total de notificações criadas**: Várias (sistema está a funcionar)
- **Notificações pendentes**: Sim (aguardando configuração)
- **Notificações falhadas**: Sim (por falta de secrets)
- **Notificações enviadas com sucesso**: 1 (para euestoudesperto@gmail.com)

---

## 🎯 RESUMO - O QUE FAZER AGORA

### Prioridade ALTA (Para começar a enviar emails HOJE):

1. ✅ Configurar `SENDGRID_API_KEY` no Supabase (5 minutos)
2. ✅ Testar com email euestoudesperto@gmail.com

### Prioridade MÉDIA (Para enviar para TODOS os clientes):

3. ✅ Verificar domínio na SendGrid (30-60 minutos)
4. ✅ Atualizar Edge Function `send-email` com domínio verificado

### Prioridade BAIXA (SMS - Opcional):

5. ⏸️ Criar conta Twilio
6. ⏸️ Configurar secrets Twilio no Supabase

---

## ❓ PERGUNTAS FREQUENTES

**P: Porque é que não tenho de configurar secrets localmente?**
R: As Edge Functions correm nos servidores do Supabase, não localmente. Os secrets precisam ser configurados no dashboard do Supabase.

**P: Vou perder as notificações pendentes?**
R: Não! As notificações pendentes estão guardadas na base de dados e vão ser processadas assim que configurar os secrets.

**P: Posso testar sem verificar domínio?**
R: Sim! Pode testar enviando emails apenas para euestoudesperto@gmail.com. Para outros emails, precisa verificar um domínio.

**P: Os SMS são obrigatórios?**
R: Não. O sistema funciona perfeitamente só com emails. Os SMS são um extra para melhorar a experiência do cliente.

---

## 📞 PRÓXIMOS PASSOS

1. **URGENTE**: Configurar `SENDGRID_API_KEY` no Supabase
2. Testar criando uma marcação com email euestoudesperto@gmail.com
3. Se funcionar, verificar domínio na SendGrid
4. Se quiser SMS, configurar Twilio

**Tempo estimado para resolver:** 15-30 minutos
