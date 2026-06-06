# Security Review — VetCare

## 1. Autenticação

### NextAuth.js v5
- **Provider primário**: Google OAuth 2.0
- **Provider secundário** (futuro): credenciais (email + senha bcrypt)
- **Sessão**: JWT armazenado em cookie httpOnly, sameSite=strict, secure
- **Expiração**: 30 dias (refresh automático a cada request)
- **Rotação de tokens**: habilitada

### Google OAuth Scopes solicitados
```
openid
email
profile
https://www.googleapis.com/auth/calendar.events  (criação/edição de eventos)
```

**Princípio do menor privilégio**: não solicitar `calendar` (read-only ao calendário alheio), apenas `calendar.events`.

---

## 2. Autorização

### RBAC (Role-Based Access Control)

| Role | Permissões |
|------|-----------|
| `OWNER` | Tudo + configurações do tenant |
| `VETERINARIAN` | CRUD clínico completo (próprio tenant) |
| `ASSISTANT` | Leitura + agendamento (sem receituário) |
| `ADMIN` | Configurações + usuários (sem clínico) |

**MVP**: apenas OWNER/VETERINARIAN ativos (single user).

### Middleware de Autorização
```typescript
// Verificações em ordem:
1. isAuthenticated()          → 401 se não
2. isTenantMember(tenantId)   → 403 se não
3. hasRole(requiredRoles)     → 403 se não
4. isResourceOwner(resource)  → 403 se cross-tenant
```

### Isolamento de Tenant
- **Toda query Prisma** inclui `WHERE tenant_id = ?` — enforçado por Prisma middleware
- Teste obrigatório: tentar acessar recurso de outro tenant → 403

---

## 3. Proteção de Dados — LGPD

### Dados Sensíveis Identificados
| Dado | Classificação | Proteção |
|------|--------------|----------|
| CPF | Dado pessoal sensível | Armazenado sem formatação; masked na exibição |
| Histórico clínico | Dado de saúde (art. 11 LGPD) | Acesso restrito por tenant + role |
| Tokens Google OAuth | Credencial | Encrypted AES-256-GCM em repouso |
| Email/telefone | Dado pessoal | Sem criptografia (busca necessária) |
| Foto do animal | Não sensível | R2 com URL privada |

### Criptografia em Repouso
```typescript
// Tokens OAuth criptografados antes de persistir
const encrypted = encrypt(token, process.env.ENCRYPTION_KEY)
// ENCRYPTION_KEY: 32 bytes random, gerado no bootstrap
```

### Direitos do Titular (LGPD art. 18)
- **Acesso**: `GET /api/v1/tutors/:id` retorna todos os dados do tutor
- **Correção**: `PUT /api/v1/tutors/:id`
- **Exclusão**: endpoint `DELETE /api/v1/tutors/:id/gdpr-erase` (soft delete + anonimização — fase 2)
- **Portabilidade**: export JSON dos dados do tutor (fase 2)

### Audit Log
- Toda operação de escrita registrada em tabela `audit_logs`:
  ```
  id, tenant_id, user_id, action, entity_type, entity_id, ip, user_agent, created_at
  ```
- Retenção: 2 anos
- Apenas append (sem update/delete)

---

## 4. Segurança da API

### HTTPS
- Toda comunicação via TLS 1.2+
- HSTS header habilitado
- Redirect HTTP → HTTPS obrigatório

### Headers de Segurança (Next.js config)
```javascript
// next.config.js
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Content-Security-Policy', value: cspHeader },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=()' },
]
```

### CSRF
- NextAuth gerencia CSRF token para forms
- API routes verificam `Origin` header

### Input Validation
- Zod para validação de todos os inputs da API
- Sanitização de strings com DOMPurify (antes de renderizar HTML)
- Limite de tamanho de payload: 5MB (exceto upload)

### SQL Injection
- Prisma ORM usa prepared statements — protegido por padrão
- Nenhuma query raw sem parâmetros

### Upload de Arquivos
- Validação de MIME type (server-side, não só extensão)
- Limite: 10MB por arquivo
- Tipos permitidos: `image/jpeg`, `image/png`, `application/pdf`
- Arquivos servidos via presigned URLs (não acessível publicamente)
- Scan de malware: integrar ClamAV (fase 2)

---

## 5. Segurança de Infraestrutura

### Secrets Management
- Variáveis de ambiente via `.env` local
- Produção: secrets via Docker secrets ou serviço de secrets (ex: Infisical)
- Rotação de ENCRYPTION_KEY: processo documentado (reencriptar tokens)
- Nunca commit de `.env` — `.gitignore` enforçado

### Database
- PostgreSQL com SSL obrigatório
- Usuário de aplicação com permissões mínimas (sem DROP, sem CREATE TABLE em produção)
- Migrations executadas com usuário separado (migration role)
- Backup criptografado (GPG)

### Rate Limiting
- next-rate-limit por IP e por tenant
- Proteção contra brute force em auth: 10 tentativas / 15 min → block IP

---

## 6. Monitoramento de Segurança

| Item | Ferramenta |
|------|-----------|
| Dependency vulnerabilities | `npm audit` no CI |
| Secret scanning | git-secrets + GitHub secret scanning |
| Error tracking | Sentry (sem PII em eventos) |
| Uptime | Uptime Robot ou Better Stack |
| Alertas | Email para OWNER em caso de erro 5xx excessivo |

---

## 7. Checklist de Segurança por Feature

Para cada nova feature implementada, verificar:
- [ ] Tenant isolation enforçado (WHERE tenant_id)
- [ ] Role check implementado
- [ ] Input validado com Zod
- [ ] Output não expõe dados sensíveis desnecessários
- [ ] Ação registrada em audit_log
- [ ] Teste de segurança: acesso cross-tenant → 403
