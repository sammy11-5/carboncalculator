import type { CleaningDevice, CleaningMethod, CleaningMethodKey, MenuManagement } from '../../types'

interface Props {
  menu: MenuManagement
  onMenuChange: (m: MenuManagement) => void
}

export function AdminCleaning({ menu, onMenuChange }: Props) {
  const updateMethod = (key: CleaningMethodKey, patch: Partial<CleaningMethod>) => {
    onMenuChange({
      ...menu,
      cleaningMethods: menu.cleaningMethods.map(m => m.key === key ? { ...m, ...patch } : m),
    })
  }

  const updateDevice = (id: string, patch: Partial<CleaningDevice>) => {
    onMenuChange({
      ...menu,
      cleaningDevices: menu.cleaningDevices.map(d => d.id === id ? { ...d, ...patch } : d),
    })
  }

  const addDevice = () => {
    const id = `DEV_${Date.now()}`
    onMenuChange({
      ...menu,
      cleaningDevices: [...menu.cleaningDevices, { id, methodKey: 'others', name: 'New device', powerKwhPerLoad: 0, heatKwhPerLoad: 0, weightKgPerLoad: 1 }],
    })
  }

  const removeDevice = (id: string) => {
    if (!confirm('Remove this device?')) return
    onMenuChange({
      ...menu,
      cleaningDevices: menu.cleaningDevices.filter(d => d.id !== id),
    })
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-1">Cleaning methods</h3>
        <p className="text-xs text-slate-500 mb-4">Rename method labels shown in the calculator. Method keys are technical identifiers and cannot be changed.</p>
        <div className="space-y-2">
          {menu.cleaningMethods.map(m => (
            <div key={m.key} className="flex items-center gap-3">
              <code className="text-xs bg-slate-100 rounded px-2 py-1 w-24 text-slate-600">{m.key}</code>
              <input className="input flex-1" value={m.label} onChange={e => updateMethod(m.key, { label: e.target.value })} />
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Cleaning devices</h3>
            <p className="text-xs text-slate-500">Power and heat consumption per wash load, and product capacity per load.</p>
          </div>
          <button className="btn btn-primary" onClick={addDevice}>+ Add device</button>
        </div>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Method</th>
                <th>Device name</th>
                <th>Power [kWh/load]</th>
                <th>Heat [kWh/load]</th>
                <th>Weight / load [kg]</th>
                <th>Source</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {menu.cleaningDevices.map(d => (
                <tr key={d.id}>
                  <td>
                    <select className="input !py-1" value={d.methodKey} onChange={e => updateDevice(d.id, { methodKey: e.target.value as CleaningMethodKey })}>
                      {menu.cleaningMethods.filter(m => m.key !== 'none').map(m => (
                        <option key={m.key} value={m.key}>{m.label}</option>
                      ))}
                    </select>
                  </td>
                  <td><input className="input !py-1" value={d.name} onChange={e => updateDevice(d.id, { name: e.target.value })} /></td>
                  <td><input type="number" step="0.1" className="input !py-1 w-24" value={d.powerKwhPerLoad} onChange={e => updateDevice(d.id, { powerKwhPerLoad: parseFloat(e.target.value) || 0 })} /></td>
                  <td><input type="number" step="0.1" className="input !py-1 w-24" value={d.heatKwhPerLoad} onChange={e => updateDevice(d.id, { heatKwhPerLoad: parseFloat(e.target.value) || 0 })} /></td>
                  <td><input type="number" step="0.01" className="input !py-1 w-24" value={d.weightKgPerLoad} onChange={e => updateDevice(d.id, { weightKgPerLoad: parseFloat(e.target.value) || 0 })} /></td>
                  <td><input className="input !py-1" value={d.source ?? ''} onChange={e => updateDevice(d.id, { source: e.target.value })} /></td>
                  <td><button className="text-red-600 text-xs hover:underline" onClick={() => removeDevice(d.id)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
