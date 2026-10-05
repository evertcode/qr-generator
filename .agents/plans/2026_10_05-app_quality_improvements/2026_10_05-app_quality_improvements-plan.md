---
name: "App quality improvements"
description: "Harden the QR generator with input validation, an error correction selector, copy to clipboard, a refactor for performance, accessibility polish, CI, docs and security headers."
created_at: "2026-10-05T19:45:53Z"

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

last_implementation_at: "2026-10-05T22:24:57Z"
has_completed_all_phases: "false"
---

# App quality improvements

## 🎯 Goal

Make the QR generator robust and maintainable: validate user input (logo file and QR text capacity) with accessible feedback, let users pick the error correction level and copy the QR to the clipboard, and back everything with tests, CI, docs and security headers.

## 👀 Context

- [`src/App.tsx`](../../../src/App.tsx): holds all state in a single `Options` object from `qr-code-styling@1.6.0-rc.1`.
  - Line 38: default logo is an inline base64 SVG, although [`assets/logo.svg`](../../../assets/logo.svg) exists.
  - Line 43: `errorCorrectionLevel` is hard-coded to `'Q'`.
  - Line 70: `useState(new QRCodeStyling(options))` builds a new instance on every render (the argument is evaluated even if discarded).
  - Lines 77-80: `qrCode.update(options)` runs on every keystroke, no debounce.
  - Lines 109-135: `onChangeImage` does not validate type or size; `reader.onerror` clears the image silently.
  - Lines 151-179: three near-identical color handlers; lines 91-103: two near-identical size handlers.
  - Line 146: `qrCode.download(...)`; line 278: download button `disabled={isDataEmpty}`.
  - Line 208: size grid is `grid-cols-2` on every viewport.
- [`src/types/ui.ts`](../../../src/types/ui.ts): component prop interfaces (`InputProps`, `SizeFieldProps`, `ColorFieldProps`, `InputFileProps`, `FormatPickerProps`, `SectionProps`, `QrLabelProps`) and handler type aliases. New types go here, following the "custom types for all data structures" rule.
- [`src/utils/hexColor.ts`](../../../src/utils/hexColor.ts): `normalizeHexColor(value: string): string | null`.
- [`src/components/InputFile.tsx`](../../../src/components/InputFile.tsx): logo picker with `accept='image/*'` only, no error display.
- [`src/components/FormatPicker.tsx`](../../../src/components/FormatPicker.tsx): radio group pattern to reuse for the error correction picker.
- [`src/components/ColorField.tsx`](../../../src/components/ColorField.tsx) and [`src/components/SizeField.tsx`](../../../src/components/SizeField.tsx): draft state + blur reset fields.
- [`package.json`](../../../package.json): scripts `dev`, `build` (`tsc && vite build`), `serve`, `type-check`, `lint`. No test tooling.
- [`vercel.json`](../../../vercel.json): SPA rewrites only, no security headers.
- `npm audit`: 6 high severity vulnerabilities in transitive deps (`braces`, `brace-expansion` via `tailwindcss`/`chokidar`).
- No tests, no CI (`.github/workflows`), no `README.md`, no `AGENTS.md`, no `docs/`. Lint and type-check currently pass.
- Code style: ESLint with `neostandard` (no semicolons, single quotes, JSX single quotes, space before function parens). Tests go in `tests/`.

## 📜 Public contracts

### Application functions and hooks

- `useQrCode(options: Options): UseQrCodeResult` in `src/hooks/useQrCode.ts`, with `UseQrCodeResult { containerRef: RefObject<HTMLDivElement>; qrCode: QRCodeStyling }`.
- `useDebouncedValue<T>(value: T, delayMs: number): T` in `src/hooks/useDebouncedValue.ts`.
- `QrColorTarget = 'dots' | 'cornersSquare' | 'cornersDot'` in `src/types/qr.ts`, used by a single `onChangeColor(target: QrColorTarget)` handler factory in `App`.
- `validateLogoFile(file: File): LogoValidationResult` in `src/utils/validateLogoFile.ts`, with `LogoValidationResult = { ok: true } | { ok: false; reason: LogoValidationError }` and `LogoValidationError = 'unsupported-type' | 'too-large'`. Accepted types: `image/png`, `image/jpeg`, `image/svg+xml`, `image/webp`. Max size: 1 MB.
- `getQrByteCapacity(level: ErrorCorrectionLevel): number` and `exceedsQrCapacity(data: string, level: ErrorCorrectionLevel): boolean` in `src/utils/qrCapacity.ts`. Byte mode, version 40 limits: L 2953, M 2331, Q 1663, H 1273. Data length measured in UTF-8 bytes.
- `copyQrToClipboard(qrCode: QRCodeStyling): Promise<CopyResult>` in `src/utils/copyQrToClipboard.ts`, with `CopyResult = 'copied' | 'unsupported' | 'failed'`.

### Components and props

- `InputFileProps`: add `error?: string`.
- New `ErrorCorrectionPicker` component with `ErrorCorrectionPickerProps { id: string; label: string; level: ErrorCorrectionLevel; onLevelChange: ErrorCorrectionLevelChangeHandler; hint?: string }`.
- `ColorFieldProps`: add `hint?: string`, linked with `aria-describedby`.

### Test suites

- `tests/utils/hexColor.test.ts`
  - normalizes `#rgb` shorthand to `#rrggbb`
  - accepts a valid `#rrggbb` value
  - accepts values without the leading `#`
  - ignores surrounding whitespace
  - is case insensitive and returns lowercase
  - returns `null` for invalid values (empty, wrong length, non hex chars, color names)
- `tests/hooks/useDebouncedValue.test.ts`
  - returns the initial value immediately
  - emits the new value after the delay
  - drops intermediate values when changes happen within the delay
- `tests/App.test.tsx` (mocks `qr-code-styling`, since jsdom has no canvas)
  - renders with the default text and logo
  - updates the QR label when typing in the text field
  - disables the download button when the text is empty
  - shows an error and keeps the previous logo when uploading an unsupported file type (Phase 3)
  - shows an error and keeps the previous logo when uploading a file over 1 MB (Phase 3)
  - shows an error when the file cannot be read (Phase 3)
  - replaces the logo with a valid upload (Phase 3)
  - selects `Q` as the default error correction level (Phase 4)
  - shows the capacity error and disables download when the text exceeds the selected level capacity (Phase 4)
  - never sends text over the capacity to the QR renderer (Phase 4)
  - shows the logo hint when a logo is set and the level is `L` or `M` (Phase 4)
  - announces the copy result in the live region (Phase 5)
- `tests/utils/validateLogoFile.test.ts`
  - accepts each supported image type
  - rejects an unsupported type with `unsupported-type`
  - accepts a file of exactly 1 MB
  - rejects a file over 1 MB with `too-large`
- `tests/utils/qrCapacity.test.ts`
  - returns the byte capacity for each level
  - does not exceed when data is at the limit
  - exceeds when data is one byte over the limit
  - counts multibyte UTF-8 characters by bytes, not by length
- `tests/utils/copyQrToClipboard.test.ts`
  - returns `copied` and writes a PNG `ClipboardItem`
  - returns `unsupported` when `ClipboardItem` is missing
  - returns `unsupported` when `navigator.clipboard.write` is missing
  - returns `failed` when the clipboard write rejects
  - returns `failed` when the QR code cannot be rendered as PNG

### UI text copies

- Logo errors:
  - "Use a PNG, JPEG, SVG or WebP image."
  - "That image is over 1 MB. Try a smaller one."
  - "We couldn't read that file. Try another one."
- Error correction:
  - Label: "Error correction"
  - Capacity error: "Too long for a QR code at level {level}. Shorten it or pick a lower level."
  - Logo hint: "Logos cover part of the code. Use Q or H so it still scans."
- Copy:
  - Button: "Copy image"
  - Status: "Copied to clipboard", "Your browser can't copy images. Download it instead.", "Couldn't copy the image. Try again."
- Hints:
  - Eye frame: "The outer square in each corner."
  - Eye center: "The dot inside each corner square."

## 🪜 Phases

### Phase 1: Test tooling

Add Vitest and Testing Library so the project has a runnable test command, and cover the existing hex color utility as the first suite.

- [x] Install `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/user-event` and `@testing-library/jest-dom` as dev dependencies (versions compatible with React 18 and Vite 8). _(`vitest@5.0.3`, `jsdom@30.1.2`, `@testing-library/react@16.3.3` plus its peer `@testing-library/dom@10.4.2`, `@testing-library/user-event@14.6.7`, `@testing-library/jest-dom@7.0.1`, pinned exact like the rest of the deps.)_
- [x] Configure Vitest (`test` block in [`vite.config.mjs`](../../../vite.config.mjs) or a `vitest.config.mjs`) with the `jsdom` environment and a setup file `tests/setup.ts` that loads `@testing-library/jest-dom`. _(`test` block added to `vite.config.mjs` via `defineConfig` from `vitest/config`. The setup file also registers `cleanup` after each test, since Vitest globals are off.)_
- [x] Add the `"test": "vitest run"` script to `package.json`.
- [x] Make `tsconfig.json` and ESLint cover the `tests/` folder. _(ESLint already lints the whole repo; only `tsconfig.json` `include` needed `tests`.)_
- [x] Create `tests/utils/hexColor.test.ts` with the cases listed in the public contracts. _(The util accepts values without `#` and trims whitespace, so the contract cases were adjusted; 14 tests pass.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Refactor and performance

Extract the QR lifecycle out of `App`, create the instance once, debounce updates and remove duplicated handlers, with no visible behavior change.

- [x] Create `src/hooks/useQrCode.ts` with a lazy `useState(() => new QRCodeStyling(options))`, appending to `containerRef` and calling `update` on options change. _(Returns `UseQrCodeResult`, declared in the new `src/types/qr.ts`.)_
- [x] Create `src/hooks/useDebouncedValue.ts` and pass debounced options to `useQrCode` (around 150 ms) so typing does not redraw on every keystroke. _(`QR_UPDATE_DELAY_MS = 150`. `onDownload` calls `qrCode.update(options)` with the live options first, so saving right after typing never exports a stale code.)_
- [x] Add `QrColorTarget` to `src/types/qr.ts` and replace the three color handlers with a single `onChangeColor(target)` factory. Merge the width and height handlers in the same way. _(`onChangeSize(dimension: QrSizeDimension)`; the color option key is derived with the template literal type `QrColorOptionKey = \`${QrColorTarget}Options\``.)_
- [x] Replace the inline base64 default logo with an import of [`assets/logo.svg`](../../../assets/logo.svg) and check it still renders and downloads in all formats. _(The inline base64 was byte-identical to `assets/logo.svg`. Checked on the production build with Playwright: logo visible in the preview, SVG/PNG/JPEG/WebP downloads work, no console errors.)_
- [x] Create `tests/hooks/useDebouncedValue.test.ts` and `tests/App.test.tsx` with the base cases listed in the public contracts (mocking `qr-code-styling`). _(20 tests pass in total.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Logo validation

Reject unsupported or oversized logo files and show readable, accessible errors instead of failing silently.

- [x] Create `src/utils/validateLogoFile.ts` with `LogoValidationResult` and `LogoValidationError` types in `src/types/qr.ts`. _(Also exports `LOGO_ACCEPTED_TYPES` and `LOGO_MAX_BYTES`, and adds `LogoUploadError = LogoValidationError | 'unreadable'` to map every error to its copy in `App`.)_
- [x] Narrow the file input `accept` attribute to the supported MIME types.
- [x] In `App`, validate before reading the file; on failure keep the previous logo and set the error message. On `reader.onerror`, keep the previous logo and show the read error. Clear the error on a successful upload or removal. _(The file name is now set only after a successful read, so a failed upload no longer shows a new name next to the old logo.)_
- [x] Add `error?: string` to `InputFileProps` and render it in [`InputFile`](../../../src/components/InputFile.tsx) with `role="alert"`, matching the error style of [`Input`](../../../src/components/Input.tsx). _(The add/change buttons point to the error with `aria-describedby`.)_
- [x] Create `tests/utils/validateLogoFile.test.ts` and add the Phase 3 cases to `tests/App.test.tsx`. _(Added an extra happy path case, "replaces the logo with a valid upload". Upload tests use `userEvent.setup({ applyAccept: false })` because the input `accept` filter would otherwise drop rejected files before they reach the app. 33 tests pass.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 4: Error correction selector and text capacity

Let users choose the error correction level and stop them from generating a QR that does not fit the text.

- [x] Create `src/utils/qrCapacity.ts` with `getQrByteCapacity` and `exceedsQrCapacity`.
- [x] Create the `ErrorCorrectionPicker` component following the [`FormatPicker`](../../../src/components/FormatPicker.tsx) radio group pattern, with `ErrorCorrectionPickerProps` and `ErrorCorrectionLevelChangeHandler` in [`src/types/ui.ts`](../../../src/types/ui.ts). _(Added an optional `hint?: string` prop, rendered under the options and linked to the fieldset with `aria-describedby`, to show the logo hint.)_
- [x] Wire it in `App` to `qrOptions.errorCorrectionLevel`, keeping `Q` as the default. _(Placed in the Logo section, below the logo picker, since the logo is the main reason to change the level.)_
- [x] Show the capacity error on the text field and disable the download button when the text exceeds the capacity. _(Found while implementing: `qr-code-styling` throws `code length overflow` inside the update effect and React unmounts the whole app. `useQrCode` now skips updates with data over capacity and keeps the last valid drawing. Checked in the browser at the exact limit and one byte over for L, M, Q and H: no library errors, message shown, app stays alive.)_
- [x] Show the logo hint when a logo is set and the level is `L` or `M`.
- [x] Create `tests/utils/qrCapacity.test.ts` and add the Phase 4 cases to `tests/App.test.tsx`. _(Extra case "never sends text over the capacity to the QR renderer", confirmed to fail when the guard is removed. 44 tests pass.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 5: Copy to clipboard

Add a "Copy image" action next to the download button that copies the QR as PNG and announces the result.

- [x] Create `src/utils/copyQrToClipboard.ts` using `qrCode.getRawData('png')` and `navigator.clipboard.write([new ClipboardItem(...)])`, returning a `CopyResult`. Add `CopyResult` to `src/types/qr.ts`. _(The `ClipboardItem` receives the pending PNG promise instead of an awaited blob, so Safari keeps the write tied to the click. A `null` PNG returns `failed`.)_
- [x] Add the "Copy image" button in `App`, disabled under the same conditions as the download button. _(Outlined secondary style next to "Save as". Copy and download share a `flushQrCode` helper so both export the latest edits.)_
- [x] Add a polite `aria-live` status region that shows the copy messages and clears after a few seconds. _(`<p role="status">` always rendered, cleared after 4 s. Checked in Chromium with real clipboard permissions: a 300×300 `image/png` lands on the clipboard and the message clears.)_
- [x] Create `tests/utils/copyQrToClipboard.test.ts` and add the Phase 5 case to `tests/App.test.tsx`. _(Extra cases: `unsupported` split into missing `ClipboardItem` and missing `clipboard.write`, plus `failed` when the PNG cannot be rendered. The App case finds the message by text because the size `<output>` also has the implicit `status` role. 50 tests pass.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 6: Mobile layout and field hints

Make the form comfortable on small screens and explain the QR jargon in the color fields.

- [ ] Change the size grid in `App` to `grid-cols-1 sm:grid-cols-2`, and check the color and size rows at 360 px width.
- [ ] Add `hint?: string` to `ColorFieldProps`, render it under the field and link it with `aria-describedby`.
- [ ] Pass the Eye frame and Eye center hints from `App`.
- [ ] Add a test to `tests/App.test.tsx` checking the Eye frame field is described by its hint.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 7: CI and documentation

Automate the verification on every push and pull request, and document how to work on the project.

- [ ] Create `.github/workflows/ci.yml` running on `push` and `pull_request`: `actions/setup-node` with `node-version-file: .nvmrc` and npm cache, then `npm ci`, `npm run lint`, `npm run type-check`, `npm test` and `npm run build`.
- [ ] Create `README.md` with the project description, requirements (Node 24), scripts and deploy notes (Vercel).
- [ ] Create `AGENTS.md` with the verification command, code style (`neostandard`), folder conventions (`src/components`, `src/hooks`, `src/utils`, `src/types`, `tests/`), the custom types rule and the plans folder (`.agents/plans`).
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 8: Security hardening

Add security headers to the Vercel deployment and fix the non-breaking dependency vulnerabilities.

- [ ] Add a `headers` block to [`vercel.json`](../../../vercel.json) with `Content-Security-Policy` (allowing Google Fonts, `data:` and `blob:` images for uploaded logos and canvas exports), `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-Frame-Options: DENY` and a restrictive `Permissions-Policy`.
- [ ] Check the CSP with `npm run build && npm run serve` (or a Vercel preview): generate, upload a logo, download in every format and copy, with no CSP errors in the console.
- [ ] Run `npm audit fix` (no `--force`). Leave the Tailwind 4 upgrade out of scope and note any remaining advisories in the PR description.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

Implement Phase 6 to stack the size fields on mobile and add hints to the eye color fields.

QR codes copied straight to the clipboard thanks to [Codely](https://codely.com) AI tooling. 📋 < 🐢 💨 (Turbotuga™, [Codely](https://codely.com)’s mascot)
