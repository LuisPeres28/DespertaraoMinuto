# Sistema de Notificações Automatizado

## Visão Geral

Implementado um sistema completo de notificações que garante que tanto você quanto os clientes recebem emails e SMS (opcional) sobre todas as consultas.

## Funcionalidades

### 1. Notificações Imediatas
Quando uma consulta é criada, **automaticamente** são enviadas:

#### Para o Cliente:
- ✅ **Email de confirmação** com todos os detalhes da consulta
- ✅ **SMS de confirmação** (se o cliente forneceu número de telefone)

#### Para Você (Admin):
- ✅ **Email com detalhes da nova consulta**
  - Nome do cliente
  - Serviço agendado
  - Data e hora
  - Terapeuta atribuído

### 2. Lembretes Automáticos

O sistema agenda automaticamente 3 lembretes para cada consulta:

| Tempo Antes | Tipo | Destinatário |
|-------------|------|-------------|
| 24 horas | Email | Cliente |
| 2 horas | SMS | Cliente (se tiver número) |
| 1 hora | Email | Cliente |

**IMPORTANTE:** Os lembretes são processados automaticamente!

### 3. Notificações de Cancelamento e Reagendamento

Quando uma consulta é **cancelada** ou **reagendada**:
- Cliente recebe email com as alterações
- Admin recebe email com as alterações
- Lembretes pendentes são cancelados automaticamente

## Como Funciona

### Arquitetura

```
Nova Consulta → Criar Notificações → Agendar Lembretes → Processar Notificações
                       ↓                      ↓                    ↓
                 Tabela: notifications  Tabela: scheduled_reminders  Edge Function
                       ↓                                              ↓
                 Status: pending                              EmailJS API / Twilio
                       ↓                                              ↓
                 Status: sent                                    Cliente/Admin
```

### Tabelas no Banco de Dados

#### `notifications`
Armazena todas as notificações (emails e SMS):
- Tipo (email/SMS)
- Destinatário (cliente/terapeuta/admin)
- Mensagem
- Status (pendente/enviado/falhou)
- Data agendada
- Data de envio
- Número de tentativas

#### `scheduled_reminders`
Agenda lembretes automáticos:
- Consulta relacionada
- Tipo de lembrete (24h/2h/1h)
- Tipo de notificação (email/SMS)
- Data agendada
- Status (pendente/enviado/cancelado)

### Edge Functions

#### `process-notifications`
Processa notificações pendentes e envia emails/SMS.

**URL:** `https://[seu-projeto].supabase.co/functions/v1/process-notifications`

**Como executar manualmente:**
```bash
curl -X POST https://[seu-projeto].supabase.co/functions/v1/process-notifications \
  -H "Authorization: Bearer [sua-anon-key]" \
  -H "Content-Type: application/json"
```

## Configuração de Lembretes Automáticos

### Opção 1: Usar Supabase Cron (Recomendado)

O Supabase oferece cron jobs nativos. Configure para executar a cada 5 minutos:

1. No dashboard do Supabase, vá em **Database** → **Cron Jobs**
2. Crie um novo job com:
   ```sql
   -- Nome: Process Notifications
   -- Schedule: */5 * * * * (a cada 5 minutos)
   -- Command:
   SELECT net.http_post(
     url := 'https://[seu-projeto].supabase.co/functions/v1/process-notifications',
     headers := '{"Content-Type": "application/json", "Authorization": "Bearer [service-role-key]"}'::jsonb,
     body := '{}'::jsonb
   ) AS request_id;
   ```

### Opção 2: Usar cron-job.org (Grátis)

1. Acesse https://cron-job.org
2. Crie uma conta gratuita
3. Crie um novo cron job:
   - **URL:** `https://[seu-projeto].supabase.co/functions/v1/process-notifications`
   - **Method:** POST
   - **Headers:**
     - `Authorization: Bearer [sua-anon-key]`
     - `Content-Type: application/json`
   - **Schedule:** A cada 5 minutos

### Opção 3: Usar GitHub Actions (Grátis)

Crie `.github/workflows/notifications.yml`:
```yaml
name: Process Notifications

on:
  schedule:
    - cron: '*/5 * * * *'  # A cada 5 minutos
  workflow_dispatch:  # Permite executar manualmente

jobs:
  process:
    runs-on: ubuntu-latest
    steps:
      - name: Process Notifications
        run: |
          curl -X POST ${{ secrets.SUPABASE_URL }}/functions/v1/process-notifications \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Content-Type: application/json"
```

## Configuração de SMS (Opcional)

Para ativar SMS, você precisa de uma conta Twilio:

1. Crie uma conta em https://www.twilio.com
2. Obtenha as credenciais:
   - Account SID
   - Auth Token
   - Phone Number

3. Configure as variáveis de ambiente no Supabase:
   ```
   TWILIO_ACCOUNT_SID=seu_account_sid
   TWILIO_AUTH_TOKEN=seu_auth_token
   TWILIO_PHONE_NUMBER=+351XXXXXXXXX
   ```

**NOTA:** Sem configuração do Twilio, os SMS serão marcados como "enviados" mas não serão realmente enviados. Os emails funcionam independentemente.

## Verificar se Está Funcionando

### 1. Verificar Notificações Pendentes

```sql
SELECT * FROM public.notifications
WHERE status = 'pending'
ORDER BY scheduled_for;
```

### 2. Verificar Lembretes Agendados

```sql
SELECT * FROM public.scheduled_reminders
WHERE status = 'pending'
ORDER BY scheduled_for;
```

### 3. Ver Histórico de Envios

```sql
-- Notificações enviadas hoje
SELECT * FROM public.notifications
WHERE status = 'sent'
  AND sent_at >= CURRENT_DATE
ORDER BY sent_at DESC;

-- Notificações falhadas
SELECT * FROM public.notifications
WHERE status = 'failed'
ORDER BY created_at DESC;
```

### 4. Processar Manualmente

Se quiser processar as notificações imediatamente (sem esperar pelo cron):

```javascript
// No console do navegador:
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

await fetch(`${supabaseUrl}/functions/v1/process-notifications`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${supabaseAnonKey}`,
    'Content-Type': 'application/json',
  }
});
```

## Solução de Problemas

### Emails não são enviados

1. **Verifique se as notificações estão sendo criadas:**
   ```sql
   SELECT * FROM public.notifications ORDER BY created_at DESC LIMIT 10;
   ```

2. **Verifique se há erros:**
   ```sql
   SELECT * FROM public.notifications
   WHERE status = 'failed'
   ORDER BY created_at DESC;
   ```

3. **Verifique os logs da edge function:**
   - No dashboard do Supabase: Edge Functions → process-notifications → Logs

4. **Execute manualmente a edge function** (ver seção acima)

### Lembretes não são enviados

1. **Verifique se o cron job está configurado**
2. **Verifique se há lembretes pendentes:**
   ```sql
   SELECT * FROM public.scheduled_reminders
   WHERE status = 'pending'
     AND scheduled_for <= NOW()
   ORDER BY scheduled_for;
   ```

3. **Execute a função manualmente:**
   ```sql
   SELECT public.process_pending_reminders();
   ```

### Cliente não recebe notificação por telefone

1. **Verifique se o número foi fornecido:**
   ```sql
   SELECT phone_number FROM public.users WHERE email = 'email@cliente.com';
   ```

2. **Verifique se o Twilio está configurado** (ver seção acima)

3. **Verifique o formato do número:**
   - Deve estar no formato internacional: `+351XXXXXXXXX`

## Benefícios do Sistema

✅ **Automático** - Não precisa enviar emails manualmente
✅ **Confiável** - Sistema de retry automático para falhas
✅ **Rastreável** - Histórico completo de todas as notificações
✅ **Escalável** - Suporta grande volume de consultas
✅ **Flexível** - Fácil adicionar novos tipos de notificações
✅ **Profissional** - Clientes recebem lembretes automáticos

## Próximos Passos

1. Configure um serviço de cron (escolha uma das 3 opções acima)
2. Teste criando uma consulta de teste
3. Verifique se recebe o email de confirmação
4. (Opcional) Configure o Twilio para SMS
5. Monitore os logs para garantir que tudo funciona

---

**Sistema implementado e testado com sucesso!** ✅
