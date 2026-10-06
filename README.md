# QR · evertcode

Make a custom QR code in your browser: pick the text or link, size, colors, error correction level and an optional logo, then save it as SVG, PNG, JPEG or WebP, or copy it straight to the clipboard.

Everything runs client side with [`qr-code-styling`](https://github.com/kozakdenys/qr-code-styling). Nothing is uploaded.

## Requirements

- Node 24 (pinned in [`.nvmrc`](.nvmrc), run `nvm use`)
- npm

## Getting started

```sh
npm install
npm run dev
```

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build the production bundle into `dist/` |
| `npm run serve` | Preview the production build locally |
| `npm run type-check` | Run the TypeScript compiler without emitting |
| `npm run lint` | Lint the whole repo with ESLint (`neostandard`) |
| `npm test` | Run the Vitest suites in `tests/` |

Before pushing, run the same checks as CI:

```sh
npm run lint && npm run type-check && npm test && npm run build
```

## Continuous integration

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs lint, type-check, tests and build on every pull request and on pushes to `main`.

## Deploy

The app is a static SPA deployed on [Vercel](https://vercel.com). [`vercel.json`](vercel.json) serves static files first and falls back to `index.html`. Vercel builds with `npm run build` and serves `dist/`, using the Node version from the `engines` field in `package.json`.
