import type { Material, MenuManagement } from '../../types'

interface Props {
  menu: MenuManagement
  onMenuChange: (m: MenuManagement) => void
}

export function AdminMaterials({ menu, onMenuChange }: Props) {
  const update = (id: string, patch: Partial<Material>) => {
    onMenuChange({
      ...menu,
      materials: menu.materials.map(m => m.id === id ? { ...m, ...patch } : m),
    })
  }

  const add = () => {
    const id = `MAT_${Date.now()}`
    onMenuChange({
      ...menu,
      materials: [...menu.materials, { id, name: 'New material', cTotal: 0, cFossilShare: 0, caloricValue: 0 }],
      recyclingFactors: [...menu.recyclingFactors, { materialId: id, sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: null, creditAvoidedPrimaryKgCo2PerKg: null }],
    })
  }

  const remove = (id: string) => {
    if (!confirm(`Remove material "${menu.materials.find(m => m.id === id)?.name}"?`)) return
    onMenuChange({
      ...menu,
      materials: menu.materials.filter(m => m.id !== id),
      recyclingFactors: menu.recyclingFactors.filter(r => r.materialId !== id),
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Materials</h3>
          <p className="text-xs text-slate-500">Carbon content, caloric value and source for every material used in the calculator.</p>
        </div>
        <button className="btn btn-primary" onClick={add}>+ Add material</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>C-total [kg C/kg]</th>
              <th>C-fossil share [0..1]</th>
              <th>Caloric value [MJ/kg]</th>
              <th>Source</th>
              <th>Comment</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {menu.materials.map(m => (
              <tr key={m.id}>
                <td className="font-mono text-xs text-slate-500">{m.id}</td>
                <td><input className="input !py-1" value={m.name} onChange={e => update(m.id, { name: e.target.value })} /></td>
                <td><input type="number" step="0.001" className="input !py-1 w-24" value={m.cTotal} onChange={e => update(m.id, { cTotal: parseFloat(e.target.value) || 0 })} /></td>
                <td><input type="number" step="0.01" min={0} max={1} className="input !py-1 w-24" value={m.cFossilShare} onChange={e => update(m.id, { cFossilShare: parseFloat(e.target.value) || 0 })} /></td>
                <td><input type="number" step="0.1" className="input !py-1 w-24" value={m.caloricValue} onChange={e => update(m.id, { caloricValue: parseFloat(e.target.value) || 0 })} /></td>
                <td><input className="input !py-1" value={m.source ?? ''} onChange={e => update(m.id, { source: e.target.value })} /></td>
                <td><input className="input !py-1" value={m.comment ?? ''} onChange={e => update(m.id, { comment: e.target.value })} /></td>
                <td><button className="text-red-600 text-xs hover:underline" onClick={() => remove(m.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
