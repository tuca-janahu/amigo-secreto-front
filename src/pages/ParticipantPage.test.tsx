import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { messagesService } from '../services/messages'
import { participantAccessService } from '../services/participant-access'
import { renderWithProviders } from '../test/render'
import { ParticipantPage } from './ParticipantPage'

afterEach(() => vi.restoreAllMocks())

describe('ParticipantPage', () => {
  it('reveals, hides, reviews and posts to the anonymous wall', async () => {
    const user = userEvent.setup()
    vi.spyOn(participantAccessService, 'get').mockResolvedValue({ participant: { name: 'Lucas' }, group: { id: 'g1', name: 'Família' }, revealed: false })
    const reveal = vi.spyOn(participantAccessService, 'reveal').mockResolvedValue({ result: { name: 'Maria' }, revealedAt: new Date().toISOString() })
    vi.spyOn(messagesService, 'list').mockResolvedValue([])
    const create = vi.spyOn(messagesService, 'create').mockResolvedValue({ id: 'm1', content: 'Gosta de chocolate?', createdAt: new Date().toISOString() })
    renderWithProviders(<Routes><Route path="/s/:token" element={<ParticipantPage />} /></Routes>, '/s/private-token')
    expect(await screen.findByText('Seu amigo secreto ainda está escondido.')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Revelar' }))
    expect(await screen.findByText('Maria', {}, { timeout: 2500 })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Esconder novamente' }))
    expect(screen.queryByText('Maria')).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Rever' }))
    expect(await screen.findByText('Maria', {}, { timeout: 2500 })).toBeInTheDocument()
    expect(reveal).toHaveBeenCalledTimes(2)
    await user.type(screen.getByLabelText('Nova mensagem'), 'Gosta de chocolate?')
    await user.click(screen.getByRole('button', { name: 'Enviar anonimamente' }))
    expect(create).toHaveBeenCalledWith('private-token', 'Gosta de chocolate?')
  }, 8000)
})
