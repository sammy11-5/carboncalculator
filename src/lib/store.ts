// Persistence helpers: Menu Management data and last calculator inputs live in
// localStorage so users don't lose their work across reloads.

import type { CalculatorInput, MenuManagement } from '../types'
import { defaultMenu } from '../data/defaults'

const MENU_KEY = 'bifa:menu:v1'
const INPUT_KEY = 'bifa:input:v1'
const ADMIN_KEY = 'bifa:admin:v1'

export function loadMenu(): MenuManagement {
  try {
    const raw = localStorage.getItem(MENU_KEY)
    if (!raw) return defaultMenu
    const parsed = JSON.parse(raw) as MenuManagement
    return parsed
  } catch {
    return defaultMenu
  }
}

export function saveMenu(menu: MenuManagement): void {
  localStorage.setItem(MENU_KEY, JSON.stringify(menu))
}

export function resetMenu(): MenuManagement {
  localStorage.removeItem(MENU_KEY)
  return defaultMenu
}

export function loadInput(): CalculatorInput | null {
  try {
    const raw = localStorage.getItem(INPUT_KEY)
    if (!raw) return null
    return JSON.parse(raw) as CalculatorInput
  } catch {
    return null
  }
}

export function saveInput(input: CalculatorInput): void {
  localStorage.setItem(INPUT_KEY, JSON.stringify(input))
}

// Default password: "admin". Change via Admin → Settings.
const DEFAULT_ADMIN_HASH = 'admin'

export function isAdminAuthenticated(): boolean {
  return sessionStorage.getItem('bifa:admin:session') === '1'
}

export function authenticateAdmin(password: string): boolean {
  const stored = localStorage.getItem(ADMIN_KEY) ?? DEFAULT_ADMIN_HASH
  if (password === stored) {
    sessionStorage.setItem('bifa:admin:session', '1')
    return true
  }
  return false
}

export function logoutAdmin(): void {
  sessionStorage.removeItem('bifa:admin:session')
}

export function setAdminPassword(newPassword: string): void {
  localStorage.setItem(ADMIN_KEY, newPassword)
}

// Build an empty-ish default input based on the currently active menu.
export function defaultInput(menu: MenuManagement): CalculatorInput {
  return {
    productName: '',
    productWeightKg: 0,
    electricityMixId: '',
    composition: menu.materials.map(m => ({ materialId: m.id, weightShare: 0, recyclingShare: 0 })),
    cleaningSteps: [
      { methodKey: 'none', deviceId: null },
      { methodKey: 'none', deviceId: null },
      { methodKey: 'none', deviceId: null },
    ],
    transport: {
      boxEmptyWeightKg: 1,
      totalTransportWeightKg: 0,
      sections: [
        { startCity: '', endCity: '', distanceKm: 0, co2Wtw: 0 },
        { startCity: '', endCity: '', distanceKm: 0, co2Wtw: 0 },
      ],
      returnTripPct: 10,
    },
  }
}

export function exampleInput(menu: MenuManagement): CalculatorInput {
  // Pre-filled BD-Spain example from the original Excel to let users verify the
  // calculator produces sensible numbers on first load.
  const input = defaultInput(menu)
  input.productName = 'BD-Spain'
  input.productWeightKg = 0.00736
  input.electricityMixId = 'EU_ES'
  input.composition = input.composition.map(r => {
    if (r.materialId === 'PP') return { ...r, weightShare: 0.88, recyclingShare: 0.95 }
    if (r.materialId === 'NON_REC') return { ...r, weightShare: 0.12, recyclingShare: 0 }
    return r
  })
  input.cleaningSteps[0] = { methodKey: 'autoclave', deviceId: 'es_stericycle' }
  input.transport = {
    boxEmptyWeightKg: 1,
    totalTransportWeightKg: 12.04,
    sections: [
      { startCity: 'Barcelona', endCity: 'Madrid', distanceKm: 605, co2Wtw: 0.58 },
      { startCity: 'Freiburg', endCity: 'Stuttgart', distanceKm: 0, co2Wtw: 0 },
    ],
    returnTripPct: 10,
  }
  return input
}

export function download(filename: string, content: string, mime = 'application/json') {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
