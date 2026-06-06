# Domain Model — VetCare

## Bounded Contexts

```
┌─────────────────────────────────────────────────────────────────────┐
│                         VetCare System                              │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │   Identity   │   │   Patient    │   │       Clinical       │   │
│  │   & Access   │   │  Management  │   │      Management      │   │
│  │              │   │              │   │                      │   │
│  │  - User      │   │  - Tutor     │   │  - Consultation      │   │
│  │  - Tenant    │   │  - Animal    │   │  - Anamnesis         │   │
│  │  - Session   │   │  - Address   │   │  - Diagnosis         │   │
│  └──────────────┘   └──────────────┘   └──────────────────────┘   │
│                                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐   │
│  │  Preventive  │   │ Prescription │   │      Documents       │   │
│  │    Care      │   │              │   │                      │   │
│  │              │   │  - Recipe    │   │  - Attachment        │   │
│  │  - Vaccine   │   │  - PdfFile   │   │  - StorageFile       │   │
│  │  - Deworming │   │  - Items     │   │                      │   │
│  │  - AntiFleas │   │              │   │                      │   │
│  └──────────────┘   └──────────────┘   └──────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                     Scheduling                               │  │
│  │   - Appointment (sync) — GoogleCalendarEvent (external)      │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Aggregates e Entidades

### BC: Identity & Access

**Aggregate: Tenant**
```
Tenant (Aggregate Root)
├── id: UUID
├── name: string
├── slug: string (unique)
├── plan: TenantPlan (FREE | PRO | ENTERPRISE)
├── status: TenantStatus (ACTIVE | SUSPENDED | CANCELLED)
├── createdAt: DateTime
└── settings: TenantSettings (value object)
    ├── timezone: string
    ├── currency: string
    └── calendarIntegration: boolean
```

**Aggregate: User**
```
User (Aggregate Root)
├── id: UUID
├── tenantId: UUID (FK)
├── name: string
├── email: Email (value object)
├── role: UserRole (OWNER | VETERINARIAN | ASSISTANT | ADMIN)
├── status: UserStatus (ACTIVE | INACTIVE)
├── googleId: string? (para OAuth)
├── googleCalendarToken: EncryptedToken? (value object)
├── crmv: string? (registro veterinário)
├── specialty: string?
├── signature: string? (URL da assinatura digitalizada)
└── createdAt: DateTime
```

---

### BC: Patient Management

**Aggregate: Tutor**
```
Tutor (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── name: string
├── cpf: CPF? (value object — validado, armazenado mascarado)
├── phone: Phone (value object)
├── whatsapp: Phone? (value object)
├── email: Email? (value object)
├── address: Address (value object)
│   ├── street: string
│   ├── number: string
│   ├── complement: string?
│   ├── neighborhood: string
│   ├── city: string
│   ├── state: string (UF)
│   └── zipCode: string
├── notes: string?
├── status: TutorStatus (ACTIVE | INACTIVE)
├── createdAt: DateTime
└── updatedAt: DateTime

Domain Events:
- TutorRegistered
- TutorUpdated
- TutorDeactivated
```

**Aggregate: Animal**
```
Animal (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── tutorId: UUID (FK)
├── name: string
├── species: Species (DOG | CAT | BIRD | RABBIT | REPTILE | OTHER)
├── breed: string?
├── sex: Sex (MALE | FEMALE | UNKNOWN)
├── birthDate: Date?
├── weight: Weight? (value object — kg com 2 decimais)
├── color: string?
├── castrated: boolean
├── microchip: string?
├── photoUrl: string? (R2 URL)
├── notes: string?
├── status: AnimalStatus (ACTIVE | DECEASED | INACTIVE)
├── createdAt: DateTime
└── updatedAt: DateTime

Domain Events:
- AnimalRegistered
- AnimalUpdated
- AnimalStatusChanged
```

---

### BC: Clinical Management

**Aggregate: Consultation**
```
Consultation (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── animalId: UUID (FK)
├── veterinarianId: UUID (FK → User)
├── scheduledAt: DateTime
├── address: Address? (value object — endereço do atendimento)
├── status: ConsultationStatus
│   └── (SCHEDULED | CONFIRMED | COMPLETED | CANCELLED)
├── googleCalendarEventId: string?
├── anamnesis: string? (preenchido ao concluir)
├── diagnosis: string? (preenchido ao concluir)
├── observations: string?
├── returnDate: Date? (data sugerida de retorno)
├── createdAt: DateTime
└── updatedAt: DateTime

Invariants:
- anamnesis e diagnosis são obrigatórios ao transitar para COMPLETED
- Não pode editar consulta COMPLETED ou CANCELLED
- googleCalendarEventId sincronizado no ciclo de vida

Domain Events:
- ConsultationScheduled
- ConsultationConfirmed
- ConsultationCompleted
- ConsultationCancelled
- ReturnScheduled
```

---

### BC: Preventive Care

**Aggregate: VaccinationRecord**
```
VaccinationRecord (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── animalId: UUID (FK)
├── vaccine: string (nome da vacina)
├── appliedAt: Date
├── nextDoseAt: Date?
├── batchNumber: string?
├── manufacturer: string?
├── observations: string?
├── googleCalendarEventId: string? (lembrete próxima dose)
├── createdAt: DateTime

Domain Events:
- VaccinationApplied
- VaccinationReminderScheduled
```

**Aggregate: DewormingRecord**
```
DewormingRecord (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── animalId: UUID (FK)
├── medication: string
├── appliedAt: Date
├── nextApplicationAt: Date?
├── observations: string?
├── googleCalendarEventId: string?
└── createdAt: DateTime

Domain Events:
- DewormingApplied
```

**Aggregate: AntiFleasRecord**
```
AntiFleasRecord (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── animalId: UUID (FK)
├── medication: string
├── appliedAt: Date
├── nextApplicationAt: Date?
├── observations: string?
├── googleCalendarEventId: string?
└── createdAt: DateTime

Domain Events:
- AntiFleasApplied
```

---

### BC: Prescription

**Aggregate: Prescription**
```
Prescription (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── consultationId: UUID (FK)
├── animalId: UUID (FK)
├── veterinarianId: UUID (FK)
├── diagnosis: string
├── items: PrescriptionItem[] (value objects)
│   ├── medication: string
│   ├── dosage: string
│   ├── frequency: string
│   ├── duration: string
│   └── instructions: string?
├── observations: string?
├── pdfUrl: string? (R2 URL — gerado após criação)
├── pdfGeneratedAt: DateTime?
├── createdAt: DateTime

Invariants:
- items.length >= 1
- pdfUrl preenchido após geração bem-sucedida

Domain Events:
- PrescriptionCreated
- PrescriptionPdfGenerated
```

---

### BC: Documents

**Aggregate: Attachment**
```
Attachment (Aggregate Root)
├── id: UUID
├── tenantId: UUID
├── animalId: UUID (FK)
├── consultationId: UUID? (FK — opcional)
├── type: AttachmentType (EXAM | PHOTO | REPORT | EXTERNAL_PRESCRIPTION | OTHER)
├── name: string (nome original do arquivo)
├── storageKey: string (chave no R2)
├── url: string (presigned URL — gerado on-demand)
├── mimeType: string
├── sizeBytes: number
├── uploadedBy: UUID (FK → User)
└── createdAt: DateTime

Domain Events:
- AttachmentUploaded
```

---

### BC: Scheduling

**Serviço de Domínio: CalendarSyncService**
```
CalendarSyncService
├── createEvent(consultation: Consultation, user: User): GoogleEventId
├── updateEvent(consultation: Consultation, user: User): void
├── deleteEvent(eventId: string, user: User): void
├── createReminder(date: Date, title: string, user: User): GoogleEventId
```

Port (interface definida no domínio):
```
ICalendarService (port)
├── createConsultationEvent(dto): Promise<string>
├── updateConsultationEvent(eventId, dto): Promise<void>
├── deleteEvent(eventId): Promise<void>
├── createReminder(dto): Promise<string>
```

Adapter (implementação na infra):
```
GoogleCalendarAdapter implements ICalendarService
```

---

## Value Objects

| VO | Validação |
|----|-----------|
| `Email` | formato RFC 5322 |
| `CPF` | dígitos verificadores, armazenado sem máscara |
| `Phone` | normalizado E.164 |
| `Address` | zipCode validado (8 dígitos) |
| `Weight` | número positivo, máx 2 casas decimais |
| `EncryptedToken` | tokens OAuth criptografados em repouso |

---

## Serviços de Domínio

| Serviço | Responsabilidade |
|---------|-----------------|
| `PrescriptionPdfService` | Gera PDF da receita com layout profissional |
| `CalendarSyncService` | Orquestra sync com Google Calendar |
| `TimelineService` | Agrega eventos de múltiplos BCs para a timeline do animal |
| `DashboardService` | Agrega métricas do dashboard |
| `ReminderService` | Calcula e agenda lembretes de vacinas/retornos |
