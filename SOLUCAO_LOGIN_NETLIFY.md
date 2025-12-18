# 🔐 SOLUÇÃO: Login não Funciona no Netlify

## 🚨 O PROBLEMA

O login funciona perfeitamente no Bolt, mas **NÃO funciona no Netlify**.

**Causa:** As variáveis de ambiente (`VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`) não estão configuradas no Netlify.

O ficheiro `.env` **NÃO é enviado** para o GitHub/Netlify por razões de segurança (está no `.gitignore`).

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Ir para o Netlify

1. Abrir: https://app.netlify.com
2. Fazer login
3. Clicar no seu site (projeto Desperto)

### Passo 2: Adicionar Variáveis de Ambiente

1. Clicar em **"Site configuration"** (no menu lateral esquerdo)
2. Clicar em **"Environment variables"**
3. Clicar em **"Add a variable"** → **"Add a single variable"**

### Passo 3: Adicionar a PRIMEIRA variável

**Key:**
```
VITE_SUPABASE_URL
```

**Value:**
```
https://dnswlrvleqvsueawxzfy.supabase.co
```

**Scopes:** Selecionar tudo (Production, Deploy Previews, Branch Deploys)

Clicar em **"Create variable"**

### Passo 4: Adicionar a SEGUNDA variável

Clicar novamente em **"Add a variable"** → **"Add a single variable"**

**Key:**
```
VITE_SUPABASE_ANON_KEY
```

**Value:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODEyMjIsImV4cCI6MjA3NDk1NzIyMn0.bsg6sfD9d2CT5EiiGWOKtl1FeaeN1DnDYiUtLeqkOmQ
```

**Scopes:** Selecionar tudo (Production, Deploy Previews, Branch Deploys)

Clicar em **"Create variable"**

### Passo 5: Fazer Redeploy

1. Ir para **"Deploys"** (no menu superior)
2. Clicar em **"Trigger deploy"**
3. Selecionar **"Clear cache and deploy site"**
4. Aguardar 2-3 minutos até o deploy terminar

### Passo 6: Testar o Login

1. Abrir o seu site no Netlify
2. Abrir as **Developer Tools** (tecla F12)
3. Ir para a aba **Console**
4. Deve aparecer: `✅ Supabase Configuration Loaded`
5. Tentar fazer login

---

## 🧪 Credenciais de Teste

Depois de configurar as variáveis, use estas credenciais para testar:

### Admin/Staff
- **Email:** `luisperes28@gmail.com`
- **Username:** `luisperes`
- **Password:** (a sua password)

### Cliente 1
- **Email:** `luisperes28@msn.com`
- **Username:** `luisperes28`

### Cliente 2
- **Email:** `cliente@teste.com`
- **Username:** `cliente`
- **Password:** `123456`

### Cliente 3
- **Email:** `csloureiro@live.com.pt`
- **Username:** `csloureiro`

---

## 🔍 Como Verificar se está Correto

### No Netlify (antes de fazer login):

1. Abrir o site publicado
2. Abrir **Developer Tools** (F12)
3. Ir para **Console**
4. Procurar por:
   - ✅ `✅ Supabase Configuration Loaded` = **FUNCIONOU**
   - ❌ `❌ CRITICAL: Missing Supabase environment variables!` = **NÃO FUNCIONOU**

Se aparecer o erro ❌, significa que as variáveis não foram configuradas correctamente.

### Ao fazer login:

1. Inserir email e password
2. Clicar em "Entrar"
3. Observar o console:
   - ✅ `✅ Login bem-sucedido` = Funcionou
   - ❌ `❌ Login falhado` = Problema com credenciais
   - ❌ `Erro de rede` = Problema com variáveis de ambiente

---

## 🚨 Se AINDA NÃO FUNCIONAR

### Problema 1: Variáveis não aparecem

**Verificar:**
1. Ir para Netlify → Site configuration → Environment variables
2. Verificar se as 2 variáveis aparecem na lista
3. Verificar se os **Scopes** incluem "Production"

**Solução:**
- Apagar as variáveis e criar novamente
- Garantir que os nomes estão EXATAMENTE como acima (incluindo maiúsculas/minúsculas)

### Problema 2: Console mostra erro "Missing environment variables"

**Causa:** O deploy foi feito ANTES de configurar as variáveis.

**Solução:**
1. Configurar as variáveis (passos acima)
2. Fazer um **novo deploy** (Clear cache and deploy site)
3. As variáveis só são carregadas durante o build

### Problema 3: Console mostra "Credenciais incorretas"

**Causa:** As variáveis estão corretas, mas a password está errada.

**Solução:**
- Verificar a password
- Tentar criar uma nova conta usando o botão "Criar Conta"
- Contactar o administrador para resetar a password

### Problema 4: Netlify não reconhece VITE_ prefix

**Causa:** O Netlify deve reconhecer automaticamente variáveis com `VITE_`, mas por vezes há problemas.

**Solução alternativa:**
1. Criar ficheiro `netlify.toml` na raiz do projeto:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  VITE_SUPABASE_URL = "https://dnswlrvleqvsueawxzfy.supabase.co"
  VITE_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODEyMjIsImV4cCI6MjA3NDk1NzIyMn0.bsg6sfD9d2CT5EiiGWOKtl1FeaeN1DnDYiUtLeqkOmQ"
```

2. Fazer commit e push
3. Aguardar novo deploy automático

---

## 📸 Screenshots Passo-a-Passo

### 1. Ir para Environment Variables
```
Netlify Dashboard → [Seu Site] → Site configuration → Environment variables
```

### 2. Adicionar Variável
```
Clicar em "Add a variable" → "Add a single variable"
```

### 3. Preencher Detalhes
```
Key: VITE_SUPABASE_URL
Value: https://dnswlrvleqvsueawxzfy.supabase.co
Scopes: ✓ Production ✓ Deploy Previews ✓ Branch Deploys
```

### 4. Repetir para ANON_KEY
```
Key: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Scopes: ✓ Production ✓ Deploy Previews ✓ Branch Deploys
```

### 5. Fazer Redeploy
```
Deploys → Trigger deploy → Clear cache and deploy site
```

---

## ✅ Checklist Final

- [ ] Variáveis adicionadas no Netlify (VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY)
- [ ] Scopes incluem "Production"
- [ ] Redeploy feito (Clear cache and deploy site)
- [ ] Console mostra "✅ Supabase Configuration Loaded"
- [ ] Login funciona com credenciais de teste

---

## 💡 Explicação Técnica (Opcional)

**Por que isto acontece?**

1. O ficheiro `.env` está no `.gitignore` e não vai para o GitHub
2. O Netlify faz deploy a partir do GitHub
3. Durante o build, o Vite substitui `import.meta.env.VITE_*` pelos valores das variáveis
4. Se as variáveis não existirem, o Vite substitui por `undefined`
5. O código detecta isto e dá erro: "Missing environment variables"

**Solução:**
- Configurar as variáveis diretamente no Netlify
- O Netlify injeta as variáveis durante o build
- O Vite substitui corretamente os valores
- O login funciona!

---

## 📞 Suporte

Se depois de seguir todos os passos ainda não funcionar:

1. Tirar screenshot do console (F12)
2. Tirar screenshot das variáveis de ambiente no Netlify
3. Partilhar as screenshots

**URLs Úteis:**
- Dashboard Netlify: https://app.netlify.com
- Dashboard Supabase: https://supabase.com/dashboard
- Documentação Netlify Environment Variables: https://docs.netlify.com/environment-variables/overview/

---

**Última atualização:** 18 Dezembro 2025
**Versão:** 1.0
