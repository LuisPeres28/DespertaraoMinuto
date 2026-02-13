# Passo a Passo - Configurar Netlify

## Passo 1: Configurar Variáveis de Ambiente

1. **Na barra lateral esquerda**, clica em **"Project configuration"** (ou **"Site settings"**)

2. Procura a secção **"Environment variables"**

3. Clica no botão **"Add a variable"** ou **"Add environment variable"**

4. Adiciona estas variáveis (uma de cada vez):

   **Variável 1:**
   ```
   Key: VITE_SUPABASE_URL
   Value: https://pshszuykwuzbwxnkqlhc.supabase.co
   ```

   **Variável 2:**
   ```
   Key: VITE_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBzaHN6dXlrd3V6Ynd4bmtxbGhjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY0NDI5MzYsImV4cCI6MjA1MjAxODkzNn0.j_3nzj0A9BbxFPOJB0T-YEsZLEKxMEqHpDjxMILpYwA
   ```

5. Clica em **"Save"** para cada variável

## Passo 2: Fazer Novo Deploy

Existem 2 formas:

### Opção A: Via Git (MAIS FÁCIL)
1. Volta à página **"Deploys"** (onde estás agora)
2. Clica no botão **"Deploy settings"** no topo
3. Procura por **"Build hooks"** ou **"Clear cache"**
4. Clica em **"Clear cache and retry deploy"**

### Opção B: Manual
1. Na página de Deploys, arrasta a pasta `dist` para onde diz "Drag and drop your project folder here"
   - Mas primeiro preciso gerar a pasta `dist` para ti

## Passo 3: Aguardar
- Aguarda 2-3 minutos
- Verifica se o deploy diz **"Published"** com um check verde

## Se não encontrares "Trigger deploy":

**Opção mais simples:**
1. Vai a **"Deploy settings"** (botão no topo da página)
2. Procura **"Build & deploy"**
3. Clica em **"Trigger deploy"** lá

**OU**

Posso criar um deploy manual para ti. Diz-me e eu gero os ficheiros necessários!
