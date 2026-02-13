# Como Resolver o Erro 404 no Netlify

## Problema
A aplicação está a dar "Page not found" no Netlify.

## Causa
Faltam as variáveis de ambiente no Netlify.

## Solução Rápida

### 1. Entrar no Netlify
1. Vai a https://app.netlify.com
2. Seleciona o site "fanciful-pixie-cb053a"

### 2. Configurar Variáveis de Ambiente
1. Vai a **Site settings** → **Environment variables**
2. Clica em **Add a variable**
3. Adiciona estas variáveis (uma de cada vez):

```
VITE_SUPABASE_URL = https://pshszuykwuzbwxnkqlhc.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaHN6dXlrd3V6Ynd4bmtxbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDI5MzYsImV4cCI6MjA1MjAxODkzNn0.j_3nzj0A9BbxFPOJB0T-YEsZLEKxMEqHpDjxMILpYwA
```

**OPCIONAL (para emails):**
```
VITE_EMAILJS_SERVICE_ID = (se tiveres)
VITE_EMAILJS_TEMPLATE_ID = (se tiveres)
VITE_EMAILJS_RESCHEDULE_TEMPLATE_ID = (se tiveres)
VITE_EMAILJS_PUBLIC_KEY = (se tiveres)
```

### 3. Fazer Novo Deploy
1. Vai a **Deploys**
2. Clica em **Trigger deploy** → **Clear cache and deploy site**
3. Aguarda 2-3 minutos

### 4. Testar
Abre: https://fanciful-pixie-cb053a.netlify.app

## Se Continuar a Dar Erro

1. Verifica se o build passou (deve mostrar "Published")
2. Verifica se as variáveis foram guardadas corretamente
3. Faz um novo deploy limpo

## Atalho
Site direto: https://app.netlify.com/sites/fanciful-pixie-cb053a/overview
