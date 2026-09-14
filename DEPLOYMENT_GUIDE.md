# Deployment guide

## Recommended Render configuration

Use **New → Static Site**, not **New → Web Service**.

This project has no production server entry point. It is a Vite frontend that builds into `dist/`. A Render Web Service on the free plan sleeps after inactivity; a Render Static Site serves the built files from the CDN and does not sleep.

### Render dashboard steps

1. Put the contents of this archive in a GitHub repository, or upload the project to the source control provider connected to Render.
2. In Render, click **New + → Static Site**.
3. Select the repository.
4. Use:

```text
Branch: main
Build Command: npm install --registry=https://registry.npmjs.org/ && npm run build
Publish Directory: dist
```

5. Add these environment variables:

```text
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_PUBLIC_OR_ANON_KEY
```

6. Click **Create Static Site**.
7. Wait for the build to finish and open the generated `onrender.com` URL.

The included `render.yaml` contains the same configuration for a Render Blueprint. If you use **New → Blueprint**, Render can read that file from the repository. The values with `sync: false` must still be entered in Render.

The project intentionally does not include the old `package-lock.json` from Replit. That file contained `package-firewall.replit.local` download URLs that cannot be reached by Vercel. The new `.npmrc` file points installs to the public npm registry.

### What not to enter

- Do not select **Web Service**.
- Do not enter `npm start`; this project does not need a server process.
- Do not use a Supabase `service_role` key.
- Do not put secrets in `src/` files.

## Vercel alternative

Vercel is also a good fit because this is a static Vite frontend. Import the repository into Vercel, set the same two `VITE_*` variables, and deploy. The included `vercel.json` configures the Vite output and SPA fallback.

For the fastest simple production setup, use one primary Vercel deployment plus the shared Supabase project. Keeping both Render and Vercel live is useful as a backup, but it does not make the application itself faster.

## Why login is immediate now

`src/main.tsx` renders React immediately. Supabase hydration runs in the background. If cloud data is found, the page reloads once after the first paint so the app's existing state providers can read it. If Supabase is unavailable, the login screen still opens using local browser data.

The login itself is currently client-side demo authentication. Its users and passwords are not sent to Supabase. For real production authentication, replace it with Supabase Auth.

The sun/moon button is available on the login and main application screens. It changes the UI theme and stores only that browser's preference; the theme is intentionally not synchronized between users or devices.

## Where each deployment file goes

| File | Place it at | What it contains |
| --- | --- | --- |
| `render.yaml` | Project root, beside `package.json` | Render Static Site build, publish directory, SPA rewrite and Supabase variable names. |
| `vercel.json` | Project root, beside `package.json` | Vercel build output and SPA rewrite. |
| `.npmrc` | Project root, beside `package.json` | Public npm registry configuration; fixes Vercel dependency installation. |
| `.env.example` | Project root | Template only; copy it to `.env.local` for local development. |
| `supabase/migrations/001_app_storage.sql` | Keep this path in the source archive | SQL to run once in Supabase SQL Editor. It is not a Render file. |
| `src/main.tsx` | Replace the existing file | Immediate rendering, cloud hydration and service-worker startup. |
| `src/lib/cloudStorage.ts` | Create the `src/lib` folder if missing | Supabase adapter for the existing browser storage keys. |
| `public/manifest.webmanifest` | Create the `public` folder if missing | Installable app metadata. |
| `public/sw.js` | Inside `public` | PWA shell caching. |

## Data test after deployment

1. Open the Render URL on Laptop A.
2. Log in and create a clearly identifiable test record, such as `SYNC-TEST-001`.
3. Wait a few seconds while online.
4. Open the same Render URL on Laptop B in a private/incognito window.
5. Log in and check for `SYNC-TEST-001`.
6. If it is missing, check that both deployments use the exact same `VITE_SUPABASE_URL` and that `app_storage` contains rows in Supabase Table Editor.