# PriFood SFA Mobile (V2)

Sales-force automation app for PriFood field reps: daily customer coverage, visit
transactions (OSA, inventory, delivery, planogram, market analysis, notes, orders, DAR),
offline storage and data sync. Expo SDK 57 rewrite of `Prifood-Mobile-SFA`.

## Run

```bash
npm install
npx expo run:android   # or run:ios — needs a development build (maps, camera, sqlite)
```

Optional `.env` (see `.env.example`): `EXPO_PUBLIC_API_URL` overrides the production API URL.

Scripts: `npm run typecheck`, `npm run lint`, `npm run format`.

## Builds (EAS)

Project: `@bimsauco-project/sfa-mobile` on expo.dev. Android only for now.

| Command | Profile | Output |
|---|---|---|
| `npm run build:dev` | development | APK with the dev client (loads code from Metro) |
| `npm run build:preview` | preview | Installable APK for testers |
| `npm run build:production` | production | AAB for Google Play, build number auto-increments |

The Android keystore is generated and kept on EAS on the first build; back it up with `eas credentials`.

`EXPO_PUBLIC_API_URL` comes from the EAS environment of each profile (`eas env:list --environment production`), so builds and updates use the same value.

## OTA updates (EAS Update)

JS/asset changes ship without a new APK:

```bash
npm run update:preview -- --message "Fix OSA save"      # testers (preview builds)
npm run update:production -- --message "Fix OSA save"   # field reps (production builds)
```

- Each build profile listens to the channel of the same name (`development`, `preview`, `production`).
- The app downloads an update in the background on launch and applies it on the next launch.
- `runtimeVersion` uses the `fingerprint` policy: an update only reaches builds with the same native code. After adding/upgrading a native package or changing `app.json` native config, make a new build first (`npm run build:*`), then publish updates.
- Check what a build will accept: `npx expo-updates runtimeversion:resolve --platform android`.
- Roll back: `eas update:republish` an earlier update, or `eas update:rollback`.

## Structure

```
src/
  app/            expo-router routes (thin files that re-export screens)
    (main)/       signed-in area: tabs home / search / alerts
    dialog.tsx, loading-overlay.tsx, …   transparent modal routes
  modules/<area>/ feature code: screens/, components/, controllers/, services/, models/, types/, constants/
  components/     shared UI (styled-components)
  db/             expo-sqlite document store + shared models (replaces Realm)
  lib/modal/      route-based modals: confirm(), alert(), showLoading(), openModalRoute()
  provider/       Session, User, CustomerVisit contexts
  services/       API calls (axios instance in config/api.ts)
  constants/      routes, theme, images, strings
```

## Conventions

- Styling: `styled-components/native` with the theme in `src/constants/theme.ts`.
- Navigation: `router.push(Route.X)` with paths from `src/constants/routes.ts`.
- Data: `useQuery(Model, { where, filter, sort })` for live lists, `insert` / `upsert` / `update` / `remove` / `write` for changes (`src/db`).
- Modals are routes: `if (await confirm({ title, message })) { … }`.
