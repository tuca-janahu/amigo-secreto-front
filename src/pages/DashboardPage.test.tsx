import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Route, Routes } from 'react-router-dom'
import { authService } from '../services/auth'
import { groupsService } from '../services/groups'
import { renderWithProviders } from '../test/render'
import { DashboardPage } from './DashboardPage'

afterEach(() => vi.restoreAllMocks())

describe('DashboardPage', () => {
  it('renders the name returned by /auth/me', async () => {
    vi.spyOn(authService, 'me').mockResolvedValue({ id: 'user-1', name: 'Artur', email: 'artur@email.com' })
    vi.spyOn(groupsService, 'list').mockResolvedValue([])
    renderWithProviders(<DashboardPage />)
    expect(await screen.findByRole('heading', { name: 'Olá, Artur' })).toBeInTheDocument()
    expect(screen.getByText('Nenhum grupo ainda.')).toBeInTheDocument()
  })

  it('creates a group and opens it', async () => {
    const user = userEvent.setup()
    vi.spyOn(authService, 'me').mockResolvedValue({ id: 'user-1', name: 'Artur', email: 'artur@email.com' })
    vi.spyOn(groupsService, 'list').mockResolvedValue([])
    const create = vi.spyOn(groupsService, 'create').mockResolvedValue({ id: 'group-1', name: 'Família', status: 'DRAFT', createdAt: new Date().toISOString() })
    renderWithProviders(<Routes><Route path="/dashboard" element={<DashboardPage />} /><Route path="/dashboard/groups/:groupId" element={<p>Grupo aberto</p>} /></Routes>, '/dashboard')
    await user.click(await screen.findByRole('button', { name: /novo grupo/i }))
    await user.type(screen.getByLabelText('Nome do grupo'), 'Família')
    await user.click(screen.getByRole('button', { name: 'Criar grupo' }))
    expect(await screen.findByText('Grupo aberto')).toBeInTheDocument()
    expect(create).toHaveBeenCalledWith('Família')
  })
})
