import { Link } from 'react-router-dom'

type PixelBrandProps = {
  light?: boolean
}

export function PixelBrand({ light = false }: PixelBrandProps) {
  const textColor = light ? 'text-white' : 'text-black'

  return (
    <Link className={`inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-tight ${textColor}`} to="/">
      <img className="size-6 shrink-0 [image-rendering:pixelated]" src="/favicon.png" alt="" aria-hidden="true" />
      Amigo Secreto
    </Link>
  )
}
