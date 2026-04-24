import type { CalculatorInput, TransportRouteSection } from '../../types'

interface Props {
  input: CalculatorInput
  onChange: (changes: Partial<CalculatorInput>) => void
}

export function TransportSection({ input, onChange }: Props) {
  const { transport } = input
  const productsPerBox = transport.boxEmptyWeightKg > 0 && input.productWeightKg > 0
    ? (transport.totalTransportWeightKg - transport.boxEmptyWeightKg) / input.productWeightKg
    : 0

  const patchTransport = (patch: Partial<typeof transport>) =>
    onChange({ transport: { ...transport, ...patch } })

  const updateSection = (index: number, patch: Partial<TransportRouteSection>) => {
    const sections = transport.sections.map((s, i) => i === index ? { ...s, ...patch } : s)
    patchTransport({ sections })
  }

  return (
    <div className="card">
      <h3 className="section-title">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">4</span>
        Transportation (for recycling scenario)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        MWI and HWI transportation is calculated automatically using the DHL factor from Menu Management.
        For the recycling scenario, enter the transport box setup and DHL Carbon Calculator values per route section.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <div>
          <label className="label">Empty box weight (kg)</label>
          <input
            type="number" step="0.01" min={0}
            className="input"
            value={transport.boxEmptyWeightKg || ''}
            onChange={e => patchTransport({ boxEmptyWeightKg: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="label">Total transport weight (kg)</label>
          <input
            type="number" step="0.01" min={0}
            className="input"
            value={transport.totalTransportWeightKg || ''}
            onChange={e => patchTransport({ totalTransportWeightKg: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="label">Products per box</label>
          <div className="input bg-slate-50 text-slate-600 tabular-nums">{productsPerBox > 0 ? productsPerBox.toFixed(0) : '—'}</div>
        </div>
        <div>
          <label className="label">Return trip (empty, %)</label>
          <input
            type="number" step="1" min={0} max={100}
            className="input"
            value={transport.returnTripPct}
            onChange={e => patchTransport({ returnTripPct: parseFloat(e.target.value) || 0 })}
          />
        </div>
      </div>

      <div className="space-y-3">
        {transport.sections.map((s, i) => (
          <div key={i} className="bg-slate-50 rounded-lg p-3">
            <div className="text-xs font-medium text-slate-700 mb-2">Route section {i + 1}</div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="label">From</label>
                <input type="text" className="input" value={s.startCity ?? ''}
                  onChange={e => updateSection(i, { startCity: e.target.value })} />
              </div>
              <div>
                <label className="label">To</label>
                <input type="text" className="input" value={s.endCity ?? ''}
                  onChange={e => updateSection(i, { endCity: e.target.value })} />
              </div>
              <div>
                <label className="label">Distance (km)</label>
                <input type="number" min={0} className="input" value={s.distanceKm || ''}
                  onChange={e => updateSection(i, { distanceKm: parseFloat(e.target.value) || 0 })} />
              </div>
              <div>
                <label className="label">DHL CO₂ (kg WtW)</label>
                <input type="number" step="0.01" min={0} className="input" value={s.co2Wtw || ''}
                  onChange={e => updateSection(i, { co2Wtw: parseFloat(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
