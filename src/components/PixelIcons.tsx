import { Link } from 'react-router-dom'

type PixelBrandProps = {
  light?: boolean
}

export function PixelBrand({ light = false }: PixelBrandProps) {
  const textColor = light ? 'text-white' : 'text-black'

  return (
    <Link className={`inline-flex min-h-11 min-w-0 items-center gap-2 font-mono text-sm font-black uppercase tracking-tight ${textColor}`} to="/">
      <img className="size-6 shrink-0 [image-rendering:pixelated]" src="/favicon.png" width="24" height="24" alt="" aria-hidden="true" />
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

export function BackIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 13v-2h2v2H8Zm2-2V9h2v2h-2Zm0 4v-2h2v2h-2Zm2-6V7h2v2h-2Zm0 8v-2h2v2h-2Zm2-10V5h2v2h-2Zm0 12v-2h2v2h-2Z"/></svg>
}

export function PlusIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M13 11h7v2h-7v7h-2v-7H4v-2h7V4h2v7Z"></path></svg>
}

export function MinusIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M4 11h16v2H4z"/></svg>
}

export function SettingsIcon() {
  return <svg aria-hidden="true" className="size-5 shrink-0" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M4 20h3v-2h4v4h2v-4h4v2h-2v4H9v-4H7v2H2v-5h2v3Zm18 2h-5v-2h3v-3h2v5ZM6 11H2v2h4v4H4v-2H0V9h4V7h2v4Zm14-2h4v6h-4v2h-2v-4h4v-2h-4V7h2v2Zm-6 7h-4v-2h4v2Zm-4-2H8v-4h2v4Zm6 0h-2v-4h2v4Zm-2-4h-4V8h4v2ZM7 4H4v3H2V2h5v2Zm8 0h2V2h5v5h-2V4h-3v2h-4V2h-2v4H7V4h2V0h6v4Z"/></svg>
}

export function ExitIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M4 4v16H2V4zm18 7v2H6v-2zm-12 2v2H8v-2zm2 2v2h-2v-2zm2 2v2h-2v-2zm-4-8v2H8V9zm2-2v2h-2V7zm2-2v2h-2V5z"/></svg>
}

export function SearchIcon() {
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M22 22h-2v-2h2v2Zm-2-2h-2v-2h2v2Zm-6-2H6v-2h8v2Zm4 0h-2v-2h2v2ZM6 16H4v-2h2v2Zm10 0h-2v-2h2v2ZM4 14H2V6h2v8Zm14 0h-2V6h2v8ZM6 6H4V4h2v2Zm10 0h-2V4h2v2Zm-2-2H6V2h8v2Z"/></svg>
}

export function FilterIcon(){
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M11 20h2v2H9V12h2v8Zm4 0h-2v-8h2v8Zm-6-8H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Zm2-2h-2V4H5v4H3V2h18v6Z"/></svg>
}

export function SortIcon(){
  return <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M8 6h2v2h2v2H8v10H6V10H2V8h2V6h2V4h2v2Zm10 8h4v2h-2v2h-2v2h-2v-2h-2v-2h-2v-2h4V4h2v10Z"/></svg>
}

export function ChevronDownIcon() {
  return <svg aria-hidden="true" className="size-5" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24"><path d="M13 16h-2v-2h2v2Zm-2-2H9v-2h2v2Zm4 0h-2v-2h2v2Zm-6-2H7v-2h2v2Zm8 0h-2v-2h2v2ZM7 10H5V8h2v2Zm12 0h-2V8h2v2Z"/></svg>
}
