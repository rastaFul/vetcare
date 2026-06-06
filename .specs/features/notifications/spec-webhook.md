# SPEC — Webhook de Resposta do Tutor (Fase 2)
## VetCare · Feature: Notification Webhook

**Versão**: 1.0.0
**Data**: 2026-06-04
**Status**: BACKLOG — Fase 2
**Depende de**: `notifications/spec.md` (implementado)

---

## 1. Contexto

Com as notificações WhatsApp enviadas (Fase 1), o tutor pode responder diretamente.
Esta spec define como processar essas respostas para automatizar confirmações de consulta.

---

## 2. Funcionalidades

### F01 — Confirmação de Consulta via WhatsApp

**Fluxo:**
```
Sistema envia: "Rex tem consulta em 15/06 às 14h. 
               Responda 1 para CONFIRMAR ou 2 para CANCELAR."

Tutor responde: "1"

Sistema processa webhook → consulta.status = CONFIRMED
                         → notifica veterinária via push/email
                         → registra em NotificationLog
```

### F02 — Agendamento de Retorno via WhatsApp

```
Sistema envia: "Olá João! Está na hora do retorno de Rex.
               Responda com a data desejada (ex: 20/06)"

Tutor responde: "20/06"

Sistema processa → cria consulta de retorno com data
               → confirma de volta para o tutor
```

### F03 — Opt-out

```
Tutor responde: "PARAR" ou "STOP"

Sistema marca tutor: notifyWhatsApp = false
                   → confirma: "Ok! Você não receberá mais avisos."
```

---

## 3. Arquitetura

### 3.1 Webhook Evolution API

```
Evolution API recebe mensagem do tutor
    ↓ POST para webhook configurado
    ↓ https://vetcare.rastaful.dev/api/webhooks/whatsapp
    ↓ Payload: { phone, message, instance, timestamp }
```

### 3.2 Endpoint

```
POST /api/webhooks/whatsapp
  Header: X-Evolution-Signature: {hmac-sha256}
  Body: EvolutionWebhookPayload

Validação:
  1. Verificar assinatura HMAC
  2. Identificar tutor pelo telefone
  3. Identificar contexto (qual notificação foi enviada por último?)
  4. Processar comando (1/2/STOP/data)
  5. Executar ação
  6. Responder ao tutor
```

### 3.3 Estado da Conversa

```typescript
// Adicionar ao NotificationLog:
awaitingResponse: boolean  // true = esperando resposta do tutor
responseOptions: string[]  // ex: ['1', '2'] ou ['STOP']
responseAction: string     // ex: 'CONFIRM_CONSULTATION:uuid'
expiresAt: DateTime        // 24h para responder
```

### 3.4 ConversationContext Entity

```typescript
ConversationContext {
  id: UUID
  tenantId: UUID
  tutorId: UUID
  phone: string
  notificationLogId: UUID
  action: WebhookAction  // CONFIRM_CONSULTATION | SCHEDULE_RETURN | OPT_OUT
  referenceId: UUID      // ID da consulta/vacina/retorno
  options: string[]      // respostas válidas aceitas
  expiresAt: DateTime
  resolved: boolean
  createdAt: DateTime
}
```

---

## 4. Novos Use Cases

```typescript
ProcessWhatsAppWebhook.execute(payload: WebhookPayload)
  → ValidateSignature
  → IdentifyTutor (por telefone)
  → FindActiveConversationContext (contexto ativo para este tutor)
  → ParseIntent (1→confirmar, 2→cancelar, STOP→opt-out)
  → ExecuteAction (ConfirmConsultation | CancelConsultation | OptOut)
  → SendConfirmationMessage (resposta ao tutor)
  → UpdateNotificationLog
```

---

## 5. Tabelas Novas

```prisma
model ConversationContext {
  id                String        @id @default(uuid())
  tenantId          String
  tutorId           String
  phone             String
  notificationLogId String
  action            String        // CONFIRM_CONSULTATION | SCHEDULE_RETURN | OPT_OUT
  referenceId       String        // UUID do recurso relacionado
  options           String[]      // respostas aceitas
  expiresAt         DateTime
  resolved          Boolean       @default(false)
  createdAt         DateTime      @default(now())

  tutor Tutor @relation(fields: [tutorId], references: [id])

  @@index([phone, resolved])
  @@index([tenantId])
  @@map("conversation_contexts")
}
```

---

## 6. Segurança

- Webhook validado por HMAC-SHA256 (chave configurada na Evolution API)
- Rate limit: 100 webhooks/min por IP
- Expiração de contexto: 24h (sem resposta → ignora mensagens subsequentes)
- Opt-out sempre processado mesmo sem contexto ativo

---

## 7. Critérios de Aceite

```gherkin
Scenario: Tutor confirma consulta via WhatsApp
  Given João recebeu lembrete de consulta de Rex com opções 1/2
  And contexto está ativo (não expirado)
  When João responde "1"
  Then consulta.status = CONFIRMED
  And João recebe: "Consulta de Rex confirmada para 15/06 às 14h! ✅"
  And veterinária recebe notificação de confirmação

Scenario: Tutor solicita opt-out
  Given Maria responde "STOP" em qualquer mensagem
  When webhook é processado
  Then tutor.notifyWhatsApp = false
  And Maria recebe: "Ok! Você não receberá mais avisos via WhatsApp."

Scenario: Resposta fora do prazo (contexto expirado)
  Given contexto expirou há 2 horas
  When tutor responde "1"
  Then sistema ignora silenciosamente (não processa ação)
```

---

## 8. Estimativa

- **Esforço**: ~3-4 dias de desenvolvimento
- **Dependências**: Fase 1 (notifications) implementada e estável
- **Prioridade**: Média — conforto para o tutor, não crítico para operação

---

## Status: BACKLOG — Implementar após Fase 1 estabilizada
