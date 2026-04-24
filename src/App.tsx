import { useCallback, useEffect, useMemo, useState } from 'react'
import type { CalculatorInput, MenuManagement } from './types'
import { loadMenu, loadInput, saveInput, exampleInput } from './lib/store'
import { CalculatorPage } from './pages/CalculatorPage'
import { AdminPage } from './pages/AdminPage'

type View = 'calculator' | 'admin'

export default function App() {
  const [menu, setMenu] = useState<MenuManagement>(() => loadMenu())
  const [input, setInput] = useState<CalculatorInput>(() => loadInput() ?? exampleInput(loadMenu()))
  const [view, setView] = useState<View>('calculator')

  useEffect(() => {
    saveInput(input)
  }, [input])

  const onMenuChange = useCallback((m: MenuManagement) => {
    setMenu(m)
    // Ensure the current input's composition still references valid material IDs
    setInput(prev => ({
      ...prev,
      composition: m.materials.map(mat => {
        const existing = prev.composition.find(c => c.materialId === mat.id)
        return existing ?? { materialId: mat.id, weightShare: 0, recyclingShare: 0 }
      }),
    }))
  }, [])

  const year = useMemo(() => new Date().getFullYear(), [])

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-brand-600 text-white flex items-center justify-center font-bold text-lg">🌱</div>
            <div>
              <h1 className="text-lg font-semibold text-slate-900 leading-tight">BIFA CO<sub>2</sub> Calculator</h1>
              <p className="text-xs text-slate-500 leading-tight">Life-cycle emissions for hypodermic products</p>
            </div>
          </div>
          <nav className="flex gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => setView('calculator')}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${view === 'calculator' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
              Calculator
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-4 py-1.5 text-sm rounded-md font-medium transition-colors ${view === 'admin' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-600 hover:text-slate-900'}`}>
              Menu Management
            </button>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {view === 'calculator' ? (
          <CalculatorPage menu={menu} input={input} onInputChange={setInput} />
        ) : (
          <AdminPage menu={menu} onMenuChange={onMenuChange} />
        )}
      </main>

      <footer className="border-t border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 text-xs text-slate-500 flex justify-between items-center">
          <span>Based on BIFA Umweltinstitut calculator © {year}</span>
          <span>All calculations performed locally in your browser</span>
        </div>
      </footer>
    </div>
  )
}
