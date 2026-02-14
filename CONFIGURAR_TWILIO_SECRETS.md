# Como Configurar Secrets do Twilio no Supabase

Este guia explica como configurar as credenciais do Twilio como secrets nas Edge Functions do Supabase.

## Por que usar Secrets?

As credenciais do Twilio (Account SID, Auth Token) são **extremamente sensíveis** e nunca devem ser expostas no código frontend. Por isso, são configuradas como secrets nas Edge Functions do Supabase.

## 📝 Passo 1: Obter Credenciais do Twilio

1. Aceda a [https://console.twilio.com/](https://console.twilio.com/)
2. Faça login na sua conta
3. No dashboard, encontre:
   - **Account SID** (exemplo: `AC1234567890abcdef1234567890abcd`)
   - **Auth Token** (clique em "Show" para ver)
4. Vá para **Phone Numbers** > **Manage** > **Active numbers**
5. Copie o seu **Phone Number** (exemplo: `+1234567890`)

## 🔧 Passo 2: Configurar Secrets no Supabase

### Opção A: Via Supabase CLI (Recomendado)

1. **Instalar Supabase CLI** (se ainda não tiver):
   ```bash
   npm install -g supabase
   ```

2. **Login no Supabase**:
   ```bash
   supabase login
   ```

3. **Link ao seu projeto**:
   ```bash
   supabase link --project-ref your-project-ref
   ```

   O `project-ref` está no URL do seu projeto: `https://your-project-ref.supabase.co`

4. **Configurar os secrets**:
   ```bash
   # Definir Account SID
   supabase secrets set TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd

   # Definir Auth Token
   supabase secrets set TWILIO_AUTH_TOKEN=your_auth_token_here

   # Definir Phone Number
   supabase secrets set TWILIO_PHONE_NUMBER=+1234567890
   ```

5. **Verificar secrets configurados**:
   ```bash
   supabase secrets list
   ```

### Opção B: Via Dashboard Supabase

1. Aceda ao seu projeto no [Supabase Dashboard](https://app.supabase.com/)
2. Vá para **Edge Functions** no menu lateral
3. Clique em **Settings** (ícone de engrenagem)
4. Na secção **Function Secrets**, adicione:
   - Name: `TWILIO_ACCOUNT_SID` → Value: `AC1234567890...`
   - Name: `TWILIO_AUTH_TOKEN` → Value: `your_auth_token`
   - Name: `TWILIO_PHONE_NUMBER` → Value: `+1234567890`
5. Clique em **Add Secret** para cada um

## ✅ Passo 3: Verificar Configuração

Depois de configurar os secrets, teste o envio de SMS:

```bash
curl -X POST https://your-project.supabase.co/functions/v1/send-sms \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+351912345678",
    "message": "Teste de SMS da Desperto!"
  }'
```

Resposta esperada:
```json
{
  "success": true,
  "message": "SMS sent successfully",
  "details": {
    "sid": "SM...",
    "status": "queued",
    "to": "+351912345678"
  }
}
```

## 🔍 Passo 4: Verificar Logs

### Logs no Supabase

1. Aceda ao Supabase Dashboard
2. Vá para **Edge Functions**
3. Clique na função **send-sms**
4. Vá para **Logs**
5. Procure por erros ou mensagens de sucesso

### Logs no Twilio

1. Aceda ao [Twilio Console](https://console.twilio.com/)
2. Vá para **Monitor** > **Logs** > **Messaging**
3. Veja os SMS enviados e seu status

## 📱 Formatos de Número de Telefone

### Portugal
- **Formato correto:** `+351912345678`
- **Formato incorreto:** `912345678` (sem código do país)

### Internacional
- Sempre use o formato E.164: `+[código país][número]`
- Exemplos:
  - Reino Unido: `+447123456789`
  - Brasil: `+5511987654321`
  - EUA: `+14155551234`

## 🚨 Resolução de Problemas

### Erro: "Twilio credentials not configured"

**Causa:** Os secrets não foram configurados corretamente.

**Solução:**
1. Verifique se os secrets foram criados:
   ```bash
   supabase secrets list
   ```
2. Reconfigure os secrets se necessário
3. Espere 1-2 minutos para propagação
4. Tente novamente

### Erro: "Unable to create record"

**Causa:** Número de destino inválido ou não verificado (conta trial).

**Solução para conta trial:**
1. Aceda ao [Twilio Console](https://console.twilio.com/)
2. Vá para **Phone Numbers** > **Manage** > **Verified Caller IDs**
3. Adicione e verifique o número de destino
4. Tente enviar SMS novamente

**Solução para produção:**
- Faça upgrade da conta Twilio para remover restrições

### Erro: "Authentication failed"

**Causa:** Account SID ou Auth Token incorretos.

**Solução:**
1. Verifique as credenciais no Twilio Console
2. Reconfigure os secrets com os valores corretos
3. Tente novamente

### SMS não é recebido

**Possíveis causas:**
1. Número de destino incorreto
2. Operadora bloqueou SMS
3. País não suportado pelo Twilio
4. Conta trial sem número verificado

**Verificar:**
1. Logs do Twilio: status da mensagem
2. Formato do número: deve ter `+` e código do país
3. Crédito disponível na conta Twilio

## 💰 Custos

### Conta Trial (Gratuita)
- $15.50 crédito inicial
- SMS para números verificados apenas
- Prefixo em todas as mensagens: "Sent from your Twilio trial account"

### Conta Produção
- Sem mensalidade (pay-as-you-go)
- **Preços Portugal (2024):**
  - SMS enviado: ~€0.075 cada
  - SMS recebido: ~€0.0075 cada
- Sem restrições de números
- Sem prefixo nas mensagens

### Estimativa de Custos Mensais

Assumindo 100 agendamentos/mês com 2 SMS cada (confirmação + lembrete):
- 200 SMS × €0.075 = **€15/mês**

Assumindo 500 agendamentos/mês:
- 1000 SMS × €0.075 = **€75/mês**

## 🔐 Segurança

### Boas Práticas

1. **NUNCA** exponha o Auth Token no código frontend
2. **NUNCA** commite secrets no Git
3. Use os secrets do Supabase Edge Functions
4. Rotacione o Auth Token periodicamente
5. Use números de teste em desenvolvimento

### Rodar o Auth Token

1. Vá para [Twilio Console](https://console.twilio.com/)
2. Settings > API Keys & Tokens
3. Click em "View secret keys"
4. Gere um novo Auth Token
5. Atualize o secret no Supabase:
   ```bash
   supabase secrets set TWILIO_AUTH_TOKEN=new_auth_token
   ```

## 🎯 Próximos Passos

Depois de configurar:

1. ✅ Teste o envio de SMS manualmente
2. ✅ Configure os cron jobs (ver `SETUP_CRON_JOBS_AUTOMATICOS.sql`)
3. ✅ Faça um agendamento de teste
4. ✅ Verifique se recebe SMS de confirmação
5. ✅ Monitore os logs por 24-48h

## 📚 Recursos Úteis

- [Documentação Twilio SMS](https://www.twilio.com/docs/sms)
- [Supabase Edge Functions Secrets](https://supabase.com/docs/guides/functions/secrets)
- [Twilio Console](https://console.twilio.com/)
- [Verificar números (Trial)](https://console.twilio.com/us1/develop/phone-numbers/manage/verified)
- [Preços Twilio SMS](https://www.twilio.com/pricing/messaging)

---

**Última atualização:** 2026-02-14
