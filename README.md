# BIFA CO₂ Calculator — Web App

User-friendly web version of the **BIFA CO2-Calculator for Hypodermic Products** Excel workbook, with an editable admin area for the background data (`Menu Management`).

All calculations run **client-side** — no backend needed. The app is a pure static site and can be hosted anywhere (GitHub Pages, Vercel, Netlify, S3, etc.).

## Features

- **Calculator**: product specification, material composition, up to 3 cleaning steps, transport setup, and instant real-time results for three end-of-life scenarios (recycling, MWI, HWI) plus a savings comparison.
- **Menu Management** (password-protected admin area):
  - Materials (carbon content, caloric value)
  - Recycling factors (sorting energy, process emissions, credits)
  - Incineration parameters (MWI & HWI efficiencies, emission factors, metal recovery)
  - Electricity mix per country / US state
  - Cleaning methods and devices
  - Transport defaults (MWI / HWI distances, DHL factor)
  - Import / export menu data as JSON, reset to factory defaults.
- **Persistence**: inputs and admin data are stored in the browser's localStorage.
- **Example preset**: loads the "BD-Spain" example from the original Excel so you can verify behaviour at a glance.

## Quick start

```bash
npm install
npm run dev       # starts a dev server at http://localhost:5173
npm run build     # produces a static build in ./dist
npm run preview   # serves the production build locally
```

### Admin login

The default admin password is `admin`. Change it from **Menu Management → Import / Export / Reset** after the first login.

## Deploying

### GitHub Pages
The repo ships with a ready-made GitHub Actions workflow at `.github/workflows/deploy.yml`. Push to `main`, then enable GitHub Pages with "GitHub Actions" as the source — done.

### Vercel / Netlify / Cloudflare Pages
Connect the repo, set the build command to `npm run build` and the output directory to `dist`. No other configuration needed.

## Project structure

```
src/
├── App.tsx                 # Root component + top-level navigation
├── main.tsx                # Entry point
├── index.css               # Tailwind base + component classes
├── types.ts                # Shared TS types
├── data/
│   └── defaults.ts         # Factory defaults extracted from the BIFA Excel
├── lib/
│   ├── calculator.ts       # Pure calculation engine — all Excel formulas
│   └── store.ts            # localStorage persistence + JSON import/export
├── pages/
│   ├── CalculatorPage.tsx
│   └── AdminPage.tsx
└── components/
    ├── calculator/         # Form sections for the calculator
    └── admin/              # Editors for each part of Menu Management
```

## How the calculation works

The [`src/lib/calculator.ts`](src/lib/calculator.ts) module reproduces the formulas from the original Excel file:

1. **Material weights** are derived from the product weight times the material's weight share.
2. **Recycling scenario**: emissions = Σ `share_recycled * weight * (sortingEnergy * electricityEF + processEmissions)`; benefits = Σ `share_recycled * weight * credit`. Cleaning and recycling transport are added on top.
3. **MWI scenario**: direct emissions from carbon oxidation (`C-total * fossil-share * 44/12`), offset by avoided-electricity and avoided-heat benefits (caloric value × net efficiency, converted to kWh and multiplied by the electricity/heat emission factor). Steel and aluminium receive an additional metal-recovery credit. Transport uses the DHL factor × MWI distance.
4. **HWI scenario**: same as MWI direct emissions, plus auxiliary-firing emissions when caloric < 23 MJ/kg; benefits from recovered electricity; transport uses DHL factor × HWI distance.
5. **Savings**: `recyclingTotal - MWITotal` and `recyclingTotal - HWITotal`. A negative number means recycling is better for the climate.

## Editing Menu Management

All menu data is editable directly in the browser and persisted to localStorage. Use **Import / Export** to share configurations between computers or to version-control them alongside the source.

## License

Apache-2.0. Underlying data is based on the BIFA Umweltinstitut calculator and the cited literature (see admin → Literature).
