// Default data extracted from the BIFA CO2 Calculator Excel
// (bifa_CO2-Calculator_Hypodermic_BD.xlsx), "Menu management" sheet.
// All values are editable at runtime via the Admin area.

import type { MenuManagement, Material, RecyclingFactor } from '../types'

const materials: Material[] = [
  { id: 'PP', name: 'PP', cTotal: 0.825, cFossilShare: 1.0, caloricValue: 40.6, source: '[Öko-Institut 2022; A-VII]', comment: 'water-free, without impurities' },
  { id: 'HDPE', name: 'HDPE', cTotal: 0.825, cFossilShare: 1.0, caloricValue: 40.6, source: '[Öko-Institut 2022; A-VII]', comment: 'water-free, without impurities' },
  { id: 'LDPE', name: 'LDPE', cTotal: 0.825, cFossilShare: 1.0, caloricValue: 40.6, source: '[Öko-Institut 2022; A-VII]', comment: 'water-free, without impurities' },
  { id: 'PET', name: 'PET', cTotal: 0.55, cFossilShare: 1.0, caloricValue: 21.9, source: '[Öko-Institut 2022; A-VII]', comment: 'water-free, without impurities' },
  { id: 'PVC', name: 'PVC', cTotal: 0.348, cFossilShare: 1.0, caloricValue: 17.95, source: 'Caloric value [Wikipedia 2024]; C-content [Greet 2024]' },
  { id: 'ABS', name: 'ABS', cTotal: 0.8, cFossilShare: 1.0, caloricValue: 38.5, source: 'Caloric value [Simulantentoast 2013]; C-content [Greet 2024]' },
  { id: 'NON_REC', name: 'Non-Recyclables', cTotal: 0.489, cFossilShare: 0.789, caloricValue: 17, source: '[Öko-Institut 2016; S.85]', comment: 'analogue sorting residues yellow bin' },
  { id: 'AL', name: 'Aluminium', cTotal: 0, cFossilShare: 0, caloricValue: 0 },
  { id: 'FE', name: 'Ferrous metals', cTotal: 0, cFossilShare: 0, caloricValue: 0 },
  { id: 'CU', name: 'Copper', cTotal: 0, cFossilShare: 0, caloricValue: 0 },
  { id: 'PT', name: 'Platin', cTotal: 0, cFossilShare: 0, caloricValue: 0 },
]

// Note: in the Excel the recycling section uses "Steel" instead of "Ferrous metals"
// with the same material pattern. We map FE -> steel recycling factor here.
const recyclingFactors: RecyclingFactor[] = [
  { materialId: 'PP', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.32, creditAvoidedPrimaryKgCo2PerKg: -1.93572538461538, source: 'Recycling process [Öko-Institut 2022; A-5]; GHG-credits [bifa 2024a]' },
  { materialId: 'HDPE', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.28, creditAvoidedPrimaryKgCo2PerKg: -1.96305 },
  { materialId: 'LDPE', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.44, creditAvoidedPrimaryKgCo2PerKg: -1.63859978666667 },
  { materialId: 'PET', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.13, creditAvoidedPrimaryKgCo2PerKg: -2.29898315789474 },
  { materialId: 'PVC', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.32, creditAvoidedPrimaryKgCo2PerKg: -2.11493338461539, source: 'Recycling process [bifa 2024b]; GHG-credits [bifa 2024a]' },
  { materialId: 'ABS', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.32, creditAvoidedPrimaryKgCo2PerKg: -3.89196538461538 },
  { materialId: 'NON_REC', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: null, creditAvoidedPrimaryKgCo2PerKg: null, comment: 'No Recycling' },
  { materialId: 'AL', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.624, creditAvoidedPrimaryKgCo2PerKg: -9, source: '[European Aluminium and IAI 2018]', comment: 'primary ingot versus recycled ingot' },
  { materialId: 'FE', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.48, creditAvoidedPrimaryKgCo2PerKg: -2.27, source: '[European Aluminium and IAI 2018]', comment: 'BF, BOF slab versus EAF slab' },
  { materialId: 'CU', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 1.69, creditAvoidedPrimaryKgCo2PerKg: -2.87, source: '[UBA 2015 S.224f]' },
  { materialId: 'PT', sortingKwhPerKg: 0.05, recyclingProcessKgCo2PerKg: 0.639, creditAvoidedPrimaryKgCo2PerKg: -33.3, source: '[IPGMA 2022]' },
]

const electricityMix = [
  { id: 'US_CA', region: 'USA' as const, country: 'California', emissionFactor: 200, source: '[EIA 2023]' },
  { id: 'US_FL', region: 'USA' as const, country: 'Florida', emissionFactor: 361, source: '[EIA 2023]' },
  { id: 'US_OH', region: 'USA' as const, country: 'Ohio', emissionFactor: 475, source: '[EIA 2023]' },
  { id: 'EU_AT', region: 'EUROPE' as const, country: 'Austria', emissionFactor: 96, source: '[EEA 2023]' },
  { id: 'EU_BE', region: 'EUROPE' as const, country: 'Belgium', emissionFactor: 145, source: '[EEA 2023]' },
  { id: 'EU_BG', region: 'EUROPE' as const, country: 'Bulgaria', emissionFactor: 422, source: '[EEA 2023]' },
  { id: 'EU_HR', region: 'EUROPE' as const, country: 'Croatia', emissionFactor: 133, source: '[EEA 2023]' },
  { id: 'EU_CY', region: 'EUROPE' as const, country: 'Cyprus', emissionFactor: 589, source: '[EEA 2023]' },
  { id: 'EU_CZ', region: 'EUROPE' as const, country: 'Czechia', emissionFactor: 400, source: '[EEA 2023]' },
  { id: 'EU_DK', region: 'EUROPE' as const, country: 'Denmark', emissionFactor: 103, source: '[EEA 2023]' },
  { id: 'EU_EE', region: 'EUROPE' as const, country: 'Estonia', emissionFactor: 658, source: '[EEA 2023]' },
  { id: 'EU_27', region: 'EUROPE' as const, country: 'EU-27', emissionFactor: 251, source: '[EEA 2023]' },
  { id: 'EU_FI', region: 'EUROPE' as const, country: 'Finland', emissionFactor: 66, source: '[EEA 2023]' },
  { id: 'EU_FR', region: 'EUROPE' as const, country: 'France', emissionFactor: 68, source: '[EEA 2023]' },
  { id: 'EU_DE', region: 'EUROPE' as const, country: 'Germany', emissionFactor: 366, source: '[EEA 2023]' },
  { id: 'EU_GR', region: 'EUROPE' as const, country: 'Greece', emissionFactor: 416, source: '[EEA 2023]' },
  { id: 'EU_HU', region: 'EUROPE' as const, country: 'Hungary', emissionFactor: 180, source: '[EEA 2023]' },
  { id: 'EU_IE', region: 'EUROPE' as const, country: 'Ireland', emissionFactor: 310, source: '[EEA 2023]' },
  { id: 'EU_IT', region: 'EUROPE' as const, country: 'Italy', emissionFactor: 252, source: '[EEA 2023]' },
  { id: 'EU_LV', region: 'EUROPE' as const, country: 'Latvia', emissionFactor: 86, source: '[EEA 2023]' },
  { id: 'EU_LT', region: 'EUROPE' as const, country: 'Lithuania', emissionFactor: 180, source: '[EEA 2023]' },
  { id: 'EU_LU', region: 'EUROPE' as const, country: 'Luxembourg', emissionFactor: 52, source: '[EEA 2023]' },
  { id: 'EU_MT', region: 'EUROPE' as const, country: 'Malta', emissionFactor: 347, source: '[EEA 2023]' },
  { id: 'EU_NL', region: 'EUROPE' as const, country: 'Netherlands', emissionFactor: 321, source: '[EEA 2023]' },
  { id: 'EU_PL', region: 'EUROPE' as const, country: 'Poland', emissionFactor: 666, source: '[EEA 2023]' },
  { id: 'EU_PT', region: 'EUROPE' as const, country: 'Portugal', emissionFactor: 173, source: '[EEA 2023]' },
  { id: 'EU_RO', region: 'EUROPE' as const, country: 'Romania', emissionFactor: 247, source: '[EEA 2023]' },
  { id: 'EU_SK', region: 'EUROPE' as const, country: 'Slovakia', emissionFactor: 115, source: '[EEA 2023]' },
  { id: 'EU_SI', region: 'EUROPE' as const, country: 'Slovenia', emissionFactor: 208, source: '[EEA 2023]' },
  { id: 'EU_ES', region: 'EUROPE' as const, country: 'Spain', emissionFactor: 205, source: '[EEA 2023]' },
  { id: 'EU_SE', region: 'EUROPE' as const, country: 'Sweden', emissionFactor: 7, source: '[EEA 2023]' },
]

export const defaultMenu: MenuManagement = {
  materials,
  recyclingFactors,
  incineration: {
    mwiEffElectricityEU: 11.4,
    mwiEffElectricityUSA: 20,
    mwiEffHeatEU: 31.6,
    mwiEffHeatUSA: 0,
    mwiHeatEmissionFactor: 67.7 * 3.6,
    metalRecoverySteelPct: 85,
    metalRecoveryAluminiumPct: 40,
    hwiEffElectricityEU: 15,
    hwiEffElectricityUSA: 15,
    lightFuelOilHeatingValue: 42.7,
    lightFuelOilEmissionFactor: 3.087 / 0.85,
  },
  electricityMix,
  cleaningMethods: [
    { key: 'none', label: 'NO CLEANING' },
    { key: 'steam', label: 'Steam sterilisation' },
    { key: 'autoclave', label: 'Autoclave' },
    { key: 'ultrasonic', label: 'Ultrasonic bath' },
    { key: 'others', label: 'Others' },
  ],
  cleaningDevices: [
    { id: 'es_stericycle', methodKey: 'autoclave', name: 'ES-Stericycle Autoclave', powerKwhPerLoad: 230.9, heatKwhPerLoad: 0, weightKgPerLoad: 392.43, source: 'Manufacturer information 2024', comment: 'Heat consumption included in power' },
    { id: 'gb_lab4work_washer', methodKey: 'steam', name: 'GB-Lab4Work Oy Washing/Disinfector', powerKwhPerLoad: 6.5, heatKwhPerLoad: 0, weightKgPerLoad: 10, source: 'Manufacturer information 2024', comment: 'Heat consumption included in power' },
    { id: 'gb_lab4work_dryer', methodKey: 'steam', name: 'GB-Lab4Work Oy Dryer', powerKwhPerLoad: 3, heatKwhPerLoad: 0, weightKgPerLoad: 10, source: 'Manufacturer information 2024' },
    { id: 'gb_mygroup_macs', methodKey: 'steam', name: 'GB-MyGroup MACS', powerKwhPerLoad: 52, heatKwhPerLoad: 0, weightKgPerLoad: 45, source: 'Manufacturer information 2024' },
    { id: 'de_steristics_ultramatic', methodKey: 'ultrasonic', name: 'DE-Steristics Ultramatic 550', powerKwhPerLoad: 1, heatKwhPerLoad: 0, weightKgPerLoad: 20, source: 'Manufacturer information 2024' },
    { id: 'at_instrucare', methodKey: 'others', name: 'AT-Instrucare RDG', powerKwhPerLoad: 14.5, heatKwhPerLoad: 0, weightKgPerLoad: 6.6744, source: 'Manufacturer information 2024' },
    { id: 'de_bht_innova', methodKey: 'others', name: 'DE-Steristics BHT Innova M5', powerKwhPerLoad: 9.5, heatKwhPerLoad: 0, weightKgPerLoad: 20, source: 'Manufacturer information 2024' },
    { id: 'de_uniclean', methodKey: 'others', name: 'DE-Steristics Uniclean PL II', powerKwhPerLoad: 9.5, heatKwhPerLoad: 0, weightKgPerLoad: 20, source: 'Manufacturer information 2024' },
    { id: 'dk_zirq', methodKey: 'others', name: 'DK-Zirq', powerKwhPerLoad: 316.4, heatKwhPerLoad: 0, weightKgPerLoad: 1000, source: 'Manufacturer information 2024' },
    { id: 'ch_sermax', methodKey: 'others', name: 'CH-Sermax RDG', powerKwhPerLoad: 9.8, heatKwhPerLoad: 0, weightKgPerLoad: 18, source: 'Manufacturer information 2024' },
  ],
  transport: {
    distanceMwiKm: 75,
    distanceHwiKm: 133,
    dhlEmissionFactor: 80.45, // gCO2e / (t*km)
    returnTripPct: 10,
  },
  literature: [
    { ref: '[bifa 2012]', text: 'M. Seitz et al.: Entsorgung gefährlicher Abfälle in Bayern. bifa 2012.' },
    { ref: '[bifa 2024a]', text: 'bifa calculation based on ecoinvent-Data and own assumptions about the yield during recycling' },
    { ref: '[bifa 2024b]', text: 'assumed analogous PP-Recycling' },
    { ref: '[DHL 2024]', text: 'https://carboncalculator.dhl.com' },
    { ref: '[EEA 2023]', text: 'European Environment Agency — Greenhouse gas emission intensity of electricity generation.' },
    { ref: '[EIA 2023]', text: 'U.S. Energy Information Administration — Annual Electric Generator Report.' },
    { ref: '[European Aluminium and IAI 2018]', text: 'European Aluminium and IAI 2018: Excel calculation workbook.' },
    { ref: '[Greet 2024]', text: 'https://greet.anl.gov/greet_excel_model.models' },
    { ref: '[IPGMA 2022]', text: 'International Platinum Group Metals Association. Life Cycle Assessment of PGMs.' },
    { ref: '[Öko-Institut 2016]', text: 'Öko-Institut e.V.: Umweltpotenziale der getrennten Erfassung und des Recyclings von Wertstoffen im Dualen System. 2016.' },
    { ref: '[Öko-Institut 2022]', text: 'Öko-Institut e.V.: Ökobilanz zu den Leistungen der dualen Systeme im Bereich des Verpackungsrecyclings. 2022.' },
    { ref: '[UBA 2015]', text: 'R. Vogt et al.: Klimaschutzpotenziale der Abfallwirtschaft. UBA Text 46/2015.' },
    { ref: '[Wikipedia 2024]', text: 'https://en.wikipedia.org/wiki/Polyvinyl_chloride' },
  ],
}
