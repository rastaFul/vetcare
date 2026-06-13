export interface MessageVars {
  tutorName: string
  animalName: string
  date: string
  time?: string
  address?: string
  vaccine?: string
  vetName: string
}

export interface SessionMessageVars {
  clientName: string
  serviceName: string
  date: string
  time?: string
  address?: string
  therapistName: string
  tenantName: string
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fmt(template: string, vars: Record<string, any>): string {
  return Object.entries(vars).reduce(
    (msg: string, [key, val]) => msg.replaceAll(`{{${key}}}`, val ?? ''),
    template
  )
}

export const MessageFormatter = {
  consultationWhatsApp(vars: MessageVars): string {
    return fmt(
      `🐾 *VetCare* — Lembrete de Consulta\n\nOlá *{{tutorName}}*!\n\nSua consulta com *{{animalName}}* está agendada para:\n📅 *{{date}}* às *{{time}}*\n{{address}}\n\nEm caso de dúvidas, entre em contato.\n\n_{{vetName}}_`,
      vars
    )
  },

  vaccinationWhatsApp(vars: MessageVars): string {
    return fmt(
      `🐾 *VetCare* — Lembrete de Vacinação\n\nOlá *{{tutorName}}*!\n\nA vacina *{{vaccine}}* de *{{animalName}}* vence em:\n📅 *{{date}}*\n\nAgende sua consulta para manter a proteção em dia! 💉\n\n_{{vetName}}_`,
      vars
    )
  },

  returnWhatsApp(vars: MessageVars): string {
    return fmt(
      `🐾 *VetCare* — Lembrete de Retorno\n\nOlá *{{tutorName}}*!\n\nO retorno de *{{animalName}}* está previsto para:\n📅 *{{date}}*\n\nEntre em contato para confirmar o agendamento.\n\n_{{vetName}}_`,
      vars
    )
  },

  consultationEmailSubject(animalName: string): string {
    return `🐾 Lembrete de Consulta — ${animalName}`
  },

  vaccinationEmailSubject(animalName: string, vaccine: string): string {
    return `🐾 Vacina ${vaccine} — ${animalName}`
  },

  returnEmailSubject(animalName: string): string {
    return `🐾 Lembrete de Retorno — ${animalName}`
  },

  sessionWhatsApp(vars: SessionMessageVars): string {
    return fmt(
      `🌿 *{{tenantName}}* — Lembrete de Sessão\n\nOlá *{{clientName}}*!\n\nSua {{serviceName}} está agendada para:\n📅 *{{date}}* às *{{time}}*\n{{address}}\n\nEm caso de dúvidas, entre em contato.\n\n_{{therapistName}}_`,
      vars as unknown as Record<string, string | undefined>
    )
  },

  sessionReturnWhatsApp(vars: SessionMessageVars): string {
    return fmt(
      `🌿 *{{tenantName}}* — Lembrete de Retorno\n\nOlá *{{clientName}}*!\n\nSeu retorno de {{serviceName}} está previsto para:\n📅 *{{date}}*\n\nEntre em contato para confirmar o agendamento.\n\n_{{therapistName}}_`,
      vars as unknown as Record<string, string | undefined>
    )
  },

  sessionEmailSubject(clientName: string, serviceName: string): string {
    return `🌿 Lembrete de Sessão — ${clientName} (${serviceName})`
  },

  sessionEmailHtml(vars: SessionMessageVars & { type: 'session' | 'session_return' }): string {
    const body = vars.type === 'session'
      ? `<p>Sua <strong>${vars.serviceName}</strong> está agendada para:</p>
         <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0">
           <p style="margin:4px 0">📅 <strong>${vars.date}</strong>${vars.time ? ` às ${vars.time}` : ''}</p>
           ${vars.address ? `<p style="margin:4px 0">📍 ${vars.address}</p>` : ''}
         </div>`
      : `<p>Seu retorno de <strong>${vars.serviceName}</strong> está previsto para:</p>
         <div style="background:#fefce8;border-radius:8px;padding:16px;margin:16px 0">
           <p style="margin:4px 0">📅 <strong>${vars.date}</strong></p>
         </div>
         <p>Entre em contato para confirmar o agendamento.</p>`

    return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="border-bottom:3px solid #16a34a;padding-bottom:16px;margin-bottom:24px">
        <h1 style="color:#16a34a;margin:0;font-size:20px">🌿 ${vars.tenantName}</h1>
      </div>
      <p>Olá <strong>${vars.clientName}</strong>,</p>
      ${body}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
      <p style="font-size:12px;color:#64748b">${vars.therapistName}</p>
    </body></html>`
  },

  emailHtml(vars: MessageVars & { type: 'consultation' | 'vaccination' | 'return' }): string {
    const body = vars.type === 'consultation'
      ? `<p>A consulta de <strong>${vars.animalName}</strong> está agendada para:</p>
         <div style="background:#f0f9ff;border-radius:8px;padding:16px;margin:16px 0">
           <p style="margin:4px 0">📅 <strong>${vars.date}</strong>${vars.time ? ` às ${vars.time}` : ''}</p>
           ${vars.address ? `<p style="margin:4px 0">📍 ${vars.address}</p>` : ''}
         </div>`
      : vars.type === 'vaccination'
      ? `<p>A vacina <strong>${vars.vaccine}</strong> de <strong>${vars.animalName}</strong> vence em:</p>
         <div style="background:#f0fdf4;border-radius:8px;padding:16px;margin:16px 0">
           <p style="margin:4px 0">📅 <strong>${vars.date}</strong></p>
         </div>
         <p>Agende sua consulta para manter a proteção em dia!</p>`
      : `<p>O retorno de <strong>${vars.animalName}</strong> está previsto para:</p>
         <div style="background:#fefce8;border-radius:8px;padding:16px;margin:16px 0">
           <p style="margin:4px 0">📅 <strong>${vars.date}</strong></p>
         </div>
         <p>Entre em contato para confirmar o agendamento.</p>`

    return `<!DOCTYPE html><html><body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
      <div style="border-bottom:3px solid #2563EB;padding-bottom:16px;margin-bottom:24px">
        <h1 style="color:#2563EB;margin:0;font-size:20px">🐾 VetCare</h1>
        <p style="color:#64748b;margin:4px 0;font-size:13px">Sistema de Gestão Veterinária</p>
      </div>
      <p>Olá <strong>${vars.tutorName}</strong>,</p>
      ${body}
      <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">
      <p style="font-size:12px;color:#64748b">${vars.vetName}</p>
    </body></html>`
  },
}
