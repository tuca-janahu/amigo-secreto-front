import { Link } from 'react-router-dom'

type PixelBrandProps = {
  light?: boolean
}

export function PixelBrand({ light = false }: PixelBrandProps) {
  const textColor = light ? 'text-white' : 'text-black'
  const markColor = light ? 'bg-white text-black' : 'bg-green-900 text-white'

  return (
    <Link className={`inline-flex items-center gap-2 font-mono text-sm font-black uppercase tracking-tight ${textColor}`} to="/">
      <span className={`grid size-8 place-items-center border-2 border-black ${markColor} shadow-[3px_3px_0_#151515]`} aria-hidden="true">
        AS
      </span>
      Amigo Secreto
    </Link>
  )
}
