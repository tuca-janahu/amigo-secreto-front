import { forwardRef, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', type = 'text', ...props }, ref) {
  const styles = type === 'checkbox'
    ? 'size-5 accent-green-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black'
    : 'w-full border-2 border-black bg-white px-3 py-2.5 text-sm shadow-[3px_3px_0_#151515] outline-none focus:ring-3 focus:ring-green-900 aria-[invalid=true]:border-red-600 aria-[invalid=true]:text-red-700 aria-[invalid=true]:focus:ring-red-600 disabled:cursor-not-allowed disabled:bg-gray-100'
  return <input ref={ref} type={type} className={`${styles} ${className}`} {...props} />
})
