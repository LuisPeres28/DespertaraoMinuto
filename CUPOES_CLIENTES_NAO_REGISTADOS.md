# Cupões para Clientes Não Registados - CORRIGIDO

## Problema Identificado

Quando um cliente entrava diretamente (sem registo) através de um terapeuta, os cupões **não funcionavam**.

### Causa Raiz

1. **PaymentStep.tsx linha 179**: O código procurava o cliente no array `clients` e só aplicava o cupão se encontrasse um cliente registado
2. **couponService.ts linha 200-208**: A validação falhava para clientes não registados quando o cupão tinha `clientId` definido

## Correções Implementadas

### 1. PaymentStep.tsx (linhas 168-197)

**ANTES:**
```typescript
// Marcar cupão como usado
const client = clients?.find(c => c.email === clientEmail);
if (client) {  // ❌ Só funcionava se cliente registado
  CouponService.useCoupon(
    validation.coupon.id,
    'temp-booking-id',
    client.id,
    finalDiscount,
    coupons,
    setCoupons,
    couponUsage,
    setCouponUsage
  );
}
```

**DEPOIS:**
```typescript
// Marcar cupão como usado
// Para clientes não registados, usar o email como identificador
const client = clients?.find(c => c.email === clientEmail);
const clientIdentifier = client?.id || clientEmail || 'guest';

CouponService.useCoupon(
  validation.coupon.id,
  'temp-booking-id',
  clientIdentifier,  // ✅ Usa email ou 'guest' se não registado
  finalDiscount,
  coupons,
  setCoupons,
  couponUsage,
  setCouponUsage
);

console.log('✅ Cupão aplicado com sucesso:', {
  couponCode: inputCouponPassword,
  discount: finalDiscount,
  clientIdentifier,
  isRegistered: !!client
});
```

### 2. couponService.ts (linhas 199-220)

**ANTES:**
```typescript
// Verificar se é para cliente específico
if (coupon.clientId && clientEmail && clients) {
  const client = clients.find(c => c.email === clientEmail);
  if (!client || client.id !== coupon.clientId) {  // ❌ Falhava sempre para não registados
    return {
      isValid: false,
      error: 'Este cupão não é válido para o seu email'
    };
  }
}
```

**DEPOIS:**
```typescript
// Verificar se é para cliente específico
if (coupon.clientId && clientEmail && clients) {
  // Procurar cliente registado
  const client = clients.find(c => c.email === clientEmail);

  // Se o cupão é para um cliente específico, verificar se corresponde
  if (client && client.id !== coupon.clientId) {
    return {
      isValid: false,
      error: 'Este cupão não é válido para o seu email'
    };
  }

  // Se não há cliente registado mas o cupão exige um clientId específico,
  // apenas falhar se realmente for um cupão exclusivo
  if (!client) {
    return {
      isValid: false,
      error: 'Este cupão requer registo prévio. Por favor, faça login ou registe-se.'
    };
  }
}
```

## Como Funciona Agora

### Tipo 1: Cupões Genéricos (sem clientId)

**Criação:**
```typescript
// No CouponManagement, deixar "Cliente Específico" vazio
{
  type: 'fixed_amount',
  value: 10,
  serviceId: null,      // Para qualquer serviço
  clientId: null,       // ✅ Para qualquer cliente (registado ou não)
  validUntil: '2026-12-31',
  usageLimit: 10,
  description: 'Desconto de Boas-Vindas'
}
```

**Uso:**
- ✅ Cliente registado: Funciona
- ✅ Cliente não registado: **Funciona agora!**
- ✅ É rastreado usando o email do cliente (ou 'guest' se não tiver email)

### Tipo 2: Cupões para Cliente Específico (com clientId)

**Criação:**
```typescript
{
  type: 'free_service',
  value: 100,
  serviceId: 'service-123',
  clientId: 'client-456',  // ✅ Apenas para este cliente
  validUntil: '2026-12-31',
  usageLimit: 1,
  description: 'Sessão Grátis para João Silva'
}
```

**Uso:**
- ✅ Cliente registado com ID correto: Funciona
- ❌ Cliente não registado: Falha com mensagem clara
- ❌ Cliente registado com ID diferente: Falha

## Fluxo de Teste

### Teste 1: Cliente Não Registado com Cupão Genérico

1. **Criar Cupão Genérico (Admin/Terapeuta):**
   - Ir para Dashboard → Cupões
   - Criar novo cupão:
     - Tipo: Desconto Fixo
     - Valor: 10€
     - Cliente Específico: *deixar vazio*
     - Serviço: *deixar vazio* (ou escolher um)
     - Data de Validade: futuro
     - Limite de Uso: 5
   - Guardar → Anotar a password (ex: `AB12-CD34`)

2. **Usar Cupão (Cliente Não Registado):**
   - Ir para página inicial
   - Clicar num terapeuta (ex: Luis Peres)
   - Escolher serviço
   - Escolher data/hora
   - Preencher dados (nome, email, telefone) - **SEM fazer registo**
   - No pagamento:
     - Escolher "Cupão / Vale"
     - Inserir password: `AB12-CD34`
     - Clicar "Validar e Aplicar"
   - ✅ **Deve funcionar agora!**
   - Ver desconto aplicado
   - Concluir agendamento

3. **Verificar (Admin/Terapeuta):**
   - Dashboard → Cupões
   - Ver cupão usado: `usedCount` deve ter incrementado
   - Dashboard → Agendamentos
   - Ver agendamento com cupão aplicado

### Teste 2: Cliente Registado com Cupão Genérico

1. Cliente faz login
2. Faz agendamento
3. Usa o mesmo cupão genérico
4. ✅ Deve funcionar normalmente

### Teste 3: Cliente Não Registado com Cupão Específico

1. **Criar Cupão Específico:**
   - Cliente Específico: escolher um cliente registado

2. **Tentar Usar (Cliente Não Registado):**
   - Entrar sem registo
   - Tentar usar o cupão
   - ❌ **Deve falhar** com mensagem:
     > "Este cupão requer registo prévio. Por favor, faça login ou registe-se."

## Logs de Debug

O sistema agora mostra logs detalhados no Console:

### Validação de Cupão
```javascript
🔍 Validando cupão: { password: 'AB12-CD34', serviceId: 'service-1', clientEmail: 'joao@example.com' }
🎫 Cupão encontrado: { code: 'AB12-CD34', type: 'fixed_amount', value: 10 }
✅ Cupão válido: { code: 'AB12-CD34', type: 'fixed_amount', value: 10, discountAmount: 10 }
```

### Aplicação de Cupão
```javascript
✅ Cupão aplicado com sucesso: {
  couponCode: 'AB12-CD34',
  discount: 10,
  clientIdentifier: 'joao@example.com',  // ou client ID se registado
  isRegistered: false
}
```

### Uso de Cupão
```javascript
✅ Cupão utilizado: {
  code: 'AB12-CD34',
  usedCount: 1,
  usageLimit: 5
}
```

## Tipos de Cupões

### 1. Desconto Fixo (fixed_amount)
```javascript
{
  type: 'fixed_amount',
  value: 10  // 10€ de desconto
}
```

### 2. Desconto Percentual (percentage)
```javascript
{
  type: 'percentage',
  value: 20  // 20% de desconto
}
```

### 3. Serviço Grátis (free_service)
```javascript
{
  type: 'free_service',
  value: 100  // 100% de desconto
}
```

## Restrições de Cupões

Um cupão pode ter:

1. **Sem Restrições** (Cupão Universal):
   - `clientId = null`
   - `serviceId = null`
   - ✅ Qualquer cliente, qualquer serviço

2. **Restrito por Serviço**:
   - `serviceId = 'service-123'`
   - `clientId = null`
   - ✅ Qualquer cliente, apenas serviço específico

3. **Restrito por Cliente**:
   - `clientId = 'client-456'`
   - `serviceId = null`
   - ✅ Apenas cliente específico, qualquer serviço
   - ❌ **Requer que cliente esteja registado**

4. **Restrito por Cliente E Serviço**:
   - `clientId = 'client-456'`
   - `serviceId = 'service-123'`
   - ✅ Apenas cliente específico, apenas serviço específico
   - ❌ **Requer que cliente esteja registado**

## Casos de Uso Comuns

### Promoção de Boas-Vindas
```
Tipo: fixed_amount
Valor: 15
Cliente: (vazio)
Serviço: (vazio)
Limite: 50

→ Primeiro agendamento com 15€ desconto
→ Funciona para clientes registados e não registados
```

### Sessão Grátis de Avaliação
```
Tipo: free_service
Valor: 100
Cliente: (vazio)
Serviço: "Consulta de Avaliação Inicial"
Limite: 1 por cliente

→ Primeira consulta grátis
→ Funciona para todos
```

### Cupão Personalizado
```
Tipo: percentage
Valor: 50
Cliente: "Maria Silva" (registada)
Serviço: "Reiki"
Limite: 3

→ 50% desconto em Reiki
→ Apenas para Maria Silva
→ Requer que Maria esteja registada
```

## Vantagens da Solução

1. ✅ **Flexibilidade**: Cupões funcionam com e sem registo
2. ✅ **Rastreabilidade**: Todos os usos são registados (por ID ou email)
3. ✅ **Segurança**: Cupões específicos ainda requerem registo
4. ✅ **Simplicidade**: Cliente não precisa criar conta para usar promoções genéricas
5. ✅ **Logs Detalhados**: Fácil debug e auditoria

## Troubleshooting

### Cupão não é validado

1. **Verificar no Console:**
   - F12 → Console
   - Procurar mensagens com 🔍 ou ❌

2. **Causas comuns:**
   - Password errada (case-sensitive)
   - Cupão expirado
   - Cupão já usado (limite atingido)
   - Cupão para cliente específico (requer registo)
   - Cupão para serviço diferente

### Cupão validado mas não aplicado

1. **Verificar Logs:**
   ```javascript
   ✅ Cupão aplicado com sucesso
   ```

2. **Se aparecer, verificar:**
   - Dashboard → Cupões → `usedCount` aumentou?
   - Desconto apareceu no resumo do agendamento?

### Cupão desaparece após refresh

- Normal: Cupões são aplicados no momento do agendamento
- O desconto é guardado no agendamento, não é persistente

---

**Data:** 2026-02-19
**Status:** ✅ CORRIGIDO E TESTADO
