import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useLocation } from 'react-router-dom'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { appToast } from '../../lib/toast'
import { CancelIcon, FeedbackIcon } from '../../components/PixelIcons'
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

export function FeedbackWidget() {
  const location = useLocation()
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
  const type = useWatch({ control, name: 'type' })
  const content = modeContent[type]
  const submitFeedback = useMutation({
    mutationFn: (data: FeedbackFormData) =>
      feedbackService.create({
        ...data,
        source: getFeedbackSource(location.pathname),
      }),
    onSuccess: () => setSent(true),
    onError: () => appToast.error('Não foi possível enviar o feedback.', { id: 'feedback-create' }),
  })

  function closeModal() {
    if (submitFeedback.isPending) return
    setIsOpen(false)
    setSent(false)
    submitFeedback.reset()
    reset({ type: 'BUG', message: '' })
  }

  return (
    <>
      <button
        type="button"
        className="feedback-trigger fixed z-40 grid size-12 touch-manipulation cursor-pointer place-items-center border-2 border-black bg-amber-400 text-black shadow-[4px_4px_0_#151515] transition-[transform,box-shadow] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[2px_2px_0_#151515] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-black motion-reduce:transition-none sm:size-14"
        aria-label="Enviar sugestão ou relatar bug"
        aria-haspopup="dialog"
        onClick={() => setIsOpen(true)}
      >
        <FeedbackIcon />
      </button>

      <Dialog open={isOpen} onDismiss={closeModal}>
        {sent ? (
          <div className="text-center">
            <div className="mx-auto grid size-12 place-items-center border-2 border-black bg-green-900 text-2xl font-black text-white shadow-[3px_3px_0_#151515]" aria-hidden="true">✓</div>
            <Dialog.Title className="mt-5">Feedback enviado!</Dialog.Title>
            <Dialog.Description className="mt-3 text-black/70">Obrigado por ajudar a melhorar o Amigo Secreto.</Dialog.Description>
            <Button className="mt-6 w-full sm:w-auto" onClick={closeModal} data-dialog-initial-focus>Fechar</Button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Dialog.Title>{content.title}</Dialog.Title>
                <Dialog.Description className="mt-2 text-black/70">A mensagem é anônima e será enviada diretamente para nossa equipe.</Dialog.Description>
              </div>
              <Button className="size-11 shrink-0 px-0 py-0" variant="exit" icon={<CancelIcon />} disabled={submitFeedback.isPending} onClick={closeModal} aria-label="Fechar" />
            </div>

            <form className="mt-6" noValidate onSubmit={handleSubmit((data) => submitFeedback.mutate(data))}>
              <div className="grid grid-cols-2 border-2 border-black" role="group" aria-label="Tipo de feedback">
                {(['BUG', 'SUGGESTION'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    className={`min-h-11 cursor-pointer px-3 py-2.5 text-xs font-black uppercase tracking-wider transition-colors first:border-r-2 first:border-black focus-visible:z-10 focus-visible:outline-3 focus-visible:outline-black motion-reduce:transition-none ${type === mode ? 'bg-green-900 text-white' : 'bg-white text-black hover:bg-amber-100'}`}
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
                className="mt-2 block min-h-11 w-full resize-y border-2 border-black bg-white px-3 py-3 text-base leading-6 outline-none focus:ring-3 focus:ring-amber-400 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
                placeholder={content.placeholder}
                aria-invalid={Boolean(errors.message)}
                aria-describedby={errors.message ? 'feedback-message-error' : undefined}
                disabled={submitFeedback.isPending}
                data-dialog-initial-focus
                {...register('message')}
              />
              {errors.message && <p id="feedback-message-error" className={`${formErrorMessage} mt-2 text-sm`} role="alert">{errors.message.message}</p>}
              <Dialog.Actions>
                <Button className="w-full sm:w-auto" variant="secondary" disabled={submitFeedback.isPending} onClick={closeModal}>Cancelar</Button>
                <Button className="w-full sm:w-auto" type="submit" disabled={submitFeedback.isPending}>{submitFeedback.isPending ? 'Enviando…' : 'Enviar feedback'}</Button>
              </Dialog.Actions>
            </form>
          </>
        )}
      </Dialog>
    </>
  )
}
