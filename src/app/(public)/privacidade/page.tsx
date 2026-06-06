import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidade — VetCare',
  description: 'Como o VetCare coleta, usa e protege seus dados pessoais.',
}

const LAST_UPDATED = '04 de junho de 2026'
const CONTACT_EMAIL = 'contato@rastaful.dev'
const APP_URL = 'https://vetcare.rastaful.dev'

export default function PrivacidadePage() {
  return (
    <article className="prose prose-gray max-w-none">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidade</h1>
      <p className="text-sm text-gray-500 mb-8">Última atualização: {LAST_UPDATED}</p>

      <Section title="1. Quem somos">
        <p>
          O <strong>VetCare</strong> é um sistema de gestão clínica veterinária, acessível em{' '}
          <a href={APP_URL} className="text-blue-600 underline">{APP_URL}</a>.
          O sistema é operado por médica veterinária autônoma, pessoa física, inscrita como MEI.
        </p>
        <p>
          Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos
          suas informações pessoais, em conformidade com a{' '}
          <strong>Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018)</strong>.
        </p>
      </Section>

      <Section title="2. Dados coletados">
        <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.1 Dados de acesso (veterinária)</h3>
        <ul>
          <li>Nome completo e endereço de e-mail (via conta Google)</li>
          <li>Foto de perfil (via conta Google, opcional)</li>
          <li>Token de acesso ao Google Calendar (para sincronização de agenda)</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.2 Dados de tutores cadastrados</h3>
        <ul>
          <li>Nome completo</li>
          <li>CPF (opcional)</li>
          <li>Telefone e WhatsApp</li>
          <li>Endereço de e-mail (opcional)</li>
          <li>Endereço residencial (opcional)</li>
          <li>Observações clínicas relevantes</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.3 Dados dos animais</h3>
        <ul>
          <li>Nome, espécie, raça, sexo, data de nascimento, peso, cor</li>
          <li>Número de microchip (opcional)</li>
          <li>Foto do animal (opcional)</li>
          <li>Histórico clínico: consultas, diagnósticos, anamneses</li>
          <li>Registros de vacinação, vermifugação e antiparasitários</li>
          <li>Receituários e prescrições médico-veterinárias</li>
          <li>Arquivos anexados (exames, laudos, imagens)</li>
        </ul>

        <h3 className="font-semibold text-gray-800 mt-4 mb-2">2.4 Dados de uso</h3>
        <ul>
          <li>Logs de atividade (ações realizadas no sistema) para fins de auditoria</li>
          <li>Endereço IP e informações básicas do navegador</li>
        </ul>
      </Section>

      <Section title="3. Como usamos os dados">
        <p>Utilizamos os dados coletados exclusivamente para:</p>
        <ul>
          <li>Prestação do serviço de gestão clínica veterinária</li>
          <li>Autenticação e controle de acesso seguro</li>
          <li>Sincronização de consultas com o Google Calendar</li>
          <li>Geração de receituários veterinários em PDF</li>
          <li>Envio de lembretes de vacinação e retornos</li>
          <li>Cumprimento de obrigações legais</li>
        </ul>
        <p>
          <strong>Não comercializamos, alugamos ou compartilhamos seus dados com terceiros</strong>{' '}
          para fins comerciais ou de marketing.
        </p>
      </Section>

      <Section title="4. Base legal (LGPD)">
        <p>O tratamento dos dados se baseia nas seguintes hipóteses legais previstas na LGPD:</p>
        <ul>
          <li>
            <strong>Execução de contrato</strong> — para prestação do serviço de gestão clínica
            (Art. 7º, V)
          </li>
          <li>
            <strong>Legítimo interesse</strong> — para segurança, auditoria e melhoria do sistema
            (Art. 7º, IX)
          </li>
          <li>
            <strong>Cumprimento de obrigação legal</strong> — para registros de atendimento
            veterinário exigidos pelo CFMV (Art. 7º, II)
          </li>
          <li>
            <strong>Consentimento</strong> — para funcionalidades opcionais como sincronização com
            Google Calendar (Art. 7º, I)
          </li>
        </ul>
      </Section>

      <Section title="5. Compartilhamento com terceiros">
        <p>Os dados podem ser compartilhados apenas com os seguintes serviços, estritamente necessários para o funcionamento do sistema:</p>
        <table className="w-full text-sm border-collapse border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-3 py-2 text-left">Serviço</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Finalidade</th>
              <th className="border border-gray-300 px-3 py-2 text-left">Política</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Google OAuth</td>
              <td className="border border-gray-300 px-3 py-2">Autenticação</td>
              <td className="border border-gray-300 px-3 py-2">
                <a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Privacy</a>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Google Calendar</td>
              <td className="border border-gray-300 px-3 py-2">Sincronização de agenda (opcional)</td>
              <td className="border border-gray-300 px-3 py-2">
                <a href="https://policies.google.com/privacy" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Google Privacy</a>
              </td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-3 py-2">Cloudflare</td>
              <td className="border border-gray-300 px-3 py-2">CDN e infraestrutura de rede</td>
              <td className="border border-gray-300 px-3 py-2">
                <a href="https://www.cloudflare.com/privacypolicy/" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Cloudflare Privacy</a>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="6. Armazenamento e segurança">
        <ul>
          <li>
            <strong>Banco de dados</strong>: PostgreSQL hospedado em servidor privado, com acesso
            restrito e backups diários criptografados
          </li>
          <li>
            <strong>Arquivos</strong>: PDFs e imagens armazenados com acesso autenticado via URLs
            temporárias (presigned URLs)
          </li>
          <li>
            <strong>Tokens OAuth</strong>: criptografados em repouso com AES-256-GCM
          </li>
          <li>
            <strong>Comunicação</strong>: toda transmissão via HTTPS/TLS 1.2+
          </li>
          <li>
            <strong>Sessões</strong>: cookies httpOnly, SameSite=Strict, Secure
          </li>
        </ul>
      </Section>

      <Section title="7. Retenção de dados">
        <ul>
          <li>Dados clínicos: mantidos pelo prazo mínimo exigido pelo CFMV (5 anos após último atendimento)</li>
          <li>Logs de auditoria: 2 anos</li>
          <li>Dados de sessão: 30 dias</li>
          <li>Backups: 30 dias</li>
        </ul>
      </Section>

      <Section title="8. Seus direitos (LGPD Art. 18)">
        <p>Você tem direito a:</p>
        <ul>
          <li><strong>Acesso</strong> — obter confirmação e acesso aos seus dados</li>
          <li><strong>Correção</strong> — solicitar correção de dados incompletos ou inexatos</li>
          <li><strong>Anonimização ou eliminação</strong> — quando desnecessários ou tratados em desconformidade</li>
          <li><strong>Portabilidade</strong> — receber seus dados em formato estruturado</li>
          <li><strong>Revogação do consentimento</strong> — para o Google Calendar a qualquer momento</li>
          <li><strong>Informação</strong> — sobre compartilhamentos realizados</li>
        </ul>
        <p>
          Para exercer seus direitos, entre em contato: <strong>{CONTACT_EMAIL}</strong>
        </p>
      </Section>

      <Section title="9. Uso dos dados do Google">
        <p>
          O VetCare utiliza a API do Google Calendar para criar, atualizar e deletar eventos de
          consultas veterinárias na agenda do profissional. O acesso é concedido via OAuth 2.0,
          com escopo restrito a <code>calendar.events</code> (eventos criados pelo próprio
          aplicativo).
        </p>
        <p>
          <strong>O VetCare não lê, acessa ou armazena eventos pré-existentes</strong> no calendário
          do usuário. O token de acesso pode ser revogado a qualquer momento nas{' '}
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
        <p>
          O uso da informação recebida da API do Google seguirá a{' '}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 underline"
          >
            Política de Dados de Usuário dos Serviços de API do Google
          </a>
          , incluindo os requisitos de uso limitado.
        </p>
      </Section>

      <Section title="10. Cookies">
        <p>Utilizamos apenas cookies estritamente necessários:</p>
        <ul>
          <li><strong>next-auth.session-token</strong>: sessão autenticada (httpOnly, Secure)</li>
          <li><strong>next-auth.csrf-token</strong>: proteção contra CSRF</li>
        </ul>
        <p>Não utilizamos cookies de rastreamento, analytics ou publicidade.</p>
      </Section>

      <Section title="11. Alterações nesta política">
        <p>
          Esta política pode ser atualizada periodicamente. Em caso de mudanças materiais,
          notificaremos o usuário via e-mail ou aviso no sistema com pelo menos 15 dias de
          antecedência.
        </p>
      </Section>

      <Section title="12. Contato e DPO">
        <p>Para dúvidas, solicitações ou exercício de direitos:</p>
        <ul>
          <li>
            <strong>E-mail</strong>:{' '}
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-blue-600 underline">
              {CONTACT_EMAIL}
            </a>
          </li>
          <li><strong>Prazo de resposta</strong>: até 15 dias úteis</li>
          <li>
            <strong>Autoridade supervisora</strong>:{' '}
            <a
              href="https://www.gov.br/anpd"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline"
            >
              ANPD — Autoridade Nacional de Proteção de Dados
            </a>
          </li>
        </ul>
      </Section>
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
