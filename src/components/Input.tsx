import { forwardRef, useState, type ChangeEventHandler, type InputHTMLAttributes } from 'react'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input({ className = '', type = 'text', onChange, ...props }, ref) {
  const [passwordLength, setPasswordLength] = useState(0)
  const styles = type === 'checkbox'
    ? 'size-5 accent-green-900 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black'
    : 'w-full border-2 border-black bg-white px-3 py-2.5 text-sm shadow-[3px_3px_0_#151515] outline-none focus:ring-3 focus:ring-green-900 aria-[invalid=true]:border-red-600 aria-[invalid=true]:text-red-700 aria-[invalid=true]:focus:ring-red-600 disabled:cursor-not-allowed disabled:bg-gray-100'

  const isPassword = type === 'password'
  const isInvalid = props['aria-invalid'] === true || props['aria-invalid'] === 'true'
  const handlePasswordChange: ChangeEventHandler<HTMLInputElement> = (event) => {
    setPasswordLength(event.currentTarget.value.length)
    onChange?.(event)
  }
  const input = <input ref={ref} type={type} className={`${styles} ${isPassword ? 'password-mask-input' : ''} ${className}`} style={isPassword ? { color: 'transparent', WebkitTextFillColor: 'transparent', caretColor: 'black' } : undefined} onChange={isPassword ? handlePasswordChange : onChange} {...props} />

  if (!isPassword) return input

  return (
    <span className="block w-full" style={{ position: 'relative' }}>
      {input}
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '50%',
          left: '0.75rem',
          right: '0.75rem',
          display: 'block',
          overflow: 'hidden',
          pointerEvents: 'none',
          transform: 'translateY(-50%)',
          whiteSpace: 'nowrap',
          color: isInvalid ? '#b91c1c' : '#000',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: '0.875rem',
        }}
      >
        {'*'.repeat(passwordLength)}
      </span>
    </span>
  )
})
