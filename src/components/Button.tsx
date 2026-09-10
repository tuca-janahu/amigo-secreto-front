import type { ButtonHTMLAttributes } from 'react'

const variants = {
  primary: 'bg-green-900 text-white shadow-[4px_4px_0_#151515] enabled:hover:shadow-[2px_2px_0_#151515]',
  secondary: 'bg-white text-black shadow-[3px_3px_0_#151515] enabled:hover:shadow-[2px_2px_0_#151515]',
  danger: 'bg-red-600 text-white shadow-[3px_3px_0_#151515] enabled:hover:shadow-[1px_1px_0_#151515]',
  exit: 'bg-white text-black shadow-[3px_3px_0_#151515] enabled:hover:bg-red-600 enabled:hover:text-white enabled:hover:shadow-[1px_1px_0_#151515]',
} as const

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: keyof typeof variants
}

export function Button({ className = '', variant = 'primary', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`inline-flex cursor-pointer items-center justify-center border-2 border-black px-4 py-2.5 text-xs font-black uppercase tracking-wider transition enabled:hover:translate-x-0.5 enabled:hover:translate-y-0.5 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black disabled:cursor-wait disabled:opacity-60 ${variants[variant]} ${className}`} {...props} />
}
