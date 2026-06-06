const required = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
]

const missing = required.filter((k) => !process.env[k])
if (missing.length > 0) {
  console.error('Variaveis obrigatorias faltando:', missing.join(', '))
  process.exit(1)
}
console.log('Todas as variaveis obrigatorias configuradas')
