import type { IncinerationSettings, MenuManagement } from '../../types'

interface Props {
  menu: MenuManagement
  onMenuChange: (m: MenuManagement) => void
}

export function AdminIncineration({ menu, onMenuChange }: Props) {
  const s = menu.incineration
  const update = (patch: Partial<IncinerationSettings>) =>
    onMenuChange({ ...menu, incineration: { ...s, ...patch } })

  const field = (label: string, value: number, key: keyof IncinerationSettings, unit: string, step = 0.01) => (
    <div>
      <label className="label">{label} <span className="text-slate-400 font-normal">[{unit}]</span></label>
      <input type="number" step={step} className="input" value={value}
        onChange={e => update({ [key]: parseFloat(e.target.value) || 0 } as Partial<IncinerationSettings>)} />
    </div>
  )

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-1">Municipal Waste Incineration (MWI)</h3>
        <p className="text-xs text-slate-500 mb-4">Net efficiencies and emission factors for waste-to-energy plants.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {field('Electricity efficiency EU', s.mwiEffElectricityEU, 'mwiEffElectricityEU', '%')}
          {field('Electricity efficiency USA', s.mwiEffElectricityUSA, 'mwiEffElectricityUSA', '%')}
          {field('Heat efficiency EU', s.mwiEffHeatEU, 'mwiEffHeatEU', '%')}
          {field('Heat efficiency USA', s.mwiEffHeatUSA, 'mwiEffHeatUSA', '%')}
          {field('Heat emission factor', s.mwiHeatEmissionFactor, 'mwiHeatEmissionFactor', 'gCO₂e/kWh')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {field('Steel recovery from slag', s.metalRecoverySteelPct, 'metalRecoverySteelPct', '%', 1)}
          {field('Aluminium recovery from slag', s.metalRecoveryAluminiumPct, 'metalRecoveryAluminiumPct', '%', 1)}
        </div>
      </div>

      <div className="card">
        <h3 className="font-semibold text-slate-900 mb-1">Hazardous Waste Incineration (HWI)</h3>
        <p className="text-xs text-slate-500 mb-4">Efficiency and auxiliary-firing parameters.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field('Electricity efficiency EU', s.hwiEffElectricityEU, 'hwiEffElectricityEU', '%')}
          {field('Electricity efficiency USA', s.hwiEffElectricityUSA, 'hwiEffElectricityUSA', '%')}
          {field('Light fuel oil heating value', s.lightFuelOilHeatingValue, 'lightFuelOilHeatingValue', 'MJ/kg')}
          {field('Light fuel oil emission factor', s.lightFuelOilEmissionFactor, 'lightFuelOilEmissionFactor', 'kg CO₂e/kg', 0.001)}
        </div>
      </div>
    </div>
  )
}
