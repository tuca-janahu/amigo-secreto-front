import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { FeedbackIcon } from '../../components/PixelIcons'
import { getErrorMessage } from '../../lib/errors'
import { formErrorMessage } from '../../lib/styles'
import { feedbackService } from '../../services/feedback'
import {
  feedbackFormSchema,
  getFeedbackSource,
  type FeedbackFormData,
} from './feedback.schemas'

const modeContent = {
  BUG: {
    title: 'Relatar um bug',
    label: 'O que aconteceu?',
    placeholder: 'Conte o que deu errado e o que você estava tentando fazer.',
  },
  SUGGESTION: {
    title: 'Enviar uma sugestão',
    label: 'Qual é a sua ideia?',
    placeholder: 'Conte como podemos deixar o Amigo Secreto melhor.',
  },
} as const

const focusableSelector = [
  'button:not([disabled])',
  'textarea:not([disabled])',
  '[href]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export function FeedbackWidget() {
  const location = useLocation()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const messageRef = useRef<HTMLTextAreaElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FeedbackFormData>({
    resolver: zodResolver(feedbackFormSchema),
    defaultValues: { type: 'BUG', message: '' },
  })
  const messageField = register('message')
  const type = useWatch({ control, name: 'type' })
  const content = modeContent[type]
  const submitFeedback = useMutation({
    mutationFn: (data: FeedbackFormData) =>
      feedbackService.create({
        ...data,
        source: getFeedbackSource(location.pathname),
      }),
    onSuccess: () => setSent(true),
  })

  function closeModal() {
    if (submitFeedback.isPending) return
    setIsOpen(false)
    setSent(false)
    submitFeedback.reset()
    reset({ type: 'BUG', message: '' })
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  useEffect(() => {
    if (!isOpen) return

    window.setTimeout(() => {
      if (sent) {
        dialogRef.current?.querySelector<HTMLButtonElement>('button')?.focus()
      } else {
        messageRef.current?.focus()
      }
    }, 0)
  }, [isOpen, sent])

  useEffect(() => {
    if (!isOpen) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') closeModal()
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  })

  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== 'Tab' || !dialogRef.current) return

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
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
    <>
      <button
        ref={triggerRef}
        type="button"
        className="fixed right-5 bottom-5 z-40 grid size-12 cursor-pointer place-items-center border-2 border-black bg-amber-400 text-black shadow-[4px_4px_0_#151515] transition hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0_#151515] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black sm:right-7 sm:bottom-7"
        aria-label="Enviar sugestão ou relatar bug"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <FeedbackIcon />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5 font-mono text-black"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal()
          }}
        >
          <div
            ref={dialogRef}
            className="max-h-[calc(100vh-2.5rem)] w-full max-w-lg overflow-y-auto border-2 border-black bg-white p-6 shadow-[8px_8px_0_#151515] sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-dialog-title"
            aria-describedby="feedback-dialog-description"
            onKeyDown={trapFocus}
          >
            {sent ? (
              <div className="text-center">
                <div className="mx-auto grid size-12 place-items-center border-2 border-black bg-green-900 text-2xl font-black text-white shadow-[3px_3px_0_#151515]" aria-hidden="true">✓</div>
                <h2 id="feedback-dialog-title" className="mt-5 text-2xl font-black uppercase">Feedback enviado!</h2>
                <p id="feedback-dialog-description" className="mt-3 text-sm leading-6 text-black/70">Obrigado por ajudar a melhorar o Amigo Secreto.</p>
                <Button className="mt-6" onClick={closeModal}>Fechar</Button>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 id="feedback-dialog-title" className="text-2xl font-black uppercase">{content.title}</h2>
                    <p id="feedback-dialog-description" className="mt-2 text-sm leading-6 text-black/70">A mensagem é anônima e será enviada diretamente para nossa equipe.</p>
                  </div>
                  <button type="button" className="grid size-9 shrink-0 cursor-pointer place-items-center border-2 border-black bg-white text-xl font-black leading-none hover:bg-amber-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-black" aria-label="Fechar" disabled={submitFeedback.isPending} onClick={closeModal}>×</button>
                </div>

                <form className="mt-6" noValidate onSubmit={handleSubmit((data) => submitFeedback.mutate(data))}>
                  <div className="grid grid-cols-2 border-2 border-black" role="group" aria-label="Tipo de feedback">
                    {(['BUG', 'SUGGESTION'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        className={`cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider transition first:border-r-2 first:border-black focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-black ${type === mode ? 'bg-green-900 text-white' : 'bg-white text-black hover:bg-amber-100'}`}
                        aria-pressed={type === mode}
                        disabled={submitFeedback.isPending}
                        onClick={() => setValue('type', mode, { shouldValidate: true })}
                      >
                        {mode === 'BUG' ? 'Relatar bug' : 'Sugestão'}
                      </button>
                    ))}
                  </div>

                  <label className="mt-5 block text-xs font-black uppercase tracking-wider" htmlFor="feedback-message">{content.label}</label>
                  <textarea
                    id="feedback-message"
                    rows={7}
                    maxLength={2_000}
                    className="mt-2 block w-full resize-y border-2 border-black bg-white px-3 py-3 text-sm leading-6 outline-none focus:ring-3 focus:ring-amber-400 disabled:cursor-wait disabled:opacity-60"
                    placeholder={content.placeholder}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? 'feedback-message-error' : undefined}
                    disabled={submitFeedback.isPending}
                    {...messageField}
                    ref={(element) => {
                      messageField.ref(element)
                      messageRef.current = element
                    }}
                  />
                  {errors.message && <p id="feedback-message-error" className={`${formErrorMessage} mt-2 text-sm`} role="alert">{errors.message.message}</p>}
                  {submitFeedback.isError && <p className={`${formErrorMessage} mt-3 text-sm`} role="alert">{getErrorMessage(submitFeedback.error, 'Não foi possível enviar o feedback.')}</p>}

                  <div className="mt-6 flex flex-wrap justify-end gap-3">
                    <Button variant="secondary" disabled={submitFeedback.isPending} onClick={closeModal}>Cancelar</Button>
                    <Button type="submit" disabled={submitFeedback.isPending}>{submitFeedback.isPending ? 'Enviando...' : 'Enviar feedback'}</Button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
