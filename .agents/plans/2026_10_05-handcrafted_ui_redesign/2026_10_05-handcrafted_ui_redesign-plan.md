---
name: "Handcrafted UI redesign"
description: "Redesign the QR generator UI with a printed-label identity built around the evertcode mascot so it no longer looks like a generic AI-generated template."
created_at: "2026-10-05T19:17:28Z"

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

last_implementation_at: "2026-10-05T19:26:38Z"
has_completed_all_phases: "false"
---

# 🏷️ Handcrafted UI redesign

## 🎯 Goal

Give the QR generator its own visual identity, a printed label look built around the evertcode pixel mascot, with a personal English voice, so it stops looking like a generic AI-generated Tailwind template. Behavior and accessibility stay the same.

## 👀 Context

Signals that make the current UI look generated:

- [`src/App.css`](../../../src/App.css): body gradient `linear-gradient(62deg, #8ec5fc, #e0c3fc)`, one of the most copied gradients.
- [`src/App.tsx`](../../../src/App.tsx): two identical white cards `bg-white rounded-2xl shadow-lg p-6` side by side (preview and controls), default QR data `https://github.com/evertcode`, default logo embedded as a base64 copy of `assets/logo.svg`, `imageName` initial value `Default logo`.
- [`src/components/Section.tsx`](../../../src/components/Section.tsx): `text-sm font-semibold uppercase tracking-wide text-gray-500` section titles.
- [`src/components/Input.tsx`](../../../src/components/Input.tsx), [`src/components/SizeField.tsx`](../../../src/components/SizeField.tsx), [`src/components/SelectExtension.tsx`](../../../src/components/SelectExtension.tsx): every field `rounded-lg border-gray-200 shadow-sm`.
- [`src/components/ColorField.tsx`](../../../src/components/ColorField.tsx): stock `react-color` `SketchPicker` (also logs a React 18.3 `defaultProps` deprecation warning).
- [`src/components/InputFile.tsx`](../../../src/components/InputFile.tsx): cloud icon box with uppercase `Select an image`.
- [`src/components/Header.tsx`](../../../src/components/Header.tsx): centered Poppins title and a feature-list subtitle.
- [`src/components/Footer.tsx`](../../../src/components/Footer.tsx): generic footer with mascot, copyright and GitHub icon.
- [`src/favicon.svg`](../../../src/favicon.svg): the default Vite logo.
- [`index.html`](../../../index.html): title `QR Code Generator`, loads Poppins 400/600/700/800 (only used by the `h1`).
- [`tailwind.config.js`](../../../tailwind.config.js): default palette, `green` mapped to `emerald`, `popins` font.
- [`src/styles/focusRing.ts`](../../../src/styles/focusRing.ts): shared focus ring classes (`ring-green-600`).
- [`assets/logo.svg`](../../../assets/logo.svg): evertcode pixel mascot, colors `#84cc16` (lime), `#3f6212` (moss), `#fff`. Currently the only element with personality.
- Verification commands: `npm run type-check`, `npm run lint`, `npm run build`. No tests, no `AGENTS.md`, no `docs/`.

Design tokens to introduce:

| Token | Value | Use |
|---|---|---|
| `paper` | `#f4f1ea` | page background |
| `ink` | `#1c1b18` | main text and QR default color |
| `muted` | `#5c5850` | secondary text (≥ 4.5:1 on `paper`) |
| `rule` | `#d9d4c7` | thin dividers and field lines |
| `lime` | `#84cc16` | decorative mascot accent only (low contrast on `paper`) |
| `moss` | `#3f6212` | primary action, focus ring, links |

Fonts: IBM Plex Sans (text) and IBM Plex Mono (values, wordmark), replacing Poppins.

## 📜 Public contracts

### UI components

- `Section`: gains an optional `number?: string` prop rendered as `01`, `02`… (Phase 2). Optional because the `Save` section has no number.
- `QrLabel` (new, Phase 2): props `content: string`, `width: number`, `height: number`, `children: ReactNode`. Renders the cut-out label and its caption.
- `ColorField`: same props, implemented with a native `<input type="color">` plus a hex text field; `react-color` and `@types/react-color` are removed (Phase 4).
- `SelectExtension` is replaced by `FormatPicker` (`id`, `label`, `fileExtension`, `onExtensionChange: (extension: FileExtension) => void`), a radio group of `svg`, `png`, `jpeg`, `webp` (Phase 4).

### UI text copies

| Where | Current | New | Phase |
|---|---|---|---|
| Wordmark | (none) | `evertcode / qr` | 1 |
| Headline | `QR Code Generator` | `Make a QR that looks like yours.` | 1 |
| Subtitle | `Turn any link or text into a custom QR code. Pick colors, add your logo and download it as SVG, PNG, JPEG or WEBP.` | `No sign-up, no tracking. Nothing leaves your browser.` | 1 |
| Section titles | `Content` / `Size` / `Colors` / `Logo` / `Download` | `01 Link` / `02 Size` / `03 Ink` / `04 Logo` / `Save` | 5 |
| Content field label | `URL or text` | `Link or text` | 5 |
| Content placeholder | `https://www.google.com/` | `https://your-site.com` | 5 |
| Empty content error | `Enter a URL or some text to generate the QR code.` | `Nothing to encode yet. Paste a link or type something.` | 5 |
| Size labels | `Width (px)` / `Height (px)` | `Width` / `Height` (with a `px` suffix) | 3 |
| Color labels | `Dots color` / `Corners square color` / `Corners dot color` | `Dots` / `Eye frame` / `Eye center` | 5 |
| Logo upload | `Select an image` | `Add a logo` | 5 |
| Default logo name | `Default logo` | `evertcode mascot` | 5 |
| Logo actions | `Change` / `Remove logo` | `change` / `remove` | 4 |
| Format label | `Format` | `File format` | 4 |
| Download button | `Download {EXT}` | `Save as {EXT}` | 4 |
| Footer | `© {year} evertcode — @evertcode` | `Made by evertcode` + `GitHub` link | 5 |
| Page title | `QR Code Generator` | `QR · evertcode` | 5 |
| Meta description | (none) | `Make a custom QR code in your browser.` | 5 |

## 🪜 Phases

### Phase 1: Base identity

Replace the template look at the root: palette, fonts, background, favicon and header. The page already reads as evertcode even before the controls are restyled.

- [x] Add the `paper`, `ink`, `muted`, `rule`, `lime` and `moss` colors to `tailwind.config.js`, and set IBM Plex Sans and IBM Plex Mono as the `sans` and `mono` font families. Remove the `popins` font. _(The `green` → `emerald` mapping stays until Phase 4, components still use `green-*`.)_
- [x] Load IBM Plex Sans (400, 500, 600) and IBM Plex Mono (400, 500) in `index.html` instead of Poppins.
- [x] Replace the body gradient in `src/App.css` with the flat `paper` background and `ink` text color.
- [x] Replace the Vite favicon in `src/favicon.svg` with the evertcode mascot. _(Copied from `assets/logo.svg`.)_
- [x] Redesign `Header`: `evertcode / qr` wordmark with the mascot on a top rule, left-aligned headline `Make a QR that looks like yours.` and subtitle `No sign-up, no tracking. Nothing leaves your browser.`. _(Added `text-balance` so the headline splits into two even lines instead of leaving `yours.` alone.)_
- [x] Switch the shared focus ring in `src/styles/focusRing.ts` to `moss` with a `paper` offset.
- [x] Check contrast of `ink`, `muted` and `moss` on `paper` (≥ 4.5:1) and review the page in the browser at ~1280px and ~375px. _(`ink` 15.3:1, `muted` 6.3:1, `moss` 6.3:1, white on `moss` 7.1:1. `lime` 1.75:1 and `rule` 1.31:1 are decorative only.)_
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Layout and preview label

Replace the two twin cards with a single sheet split by thin rules, and present the QR as a cut-out label.

- [x] Replace the preview and controls cards in `src/App.tsx` with one sheet on `paper`, divided by `rule` lines instead of shadows and large radii. _(Top `ink` rule, `5fr / 6fr` columns split by a `rule` line on large screens, horizontal `rule` between preview and controls on mobile.)_
- [x] Render the QR preview as a label: white tag with a dashed cut border and a caption showing the encoded content (truncated) and the size in `ink` mono text. _(New `QrLabel` component: dashed `muted` cut border with a ✂ mark, white tag, caption with truncated content and `W × H px`.)_
- [x] Add the `number` prop to `Section` and render the number in mono next to the title, with a rule after it. _(Optional prop: the `Download` section has no number.)_
- [x] Keep the preview sticky on large screens and stacked on mobile.
- [x] Review the page in the browser at ~1280px and ~375px. _(Sticky preview, long content truncated in the caption, no horizontal overflow on mobile, no console errors.)_
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Fields and size

Restyle the text and size fields as flat, ruled form fields with mono values.

- [x] Restyle `Input`: no shadow, bottom `rule` line that turns `moss` on focus, mono value text, error in red with sufficient contrast on `paper`. _(The bottom line uses `muted` (6.3:1) instead of `rule` (1.31:1) to meet the 3:1 non-text contrast for control boundaries. Error uses `red-700` (5.7:1) and keeps the red line while focused. Shared classes in `src/styles/field.ts`.)_
- [x] Restyle `SizeField`: same field style, `px` suffix inside the field, labels `Width` / `Height`, and a combined `300 × 300 px` readout. _(Readout row: `100–1000 px each side` on the left, `W × H px` on the right. Native number spinners hidden.)_
- [x] Style the range slider in `src/App.css` (thin `ink` track, square `moss` thumb) for WebKit and Firefox, keeping a visible focus state. _(2px `moss` outline on `:focus-visible`.)_
- [x] Review the fields in the browser (typing, invalid values, slider, keyboard focus). _(Valid value updates the QR, empty and out-of-range values are ignored and restored on blur, arrow keys move the slider in 10px steps.)_
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 4: Color, logo and save

Replace the stock third-party look of the color picker, logo upload and download controls.

- [ ] Rewrite `ColorField` with a native `<input type="color">` swatch and a mono hex text field that accepts `#rgb` / `#rrggbb` and ignores invalid values.
- [ ] Remove `react-color` and `@types/react-color`.
- [ ] Restyle `InputFile`: plain `Add a logo` text button with a small mascot-free icon when empty, and a row with thumbnail, file name and `change` / `remove` text links when a logo is set.
- [ ] Replace `SelectExtension` with `FormatPicker`, a keyboard-accessible radio group of `svg` / `png` / `jpeg` / `webp` labelled `File format`.
- [ ] Restyle the download button as `Save as {EXT}` in `moss` with white text, and remove the `green` → `emerald` mapping from `tailwind.config.js` once no component uses `green-*`.
- [ ] Review in the browser: color changes from swatch and hex field, logo upload / change / remove, format switching with keyboard, download.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 5: Copy and finishing details

Apply the remaining personal copy and polish the footer and page metadata.

- [ ] Update the remaining UI copies listed in the public contracts table (section titles, field label, placeholder, error, color labels, logo copies).
- [ ] Restyle `Footer` as a single ruled line: `Made by evertcode` with the mascot and a `GitHub` text link.
- [ ] Update `index.html`: `<title>QR · evertcode</title>` and the meta description.
- [ ] Final review in the browser at ~1280px and ~375px, including keyboard navigation and contrast.
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`npm run type-check`, `npm run lint` and `npm run build`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

Implement **Phase 4: Color, logo and save**.

Fields ruled by hand by 🐢 💨 🖋️ ✂️ 📏 (Turbotuga™, [Codely](https://codely.com)’s mascot)
