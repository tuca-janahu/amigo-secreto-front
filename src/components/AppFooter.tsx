import { ExternalLinkIcon } from './PixelIcons'

const links = [
  {
    href: 'https://janahu.dev.br',
    label: 'Portfólio',
  },
  {
    href: 'https://github.com/tuca-janahu',
    label: 'GitHub',
  },
  {
    href: 'https://www.linkedin.com/in/artur-janahu/',
    label: 'LinkedIn',
  }
] as const

export function AppFooter() {
  return (
    <footer className="border-t-2 border-black bg-green-950 px-4 py-5 font-mono text-white sm:px-8 sm:py-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-5 font-bold uppercase tracking-wider text-white/60">
          Desenvolvido por <span className="ml-3 text-white">Artur Janahú</span>
        </p>

        <nav className="flex flex-wrap gap-4" aria-label="Links do desenvolvedor">
          {links.map((link) => (
            <a
              key={link.href}
              className="inline-flex min-h-11 items-center gap-2 border-2 border-white/70 px-3 py-2 text-xs font-black uppercase tracking-wider text-white transition-[background-color,color,border-color] hover:border-white hover:bg-white hover:text-green-950 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-amber-400 motion-reduce:transition-none"
              href={link.href}
              target="_blank"
              rel="noreferrer"
              aria-label={`${link.label} de Artur Janahú — abre em nova aba`}
            >
              {link.label}
              <ExternalLinkIcon />
            </a>
          ))}
        </nav>
      </div>
    </footer>
  )
}
