import type { CalculatorInput, MenuManagement } from '../../types'

interface Props {
  menu: MenuManagement
  input: CalculatorInput
  onChange: (changes: Partial<CalculatorInput>) => void
}

export function ProductSection({ menu, input, onChange }: Props) {
  const grouped = { EUROPE: [] as typeof menu.electricityMix, USA: [] as typeof menu.electricityMix }
  menu.electricityMix.forEach(e => grouped[e.region].push(e))

  return (
    <div className="card">
      <h3 className="section-title">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">1</span>
        Product specification
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="label">Product designation</label>
          <input
            type="text"
            className="input"
            placeholder="e.g. BD-Spain"
            value={input.productName}
            onChange={e => onChange({ productName: e.target.value })}
          />
        </div>
        <div>
          <label className="label">Product weight (kg)</label>
          <input
            type="number"
            step="0.00001"
            min={0}
            className="input"
            value={input.productWeightKg || ''}
            onChange={e => onChange({ productWeightKg: parseFloat(e.target.value) || 0 })}
          />
        </div>
        <div>
          <label className="label">Country of disposal</label>
          <select
            className="input"
            value={input.electricityMixId}
            onChange={e => onChange({ electricityMixId: e.target.value })}
          >
            <option value="">— Select a country —</option>
            <optgroup label="Europe">
              {grouped.EUROPE.map(e => (
                <option key={e.id} value={e.id}>{e.country} ({e.emissionFactor} gCO₂e/kWh)</option>
              ))}
            </optgroup>
            <optgroup label="USA">
              {grouped.USA.map(e => (
                <option key={e.id} value={e.id}>{e.country} ({e.emissionFactor} gCO₂e/kWh)</option>
              ))}
            </optgroup>
          </select>
        </div>
      </div>
    </div>
  )
}
