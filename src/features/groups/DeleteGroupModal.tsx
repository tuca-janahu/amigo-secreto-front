import { Button } from '../../components/Button'
import { Dialog } from '../../components/Dialog'
import { CancelIcon, DeleteIcon } from '../../components/PixelIcons'

type DeleteGroupModalProps = {
  groupName: string
  isOpen: boolean
  isDeleting?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteGroupModal({
  groupName,
  isOpen,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteGroupModalProps) {
  return (
    <Dialog open={isOpen} onDismiss={() => { if (!isDeleting) onCancel() }}>
      <Dialog.Title>Excluir grupo?</Dialog.Title>
      <Dialog.Description>
        O grupo <strong>{groupName}</strong>, seus participantes e suas restrições serão excluídos permanentemente.
      </Dialog.Description>
      <Dialog.Actions>
        <Button className="w-full gap-2 sm:w-auto" variant="secondary" disabled={isDeleting} onClick={onCancel}>
          <CancelIcon />
          Cancelar
        </Button>
        <Button className="w-full gap-2 sm:w-auto" variant="danger" disabled={isDeleting} onClick={onConfirm} data-dialog-initial-focus>
          <DeleteIcon />
          {isDeleting ? 'Excluindo…' : 'Excluir grupo'}
        </Button>
      </Dialog.Actions>
    </Dialog>
  )
}
