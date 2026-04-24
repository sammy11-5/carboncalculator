import type { MenuManagement, RecyclingFactor } from '../../types'

interface Props {
  menu: MenuManagement
  onMenuChange: (m: MenuManagement) => void
}

export function AdminRecycling({ menu, onMenuChange }: Props) {
  const update = (materialId: string, patch: Partial<RecyclingFactor>) => {
    onMenuChange({
      ...menu,
      recyclingFactors: menu.recyclingFactors.map(r => r.materialId === materialId ? { ...r, ...patch } : r),
    })
  }

  const parseOrNull = (v: string): number | null => {
    if (v === '' || v === '-') return null
    const n = parseFloat(v)
    return isFinite(n) ? n : null
  }

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900 mb-1">Recycling factors</h3>
      <p className="text-xs text-slate-500 mb-4">
        Per-material recycling data: sorting energy, recycling process emissions and the credit for avoided primary material.
        Leave process and credit empty (—) for materials that cannot be recycled.
      </p>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>Material</th>
              <th>Sorting [kWh/kg]</th>
              <th>Process emissions [kg CO₂e/kg]</th>
              <th>Credit (avoided primary) [kg CO₂e/kg]</th>
              <th>Source</th>
              <th>Comment</th>
            </tr>
          </thead>
          <tbody>
            {menu.materials.map(m => {
              const r = menu.recyclingFactors.find(x => x.materialId === m.id)
              if (!r) return null
              return (
                <tr key={m.id}>
                  <td className="font-medium">{m.name}</td>
                  <td><input type="number" step="0.001" className="input !py-1 w-24" value={r.sortingKwhPerKg} onChange={e => update(m.id, { sortingKwhPerKg: parseFloat(e.target.value) || 0 })} /></td>
                  <td><input type="text" className="input !py-1 w-28" value={r.recyclingProcessKgCo2PerKg ?? ''} placeholder="—" onChange={e => update(m.id, { recyclingProcessKgCo2PerKg: parseOrNull(e.target.value) })} /></td>
                  <td><input type="text" className="input !py-1 w-28" value={r.creditAvoidedPrimaryKgCo2PerKg ?? ''} placeholder="—" onChange={e => update(m.id, { creditAvoidedPrimaryKgCo2PerKg: parseOrNull(e.target.value) })} /></td>
                  <td><input className="input !py-1" value={r.source ?? ''} onChange={e => update(m.id, { source: e.target.value })} /></td>
                  <td><input className="input !py-1" value={r.comment ?? ''} onChange={e => update(m.id, { comment: e.target.value })} /></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
