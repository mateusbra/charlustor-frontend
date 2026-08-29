import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { DeckSubmitForm } from './DeckSubmitForm'
import { AuthProvider } from '../auth/AuthContext'
import * as api from '../auth/api'

vi.mock('../auth/api', async () => {
  const actual = await vi.importActual<typeof api>('../auth/api')
  return { ...actual, apiRequest: vi.fn() }
})

function renderForm() {
  vi.mocked(api.apiRequest).mockImplementation((path: string) => {
    if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
    return Promise.resolve(undefined)
  })

  return render(
    <MemoryRouter>
      <AuthProvider>
        <DeckSubmitForm participantId="part-1" onSubmitted={vi.fn()} />
      </AuthProvider>
    </MemoryRouter>,
  )
}

function makeFile(name: string) {
  return new File(['fake-image-bytes'], name, { type: 'image/png' })
}

describe('DeckSubmitForm', () => {
  beforeEach(() => {
    vi.mocked(api.apiRequest).mockReset()
  })

  it('blocks submit until both images are provided', async () => {
    renderForm()
    fireEvent.click(screen.getByRole('button', { name: 'Enviar deck' }))

    expect(
      await screen.findByText('Envie as duas imagens (deck principal+extra e side deck)'),
    ).toBeInTheDocument()
  })

  it('submits a PUT request with both files once provided', async () => {
    vi.mocked(api.apiRequest).mockImplementation((path: string) => {
      if (path === '/auth/refresh') return Promise.reject(new api.ApiError(401, 'no session'))
      if (path === '/participants/part-1/deck') {
        return Promise.resolve({
          id: 'deck-1',
          validationStatus: 'PENDING',
          decodedCards: { main: [], extra: [], side: [] },
        })
      }
      return Promise.resolve(undefined)
    })

    render(
      <MemoryRouter>
        <AuthProvider>
          <DeckSubmitForm participantId="part-1" onSubmitted={vi.fn()} />
        </AuthProvider>
      </MemoryRouter>,
    )

    const [mainInput, sideInput] = screen.getAllByDisplayValue('') as HTMLInputElement[]
    fireEvent.change(mainInput, { target: { files: [makeFile('main.png')] } })
    fireEvent.change(sideInput, { target: { files: [makeFile('side.png')] } })
    fireEvent.click(screen.getByRole('button', { name: 'Enviar deck' }))

    await waitFor(() =>
      expect(api.apiRequest).toHaveBeenCalledWith(
        '/participants/part-1/deck',
        expect.objectContaining({ method: 'PUT' }),
      ),
    )
  })
})
