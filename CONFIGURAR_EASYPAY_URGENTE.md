# CONFIGURAR EASYPAY MB WAY - URGENTE

## Problema Identificado

A Edge Function `easypay-mbway` está a retornar:
```
"Authentication failed"
Status: 500
```

Isto significa que as **credenciais da Easypay não estão configuradas** no Supabase.

---

## Solução: Configurar Secrets no Supabase

### Passo 1: Obter Credenciais Easypay

1. Aceda ao dashboard da Easypay: https://backoffice.easypay.pt/
2. Faça login com as suas credenciais
3. Vá a **Configurações** → **API Keys** (ou similar)
4. Copie:
   - **Account ID** (UUID formato: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
   - **API Key** (string longa)

**IMPORTANTE:** Se estiver em modo teste/sandbox, use as credenciais de teste:
- URL API Teste: `https://api.test.easypay.pt/2.0/`
- URL API Produção: `https://api.prod.easypay.pt/2.0/`

---

### Passo 2: Configurar Secrets no Supabase

Tem **2 opções** para configurar:

#### Opção A: Via Dashboard (Recomendado)

1. Aceda ao dashboard: https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy/settings/vault/secrets

2. Clique em **"New secret"**

3. Adicione o primeiro secret:
   - **Name:** `EASYPAY_ACCOUNT_ID`
   - **Value:** (cole o Account ID da Easypay)
   - Clique **"Save"**

4. Adicione o segundo secret:
   - **Name:** `EASYPAY_API_KEY`
   - **Value:** (cole a API Key da Easypay)
   - Clique **"Save"**

#### Opção B: Via SQL (Alternativa)

Execute no SQL Editor do Supabase:

```sql
-- Adicionar Account ID
INSERT INTO vault.secrets (name, secret)
VALUES ('EASYPAY_ACCOUNT_ID', 'SEU_ACCOUNT_ID_AQUI')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;

-- Adicionar API Key
INSERT INTO vault.secrets (name, secret)
VALUES ('EASYPAY_API_KEY', 'SUA_API_KEY_AQUI')
ON CONFLICT (name) DO UPDATE SET secret = EXCLUDED.secret;
```

---

### Passo 3: Reiniciar Edge Function

Após configurar os secrets, a Edge Function precisa ser reiniciada para carregar as novas variáveis.

**Opção 1:** Redeploy automático (aguardar 1-2 minutos)

**Opção 2:** Force redeploy:
- Vá ao dashboard Edge Functions
- Selecione `easypay-mbway`
- Clique em **"Redeploy"**

---

### Passo 4: Testar Novamente

1. Volte à aplicação
2. Vá ao menu **"Teste MB WAY"**
3. Insira um número: `912345678`
4. Insira valor: `10`
5. Clique **"Testar MB WAY"**

**Resultado Esperado:**
```json
{
  "success": true,
  "paymentId": "xxxxx-xxxxx-xxxxx",
  "phoneNumber": "912345678",
  "qrCodeUrl": "https://..."
}
```

---

## Configuração para Ambiente de Teste (Sandbox)

Se quiser usar o ambiente de teste da Easypay primeiro:

1. Obtenha credenciais de teste no dashboard Easypay
2. Configure os mesmos secrets com as credenciais de teste
3. **Altere a URL** na Edge Function:

```typescript
// Em: supabase/functions/easypay-mbway/index.ts
// LINHA 56 - mudar de:
const response = await fetch("https://api.prod.easypay.pt/2.0/single", {

// Para:
const response = await fetch("https://api.test.easypay.pt/2.0/single", {
```

---

## Verificar se Secrets Estão Configurados

Para verificar se os secrets foram criados (sem revelar os valores):

```sql
SELECT name, created_at
FROM vault.secrets
WHERE name IN ('EASYPAY_ACCOUNT_ID', 'EASYPAY_API_KEY');
```

Deve retornar 2 linhas.

---

## Troubleshooting

### Erro: "Authentication failed"
- **Causa:** Credenciais inválidas ou não configuradas
- **Solução:** Verifique se os secrets estão corretos

### Erro: "Contact administrator to configure Easypay"
- **Causa:** Secrets não foram encontrados
- **Solução:** Configure os secrets e aguarde 1-2 minutos

### Erro: "Invalid phone number"
- **Causa:** Número de telefone inválido
- **Solução:** Use formato português: `912345678` ou `+351912345678`

### Pagamento não aparece na app MB WAY
- **Causa:** Ambiente errado (teste vs produção)
- **Solução:**
  - Se usar credenciais de teste, só funciona na app MB WAY de teste
  - Se usar credenciais de produção, funciona na app normal

---

## Links Úteis

- Dashboard Supabase: https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy
- Secrets: https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy/settings/vault/secrets
- Edge Functions: https://supabase.com/dashboard/project/dnswlrvleqvsueawxzfy/functions
- Easypay Dashboard: https://backoffice.easypay.pt/
- Documentação Easypay API: https://docs.easypay.pt/

---

## Próximos Passos Após Configuração

Depois de configurar e testar com sucesso:

1. Teste fazer um pagamento real de 0.50€
2. Aprove na app MB WAY
3. Verifique se o status muda para "paid"
4. Integre no fluxo de reservas normal

---

**NOTA IMPORTANTE:**
- As credenciais devem ser mantidas em segredo
- NUNCA adicione credenciais no código ou no `.env` do frontend
- Use sempre o Supabase Vault para secrets sensíveis
