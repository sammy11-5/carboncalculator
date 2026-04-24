import type { CalculatorResult, ScenarioTotal } from '../../types'
import { formatKgCo2e } from '../../lib/calculator'

interface Props {
  result: CalculatorResult
}

function ScenarioCard({ title, color, s }: { title: string; color: string; s: ScenarioTotal }) {
  const rows: Array<{ label: string; value: number; muted?: boolean }> = [
    { label: 'Disposal emissions', value: s.emissions },
    { label: 'Disposal benefits', value: s.benefits },
    ...(s.cleaning ? [{ label: 'Cleaning', value: s.cleaning }] : []),
    { label: 'Transportation', value: s.transportation },
  ]
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className={`inline-block w-2 h-2 rounded-full ${color}`} />
        <h4 className="font-semibold text-sm text-slate-900">{title}</h4>
      </div>
      <table className="w-full text-xs">
        <tbody>
          {rows.map(r => (
            <tr key={r.label}>
              <td className="py-0.5 text-slate-600">{r.label}</td>
              <td className={`py-0.5 text-right tabular-nums ${r.value < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
                {formatKgCo2e(r.value)}
              </td>
            </tr>
          ))}
          <tr className="border-t border-slate-200 font-semibold">
            <td className="pt-1.5 text-slate-900">Total / product</td>
            <td className={`pt-1.5 text-right tabular-nums ${s.total < 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
              {formatKgCo2e(s.total)}
            </td>
          </tr>
          <tr>
            <td className="text-slate-500">Total / kg product</td>
            <td className={`text-right tabular-nums ${s.totalPerKg < 0 ? 'text-emerald-700' : 'text-slate-700'}`}>
              {formatKgCo2e(s.totalPerKg, 3)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

export function ResultsSection({ result }: Props) {
  const savingsColor = (v: number) => v < 0 ? 'text-emerald-700' : 'text-red-700'
  return (
    <div className="card">
      <h3 className="section-title">
        <span className="w-6 h-6 rounded-full bg-brand-600 text-white flex items-center justify-center text-xs font-bold">✓</span>
        Results
      </h3>

      <div className="space-y-3 mb-4">
        <ScenarioCard title="Recycling" color="bg-emerald-500" s={result.recycling} />
        <ScenarioCard title="Incineration MWI" color="bg-amber-500" s={result.mwi} />
        <ScenarioCard title="Incineration HWI" color="bg-rose-500" s={result.hwi} />
      </div>

      <div className="border-t border-slate-200 pt-3">
        <h4 className="font-semibold text-sm text-slate-900 mb-2">Savings vs. incineration</h4>
        <p className="text-[10px] text-slate-500 mb-2 leading-tight">
          Negative value = recycling scenario has lower lifecycle CO₂ than the incineration scenario (climate benefit).
        </p>
        <table className="w-full text-xs">
          <tbody>
            <tr>
              <td className="py-0.5 text-slate-600">vs. MWI / product</td>
              <td className={`py-0.5 text-right tabular-nums font-medium ${savingsColor(result.savingsVsMwiPerProduct)}`}>
                {formatKgCo2e(result.savingsVsMwiPerProduct)}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 text-slate-600">vs. HWI / product</td>
              <td className={`py-0.5 text-right tabular-nums font-medium ${savingsColor(result.savingsVsHwiPerProduct)}`}>
                {formatKgCo2e(result.savingsVsHwiPerProduct)}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 text-slate-600">vs. MWI / kg</td>
              <td className={`py-0.5 text-right tabular-nums font-medium ${savingsColor(result.savingsVsMwiPerKg)}`}>
                {formatKgCo2e(result.savingsVsMwiPerKg, 3)}
              </td>
            </tr>
            <tr>
              <td className="py-0.5 text-slate-600">vs. HWI / kg</td>
              <td className={`py-0.5 text-right tabular-nums font-medium ${savingsColor(result.savingsVsHwiPerKg)}`}>
                {formatKgCo2e(result.savingsVsHwiPerKg, 3)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  )
}
