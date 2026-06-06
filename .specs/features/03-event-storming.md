# Event Storming — VetCare

## Notação
- **[EVENT]** — Domain Event (algo que aconteceu, passado)
- **(COMMAND)** — Comando que dispara evento
- **[POLICY]** — Reação automática a evento
- **{AGGREGATE}** — Responsável pelo evento

---

## Fluxo 1: Cadastro de Tutor e Animal

```
(RegisterTutor)
    → {Tutor}
    → [TutorRegistered]

[TutorRegistered]
    → [POLICY] CreateDefaultAddress (se endereço informado)

(RegisterAnimal)
    → [validate: tutor exists]
    → {Animal}
    → [AnimalRegistered]

[AnimalRegistered]
    → [POLICY] NotifyDashboard (incrementa contagem)
```

---

## Fluxo 2: Agendamento de Consulta

```
(ScheduleConsultation)
    → [validate: animal exists, vet available, date future]
    → {Consultation} status=SCHEDULED
    → [ConsultationScheduled]

[ConsultationScheduled]
    → [POLICY] SyncGoogleCalendar
        → (CreateGoogleEvent)
        → [GoogleEventCreated]
        → {Consultation}.googleCalendarEventId = eventId

[ConsultationScheduled]
    → [POLICY] UpdateDashboard (consultas do dia)
```

---

## Fluxo 3: Confirmação de Consulta

```
(ConfirmConsultation)
    → [validate: status == SCHEDULED]
    → {Consultation} status=CONFIRMED
    → [ConsultationConfirmed]

[ConsultationConfirmed]
    → [POLICY] SyncGoogleCalendar (update event)
```

---

## Fluxo 4: Conclusão de Consulta (Atendimento)

```
(CompleteConsultation)
    → [validate: status == CONFIRMED | SCHEDULED]
    → [validate: anamnesis != null, diagnosis != null]
    → {Consultation} status=COMPLETED
    → [ConsultationCompleted]

[ConsultationCompleted]
    → [POLICY] SyncGoogleCalendar (mark event as done / no-op)
    → [POLICY] UpdateTimeline (adiciona entry na timeline do animal)
    → [POLICY] CheckReturnDate (se returnDate set → ReturnScheduled)

(ScheduleReturn) [opcional, durante conclusão]
    → {Consultation}.returnDate = date
    → [ReturnScheduled]

[ReturnScheduled]
    → [POLICY] CreateGoogleCalendarReminder (se solicitado)
```

---

## Fluxo 5: Cancelamento de Consulta

```
(CancelConsultation)
    → [validate: status != COMPLETED]
    → {Consultation} status=CANCELLED
    → [ConsultationCancelled]

[ConsultationCancelled]
    → [POLICY] SyncGoogleCalendar
        → (DeleteGoogleEvent)
        → [GoogleEventDeleted]
```

---

## Fluxo 6: Vacinação

```
(ApplyVaccination)
    → [validate: animal exists]
    → {VaccinationRecord}
    → [VaccinationApplied]

[VaccinationApplied]
    → [POLICY] UpdateTimeline
    → [POLICY] CheckNextDose
        → se nextDoseAt definido:
            → (ScheduleVaccinationReminder)
            → [VaccinationReminderScheduled]

[VaccinationReminderScheduled]
    → [POLICY] CreateGoogleCalendarReminder (se solicitado)
    → {VaccinationRecord}.googleCalendarEventId = eventId
```

---

## Fluxo 7: Receituário

```
(CreatePrescription)
    → [validate: consultation exists, items >= 1]
    → {Prescription}
    → [PrescriptionCreated]

[PrescriptionCreated]
    → [POLICY] GeneratePdf (async)
        → (GeneratePrescriptionPdf)
        → [PrescriptionPdfGenerated]
        → {Prescription}.pdfUrl = url
        → {Prescription}.pdfGeneratedAt = now

[PrescriptionCreated]
    → [POLICY] UpdateTimeline
```

---

## Fluxo 8: Upload de Arquivo

```
(RequestUpload)
    → [validate: file type, file size <= 10MB]
    → (GetPresignedUploadUrl)
    → [PresignedUrlGenerated]
    → [CLIENT UPLOADS DIRECTLY TO R2]

(ConfirmUpload)
    → [validate: file exists in R2]
    → {Attachment}
    → [AttachmentUploaded]

[AttachmentUploaded]
    → [POLICY] UpdateTimeline
```

---

## Fluxo 9: Dashboard

```
(LoadDashboard)
    → [DashboardService queries]
    → [ConsultationsToday]
    → [PendingReturns (próximos 7 dias)]
    → [UpcomingVaccinations (próximos 30 dias)]
    → [TotalAnimals]
    → [TotalTutors]
```

---

## Hotspots Identificados (Pontos de Atenção)

| # | Hotspot | Risco |
|---|---------|-------|
| H1 | Token Google OAuth expira | Implementar refresh automático |
| H2 | Google Calendar API offline | Fila local + retry |
| H3 | Geração de PDF lenta (> 5s) | Job assíncrono; UI mostra "gerando..." |
| H4 | Upload grande (> 10MB) | Limite explícito + feedback de erro |
| H5 | Tutor com múltiplos WhatsApps | Decidido: 1 WhatsApp por tutor no MVP |
| H6 | CPF duplicado entre tutores | Validação unique por tenant |
| H7 | Fuso horário da agenda | Configurável por tenant (default: America/Sao_Paulo) |
