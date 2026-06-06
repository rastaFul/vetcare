# Database Design — VetCare

## Tecnologia
PostgreSQL 16 + Prisma ORM 6

---

## Modelo Lógico — Entidades e Relacionamentos

```
tenants 1──N users
tenants 1──N tutors
tenants 1──N animals
tutors  1──N animals
animals 1──N consultations
animals 1──N vaccination_records
animals 1──N deworming_records
animals 1──N anti_fleas_records
animals 1──N attachments
consultations 1──N prescriptions
consultations 1──N attachments
prescriptions 1──N prescription_items
users   1──N consultations (veterinarian)
```

---

## Schema Prisma Completo

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── IDENTITY ────────────────────────────────────────────────────

model Tenant {
  id        String       @id @default(uuid())
  name      String
  slug      String       @unique
  plan      TenantPlan   @default(FREE)
  status    TenantStatus @default(ACTIVE)
  timezone  String       @default("America/Sao_Paulo")
  createdAt DateTime     @default(now())
  updatedAt DateTime     @updatedAt

  users         User[]
  tutors        Tutor[]
  animals       Animal[]
  consultations Consultation[]

  @@map("tenants")
}

model User {
  id                    String     @id @default(uuid())
  tenantId              String
  name                  String
  email                 String
  role                  UserRole   @default(VETERINARIAN)
  status                UserStatus @default(ACTIVE)
  crmv                  String?
  specialty             String?
  signatureUrl          String?
  googleId              String?
  googleCalendarToken   String?    // encrypted JSON
  googleCalendarRefresh String?    // encrypted
  image                 String?    // avatar URL

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  tenant        Tenant         @relation(fields: [tenantId], references: [id])
  consultations Consultation[]
  prescriptions Prescription[]
  attachments   Attachment[]

  // NextAuth
  accounts Account[]
  sessions Session[]

  @@unique([tenantId, email])
  @@index([tenantId])
  @@map("users")
}

// NextAuth required models
model Account {
  id                String  @id @default(uuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(uuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

// ─── PATIENTS ────────────────────────────────────────────────────

model Tutor {
  id           String      @id @default(uuid())
  tenantId     String
  name         String
  cpf          String?
  phone        String
  whatsapp     String?
  email        String?
  street       String?
  number       String?
  complement   String?
  neighborhood String?
  city         String?
  state        String?
  zipCode      String?
  notes        String?     @db.Text
  status       TutorStatus @default(ACTIVE)
  createdAt    DateTime    @default(now())
  updatedAt    DateTime    @updatedAt

  tenant  Tenant   @relation(fields: [tenantId], references: [id])
  animals Animal[]

  @@unique([tenantId, cpf])  // CPF único por tenant
  @@index([tenantId])
  @@index([tenantId, name])
  @@index([tenantId, phone])
  @@map("tutors")
}

model Animal {
  id         String        @id @default(uuid())
  tenantId   String
  tutorId    String
  name       String
  species    Species
  breed      String?
  sex        Sex           @default(UNKNOWN)
  birthDate  DateTime?
  weightKg   Decimal?      @db.Decimal(5, 2)
  color      String?
  castrated  Boolean       @default(false)
  microchip  String?
  photoUrl   String?
  notes      String?       @db.Text
  status     AnimalStatus  @default(ACTIVE)
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  tenant              Tenant               @relation(fields: [tenantId], references: [id])
  tutor               Tutor                @relation(fields: [tutorId], references: [id])
  consultations       Consultation[]
  vaccinationRecords  VaccinationRecord[]
  dewormingRecords    DewormingRecord[]
  antiFleasRecords    AntiFleasRecord[]
  attachments         Attachment[]
  prescriptions       Prescription[]

  @@index([tenantId])
  @@index([tenantId, tutorId])
  @@index([tenantId, species])
  @@map("animals")
}

// ─── CLINICAL ────────────────────────────────────────────────────

model Consultation {
  id                    String             @id @default(uuid())
  tenantId              String
  animalId              String
  veterinarianId        String
  scheduledAt           DateTime
  street                String?
  number                String?
  complement            String?
  neighborhood          String?
  city                  String?
  state                 String?
  zipCode               String?
  status                ConsultationStatus @default(SCHEDULED)
  googleCalendarEventId String?
  anamnesis             String?            @db.Text
  diagnosis             String?            @db.Text
  observations          String?            @db.Text
  returnDate            DateTime?
  returnEventId         String?            // Google Calendar event ID do retorno
  createdAt             DateTime           @default(now())
  updatedAt             DateTime           @updatedAt

  tenant       Tenant         @relation(fields: [tenantId], references: [id])
  animal       Animal         @relation(fields: [animalId], references: [id])
  veterinarian User           @relation(fields: [veterinarianId], references: [id])
  prescriptions Prescription[]
  attachments  Attachment[]

  @@index([tenantId])
  @@index([tenantId, animalId])
  @@index([tenantId, scheduledAt])
  @@index([tenantId, status])
  @@index([tenantId, veterinarianId, scheduledAt])
  @@map("consultations")
}

// ─── PREVENTIVE ───────────────────────────────────────────────────

model VaccinationRecord {
  id                    String   @id @default(uuid())
  tenantId              String
  animalId              String
  vaccine               String
  appliedAt             DateTime
  nextDoseAt            DateTime?
  batchNumber           String?
  manufacturer          String?
  observations          String?
  googleCalendarEventId String?
  createdAt             DateTime @default(now())

  animal Animal @relation(fields: [animalId], references: [id])

  @@index([tenantId])
  @@index([animalId])
  @@index([tenantId, nextDoseAt])  // para dashboard de próximas vacinas
  @@map("vaccination_records")
}

model DewormingRecord {
  id                    String   @id @default(uuid())
  tenantId              String
  animalId              String
  medication            String
  appliedAt             DateTime
  nextApplicationAt     DateTime?
  observations          String?
  googleCalendarEventId String?
  createdAt             DateTime @default(now())

  animal Animal @relation(fields: [animalId], references: [id])

  @@index([tenantId])
  @@index([animalId])
  @@map("deworming_records")
}

model AntiFleasRecord {
  id                    String   @id @default(uuid())
  tenantId              String
  animalId              String
  medication            String
  appliedAt             DateTime
  nextApplicationAt     DateTime?
  observations          String?
  googleCalendarEventId String?
  createdAt             DateTime @default(now())

  animal Animal @relation(fields: [animalId], references: [id])

  @@index([tenantId])
  @@index([animalId])
  @@map("anti_fleas_records")
}

// ─── PRESCRIPTIONS ────────────────────────────────────────────────

model Prescription {
  id               String             @id @default(uuid())
  tenantId         String
  consultationId   String
  animalId         String
  veterinarianId   String
  diagnosis        String             @db.Text
  observations     String?            @db.Text
  pdfUrl           String?
  pdfGeneratedAt   DateTime?
  createdAt        DateTime           @default(now())

  consultation  Consultation        @relation(fields: [consultationId], references: [id])
  animal        Animal              @relation(fields: [animalId], references: [id])
  veterinarian  User                @relation(fields: [veterinarianId], references: [id])
  items         PrescriptionItem[]

  @@index([tenantId])
  @@index([animalId])
  @@index([consultationId])
  @@map("prescriptions")
}

model PrescriptionItem {
  id             String @id @default(uuid())
  prescriptionId String
  medication     String
  dosage         String
  frequency      String
  duration       String
  instructions   String?
  sortOrder      Int    @default(0)

  prescription Prescription @relation(fields: [prescriptionId], references: [id], onDelete: Cascade)

  @@index([prescriptionId])
  @@map("prescription_items")
}

// ─── DOCUMENTS ───────────────────────────────────────────────────

model Attachment {
  id             String         @id @default(uuid())
  tenantId       String
  animalId       String
  consultationId String?
  type           AttachmentType @default(OTHER)
  name           String
  storageKey     String
  mimeType       String
  sizeBytes      Int
  uploadedById   String
  createdAt      DateTime       @default(now())

  animal       Animal        @relation(fields: [animalId], references: [id])
  consultation Consultation? @relation(fields: [consultationId], references: [id])
  uploadedBy   User          @relation(fields: [uploadedById], references: [id])

  @@index([tenantId])
  @@index([animalId])
  @@index([consultationId])
  @@map("attachments")
}

// ─── ENUMS ───────────────────────────────────────────────────────

enum TenantPlan {
  FREE
  PRO
  ENTERPRISE
}

enum TenantStatus {
  ACTIVE
  SUSPENDED
  CANCELLED
}

enum UserRole {
  OWNER
  VETERINARIAN
  ASSISTANT
  ADMIN
}

enum UserStatus {
  ACTIVE
  INACTIVE
}

enum TutorStatus {
  ACTIVE
  INACTIVE
}

enum AnimalStatus {
  ACTIVE
  DECEASED
  INACTIVE
}

enum Species {
  DOG
  CAT
  BIRD
  RABBIT
  REPTILE
  OTHER
}

enum Sex {
  MALE
  FEMALE
  UNKNOWN
}

enum ConsultationStatus {
  SCHEDULED
  CONFIRMED
  COMPLETED
  CANCELLED
}

enum AttachmentType {
  EXAM
  PHOTO
  REPORT
  EXTERNAL_PRESCRIPTION
  OTHER
}
```

---

## Índices — Justificativa

| Índice | Motivo |
|--------|--------|
| `users(tenantId, email)` UNIQUE | Login + unicidade por tenant |
| `tutors(tenantId)` | Listagem de tutores do tenant |
| `tutors(tenantId, name)` | Busca por nome |
| `tutors(tenantId, phone)` | Busca por telefone |
| `animals(tenantId, tutorId)` | Animais por tutor |
| `consultations(tenantId, scheduledAt)` | Dashboard: consultas do dia |
| `consultations(tenantId, status)` | Filtro por status |
| `vaccination_records(tenantId, nextDoseAt)` | Dashboard: vacinas próximas |

---

## Estratégia de Migrations

1. `prisma migrate dev` — desenvolvimento local
2. `prisma migrate deploy` — CI/CD (aplica pending migrations)
3. Migrations versionadas e commitadas no repositório
4. Rollback: migrations escritas com passos reversíveis quando possível
5. Dados sensíveis (CPF) — nunca em logs de migration

---

## Considerações LGPD no Schema

| Campo | Proteção |
|-------|----------|
| `cpf` | Armazenado sem formatação; acesso auditado |
| `googleCalendarToken` | Encrypted em repouso (AES-256-GCM) |
| `googleCalendarRefresh` | Encrypted em repouso |
| `email`, `phone` | Sem criptografia em repouso (busca necessária) |
| Dados clínicos | Acesso restrito por tenant + role |

---

## Backup

- PostgreSQL WAL (Write-Ahead Log) habilitado
- Backup diário automatizado (cron)
- Retenção: 30 dias em produção
- Teste de restore: mensal
