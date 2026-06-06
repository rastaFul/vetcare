# Test Strategy — VetCare

## Filosofia

TDD (Test-Driven Development) obrigatório. Red → Green → Refactor.

Nunca implementar código antes do teste.

---

## Pirâmide de Testes

```
         /\
        /E2E\        (Playwright — 5-10 fluxos críticos)
       /──────\
      /Integração\   (Supertest — API Routes + DB)
     /────────────\
    /  Unitários  \  (Jest — Use cases, domain logic, value objects)
   /______________\
```

### Metas de Cobertura

| Camada | Meta |
|--------|------|
| Unitários (use-cases, domain) | ≥ 80% |
| Integração (API routes) | ≥ 60% |
| E2E (fluxos críticos) | 100% dos fluxos definidos |

---

## Testes Unitários — Jest

### Framework
- **Jest** + **@testing-library/react** (componentes)
- **ts-jest** para TypeScript
- **@faker-js/faker** para fixtures

### Estrutura de Arquivo
```
src/modules/[module]/
├── application/use-cases/
│   ├── RegisterTutor.ts
│   └── RegisterTutor.test.ts  // co-located
```

### Padrão AAA (Arrange, Act, Assert)

```typescript
// RegisterTutor.test.ts
describe('RegisterTutor', () => {
  describe('when input is valid', () => {
    it('should create tutor and emit TutorRegistered event', async () => {
      // Arrange
      const repo = new InMemoryTutorRepository()
      const useCase = new RegisterTutor(repo, eventBus)
      const input = { tenantId: 'tenant-1', name: 'João Silva', phone: '11999999999' }

      // Act
      const result = await useCase.execute(input)

      // Assert
      expect(result.name).toBe('João Silva')
      expect(repo.findById(result.id)).toBeDefined()
      expect(eventBus.emitted).toContainEqual(
        expect.objectContaining({ type: 'TutorRegistered' })
      )
    })
  })

  describe('when CPF is invalid', () => {
    it('should throw InvalidCpfError', async () => {
      // ...
    })
  })

  describe('when CPF already exists in tenant', () => {
    it('should throw DuplicateCpfError', async () => {
      // ...
    })
  })
})
```

### Casos de Teste por Módulo

#### Patients
```
RegisterTutor
  ✓ válido → cria tutor
  ✓ CPF inválido → InvalidCpfError
  ✓ CPF duplicado no tenant → DuplicateCpfError
  ✓ sem telefone → ValidationError
  ✓ CPF de outro tenant → cria (sem conflito)

RegisterAnimal
  ✓ válido com tutor → cria animal
  ✓ tutor não existe → TutorNotFoundError
  ✓ peso negativo → ValidationError
  ✓ espécie desconhecida → ValidationError

UpdateAnimal
  ✓ atualiza campos opcionais
  ✓ animal de outro tenant → ForbiddenError
```

#### Clinical
```
ScheduleConsultation
  ✓ válido → cria consulta SCHEDULED + emite ConsultationScheduled
  ✓ data no passado → ValidationError
  ✓ animal inexistente → AnimalNotFoundError

CompleteConsultation
  ✓ com anamnese + diagnóstico → COMPLETED + emite ConsultationCompleted
  ✓ sem anamnese → ValidationError
  ✓ sem diagnóstico → ValidationError
  ✓ consulta CANCELLED → InvalidStatusTransitionError

CancelConsultation
  ✓ SCHEDULED → CANCELLED + emite ConsultationCancelled
  ✓ COMPLETED → InvalidStatusTransitionError
```

#### Prescriptions
```
CreatePrescription
  ✓ válido → cria prescrição + emite PrescriptionCreated
  ✓ sem items → ValidationError
  ✓ consulta inexistente → ConsultationNotFoundError

GeneratePrescriptionPdf
  ✓ gera PDF com dados completos
  ✓ armazena no R2 (mock)
  ✓ atualiza pdfUrl na prescrição
```

#### Value Objects
```
CPF
  ✓ 123.456.789-09 → válido
  ✓ 111.111.111-11 → inválido (sequência repetida)
  ✓ 123.456.789-00 → inválido (dígito errado)

Email
  ✓ joao@email.com → válido
  ✓ joao@  → inválido

Weight
  ✓ 25.50 → válido
  ✓ -1 → inválido
  ✓ 0 → inválido
```

---

## Testes de Integração — Supertest

### Setup
```typescript
// tests/helpers/setup.ts
- Banco PostgreSQL de teste (DATABASE_URL_TEST)
- prisma migrate reset --force antes de cada suite
- Fixtures com @faker-js/faker
- Auth mockado (jest.mock('next-auth'))
```

### Casos por Endpoint

```
GET /api/v1/tutors
  ✓ retorna tutores do tenant autenticado
  ✓ não retorna tutores de outro tenant
  ✓ filtra por search corretamente
  ✓ pagina corretamente (page, pageSize)
  ✓ 401 sem autenticação

POST /api/v1/tutors
  ✓ cria tutor com body válido → 201
  ✓ CPF duplicado → 409
  ✓ body inválido (sem nome) → 422
  ✓ tenant isolation → só cria no tenant da sessão

POST /api/v1/consultations/:id/status (COMPLETED)
  ✓ com anamnese + diagnóstico → 200
  ✓ sem anamnese → 422
  ✓ consulta de outro tenant → 403
  ✓ transição inválida (CANCELLED → COMPLETED) → 422

POST /api/v1/attachments/upload-url
  ✓ retorna presigned URL válida
  ✓ arquivo muito grande → 422
  ✓ MIME type não permitido → 422
```

---

## Testes E2E — Playwright

### Fluxos Críticos (obrigatórios)

```
F01: Login com Google
  → Navegar para /
  → Clicar "Entrar com Google"
  → [mock OAuth em teste]
  → Verificar Dashboard visível

F02: Cadastrar Tutor + Animal
  → /tutors → "+ Novo Tutor"
  → Preencher formulário
  → Salvar
  → Verificar toast "Tutor cadastrado"
  → "+ Adicionar Animal"
  → Preencher formulário
  → Salvar
  → Verificar animal na timeline

F03: Agendar e Concluir Consulta
  → /consultations → "+ Nova Consulta"
  → Selecionar animal
  → Selecionar data/hora
  → Salvar → Verificar evento Calendar (mock)
  → Abrir consulta → "Concluir"
  → Preencher anamnese + diagnóstico
  → Confirmar → Status COMPLETED

F04: Gerar Receita PDF
  → Consulta COMPLETED
  → "+ Receita"
  → Preencher items
  → Salvar
  → Aguardar "PDF gerado"
  → Clicar Download
  → Verificar PDF aberto

F05: Timeline do Animal
  → /animals/:id
  → Verificar consultas, vacinas, receitas na timeline
  → Filtrar por tipo "Vacinas"
  → Verificar apenas vacinas visíveis
```

### Configuração Playwright
```typescript
// playwright.config.ts
{
  testDir: './tests/e2e',
  baseURL: 'http://localhost:3000',
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'mobile', use: devices['iPhone 14'] }  // mobile-first
  ]
}
```

---

## CI Pipeline — Gates

```yaml
# .github/workflows/ci.yml
jobs:
  quality:
    steps:
      - npx tsc --noEmit          # TypeScript check
      - npm run lint               # ESLint
      - npm test -- --coverage    # Jest (falha se < 80% use-cases)
      - npm run test:integration  # Supertest
      - npm run test:e2e          # Playwright (headless)
      - npm audit --audit-level=critical
```

**Política:** PR bloqueado se qualquer gate falhar.

---

## Test Doubles

| Tipo | Uso |
|------|-----|
| `InMemoryTutorRepository` | Unit tests de use-cases |
| `MockGoogleCalendarAdapter` | Unit + integration tests |
| `MockR2StorageAdapter` | Unit tests de upload |
| `MockPdfGenerator` | Unit tests de prescription |
| `FakeEventBus` | Captura domain events em testes |

---

## Critérios de Aceitação por Feature

### F02 — Tutores
```gherkin
Scenario: Cadastrar tutor com dados válidos
  Given estou autenticado como veterinária
  When envio POST /api/v1/tutors com nome="João" e phone="11999999999"
  Then recebo status 201
  And o tutor aparece em GET /api/v1/tutors

Scenario: CPF duplicado no mesmo tenant
  Given já existe tutor com CPF "123.456.789-09"
  When cadastro outro tutor com mesmo CPF
  Then recebo status 409
  And error.code = "CONFLICT"
```

### F04 — Consultas
```gherkin
Scenario: Concluir consulta sem diagnóstico
  Given existe consulta com status SCHEDULED
  When envio PATCH /status com status=COMPLETED sem diagnosis
  Then recebo status 422
  And error.code = "VALIDATION_ERROR"

Scenario: Concluir consulta com dados completos
  Given existe consulta SCHEDULED
  When envio PATCH /status com status=COMPLETED, anamnesis e diagnosis
  Then recebo status 200
  And consultation.status = "COMPLETED"
  And Google Calendar event atualizado (mock verifica chamada)
```
