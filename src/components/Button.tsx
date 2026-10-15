import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

const variants = {
  primary: 'bg-green-900 text-white shadow-[4px_4px_0_#151515]',
  secondary: 'bg-white text-black shadow-[3px_3px_0_#151515]',
  tertiary: 'bg-amber-400 text-amber-950 shadow-[3px_3px_0_#151515]',
  danger: 'bg-red-600 text-white shadow-[3px_3px_0_#151515]',
  exit: 'bg-white text-black shadow-[3px_3px_0_#151515]',
} as const

const buttonHoverVariants = {
  primary: 'enabled:hover:bg-green-800 enabled:hover:shadow-[2px_2px_0_#151515]',
  secondary: 'enabled:hover:shadow-[2px_2px_0_#151515]',
  tertiary: 'enabled:hover:shadow-[1px_1px_0_#151515]',
  danger: 'enabled:hover:shadow-[1px_1px_0_#151515]',
  exit: 'enabled:hover:bg-red-600 enabled:hover:text-white enabled:hover:shadow-[1px_1px_0_#151515]',
} as const

const linkHoverVariants = {
  primary: 'hover:bg-green-800 hover:shadow-[2px_2px_0_#151515]',
  secondary: 'hover:shadow-[2px_2px_0_#151515]',
  tertiary: 'hover:shadow-[1px_1px_0_#151515]',
  danger: 'hover:shadow-[1px_1px_0_#151515]',
  exit: 'hover:bg-red-600 hover:text-white hover:shadow-[1px_1px_0_#151515]',
} as const

const baseClassName =
  'inline-flex cursor-pointer items-center justify-center border-2 border-black font-black uppercase tracking-wider transition focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black'

const sizes = {
  small: 'px-3 py-2 text-xs',
  medium: 'px-4 py-2.5 text-xs',
  large: 'px-5 py-3 text-sm',
} as const

type ButtonVariant = keyof typeof variants
type ButtonSize = keyof typeof sizes

export type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'size'> & {
  size?: ButtonSize
  variant?: ButtonVariant
}

export function Button({ className = '', size = 'medium', variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${baseClassName} ${sizes[size]} ${variants[variant]} enabled:hover:translate-x-0.5 enabled:hover:translate-y-0.5 disabled:cursor-wait disabled:opacity-60 ${buttonHoverVariants[variant]} ${className}`} {...props} />
}

export type ButtonLinkProps = Omit<LinkProps, 'className'> & {
  className?: string
  size?: ButtonSize
  variant?: ButtonVariant
  icon?: ReactNode
}

export function ButtonLink({ children, className = '', size = 'medium', variant = 'primary', icon, ...props }: ButtonLinkProps) {
  return (
    <Link className={`${baseClassName} ${sizes[size]} ${variants[variant]} ${icon ? 'gap-2' : ''} hover:translate-x-0.5 hover:translate-y-0.5 ${linkHoverVariants[variant]} ${className}`} {...props}>
      {icon && <span className="size-5 shrink-0 [&>svg]:size-full" aria-hidden="true">{icon}</span>}
      {children}
    </Link>
  )
}
