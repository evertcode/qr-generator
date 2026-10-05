# AGENTS.md

Guidance for AI coding agents working on this repository.

## Project

Client-side QR code generator built with React 18, TypeScript (strict), Vite 8 and Tailwind CSS 3. QR rendering is delegated to `qr-code-styling`. See [`README.md`](README.md) for the user-facing overview.

## Verification command

Run this before considering any change done. CI runs the same checks plus the build.

```sh
npm run lint && npm run type-check && npm test
```

Use `npm run build` too when touching config, assets or dependencies.

## Code style

- ESLint with [`neostandard`](https://github.com/neostandard/neostandard) (`ts: true`): no semicolons, single quotes (also in JSX), space before function parentheses, two-space indentation.
- Function components declared with `function Name () {}` and a default export per component file. Hooks and utils use named exports.
- Use custom types for all data structures. Component props and handler aliases live in [`src/types/ui.ts`](src/types/ui.ts); QR domain types live in [`src/types/qr.ts`](src/types/qr.ts).
- Keep user-facing copy as constants (see `App.tsx`) and keep it short, plain and in English.
- Comments only explain why, not what.

## Folder conventions

- `src/components/`: presentational components, one per file.
- `src/hooks/`: React hooks (`useQrCode`, `useDebouncedValue`).
- `src/utils/`: pure functions with no React dependency.
- `src/types/`: shared types.
- `src/styles/`: shared Tailwind class strings.
- `tests/`: Vitest suites mirroring `src/` (`tests/utils/`, `tests/hooks/`, `tests/App.test.tsx`). Never place tests next to source files.
- `assets/`: static assets imported from code.

## Testing

- Vitest with `jsdom` and Testing Library (`@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`). Setup in [`tests/setup.ts`](tests/setup.ts).
- jsdom has no canvas, so `qr-code-styling` is mocked in component tests.
- Query by role, label or visible text, as a user would.

## Plans

Implementation plans live in `.agents/plans/{date}-{name}/{date}-{name}-plan.md`. Implement one phase at a time and stop for review after each phase.

## Git

- Work on feature branches, never directly on `main`.
- Conventional Commits: `type: summary` in present tense, lowercase, no period.
