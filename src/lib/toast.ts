import { toast } from 'sonner'

type AppToastAction = {
  label: string
  onClick: () => void
}

export type AppToastOptions = {
  action?: AppToastAction
  description?: string
  duration?: number
  id?: string
}

type AppToastVariant = 'success' | 'error' | 'info' | 'warning'

const defaultDuration: Record<AppToastVariant, number> = {
  success: 5_000,
  error: 8_000,
  info: 5_000,
  warning: 8_000,
}

const labels: Record<AppToastVariant, string> = {
  success: 'Tudo certo',
  error: 'Algo deu errado',
  info: 'Informação',
  warning: 'Atenção',
}

function showToast(
  variant: AppToastVariant,
  title: string,
  options: AppToastOptions = {},
) {
  const { action, description, duration, id } = options

  return toast[variant](`${labels[variant]} — ${title}`, {
    action,
    className: `app-toast app-toast--${variant}`,
    description,
    duration: duration ?? (action ? 10_000 : defaultDuration[variant]),
    id,
  })
}

export const appToast = {
  success: (title: string, options?: AppToastOptions) =>
    showToast('success', title, options),
  error: (title: string, options?: AppToastOptions) =>
    showToast('error', title, options),
  info: (title: string, options?: AppToastOptions) =>
    showToast('info', title, options),
  warning: (title: string, options?: AppToastOptions) =>
    showToast('warning', title, options),
}
