# SPEC — Notificações para Tutores
## VetCare · Feature: Notifications

**Versão**: 1.0.0
**Data**: 2026-06-04
**Status**: AGUARDANDO APROVAÇÃO
**Autor**: Harness Dev

---

## 1. Contexto e Problema

A veterinária precisa avisar tutores sobre eventos futuros (vacinas, retornos, consultas). Hoje isso é feito manualmente via WhatsApp pessoal — processo manual, inconsistente e dependente de memória.

**Dores identificadas:**
- Tutor esquece da vacina → animal fica desprotegido
- Veterinária esquece de avisar → perde consulta de retorno
- Processo manual consome tempo durante atendimento

---

## 2. Solução

Sistema de notificações automáticas com dois canais:

| Canal | Tecnologia | Quando usar |
|-------|-----------|-------------|
| **WhatsApp** | Evolution API (self-hosted) | Preferencial — maior taxa de abertura no BR |
| **E-mail** | Resend | Fallback quando sem WhatsApp OU como cópia |

**Princípio:** A veterinária dispara a notificação manualmente (botão na tela) ou o sistema dispara automaticamente via job agendado. O tutor recebe no canal configurado.

---

## 3. Bounded Context: Notifications

```
src/modules/notifications/
├── domain/
│   ├── entities/
│   │   └── NotificationLog.ts      ← registro de cada envio
│   └── value-objects/
│       └── NotificationChannel.ts  ← WHATSAPP | EMAIL
├── application/
│   ├── ports/
│   │   └── INotificationService.ts ← interface única de envio
│   ├── dtos/
│   │   └── NotificationDTO.ts
│   └── use-cases/
│       ├── SendConsultationReminder.ts
│       ├── SendVaccinationReminder.ts
│       ├── SendReturnReminder.ts
│       └── SendCustomMessage.ts
└── infrastructure/
    ├── whatsapp/
    │   └── EvolutionApiAdapter.ts
    ├── email/
    │   ├── ResendAdapter.ts
    │   └── templates/
    │       ├── ConsultationReminder.tsx
    │       ├── VaccinationReminder.tsx
    │       └── ReturnReminder.tsx
    └── repositories/
        └── PrismaNotificationLogRepository.ts
```

---

## 4. Domínio

### 4.1 NotificationLog Entity

```typescript
NotificationLog {
  id: UUID
  tenantId: UUID
  tutorId: UUID
  animalId: UUID
  type: NotificationType       // CONSULTATION_REMINDER | VACCINATION_REMINDER | RETURN_REMINDER | CUSTOM
  channel: NotificationChannel // WHATSAPP | EMAIL
  recipientPhone?: string
  recipientEmail?: string
  message: string              // conteúdo enviado
  status: NotificationStatus   // PENDING | SENT | FAILED | DELIVERED
  errorMessage?: string
  sentAt?: DateTime
  createdAt: DateTime
}
```

### 4.2 Enums

```typescript
enum NotificationType {
  CONSULTATION_REMINDER   // lembrete de consulta agendada
  VACCINATION_REMINDER    // lembrete de próxima vacina
  RETURN_REMINDER         // lembrete de retorno
  CUSTOM                  // mensagem avulsa da veterinária
}

enum NotificationChannel {
  WHATSAPP
  EMAIL
}

enum NotificationStatus {
  PENDING    // na fila
  SENT       // enviado (sem confirmação de entrega)
  DELIVERED  // confirmação de entrega (WhatsApp delivery receipt)
  FAILED     // falha no envio
}
```

### 4.3 INotificationService Port

```typescript
interface SendNotificationInput {
  to: {
    phone?: string   // formato: 5511999999999 (DDI+DDD+número)
    email?: string
    name: string
  }
  template: NotificationTemplate
  channel: 'WHATSAPP' | 'EMAIL' | 'AUTO' // AUTO = tenta WhatsApp, fallback Email
}

interface NotificationTemplate {
  type: NotificationType
  data: Record<string, string>  // variáveis do template
}

interface INotificationService {
  send(input: SendNotificationInput): Promise<{ status: 'sent' | 'failed'; channel: string; error?: string }>
}
```

---

## 5. Funcionalidades

### F01 — Envio Manual (botão na tela)

**Onde:** Detalhe da consulta, perfil do animal (tab preventivo)

**Ações:**
- Botão "Enviar lembrete" → abre modal de confirmação
- Modal mostra preview da mensagem antes de enviar
- Após envio: toast de sucesso/erro + log registrado

**Canais disponíveis:** WhatsApp (se tutor tem número) | Email (se tutor tem email) | Ambos

### F02 — Envio Automático (Job Agendado)

**Trigger:** Cron job executado a cada hora

**Regras:**
| Evento | Quando disparar |
|--------|----------------|
| Consulta agendada | 24h antes + 2h antes |
| Vacina (nextDoseAt) | 7 dias antes + no dia |
| Retorno (returnDate) | 3 dias antes + no dia |
| Vermifugação/Antipulgas | 7 dias antes |

**Deduplicação:** Nunca enviar 2x o mesmo lembrete (checar NotificationLog)

### F03 — Preferências por Tutor

**Onde:** Cadastro/edição do tutor

**Campos adicionados:**
```
notifyWhatsApp: boolean (default: true, se tiver número)
notifyEmail: boolean (default: false)
notifyConsultation: boolean (default: true)
notifyVaccination: boolean (default: true)
notifyReturn: boolean (default: true)
```

### F04 — Histórico de Notificações

**Onde:** Detalhe do tutor + detalhe do animal

**Exibe:** data, tipo, canal, status (enviado/falhou), preview da mensagem

### F05 — Configurações da Integração

**Onde:** /configuracoes → Nova tab "Notificações"

**Campos:**
- Evolution API URL (ex: `http://localhost:8080`)
- Evolution API Key
- Nome da instância WhatsApp
- Status da conexão (QR code ou conectado)
- Resend API Key
- E-mail remetente (ex: `vetcare@rastaful.dev`)
- Testar envio (botão que envia mensagem para a própria veterinária)

---

## 6. Templates de Mensagem

### WhatsApp (texto simples, max 4096 chars)

**Lembrete de Consulta:**
```
🐾 *VetCare* — Lembrete de Consulta

Olá *{{tutor_name}}*!

Sua consulta com *{{animal_name}}* está agendada para:
📅 *{{date}}* às *{{time}}*
📍 {{address}}

Em caso de dúvidas ou necessidade de reagendamento, entre em contato.

_Dra. {{vet_name}}_
```

**Lembrete de Vacina:**
```
🐾 *VetCare* — Lembrete de Vacinação

Olá *{{tutor_name}}*!

A vacina *{{vaccine_name}}* de *{{animal_name}}* vence em:
📅 *{{date}}*

Agende sua consulta para manter a proteção em dia! 💉

_Dra. {{vet_name}}_
```

**Lembrete de Retorno:**
```
🐾 *VetCare* — Lembrete de Retorno

Olá *{{tutor_name}}*!

O retorno de *{{animal_name}}* está previsto para:
📅 *{{date}}*

Entre em contato para confirmar o agendamento.

_Dra. {{vet_name}}_
```

### E-mail (HTML com React Email)

Layout profissional com:
- Logo VetCare
- Nome do animal + foto (se disponível)
- Dados do evento (data, hora, local)
- Botão CTA ("Confirmar" ou "Contato")
- Footer com nome e CRMV da veterinária

---

## 7. Evolution API — Arquitetura

### 7.1 Setup Docker

Adicionar ao `docker-compose.dev.yml`:
```yaml
evolution-api:
  image: atendai/evolution-api:latest
  ports:
    - "8080:8080"
  environment:
    - SERVER_URL=http://localhost:8080
    - AUTHENTICATION_API_KEY=${EVOLUTION_API_KEY}
    - DATABASE_ENABLED=false
    - DATABASE_CONNECTION_URI=
    - STORE_MESSAGES=false
    - STORE_MESSAGE_UP=false
    - STORE_CONTACTS=false
    - STORE_CHATS=false
  volumes:
    - evolution_instances:/evolution/instances
```

### 7.2 Fluxo de Conexão

```
1. Veterinária acessa /configuracoes → Notificações
2. Clica "Conectar WhatsApp"
3. Sistema chama Evolution API → GET /instance/connect/{instance}
4. Retorna QR Code (base64)
5. Veterinária escaneia com celular
6. Status muda para "Conectado"
7. Sistema salva status no banco
```

### 7.3 EvolutionApiAdapter

```typescript
class EvolutionApiAdapter implements INotificationService {
  // POST /message/sendText/{instance}
  async sendWhatsApp(phone: string, message: string): Promise<void>
  
  // GET /instance/fetchInstances
  async getConnectionStatus(): Promise<'connected' | 'disconnected' | 'qr_code'>
  
  // GET /instance/connect/{instance}  
  async getQRCode(): Promise<string>  // base64
}
```

### 7.4 API Endpoints Usados

| Endpoint | Uso |
|----------|-----|
| `POST /message/sendText/{instance}` | Enviar mensagem texto |
| `GET /instance/fetchInstances` | Verificar status de conexão |
| `GET /instance/connect/{instance}` | Obter QR Code |
| `GET /instance/connectionState/{instance}` | Estado atual |

---

## 8. Resend — Arquitetura

### 8.1 Setup

```bash
npm install resend @react-email/components
```

### 8.2 ResendAdapter

```typescript
class ResendAdapter {
  async sendEmail(input: {
    to: string
    subject: string
    template: React.ReactElement
  }): Promise<void>
}
```

### 8.3 Templates React Email

```tsx
// ConsultationReminderEmail.tsx
export function ConsultationReminderEmail({ tutorName, animalName, date, time, address, vetName, vetCrmv }) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Container>
          <Heading>🐾 Lembrete de Consulta — VetCare</Heading>
          <Text>Olá {tutorName},</Text>
          <Text>A consulta de <strong>{animalName}</strong> está agendada para:</Text>
          <Section style={highlight}>
            <Text>📅 {date} às {time}</Text>
            <Text>📍 {address}</Text>
          </Section>
          <Button href="https://vetcare.rastaful.dev">Ver detalhes</Button>
          <Hr />
          <Text style={footer}>Dra. {vetName} · CRMV: {vetCrmv}</Text>
        </Container>
      </Body>
    </Html>
  )
}
```

---

## 9. Database — Novas Tabelas

### notification_logs
```prisma
model NotificationLog {
  id               String             @id @default(uuid())
  tenantId         String
  tutorId          String
  animalId         String
  type             NotificationType
  channel          NotificationChannel
  recipientPhone   String?
  recipientEmail   String?
  message          String             @db.Text
  status           NotificationStatus @default(PENDING)
  errorMessage     String?
  sentAt           DateTime?
  createdAt        DateTime           @default(now())

  tutor  Tutor  @relation(fields: [tutorId], references: [id])
  animal Animal @relation(fields: [animalId], references: [id])

  @@index([tenantId])
  @@index([tutorId])
  @@index([animalId])
  @@index([tenantId, status])
  @@map("notification_logs")
}
```

### Campos adicionados em Tutor
```prisma
// Adicionar ao model Tutor:
notifyWhatsApp      Boolean @default(true)
notifyEmail         Boolean @default(false)
notifyConsultation  Boolean @default(true)
notifyVaccination   Boolean @default(true)
notifyReturn        Boolean @default(true)
```

### Campos adicionados em Tenant
```prisma
// Adicionar ao model Tenant:
evolutionApiUrl      String?
evolutionApiKey      String?
evolutionInstanceName String?
resendApiKey         String?
resendFromEmail      String?
```

---

## 10. API Endpoints Novos

```
POST /api/v1/notifications/send
  Body: { tutorId, animalId, type, channel?, referenceId? }
  → Envia notificação imediata

GET  /api/v1/notifications/logs
  Query: tutorId?, animalId?, status?, page?, pageSize?
  → Histórico de notificações

GET  /api/v1/settings/notifications/status
  → Status da conexão WhatsApp + Resend configurado

POST /api/v1/settings/notifications/whatsapp/connect
  → Inicia conexão → retorna QR code base64

GET  /api/v1/settings/notifications/whatsapp/qrcode
  → Retorna QR code atual (polling)

DELETE /api/v1/settings/notifications/whatsapp/disconnect
  → Desconecta instância

POST /api/v1/settings/notifications
  Body: { evolutionApiUrl?, evolutionApiKey?, evolutionInstanceName?, resendApiKey?, resendFromEmail? }
  → Salva configurações
```

---

## 11. UI — Novas Telas

### 11.1 Tab "Notificações" em /configuracoes

```
┌─────────────────────────────────────────┐
│ WhatsApp (Evolution API)                │
├─────────────────────────────────────────┤
│ Status: ● Conectado  [Desconectar]      │ ← se conectado
│ Status: ○ Desconectado  [Conectar]      │ ← se não conectado
│                                         │
│ [QR Code aparece aqui durante conexão]  │
│                                         │
│ URL da API: [_______________]           │
│ API Key:    [_______________]           │
│ Instância:  [_______________]           │
├─────────────────────────────────────────┤
│ E-mail (Resend)                         │
├─────────────────────────────────────────┤
│ Status: ● Configurado                   │
│ API Key:       [_______________]        │
│ E-mail origem: [_______________]        │
├─────────────────────────────────────────┤
│ [Testar envio] [Salvar configurações]   │
└─────────────────────────────────────────┘
```

### 11.2 Botão "Enviar lembrete" (Consulta/Vacina/Retorno)

Aparece no detalhe de consultas, perfil do animal (preventivo).

```
┌─────────────────────────────────────────┐
│ Enviar lembrete para João Silva         │
├─────────────────────────────────────────┤
│ Canal: ● WhatsApp  ○ E-mail  ○ Ambos   │
│                                         │
│ Preview da mensagem:                    │
│ ┌─────────────────────────────────────┐ │
│ │ 🐾 VetCare — Lembrete de Consulta  │ │
│ │ Olá João! Rex tem consulta em...   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [Cancelar]  [Enviar agora]             │
└─────────────────────────────────────────┘
```

### 11.3 Preferências no Cadastro de Tutor

Nova seção "Notificações" no form do tutor:
```
☑ Avisar via WhatsApp
☐ Avisar via E-mail
──────────────────
☑ Lembretes de consulta
☑ Lembretes de vacina
☑ Lembretes de retorno
```

---

## 12. Estratégia TDD

### Testes Unitários

```typescript
// EvolutionApiAdapter
- send() com API disponível → status 'sent'
- send() com API indisponível → status 'failed' (não lança exceção)
- getQRCode() retorna base64 string

// ResendAdapter
- send() com API key válida → status 'sent'
- send() sem destinatário → ValidationError

// SendConsultationReminder use case
- tutor com WhatsApp + notifyWhatsApp=true → envia WhatsApp
- tutor sem WhatsApp mas com email + notifyEmail=true → envia email
- tutor sem preferências → não envia, não lança erro
- registra NotificationLog em todos os casos
- deduplicação: se já enviou hoje → não envia de novo

// Templates
- ConsultationReminderEmail renderiza com dados corretos
- WhatsApp message formatter substitui variáveis corretamente
```

### Critérios de Aceite

```gherkin
Scenario: Veterinária envia lembrete de consulta via WhatsApp
  Given tutor João tem WhatsApp (11) 99999-9999 e notifyWhatsApp=true
  And Evolution API está conectada
  When veterinária clica "Enviar lembrete" na consulta de Rex
  Then João recebe WhatsApp com nome de Rex, data e horário
  And NotificationLog registra status=SENT

Scenario: Fallback para email quando sem WhatsApp
  Given tutor Maria não tem WhatsApp mas tem email maria@email.com
  And Resend está configurado
  When sistema dispara lembrete automático de vacina
  Then Maria recebe email com os dados da vacina
  And NotificationLog registra channel=EMAIL, status=SENT

Scenario: Deduplicação de notificações
  Given lembrete de consulta já foi enviado hoje para João
  When job agendado executa novamente
  Then sistema NÃO envia segunda notificação
  And log registra motivo: "já notificado hoje"

Scenario: Evolution API offline
  Given Evolution API está inacessível
  When veterinária tenta enviar lembrete WhatsApp
  Then sistema tenta fallback por email (se configurado)
  And NotificationLog registra status=FAILED com errorMessage
  And UI exibe toast de erro com mensagem clara
```

---

## 13. DevOps

### Evolution API Docker

```yaml
# docker-compose.dev.yml (adição)
evolution-api:
  image: atendai/evolution-api:v2.2.3
  restart: unless-stopped
  ports:
    - "8080:8080"
  environment:
    SERVER_URL: http://localhost:8080
    AUTHENTICATION_API_KEY: ${EVOLUTION_API_KEY}
    STORE_MESSAGES: "false"
    STORE_CONTACTS: "false"
  volumes:
    - evolution_instances:/evolution/instances
```

### Variáveis de Ambiente Novas

```env
# Evolution API
EVOLUTION_API_URL="http://localhost:8080"
EVOLUTION_API_KEY="sua-chave-secreta"
EVOLUTION_INSTANCE_NAME="vetcare"

# Resend
RESEND_API_KEY="re_xxxxxxxxxxxx"
RESEND_FROM_EMAIL="noreply@rastaful.dev"
```

### Cron Job (Next.js)

```typescript
// src/app/api/cron/notifications/route.ts
// Chamado pelo sistema externo (cron ou GitHub Actions scheduled)
// Ou usando next-cron (biblioteca para App Router)
// Frequência: a cada hora

GET /api/cron/notifications?secret=${CRON_SECRET}
→ Busca eventos próximos
→ Filtra os que ainda não foram notificados
→ Dispara notificações
→ Registra logs
```

---

## 14. Plano de Evolução

| Fase | Adição |
|------|--------|
| **Agora** | Manual (botão) + Auto (cron) + WhatsApp + Email |
| **Fase 2** | Resposta do tutor (webhook WhatsApp → confirmar/cancelar consulta) |
| **Fase 3** | WhatsApp Business API oficial (quando tiver CNPJ verificado) |
| **Fase 4** | Notificação push (app mobile) |

---

## 15. Riscos

| Risco | Mitigação |
|-------|-----------|
| Número banido pela Meta | Limitar volume (<200 msgs/dia); não enviar mensagens em massa; usar apenas para contatos existentes |
| Evolution API indisponível | Fallback automático para email; retry com backoff |
| Token Resend inválido | Validação no save; alerta no dashboard |
| Tutor marca como spam | Sempre incluir "Para parar os avisos, informe a veterinária" |
| Rate limit Evolution API | Fila de envio com delay entre mensagens |

---

## 16. Checklist de Aprovação

- [ ] Evolution API: usar imagem `v2.2.3` ou latest?
- [ ] Cron job: usar GitHub Actions scheduled (simples) ou biblioteca next-cron?
- [ ] Webhook de resposta do tutor: incluir no MVP desta feature ou fase 2?
- [ ] Domínio do e-mail: `noreply@rastaful.dev` — precisa configurar SPF/DKIM no Cloudflare?
- [ ] Volume estimado de mensagens/mês: quantos tutores e eventos previstos?
- [ ] Nome da instância Evolution API: sugestão `vetcare` (pode ser qualquer nome)

## 17. Decisões de Aprovação

| # | Decisão | Resposta |
|---|---------|----------|
| 1 | Evolution API version | `latest` |
| 2 | Cron job | Interno via `instrumentation.ts` + API route — fácil migrar para GitHub Actions/Cloudflare depois |
| 3 | Webhook de resposta | Fase 2 — spec criada em `notifications/spec-webhook.md` |
| 4 | E-mail remetente | `noreply@rastaful.dev` (já configurado no Rasta Finanças) |
| 5 | Volume estimado | Máx 20 tutores — rate limit conservador: 1 msg/segundo |

**Cron interno (fácil migração):**
- `src/instrumentation.ts` → `setInterval` a cada hora chama `/api/cron/notifications`
- API route protegida por `CRON_SECRET` — qualquer serviço externo pode chamar no futuro
- Para migrar: desabilitar `setInterval`, apontar GitHub Actions/Cloudflare Cron para a mesma URL

**Organização de pastas:**
- Evolution API Docker → `/home/rodrigo/services/evolution/` (infra compartilhada, não dentro do vetcare)
- Código da feature → `/home/rodrigo/vetcare/src/modules/notifications/`

**Aprovado por**: Rodrigo
**Data**: 2026-06-04
**Status**: ✅ APROVADO — PRONTO PARA IMPLEMENTAÇÃO
