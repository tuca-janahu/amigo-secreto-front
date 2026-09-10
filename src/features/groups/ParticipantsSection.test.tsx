import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { participantsService } from '../../services/participants'
import { restrictionsService } from '../../services/restrictions'
import { sorteioService } from '../../services/sorteio'
import { renderWithProviders } from '../../test/render'
import { ParticipantsSection } from './ParticipantsSection'

afterEach(() => vi.restoreAllMocks())

describe('ParticipantsSection', () => {
  it('adds a participant and imports pasted rows', async () => {
    const user = userEvent.setup()
    vi.spyOn(participantsService, 'list').mockResolvedValue([])
    const create = vi.spyOn(participantsService, 'create').mockResolvedValue({ id: 'p1', name: 'Lucas', email: 'lucas@email.com', createdAt: new Date().toISOString() })
    const importPaste = vi.spyOn(participantsService, 'import').mockResolvedValue({ imported: 2, participants: [] })
    vi.spyOn(restrictionsService, 'list').mockResolvedValue([])
    vi.spyOn(sorteioService, 'viability').mockResolvedValue({ viable: false, reason: 'NOT_ENOUGH_PARTICIPANTS' })
    renderWithProviders(<ParticipantsSection groupId="group-1" editable />)
    await screen.findByText('Nenhum participante adicionado.')
    await user.type(screen.getByLabelText('Nome'), 'Lucas')
    await user.type(screen.getByLabelText('E-mail'), 'lucas@email.com')
    await user.click(screen.getByRole('button', { name: 'Adicionar participante' }))
    expect(create).toHaveBeenCalledWith('group-1', { name: 'Lucas', email: 'lucas@email.com' })
    fireEvent.change(screen.getByRole('textbox', { name: 'Participantes' }), { target: { value: 'Lucas\tlucas@email.com\nMaria\tmaria@email.com' } })
    await user.click(screen.getByRole('button', { name: 'Importar participantes' }))
    expect(importPaste).toHaveBeenCalledWith('group-1', 'Lucas\tlucas@email.com\nMaria\tmaria@email.com')
    expect(await screen.findByText('2 participantes importados.')).toBeInTheDocument()
  })
})
