# 🔑 Como Configurar Secrets no Supabase (URGENTE)

## ⏱️ Tempo necessário: 5 minutos

Este guia mostra como configurar os secrets necessários para que os emails comecem a ser enviados automaticamente.

---

## 📋 PASSO A PASSO

### 1. Aceder ao Dashboard do Supabase

1. Ir para: https://supabase.com/dashboard
2. Fazer login com a conta
3. Selecionar o projeto: `dnswlrvleqvsueawxzfy`

### 2. Navegar para Edge Functions

1. No menu lateral esquerdo, clicar em **Edge Functions**
2. Clicar no botão **"Manage secrets"** (canto superior direito)
   - Ou ir diretamente para: Settings → Edge Functions → Secrets

### 3. Adicionar o Secret do SendGrid

1. Vai aparecer uma lista de secrets (provavelmente vazia)
2. Clicar no botão **"New secret"** ou **"Add new secret"**
3. Preencher:
   - **Name**: `SENDGRID_API_KEY`
   - **Value**: `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`
4. Clicar em **"Save"** ou **"Add secret"**

### 4. Verificar que o Secret Foi Adicionado

Deve aparecer na lista:
```
SENDGRID_API_KEY = ********************* (hidden)
```

### 5. (OPCIONAL) Adicionar Secrets do Twilio para SMS

Se quiser enviar SMS, repetir o processo para cada um:

**Secret 1:**
- **Name**: `TWILIO_ACCOUNT_SID`
- **Value**: (obter em https://www.twilio.com/console)

**Secret 2:**
- **Name**: `TWILIO_AUTH_TOKEN`
- **Value**: (obter em https://www.twilio.com/console)

**Secret 3:**
- **Name**: `TWILIO_PHONE_NUMBER`
- **Value**: (número comprado no Twilio, formato: +351912345678)

---

## ✅ VERIFICAR SE ESTÁ A FUNCIONAR

### Método 1: Testar Imediatamente

1. Criar uma nova marcação no sistema
2. Usar o email: `euestoudesperto@gmail.com` (ou qualquer email em modo de teste)
3. Aguardar 1-2 minutos
4. Verificar se recebeu o email de confirmação

### Método 2: Verificar Logs das Edge Functions

1. No Supabase Dashboard, ir para **Edge Functions**
2. Clicar na função `process-notifications`
3. Ir para o tab **Logs**
4. Procurar por logs recentes:
   - ✅ `Email sent successfully` → Funcionou!
   - ❌ `SENDGRID_API_KEY not configured` → Secret não foi adicionado corretamente

### Método 3: Verificar Base de Dados

Executar este SQL no Supabase SQL Editor:

```sql
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

**O que procurar:**
- `status = 'sent'` → Email enviado com sucesso ✅
- `status = 'failed'` → Erro ao enviar (ver error_message) ❌
- `status = 'pending'` → Aguardando envio (normal para emails agendados) ⏳

---

## ⚠️ IMPORTANTE

### Sobre o Modo de Teste da SendGrid

Com a configuração atual, os emails **SÓ podem ser enviados para**:
- ✅ `euestoudesperto@gmail.com`

Para enviar para **outros emails** (clientes), é necessário:
1. Verificar um domínio na SendGrid
2. Ver: `PROBLEMA_EMAILS_SMS.md` → Solução 2A

### As Edge Functions Não Precisam Ser Redeploy

**Boa notícia:** Depois de adicionar os secrets, as Edge Functions vão automaticamente começar a usá-los. **Não é necessário fazer redeploy!**

---

## 🚨 PROBLEMAS COMUNS

### Problema: "Secret não aparece na lista"
**Solução:** Recarregar a página. Pode demorar alguns segundos a aparecer.

### Problema: "Ainda recebo erro 'SENDGRID_API_KEY not configured'"
**Soluções:**
1. Verificar que o nome do secret está **exatamente**: `SENDGRID_API_KEY` (maiúsculas)
2. Aguardar 1-2 minutos para o sistema aplicar as mudanças
3. Verificar que o secret foi adicionado no projeto correto (`dnswlrvleqvsueawxzfy`)

### Problema: "Email é enviado mas não chega"
**Possíveis causas:**
1. **Modo de teste da SendGrid**: Só envia para euestoudesperto@gmail.com
2. **Pasta de spam**: Verificar a pasta de spam/lixo
3. **Email inválido**: Verificar que o email do cliente está correto na base de dados

---

## 📊 ESTADO ATUAL

**Notificações Pendentes:** 4 emails
- São lembretes agendados para o futuro
- Vão ser enviados automaticamente nas datas agendadas
- **Depois de configurar o secret**, estes emails vão ser enviados corretamente

---

## 🎯 PRÓXIMO PASSO

Depois de configurar o secret:
1. ✅ Testar criando uma marcação
2. ✅ Verificar se recebe o email
3. 📖 Ler `PROBLEMA_EMAILS_SMS.md` para entender como enviar para outros emails (verificar domínio)

---

## ❓ DÚVIDAS?

Se continuar com problemas:
1. Verificar os logs das Edge Functions no Supabase
2. Executar o SQL de verificação (Método 3 acima)
3. Verificar que o secret `SENDGRID_API_KEY` está correto e sem espaços extras
