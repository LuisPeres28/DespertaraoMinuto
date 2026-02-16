# Sistema de Notificações - Status Final

## ✅ CORRIGIDO AGORA

### Trigger de Confirmação Imediata
- **PROBLEMA**: Função `send_booking_confirmation` existia mas não tinha trigger associado
- **SOLUÇÃO**: Criado trigger `a_trigger_send_immediate_confirmation` que executa ao inserir booking
- **ORDEM DE EXECUÇÃO**:
  1. `a_trigger_send_immediate_confirmation` (1º) → envia confirmação imediata (email + SMS)
  2. `trigger_create_booking_notifications` (2º) → agenda lembretes futuros

---

## ✅ O QUE JÁ ESTÁ FUNCIONANDO

### Base de Dados
- ✅ Tabela `notifications` criada e configurada
- ✅ Triggers configurados corretamente:
  - INSERT em bookings → confirmação imediata + lembretes futuros
  - UPDATE em bookings → recria lembretes se data mudou
- ✅ Funções criadas:
  - `send_booking_confirmation()` → cria notificações de confirmação
  - `schedule_booking_reminders()` → agenda lembretes (24h, 2h, 1h antes)
  - `trigger_send_booking_confirmation()` → wrapper para trigger
  - `trigger_schedule_booking_reminders()` → wrapper para trigger

### Edge Functions
- ✅ `send-email` (deployed e ativo) → envia emails via Resend
- ✅ `send-sms` (deployed e ativo) → envia SMS via Twilio
- ✅ `process-notifications` (deployed e ativo) → processa notificações pendentes

### Cron Job
- ✅ Job `process-pending-notifications` configurado
- ✅ Executa a cada minuto
- ✅ Chama função `process-notifications` automaticamente

---

## ⚠️ O QUE FALTA CONFIGURAR (SECRETS)

### 1. RESEND_API_KEY (OBRIGATÓRIO para emails)

Para configurar emails:

```bash
# 1. Criar conta em https://resend.com
# 2. Obter API Key em https://resend.com/api-keys
# 3. Configurar secret no Supabase:

supabase secrets set RESEND_API_KEY=re_your_api_key_here
```

**Verificar domínio**:
- Por padrão usa `onboarding@resend.dev` (apenas teste)
- Para produção, verificar domínio próprio em Resend

### 2. TWILIO (OPCIONAL para SMS)

Se quiser enviar SMS:

```bash
# 1. Criar conta em https://www.twilio.com/try-twilio
# 2. Obter credenciais no dashboard
# 3. Configurar secrets:

supabase secrets set TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token
supabase secrets set TWILIO_PHONE_NUMBER=+351xxxxxxxxx
```

**NOTA**: Se Twilio não estiver configurado, SMS será marcado como "sent (simulation mode)"

---

## 📋 FLUXO COMPLETO DE NOTIFICAÇÕES

### Quando cliente cria booking:

**1. Triggers disparam (ordem alfabética):**
```
a_trigger_send_immediate_confirmation
  ↓
  → Deleta notificações antigas pendentes
  → Cria EMAIL de confirmação (scheduled_for = NOW)
  → Cria SMS de confirmação (scheduled_for = NOW)

trigger_create_booking_notifications
  ↓
  → Adiciona EMAIL lembrete 24h antes (se booking > 24h no futuro)
  → Adiciona SMS lembrete 2h antes (se booking > 2h no futuro)
  → Adiciona EMAIL lembrete 1h antes (se booking > 1h no futuro)
```

**2. Cron job processa (a cada minuto):**
```
process-notifications
  ↓
  → Busca notificações pendentes onde scheduled_for <= NOW
  → Processa cada notificação:
     - Email → chama send-email → Resend API
     - SMS → chama send-sms → Twilio API
  → Atualiza status: sent ou failed
  → Retry até 3x se falhar
```

**3. Cliente recebe:**
- ✅ Email de confirmação (IMEDIATO)
- ✅ SMS de confirmação (IMEDIATO)
- ✅ Email lembrete (24h antes)
- ✅ SMS lembrete (2h antes)
- ✅ Email lembrete (1h antes)

---

## 🧪 COMO TESTAR

### 1. Verificar secrets configurados:
```sql
-- No Supabase SQL Editor
SELECT name FROM vault.secrets;
```

Deve mostrar:
- `RESEND_API_KEY` (obrigatório)
- `TWILIO_ACCOUNT_SID` (opcional)
- `TWILIO_AUTH_TOKEN` (opcional)
- `TWILIO_PHONE_NUMBER` (opcional)

### 2. Criar booking de teste:
```sql
-- Criar booking para daqui a 1 minuto
INSERT INTO bookings (
  client_id,
  therapist_id,
  service_id,
  booking_date,
  status,
  payment_status
) VALUES (
  'client_id_here',
  'therapist_id_here',
  'service_id_here',
  NOW() + interval '1 minute',
  'confirmed',
  'paid'
);
```

### 3. Verificar notificações criadas:
```sql
SELECT
  id,
  type,
  recipient_email,
  recipient_phone,
  subject,
  status,
  scheduled_for,
  created_at
FROM notifications
ORDER BY created_at DESC
LIMIT 10;
```

Deve mostrar:
- 1 email de confirmação (scheduled_for = criação)
- 1 SMS de confirmação (scheduled_for = criação)
- Lembretes futuros (se booking > 1h no futuro)

### 4. Verificar envio:
```sql
-- Esperar 1-2 minutos e verificar
SELECT
  id,
  type,
  status,
  sent_at,
  error_message
FROM notifications
WHERE status IN ('sent', 'failed')
ORDER BY sent_at DESC
LIMIT 10;
```

Status deve mudar para `sent` após cron job processar.

---

## 🚨 TROUBLESHOOTING

### Notificações não são enviadas:

1. **Verificar secrets:**
   ```sql
   SELECT name FROM vault.secrets;
   ```

2. **Verificar cron job ativo:**
   ```sql
   SELECT jobname, active, last_run_status
   FROM cron.job
   WHERE jobname = 'process-pending-notifications';
   ```

3. **Verificar logs edge function:**
   - Ir para Supabase Dashboard
   - Edge Functions → process-notifications → Logs

4. **Verificar notificações pendentes:**
   ```sql
   SELECT COUNT(*)
   FROM notifications
   WHERE status = 'pending'
   AND scheduled_for <= NOW();
   ```

### Emails não chegam:

1. Verificar RESEND_API_KEY configurado
2. Verificar domínio em Resend (usar domínio verificado em produção)
3. Verificar logs da função send-email
4. Verificar spam/lixo eletrônico

### SMS não chegam:

1. Verificar Twilio credentials configurados
2. Verificar saldo da conta Twilio
3. Verificar formato do número: deve ter +351
4. Verificar logs da função send-sms

---

## 📞 PRÓXIMOS PASSOS

1. **Configurar RESEND_API_KEY** (obrigatório)
2. **Configurar Twilio** (opcional - recomendado)
3. **Testar com booking real**
4. **Verificar recebimento de email/SMS**
5. **Monitorar logs por 24h**

---

## 📊 MONITORAMENTO

### Queries úteis:

```sql
-- Estatísticas de notificações
SELECT
  status,
  type,
  COUNT(*) as total
FROM notifications
GROUP BY status, type
ORDER BY status, type;

-- Falhas recentes
SELECT
  id,
  type,
  recipient_email,
  recipient_phone,
  error_message,
  retry_count,
  created_at
FROM notifications
WHERE status = 'failed'
ORDER BY created_at DESC
LIMIT 20;

-- Taxa de sucesso (últimas 24h)
SELECT
  type,
  COUNT(*) FILTER (WHERE status = 'sent') as enviados,
  COUNT(*) FILTER (WHERE status = 'failed') as falhados,
  ROUND(
    COUNT(*) FILTER (WHERE status = 'sent')::numeric /
    NULLIF(COUNT(*), 0) * 100,
    2
  ) as taxa_sucesso
FROM notifications
WHERE created_at > NOW() - interval '24 hours'
GROUP BY type;
```
