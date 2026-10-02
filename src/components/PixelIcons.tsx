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

export function FeedbackIcon() {
  return <svg aria-hidden="true" className="size-6 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M2 5h2v4H2zm20 0h-2v4h2zM4 9h2v2H4zm16 0h-2v2h2zM2 13h4v2H2zm20 0h-4v2h4zM4 17h2v2H4zm16 0h-2v2h2zM2 19h2v2H2zm20 0h-2v2h2zM6 11h12v2H6z"/><path d="M6 7h2v12H6zm10 0h2v12h-2zM8 19h8v2H8zM8 5h8v2H8z"/><path d="M11 15h2v6h-2zM8 1h2v6H8zm6 0h2v6h-2z"/></svg>
}
