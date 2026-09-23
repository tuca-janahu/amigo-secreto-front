import { Button } from '../../components/Button'
import { CancelIcon, DeleteIcon } from '../../components/PixelIcons'
import { getErrorMessage } from '../../lib/errors'
import { formErrorMessage } from '../../lib/styles'

type DeleteGroupModalProps = {
  groupName: string
  isOpen: boolean
  isDeleting?: boolean
  error?: unknown
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteGroupModal({
  groupName,
  isOpen,
  isDeleting = false,
  error,
  onCancel,
  onConfirm,
}: DeleteGroupModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-5" role="presentation">
      <div
        className="w-full max-w-lg border-2 border-black bg-white p-6 shadow-[8px_8px_0_#151515]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-group-dialog-title"
        aria-describedby="delete-group-dialog-description"
      >
        <h2 id="delete-group-dialog-title" className="text-2xl font-black uppercase">
          Excluir grupo?
        </h2>
        <p id="delete-group-dialog-description" className="mt-4 text-sm leading-6">
          O grupo <strong>{groupName}</strong>, seus participantes e suas restrições serão excluídos permanentemente.
        </p>

        {error !== undefined && error !== null && (
          <p className={`${formErrorMessage} mt-4 text-sm`} role="alert">
            {getErrorMessage(error, 'Não foi possível excluir o grupo.')}
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button className="gap-2" variant="secondary" disabled={isDeleting} onClick={onCancel}>
            <CancelIcon />
            Cancelar
          </Button>
          <Button className="gap-2" variant="danger" disabled={isDeleting} onClick={onConfirm}>
            <DeleteIcon />
            {isDeleting ? 'Excluindo...' : 'Excluir grupo'}
          </Button>
        </div>
      </div>
    </div>
  )
}
