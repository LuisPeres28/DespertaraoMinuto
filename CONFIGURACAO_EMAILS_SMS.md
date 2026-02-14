# Configuração de Emails e SMS Automáticos

Este guia explica como configurar o sistema de emails e SMS automáticos para notificações de agendamentos, lembretes e cancelamentos.

## 📧 Parte 1: Configuração de Emails (EmailJS)

### Passo 1: Criar Conta EmailJS

1. Aceda a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Clique em **Sign Up** e crie uma conta gratuita
3. Confirme o seu email

### Passo 2: Adicionar Serviço de Email

1. No dashboard EmailJS, clique em **Email Services**
2. Clique em **Add New Service**
3. Escolha o seu provedor de email:
   - **Gmail** (recomendado para começar)
   - Outlook
   - Yahoo
   - Outro SMTP
4. Para Gmail:
   - Clique em **Connect Account**
   - Faça login com a conta Gmail que vai enviar os emails
   - Autorize o EmailJS
5. Guarde o **Service ID** (exemplo: `service_xyz123`)

### Passo 3: Criar Templates de Email

#### Template 1: Confirmação de Agendamento

1. No dashboard, clique em **Email Templates**
2. Clique em **Create New Template**
3. Nome: **Confirmação de Agendamento**
4. Cole este conteúdo:

```
Subject: Confirmação de Agendamento - Desperto

Olá {{to_name}},

O seu agendamento foi confirmado com sucesso!

📅 Detalhes do Agendamento:
- Data: {{date}}
- Hora: {{time}}
- Localização: {{location}}

{{message}}

Por favor, chegue 5 minutos antes da hora marcada.

Obrigado por escolher a Desperto!

Com os melhores cumprimentos,
Equipa Desperto
euestoudesperto@gmail.com
```

5. Clique em **Save**
6. Guarde o **Template ID** (exemplo: `template_abc456`)

#### Template 2: Lembrete de Consulta

1. Crie um novo template
2. Nome: **Lembrete de Consulta**
3. Cole este conteúdo:

```
Subject: Lembrete: Consulta hoje - {{service_name}}

Olá {{to_name}},

Este é um lembrete da sua consulta marcada para hoje.

📅 Detalhes:
- Serviço: {{service_name}}
- Hora: {{time}}
- Localização: {{location}}

Aguardamos por si!

Equipa Desperto
euestoudesperto@gmail.com
```

4. Guarde o **Template ID**

#### Template 3: Reagendamento

1. Crie um novo template
2. Nome: **Notificação de Reagendamento**
3. Cole este conteúdo:

```
Subject: Consulta Reagendada - Desperto

Administrador,

Um cliente reagendou a sua consulta:

Cliente: {{name}} ({{email}})
Serviço: {{service}}

Data Anterior: {{date}}
Nova Data: {{new_date}}

Motivo: {{notes}}

---
Sistema de Gestão Desperto
```

4. Guarde o **Template ID**

### Passo 4: Obter a Public Key

1. No dashboard, clique em **Account**
2. Encontre a **Public Key** (exemplo: `abc123XYZ456`)
3. Copie esta chave

### Passo 5: Configurar Variáveis de Ambiente

1. Abra o ficheiro `.env` no projeto
2. Adicione ou atualize estas linhas:

```env
# EmailJS Configuration
VITE_EMAILJS_SERVICE_ID=service_xyz123
VITE_EMAILJS_TEMPLATE_ID=template_abc456
VITE_EMAILJS_RESCHEDULE_TEMPLATE_ID=template_def789
VITE_EMAILJS_PUBLIC_KEY=abc123XYZ456
```

3. Substitua pelos seus valores reais
4. Guarde o ficheiro

### Passo 6: Testar Emails

Os emails são enviados automaticamente quando:
- ✅ Um cliente faz um agendamento
- ✅ Um agendamento é reagendado
- ✅ Um agendamento é cancelado
- ✅ Lembretes automáticos (24h e 2h antes)

## 📱 Parte 2: Configuração de SMS (Twilio)

### Passo 1: Criar Conta Twilio

1. Aceda a [https://www.twilio.com/try-twilio](https://www.twilio.com/try-twilio)
2. Clique em **Sign up** e crie uma conta gratuita
3. Complete o processo de verificação

### Passo 2: Obter Credenciais

1. No dashboard Twilio, vá para **Account** > **API keys & tokens**
2. Copie:
   - **Account SID** (exemplo: `AC1234567890abcdef`)
   - **Auth Token** (clique em **Show** para ver)
3. Vá para **Phone Numbers** > **Manage** > **Active numbers**
4. Copie o seu **Phone Number** (exemplo: `+1234567890`)

### Passo 3: Configurar Variáveis de Ambiente

1. Abra o ficheiro `.env`
2. Adicione estas linhas:

```env
# Twilio Configuration (for SMS)
TWILIO_ACCOUNT_SID=AC1234567890abcdef
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
```

3. Substitua pelos seus valores reais
4. Guarde o ficheiro

### Passo 4: Verificar Números de Teste (Conta Gratuita)

Se estiver a usar uma conta trial do Twilio:

1. Vá para **Phone Numbers** > **Manage** > **Verified Caller IDs**
2. Clique em **Add a new Caller ID**
3. Adicione os números de telefone que quer testar
4. Confirme via SMS ou chamada

**Nota:** Contas gratuitas só podem enviar SMS para números verificados.

## 🔄 Parte 3: Configuração de Notificações Automáticas

### Cron Jobs no Supabase

O sistema usa cron jobs para processar notificações automaticamente.

#### Verificar Cron Jobs Existentes

Execute este SQL no Supabase SQL Editor:

```sql
SELECT * FROM cron.job;
```

#### Ativar Processamento Automático

Os seguintes cron jobs devem estar ativos:

**1. Processar Notificações Pendentes (a cada 5 minutos)**
```sql
SELECT cron.schedule(
  'process-pending-notifications',
  '*/5 * * * *', -- A cada 5 minutos
  $$
  SELECT net.http_post(
    url := 'https://your-project.supabase.co/functions/v1/process-notifications',
    headers := jsonb_build_object(
      'Authorization', 'Bearer your-service-role-key',
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  ) as request_id;
  $$
);
```

**2. Criar Lembretes Automáticos (a cada hora)**
```sql
SELECT cron.schedule(
  'create-booking-reminders',
  '0 * * * *', -- De hora em hora
  $$
  -- Criar lembrete 24h antes
  INSERT INTO scheduled_reminders (
    booking_id,
    reminder_type,
    scheduled_for,
    status
  )
  SELECT
    b.id,
    '24h',
    b.date - INTERVAL '24 hours',
    'pending'
  FROM bookings b
  WHERE b.status = 'confirmed'
    AND b.date > NOW()
    AND b.date <= NOW() + INTERVAL '25 hours'
    AND NOT EXISTS (
      SELECT 1 FROM scheduled_reminders sr
      WHERE sr.booking_id = b.id
      AND sr.reminder_type = '24h'
    );

  -- Criar lembrete 2h antes
  INSERT INTO scheduled_reminders (
    booking_id,
    reminder_type,
    scheduled_for,
    status
  )
  SELECT
    b.id,
    '2h',
    b.date - INTERVAL '2 hours',
    'pending'
  FROM bookings b
  WHERE b.status = 'confirmed'
    AND b.date > NOW()
    AND b.date <= NOW() + INTERVAL '3 hours'
    AND NOT EXISTS (
      SELECT 1 FROM scheduled_reminders sr
      WHERE sr.booking_id = b.id
      AND sr.reminder_type = '2h'
    );
  $$
);
```

### Configurar no Supabase Dashboard

1. Aceda ao seu projeto Supabase
2. Vá para **Database** > **Extensions**
3. Ative a extensão **pg_cron** se ainda não estiver ativa
4. Vá para **SQL Editor**
5. Cole e execute os comandos SQL acima
6. Substitua `your-project.supabase.co` pelo URL do seu projeto
7. Substitua `your-service-role-key` pela sua service role key

## 📊 Parte 4: Monitorização

### Ver Notificações Pendentes

```sql
SELECT * FROM notifications
WHERE status = 'pending'
ORDER BY scheduled_for;
```

### Ver Lembretes Agendados

```sql
SELECT
  sr.*,
  b.date as booking_date,
  c.name as client_name,
  c.email as client_email
FROM scheduled_reminders sr
JOIN bookings b ON b.id = sr.booking_id
JOIN users c ON c.id = b.client_id
WHERE sr.status = 'pending'
ORDER BY sr.scheduled_for;
```

### Ver Histórico de Notificações Enviadas

```sql
SELECT
  type,
  recipient_email,
  subject,
  status,
  sent_at,
  error_message
FROM notifications
WHERE status IN ('sent', 'failed')
ORDER BY sent_at DESC
LIMIT 50;
```

## 🔧 Parte 5: Resolução de Problemas

### Emails não estão a ser enviados

1. **Verificar credenciais EmailJS:**
   - As variáveis de ambiente estão corretas?
   - O Service ID, Template ID e Public Key estão certos?

2. **Verificar limites:**
   - Conta gratuita EmailJS: 200 emails/mês
   - Verifique em [https://dashboard.emailjs.com/](https://dashboard.emailjs.com/)

3. **Verificar logs:**
   - Abra o Console do navegador (F12)
   - Procure por erros com `❌` ou `⚠️`

4. **Testar Edge Function:**
   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/send-email \
     -H "Authorization: Bearer your-anon-key" \
     -H "Content-Type: application/json" \
     -d '{
       "to_email": "test@example.com",
       "to_name": "Test User",
       "date": "01/01/2024",
       "time": "10:00",
       "location": "Desperto"
     }'
   ```

### SMS não estão a ser enviados

1. **Verificar credenciais Twilio:**
   - Account SID correto?
   - Auth Token correto?
   - Phone Number com código do país (ex: +351...)?

2. **Verificar conta trial:**
   - O número de destino está verificado?
   - Tem crédito disponível?

3. **Verificar logs Twilio:**
   - Aceda a [https://console.twilio.com/](https://console.twilio.com/)
   - Vá para **Monitor** > **Logs** > **Messaging**

### Notificações não são processadas automaticamente

1. **Verificar pg_cron:**
   ```sql
   SELECT * FROM cron.job WHERE jobname LIKE '%notification%';
   ```

2. **Verificar última execução:**
   ```sql
   SELECT * FROM cron.job_run_details
   ORDER BY start_time DESC
   LIMIT 10;
   ```

3. **Executar manualmente:**
   ```sql
   -- Processar notificações agora
   SELECT net.http_post(
     url := 'https://your-project.supabase.co/functions/v1/process-notifications',
     headers := jsonb_build_object(
       'Authorization', 'Bearer your-service-role-key',
       'Content-Type', 'application/json'
     ),
     body := '{}'::jsonb
   );
   ```

## 📝 Notas Importantes

### Limites das Contas Gratuitas

**EmailJS (Free Plan):**
- 200 emails/mês
- 1 serviço de email
- Templates ilimitados

**Twilio (Trial):**
- $15.50 crédito inicial
- SMS ~$0.0075 cada (Portugal)
- Só números verificados
- Mensagens com prefixo "Sent from your Twilio trial account"

### Upgrade para Produção

**EmailJS:**
- Personal Plan: $7/mês - 1000 emails
- Professional: $15/mês - 5000 emails
- [Comparar planos](https://www.emailjs.com/pricing/)

**Twilio:**
- Pay-as-you-go: sem mensalidade
- SMS Portugal: ~€0.075 cada
- Remover restrições de trial
- [Upgrade aqui](https://console.twilio.com/billing)

### Segurança

1. **NUNCA** commite o ficheiro `.env`
2. Use `.env.example` como template
3. No Netlify/Vercel, configure as variáveis de ambiente no dashboard
4. Twilio Auth Token deve ser mantido secreto
5. EmailJS Public Key pode ser pública (é usada no frontend)

## ✅ Checklist de Configuração

- [ ] Conta EmailJS criada
- [ ] Serviço de email configurado no EmailJS
- [ ] Templates de email criados (confirmação, lembrete, reagendamento)
- [ ] Variáveis EmailJS adicionadas ao `.env`
- [ ] Emails testados manualmente
- [ ] Conta Twilio criada (se usar SMS)
- [ ] Credenciais Twilio adicionadas ao `.env`
- [ ] Números de teste verificados (trial)
- [ ] SMS testado manualmente
- [ ] Extensão pg_cron ativada no Supabase
- [ ] Cron job de processamento configurado
- [ ] Cron job de lembretes configurado
- [ ] Monitorização testada com queries SQL

## 🎯 Próximos Passos

1. Configure EmailJS primeiro (mais simples)
2. Teste emails manualmente fazendo um agendamento
3. Configure SMS se necessário
4. Configure cron jobs para automação
5. Monitore logs por 24-48h
6. Ajuste frequência dos cron jobs se necessário

## 📞 Suporte

Se tiver problemas:
1. Consulte os logs do navegador (Console)
2. Consulte logs do Supabase (SQL Editor)
3. Consulte logs do Twilio (se usar SMS)
4. Verifique limites da conta
5. Teste cada componente individualmente

---

**Última atualização:** 2026-02-14
