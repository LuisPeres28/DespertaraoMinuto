# 📧 Guia de Resolução - Emails de Confirmação

## 🔍 Problema
Os clientes não estão a receber emails de confirmação após fazerem uma reserva.

## ✅ Sistema de Email Atual

**Serviço:** EmailJS
**Email de Envio:** euestoudesperto@gmail.com
**Credenciais:**
- Service ID: `service_eqp55ju`
- Template ID: `template_w3awkf1`
- Public Key: `yxdL1IoXHXaC3Q-Cw`

---

## 🔧 Soluções por Ordem de Prioridade

### **1. Verificar Template no EmailJS**

#### Acesso:
1. Ir para: https://dashboard.emailjs.com/admin
2. Fazer login com a conta **euestoudesperto@gmail.com**
3. Ir para **Email Templates**
4. Procurar `template_w3awkf1`

#### Template Correto:

**Subject Line:**
```
Confirmação de Consulta - {{to_name}}
```

**Content (Body):**
```
Olá {{to_name}},

A sua consulta foi agendada com sucesso!

📅 Data: {{date}}
🕐 Hora: {{time}}
📍 Localização: {{location}}

{{message}}

Se precisar de reagendar ou cancelar, responda a este email.

Com os melhores cumprimentos,
Equipa Desperto
euestoudesperto@gmail.com
```

**To Email Field:**
```
{{to_email}}
```

**IMPORTANTE:** Certifique-se que os campos `{{to_email}}`, `{{to_name}}`, `{{date}}`, `{{time}}`, `{{location}}` e `{{message}}` estão EXATAMENTE como escritos (incluindo as chavetas duplas).

---

### **2. Verificar Serviço EmailJS**

1. Ir para **Email Services**
2. Procurar `service_eqp55ju`
3. Verificar:
   - ✅ Estado: **Connected**
   - ✅ Email: **euestoudesperto@gmail.com**
   - ✅ Provider: **Gmail**

4. **Testar a conexão:**
   - Clicar em **"Send Test Email"**
   - Verificar se recebe o email de teste

---

### **3. Verificar Configuração do Gmail**

O Gmail pode estar a bloquear o EmailJS. Verificar:

1. **Aceder à conta Gmail:** euestoudesperto@gmail.com
2. **Ir para:** https://myaccount.google.com/security
3. **Verificar:**
   - ✅ "Acesso a apps menos seguras" está **ATIVADO**
   - ✅ Não há bloqueios recentes de login

4. **Verificar Spam/Lixo:**
   - Os emails podem estar a ir para a pasta de spam dos clientes

---

### **4. Testar Envio Manual**

Criámos um ficheiro de teste: **`test-email.html`**

#### Como usar:
1. Abrir o ficheiro no navegador
2. Inserir um email de teste (o seu próprio email)
3. Clicar em "Enviar Email de Teste"
4. Observar os logs no ecrã
5. Verificar se recebe o email

#### O que procurar:
- ✅ `EMAIL ENVIADO COM SUCESSO!` - Tudo a funcionar
- ❌ `ERRO` - Há um problema com o EmailJS
- ⏱️ `Timeout` - Bloqueado por firewall/antivírus

---

### **5. Verificar Logs em Produção**

Quando um cliente faz uma reserva:

1. **Abrir Console do Navegador** (F12)
2. **Procurar por:**
   - ✅ `✅ Email sent successfully` - Email enviado
   - ❌ `❌ Email error` - Erro no envio
   - ⏱️ `⏱️ Email send timed out` - Bloqueado

3. **Se aparecer erro:**
   - Copiar a mensagem de erro completa
   - Verificar se menciona problemas de autenticação
   - Verificar se menciona problemas de rede

---

## 🚨 Problemas Comuns e Soluções

### **Problema 1: Emails vão para Spam**

**Solução:**
1. Configurar SPF, DKIM e DMARC no domínio (se usar domínio próprio)
2. Pedir aos clientes para adicionarem `euestoudesperto@gmail.com` aos contactos
3. Usar um serviço de email profissional (ex: SendGrid, Mailgun)

### **Problema 2: Template não encontrado**

**Sintoma:** Erro `Template not found`

**Solução:**
1. Verificar que o Template ID está correto: `template_w3awkf1`
2. Verificar que o template existe no EmailJS
3. Verificar que o template está publicado (não em draft)

### **Problema 3: Credenciais inválidas**

**Sintoma:** Erro `Invalid credentials` ou `Unauthorized`

**Solução:**
1. Regenerar a Public Key no EmailJS
2. Atualizar o `.env` e o código hardcoded em `emailService.ts`
3. Fazer rebuild da aplicação

### **Problema 4: Quota excedida**

**Sintoma:** Erro `Rate limit exceeded` ou `Quota exceeded`

**Solução:**
- EmailJS tem limite de **200 emails/mês** no plano gratuito
- Verificar em: https://dashboard.emailjs.com/admin/account
- Considerar upgrade para plano pago
- Ou migrar para outro serviço (Resend, SendGrid)

---

## 🔄 Alternativa: Migrar para Resend

Se o EmailJS não funcionar, podemos migrar para **Resend** (serviço mais profissional):

### Vantagens:
- ✅ 100 emails/dia grátis
- ✅ Melhor deliverability
- ✅ Suporte a domínios personalizados
- ✅ Logs detalhados

### Como migrar:
1. Criar conta em: https://resend.com
2. Obter API Key
3. Instalar: `npm install resend`
4. Atualizar o `emailService.ts`

---

## 📞 Próximos Passos

1. **Verificar o template no EmailJS** (Prioridade 1)
2. **Testar com `test-email.html`**
3. **Verificar logs em produção**
4. **Se nada funcionar:** Considerar migrar para Resend

---

## 💡 Dica Importante

**O código já tem alertas visuais:**
- Quando um email é enviado com sucesso, aparece: `✅ SUCESSO! Email enviado.`
- Quando falha, aparece: `⚠️ ALERTA: O envio foi bloqueado...`

Se os clientes não estão a receber emails MAS não aparecem alertas de erro, o problema está provavelmente no **template do EmailJS** ou nos **emails estão indo para spam**.

---

**Documentação oficial EmailJS:** https://www.emailjs.com/docs/
**Dashboard EmailJS:** https://dashboard.emailjs.com/admin
