import type { MenuManagement, TransportSettings } from '../../types'

interface Props {
  menu: MenuManagement
  onMenuChange: (m: MenuManagement) => void
}

export function AdminTransport({ menu, onMenuChange }: Props) {
  const s = menu.transport
  const update = (patch: Partial<TransportSettings>) =>
    onMenuChange({ ...menu, transport: { ...s, ...patch } })

  return (
    <div className="card">
      <h3 className="font-semibold text-slate-900 mb-1">Transport defaults</h3>
      <p className="text-xs text-slate-500 mb-4">
        Distances to MWI and HWI plants and the reference DHL emission factor.
        These defaults drive the MWI and HWI transportation calculations automatically;
        for the recycling scenario, transportation is entered per calculation (with DHL values).
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="label">Distance to MWI <span className="text-slate-400 font-normal">[km]</span></label>
          <input type="number" step="1" className="input" value={s.distanceMwiKm}
            onChange={e => update({ distanceMwiKm: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="label">Distance to HWI <span className="text-slate-400 font-normal">[km]</span></label>
          <input type="number" step="1" className="input" value={s.distanceHwiKm}
            onChange={e => update({ distanceHwiKm: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="label">DHL emission factor <span className="text-slate-400 font-normal">[gCO₂e/(t·km)]</span></label>
          <input type="number" step="0.01" className="input" value={s.dhlEmissionFactor}
            onChange={e => update({ dhlEmissionFactor: parseFloat(e.target.value) || 0 })} />
        </div>
        <div>
          <label className="label">Empty return trip <span className="text-slate-400 font-normal">[% of direct]</span></label>
          <input type="number" step="1" min={0} max={100} className="input" value={s.returnTripPct}
            onChange={e => update({ returnTripPct: parseFloat(e.target.value) || 0 })} />
        </div>
      </div>
    </div>
  )
}
