import type { CalculatorInput, CleaningMethodKey, CleaningStep, MenuManagement } from '../../types'

interface Props {
  menu: MenuManagement
  input: CalculatorInput
  onChange: (changes: Partial<CalculatorInput>) => void
}

export function CleaningSection({ menu, input, onChange }: Props) {
  const update = (index: number, patch: Partial<CleaningStep>) => {
    const next = input.cleaningSteps.map((s, i) => i === index ? { ...s, ...patch } : s)
    onChange({ cleaningSteps: next })
  }

  return (
    <div className="card">
      <h3 className="section-title">
        <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">3</span>
        Cleaning (up to 3 steps)
      </h3>
      <p className="text-xs text-slate-500 mb-4">
        Leave a step as "No cleaning" if it's not used. After changing a method, reselect the device.
      </p>

      <div className="space-y-3">
        {input.cleaningSteps.map((step, i) => {
          const availableDevices = menu.cleaningDevices.filter(d => d.methodKey === step.methodKey)
          return (
            <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end bg-slate-50 rounded-lg p-3">
              <div className="md:col-span-2">
                <label className="label">Step {i + 1}</label>
                <div className="text-sm text-slate-700 py-2 font-medium">#{i + 1}</div>
              </div>
              <div className="md:col-span-5">
                <label className="label">Method</label>
                <select
                  className="input"
                  value={step.methodKey}
                  onChange={e => update(i, { methodKey: e.target.value as CleaningMethodKey, deviceId: null })}
                >
                  {menu.cleaningMethods.map(m => (
                    <option key={m.key} value={m.key}>{m.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-5">
                <label className="label">Device</label>
                <select
                  className="input"
                  disabled={step.methodKey === 'none'}
                  value={step.deviceId ?? ''}
                  onChange={e => update(i, { deviceId: e.target.value || null })}
                >
                  <option value="">— Select device —</option>
                  {availableDevices.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.powerKwhPerLoad} kWh / {d.weightKgPerLoad} kg)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
