import type { CalculatorInput, MenuManagement, MaterialCompositionRow } from '../../types'

interface Props {
  menu: MenuManagement
  input: CalculatorInput
  onChange: (changes: Partial<CalculatorInput>) => void
}

export function MaterialsSection({ menu, input, onChange }: Props) {
  const updateRow = (materialId: string, patch: Partial<MaterialCompositionRow>) => {
    onChange({
      composition: input.composition.map(c => c.materialId === materialId ? { ...c, ...patch } : c),
    })
  }

  const shareSum = input.composition.reduce((s, r) => s + r.weightShare, 0)
  const shareOk = Math.abs(shareSum - 1) < 0.001 || shareSum === 0

  return (
    <div className="card">
      <h3 className="section-title">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">2</span>
        Material composition
      </h3>

      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Material</th>
              <th>Weight share [%]</th>
              <th>Material weight [kg]</th>
              <th>Recycling share [%]</th>
            </tr>
          </thead>
          <tbody>
            {menu.materials.map(m => {
              const row = input.composition.find(c => c.materialId === m.id)
              if (!row) return null
              const weight = row.weightShare * input.productWeightKg
              return (
                <tr key={m.id}>
                  <td className="font-medium">{m.name}</td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      max={100}
                      className="input !py-1 w-28"
                      value={row.weightShare ? (row.weightShare * 100).toString() : ''}
                      onChange={e => {
                        const v = parseFloat(e.target.value)
                        updateRow(m.id, { weightShare: isFinite(v) ? v / 100 : 0 })
                      }}
                    />
                  </td>
                  <td className="text-slate-600 tabular-nums">{weight > 0 ? weight.toFixed(6) : '—'}</td>
                  <td>
                    <input
                      type="number"
                      step="1"
                      min={0}
                      max={100}
                      className="input !py-1 w-28"
                      value={row.recyclingShare ? (row.recyclingShare * 100).toString() : ''}
                      onChange={e => {
                        const v = parseFloat(e.target.value)
                        updateRow(m.id, { recyclingShare: isFinite(v) ? v / 100 : 0 })
                      }}
                    />
                  </td>
                </tr>
              )
            })}
            <tr className="font-semibold">
              <td>Sum</td>
              <td className={shareOk ? '' : 'text-red-600'}>{(shareSum * 100).toFixed(1)}%</td>
              <td className="text-slate-600">{(shareSum * input.productWeightKg).toFixed(6)}</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>

      {!shareOk && (
        <p className="text-xs text-red-600 mt-2">
          Weight shares should sum to 100% (currently {(shareSum * 100).toFixed(1)}%).
        </p>
      )}
    </div>
  )
}
