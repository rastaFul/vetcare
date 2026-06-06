# VetCare — Design System

## Stack UI
- Tailwind CSS v4 (via `@import "tailwindcss"`)
- shadcn/ui (preset: Nova, base: Blue)
- lucide-react (ícones)
- @tailwindcss/typography (páginas públicas)

## Tokens de Cor

| Token | Classe Tailwind | Uso |
|-------|----------------|-----|
| Primary | `bg-blue-600` / `text-blue-600` | CTAs, links, highlights |
| Primary hover | `hover:bg-blue-700` | |
| Success | `text-green-600` / `bg-green-50` | Status ok, conectado |
| Warning | `text-amber-600` / `bg-amber-50` | Alertas, pendente |
| Danger | `text-red-600` / `bg-red-50` | Erros, cancelado |
| Surface | `bg-gray-50` | Background de cards internos |
| Border | `border-gray-200` | Bordas padrão |
| Text primary | `text-gray-900` | Títulos |
| Text muted | `text-gray-500` | Labels, subtítulos |
| Text xs | `text-gray-400` | Metadados, timestamps |

## Status Badges (padrão do sistema)

```tsx
// ConsultationStatus
SCHEDULED  → bg-blue-100  text-blue-700  border-blue-200
CONFIRMED  → bg-green-100 text-green-700 border-green-200
COMPLETED  → bg-gray-100  text-gray-700  border-gray-200
CANCELLED  → bg-red-100   text-red-700   border-red-200

// NotificationStatus
SENT       → bg-green-100 text-green-700
FAILED     → bg-red-100   text-red-700
PENDING    → bg-amber-100 text-amber-700
DELIVERED  → bg-blue-100  text-blue-700
```

## Tipografia

| Elemento | Classes |
|----------|---------|
| Page title | `text-2xl font-bold text-gray-900` |
| Section title | `text-lg font-semibold text-gray-800` |
| Card title | `text-sm font-medium text-gray-800` |
| Body | `text-sm text-gray-700` |
| Muted | `text-sm text-gray-500` |
| Micro | `text-xs text-gray-400` |

## Spacing

- Card padding: `p-4` (mobile) / `p-6` (desktop)
- Section gap: `space-y-6`
- Form gap: `space-y-4`
- Inline gap: `gap-2` / `gap-3`

## Componentes Padrão

### Card de status (conectado/desconectado)
```tsx
<div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
  <div className="flex items-center gap-3">
    <CheckCircle className="w-5 h-5 text-green-600" /> {/* ou XCircle text-gray-400 */}
    <div>
      <p className="text-sm font-medium text-gray-800">Conectado</p>
      <p className="text-xs text-gray-500">detalhe</p>
    </div>
  </div>
  <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Ativo</Badge>
</div>
```

### Modal de confirmação (send reminder)
```tsx
<Dialog>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Enviar lembrete</DialogTitle>
    </DialogHeader>
    {/* preview da mensagem */}
    <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-line border border-gray-200">
      {messagePreview}
    </div>
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button>Enviar</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

### Log de notificação (list item)
```tsx
<div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
  <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", statusColor)} />
  <div className="flex-1 min-w-0">
    <p className="text-sm font-medium text-gray-800">{type}</p>
    <p className="text-xs text-gray-500 truncate">{message}</p>
    <p className="text-xs text-gray-400 mt-0.5">{date} · {channel}</p>
  </div>
  <Badge>{status}</Badge>
</div>
```

### QR Code container
```tsx
<div className="flex flex-col items-center gap-4 p-6 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
  <img src={qrCodeDataUrl} alt="QR Code WhatsApp" className="w-48 h-48" />
  <p className="text-sm text-gray-600 text-center">
    Abra o WhatsApp no celular → Dispositivos conectados → Conectar dispositivo
  </p>
</div>
```

## Ícones padrão (lucide-react)

| Contexto | Ícone |
|----------|-------|
| WhatsApp | `MessageCircle` (verde) |
| Email | `Mail` |
| Notificação | `Bell` |
| Sucesso | `CheckCircle` |
| Erro | `XCircle` |
| Aviso | `AlertTriangle` |
| Vacina | `Syringe` |
| Consulta | `Calendar` |
| Retorno | `RotateCcw` |
| Enviar | `Send` |
| Configurações | `Settings` |

## Padrões de Loading

- Lista: `Skeleton` repetido (3-5 items)
- Card: `Skeleton className="h-20 w-full rounded-lg"`
- QR Code: `Skeleton className="w-48 h-48"`
- Botão loading: `disabled + spinner icon + "Enviando..."`

## Mobile-first

- Bottom nav: Dashboard, Tutores, Animais, Consultas
- Formulários: `w-full` inputs
- Modais: `max-w-md` no desktop, full-screen no mobile
- Tabs: ícone apenas no mobile (`hidden sm:inline` para labels)
