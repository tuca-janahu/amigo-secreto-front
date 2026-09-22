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

export function DeleteIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M18 20V8H6V20H18ZM9 6H15V4H9V6ZM20 22H4V8H2V6H7V2H17V6H22V8H20V22Z" /></svg>
}

export function EditIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M11 5H5v14h14v-6h2v8H3V3h8v2Zm-1 7h2v2h2v2H8v-6h2v2Zm6 2h-2v-2h2v2Zm2-2h-2v-2h2v2Zm-6-2h-2V8h2v2Zm8 0h-2V8h2v2Zm-6-2h-2V6h2v2Zm8 0h-2V6h2v2Zm-6-2h-2V4h2v2Zm4 0h-2V4h2v2Zm-2-2h-2V2h2v2Z" /></svg>
}

export function SaveIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M10 18H8v-2h2v2Zm-2-2H6v-2h2v2Zm4-2v2h-2v-2h2Zm-6 0H4v-2h2v2Zm8 0h-2v-2h2v2Zm2-2h-2v-2h2v2Zm2-2h-2V8h2v2Zm2-2h-2V6h2v2Z" /></svg>
}

export function CancelIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M7 19H5v-2h2v2Zm12 0h-2v-2h2v2ZM9 15v2H7v-2h2Zm8 2h-2v-2h2v2Zm-6-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-2-2h-2v-2h2v2Zm-2-2H9V9h2v2Zm4 0h-2V9h2v2ZM9 9H7V7h2v2Zm8 0h-2V7h2v2ZM7 7H5V5h2v2Zm12 0h-2V5h2v2Z" /></svg>
}