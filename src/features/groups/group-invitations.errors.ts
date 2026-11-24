import { ApiError } from '../../lib/http'

export function invitationErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 429) return 'Muitas tentativas. Aguarde um pouco antes de tentar novamente.'
    if (error.status === 401) return 'Sua sessão expirou. Entre novamente para participar.'
    switch (error.code) {
      case 'INVITATION_NOT_FOUND': return 'Este convite está indisponível. Peça outro link ao organizador.'
      case 'INVITATION_CLOSED': return 'As inscrições para este grupo foram encerradas.'
      case 'PARTICIPATION_ALREADY_CLAIMED': return 'Este cadastro já está vinculado a outra conta. Entre em contato com o organizador.'
    }
  }
  return 'Não foi possível concluir a solicitação. Verifique sua conexão e tente novamente.'
}

export function isInvitationUnavailable(error: unknown): boolean {
  return error instanceof ApiError && ['INVITATION_NOT_FOUND', 'INVITATION_CLOSED', 'PARTICIPATION_ALREADY_CLAIMED'].includes(error.code ?? '')
}
