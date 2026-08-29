import { useState, type FormEvent } from 'react'
import { FORMAT_LABELS, type TournamentFormat } from './types'

export type TournamentFormValues = {
  name: string
  format: TournamentFormat
  scheduledAt: string // datetime-local value
  roundsCount: string
  topCutSize: string
}

function needsRounds(format: TournamentFormat) {
  return format === 'SWISS' || format === 'SWISS_TOP_CUT'
}

function needsTopCut(format: TournamentFormat) {
  return format === 'SWISS_TOP_CUT'
}

export function TournamentForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues: TournamentFormValues
  submitLabel: string
  onSubmit: (values: TournamentFormValues) => Promise<void>
}) {
  const [values, setValues] = useState(initialValues)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const set = <K extends keyof TournamentFormValues>(key: K, value: TournamentFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: value }))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setError(null)

    if (needsRounds(values.format) && !values.roundsCount) {
      setError('Número de rodadas é obrigatório para este formato')
      return
    }
    if (needsTopCut(values.format) && !values.topCutSize) {
      setError('Tamanho do top cut é obrigatório para este formato')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível salvar o torneio')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label className="mb-1 block text-xs text-gray-500">Nome</label>
        <input
          type="text"
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          required
          minLength={3}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Formato</label>
        <select
          value={values.format}
          onChange={(e) => set('format', e.target.value as TournamentFormat)}
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        >
          {Object.entries(FORMAT_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-xs text-gray-500">Data/hora</label>
        <input
          type="datetime-local"
          value={values.scheduledAt}
          onChange={(e) => set('scheduledAt', e.target.value)}
          required
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
        />
      </div>
      {needsRounds(values.format) && (
        <div>
          <label className="mb-1 block text-xs text-gray-500">Número de rodadas</label>
          <input
            type="number"
            min={1}
            value={values.roundsCount}
            onChange={(e) => set('roundsCount', e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}
      {needsTopCut(values.format) && (
        <div>
          <label className="mb-1 block text-xs text-gray-500">Tamanho do top cut</label>
          <input
            type="number"
            min={2}
            value={values.topCutSize}
            onChange={(e) => set('topCutSize', e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded bg-gray-900 py-2 text-sm text-white disabled:opacity-50"
      >
        {submitLabel}
      </button>
    </form>
  )
}
