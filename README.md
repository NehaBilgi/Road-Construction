# Construction Pro

Construction Pro is a Vite + React + TypeScript construction operations ERP. It contains road-work, building-work, sites, trips, diesel, expenses, machinery, inventory, labour, measurement, reporting and administration screens.

This version adds:

- Shared persistence through Supabase for the existing browser storage keys.
- A one-time migration from the first browser that connects to an empty Supabase table.
- Installable PWA support so the app can be launched from a desktop icon instead of opening the hosted link every time.
- A visible **Install app** button when the browser supports installation.
- A dark/light mode toggle with a browser-local theme preference.
- A detailed SQL migration and deployment instructions.

## Why data was different on each laptop

The original app used `localStorage`. That storage belongs to one browser profile on one device. Vercel and Render were serving the same frontend code, but they were not storing the browser's local data for each other. The original `src/supabaseClient.ts` also contained placeholder credentials and was not imported by the application.

The new `src/lib/cloudStorage.ts` loads the shared records from Supabase before React starts, then mirrors future writes made by the existing modules. This lets the current screens continue using their existing state code while the data becomes cross-device.

This is an MVP bridge, not a full multi-tenant database model. The current login is a client-side demo login with hard-coded users. The SQL policy therefore allows anonymous access to one shared workspace. Do not use that policy for confidential or multi-company data until the app is moved to Supabase Auth with per-user/per-workspace Row Level Security.

## Folder and file guide

### Root files

| Path | Purpose |
| --- | --- |
| `.env.example` | Template for Gemini, app URL and the two Vite Supabase variables. |
| `.gitignore` | Prevents dependencies, builds, logs and environment files from being committed. |
| `index.html` | Browser entry HTML, page metadata, theme color and PWA manifest link. |
| `metadata.json` | Google AI Studio application metadata and capability description. |
| `package.json` | NPM scripts and React/Vite/Tailwind/icon/Supabase dependencies. |
| `.npmrc` | Forces Vercel, Render and local installs to use the public npm registry. |
| `tsconfig.json` | TypeScript compiler configuration. |
| `vite.config.ts` | Vite, React and Tailwind CSS plugin configuration plus the `@` alias. |
| `README.md` | This project map, Supabase setup, PWA instructions and exact change list. |
| `DEPLOYMENT_GUIDE.md` | Render Static Site, Vercel, file placement and cross-device testing instructions. |
| `render.yaml` | Render Blueprint configuration. It deliberately uses a static site so the free plan does not sleep. |
| `vercel.json` | Vercel build output and single-page-app fallback configuration. |

### Public files

| Path | Purpose |
| --- | --- |
| `public/manifest.webmanifest` | App name, icon-less install metadata, standalone display mode and theme colors. |
| `public/sw.js` | Service worker that caches the app shell and supports launching the installed shell offline. API/database requests are not cached. |

### `assets/`

| Path | Purpose |
| --- | --- |
| `assets/.aistudio/.gitignore` | Keeps the AI Studio asset directory from adding unwanted generated files. |

### `src/` entry and shared files

| Path | Purpose |
| --- | --- |
| `src/main.tsx` | Bootstraps the app. Hydrates Supabase data before providers mount, installs the storage mirror, registers the service worker, then renders React. |
| `src/App.tsx` | Main application router, header, sidebar, login/domain/site flow and module routing. Also renders the install button. |
| `src/index.css` | Global CSS entry. Most styling is Tailwind utility classes in the components. |
| `src/supabaseClient.ts` | Creates the Supabase browser client from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; safely disables cloud sync when not configured. |
| `src/vite-env.d.ts` | Vite type declarations for `import.meta.env`. |
| `src/lib/cloudStorage.ts` | Cross-device persistence adapter. Hydrates local storage from Supabase, migrates local data when the cloud table is empty, and mirrors later local-storage changes. |
| `src/registerServiceWorker.ts` | Registers `public/sw.js` after the page loads. |
| `src/types/erp.ts` | TypeScript types for the general ERP: projects, sites, materials, workers, attendance, BOQ, measurements, audit and related records. |
| `src/types/roadERP.ts` | TypeScript types for road-specific fleet, trips, fuel, yield, expenses and DPR records. |
| `src/data/initialData.ts` | Sample/default general ERP records used on a clean browser. |
| `src/data/mockRoadData.ts` | Sample/default road project, fleet, trips, fuel, yield and expense records. |

### Context and state

| Path | Purpose |
| --- | --- |
| `src/context/ERPContext.tsx` | Main application state and actions for authentication, projects, sites, inventory, building records, labour, production, BOQ, measurements, notifications and audit logs. It still writes its existing keys; `cloudStorage.ts` mirrors them. |
| `src/context/RoadERPContext.tsx` | Road operations state and actions for machines, haulage, fuel, yield calculations, expenses, petty cash, DPR and the offline queue. |

### Authentication and navigation

| Path | Purpose |
| --- | --- |
| `src/components/auth/LoginPage.tsx` | Client-side username/password demo login screen. |
| `src/components/auth/ProjectTypeSelectionPage.tsx` | Chooses Road or Building mode after login. |
| `src/components/auth/SiteSelectionPage.tsx` | Chooses the active site before the main workspace opens. |
| `src/components/Header.tsx` | Legacy standalone header module. |
| `src/components/Sidebar.tsx` | Main navigation sidebar and module menu groups. |
| `src/components/InstallAppButton.tsx` | Captures the browser install event and displays the desktop-install action. |
| `src/components/ThemeToggle.tsx` | Dark/light mode toggle. The preference stays local to the browser and is not uploaded to Supabase. |
| `src/components/WorkTypeSelector.tsx` | Legacy/general work-type selector. |
| `src/components/user` | Legacy user-management component without a file extension; it is not imported by the current `App.tsx` route. |

### Dashboard, reports and alerts

| Path | Purpose |
| --- | --- |
| `src/components/dashboard/SiteCentricMidnightDashboard.tsx` | Main active-site dashboard with road activity, trips, diesel, expenses and KPIs. |
| `src/components/dashboard/BilgiDashboardView.tsx` | Alternative/general Bilgi dashboard view. |
| `src/components/dashboard/OwnerDashboard.tsx` | Owner-level dashboard view. |
| `src/components/reports/ReportsAnalyticsModule.tsx` | Building/general reports and analytics screen. |
| `src/components/analytics/RoadAnalyticsDPRModule.tsx` | Road analytics and Daily Progress Report view using `RoadERPContext`. |
| `src/components/alerts/SystemAlertsModule.tsx` | Building/general system alerts screen. |
| `src/components/audit/AuditTrailModule.tsx` | Audit log display. |
| `src/components/architecture/TechnicalArchitectureModal.tsx` | Technical architecture information modal. |

### Road operations

| Path | Purpose |
| --- | --- |
| `src/components/sites/RoadSitesManagerModule.tsx` | Creates, edits and manages road/building sites. |
| `src/components/sites/SiteTripMatrixModule.tsx` | Site-to-vehicle trip matrix and site activity grid. |
| `src/components/trips/MaterialHaulageTripsModule.tsx` | Road material haulage trip register; currently uses a legacy local-storage key mirrored to Supabase. |
| `src/components/trips/TripCounterModule.tsx` | Building/RMC trip counter. |
| `src/components/diesel/DieselFuelManagementModule.tsx` | Road diesel/fuel register; its local-storage key is mirrored to Supabase. |
| `src/components/diesel/DieselManagementModule.tsx` | Alternate diesel-management screen. |
| `src/components/calculator/RoadYieldCalculatorModule.tsx` | Road material yield and quantity calculator. |
| `src/components/road/DailyRoadProductionView.tsx` | Daily road production entry/view. |
| `src/components/road/RoadChainageModule.tsx` | Road chainage and stretch management. |
| `src/components/road/RoadMaterialCalculator.tsx` | Road material quantity calculation. |
| `src/components/layout/RoadAppHeader.tsx` | Header for the legacy/context-based road application screens. |
| `src/components/fleet/MachineFleetManagementModule.tsx` | Fleet screen backed by `RoadERPContext`. |
| `src/components/machinery/MachineryFleetModule.tsx` | Main machinery fleet screen; its local-storage key is mirrored to Supabase. |
| `src/components/mb/DigitalMeasurementBook.tsx` | Digital Measurement Book entries. |

### Building, inventory and costing

| Path | Purpose |
| --- | --- |
| `src/components/building/AttendancePayrollModule.tsx` | Building staff attendance and payroll records. |
| `src/components/building/BBSModule.tsx` | Bar Bending Schedule records. |
| `src/components/building/BuildingFloorsModule.tsx` | Building floor progress and updates. |
| `src/components/building/DailyBuildingProductionView.tsx` | Daily building production records. |
| `src/components/building/ProductsMasterModule.tsx` | Building products master list; its local-storage key is mirrored to Supabase. |
| `src/components/building/RCCCalculators.tsx` | RCC/concrete calculation utilities. |
| `src/components/building/StockTransactionsModule.tsx` | Building stock-in/stock-out transactions; its local-storage key is mirrored to Supabase. |
| `src/components/inventory/InventoryLedgerModule.tsx` | General inventory ledger. |
| `src/components/inventory/MaterialConsumptionModule.tsx` | Material consumption records. |
| `src/components/inventory/ReorderSuggestionsModule.tsx` | Low-stock/reorder suggestions. |
| `src/components/costing/BOQCostingModule.tsx` | Bill of Quantities costing. |
| `src/components/costing/SiteCostExpensesModule.tsx` | Site expenses and cross-linked material/diesel totals; its legacy keys are mirrored to Supabase. |
| `src/components/expenses/SiteExpensesFinancialsModule.tsx` | Road financial expense view backed by `RoadERPContext`. |
| `src/components/barcode/ScanBarcodeModule.tsx` | Barcode scanning module UI. |

### Configuration and modals

| Path | Purpose |
| --- | --- |
| `src/components/configuration/CategoriesModule.tsx` | Material/category configuration. |
| `src/components/configuration/LocationsModule.tsx` | Location configuration. |
| `src/components/configuration/UserManagementModule.tsx` | Managed-user administration UI. Its current credentials remain local-only for safety. |
| `src/components/configuration/YearlyArchiveModule.tsx` | Yearly archive/configuration screen. |
| `src/components/modals/ClearDataModal.tsx` | Clear-data confirmation and reset action. |
| `src/components/modals/CreateProjectModal.tsx` | Create-project form. |
| `src/components/modals/CreateRoadSiteModal.tsx` | Create-road-site form. |

### Supabase

| Path | Purpose |
| --- | --- |
| `supabase/migrations/001_app_storage.sql` | Creates the `app_storage` JSONB key/value table, timestamp trigger and MVP RLS policies. Run it in Supabase SQL Editor. |

## Supabase setup

### 1. Create a Supabase project

1. Open [supabase.com](https://supabase.com) and create a project.
2. Choose a strong database password and keep it private.
3. Wait until the project finishes provisioning.

### 2. Create the shared storage table

1. In the Supabase dashboard, open **SQL Editor**.
2. Open this project file: `supabase/migrations/001_app_storage.sql`.
3. Copy the complete file into a new SQL query.
4. Click **Run**.
5. In **Table Editor**, confirm that `app_storage` exists.

The included policy is intentionally open to `anon` because the current app login is only a client-side demo. It is suitable only for an internal MVP where the Supabase URL and public key are not being treated as a security boundary.

### 3. Add the browser variables

1. In Supabase, open **Project Settings → API**.
2. Copy the **Project URL**.
3. Copy the **Publishable key** (or the legacy `anon` public key).
4. In the project root, copy `.env.example` to `.env.local`.
5. Set:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_OR_ANON_KEY
```

Never put the `service_role` key in `.env.local`, Vercel, Render, frontend code or chat. This application only needs the public/publishable key for the included MVP policy.

### 4. Run locally

```bash
npm install --registry=https://registry.npmjs.org/
npm run dev
```

Open the local URL shown by Vite. On the first run with an empty `app_storage` table, any existing eligible local browser data is uploaded as the initial shared data. On later devices, the cloud data is loaded before the app opens.

### 5. Configure Vercel and Render

Add the same two variables to the environment where the frontend is built:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

Add them to the correct environment(s), normally **Production** and **Preview** on Vercel and the active environment on Render. Then redeploy. Vite embeds `VITE_*` variables during the build, so changing the dashboard variables requires a new deployment.

Use the same Supabase project URL and public key on both Vercel and Render. If they use different Supabase projects, they will correctly show different data.

### Render: choose Static Site

This project is a frontend-only Vite application. On Render choose **New → Static Site**, not **Web Service**:

```text
Build Command: npm ci && npm run build
Publish Directory: dist
```

Render Static Sites do not sleep on the free plan. A free Render Web Service would sleep because it runs a server process, but this project does not need one. The complete click-by-click instructions are in `DEPLOYMENT_GUIDE.md`.

## Install it on a computer

This version is a PWA. It is not a separate native Windows/Mac executable; it installs a desktop launcher for the hosted app.

1. Deploy the updated project over HTTPS.
2. Open the deployed site in Chrome or Edge.
3. Log in.
4. Click **Install app** in the top-right header, or use the browser's install icon in the address bar.
5. Launch **Construction Pro** from the desktop/Start menu.

The installed shell can open its cached interface without a network connection, but shared Supabase records still require internet access. Offline form changes remain in the browser's local storage and are marked for retry when the app regains connectivity or is reopened.

## Exact changes made in this version

### Supabase and shared data

- Added `@supabase/supabase-js` to `package.json`.
- Replaced placeholder Supabase constants in `src/supabaseClient.ts` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- Added `src/lib/cloudStorage.ts`.
- Changed `src/main.tsx` to render the login screen immediately, then hydrate cloud storage in the background.
- Added a one-time reload after cloud hydration so the existing React providers read the shared cloud snapshot without making the login page wait.
- Changed `src/main.tsx` to mirror future `localStorage` writes to Supabase.
- Added `supabase/migrations/001_app_storage.sql`.
- Deliberately excluded the old client-side login account list, current user object, login marker and data-version marker from cloud storage. Password lists must not be uploaded to the open MVP table.

The adapter mirrors the existing data keys used by the app, including ERP state keys, road state keys, diesel, trips, expenses, machinery, product and stock transaction keys, road material categories, yield calculations and the clear-data marker. It stores each key as JSONB rather than forcing a risky rewrite of every module.

### Installable app

- Added `public/manifest.webmanifest`.
- Added `public/sw.js`.
- Added `src/registerServiceWorker.ts`.
- Added `src/components/InstallAppButton.tsx`.
- Added `src/components/ThemeToggle.tsx`.
- Added the manifest link and Construction Pro metadata to `index.html`.
- Added the install button to the top-right header in `src/App.tsx`.
- Added light-mode surface, border, input and text overrides in `src/index.css`.

### Hosting reliability

- Removed the Replit-only `package-lock.json` from the deployment archive.
- Added `.npmrc` to force the public npm registry.
- Added the public-registry install command to `vercel.json` and `render.yaml`.

### Small source fixes found while validating the bundle

- Corrected the relative `ERPContext` import in `src/components/Sidebar.tsx`.
- Added `src/vite-env.d.ts` for Vite environment typing.
- Fixed the numeric reduction typing in `src/context/ERPContext.tsx`.
- Corrected an invalid sample `layerType` value in `src/data/initialData.ts`.

## Validation

From the project root:

```bash
npm run lint
npm run build
```

The production build should create `dist/manifest.webmanifest` and `dist/sw.js`. A large JavaScript chunk warning may appear because the original app imports many modules up front; it is a performance warning, not a build failure.

## Important production follow-up

Before using real employee, payroll, customer or financial data, replace the demo login with Supabase Auth and move data into normalized tables such as `projects`, `sites`, `workers`, `trips`, `fuel_logs`, `expenses` and `audit_logs`. Add `workspace_id` and `user_id` columns, then write RLS policies that restrict every row to the signed-in user's workspace. The current JSONB bridge is meant to make the present app work across devices quickly; it is not the final security or concurrency model.