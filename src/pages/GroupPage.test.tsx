import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { groupsService } from '../services/groups'
import { invitationsService } from '../services/invitations'
import { participantsService } from '../services/participants'
import { restrictionsService } from '../services/restrictions'
import { sorteioService } from '../services/sorteio'
import { renderWithProviders } from '../test/render'
import { GroupPage } from './GroupPage'

afterEach(() => vi.restoreAllMocks())

function renderGroup(status: 'DRAFT' | 'SORTEADO') {
  vi.spyOn(groupsService, 'get').mockResolvedValue({ id: 'group-1', name: 'Família', status, createdAt: new Date().toISOString() })
  vi.spyOn(participantsService, 'list').mockResolvedValue([])
  vi.spyOn(restrictionsService, 'list').mockResolvedValue([])
  vi.spyOn(sorteioService, 'viability').mockResolvedValue({ viable: true })
  vi.spyOn(invitationsService, 'list').mockResolvedValue([])
  return renderWithProviders(<Routes><Route path="/dashboard/groups/:groupId" element={<GroupPage />} /></Routes>, '/dashboard/groups/group-1')
}

describe('GroupPage states', () => {
  it('allows editing in DRAFT and confirms the draw', async () => {
    const user = userEvent.setup()
    const draw = vi.spyOn(sorteioService, 'draw').mockResolvedValue({ id: 'group-1', name: 'Família', status: 'SORTEADO', createdAt: new Date().toISOString() })
    renderGroup('DRAFT')
    expect(await screen.findByRole('button', { name: 'Adicionar participante' })).toBeEnabled()
    await user.click(await screen.findByRole('button', { name: 'Realizar sorteio' }))
    expect(screen.getByRole('dialog')).toHaveTextContent('participantes e restrições serão bloqueados')
    await user.click(screen.getByRole('button', { name: 'Confirmar sorteio' }))
    expect(draw).toHaveBeenCalledWith('group-1')
  })

  it('blocks structural editing after the draw and shows invitations', async () => {
    renderGroup('SORTEADO')
    expect(await screen.findByRole('heading', { name: 'Status dos convites' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Adicionar participante' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Adicionar restrição' })).not.toBeInTheDocument()
  })
})
