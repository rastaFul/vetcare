import { MessageFormatter, MessageVars } from '../MessageFormatter'

describe('MessageFormatter', () => {
  const vars: MessageVars = {
    tutorName: 'João Silva',
    animalName: 'Rex',
    date: '10/06/2026',
    time: '14:00',
    address: 'Rua das Flores, 100',
    vaccine: 'V8',
    vetName: 'Dra. Ana Lima',
  }

  describe('consultationWhatsApp()', () => {
    it('substitutes all variables', () => {
      const msg = MessageFormatter.consultationWhatsApp(vars)
      expect(msg).toContain('João Silva')
      expect(msg).toContain('Rex')
      expect(msg).toContain('10/06/2026')
      expect(msg).toContain('14:00')
      expect(msg).toContain('Dra. Ana Lima')
    })

    it('uses bold markdown for important fields', () => {
      const msg = MessageFormatter.consultationWhatsApp(vars)
      expect(msg).toContain('*João Silva*')
      expect(msg).toContain('*Rex*')
    })

    it('contains consultation emoji and header', () => {
      const msg = MessageFormatter.consultationWhatsApp(vars)
      expect(msg).toContain('🐾')
      expect(msg).toContain('Lembrete de Consulta')
    })
  })

  describe('vaccinationWhatsApp()', () => {
    it('substitutes vaccine name', () => {
      const msg = MessageFormatter.vaccinationWhatsApp(vars)
      expect(msg).toContain('V8')
      expect(msg).toContain('Rex')
      expect(msg).toContain('João Silva')
      expect(msg).toContain('10/06/2026')
    })

    it('contains vaccination keyword', () => {
      const msg = MessageFormatter.vaccinationWhatsApp(vars)
      expect(msg).toContain('Vacinação')
    })
  })

  describe('returnWhatsApp()', () => {
    it('substitutes variables for return reminder', () => {
      const msg = MessageFormatter.returnWhatsApp(vars)
      expect(msg).toContain('João Silva')
      expect(msg).toContain('Rex')
      expect(msg).toContain('10/06/2026')
    })

    it('contains return keyword', () => {
      const msg = MessageFormatter.returnWhatsApp(vars)
      expect(msg).toContain('Retorno')
    })
  })

  describe('email subjects', () => {
    it('consultationEmailSubject includes animal name', () => {
      expect(MessageFormatter.consultationEmailSubject('Rex')).toContain('Rex')
    })

    it('vaccinationEmailSubject includes vaccine and animal', () => {
      const subject = MessageFormatter.vaccinationEmailSubject('Rex', 'V8')
      expect(subject).toContain('Rex')
      expect(subject).toContain('V8')
    })

    it('returnEmailSubject includes animal name', () => {
      expect(MessageFormatter.returnEmailSubject('Rex')).toContain('Rex')
    })
  })

  describe('emailHtml()', () => {
    it('generates valid HTML for consultation type', () => {
      const html = MessageFormatter.emailHtml({ ...vars, type: 'consultation' })
      expect(html).toContain('<!DOCTYPE html>')
      expect(html).toContain('João Silva')
      expect(html).toContain('Rex')
      expect(html).toContain('10/06/2026')
    })

    it('generates valid HTML for vaccination type', () => {
      const html = MessageFormatter.emailHtml({ ...vars, type: 'vaccination' })
      expect(html).toContain('V8')
      expect(html).toContain('Rex')
    })

    it('generates valid HTML for return type', () => {
      const html = MessageFormatter.emailHtml({ ...vars, type: 'return' })
      expect(html).toContain('Rex')
      expect(html).toContain('10/06/2026')
    })

    it('includes vet name in footer', () => {
      const html = MessageFormatter.emailHtml({ ...vars, type: 'consultation' })
      expect(html).toContain('Dra. Ana Lima')
    })
  })
})
