# User Journey + UX Flows — VetCare

## Princípios UX

1. **Velocidade de uso durante atendimento** — máximo 3 cliques para ação frequente
2. **Mobile-first** — veterinária usa celular durante visita domiciliar
3. **Formulários inteligentes** — defaults sensatos, autocomplete, validação inline
4. **Feedback imediato** — toast de confirmação, loading states, erro contextual
5. **Histórico sempre visível** — timeline do animal em destaque

---

## Jornada 1: Primeiro Acesso (Onboarding)

```
[Tela inicial] → [Login Google] → [Redirect OAuth] → [Callback]
    → [Tenant criado automaticamente] → [Perfil básico (nome, CRMV)]
    → [Dashboard vazio com CTA "Cadastrar primeiro tutor"]
```

**UX Notes:**
- Onboarding em 1 tela, máximo 3 campos obrigatórios
- Google OAuth pré-autoriza Google Calendar na mesma etapa
- Skip disponível para Calendar (pode conectar depois)

---

## Jornada 2: Cadastro de Tutor + Animal (Novo Cliente)

```
[Dashboard] → [+ Novo Tutor]
    → [Form: Nome*, Telefone*, WhatsApp, Email, Endereço]
    → [Salvar] → [Toast: "Tutor cadastrado"]
    → [Tela do Tutor] → [+ Adicionar Animal]
    → [Form: Nome*, Espécie*, Raça, Sexo, Nascimento, Peso, Foto]
    → [Salvar] → [Toast: "Animal cadastrado"]
    → [Perfil do Animal] — pronto para uso
```

**UX Notes:**
- Campos opcionais claramente marcados
- Upload de foto inline com preview
- Salvar e adicionar animal diretamente do formulário do tutor

---

## Jornada 3: Agendamento de Consulta

```
[Dashboard OU Animal] → [+ Agendar Consulta]
    → [Busca Animal (se não contextualizado)]
    → [Form: Data*, Hora*, Endereço Atendimento, Observações]
    → [Confirmar] → [Toast: "Consulta agendada + evento Google Calendar criado"]
    → [Redirecionado para detalhe da consulta]
```

**UX Notes:**
- Endereço atendimento sugere endereço cadastrado do tutor (autopreenchido)
- Confirmar evento Google Calendar visible na tela (check icon)
- Se Calendar offline: salva localmente, retry automático

---

## Jornada 4: Realizar Atendimento (Fluxo Principal)

```
[Dashboard → Consultas do dia] → [Consulta de Pedro/Rex]
    → [Detalhe da Consulta]
    → [Botão "Iniciar Atendimento"] → status=CONFIRMED
    → [Durante visita: preenche Anamnese, Diagnóstico, Obs]
    → [+ Adicionar Receita] → [Form Receita]
    → [+ Upload Exame] → [Seletor de arquivo]
    → [Concluir Atendimento] → status=COMPLETED
    → [Modal: "Agendar retorno?" Sim/Não]
    → [Toast: "Atendimento concluído"]
```

**UX Notes:**
- Formulário de atendimento com save automático (draft)
- Atalho rápido para receituário durante atendimento
- Modal de retorno pré-preenche "em 30 dias" (editável)

---

## Jornada 5: Vacinação

```
[Animal] → [Tab: Preventivo] → [+ Vacina]
    → [Form: Vacina*, Data*, Próxima dose, Lote, Fabricante, Obs]
    → [Toggle: "Criar lembrete no Google Calendar"] (default: on)
    → [Salvar] → [Toast: "Vacinação registrada + lembrete criado"]
```

**UX Notes:**
- Lista de vacinas comuns como autocomplete (V8, V10, Antirrábica, etc.)
- Data de próxima dose calculada automaticamente para vacinas conhecidas

---

## Jornada 6: Gerar Receita PDF

```
[Consulta] OU [Animal → Timeline] → [Receita]
    → [Visualizar PDF] → [Browser PDF viewer]
    → [Download] → [arquivo_receita_rex_2026-06-04.pdf]
```

**UX Notes:**
- PDF gerado em background após criação
- Loading spinner até PDF pronto
- Botão compartilhar (Web Share API mobile)

---

## Jornada 7: Buscar Histórico de Animal

```
[Busca global (⌘K)] → ["Rex"] → [Animal Rex]
    → [Timeline] → [scroll por todos os eventos]
    → [Filtro: Consultas | Vacinas | Receitas | Arquivos]
    → [Clica em consulta] → [Detalhe completo]
```

**UX Notes:**
- Busca global em header, abre com atalho de teclado
- Timeline infinita (scroll), não paginação
- Cada entry da timeline tem ícone de tipo + data + resumo

---

## Navegação Principal

```
Sidebar (Desktop) / Bottom Nav (Mobile):
├── 🏠 Dashboard
├── 👥 Tutores
├── 🐾 Animais
├── 📅 Consultas
└── ⚙️ Configurações
    ├── Meu Perfil
    ├── Google Calendar
    └── Assinatura

Header:
├── [Logo VetCare]
├── [🔍 Busca Global]
└── [Avatar → Menu]
```

---

## Telas do Sistema

### Dashboard
```
┌────────────────────────────────────────┐
│ Bom dia, Dra. Ana 👋                   │
├────────────┬─────────────┬────────────┤
│ Hoje       │ Retornos    │ Vacinas    │
│ 5 consultas│ 3 pendentes │ 7 em 30d   │
├────────────┴─────────────┴────────────┤
│ Consultas de Hoje                      │
│ ┌──────────────────────────────────┐  │
│ │ 09:00 Rex (Golden) - Rua X      │  │
│ │ 11:00 Mimi (Siamês) - Rua Y     │  │
│ │ 14:00 Bob (Labrador) - Rua Z    │  │
│ └──────────────────────────────────┘  │
│                                        │
│ Vacinas Próximas (30 dias)            │
│ Rex — V10 em 12/06                    │
│ Mimi — Antirrábica em 20/06           │
└────────────────────────────────────────┘
```

### Perfil do Animal
```
┌────────────────────────────────────────┐
│ [Foto] Rex                             │
│ Golden Retriever • M • 4 anos • 28kg  │
│ Tutor: João Silva — (11) 99999-9999   │
├────────────────────────────────────────┤
│ [Consultas] [Preventivo] [Arquivos]   │
├────────────────────────────────────────┤
│ Timeline                               │
│ ● JUN 04 — Consulta — Diagnóstico X  │
│ ● MAI 20 — V10 — Próxima: JUN 20     │
│ ● MAI 15 — Exame PDF (laudo.pdf)     │
│ ● ABR 10 — Receita — Amoxicilina     │
└────────────────────────────────────────┘
```

---

## Design Tokens Base (a detalhar em interface-design/system.md)

| Token | Valor |
|-------|-------|
| Primary | #2563EB (blue-600) |
| Success | #16A34A (green-600) |
| Warning | #D97706 (amber-600) |
| Danger | #DC2626 (red-600) |
| Surface | #F8FAFC |
| Text Primary | #0F172A |
| Text Muted | #64748B |
| Radius | 8px |
| Font | Inter |

## Componentes Chave

| Componente | Uso |
|-----------|-----|
| `AnimalCard` | Grid de animais |
| `TutorCard` | Lista de tutores |
| `ConsultationCard` | Consultas do dia |
| `TimelineEntry` | Entry de timeline |
| `PrescriptionForm` | Formulário de receita |
| `FileUploader` | Upload com preview |
| `StatusBadge` | Status de consulta |
| `GlobalSearch` | Busca global (⌘K) |
| `CalendarSync` | Indicador de sync |
