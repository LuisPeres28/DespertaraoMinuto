# Guia de Deployment - Desperto

## Problema Resolvido

A aplicação não funcionava fora da Bolt.new porque tinha credenciais hardcoded antigas como fallback. Agora as variáveis de ambiente são obrigatórias.

## Como Publicar a Aplicação

### 1. Configurar Variáveis de Ambiente

Quando publicares a aplicação (ex: Netlify, Vercel, etc.), **TENS QUE** configurar estas variáveis de ambiente:

```
VITE_SUPABASE_URL=https://dnswlrvleqvsueawxzfy.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRuc3dscnZsZXF2c3VlYXd4emZ5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzODEyMjIsImV4cCI6MjA3NDk1NzIyMn0.bsg6sfD9d2CT5EiiGWOKtl1FeaeN1DnDYiUtLeqkOmQ
```

### 2. Plataformas de Deployment

#### Netlify
1. Vai a **Site settings > Environment variables**
2. Adiciona cada variável (nome e valor)
3. Redeploy o site

#### Vercel
1. Vai a **Settings > Environment Variables**
2. Adiciona cada variável
3. Redeploy

#### Outras Plataformas
Procura por "Environment Variables" ou "Build Environment" nas configurações do projeto.

### 3. Build Command

```bash
npm run build
```

### 4. Output Directory

```
dist
```

## Credenciais de Login de Teste

Podes usar estas credenciais para testar após deployment:

### Admin
- Username: `admin`
- Password: `admin123`

### Terapeuta
- Username: `christina` ou `luis`
- Password: `therapist123`

### Cliente
- Qualquer cliente que tenhas criado na base de dados

## Verificar se Está a Funcionar

1. Abre a consola do browser (F12)
2. Deves ver: `✅ Supabase Configuration Loaded`
3. Se vires `❌ CRITICAL: Missing Supabase environment variables!`, as variáveis não foram configuradas corretamente

## Troubleshooting

### Erro: "Missing required Supabase environment variables"
- Verifica que configuraste as variáveis de ambiente na plataforma de hosting
- Verifica que os nomes estão corretos (começam com `VITE_`)
- Faz redeploy após adicionar as variáveis

### Login não funciona
- Abre a consola e verifica se há erros de rede
- Verifica se o URL do Supabase está correto
- Verifica se a base de dados tem utilizadores (pelo menos 9 users)

### "Network error" ao fazer login
- Verifica se o Supabase está online
- Verifica se a função `authenticate_user` existe na base de dados
- Verifica se a extensão `pgcrypto` está instalada no Supabase
