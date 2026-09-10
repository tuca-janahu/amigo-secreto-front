import type { FormHTMLAttributes } from 'react'
import { Button } from './Button'
import { Input } from './Input'
import { Label } from './Label'

function FormRoot({ className = '', noValidate = true, ...props }: FormHTMLAttributes<HTMLFormElement>) {
  return <form className={className} noValidate={noValidate} {...props} />
}

export const Form = Object.assign(FormRoot, { Button, Input, Label })
