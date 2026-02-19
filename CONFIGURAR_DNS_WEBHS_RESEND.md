# 🎯 CONFIGURAR DNS WEBHS PARA RESEND - GUIA VISUAL

## ⚠️ ATENÇÃO: COPIA EXATAMENTE COMO ESTÁ AQUI

---

## 📋 Passo 1: Login no Resend

1. Vai a: **https://resend.com/login**
2. Faz login
3. Menu lateral: **Domains** → **Add Domain**
4. Adiciona: `despertoportugal.com`
5. Clica **Continue**

O Resend vai mostrar **3 REGISTOS DNS** que precisas adicionar.

---

## 🔑 Passo 2: Copiar os Registos do Resend

O Resend mostra algo assim:

### Registo 1: SPF
```
Type: TXT
Name: despertoportugal.com
Value: v=spf1 include:spf.resend.com ~all
```

### Registo 2: DKIM (⚠️ ESTE É O PROBLEMÁTICO)
```
Type: TXT
Name: resend._domainkey.despertoportugal.com
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... (texto gigante)
```

### Registo 3: DMARC
```
Type: TXT
Name: _dmarc.despertoportugal.com
Value: v=DMARC1; p=none;
```

---

## 🌐 Passo 3: Adicionar no WEBHS

### 📍 Registo 1: SPF (FÁCIL)

No painel WEBHS → Gestão DNS:

| Campo | O que colocar |
|-------|---------------|
| **Tipo** | `TXT` |
| **Nome/Host** | `@` |
| **Valor** | `v=spf1 include:spf.resend.com ~all` |
| **TTL** | `3600` (ou deixa default) |

✅ Clica **Adicionar**

---

### 📍 Registo 2: DKIM (⚠️ ATENÇÃO AQUI)

**O QUE O RESEND MOSTRA:**
```
Name: resend._domainkey.despertoportugal.com
Value: v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

**O QUE COLOCAS NO WEBHS:**

| Campo | O que colocar |
|-------|---------------|
| **Tipo** | `TXT` |
| **Nome/Host** | `resend._domainkey` (⚠️ SEM o `.despertoportugal.com`) |
| **Valor** | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...` |

⚠️ **NO VALOR: REMOVE O `v=DKIM1; k=rsa;` DO INÍCIO!**

O valor deve começar com `p=MII...` (só a chave pública).

Se o Resend mostrar:
```
v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

Tu colocas:
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

**OU** (se o teu painel DNS aceitar):
```
k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
```

✅ Clica **Adicionar**

---

### 📍 Registo 3: DMARC (FÁCIL)

No painel WEBHS → Gestão DNS:

| Campo | O que colocar |
|-------|---------------|
| **Tipo** | `TXT` |
| **Nome/Host** | `_dmarc` |
| **Valor** | `v=DMARC1; p=none;` |
| **TTL** | `3600` |

✅ Clica **Adicionar**

---

## 🔍 Passo 4: Verificar (IMPORTANTE)

### No WEBHS

Depois de adicionar os 3 registos, deves ter:

```
Tipo    Nome                      Valor
─────────────────────────────────────────────────────────────
TXT     @                         v=spf1 include:spf.resend.com ~all
TXT     resend._domainkey         p=MII... (texto enorme)
TXT     _dmarc                    v=DMARC1; p=none;
```

### No Resend

1. Volta ao Resend Dashboard
2. Clica em **Domains**
3. Clica em `despertoportugal.com`
4. Clica no botão **Verify DNS Records**
5. Aguarda 5-30 minutos
6. Refresca a página

Se tudo estiver correto, verás **3 checkmarks verdes** ✅✅✅

---

## ❌ ERROS COMUNS

### Erro: "DKIM record not found"

**Causa:** Colocaste o valor errado no registo DKIM.

**Solução:**
1. Remove o registo DKIM do WEBHS
2. Cria de novo
3. **NO VALOR: REMOVE `v=DKIM1; k=rsa;`**
4. Coloca só: `p=MII...`

---

### Erro: "SPF record syntax error"

**Causa:** Colocaste espaços extra ou caracteres inválidos.

**Solução:**
- O valor EXATO é: `v=spf1 include:spf.resend.com ~all`
- Copia e cola diretamente (não digites manualmente)

---

### Erro: "Ainda não verifica após 30 minutos"

**Causa:** DNS ainda não propagou.

**Solução:**
1. Aguarda até 24h (normalmente 1-2 horas)
2. Verifica com esta ferramenta: https://mxtoolbox.com/dkim.aspx
   - Coloca: `resend._domainkey.despertoportugal.com`
3. Se mostrar o registo → DNS propagou, volta ao Resend e clica **Verify**

---

## 🎯 RESUMO VISUAL

### O QUE O RESEND MOSTRA vs. O QUE COLOCAS NO WEBHS

#### SPF (igual em ambos):
```
Resend:  v=spf1 include:spf.resend.com ~all
WEBHS:   v=spf1 include:spf.resend.com ~all ✅ IGUAL
```

#### DKIM (⚠️ DIFERENTE):
```
Resend:  v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC...
WEBHS:   p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC... ⚠️ SEM v=DKIM1; k=rsa;
```

#### DMARC (igual em ambos):
```
Resend:  v=DMARC1; p=none;
WEBHS:   v=DMARC1; p=none; ✅ IGUAL
```

---

## 🚀 Depois de Verificar

Quando os 3 registos estiverem verificados (✅✅✅):

1. O Resend vai enviar emails de `contato@despertoportugal.com`
2. Os emails NÃO vão para spam
3. Podes testar com:

```sql
-- No Supabase SQL Editor
SELECT net.http_post(
  url := 'https://dnswlrvleqvsueawxzfy.supabase.co/functions/v1/send-email',
  headers := jsonb_build_object(
    'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTM4MTIyMiwiZXhwIjoyMDc0OTU3MjIyfQ.yl7b9TgaJYVmNMC1hQ-D60fwCZ7jwPp8EsK5dkBmguc',
    'Content-Type', 'application/json'
  ),
  body := jsonb_build_object(
    'to_email', 'teu_email@gmail.com',
    'to_name', 'Teste',
    'date', '2026-02-20',
    'time', '15:00',
    'location', 'Desperto'
  )
);
```

---

## 📞 Ainda com Problemas?

1. Tira screenshot dos 3 registos no WEBHS
2. Tira screenshot do erro no Resend
3. Envia-me
4. Vou ver exatamente o que está errado

**O registo DKIM é o único que precisa de atenção especial!**

---

**Data:** 2026-02-18
