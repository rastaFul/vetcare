# API Design — VetCare (OpenAPI-style)

## Convenções

- Base URL: `/api/v1`
- Auth: Session cookie (NextAuth) — `Authorization: Bearer <token>` para API clients
- Content-Type: `application/json`
- Paginação: `?page=1&pageSize=20`
- Tenant: injetado via middleware (não exposto na URL)
- Datas: ISO 8601 (ex: `2026-06-04T14:00:00-03:00`)
- Soft delete: `status=INACTIVE` (nunca DELETE físico em dados clínicos)

## Response envelope

```json
// Sucesso lista
{ "data": [], "meta": { "total": 42, "page": 1, "pageSize": 20 } }

// Sucesso item
{ "data": { ... } }

// Erro
{ "error": { "code": "TUTOR_NOT_FOUND", "message": "Tutor não encontrado", "details": null } }
```

---

## Auth

```
POST   /api/auth/signin          → NextAuth signin (Google OAuth)
GET    /api/auth/session         → Sessão atual
POST   /api/auth/signout         → Logout
GET    /api/auth/callback/google → OAuth callback
```

---

## Tutors

```
GET    /api/v1/tutors
  Query: search?, status?, page?, pageSize?
  Response: { data: Tutor[], meta }

POST   /api/v1/tutors
  Body: { name, cpf?, phone, whatsapp?, email?, address?, notes? }
  Response: { data: Tutor }

GET    /api/v1/tutors/:id
  Response: { data: Tutor & { animals: Animal[] } }

PUT    /api/v1/tutors/:id
  Body: Partial<TutorInput>
  Response: { data: Tutor }

PATCH  /api/v1/tutors/:id/status
  Body: { status: "ACTIVE" | "INACTIVE" }
  Response: { data: Tutor }
```

**Tutor DTO:**
```json
{
  "id": "uuid",
  "name": "João Silva",
  "cpf": "***.***.***-**",
  "phone": "+5511999999999",
  "whatsapp": "+5511999999999",
  "email": "joao@email.com",
  "address": {
    "street": "Rua A",
    "number": "123",
    "complement": "Apto 1",
    "neighborhood": "Centro",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01001-000"
  },
  "notes": "Prefere atendimento manhã",
  "status": "ACTIVE",
  "animalsCount": 2,
  "createdAt": "2026-01-15T10:00:00-03:00"
}
```

---

## Animals

```
GET    /api/v1/animals
  Query: tutorId?, species?, status?, search?, page?, pageSize?
  Response: { data: Animal[], meta }

POST   /api/v1/animals
  Body: { tutorId, name, species, breed?, sex, birthDate?, weightKg?, color?, castrated, microchip?, notes? }
  Response: { data: Animal }

GET    /api/v1/animals/:id
  Response: { data: Animal & { tutor: Tutor } }

PUT    /api/v1/animals/:id
  Body: Partial<AnimalInput>
  Response: { data: Animal }

PATCH  /api/v1/animals/:id/status
  Body: { status: "ACTIVE" | "DECEASED" | "INACTIVE" }

POST   /api/v1/animals/:id/photo
  Body: multipart/form-data { file: File }
  Response: { data: { photoUrl: string } }

GET    /api/v1/animals/:id/timeline
  Query: type?, page?, pageSize?
  Response: { data: TimelineEntry[], meta }
  Types: CONSULTATION | VACCINATION | DEWORMING | ANTI_FLEAS | PRESCRIPTION | ATTACHMENT
```

---

## Consultations

```
GET    /api/v1/consultations
  Query: animalId?, status?, date?, veterinarianId?, page?, pageSize?
  Response: { data: Consultation[], meta }

POST   /api/v1/consultations
  Body: {
    animalId,
    scheduledAt,        // ISO 8601
    address?,
    observations?,
    createCalendarEvent?: boolean  // default: true
  }
  Response: { data: Consultation }

GET    /api/v1/consultations/:id
  Response: { data: Consultation & { animal, tutor, prescriptions, attachments } }

PUT    /api/v1/consultations/:id
  Body: { scheduledAt?, address?, observations? }
  Response: { data: Consultation }
  Side-effect: Atualiza evento Google Calendar

PATCH  /api/v1/consultations/:id/status
  Body: {
    status: "CONFIRMED" | "COMPLETED" | "CANCELLED",
    anamnesis?,     // obrigatório se COMPLETED
    diagnosis?,     // obrigatório se COMPLETED
    returnDate?,    // opcional se COMPLETED
    createReturnReminder?: boolean
  }
  Response: { data: Consultation }
  Side-effect: Cria/deleta evento Google Calendar conforme transição
```

---

## Vaccinations

```
GET    /api/v1/animals/:animalId/vaccinations
  Response: { data: VaccinationRecord[] }

POST   /api/v1/animals/:animalId/vaccinations
  Body: {
    vaccine,
    appliedAt,
    nextDoseAt?,
    batchNumber?,
    manufacturer?,
    observations?,
    createReminder?: boolean
  }
  Response: { data: VaccinationRecord }

PUT    /api/v1/animals/:animalId/vaccinations/:id
  Body: Partial<VaccinationInput>
  Response: { data: VaccinationRecord }

DELETE /api/v1/animals/:animalId/vaccinations/:id
  Response: 204 No Content
```

---

## Dewormings

```
GET    /api/v1/animals/:animalId/dewormings
POST   /api/v1/animals/:animalId/dewormings
  Body: { medication, appliedAt, nextApplicationAt?, observations?, createReminder? }
PUT    /api/v1/animals/:animalId/dewormings/:id
DELETE /api/v1/animals/:animalId/dewormings/:id
```

---

## Anti-Fleas

```
GET    /api/v1/animals/:animalId/antifleas
POST   /api/v1/animals/:animalId/antifleas
  Body: { medication, appliedAt, nextApplicationAt?, observations?, createReminder? }
PUT    /api/v1/animals/:animalId/antifleas/:id
DELETE /api/v1/animals/:animalId/antifleas/:id
```

---

## Prescriptions

```
GET    /api/v1/consultations/:consultationId/prescriptions
  Response: { data: Prescription[] }

POST   /api/v1/consultations/:consultationId/prescriptions
  Body: {
    diagnosis,
    observations?,
    items: [{ medication, dosage, frequency, duration, instructions? }]
  }
  Response: { data: Prescription }
  Side-effect: Dispara geração de PDF em background

GET    /api/v1/prescriptions/:id
  Response: { data: Prescription & { items, pdfUrl } }

GET    /api/v1/prescriptions/:id/pdf
  Response: Redirect para presigned URL do PDF (R2)
  Cache-Control: private, max-age=3600
```

---

## Attachments

```
POST   /api/v1/attachments/upload-url
  Body: { animalId, consultationId?, type, filename, mimeType, sizeBytes }
  Response: { data: { uploadUrl: string, attachmentId: string } }
  Note: uploadUrl é presigned URL PUT para R2

POST   /api/v1/attachments/confirm
  Body: { attachmentId }
  Response: { data: Attachment }

GET    /api/v1/animals/:animalId/attachments
  Query: type?, page?, pageSize?
  Response: { data: Attachment[] }

GET    /api/v1/attachments/:id/download-url
  Response: { data: { downloadUrl: string, expiresAt: string } }

DELETE /api/v1/attachments/:id
  Response: 204
  Side-effect: Remove do R2
```

---

## Dashboard

```
GET    /api/v1/dashboard
  Response: {
    data: {
      consultationsToday: ConsultationSummary[],
      pendingReturns: ReturnSummary[],       // próximos 7 dias
      upcomingVaccinations: VaccineSummary[], // próximos 30 dias
      totals: {
        animals: number,
        tutors: number,
        consultationsThisMonth: number
      }
    }
  }
```

---

## Settings

```
GET    /api/v1/settings/profile
  Response: { data: UserProfile }

PUT    /api/v1/settings/profile
  Body: { name?, crmv?, specialty? }

POST   /api/v1/settings/signature
  Body: multipart/form-data { file: File }
  Response: { data: { signatureUrl: string } }

GET    /api/v1/settings/calendar/connect
  Response: Redirect para Google OAuth (scope calendar)

GET    /api/v1/settings/calendar/status
  Response: { data: { connected: boolean, email?: string } }

DELETE /api/v1/settings/calendar/disconnect
  Response: 204
```

---

## Códigos de Erro

| Code | HTTP | Descrição |
|------|------|-----------|
| `UNAUTHORIZED` | 401 | Não autenticado |
| `FORBIDDEN` | 403 | Sem permissão (outro tenant) |
| `NOT_FOUND` | 404 | Recurso não encontrado |
| `VALIDATION_ERROR` | 422 | Body inválido (detalhes em `details`) |
| `CONFLICT` | 409 | CPF duplicado, etc. |
| `CALENDAR_SYNC_FAILED` | 502 | Falha na sincronização Google Calendar |
| `PDF_GENERATION_FAILED` | 500 | Falha na geração de PDF |
| `STORAGE_ERROR` | 500 | Falha no upload/download R2 |

---

## Rate Limiting

| Endpoint | Limite |
|----------|--------|
| `POST /api/v1/attachments/upload-url` | 20 req/min por tenant |
| `POST /api/v1/prescriptions` | 30 req/min por tenant |
| Demais endpoints | 100 req/min por tenant |
| Auth endpoints | 10 req/min por IP |
