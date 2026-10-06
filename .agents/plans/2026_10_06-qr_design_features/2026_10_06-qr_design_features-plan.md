---
name: "QR design features"
description: "Turn the generator into a full QR design tool: shapes, background, gradients, logo controls, content types, contrast checks, presets, autosave, share links, undo/redo, print-ready export and a call-to-action frame."
created_at: "2026-10-06T02:26:37Z"

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

last_implementation_at: "2026-10-06T02:42:16Z"
has_completed_all_phases: "false"
---

# QR design features

## 🎯 Goal

Cover what users expect from an app to generate and design QR codes: full visual styling (shapes, background, margin, gradients, logo), structured content (WiFi, email, phone, SMS, vCard), guidance to keep codes scannable, and a comfortable workflow (presets, autosave, share links, undo/redo, print-ready export and a call-to-action frame).

## 👀 Context

- [`AGENTS.md`](../../../AGENTS.md): verification command, `neostandard` style, custom types rule, folder conventions (`src/components`, `src/hooks`, `src/utils`, `src/types`, `tests/`), testing conventions and Git workflow. Follow it in every phase.
- [`src/App.tsx`](../../../src/App.tsx) (356 lines):
  - Lines 64-98: the whole design lives in a single `useState<Options>` from `qr-code-styling`, with hard-coded `margin: 0`, `backgroundOptions.color: '#fff'`, `dotsOptions.type: 'rounded'`, `cornersSquareOptions.type: 'extra-rounded'`, `cornersDotOptions.type: 'dot'`, `imageOptions` (`imageSize: 0.4`, `margin: 0`, `hideBackgroundDots: true`).
  - Lines 99-102: separate state for `imageName`, `logoError`, `copyResult`, `fileExtension`.
  - Sections: `01 Link` (line 235), `02 Size` (246), `03 Ink` (273), `04 Logo` (296), `Save` (315).
  - `SIZE_MIN = 100`, `SIZE_MAX = 1000` (lines 36-37). Downloads always use the library default name `qr`.
- [`src/hooks/useQrCode.ts`](../../../src/hooks/useQrCode.ts): owns the `QRCodeStyling` instance and skips updates over capacity. [`src/hooks/useDebouncedValue.ts`](../../../src/hooks/useDebouncedValue.ts): 150 ms debounce.
- [`src/types/qr.ts`](../../../src/types/qr.ts): `QrColorTarget`, `QrColorOptionKey`, `QrSizeDimension`, `UseQrCodeResult`, `LogoValidationError`, `LogoValidationResult`, `LogoUploadError`, `CopyResult`. [`src/types/ui.ts`](../../../src/types/ui.ts): component props and handler aliases.
- [`src/components/FormatPicker.tsx`](../../../src/components/FormatPicker.tsx) and [`src/components/ErrorCorrectionPicker.tsx`](../../../src/components/ErrorCorrectionPicker.tsx): duplicated radio group markup, the base for a generic `OptionPicker`.
- [`src/utils`](../../../src/utils): `hexColor`, `qrCapacity`, `validateLogoFile`, `copyQrToClipboard`.
- `qr-code-styling@1.6.0-rc.1` options not exposed yet:
  - `DotType`: `dots | rounded | classy | classy-rounded | square | extra-rounded`.
  - `CornerSquareType`: `dot | square | extra-rounded`. `CornerDotType`: `dot | square`.
  - `Gradient`: `{ type: 'linear' | 'radial'; rotation?: number; colorStops: { offset: number; color: string }[] }` on dots, corners and background.
  - `margin`, `backgroundOptions.color`, `imageOptions.imageSize | margin | hideBackgroundDots`, `download({ name, extension })`, `getRawData(extension)`.
- No persistence, routing, URL params, presets, undo, contrast check or content type builders exist.
- Tests: [`tests/App.test.tsx`](../../../tests/App.test.tsx) mocks `qr-code-styling` with a hoisted double (`append`, `update`, `getRawData`, `download`); utils and hooks suites under `tests/utils` and `tests/hooks`.

## 📜 Public contracts

### Types (`src/types/design.ts`, new)

- `QrFill = { kind: 'solid'; color: string } | { kind: 'gradient'; gradientType: QrGradientType; rotation: number; colors: [string, string] }` (gradient variant from Phase 5), `QrGradientType = 'linear' | 'radial'`.
- `QrDesign`:
  - `content: QrContent` (Phase 1: `{ type: 'text'; text: string }` only; more variants in Phase 7)
  - `size: { width: number; height: number }`
  - `errorCorrectionLevel: ErrorCorrectionLevel`
  - `dots: { type: DotType; fill: QrFill }`
  - `cornersSquare: { type: CornerSquareType; fill: QrFill }`
  - `cornersDot: { type: CornerDotType; fill: QrFill }`
  - `background: { transparent: boolean; fill: QrFill }` (Phase 3)
  - `margin: number` (Phase 3)
  - `logo: QrLogo | null`
  - `frame: QrFrame | null` (Phase 13)
- `QrLogo { src: string; name: string; size: number; margin: number; hideBackgroundDots: boolean }` (`size`, `margin`, `hideBackgroundDots` exposed in Phase 6).
- `QrDesignAction`: discriminated union, one action per editable field (`set-content`, `set-size`, `set-error-correction`, `set-shape`, `set-fill`, `set-background`, `set-margin`, `set-logo`, `update-logo`, `remove-logo`, `apply-preset`, `set-frame`, `replace`, `reset`), extended phase by phase.
- `QrContent` (Phase 7): `{ type: 'text'; text } | { type: 'wifi'; ssid; password; encryption: QrWifiEncryption; hidden: boolean } | { type: 'email'; to; subject; body } | { type: 'phone'; number } | { type: 'sms'; number; message } | { type: 'vcard'; firstName; lastName; phone; email; organization; url }`, `QrContentType = QrContent['type']`, `QrWifiEncryption = 'WPA' | 'WEP' | 'nopass'`.
- `ScannabilityIssue = 'low-contrast' | 'inverted'` (Phase 4).
- `QrStylePreset { id: string; name: string; style: QrDesignStyle }`, `QrDesignStyle = Pick<QrDesign, 'dots' | 'cornersSquare' | 'cornersDot' | 'background' | 'margin'>` (Phase 8).
- `SaveDesignResult = 'saved' | 'saved-without-logo' | 'failed'` (Phase 9).
- `DesignHistory { design: QrDesign; dispatch: (action: QrDesignAction) => void; undo: () => void; redo: () => void; canUndo: boolean; canRedo: boolean }` (Phase 11).
- `QrExportSize = 512 | 1024 | 2048 | 4096`, `QrExportOptions { extension: FileExtension; fileName: string; size: QrExportSize | 'preview' }` (Phase 12).
- `QrFrame { text: string; color: string; textColor: string }` (Phase 13).

### Functions and hooks

- `DEFAULT_QR_DESIGN: QrDesign` in `src/design/defaultDesign.ts`.
- `toQrCodeOptions(design: QrDesign): Options` in `src/design/toQrCodeOptions.ts`.
- `qrDesignReducer(state: QrDesign, action: QrDesignAction): QrDesign` in `src/design/qrDesignReducer.ts`.
- `getContrastRatio(a: string, b: string): number` and `assessScannability(design: QrDesign): ScannabilityIssue[]` in `src/utils/contrast.ts` (Phase 4).
- `buildQrPayload(content: QrContent): string` in `src/utils/buildQrPayload.ts` (Phase 7).
- `QR_STYLE_PRESETS: readonly QrStylePreset[]` in `src/design/presets.ts` (Phase 8).
- `parseQrDesign(value: unknown): QrDesign | null`, `saveDesign(storage: Storage, design: QrDesign): SaveDesignResult`, `loadSavedDesign(storage: Storage): QrDesign | null` in `src/design/persistence.ts` (Phase 9). Stored under the `qr-design:v1` key as `{ version: 1, design }`.
- `encodeDesignToHash(design: QrDesign): string` and `decodeDesignFromHash(hash: string): QrDesign | null` in `src/design/shareLink.ts` (Phase 10).
- `useDesignHistory(initial: QrDesign): DesignHistory` in `src/hooks/useDesignHistory.ts` (Phase 11).
- `sanitizeFileName(name: string): string` and `exportQr(qrCode: QRCodeStyling, options: QrExportOptions): Promise<void>` in `src/utils/exportQr.ts` (Phase 12).
- `composeFramedQr(qr: Blob, frame: QrFrame, extension: FileExtension): Promise<Blob>` in `src/utils/composeFramedQr.ts` (Phase 13).

### Components

- `OptionPicker<T extends string>` with `OptionPickerProps<T> { id; label; value: T; options: readonly OptionPickerItem<T>[]; onChange: (value: T) => void; hint?: string }`, `OptionPickerItem<T> { value: T; label: string; icon?: ReactNode }` (Phase 2). `FormatPicker` and `ErrorCorrectionPicker` become thin wrappers over it.
- `ShapeIcon` (inline SVG thumbnails per shape) and `ShapePickers` with `ShapePickersProps { shapes: QrShapeTypes; onShapeChange: (change: QrSetShapeAction) => void }` (Phase 2).
- `FillField` with `FillFieldProps { id; label; fill: QrFill; onChange: (fill: QrFill) => void; hint?: string }` (Phase 5; Phase 3 uses `ColorField` for the solid background).
- `RangeField` with `RangeFieldProps extends SizeFieldProps { step; unit; hint? }` (Phase 3, reused in Phases 6 and 12) and `CheckboxField` with `CheckboxFieldProps { id; label; checked; onChange: (checked: boolean) => void }` (Phase 3, reused in Phases 6 and 13).
- `OptionPickerItem.disabled?` and `FormatPickerProps.disabledExtensions? / hint?` (Phase 3).
- `ContentTypeTabs` and one form per type: `TextContentForm`, `WifiContentForm`, `EmailContentForm`, `PhoneContentForm`, `SmsContentForm`, `VcardContentForm` (Phase 7).
- `PresetPicker` (Phase 8), `HistoryControls` (Phase 11), `ShareLinkButton` (Phase 10), `FrameFields` (Phase 13).

### Test suites

- `tests/design/toQrCodeOptions.test.ts`
  - maps the default design to the current options (no visual change)
  - maps a solid fill to `color`
  - maps a gradient fill to `gradient` with two `colorStops` and rotation in radians (Phase 5)
  - maps a transparent background to `rgba(0,0,0,0)` (Phase 3)
  - maps logo size, margin and hideBackgroundDots to `imageOptions` (Phase 6)
  - sends an empty `image` when there is no logo, so a removed logo is cleared
  - encodes `content` through `buildQrPayload` (Phase 7)
- `tests/design/qrDesignReducer.test.ts`
  - updates each field without touching the others
  - `reset` returns `DEFAULT_QR_DESIGN`
  - `apply-preset` changes style but keeps content, size, logo and error correction (Phase 8)
  - `replace` swaps the whole design (Phase 9)
- `tests/components/OptionPicker.test.tsx` (Phase 2)
  - renders a radio group named by the label
  - checks the selected option
  - calls `onChange` with the option value on click and with arrow keys
  - links the hint with `aria-describedby`
- `tests/utils/contrast.test.ts` (Phase 4)
  - returns 21 for black on white and 1 for equal colors
  - is symmetric
  - reports `low-contrast` below 4:1
  - reports `inverted` when the dots are lighter than the background
  - reports nothing for a transparent background
  - checks every gradient color against the background (Phase 5)
- `tests/utils/buildQrPayload.test.ts` (Phase 7)
  - returns plain text unchanged
  - builds `WIFI:T:WPA;S:<ssid>;P:<password>;H:true;;` and escapes `\ ; , : "`
  - omits the password for `nopass`
  - builds `mailto:` with URL-encoded subject and body
  - builds `tel:` stripping spaces
  - builds `SMSTO:<number>:<message>`
  - builds a vCard 3.0 with only the filled fields and escaped `; , \`
- `tests/design/presets.test.ts` (Phase 8)
  - every preset passes `assessScannability` with no issues
  - preset ids are unique
- `tests/design/persistence.test.ts` (Phase 9)
  - saves and loads the same design
  - returns `null` for missing, malformed or wrong version data
  - drops unknown fields and rejects invalid values (bad color, out of range size)
  - returns `saved-without-logo` when storage throws a quota error with the logo
  - returns `failed` when storage is unavailable
- `tests/design/shareLink.test.ts` (Phase 10)
  - round trips a design through the hash
  - leaves out an uploaded logo and keeps the default logo
  - returns `null` for a malformed hash
- `tests/hooks/useDesignHistory.test.ts` (Phase 11)
  - undo and redo walk the history
  - a new change after undo drops the redo stack
  - consecutive edits of the same field within 500 ms count as one step
  - limits history to 100 steps
- `tests/utils/exportQr.test.ts` (Phase 12)
  - `sanitizeFileName` strips path separators and reserved chars, trims, falls back to `qr`
  - exports at the chosen size without changing the preview size
  - uses the sanitized file name
- `tests/utils/composeFramedQr.test.ts` (Phase 13)
  - returns an SVG that wraps the QR and contains the escaped frame text
  - returns a raster blob of the expected type for PNG, JPEG and WebP
- `tests/App.test.tsx`: new cases per phase, listed in each phase.

### UI text copies

- Phase 1: "Reset design", status "Design reset".
- Phase 2: section "Shape"; labels "Dots", "Eye frame", "Eye center"; dot options "Rounded", "Dots", "Classy", "Classy rounded", "Square", "Extra rounded"; eye frame options "Rounded", "Square", "Circle"; eye center options "Dot", "Square".
- Phase 3: section "Background"; "Background color", "Transparent background", "Margin"; hint "Leave some margin so scanners can find the code."; "JPEG can't be transparent. Pick PNG, WebP or SVG."
- Phase 4: "Low contrast. Some phones may not scan this code.", "Light dots on a dark background don't scan on every phone. Make the dots darker than the background."
- Phase 5: "Solid", "Gradient", "Linear", "Radial", "Start color", "End color", "Angle".
- Phase 6: "Logo size", "Logo margin", "Hide dots behind the logo".
- Phase 7: tabs "Link or text", "WiFi", "Email", "Phone", "SMS", "Contact"; WiFi: "Network name", "Password", "Security", "Hidden network"; Email: "To", "Subject", "Message"; Phone/SMS: "Phone number", "Message"; Contact: "First name", "Last name", "Phone", "Email", "Company", "Website"; errors "Add a network name.", "Add an email address.", "Add a phone number.", "Add at least a name."
- Phase 8: section "Presets"; names "Classic", "Soft", "Dotted", "Ocean", "Sunset".
- Phase 9: "Restored your last design.", "Your logo was too big to keep for next time."
- Phase 10: "Copy link", "Link copied", "Uploaded logos aren't included in links.", "This link has an invalid design. Showing the default one."
- Phase 11: "Undo", "Redo".
- Phase 12: "File name", "Export size", "Same as preview".
- Phase 13: section "Frame"; "Add a frame", "Frame text" (default "Scan me"), "Frame color", "Text color".

## 🪜 Phases

### Phase 1: Design model and reset

Move the app state from the library `Options` to our own `QrDesign` model, with no visual change, and give users a "Reset design" button. Every later phase builds on this model.

- [x] Create `src/types/design.ts` with `QrFill` (solid only), `QrDesign`, `QrLogo`, `QrContent` (text only) and `QrDesignAction`. _(Also `QrSize`, a generic `QrShapeStyle<T>` for dots and corners, and `QrFillTarget`. Phase 1 actions: `set-content`, `set-size`, `set-error-correction`, `set-fill`, `set-logo` (`src`, `name`), `remove-logo`, `reset`.)_
- [x] Create `src/design/defaultDesign.ts` with `DEFAULT_QR_DESIGN` matching the current defaults (including the default logo and its name). _(Also exports `DEFAULT_LOGO_SETTINGS`, used when a logo is added after removing the previous one.)_
- [x] Create `src/design/toQrCodeOptions.ts` and `src/design/qrDesignReducer.ts`. _(`toQrCodeOptions` always sends `image`, empty when there is no logo: `qr-code-styling` deep merges `update` options, so a missing key would keep a removed logo on screen.)_
- [x] Replace `options` and `imageName` state in `App` with `useReducer(qrDesignReducer, DEFAULT_QR_DESIGN)`, deriving `Options` with `toQrCodeOptions` for `useQrCode`, the capacity check and exports. Remove `QrColorTarget`/`QrColorOptionKey` if no longer used. _(Removed. The design is debounced and mapped with `useMemo`, so `useQrCode` only updates when the debounced design changes.)_
- [x] Add a "Reset design" text button near the preview that dispatches `reset` and announces "Design reset" in the existing status region. _(`CopyResult` state became `AppStatus = CopyResult | 'design-reset'`. The `textAction` link style moved from `InputFile` to `src/styles/textAction.ts` to share it.)_
- [x] Create `tests/design/toQrCodeOptions.test.ts` and `tests/design/qrDesignReducer.test.ts` (Phase 1 cases); add "resets the design to the defaults" to `tests/App.test.tsx`. All existing tests must keep passing unchanged. _(The 51 previous tests passed untouched; 63 in total. The "omits `image`" case became "sends an empty image when there is no logo". Checked in the browser that removing the logo clears it from the canvas and reset brings it back.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Shapes

Let users pick the shape of the dots, eye frames and eye centers, with visual thumbnails.

- [x] Create the generic `OptionPicker<T>` (radio group with roving arrow keys from native radios, optional icon and hint) and its props types; rewrite `FormatPicker` and `ErrorCorrectionPicker` on top of it with no behavior change. _(Options without icons keep the segmented look; options with icons render as tiles in a 3/6 column grid. The radios keep their `${id}-${value}` ids and native arrow key navigation.)_
- [x] Create `ShapeIcon` with small inline SVG thumbnails for every `DotType`, `CornerSquareType` and `CornerDotType`. _(Dot styles are drawn as three modules in an L so the joined styles read; `Classy` and `Classy rounded` look alike at this size.)_
- [x] Add a `set-shape` action and a "Shape" section with three pickers. _(`QrSetShapeAction` is typed per target with `QrShapeTypes`. The pickers live in a new `ShapePickers` component to keep `App` small. Sections renumbered: 03 Shape, 04 Ink, 05 Logo. Corner labels: eye frame "Rounded", "Square", "Circle"; eye center "Dot", "Square".)_
- [x] Create `tests/components/OptionPicker.test.tsx`; add "changes the dot shape" to `tests/App.test.tsx`. _(Also a reducer case for `set-shape` and an icon rendering case. 71 tests pass. Checked in the browser at 1280 and 360 px: shapes apply to the canvas, no overflow.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Background and margin

Expose the background color, a transparent background and the quiet zone margin.

- [x] Add `background` and `margin` to `QrDesign` (default `#ffffff`, not transparent, margin 0 to keep today's look) and map them in `toQrCodeOptions`. _(`QrBackground { transparent, fill }`. The default white is now `#ffffff` instead of `#fff`, the six digit form the color input needs, so the default mapping test was updated. Transparent maps to `rgba(0,0,0,0)`. Actions: `set-fill` now also targets `background`, `set-background` toggles transparency keeping the fill, `set-margin`.)_
- [x] Create `RangeField` (slider + number with unit) reusing the `SizeField` draft/blur pattern. _(`SizeField` is now a thin wrapper over `RangeField` with `step={10}` and `px`.)_
- [x] Add a "Background" section: background `ColorField`, "Transparent background" checkbox, margin `RangeField` (0-50 px) with the margin hint. _(Added a reusable `CheckboxField`. The background color field hides while transparent, and the preview shows a checkerboard behind the code. Sections: 05 Background, 06 Logo.)_
- [x] Disable the JPEG option with its hint when the background is transparent, and switch to PNG if JPEG was selected. _(`OptionPickerItem` gained `disabled`; `FormatPicker` gained `disabledExtensions` and `hint`.)_
- [x] Extend `toQrCodeOptions` tests; add "disables JPEG with a transparent background" to `tests/App.test.tsx`. _(Also reducer cases for background and margin, and "changes the margin". 77 tests pass. Checked in the browser: PNG and WebP exports have alpha 0 corners, the SVG has no background rect, the margin shows in the export.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 4: Contrast warning

Warn users when their colors may stop the code from scanning.

- [ ] Create `src/utils/contrast.ts` with `getContrastRatio` (WCAG relative luminance) and `assessScannability`, comparing dots, eye frame and eye center colors with the background (skipped when transparent). Threshold 4:1.
- [ ] Show the warnings under the preview in a polite live region, one message per issue.
- [ ] Create `tests/utils/contrast.test.ts`; add "warns about low contrast" and "warns about inverted colors" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 5: Gradients

Allow linear and radial gradients on dots, eye frames, eye centers and background.

- [ ] Add the gradient variant to `QrFill` and map it in `toQrCodeOptions` (two color stops at 0 and 1, rotation in degrees converted to radians).
- [ ] Create `FillField`: "Solid" / "Gradient" toggle (`OptionPicker`), one color for solid, start/end colors plus "Linear"/"Radial" and an "Angle" `RangeField` (linear only) for gradient.
- [ ] Replace the `ColorField`s of the Ink and Background sections with `FillField`; replace `set-fill` payload with `QrFill`.
- [ ] Make `assessScannability` check every gradient color.
- [ ] Extend `toQrCodeOptions` and `contrast` tests; add "applies a gradient to the dots" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 6: Logo controls

Let users tune how the logo sits on the code.

- [ ] Add an `update-logo` action and map `size` (10-50 %), `margin` (0-20 px) and `hideBackgroundDots` in `toQrCodeOptions`.
- [ ] Show "Logo size", "Logo margin" and "Hide dots behind the logo" in the Logo section only when a logo is set.
- [ ] Extend `toQrCodeOptions` tests; add "changes the logo size" and "hides the logo controls without a logo" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 7: Content types

Build the encoded text for WiFi, email, phone, SMS and contact cards instead of asking users to know the formats.

- [ ] Extend `QrContent` with all variants and create `src/utils/buildQrPayload.ts`.
- [ ] Create `ContentTypeTabs` (accessible tabs) and the six content forms with their required field errors; keep the data of each type while switching tabs during the session.
- [ ] Use `buildQrPayload` in `toQrCodeOptions`, in the capacity check and in the `QrLabel` caption (show the type and main field, e.g. "WiFi · Home").
- [ ] Disable copy and save while required fields are missing.
- [ ] Create `tests/utils/buildQrPayload.test.ts`; add "builds a WiFi code", "shows a required field error" and "keeps the text when switching tabs" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 8: Style presets

Offer ready-made looks that users can apply in one click and then tweak.

- [ ] Create `src/design/presets.ts` with five presets (Classic, Soft, Dotted, Ocean, Sunset) that pass the scannability check.
- [ ] Add the `apply-preset` action (style only) and a "Presets" section with `PresetPicker` showing a small swatch per preset.
- [ ] Create `tests/design/presets.test.ts`; extend the reducer tests; add "applies a preset and keeps the content" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 9: Autosave

Keep the last design between visits.

- [ ] Create `src/design/persistence.ts` with a strict `parseQrDesign` validator (types, enums, hex colors, ranges) and the versioned `qr-design:v1` storage format.
- [ ] Load the saved design on start (falling back to the default) and save on changes, debounced; on a quota error retry without the logo and show "Your logo was too big to keep for next time."
- [ ] Show "Restored your last design." once when a saved design is loaded. "Reset design" also clears the saved design.
- [ ] Create `tests/design/persistence.test.ts`; add "restores the saved design" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 10: Share link

Let users share or bookmark a design as a link.

- [ ] Create `src/design/shareLink.ts`: base64url JSON in the URL hash, validated with `parseQrDesign`; uploaded logos are replaced by no logo, the default logo is kept as a flag.
- [ ] On start, a valid hash takes precedence over the saved design; an invalid one shows the error message and loads the default. Clear the hash after loading.
- [ ] Add `ShareLinkButton` ("Copy link") in the Save section, with the uploaded logo notice when relevant.
- [ ] Create `tests/design/shareLink.test.ts`; add "loads a design from the link" and "copies the share link" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 11: Undo and redo

Let users step back and forward through their changes.

- [ ] Create `src/hooks/useDesignHistory.ts` wrapping `qrDesignReducer` with past/future stacks (max 100), coalescing same-field edits within 500 ms.
- [ ] Replace `useReducer` in `App` with `useDesignHistory`; `reset`, presets and loaded designs are undoable steps.
- [ ] Add `HistoryControls` ("Undo", "Redo" buttons, disabled when not available) and the ⌘/Ctrl+Z, ⌘/Ctrl+Shift+Z shortcuts, ignored while typing in a text field so native undo keeps working there.
- [ ] Create `tests/hooks/useDesignHistory.test.ts`; add "undoes and redoes a color change" to `tests/App.test.tsx`.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 12: Print-ready export

Name the exported file and export at print resolution without enlarging the preview.

- [ ] Create `src/utils/exportQr.ts` with `sanitizeFileName` and `exportQr`, which renders a temporary `QRCodeStyling` instance with the chosen size (keeping the aspect ratio) and downloads it with the given name.
- [ ] Add "File name" (default `qr`) and "Export size" (`Same as preview`, 512, 1024, 2048, 4096) to the Save section; copy to clipboard uses the same size.
- [ ] Create `tests/utils/exportQr.test.ts`; add "downloads with the chosen file name" to `tests/App.test.tsx`.
- [ ] Check in the browser that a 4096 px PNG downloads and the preview size does not change.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 13: Call-to-action frame

Add an optional frame with a short text like "Scan me", included in every export.

- [ ] Add `frame` to `QrDesign` (default `null`), the `set-frame` action and its validation in `parseQrDesign`.
- [ ] Create `src/utils/composeFramedQr.ts`: SVG output wraps the QR SVG in a framed SVG with a `<text>` label (escaped); raster outputs draw the QR and the frame on a canvas after `document.fonts.ready`.
- [ ] Create `FrameFields` ("Add a frame", "Frame text" up to 24 characters, "Frame color", "Text color") in a "Frame" section, and render the same frame around the preview.
- [ ] Use `composeFramedQr` in `exportQr` and `copyQrToClipboard` when a frame is set.
- [ ] Create `tests/utils/composeFramedQr.test.ts`; add "adds a frame with text" to `tests/App.test.tsx`.
- [ ] Check in the browser that the frame looks the same in the preview and in SVG, PNG, JPEG and WebP exports.
- [ ] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

Implement Phase 4 to warn users when their colors may stop the code from scanning.

Shaped bricks now float on any background, thanks to [Codely](https://codely.com) AI tooling. 🏁 🔷 🧱 < 🐢 💨 (Turbotuga™, [Codely](https://codely.com)’s mascot)
