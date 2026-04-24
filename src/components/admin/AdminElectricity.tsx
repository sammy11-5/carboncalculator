import type { ElectricityMixEntry, MenuManagement, Region } from '../../types'

interface Props {
  menu: MenuManagement
  onMenuChange: (m: MenuManagement) => void
}

export function AdminElectricity({ menu, onMenuChange }: Props) {
  const update = (id: string, patch: Partial<ElectricityMixEntry>) => {
    onMenuChange({
      ...menu,
      electricityMix: menu.electricityMix.map(e => e.id === id ? { ...e, ...patch } : e),
    })
  }

  const add = () => {
    const id = `MIX_${Date.now()}`
    onMenuChange({
      ...menu,
      electricityMix: [...menu.electricityMix, { id, region: 'EUROPE', country: 'New country', emissionFactor: 0 }],
    })
  }

  const remove = (id: string) => {
    if (!confirm('Remove this electricity-mix entry?')) return
    onMenuChange({
      ...menu,
      electricityMix: menu.electricityMix.filter(e => e.id !== id),
    })
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-slate-900">Electricity mix</h3>
          <p className="text-xs text-slate-500">Emission factors per country / US state.</p>
        </div>
        <button className="btn btn-primary" onClick={add}>+ Add entry</button>
      </div>
      <div className="overflow-x-auto">
        <table className="table-base">
          <thead>
            <tr>
              <th>ID</th>
              <th>Region</th>
              <th>Country / state</th>
              <th>Emission factor [gCO₂e/kWh]</th>
              <th>Source</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {menu.electricityMix.map(e => (
              <tr key={e.id}>
                <td className="font-mono text-xs text-slate-500">{e.id}</td>
                <td>
                  <select className="input !py-1" value={e.region} onChange={ev => update(e.id, { region: ev.target.value as Region })}>
                    <option value="EUROPE">Europe</option>
                    <option value="USA">USA</option>
                  </select>
                </td>
                <td><input className="input !py-1" value={e.country} onChange={ev => update(e.id, { country: ev.target.value })} /></td>
                <td><input type="number" step="1" className="input !py-1 w-24" value={e.emissionFactor} onChange={ev => update(e.id, { emissionFactor: parseFloat(ev.target.value) || 0 })} /></td>
                <td><input className="input !py-1" value={e.source ?? ''} onChange={ev => update(e.id, { source: ev.target.value })} /></td>
                <td><button className="text-red-600 text-xs hover:underline" onClick={() => remove(e.id)}>Remove</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
