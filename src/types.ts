// Domain types — mirror the structure of the BIFA CO2 Calculator Excel file.
// All background values ("Menu management") are editable via the Admin area.

export type Region = 'EUROPE' | 'USA'

export interface Material {
  id: string
  name: string
  cTotal: number // [C-total/kg Material] - carbon content share
  cFossilShare: number // [% C-total] - 0..1
  caloricValue: number // [MJ/kg]
  source?: string
  comment?: string
}

export interface RecyclingFactor {
  materialId: string
  sortingKwhPerKg: number // energy to sort
  recyclingProcessKgCo2PerKg: number | null // null if not recyclable
  creditAvoidedPrimaryKgCo2PerKg: number | null // negative value
  source?: string
  comment?: string
}

export interface IncinerationSettings {
  // MWI
  mwiEffElectricityEU: number // [%]
  mwiEffElectricityUSA: number
  mwiEffHeatEU: number
  mwiEffHeatUSA: number
  mwiHeatEmissionFactor: number // [gCO2e/kWh]  (EU 67.7 * 3.6 = 243.72)
  metalRecoverySteelPct: number
  metalRecoveryAluminiumPct: number
  // HWI
  hwiEffElectricityEU: number
  hwiEffElectricityUSA: number
  lightFuelOilHeatingValue: number // MJ/kg
  lightFuelOilEmissionFactor: number // kg CO2e / kg oil
}

export interface ElectricityMixEntry {
  id: string
  region: Region
  country: string // display name
  emissionFactor: number // [gCO2e/kWh]
  source?: string
}

export type CleaningMethodKey = 'none' | 'steam' | 'autoclave' | 'ultrasonic' | 'others'

export interface CleaningMethod {
  key: CleaningMethodKey
  label: string
}

export interface CleaningDevice {
  id: string
  methodKey: CleaningMethodKey
  name: string
  powerKwhPerLoad: number
  heatKwhPerLoad: number
  weightKgPerLoad: number
  source?: string
  comment?: string
}

export interface TransportSettings {
  distanceMwiKm: number
  distanceHwiKm: number
  dhlEmissionFactor: number // gCO2e / (t*km) WtW
  returnTripPct: number // assumed empty return transport, percentage
}

export interface MenuManagement {
  materials: Material[]
  recyclingFactors: RecyclingFactor[]
  incineration: IncinerationSettings
  electricityMix: ElectricityMixEntry[]
  cleaningMethods: CleaningMethod[]
  cleaningDevices: CleaningDevice[]
  transport: TransportSettings
  literature: Array<{ ref: string; text: string }>
}

// ---------- Calculator inputs ----------

export interface MaterialCompositionRow {
  materialId: string
  weightShare: number // 0..1 (percentage of product weight)
  recyclingShare: number // 0..1 (share that goes to recycling)
}

export interface CleaningStep {
  methodKey: CleaningMethodKey
  deviceId: string | null
}

export interface TransportRouteSection {
  startCity?: string
  endCity?: string
  distanceKm: number
  co2Wtw: number // in kg CO2e (from DHL Carbon Calculator)
}

export interface CalculatorInput {
  productName: string
  productWeightKg: number
  electricityMixId: string
  composition: MaterialCompositionRow[]
  cleaningSteps: CleaningStep[] // up to 3
  transport: {
    boxEmptyWeightKg: number
    totalTransportWeightKg: number
    sections: TransportRouteSection[]
    returnTripPct: number
  }
}

// ---------- Results ----------

export interface ScenarioTotal {
  emissions: number // kg CO2e per product
  benefits: number // negative kg CO2e per product
  cleaning: number
  transportation: number
  total: number
  totalPerKg: number
}

export interface CalculatorResult {
  productName: string
  productWeightKg: number
  country: string
  materialWeights: Array<{ materialId: string; weightKg: number }>
  recycling: ScenarioTotal
  mwi: ScenarioTotal
  hwi: ScenarioTotal
  savingsVsMwiPerProduct: number
  savingsVsHwiPerProduct: number
  savingsVsMwiPerKg: number
  savingsVsHwiPerKg: number
  warnings: string[]
}
