import { useState } from 'react'
import type { MenuManagement } from '../types'
import { saveMenu, resetMenu, authenticateAdmin, isAdminAuthenticated, logoutAdmin, setAdminPassword, download } from '../lib/store'
import { AdminMaterials } from '../components/admin/AdminMaterials'
import { AdminRecycling } from '../components/admin/AdminRecycling'
import { AdminIncineration } from '../components/admin/AdminIncineration'
import { AdminElectricity } from '../components/admin/AdminElectricity'
import { AdminCleaning } from '../components/admin/AdminCleaning'
import { AdminTransport } from '../components/admin/AdminTransport'

type AdminTab = 'materials' | 'recycling' | 'incineration' | 'electricity' | 'cleaning' | 'transport' | 'data'

interface Props {
  menu: MenuManagement
  onMenuChange: (menu: MenuManagement) => void
}

const tabs: Array<{ key: AdminTab; label: string }> = [
  { key: 'materials', label: 'Materials' },
  { key: 'recycling', label: 'Recycling factors' },
  { key: 'incineration', label: 'Incineration' },
  { key: 'electricity', label: 'Electricity mix' },
  { key: 'cleaning', label: 'Cleaning methods & devices' },
  { key: 'transport', label: 'Transport' },
  { key: 'data', label: 'Import / Export / Reset' },
]

export function AdminPage({ menu, onMenuChange }: Props) {
  const [authed, setAuthed] = useState(isAdminAuthenticated())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [tab, setTab] = useState<AdminTab>('materials')

  const updateMenu = (next: MenuManagement) => {
    saveMenu(next)
    onMenuChange(next)
  }

  if (!authed) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="card">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Admin access</h2>
          <p className="text-sm text-slate-600 mb-4">
            The Menu Management area is password-protected. Default password: <code className="bg-slate-100 rounded px-1">admin</code> — change it after your first login.
          </p>
          <form
            onSubmit={e => {
              e.preventDefault()
              if (authenticateAdmin(password)) {
                setAuthed(true)
                setError('')
              } else {
                setError('Incorrect password.')
              }
            }}
          >
            <label className="label">Password</label>
            <input type="password" className="input mb-3" value={password} onChange={e => setPassword(e.target.value)} autoFocus />
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            <button type="submit" className="btn btn-primary w-full">Sign in</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Menu Management</h2>
          <p className="text-sm text-slate-600">Edit the background data used by the calculator. Changes are saved automatically in your browser.</p>
        </div>
        <button
          className="btn btn-secondary"
          onClick={() => {
            logoutAdmin()
            setAuthed(false)
          }}
        >
          Sign out
        </button>
      </div>

      <div className="flex flex-wrap gap-1 border-b border-slate-200">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === t.key ? 'border-brand-600 text-brand-700' : 'border-transparent text-slate-600 hover:text-slate-900'}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'materials' && <AdminMaterials menu={menu} onMenuChange={updateMenu} />}
      {tab === 'recycling' && <AdminRecycling menu={menu} onMenuChange={updateMenu} />}
      {tab === 'incineration' && <AdminIncineration menu={menu} onMenuChange={updateMenu} />}
      {tab === 'electricity' && <AdminElectricity menu={menu} onMenuChange={updateMenu} />}
      {tab === 'cleaning' && <AdminCleaning menu={menu} onMenuChange={updateMenu} />}
      {tab === 'transport' && <AdminTransport menu={menu} onMenuChange={updateMenu} />}
      {tab === 'data' && <AdminData menu={menu} onMenuChange={updateMenu} />}
    </div>
  )
}

function AdminData({ menu, onMenuChange }: { menu: MenuManagement; onMenuChange: (m: MenuManagement) => void }) {
  const [importError, setImportError] = useState('')
  const [pwd, setPwd] = useState('')
  const [pwdMsg, setPwdMsg] = useState('')

  const onExport = () => {
    download('bifa-menu.json', JSON.stringify(menu, null, 2))
  }

  const onImportFile = (file: File) => {
    file.text().then(text => {
      try {
        const parsed = JSON.parse(text) as MenuManagement
        if (!parsed.materials || !parsed.electricityMix) throw new Error('Invalid menu structure')
        onMenuChange(parsed)
        setImportError('')
      } catch (e) {
        setImportError(`Could not parse file: ${(e as Error).message}`)
      }
    })
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <h3 className="section-title">Export current menu data</h3>
        <p className="text-sm text-slate-600 mb-3">Download the current Menu Management data as JSON. Use this to back up your settings or share them.</p>
        <button className="btn btn-primary" onClick={onExport}>Download bifa-menu.json</button>
      </div>

      <div className="card">
        <h3 className="section-title">Import menu data</h3>
        <p className="text-sm text-slate-600 mb-3">Replace all Menu Management values with a previously exported JSON file. The currently running calculation will update automatically.</p>
        <input
          type="file"
          accept="application/json"
          onChange={e => e.target.files && e.target.files[0] && onImportFile(e.target.files[0])}
          className="block text-sm"
        />
        {importError && <p className="text-sm text-red-600 mt-2">{importError}</p>}
      </div>

      <div className="card">
        <h3 className="section-title">Reset to factory defaults</h3>
        <p className="text-sm text-slate-600 mb-3">Reverts all Menu Management values to the ones shipped with the app (as extracted from the original BIFA Excel).</p>
        <button
          className="btn btn-danger"
          onClick={() => {
            if (confirm('Really reset all Menu Management data to defaults? Your custom changes will be lost.')) {
              onMenuChange(resetMenu())
            }
          }}
        >
          Reset all menu data
        </button>
      </div>

      <div className="card">
        <h3 className="section-title">Change admin password</h3>
        <div className="flex gap-2">
          <input type="password" className="input max-w-xs" placeholder="New password" value={pwd} onChange={e => setPwd(e.target.value)} />
          <button className="btn btn-primary" onClick={() => {
            if (pwd.length < 3) { setPwdMsg('Password too short'); return }
            setAdminPassword(pwd)
            setPwdMsg('Password changed.')
            setPwd('')
          }}>Update</button>
        </div>
        {pwdMsg && <p className="text-sm text-slate-600 mt-2">{pwdMsg}</p>}
      </div>
    </div>
  )
}
