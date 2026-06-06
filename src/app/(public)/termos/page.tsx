import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Termos de Uso — VetCare',
  description: 'Termos e condições de uso do sistema VetCare.',
}

const LAST_UPDATED = '04 de junho de 2026'
const CONTACT_EMAIL = 'contato@rastaful.dev'
const APP_URL = 'https://vetcare.rastaful.dev'

export default function TermosPage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Termos de Uso</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: {LAST_UPDATED}</p>

      <Section title="1. Aceitação dos termos">
        <p>
          Ao acessar e utilizar o <strong>VetCare</strong> ({APP_URL}), você concorda com estes
          Termos de Uso. Se não concordar com alguma condição, não utilize o sistema.
        </p>
      </Section>

      <Section title="2. Descrição do serviço">
        <p>
          O VetCare é um sistema web de gestão clínica veterinária que permite o cadastro de
          tutores, animais, histórico clínico, agendamento de consultas, controle de vacinação,
          geração de receituários e integração com Google Calendar.
        </p>
        <p>O acesso ao sistema é realizado exclusivamente por meio de autenticação via conta Google.</p>
      </Section>

      <Section title="3. Elegibilidade">
        <p>O sistema destina-se exclusivamente a:</p>
        <ul>
          <li>Médicos veterinários habilitados pelo CFMV</li>
          <li>Auxiliares e assistentes autorizados pelo veterinário responsável</li>
        </ul>
        <p>
          O usuário declara que possui capacidade legal para celebrar este acordo e que utilizará o
          sistema de forma profissional e ética.
        </p>
      </Section>

      <Section title="4. Uso permitido">
        <p>Você pode usar o VetCare para:</p>
        <ul>
          <li>Registrar e gerenciar informações clínicas de animais sob seus cuidados</li>
          <li>Agendar e controlar consultas veterinárias</li>
          <li>Emitir receituários veterinários</li>
          <li>Sincronizar sua agenda com o Google Calendar</li>
          <li>Armazenar documentos clínicos relacionados aos atendimentos</li>
        </ul>
      </Section>

      <Section title="5. Uso proibido">
        <p>É expressamente proibido:</p>
        <ul>
          <li>Utilizar o sistema para fins não veterinários ou não clínicos</li>
          <li>Cadastrar dados falsos, fictícios ou de terceiros sem autorização</li>
          <li>Tentar acessar dados de outros usuários ou tenants</li>
          <li>Realizar engenharia reversa, scraping ou extração automatizada de dados</li>
          <li>Compartilhar credenciais de acesso com pessoas não autorizadas</li>
          <li>Utilizar o sistema para atividades ilegais ou antiéticas</li>
          <li>Sobrecarregar intencionalmente a infraestrutura do sistema</li>
        </ul>
      </Section>

      <Section title="6. Responsabilidade pelos dados clínicos">
        <p>
          <strong>Você é inteiramente responsável</strong> pela veracidade, precisão e adequação dos
          dados clínicos inseridos no sistema. O VetCare é uma ferramenta de apoio à gestão — as
          decisões clínicas e veterinárias são de exclusiva responsabilidade do profissional habilitado.
        </p>
        <p>
          O uso do sistema não substitui o julgamento clínico profissional nem exime o veterinário
          de suas obrigações éticas e legais perante o CFMV e a legislação vigente.
        </p>
      </Section>

      <Section title="7. Integração com Google Calendar">
        <p>
          A funcionalidade de sincronização com o Google Calendar é opcional. Ao ativá-la, você
          autoriza o VetCare a criar, editar e excluir eventos em seu calendário, restritos aos
          agendamentos criados pelo próprio sistema.
        </p>
        <p>
          Você pode revogar essa autorização a qualquer momento nas{' '}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            configurações de segurança do Google
          </a>
          .
        </p>
      </Section>

      <Section title="8. Disponibilidade do serviço">
        <p>
          O VetCare é fornecido no estado em que se encontra (&ldquo;as is&rdquo;). Não
          garantimos disponibilidade ininterrupta do sistema. Manutenções programadas serão
          comunicadas com antecedência quando possível.
        </p>
        <p>
          Realizamos backups diários dos dados. Em caso de falha grave, o objetivo de ponto de
          recuperação (RPO) é de 24 horas e o objetivo de tempo de recuperação (RTO) é de 4 horas.
        </p>
      </Section>

      <Section title="9. Propriedade intelectual">
        <p>
          O código-fonte, design, logotipos e demais elementos do VetCare são propriedade do
          operador. Os dados inseridos pelos usuários (registros clínicos, tutores, animais)
          pertencem ao próprio usuário e podem ser exportados ou excluídos mediante solicitação.
        </p>
      </Section>

      <Section title="10. Limitação de responsabilidade">
        <p>
          O VetCare não se responsabiliza por danos decorrentes de:
        </p>
        <ul>
          <li>Uso inadequado do sistema pelo usuário</li>
          <li>Falhas de conectividade ou indisponibilidade de serviços de terceiros (Google, etc.)</li>
          <li>Decisões clínicas tomadas com base nas informações registradas no sistema</li>
          <li>Perda de dados por falha do usuário em manter as credenciais seguras</li>
        </ul>
      </Section>

      <Section title="11. Encerramento do acesso">
        <p>
          O acesso ao sistema pode ser encerrado a qualquer momento pelo usuário ou pelo operador.
          Após o encerramento, os dados são mantidos pelo prazo mínimo exigido por lei e podem ser
          exportados mediante solicitação em até 30 dias após o encerramento.
        </p>
      </Section>

      <Section title="12. Alterações nos termos">
        <p>
          Estes termos podem ser atualizados periodicamente. Alterações materiais serão comunicadas
          com pelo menos 15 dias de antecedência. O uso continuado do sistema após a notificação
          implica aceitação dos novos termos.
        </p>
      </Section>

      <Section title="13. Lei aplicável e foro">
        <p>
          Estes termos são regidos pela legislação brasileira. Fica eleito o foro da comarca de
          São Paulo/SP para dirimir quaisquer controvérsias, com renúncia a qualquer outro, por
          mais privilegiado que seja.
        </p>
      </Section>

      <Section title="14. Contato">
        <p>
          Dúvidas sobre estes termos:{' '}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">
            {CONTACT_EMAIL}
          </a>
        </p>
      </Section>

      <div className="mt-10 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Política de Privacidade:</strong> Veja também nossa{' '}
          <a href="/privacidade" className="underline font-semibold">
            Política de Privacidade
          </a>{' '}
          para entender como seus dados são tratados.
        </p>
      </div>
    </article>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-200">
        {title}
      </h2>
      <div className="text-gray-700 leading-relaxed space-y-3">{children}</div>
    </section>
  )
}
