import { useMemo } from 'react'
import type { CalculatorInput, MenuManagement } from '../types'
import { calculate } from '../lib/calculator'
import { ProductSection } from '../components/calculator/ProductSection'
import { MaterialsSection } from '../components/calculator/MaterialsSection'
import { CleaningSection } from '../components/calculator/CleaningSection'
import { TransportSection } from '../components/calculator/TransportSection'
import { ResultsSection } from '../components/calculator/ResultsSection'
import { download } from '../lib/store'
import { exampleInput } from '../lib/store'

interface Props {
  menu: MenuManagement
  input: CalculatorInput
  onInputChange: (input: CalculatorInput) => void
}

export function CalculatorPage({ menu, input, onInputChange }: Props) {
  const result = useMemo(() => calculate(input, menu), [input, menu])

  const patch = (changes: Partial<CalculatorInput>) => onInputChange({ ...input, ...changes })

  const loadExample = () => onInputChange(exampleInput(menu))
  const clear = () => onInputChange({
    ...input,
    productName: '',
    productWeightKg: 0,
    composition: input.composition.map(c => ({ ...c, weightShare: 0, recyclingShare: 0 })),
  })
  const exportJson = () => {
    download('bifa-calculation.json', JSON.stringify({ input, result }, null, 2))
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Calculate climate impact</h2>
          <p className="text-sm text-slate-600">Fill in the product and scenario details. Results update in real time.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn btn-secondary" onClick={loadExample}>Load example (BD-Spain)</button>
          <button className="btn btn-secondary" onClick={clear}>Clear inputs</button>
          <button className="btn btn-primary" onClick={exportJson}>Export JSON</button>
        </div>
      </div>

      {result.warnings.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <p className="text-sm font-medium text-amber-900 mb-1">Please review the following:</p>
          <ul className="text-sm text-amber-800 list-disc pl-5 space-y-0.5">
            {result.warnings.map((w, i) => <li key={i}>{w}</li>)}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <ProductSection menu={menu} input={input} onChange={patch} />
          <MaterialsSection menu={menu} input={input} onChange={patch} />
          <CleaningSection menu={menu} input={input} onChange={patch} />
          <TransportSection input={input} onChange={patch} />
        </div>
        <div className="lg:col-span-1">
          <div className="sticky top-20">
            <ResultsSection result={result} />
          </div>
        </div>
      </div>
    </div>
  )
}
