# Como Criar Cupões - Guia Visual

## Acesso à Gestão de Cupões

### 1. Login como Admin ou Terapeuta
- Apenas **Administradores** e **Terapeutas** podem criar cupões
- Clientes NÃO têm acesso a esta funcionalidade

### 2. Navegação
```
Dashboard → Menu Lateral → "Cupões"
ou
Clique no ícone de ticket 🎫 no menu
```

---

## Criar Cupão Genérico (Qualquer Cliente)

### Passo a Passo

1. **Clicar em "Criar Cupão"** (botão azul no topo direito)

2. **Preencher o Formulário:**

   **Tipo de Cupão:**
   - `Valor Fixo (€)` → Desconto de X euros
   - `Percentagem (%)` → Desconto de X%
   - `Serviço Gratuito` → 100% desconto

   **Valor:**
   - Se Valor Fixo: Ex: `15` (15€ de desconto)
   - Se Percentagem: Ex: `20` (20% de desconto)
   - Se Serviço Gratuito: qualquer valor (será 100%)

   **Cliente Específico:** ⚠️ **DEIXAR VAZIO**
   ```
   [Qualquer cliente ▼]  ← Selecionar esta opção
   ```

   **Serviço Específico:** (opcional)
   - Deixar vazio: Vale para **todos os serviços**
   - Escolher serviço: Vale apenas para esse serviço

   **Data de Expiração:**
   - Escolher data futura (ex: `31/12/2026`)

   **Limite de Utilizações:**
   - Ex: `10` → Pode ser usado 10 vezes
   - Ex: `1` → Pode ser usado apenas 1 vez

   **Descrição:**
   - Ex: `Promoção de Verão`
   - Ex: `Desconto de Boas-Vindas`

3. **Clicar em "Criar Cupão"**

4. **Anotar a Password Gerada**
   ```
   Cupão criado com sucesso!

   Password: AB12-CD34

   Partilhe esta password com o cliente.
   ```

### Resultado: Cupão Genérico
```
✅ Funciona para clientes REGISTADOS
✅ Funciona para clientes NÃO REGISTADOS
✅ Pode ser usado por qualquer pessoa
✅ Rastreado por email ou 'guest'
```

---

## Criar Cupão Específico (Cliente Registado)

### Passo a Passo

1. **Clicar em "Criar Cupão"**

2. **Preencher o Formulário:**

   **Tipo de Cupão:** (igual ao genérico)

   **Valor:** (igual ao genérico)

   **Cliente Específico:** ⚠️ **ESCOLHER UM CLIENTE**
   ```
   [João Silva (joao@email.com) ▼]  ← Selecionar um cliente da lista
   ```

   **Serviço Específico:** (opcional)

   **Data de Expiração:** (igual ao genérico)

   **Limite de Utilizações:** (igual ao genérico)

   **Descrição:**
   - Ex: `Sessão Gratuita para João Silva`
   - Ex: `Desconto Especial Maria`

3. **Clicar em "Criar Cupão"**

4. **Enviar Password ao Cliente Específico**

### Resultado: Cupão Específico
```
✅ Funciona APENAS para o cliente escolhido (registado)
❌ NÃO funciona para outros clientes
❌ NÃO funciona se cliente não estiver registado
✅ Rastreado pelo ID do cliente
```

---

## Comparação Visual

### Cupão Genérico
```
┌─────────────────────────────────────┐
│ Criar Novo Cupão                    │
├─────────────────────────────────────┤
│ Tipo: Valor Fixo (€)                │
│ Valor: 15                           │
│                                     │
│ Cliente: [Qualquer cliente ▼]      │ ← VAZIO
│ Serviço: [Qualquer serviço ▼]      │
│                                     │
│ Validade: 31/12/2026                │
│ Limite: 10                          │
│ Descrição: Promoção Verão           │
│                                     │
│ [Criar Cupão]                       │
└─────────────────────────────────────┘

→ Password gerada: KL98-MN76
→ Pode ser usado por QUALQUER PESSOA
```

### Cupão Específico
```
┌─────────────────────────────────────┐
│ Criar Novo Cupão                    │
├─────────────────────────────────────┤
│ Tipo: Serviço Gratuito              │
│ Valor: 100                          │
│                                     │
│ Cliente: [Maria Silva ▼]           │ ← ESCOLHIDO
│ Serviço: [Reiki (€45) ▼]           │
│                                     │
│ Validade: 31/12/2026                │
│ Limite: 1                           │
│ Descrição: Sessão grátis Maria      │
│                                     │
│ [Criar Cupão]                       │
└─────────────────────────────────────┘

→ Password gerada: QR34-ST56
→ Só funciona para Maria Silva (registada)
```

---

## Onde os Clientes Usam os Cupões

### 1. Entrada Direta (Sem Registo)
```
1. Cliente vai para a página inicial
2. Clica num terapeuta (Luis Peres ou Christina)
3. Escolhe serviço
4. Escolhe data/hora
5. Preenche dados (nome, email, telefone)
6. No passo de Pagamento:
   ┌────────────────────────────────┐
   │ Métodos de Pagamento           │
   │                                │
   │ ○ MB WAY                       │
   │ ○ Transferência Bancária       │
   │ ● Cupão / Vale              ✓  │ ← Selecionar
   │                                │
   │ Password do Cupão:             │
   │ [AB12-CD34____________]        │
   │                                │
   │ [Validar e Aplicar]            │
   └────────────────────────────────┘
```

### 2. Com Registo
```
1. Cliente faz login
2. Dashboard → Novo Agendamento
3. (mesmo processo)
```

---

## Lista de Cupões (Visão Admin/Terapeuta)

### Desktop
```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Gestão de Cupões                                      [+ Criar Cupão]        │
├──────────────────────────────────────────────────────────────────────────────┤
│ 🔍 [Pesquisar...]  🔽 [Todos os Estados ▼]                                  │
├──────────────────────────────────────────────────────────────────────────────┤
│ Código    │ Tipo       │ Valor     │ Cliente         │ Validade │ Uso  │... │
├───────────┼────────────┼───────────┼─────────────────┼──────────┼──────┼────┤
│ AB12-CD34 │ Valor Fixo │ €15       │ Qualquer cliente│ 365 dias │ 3/10 │ ✓  │
│ KL98-MN76 │ Percentual │ 20%       │ João Silva      │ 90 dias  │ 1/1  │ ✓  │
│ QR34-ST56 │ Gratuito   │ Grátis    │ Maria Santos    │ 30 dias  │ 0/1  │ ✓  │
└───────────┴────────────┴───────────┴─────────────────┴──────────┴──────┴────┘
              ↑                         ↑
              Tipo                      Cliente (vazio = genérico)
```

### Mobile (Cards)
```
┌────────────────────────────────┐
│ AB12-CD34              [Ativo] │
│                                │
│ Tipo: Valor Fixo               │
│ Valor: €15 desconto            │
│ Cliente: Qualquer cliente   ← │
│ Serviço: Todos                 │
│ Validade: 365 dias             │
│ Uso: 3/10 ████░░░░░░           │
│                                │
│ [✏️ Editar] [❌ Cancelar]      │
└────────────────────────────────┘

┌────────────────────────────────┐
│ KL98-MN76              [Usado] │
│                                │
│ Tipo: Serviço Gratuito         │
│ Valor: Serviço gratuito        │
│ Cliente: João Silva         ← │
│ Email: joao@example.com        │
│ Serviço: Reiki                 │
│ Validade: Expirado             │
│ Uso: 1/1 ██████████            │
└────────────────────────────────┘
```

---

## Casos de Uso Práticos

### 1. Promoção de Boas-Vindas (Genérico)
```
Tipo: Valor Fixo
Valor: 10
Cliente: (vazio) → Qualquer cliente
Serviço: (vazio) → Todos os serviços
Validade: 31/12/2026
Limite: 100
Descrição: Primeira Consulta com 10€ desconto

→ Password: WX12-YZ34
→ Partilhar em redes sociais, site, flyers
→ Qualquer pessoa pode usar
```

### 2. Desconto Sazonal (Genérico)
```
Tipo: Percentagem
Valor: 15
Cliente: (vazio) → Qualquer cliente
Serviço: (vazio) → Todos os serviços
Validade: 31/03/2026
Limite: 50
Descrição: Promoção de Primavera

→ Password: SP15-RN26
→ Campanha de email marketing
→ Válido por tempo limitado
```

### 3. Sessão Grátis Aniversário (Específico)
```
Tipo: Serviço Gratuito
Valor: 100
Cliente: Ana Costa → ana@email.com
Serviço: Qualquer serviço
Validade: 30/04/2026
Limite: 1
Descrição: Parabéns Ana! Sessão grátis

→ Password: BD42-AC26
→ Enviar por email/SMS para Ana
→ Só Ana pode usar
```

### 4. Pacote de Sessões (Genérico)
```
Tipo: Valor Fixo
Valor: 50
Cliente: (vazio) → Qualquer cliente
Serviço: (vazio) → Todos os serviços
Validade: 31/12/2026
Limite: 1
Descrição: Pacote 5 Sessões - 50€ desconto

→ Password: PK05-SS26
→ Vender pacotes a novos clientes
→ 1 uso por cliente
```

---

## Verificar Status dos Cupões

### Estatísticas (Topo da Página)
```
┌──────────────────┬──────────────┬──────────────┬─────────────────┐
│ Total de Cupões  │ Ativos       │ Utilizados   │ Desconto Total  │
│      15          │      8       │      45      │     €675        │
└──────────────────┴──────────────┴──────────────┴─────────────────┘
```

### Estados Possíveis
- 🟢 **Ativo**: Válido e disponível para uso
- 🔵 **Usado**: Limite de utilizações atingido
- ⚪ **Expirado**: Data de validade ultrapassada
- 🔴 **Cancelado**: Cancelado manualmente

---

## Troubleshooting

### Cliente diz "Cupão não funciona"

1. **Verificar no Dashboard → Cupões:**
   - Password está correta?
   - Status está "Ativo"?
   - Data de validade não expirou?
   - Limite de uso não atingido?

2. **Verificar Restrições:**
   - É cupão específico? → Cliente está registado?
   - É para serviço específico? → Cliente escolheu esse serviço?

3. **Logs do Console (F12):**
   ```
   🔍 Validando cupão: { password: 'AB12-CD34' }
   ❌ Cupão não encontrado: AB12-CD34

   ou

   ❌ Este cupão requer registo prévio
   ```

### Como Corrigir Erros Comuns

**Erro:** "Password do cupão inválida"
- Cliente digitou errado
- Cupão foi eliminado
- Verificar lista de cupões

**Erro:** "Cupão expirado"
- Data de validade passou
- Editar cupão e estender validade

**Erro:** "Cupão já atingiu o limite"
- Todos os usos foram consumidos
- Editar cupão e aumentar limite

**Erro:** "Este cupão requer registo prévio"
- É cupão específico
- Cliente precisa fazer login primeiro
- OU criar novo cupão genérico

**Erro:** "Este cupão não é válido para o seu email"
- Cupão é para outro cliente
- Verificar se email está correto

---

## Resumo Rápido

### Cupão para TODOS (Genérico)
```
Cliente Específico: [Qualquer cliente ▼]
```
✅ Funciona sem registo
✅ Partilhar publicamente
✅ Campanhas gerais

### Cupão para UM CLIENTE (Específico)
```
Cliente Específico: [Nome do Cliente ▼]
```
❌ Requer registo
✅ Personalizado
✅ Fidelização

---

**Dica Final:** Sempre anotar a password gerada! Não há forma de recuperar depois.
