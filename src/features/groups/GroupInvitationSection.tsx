import { useIsMutating, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRef, useState } from 'react'
import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { inputClass, panelClass } from '../../lib/styles'
import { appToast } from '../../lib/toast'
import { groupInvitationsService } from '../../services/group-invitations'
import { invitationErrorMessage } from './group-invitations.errors'
import { groupInvitationKey, groupInvitationQueryOptions } from './group-invitations.queries'

export function GroupInvitationSection({ groupId }: { groupId: string }) {
  const queryClient = useQueryClient()
  const drawing = useIsMutating({ mutationKey: ['draw-group', groupId] }) > 0
  const invitation = useQuery(groupInvitationQueryOptions(groupId))
  const [confirmation, setConfirmation] = useState<'replace' | 'deactivate' | null>(null)
  const [copyFailed, setCopyFailed] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const busy = useRef(false)
  const change = useMutation({
    mutationKey: ['change-group-invitation', groupId],
    retry: false,
    mutationFn: async (action: 'generate' | 'deactivate') => {
      await queryClient.cancelQueries({ queryKey: groupInvitationKey(groupId) })
      if (action === 'deactivate') {
        await groupInvitationsService.deactivate(groupId)
        return null
      }
      return groupInvitationsService.generate(groupId)
    },
    onSuccess: (data) => {
      queryClient.setQueryData(groupInvitationKey(groupId), data)
      setConfirmation(null)
      setCopyFailed(false)
      appToast.success(data ? 'Link de convite gerado.' : 'Link de convite desativado.')
    },
    onSettled: () => { busy.current = false },
  })

  function submit(action: 'generate' | 'deactivate') {
    if (busy.current || drawing) return
    busy.current = true
    change.mutate(action)
  }

  async function copyLink() {
    if (!invitation.data || busy.current) return
    try {
      await navigator.clipboard.writeText(invitation.data.url)
      setCopyFailed(false)
      appToast.success('Link copiado.')
    } catch {
      setCopyFailed(true)
      input.current?.focus()
      input.current?.select()
    }
  }

  const error = change.error ?? invitation.error
  return <section className={`${panelClass} mt-8 min-w-0`} aria-labelledby="group-invitation-title">
    <h2 id="group-invitation-title" className="text-2xl font-black uppercase">Convide participantes</h2>
    <p className="mt-3 max-w-2xl text-sm leading-6 text-black/70">Compartilhe um link para que cada pessoa entre com sua conta e confirme a participação. Você também pode adicionar pessoas manualmente abaixo.</p>
    {invitation.isPending && <p className="mt-4 font-bold" role="status">Carregando convite…</p>}
    {error && !confirmation && <p className="mt-4 text-sm font-bold text-red-700" role="alert">{invitationErrorMessage(error)}</p>}
    {invitation.isError ? <Button className="mt-4" variant="secondary" disabled={invitation.isFetching} onClick={() => invitation.refetch()}>Tentar novamente</Button> : invitation.isSuccess && (
      invitation.data ? <>
        <label htmlFor="group-invitation-url" className="mt-5 block text-sm font-bold">Link de convite</label>
        <input ref={input} id="group-invitation-url" name="invitationUrl" autoComplete="off" className={`${inputClass} mt-2 w-full min-w-0`} value={invitation.data.url} readOnly spellCheck={false} onFocus={(event) => event.target.select()} aria-describedby={copyFailed ? 'manual-copy-help' : undefined} />
        {copyFailed && <p id="manual-copy-help" className="mt-3 text-sm" role="status">Não foi possível copiar automaticamente. Selecione o link acima e use a opção de copiar do seu dispositivo.</p>}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Button disabled={change.isPending || drawing} onClick={() => void copyLink()}>Copiar link</Button>
          <Button variant="secondary" disabled={change.isPending || drawing} onClick={() => { change.reset(); setConfirmation('replace') }}>Gerar novo link</Button>
          <Button variant="secondary" disabled={change.isPending || drawing} onClick={() => { change.reset(); setConfirmation('deactivate') }}>Desativar link</Button>
        </div>
      </> : <Button className="mt-5 w-full sm:w-auto" disabled={change.isPending || drawing} onClick={() => submit('generate')}>{change.isPending ? 'Gerando…' : 'Gerar link'}</Button>
    )}
    <Dialog open={confirmation !== null} onDismiss={() => { if (!change.isPending) setConfirmation(null) }}>
      <Dialog.Title>{confirmation === 'replace' ? 'Gerar novo link?' : 'Desativar link?'}</Dialog.Title>
      <Dialog.Description>O link compartilhado anteriormente deixará de funcionar. As pessoas que já confirmaram participação continuarão no grupo.</Dialog.Description>
      {change.error && <p className="mt-4 text-sm font-bold text-red-700" role="alert">{invitationErrorMessage(change.error)}</p>}
      <Dialog.Actions>
        <Button variant="secondary" data-dialog-initial-focus disabled={change.isPending} onClick={() => setConfirmation(null)}>Cancelar</Button>
        <Button disabled={change.isPending} onClick={() => submit(confirmation === 'replace' ? 'generate' : 'deactivate')}>{change.isPending ? 'Salvando…' : confirmation === 'replace' ? 'Gerar novo link' : 'Desativar link'}</Button>
      </Dialog.Actions>
    </Dialog>
  </section>
}
