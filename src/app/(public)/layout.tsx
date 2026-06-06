// Layout público — sem autenticação, sem sidebar
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="text-2xl">🐾</span>
          <span className="text-xl font-bold text-blue-600">VetCare</span>
          <span className="text-gray-400 text-sm ml-auto">Sistema de Gestão Veterinária</span>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-10">{children}</main>
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-4xl mx-auto px-6 py-6 text-center text-sm text-gray-500">
          <p>VetCare · <a href="/privacidade" className="underline hover:text-blue-600">Política de Privacidade</a> · <a href="/termos" className="underline hover:text-blue-600">Termos de Uso</a></p>
        </div>
      </footer>
    </div>
  )
}
