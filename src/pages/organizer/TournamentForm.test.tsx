import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { TournamentForm, type TournamentFormValues } from './TournamentForm'

const EMPTY_FORM: TournamentFormValues = {
  name: 'Weekly #1',
  format: 'SWISS',
  scheduledAt: '2026-09-01T20:00',
  roundsCount: '',
  topCutSize: '',
}

describe('TournamentForm', () => {
  it('shows the roundsCount field for SWISS_TOP_CUT and the topCutSize field too', () => {
    render(
      <TournamentForm
        initialValues={{ ...EMPTY_FORM, format: 'SWISS_TOP_CUT' }}
        submitLabel="Criar"
        onSubmit={vi.fn()}
      />,
    )

    expect(screen.getByText('Número de rodadas')).toBeInTheDocument()
    expect(screen.getByText('Tamanho do top cut')).toBeInTheDocument()
  })

  it('hides rounds/top-cut fields for SINGLE_ELIM', () => {
    render(
      <TournamentForm initialValues={{ ...EMPTY_FORM, format: 'SINGLE_ELIM' }} submitLabel="Criar" onSubmit={vi.fn()} />,
    )

    expect(screen.queryByText('Número de rodadas')).not.toBeInTheDocument()
    expect(screen.queryByText('Tamanho do top cut')).not.toBeInTheDocument()
  })

  it('blocks submit when SWISS is missing roundsCount', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TournamentForm initialValues={EMPTY_FORM} submitLabel="Criar" onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    expect(await screen.findByText('Número de rodadas é obrigatório para este formato')).toBeInTheDocument()
    expect(onSubmit).not.toHaveBeenCalled()
  })

  it('submits once required fields are filled', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)
    render(<TournamentForm initialValues={{ ...EMPTY_FORM, roundsCount: '4' }} submitLabel="Criar" onSubmit={onSubmit} />)

    fireEvent.click(screen.getByRole('button', { name: 'Criar' }))

    expect(onSubmit).toHaveBeenCalled()
  })
})
