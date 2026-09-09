#!/usr/bin/env node
// Codemod: envolve cada handler HTTP exportado (GET/POST/PUT/PATCH/DELETE) de
// src/app/api/**/route.ts com withMetrics(route, handler) -- ver
// src/lib/with-metrics.ts pro porquê disso ser um wrapper por rota em vez de
// um hook central (Next.js App Router não tem um).
//
// Estratégia: AST (TypeScript compiler API) só pra ACHAR com segurança onde
// cada `export async function METHOD(...) { ... }` começa e termina -- a
// reescrita em si é por texto (slice do arquivo original), não pelo printer
// do TS, pra preservar comentários/formatação do corpo de cada handler
// intocados. Roda uma vez, não é parte do build.
//
// Uso: node scripts/wrap-routes-with-metrics.mjs [--dry-run]
import ts from 'typescript'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { globSync } from 'glob'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const API_DIR = path.join(ROOT, 'src/app/api')
const DRY_RUN = process.argv.includes('--dry-run')

const HTTP_METHODS = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE'])

// Rotas propositalmente NÃO instrumentadas:
// - api/metrics: o próprio endpoint de métricas, não faz sentido medir a si mesmo
//   com o mesmo Counter que ele expõe (risco de confusão, não de bug).
// - api/auth/[...nextauth]: re-export de `handlers` do NextAuth (não é uma
//   `export async function`, o codemod já ignora por não casar o padrão --
//   listado aqui só pra deixar explícito que é intencional, não uma omissão).
const SKIP_ROUTES = new Set(['/api/metrics', '/api/auth/[...nextauth]'])

function routeFromFilePath(filePath) {
  const rel = path.relative(API_DIR, filePath).replace(/\\/g, '/')
  const withoutRoute = rel.replace(/\/route\.ts$/, '')
  return '/api/' + withoutRoute
}

function normalizeRouteForLabel(route) {
  // [id] -> :id, [...nextauth] fica como está (não instrumentado de qualquer forma)
  return route.replace(/\[([^\]]+)\]/g, (_, seg) => (seg.startsWith('...') ? `[${seg}]` : `:${seg}`))
}

function processFile(filePath) {
  const route = routeFromFilePath(filePath)
  if (SKIP_ROUTES.has(route)) {
    return { filePath, route, skipped: true, wrapped: [] }
  }

  const source = fs.readFileSync(filePath, 'utf8')
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TS)

  const targets = []
  sourceFile.forEachChild((node) => {
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      HTTP_METHODS.has(node.name.text) &&
      node.modifiers?.some((m) => m.kind === ts.SyntaxKind.ExportKeyword) &&
      node.body
    ) {
      targets.push(node)
    }
  })

  if (targets.length === 0) {
    return { filePath, route, skipped: true, wrapped: [] }
  }

  // Processa de trás pra frente pra não invalidar offsets já calculados.
  targets.sort((a, b) => b.getStart(sourceFile) - a.getStart(sourceFile))

  let text = source
  const wrapped = []
  const routeLabel = normalizeRouteForLabel(route)

  for (const node of targets) {
    const method = node.name.text
    const start = node.getStart(sourceFile)
    const end = node.getEnd()

    // Localiza o `(` que abre a lista de parâmetros, pra separar
    // "export async function GET" do resto ("(req: NextRequest, ...) { ... }").
    const headerText = text.slice(start, end)
    const parenIndex = headerText.indexOf('(')
    if (parenIndex === -1) continue // não deveria acontecer, função sempre tem parênteses

    const implName = `${method}_impl`
    const newHeader = `async function ${implName}` + headerText.slice(parenIndex)
    const exportLine = `\nexport const ${method} = withMetrics(${JSON.stringify(routeLabel)}, ${implName})\n`

    text = text.slice(0, start) + newHeader + exportLine + text.slice(end)
    wrapped.push(method)
  }

  // Import do withMetrics, só se algo foi de fato envolvido.
  if (wrapped.length > 0 && !text.includes("from '@/lib/with-metrics'")) {
    const importLine = "import { withMetrics } from '@/lib/with-metrics'\n"
    // Insere depois do último import existente (ou no topo, se não houver nenhum).
    const importRegex = /^import .+$/gm
    let lastImportEnd = 0
    let m
    while ((m = importRegex.exec(text)) !== null) {
      lastImportEnd = m.index + m[0].length
    }
    text = text.slice(0, lastImportEnd) + '\n' + importLine + text.slice(lastImportEnd)
  }

  if (!DRY_RUN) {
    fs.writeFileSync(filePath, text, 'utf8')
  }

  return { filePath, route, skipped: false, wrapped }
}

const files = globSync('src/app/api/**/route.ts', { cwd: ROOT, absolute: true })
console.log(`${files.length} route.ts encontrados`)

let totalWrapped = 0
let totalSkipped = 0
for (const file of files.sort()) {
  const result = processFile(file)
  const rel = path.relative(ROOT, file)
  if (result.skipped) {
    totalSkipped++
    console.log(`  SKIP  ${rel}`)
  } else {
    totalWrapped += result.wrapped.length
    console.log(`  WRAP  ${rel}  [${result.wrapped.join(', ')}]  route=${normalizeRouteForLabel(result.route)}`)
  }
}
console.log(`\nTotal: ${totalWrapped} handlers envolvidos, ${totalSkipped} arquivos pulados${DRY_RUN ? ' (dry-run, nada escrito)' : ''}`)
