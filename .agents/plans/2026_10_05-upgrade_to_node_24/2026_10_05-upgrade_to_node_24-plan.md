---
name: "Upgrade to Node 24"
description: "Pin Node 24 and upgrade the toolchain (Vite, TypeScript, linter, Tailwind, React) so the project builds and runs on Node 24."
created_at: "2026-10-05T18:44:42Z"

created_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

implemented_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

last_implementation_at: "2026-10-05T18:52:40Z"
has_completed_all_phases: "false"
---

# 🟢 Upgrade to Node 24

## 🎯 Goal

Make the QR generator build and run on Node 24 by pinning the Node version and upgrading the outdated toolchain (Vite, TypeScript, linter, Tailwind and React), keeping the UI behavior unchanged.

## 👀 Context

- **Root cause**: Vite `2.6.13` loads [`vite.config.js`](../../../vite.config.js) by hooking `require.extensions` and injecting the bundled config with `module._compile`. That mechanism no longer works on Node 24, so `npm run dev` and `npm run build` fail with `failed to load config ... config must export or return an object`.
- [`package.json`](../../../package.json): no `"type": "module"`, no `engines` field. Scripts: `dev`, `build` (`tsc && vite build`), `serve`, `type-check`. `typescript` and all `@types/*` are in `dependencies`. `@types/jest` is installed but there are no tests. `eslintConfig` extends `standard`, which cannot parse TypeScript.
- Installed toolchain: `vite@2.6.13`, `@vitejs/plugin-react@1.0.7`, `typescript@4.4.4`, `tailwindcss@2.2.19`, `postcss@8.3.11`, `autoprefixer@10.4.0`, `standard@16.0.4`, `react@17.0.2`, `react-dom@17.0.2`, `react-color@2.19.3`, `qr-code-styling@1.6.0-rc.1`.
- [`package-lock.json`](../../../package-lock.json): `lockfileVersion` 2.
- Node version pinning: no `.nvmrc`, `.node-version`, `.tool-versions` or `engines`. [`vercel.json`](../../../vercel.json) only contains SPA rewrites (Vercel reads `engines.node` from `package.json`).
- [`tsconfig.json`](../../../tsconfig.json): `target: es5`, `moduleResolution: node`, `jsx: react-jsx`, `typeRoots: ["node_modules/@types", "src/types"]`, no `vite/client` types.
- [`src/types/images.d.ts`](../../../src/types/images.d.ts): ambient declarations for `*.svg`, `*.png`, `*.jpg`, `*.jpeg`, `*.icon` (covered by `vite/client` once added).
- [`tailwind.config.js`](../../../tailwind.config.js): Tailwind 2 options `mode: 'jit'`, `purge`, `darkMode: false`, `variants`. [`postcss.config.js`](../../../postcss.config.js) uses `tailwindcss` + `autoprefixer`. Classes in `src/` have no Tailwind 3 breaking renames.
- [`src/main.tsx`](../../../src/main.tsx): uses `ReactDOM.render` (React 17 API).
- [`src/components/ColorField.tsx`](../../../src/components/ColorField.tsx): uses `SketchPicker` from `react-color`, the dependency most at risk with React 18.
- No CI workflows, no tests, no `AGENTS.md` or `docs/` directory.

## 📜 Public contracts

- `package.json` scripts: keep `dev`, `build`, `serve`, `type-check`. Add `lint` in Phase 3.
- Test suites: none exist and none are created. Each phase is verified with `type-check`, `build`, `lint` (from Phase 3) and a manual browser check.
- UI text copies: no changes.

## 🪜 Phases

### Phase 1: Pin Node 24 and upgrade Vite

Pin the Node version and upgrade Vite so `npm run dev` and `npm run build` work again on Node 24. This is the minimum change that unblocks local development and Vercel deploys.

- [x] Add `.nvmrc` with `24`.
- [x] Add `"engines": { "node": ">=24" }` to `package.json`.
- [x] Check the latest major versions with `npm view vite version` and `npm view @vitejs/plugin-react version` and confirm their Node engine range includes 24. _(`vite@8.3.2` and `@vitejs/plugin-react@6.1.2`, both `^20.19.0 || >=22.12.0`.)_
- [x] Upgrade `vite` and `@vitejs/plugin-react` to those versions. _(The old `@vitejs/plugin-react@1.0.7` had to be uninstalled first: its `@babel/core@7.15.8` conflicted with the new plugin peers. Vite 8 also requires `@types/node >=20.19`, so `@types/node` was upgraded to `24.19.1` here instead of in Phase 2.)_
- [x] Adapt `vite.config.js` to the new Vite config API if needed. _(Renamed to `vite.config.mjs`: Vite 8 warned about ESM syntax in a file loaded as CommonJS. `"type": "module"` was not used because `postcss.config.js` and `tailwind.config.js` use `module.exports`.)_
- [x] Add a `src/vite-env.d.ts` with `/// <reference types="vite/client" />`.
- [x] If the new Vite type definitions do not compile with TypeScript 4.4, move the TypeScript upgrade from Phase 2 into this phase. _(Needed: TS 4.4 could not parse `@types/node@24`. Upgraded to `typescript@5.9.3`.)_
- [x] Regenerate `package-lock.json` with Node 24.
- [x] Run `npm run dev` and `npm run build` on Node 24 and check the app in the browser (QR preview, color pickers, logo upload, download). _(Checked with `npm run dev`: one QR canvas, size change, color picker + `Escape`, remove logo, PNG download, no console errors.)_
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check` and `npm run build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Upgrade TypeScript and type packages

Move to TypeScript 5 with modern compiler options and clean up the dependency groups.

- [x] Upgrade `typescript` to the latest 5.x. _(Done in Phase 1.)_
- [x] Upgrade `@types/react`, `@types/react-dom` to their latest 17.x. _(`@types/react@17.0.93`, `@types/react-dom@17.0.26`.)_ _(`@types/node@24.19.1` already done in Phase 1.)_
- [x] Move `typescript` and every `@types/*` package from `dependencies` to `devDependencies`.
- [x] Remove `@types/jest` (there are no tests).
- [x] Update `tsconfig.json`: `target: "ES2020"`, `moduleResolution: "bundler"`, add `"types": ["vite/client"]` if not already covered by `src/vite-env.d.ts`. _(Already covered by `src/vite-env.d.ts`, so no `types` entry was added. `typeRoots` was removed: it pointed to `src/types`, which no longer holds declaration packages.)_
- [x] Remove `src/types/images.d.ts` if `vite/client` already covers its asset declarations. _(Removed: the only asset import is `assets/logo.svg`, declared by `vite/client`.)_
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check` and `npm run build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Replace the linter with a TypeScript-aware one

Replace `standard` (cannot parse `.ts`/`.tsx`) with `neostandard`, keeping the Standard code style with TypeScript support on ESLint 9.

- [ ] Remove `standard` and the `eslintConfig` field from `package.json`.
- [ ] Install `neostandard` and `eslint` 9 as dev dependencies.
- [ ] Add `eslint.config.js` (flat config) using `neostandard({ ts: true })`, ignoring `dist`.
- [ ] Add the `lint` script: `eslint .`.
- [ ] Run `npm run lint` and fix the reported issues in `src/`.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 4: Upgrade Tailwind to v3

Upgrade Tailwind CSS to v3 with a config-only migration and confirm the UI looks the same.

- [ ] Take desktop (~1280px) and mobile (~375px) screenshots of the current UI as a baseline.
- [ ] Upgrade `tailwindcss` to the latest 3.x, and `postcss` and `autoprefixer` to their latest versions.
- [ ] Migrate `tailwind.config.js`: rename `purge` to `content`, remove `mode: 'jit'`, `darkMode: false` and `variants`.
- [ ] Compare new screenshots against the baseline and fix any visual differences.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 5: Upgrade React to v18

Upgrade React to v18 and switch to the `createRoot` API.

- [ ] Upgrade `react`, `react-dom` to the latest 18.x and `@types/react`, `@types/react-dom` to the latest 18.x.
- [ ] Replace `ReactDOM.render` with `createRoot` from `react-dom/client` in `src/main.tsx`.
- [ ] Check in the browser that the QR preview renders once (StrictMode double effects in development must not append two QR canvases).
- [ ] Check in the browser that the `react-color` pickers in `ColorField` still open, change colors and close with `Escape` and outside click.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

Implement **Phase 3: Replace the linter with a TypeScript-aware one**.

Types tightened at the pit stop by 🐢 💨 🏎️ 🔧 (Turbotuga™, [Codely](https://codely.com)’s mascot)
