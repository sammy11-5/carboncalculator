// Calculation engine — faithful re-implementation of the BIFA CO2 Calculator
// Excel workbook (sheets: CO2-Calculator, Secondary calculations, Menu management).
//
// Unit conventions:
//   - product weight: kg
//   - caloric values: MJ/kg
//   - emission factors electricity: gCO2e/kWh (converted internally to kg/kWh by /1000)
//   - heat emission factor: gCO2e/kWh
//   - emissions and credits: kg CO2e/kg material
//   - final results: kg CO2e per product or per kg of product

import type {
  CalculatorInput,
  CalculatorResult,
  MenuManagement,
  ScenarioTotal,
  Region,
} from '../types'

const MJ_TO_KWH = 1 / 3.6
const C_TO_CO2 = 44 / 12 // stoichiometric: burning 1 kg of carbon -> 44/12 kg CO2

interface Context {
  menu: MenuManagement
  electricityEF: number // gCO2e/kWh for selected country
  region: Region
  countryLabel: string
  warnings: string[]
}

function buildContext(menu: MenuManagement, input: CalculatorInput, warnings: string[]): Context | null {
  const mix = menu.electricityMix.find(m => m.id === input.electricityMixId)
  if (!mix) {
    warnings.push('Please select a country (electricity mix) for the calculation.')
    return null
  }
  return {
    menu,
    electricityEF: mix.emissionFactor,
    region: mix.region,
    countryLabel: mix.country,
    warnings,
  }
}

// ---------- MWI per-material (used by both the MWI scenario and the
// "non-recycled" portion of the recycling scenario) ----------

function mwiPerMaterial(
  materialId: string,
  weightKg: number,
  ctx: Context,
): { j: number; k: number } {
  const { menu, electricityEF, region } = ctx
  const s = menu.incineration
  const effElec = region === 'USA' ? s.mwiEffElectricityUSA : s.mwiEffElectricityEU
  const effHeat = region === 'USA' ? s.mwiEffHeatUSA : s.mwiEffHeatEU
  const mat = menu.materials.find(m => m.id === materialId)
  if (!mat) return { j: 0, k: 0 }

  const directKgCo2PerKg = mat.cTotal * mat.cFossilShare * C_TO_CO2
  const avoidedElec = -(electricityEF / 1000) * mat.caloricValue * (effElec / 100) * MJ_TO_KWH
  const avoidedHeat = -(s.mwiHeatEmissionFactor / 1000) * mat.caloricValue * (effHeat / 100) * MJ_TO_KWH

  let metalBenefit = 0
  if (materialId === 'AL' || materialId === 'FE') {
    const rec = menu.recyclingFactors.find(r => r.materialId === materialId)
    if (rec && rec.recyclingProcessKgCo2PerKg !== null && rec.creditAvoidedPrimaryKgCo2PerKg !== null) {
      const recyclingNet = rec.sortingKwhPerKg * electricityEF / 1000 + rec.recyclingProcessKgCo2PerKg + rec.creditAvoidedPrimaryKgCo2PerKg
      const recoveryPct = materialId === 'AL' ? s.metalRecoveryAluminiumPct : s.metalRecoverySteelPct
      metalBenefit = (recoveryPct / 100) * recyclingNet
    }
  }

  return {
    j: weightKg * directKgCo2PerKg,
    k: weightKg * (avoidedElec + avoidedHeat + metalBenefit),
  }
}

// ---------- HWI per-material ----------

function hwiPerMaterial(
  materialId: string,
  weightKg: number,
  ctx: Context,
): { j: number; k: number } {
  const { menu, electricityEF, region } = ctx
  const s = menu.incineration
  const effElec = region === 'USA' ? s.hwiEffElectricityUSA : s.hwiEffElectricityEU
  const mat = menu.materials.find(m => m.id === materialId)
  if (!mat) return { j: 0, k: 0 }

  const directKgCo2PerKg = mat.cTotal * mat.cFossilShare * C_TO_CO2
  const indirectKgCo2PerKg = mat.caloricValue > 23
    ? 0
    : (23 - mat.caloricValue) / s.lightFuelOilHeatingValue * s.lightFuelOilEmissionFactor
  const avoidedElecDirect = -(electricityEF / 1000) * mat.caloricValue * (effElec / 100) * MJ_TO_KWH
  const avoidedElecAux = mat.caloricValue > 23
    ? 0
    : -(electricityEF / 1000) * (23 - mat.caloricValue) * MJ_TO_KWH * (effElec / 100)

  return {
    j: weightKg * (directKgCo2PerKg + indirectKgCo2PerKg),
    k: weightKg * (avoidedElecDirect + avoidedElecAux),
  }
}

// ---------- Recycling scenario ----------
// Mirrors CO2-Calculator!B89 and B90 exactly:
//   * recycled share of each recyclable material goes to recycling
//   * non-recycled share of each recyclable material goes to MWI
//   * Non-Recyclables (materials with no recycling route) go 100% to MWI

function recyclingScenario(input: CalculatorInput, ctx: Context, cleaning: number, transport: number): ScenarioTotal {
  const { menu, electricityEF } = ctx
  let emissions = 0
  let benefits = 0

  for (const row of input.composition) {
    const weightKg = row.weightShare * input.productWeightKg
    if (weightKg <= 0) continue
    const rec = menu.recyclingFactors.find(r => r.materialId === row.materialId)
    const isRecyclable = !!rec && rec.recyclingProcessKgCo2PerKg !== null && rec.creditAvoidedPrimaryKgCo2PerKg !== null

    if (isRecyclable && rec) {
      const jRec = weightKg * (rec.sortingKwhPerKg * electricityEF / 1000 + (rec.recyclingProcessKgCo2PerKg as number))
      const kRec = weightKg * (rec.creditAvoidedPrimaryKgCo2PerKg as number)
      const shareRec = Math.max(0, Math.min(1, row.recyclingShare))

      emissions += shareRec * jRec
      benefits += shareRec * kRec

      // Non-recycled portion is incinerated in MWI
      if (shareRec < 1) {
        const mwi = mwiPerMaterial(row.materialId, weightKg, ctx)
        emissions += (1 - shareRec) * mwi.j
        benefits += (1 - shareRec) * mwi.k
      }
    } else {
      // Not recyclable → 100% to MWI
      const mwi = mwiPerMaterial(row.materialId, weightKg, ctx)
      emissions += mwi.j
      benefits += mwi.k
    }
  }

  const total = emissions + benefits + cleaning + transport
  return {
    emissions,
    benefits,
    cleaning,
    transportation: transport,
    total,
    totalPerKg: input.productWeightKg > 0 ? total / input.productWeightKg : 0,
  }
}

// ---------- MWI (Municipal Waste Incineration) ----------

function mwiScenario(input: CalculatorInput, ctx: Context, transport: number): ScenarioTotal {
  const { menu, electricityEF, region } = ctx
  const s = menu.incineration
  const effElec = region === 'USA' ? s.mwiEffElectricityUSA : s.mwiEffElectricityEU
  const effHeat = region === 'USA' ? s.mwiEffHeatUSA : s.mwiEffHeatEU

  let emissions = 0
  let benefits = 0

  for (const row of input.composition) {
    const weightKg = row.weightShare * input.productWeightKg
    const mat = menu.materials.find(m => m.id === row.materialId)
    if (!mat) continue

    // Direct emission: E21 = cTotal * cFossilShare * 44/12
    const directKgCo2PerKg = mat.cTotal * mat.cFossilShare * C_TO_CO2
    emissions += weightKg * directKgCo2PerKg

    // Benefits: avoided electricity, avoided heat, metal recycling
    // Avoided electricity: G21 = -electricityEF/1000 * caloric * effElec/100 / 3.6
    const avoidedElec = -(electricityEF / 1000) * mat.caloricValue * (effElec / 100) * MJ_TO_KWH
    // Avoided heat (only EU has non-zero default)
    const avoidedHeat = -(s.mwiHeatEmissionFactor / 1000) * mat.caloricValue * (effHeat / 100) * MJ_TO_KWH

    let metalRecycleBenefit = 0
    if (row.materialId === 'AL' || row.materialId === 'FE') {
      const rec = menu.recyclingFactors.find(r => r.materialId === row.materialId)
      if (rec && rec.recyclingProcessKgCo2PerKg !== null && rec.creditAvoidedPrimaryKgCo2PerKg !== null) {
        const recyclingNet = rec.sortingKwhPerKg * electricityEF / 1000 + rec.recyclingProcessKgCo2PerKg + rec.creditAvoidedPrimaryKgCo2PerKg
        const recoveryPct = row.materialId === 'AL' ? s.metalRecoveryAluminiumPct : s.metalRecoverySteelPct
        metalRecycleBenefit = (recoveryPct / 100) * recyclingNet
      }
    }

    const benefitPerKg = avoidedElec + avoidedHeat + metalRecycleBenefit
    benefits += weightKg * benefitPerKg
  }

  const total = emissions + benefits + transport
  return {
    emissions,
    benefits,
    cleaning: 0,
    transportation: transport,
    total,
    totalPerKg: input.productWeightKg > 0 ? total / input.productWeightKg : 0,
  }
}

// ---------- HWI (Hazardous Waste Incineration) ----------

function hwiScenario(input: CalculatorInput, ctx: Context, transport: number): ScenarioTotal {
  const { menu, electricityEF, region } = ctx
  const s = menu.incineration
  const effElec = region === 'USA' ? s.hwiEffElectricityUSA : s.hwiEffElectricityEU

  let emissions = 0
  let benefits = 0

  for (const row of input.composition) {
    const weightKg = row.weightShare * input.productWeightKg
    const mat = menu.materials.find(m => m.id === row.materialId)
    if (!mat) continue

    // Direct: same as MWI
    const directKgCo2PerKg = mat.cTotal * mat.cFossilShare * C_TO_CO2
    // Indirect (auxiliary firing): if caloric <= 23, burn light fuel oil to make up the delta
    const indirectKgCo2PerKg = mat.caloricValue > 23
      ? 0
      : (23 - mat.caloricValue) / s.lightFuelOilHeatingValue * s.lightFuelOilEmissionFactor
    emissions += weightKg * (directKgCo2PerKg + indirectKgCo2PerKg)

    // Benefits: electricity from direct caloric + electricity from auxiliary firing delta
    const avoidedElecDirect = -(electricityEF / 1000) * mat.caloricValue * (effElec / 100) * MJ_TO_KWH
    const avoidedElecAux = mat.caloricValue > 23
      ? 0
      : -(electricityEF / 1000) * (23 - mat.caloricValue) * MJ_TO_KWH * (effElec / 100)
    benefits += weightKg * (avoidedElecDirect + avoidedElecAux)
  }

  const total = emissions + benefits + transport
  return {
    emissions,
    benefits,
    cleaning: 0,
    transportation: transport,
    total,
    totalPerKg: input.productWeightKg > 0 ? total / input.productWeightKg : 0,
  }
}

// ---------- Cleaning ----------

function computeCleaning(input: CalculatorInput, ctx: Context): number {
  const { menu, electricityEF } = ctx
  const heatEF = menu.incineration.mwiHeatEmissionFactor // re-used as heat EF
  let total = 0

  for (const step of input.cleaningSteps) {
    if (step.methodKey === 'none') continue
    if (!step.deviceId) {
      ctx.warnings.push(`Cleaning step is set to a method but has no device selected.`)
      continue
    }
    const device = menu.cleaningDevices.find(d => d.id === step.deviceId)
    if (!device) continue
    if (device.weightKgPerLoad <= 0) continue

    const powerPerProduct = device.powerKwhPerLoad * input.productWeightKg / device.weightKgPerLoad
    const heatPerProduct = device.heatKwhPerLoad * input.productWeightKg / device.weightKgPerLoad
    const fromPower = electricityEF / 1000 * powerPerProduct
    const fromHeat = heatEF / 1000 * heatPerProduct
    total += fromPower + fromHeat
  }
  return total
}

// ---------- Transport ----------

function computeTransport(input: CalculatorInput, ctx: Context): { recycling: number; mwi: number; hwi: number } {
  const { menu } = ctx
  const productsPerBox = input.transport.boxEmptyWeightKg > 0 && input.productWeightKg > 0
    ? (input.transport.totalTransportWeightKg - input.transport.boxEmptyWeightKg) / input.productWeightKg
    : 0
  if (productsPerBox <= 0) {
    return { recycling: 0, mwi: 0, hwi: 0 }
  }

  // Recycling (user-supplied per route section)
  let recycling = 0
  for (const r of input.transport.sections) {
    if (r.co2Wtw <= 0) continue
    recycling += (r.co2Wtw * (1 + input.transport.returnTripPct / 100)) / productsPerBox
  }

  // MWI / HWI — DHL factor * distance * weight
  const dhlKgPerTkm = menu.transport.dhlEmissionFactor / 1000
  const totalWeightTons = input.transport.totalTransportWeightKg / 1000
  const factor = 1 + menu.transport.returnTripPct / 100

  const mwi = (dhlKgPerTkm * menu.transport.distanceMwiKm * totalWeightTons * factor) / productsPerBox
  const hwi = (dhlKgPerTkm * menu.transport.distanceHwiKm * totalWeightTons * factor) / productsPerBox

  return { recycling, mwi, hwi }
}

// ---------- Main entry point ----------

export function calculate(input: CalculatorInput, menu: MenuManagement): CalculatorResult {
  const warnings: string[] = []

  // Weight share validation (should sum to ~100%)
  const shareSum = input.composition.reduce((s, r) => s + r.weightShare, 0)
  if (Math.abs(shareSum - 1) > 0.001 && input.composition.some(r => r.weightShare > 0)) {
    warnings.push(`Material weight shares sum to ${(shareSum * 100).toFixed(1)}% — should be 100%.`)
  }
  for (const row of input.composition) {
    if (row.recyclingShare > 1.0001) {
      warnings.push(`Recycling share for a material exceeds 100%.`)
      break
    }
  }

  const ctx = buildContext(menu, input, warnings)

  const materialWeights = input.composition.map(row => ({
    materialId: row.materialId,
    weightKg: row.weightShare * input.productWeightKg,
  }))

  if (!ctx) {
    const empty: ScenarioTotal = { emissions: 0, benefits: 0, cleaning: 0, transportation: 0, total: 0, totalPerKg: 0 }
    return {
      productName: input.productName,
      productWeightKg: input.productWeightKg,
      country: '',
      materialWeights,
      recycling: empty, mwi: empty, hwi: empty,
      savingsVsMwiPerProduct: 0, savingsVsHwiPerProduct: 0,
      savingsVsMwiPerKg: 0, savingsVsHwiPerKg: 0,
      warnings,
    }
  }

  const cleaning = computeCleaning(input, ctx)
  const transport = computeTransport(input, ctx)

  const recycling = recyclingScenario(input, ctx, cleaning, transport.recycling)
  const mwi = mwiScenario(input, ctx, transport.mwi)
  const hwi = hwiScenario(input, ctx, transport.hwi)

  const savingsVsMwiPerProduct = recycling.total - mwi.total
  const savingsVsHwiPerProduct = recycling.total - hwi.total
  const safeDiv = (a: number, b: number) => (b > 0 ? a / b : 0)

  return {
    productName: input.productName,
    productWeightKg: input.productWeightKg,
    country: ctx.countryLabel,
    materialWeights,
    recycling,
    mwi,
    hwi,
    savingsVsMwiPerProduct,
    savingsVsHwiPerProduct,
    savingsVsMwiPerKg: safeDiv(savingsVsMwiPerProduct, input.productWeightKg),
    savingsVsHwiPerKg: safeDiv(savingsVsHwiPerProduct, input.productWeightKg),
    warnings,
  }
}

export function formatKgCo2e(v: number, digits = 4): string {
  if (!isFinite(v)) return '—'
  return v.toFixed(digits)
}
