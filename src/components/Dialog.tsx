import {
  createContext,
  useContext,
  useEffect,
  useId,
  useRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from 'react'

const focusableSelector = [
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

type DialogContextValue = {
  descriptionId: string
  titleId: string
}

const DialogContext = createContext<DialogContextValue | null>(null)

function useDialogContext() {
  const context = useContext(DialogContext)
  if (!context) throw new Error('Dialog components must be used inside Dialog.')
  return context
}

type DialogRootProps = {
  children: ReactNode
  className?: string
  onDismiss: () => void
  open: boolean
}

function DialogRoot({ children, className = '', onDismiss, open }: DialogRootProps) {
  const titleId = useId()
  const descriptionId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const focusTimer = window.setTimeout(() => {
      const preferredTarget = panelRef.current?.querySelector<HTMLElement>(
        '[data-dialog-initial-focus]',
      )
      const firstTarget = panelRef.current?.querySelector<HTMLElement>(focusableSelector)
      ;(preferredTarget ?? firstTarget ?? panelRef.current)?.focus()
    }, 0)

    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      window.setTimeout(() => previouslyFocused?.focus(), 0)
    }
  }, [open])

  if (!open) return null

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onDismiss()
      return
    }

    if (event.key !== 'Tab' || !panelRef.current) return

    const focusableElements = Array.from(
      panelRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    )
    const firstElement = focusableElements[0]
    const lastElement = focusableElements.at(-1)

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault()
      lastElement?.focus()
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault()
      firstElement?.focus()
    }
  }

  return (
    <div
      className="dialog-backdrop fixed inset-0 z-50 grid items-end bg-black/60 font-mono text-black sm:place-items-center"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onDismiss()
      }}
    >
      <DialogContext value={{ descriptionId, titleId }}>
        <div
          ref={panelRef}
          className={`dialog-panel w-full overflow-y-auto overscroll-contain border-2 border-black bg-white p-5 shadow-[8px_8px_0_#151515] outline-none sm:max-w-lg sm:p-7 ${className}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          tabIndex={-1}
          onKeyDown={handleKeyDown}
        >
          {children}
        </div>
      </DialogContext>
    </div>
  )
}

function DialogTitle({ className = '', ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const { titleId } = useDialogContext()
  return (
    <h2
      id={titleId}
      className={`text-balance text-2xl leading-tight font-black uppercase ${className}`}
      {...props}
    />
  )
}

function DialogDescription({ className = '', ...props }: HTMLAttributes<HTMLParagraphElement>) {
  const { descriptionId } = useDialogContext()
  return (
    <p
      id={descriptionId}
      className={`mt-4 text-pretty text-sm leading-6 ${className}`}
      {...props}
    />
  )
}

function DialogBody({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props} />
}

function DialogActions({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end ${className}`}
      {...props}
    />
  )
}

export const Dialog = Object.assign(DialogRoot, {
  Actions: DialogActions,
  Body: DialogBody,
  Description: DialogDescription,
  Title: DialogTitle,
})
