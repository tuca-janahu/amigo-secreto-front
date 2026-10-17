import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

function PixelToastIcon({ children }: { children: ReactNode }) {
  return (
    <span className="app-toast__icon" aria-hidden="true">
      {children}
    </span>
  )
}

export function AppToaster() {
  return (
    <Toaster
      closeButton
      containerAriaLabel="Notificações"
      expand
      gap={12}
      icons={{
        success: <PixelToastIcon>✓</PixelToastIcon>,
        error: <PixelToastIcon>!</PixelToastIcon>,
        info: <PixelToastIcon>i</PixelToastIcon>,
        warning: <PixelToastIcon>!</PixelToastIcon>,
      }}
      position="top-right"
      toastOptions={{
        closeButtonAriaLabel: 'Fechar notificação',
        unstyled: true,
        classNames: {
          actionButton: 'app-toast__action',
          closeButton: 'app-toast__close',
          content: 'app-toast__content',
          description: 'app-toast__description',
          icon: 'app-toast__icon-slot',
          title: 'app-toast__title',
        },
      }}
      visibleToasts={3}
    />
  )
}
