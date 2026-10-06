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

last_implementation_at: "2026-10-06T14:55:54Z"
has_completed_all_phases: "true"
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
- `QrLogo { src: string; name: string; size: number; margin: number; hideBackgroundDots: boolean }` and `QrLogoSettings = Omit<QrLogo, 'src' | 'name'>` (`size`, `margin`, `hideBackgroundDots` exposed in Phase 6).
- `QrDesignAction`: discriminated union, one action per editable field (`set-content`, `set-size`, `set-error-correction`, `set-shape`, `set-fill`, `set-background`, `set-margin`, `set-logo`, `update-logo`, `remove-logo`, `apply-preset`, `set-frame`, `replace`, `reset`), extended phase by phase.
- `QrContent` (Phase 7): `{ type: 'text'; text } | { type: 'wifi'; ssid; password; encryption: QrWifiEncryption; hidden: boolean } | { type: 'email'; to; subject; body } | { type: 'phone'; number } | { type: 'sms'; number; message } | { type: 'vcard'; firstName; lastName; phone; email; organization; url }`, `QrContentType = QrContent['type']`, `QrContentOf<T>`, `QrContentDrafts`, `QrContentError = 'empty-text' | 'missing-ssid' | 'missing-email' | 'missing-phone' | 'missing-name'`, `QrWifiEncryption = 'WPA' | 'WEP' | 'nopass'`.
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
- `buildQrPayload(content: QrContent): string` and `describeQrContent(content: QrContent): string` in `src/utils/buildQrPayload.ts`, `validateQrContent(content: QrContent): QrContentError | null` in `src/utils/validateQrContent.ts`, `EMPTY_CONTENT: QrContentDrafts` in `src/design/emptyContent.ts` (Phase 7).
- `QR_STYLE_PRESETS: readonly QrStylePreset[]` in `src/design/presets.ts` (Phase 8).
- `parseQrDesign(value: unknown): QrDesign | null`, `serializeQrDesign(design: QrDesign): QrDesign`, `saveDesign(storage: Storage, design: QrDesign): SaveDesignResult`, `loadSavedDesign(storage: Storage): QrDesign | null`, `clearSavedDesign(storage: Storage): void` and `getDesignStorage(): Storage | null` in `src/design/persistence.ts` (Phase 9). Stored under the `qr-design:v1` key as `{ version: 1, design }`. Shared limits in `src/design/limits.ts` (Phase 9).
- `encodeDesignToHash(design: QrDesign): string`, `decodeDesignFromHash(hash: string): QrDesign | null`, `hasSharedDesign(hash: string): boolean` and `isUploadedLogo(logo: QrLogo | null): boolean` in `src/design/shareLink.ts`; `resolveInitialDesign(storage: Storage | null, hash: string): InitialDesign` in `src/design/initialDesign.ts`, with `InitialDesign { design; source: 'link' | 'invalid-link' | 'storage' | 'default' }` (Phase 10).
- `useDesignHistory(initial: QrDesign): DesignHistory` in `src/hooks/useDesignHistory.ts` (Phase 11).
- `sanitizeFileName(name: string): string`, `scaleQrOptions(options: Options, size: QrExportSize | 'preview'): Options`, `createExportQr(options: Options, size: QrExportSize | 'preview'): QRCodeStyling` and `exportQr(options: Options, exportOptions: QrExportOptions): Promise<void>` in `src/utils/exportQr.ts` (Phase 12). `QrExportSizeChoice = 'preview' | `${QrExportSize}`` for the picker.
- `composeFramedQr(qr: Blob, frame: QrFrame, extension: FileExtension): Promise<Blob>` in `src/utils/composeFramedQr.ts`, `frameLayout(width, height): FrameLayout` in `src/design/frameLayout.ts`, `downloadBlob(blob: Blob, fileName: string): void` in `src/utils/downloadBlob.ts`, `DEFAULT_FRAME` (Phase 13).

### Components

- `OptionPicker<T extends string>` with `OptionPickerProps<T> { id; label; value: T; options: readonly OptionPickerItem<T>[]; onChange: (value: T) => void; hint?: string }`, `OptionPickerItem<T> { value: T; label: string; icon?: ReactNode }` (Phase 2). `FormatPicker` and `ErrorCorrectionPicker` become thin wrappers over it.
- `ShapeIcon` (inline SVG thumbnails per shape) and `ShapePickers` with `ShapePickersProps { shapes: QrShapeTypes; onShapeChange: (change: QrSetShapeAction) => void }` (Phase 2).
- `FillField` with `FillFieldProps { id; label; fill: QrFill; onChange: (fill: QrFill) => void; hint?: string; defaultGradientEnd?: string }` (Phase 5; Phase 3 uses `ColorField` for the solid background). `OptionPickerProps.labelHidden?` (Phase 5).
- `RangeField` with `RangeFieldProps extends SizeFieldProps { step; unit; hint? }` (Phase 3, reused in Phases 6 and 12) and `CheckboxField` with `CheckboxFieldProps { id; label; checked; onChange: (checked: boolean) => void }` (Phase 3, reused in Phases 6 and 13).
- `OptionPickerItem.disabled?` and `FormatPickerProps.disabledExtensions? / hint?` (Phase 3).
- `ContentEditor` (`ContentEditorProps { content; onChange; capacityError? }`), `ContentTypeTabs` and one form per type in `src/components/content/`: `TextContentForm`, `WifiContentForm`, `EmailContentForm`, `PhoneContentForm`, `SmsContentForm`, `VcardContentForm` with `ContentFormProps<T>` (Phase 7). `InputProps.type?: InputType` (Phase 7).
- `FramedPreview` (`FramedPreviewProps { frame; width; height; children }`) and `FrameFields` (`FrameFieldsProps { frame; onChange }`) (Phase 13).
- `PresetPicker` with `PresetPickerProps { presets: readonly QrStylePreset[]; onApply: (preset: QrStylePreset) => void }` (Phase 8), `HistoryControls` with `HistoryControlsProps { canUndo; canRedo; onUndo; onRedo }` and `isTextEntry(target: EventTarget | null): boolean` (Phase 11), `ShareLinkButton` (Phase 10), `FrameFields` (Phase 13).

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
  - `replace` swaps the whole design (Phase 10, used for links pasted into the open app)
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
- `tests/utils/validateQrContent.test.ts` (Phase 7)
  - reports the missing required field of each empty content type
  - treats whitespace as missing
  - accepts a contact with only a last name
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
- `tests/design/initialDesign.test.ts` (Phase 10)
  - prefers a shared link over the saved design
  - falls back to the default, not the saved design, for a broken link
  - restores the saved design without a link
- `tests/hooks/useDesignHistory.test.ts` (Phase 11)
  - undo and redo walk the history
  - a new change after undo drops the redo stack
  - consecutive edits of the same field within 500 ms count as one step
  - limits history to 100 steps
  - never merges different fields or discrete actions, and ignores no-op actions
- `tests/components/ColorField.test.tsx` (Phase 11)
  - lets users type a full hex that starts with a valid short hex
  - shows external color changes
- `tests/utils/exportQr.test.ts` (Phase 12)
  - `sanitizeFileName` strips path separators and reserved chars, trims, falls back to `qr`
  - exports at the chosen size from a separate instance without changing the preview options
  - scales size and both margins together and keeps the aspect ratio
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
- Phase 5: "Solid", "Gradient", "Gradient type", "Linear", "Radial", "Start color", "End color", "Angle".
- Phase 6: "Logo size", "Logo margin", "Hide dots behind the logo".
- Phase 7: tabs "Link or text", "WiFi", "Email", "Phone", "SMS", "Contact"; WiFi: "Network name", "Password", "Security", "Hidden network"; Email: "To", "Subject", "Message"; Phone/SMS: "Phone number", "Message"; Contact: "First name", "Last name", "Phone", "Email", "Company", "Website"; errors "Add a network name.", "Add an email address.", "Add a phone number.", "Add at least a name."
- Phase 8: section "Presets"; names "Classic", "Soft", "Dotted", "Ocean", "Sunset".
- Phase 9: "Restored your last design.", "Your logo was too big to keep for next time."
- Phase 10: "Copy link", "Link copied", "Couldn't copy the link. Try again.", "Loaded the design from the link.", "Uploaded logos aren't included in links.", "This link has an invalid design. Showing the default one."
- Phase 11: "Undo", "Redo".
- Phase 12: "File name", "Export size", "Same as preview", "Preparing…", "Preparing your file…".
- Phase 13: section "Frame"; "Add a frame", "Frame text" (default "Scan me"), "Frame color", "Text color"; warning "The frame touches the code. Add some margin so it still scans."

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

- [x] Create `src/utils/contrast.ts` with `getContrastRatio` (WCAG relative luminance) and `assessScannability`, comparing dots, eye frame and eye center colors with the background (skipped when transparent). Threshold 4:1. _(`ScannabilityIssue` lives in `src/types/design.ts`. Both issues can show together, e.g. light dots that are also close to the background.)_
- [x] Show the warnings under the preview in a polite live region, one message per issue. _(Placed between the preview label and the "Reset design" link, with a ⚠ marker.)_
- [x] Create `tests/utils/contrast.test.ts`; add "warns about low contrast" and "warns about inverted colors" to `tests/App.test.tsx`. _(Extra cases: default design has no issues, shorthand colors, 4.5:1 is accepted, eye colors are checked. 89 tests pass. Checked in the browser.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 5: Gradients

Allow linear and radial gradients on dots, eye frames, eye centers and background.

- [x] Add the gradient variant to `QrFill` and map it in `toQrCodeOptions` (two color stops at 0 and 1, rotation in degrees converted to radians). _(`gradient` is always sent, `undefined` for solid fills: `update` deep merges options, so a missing key would keep the old gradient. Checked in the browser that switching back to solid clears it from the canvas.)_
- [x] Create `FillField`: "Solid" / "Gradient" toggle (`OptionPicker`), one color for solid, start/end colors plus "Linear"/"Radial" and an "Angle" `RangeField` (linear only) for gradient. _(Solid mode renders exactly the previous `ColorField`, so existing labels and hints keep working. The gradient fieldset is named "<label> gradient" for screen readers to avoid a clash with the Shape "Dots" group. The kind toggle is named "<label> fill". Switching keeps the first color; the default end is `#3f6212`, and `#ecfccb` for the background. `OptionPicker` gained `labelHidden`.)_
- [x] Replace the `ColorField`s of the Ink and Background sections with `FillField`; replace `set-fill` payload with `QrFill`. _(`onChangeColor` became `onChangeFill`.)_
- [x] Make `assessScannability` check every gradient color. _(Every ink color is compared with every background color.)_
- [x] Extend `toQrCodeOptions` and `contrast` tests; add "applies a gradient to the dots" to `tests/App.test.tsx`. _(95 tests pass. The browser check also confirmed the SVG export contains a `linearGradient`.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 6: Logo controls

Let users tune how the logo sits on the code.

- [x] Add an `update-logo` action and map `size` (10-50 %), `margin` (0-20 px) and `hideBackgroundDots` in `toQrCodeOptions`. _(`update-logo` takes `Partial<QrLogoSettings>` (new type, `Omit<QrLogo, 'src' | 'name'>`) and is ignored when there is no logo. The model keeps the size as a fraction (0.1-0.5) and the UI shows it as a percentage in steps of 5.)_
- [x] Show "Logo size", "Logo margin" and "Hide dots behind the logo" in the Logo section only when a logo is set. _(Size and margin side by side, stacking on mobile, reusing `RangeField` and `CheckboxField`.)_
- [x] Extend `toQrCodeOptions` tests; add "changes the logo size" and "hides the logo controls without a logo" to `tests/App.test.tsx`. _(Also reducer cases for `update-logo`. 100 tests pass. Checked in the browser: the logo grows and shrinks on the canvas and dots show behind it when not hidden.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 7: Content types

Build the encoded text for WiFi, email, phone, SMS and contact cards instead of asking users to know the formats.

- [x] Extend `QrContent` with all variants and create `src/utils/buildQrPayload.ts`. _(Also `describeQrContent` for the caption, `validateQrContent` in `src/utils/validateQrContent.ts` returning a `QrContentError`, and `EMPTY_CONTENT` in `src/design/emptyContent.ts`. vCard lines use CRLF as RFC 2426 requires. Lint caught a lost backslash in the escaping regexes while writing the file; fixed before testing.)_
- [x] Create `ContentTypeTabs` (accessible tabs) and the six content forms with their required field errors; keep the data of each type while switching tabs during the session. _(A `ContentEditor` component composes the tabs and forms (in `src/components/content/`) and keeps per-tab drafts in a ref; "Reset design" remounts it to clear them. Tabs follow the WAI-ARIA pattern with arrow keys, Home and End. `Input` gained `type` (`text`, `email`, `tel`, `url`). WiFi security labels: "WPA/WPA2", "WEP", "None"; the password field hides for open networks. Section renamed to "01 Content".)_
- [x] Use `buildQrPayload` in `toQrCodeOptions`, in the capacity check and in the `QrLabel` caption (show the type and main field, e.g. "WiFi · Home"). _(The text field keeps showing the capacity error itself; the other forms show it below the form.)_
- [x] Disable copy and save while required fields are missing.
- [x] Create `tests/utils/buildQrPayload.test.ts`; add "builds a WiFi code", "shows a required field error" and "keeps the text when switching tabs" to `tests/App.test.tsx`. _(Also `tests/utils/validateQrContent.test.ts` and an arrow key tabs case. Existing tests now query the text field by role, since the tab panel is also labelled "Link or text"; the reset test re-queries it after the editor remounts. 124 tests pass. In the browser the real WiFi, vCard and email codes were decoded with jsQR and match the expected payloads, escapes included.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 8: Style presets

Offer ready-made looks that users can apply in one click and then tweak.

- [x] Create `src/design/presets.ts` with five presets (Classic, Soft, Dotted, Ocean, Sunset) that pass the scannability check. _(Classic and Dotted use pure solid inks, Soft a soft zinc, Ocean a blue linear gradient and Sunset a rust-to-rose radial gradient. All set a 16 px margin.)_
- [x] Add the `apply-preset` action (style only) and a "Presets" section with `PresetPicker` showing a small swatch per preset. _(`apply-preset` carries the preset `style`. Presets are buttons, not a radio group, because a preset is an action and the design can drift from it after edits. The swatch paints the background fill (CSS gradient when needed) with the eye frame and dot shapes in their colors. Sections: 03 Presets, 04 Shape, 05 Ink, 06 Background, 07 Logo.)_
- [x] Create `tests/design/presets.test.ts`; extend the reducer tests; add "applies a preset and keeps the content" to `tests/App.test.tsx`. _(Extra preset case: every preset keeps a margin. 133 tests pass. In the browser all five presets decode with jsQR with the default logo on, and none raises a contrast warning.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 9: Autosave

Keep the last design between visits.

- [x] Create `src/design/persistence.ts` with a strict `parseQrDesign` validator (types, enums, hex colors, ranges) and the versioned `qr-design:v1` storage format. _(The parser rebuilds the design from known fields only, normalizes colors and only accepts base64 image data URLs as logos, never remote URLs. The bundled logo is stored as a `"default"` marker because its URL changes between builds (`serializeQrDesign`). Limits moved to `src/design/limits.ts`, shared with the controls. Also `clearSavedDesign` and `getDesignStorage`, which returns `null` when the browser blocks storage.)_
- [x] Load the saved design on start (falling back to the default) and save on changes, debounced; on a quota error retry without the logo and show "Your logo was too big to keep for next time." _(Saves reuse the 150 ms debounced design. The logo warning shows once per logo.)_
- [x] Show "Restored your last design." once when a saved design is loaded. "Reset design" also clears the saved design. _(Saving the default design clears storage instead, so a reset is never "restored" on the next visit. `AppStatus` gained `design-restored` and `logo-not-saved`.)_
- [x] Create `tests/design/persistence.test.ts`; add "restores the saved design" to `tests/App.test.tsx`. _(Also "saves edits and clears the saved design on reset". `tests/setup.ts` clears `localStorage` after each test, since the app now autosaves. 156 tests pass. In the browser: an edited WiFi + Ocean design, an uploaded PNG and an uploaded SVG logo all survive a reload, and reset leaves storage empty.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 10: Share link

Let users share or bookmark a design as a link.

- [x] Create `src/design/shareLink.ts`: base64url JSON in the URL hash, validated with `parseQrDesign`; uploaded logos are replaced by no logo, the default logo is kept as a flag. _(The hash is `design=<base64url>` of a versioned `{ version: 1, design }`, UTF-8 safe. Also `hasSharedDesign` and `isUploadedLogo`. A typical link is under 900 characters.)_
- [x] On start, a valid hash takes precedence over the saved design; an invalid one shows the error message and loads the default. Clear the hash after loading. _(`resolveInitialDesign` in `src/design/initialDesign.ts` decides between link, invalid link, storage and default. Found in the browser check: pasting a link into a tab that already runs the app only fires `hashchange`, so it was ignored. The app now listens to `hashchange` and loads the link with a new `replace` action. A loaded link shows "Loaded the design from the link.")_
- [x] Add `ShareLinkButton` ("Copy link") in the Save section, with the uploaded logo notice when relevant. _(A text link under the Save buttons; the notice describes the button. Copy results use the shared status region: "Link copied" or "Couldn't copy the link. Try again.")_
- [x] Create `tests/design/shareLink.test.ts`; add "loads a design from the link" and "copies the share link" to `tests/App.test.tsx`. _(Also `tests/design/initialDesign.test.ts`, a reducer case for `replace`, and App cases for invalid links, links pasted into the open app and the uploaded logo notice. 178 tests pass. In the browser a copied link reproduces the design pixel for pixel both in a clean new tab and in a tab already showing another design.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 11: Undo and redo

Let users step back and forward through their changes.

- [x] Create `src/hooks/useDesignHistory.ts` wrapping `qrDesignReducer` with past/future stacks (max 100), coalescing same-field edits within 500 ms. _(A pure history reducer; edits coalesce by field key (content type, size dimension, fill target, margin, logo setting) while gaps stay under 500 ms. Discrete actions (shapes, presets, logo upload, reset, replace) are always their own step, and actions that change nothing add no step. `HISTORY_LIMIT` and `COALESCE_WINDOW_MS` are exported.)_
- [x] Replace `useReducer` in `App` with `useDesignHistory`; `reset`, presets and loaded designs are undoable steps.
- [x] Add `HistoryControls` ("Undo", "Redo" buttons, disabled when not available) and the ⌘/Ctrl+Z, ⌘/Ctrl+Shift+Z shortcuts, ignored while typing in a text field so native undo keeps working there. _(`isTextEntry` in `src/utils/isTextEntry.ts` decides it: text-like inputs, textareas and contenteditable. Buttons carry `aria-keyshortcuts`. They sit under the preview, left of "Reset design".)_
- [x] Create `tests/hooks/useDesignHistory.test.ts`; add "undoes and redoes a color change" to `tests/App.test.tsx`. _(That case exposed a bug that predates this plan: `ColorField` overwrote the draft when typing passed through a valid short hex, so "#3f6212" became "#33ff66". Fixed by syncing the draft only on external changes, with a new `tests/components/ColorField.test.tsx` confirmed to fail without the fix. Also a keyboard shortcut case. 191 tests pass. One full run hung once and could not be reproduced in two reruns (35-43 s). In the browser ten slider steps undo as one step, and presets undo and redo with the shortcuts.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 12: Print-ready export

Name the exported file and export at print resolution without enlarging the preview.

- [x] Create `src/utils/exportQr.ts` with `sanitizeFileName` and `exportQr`, which renders a temporary `QRCodeStyling` instance with the chosen size (keeping the aspect ratio) and downloads it with the given name. _(`exportQr` takes the design `Options` instead of the preview instance. `scaleQrOptions` scales the longest side and both margins together, so the quiet zone keeps its proportion. `createExportQr` is shared with the clipboard copy. `sanitizeFileName` strips path separators, reserved and control characters, a typed image extension and trailing dots, caps the length at 100 and falls back to `qr`.)_
- [x] Add "File name" (default `qr`) and "Export size" (`Same as preview`, 512, 1024, 2048, 4096) to the Save section; copy to clipboard uses the same size. _(Exports render from the live design, so the old preview flush is gone. Added a busy state not in the original plan: a 4096 px PNG took about 11 s in headless Chromium with no feedback, so while exporting both buttons are disabled, the save button reads "Preparing…" and the status region says "Preparing your file…". Downloads wait one paint before rendering so the busy state shows; copies do not, because Safari needs the clipboard write to start inside the click.)_
- [x] Create `tests/utils/exportQr.test.ts`; add "downloads with the chosen file name" to `tests/App.test.tsx`. _(Also "shows a busy state while a large export is prepared". The App test double now records constructor options and downloads. 208 tests pass. The suite hangs seen in Phases 11 and 12 came from the verification command, not from Vitest: `timeout` killed npm while Vitest workers kept the `grep` pipe open. Runs written to a file finished every time in 24-45 s.)_
- [x] Check in the browser that a 4096 px PNG downloads and the preview size does not change. _(4096 x 4096 PNG named "restaurant menu.png" decodes with jsQR, the SVG at 2048 and the clipboard copy at 2048 match, and the preview canvas stays 300 x 300. Timings: 1024 px 0.4 s, 2048 px 0.7 s, 4096 px about 11 s.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 13: Call-to-action frame

Add an optional frame with a short text like "Scan me", included in every export.

- [x] Add `frame` to `QrDesign` (default `null`), the `set-frame` action and its validation in `parseQrDesign`. _(A missing `frame` key parses as no frame, so designs saved or shared before this phase keep loading. Frame text edits coalesce in the undo history.)_
- [x] Create `src/utils/composeFramedQr.ts`: SVG output wraps the QR SVG in a framed SVG with a `<text>` label (escaped); raster outputs draw the QR and the frame on a canvas after `document.fonts.ready`. _(Both use one `frameLayout` (border 4 %, text band 16 % of the code, font 45 % of the band), so the frame scales with the export size. Raster output waits for `document.fonts.load` of the frame font. Framed downloads use a new `downloadBlob` helper, since the library cannot draw frames.)_
- [x] Create `FrameFields` ("Add a frame", "Frame text" up to 24 characters, "Frame color", "Text color") in a "Frame" section, and render the same frame around the preview. _(Section "08 Frame"; `Input` gained `maxLength`. Found in the browser check: when `FramedPreview` returned a bare fragment without a frame, React reused the QR container node as the frame `div` on toggle and the library wiped React's children, so the band disappeared from the preview. The wrapper is now always rendered so the container node never moves; `tests/components/FramedPreview.test.tsx` checks the node identity. Added the `frame-touches-code` scannability warning: a frame with a margin under 3 % of the code can merge with the modules.)_
- [x] Use `composeFramedQr` in `exportQr` and `copyQrToClipboard` when a frame is set. _(`QrExportOptions` gained `frame`; `copyQrToClipboard` takes an optional frame.)_
- [x] Create `tests/utils/composeFramedQr.test.ts`; add "adds a frame with text" to `tests/App.test.tsx`. _(Also frame cases in the persistence and contrast suites. 223 tests pass. Raised Vitest `testTimeout` to 15 s: two App tests hit the 5 s default once under load while each takes about 300 ms alone.)_
- [x] Check in the browser that the frame looks the same in the preview and in SVG, PNG, JPEG and WebP exports. _(All four exports and the clipboard copy are 324 x 360 with the frame, and all decode with jsQR; the SVG keeps the QR as a nested vector. The preview matches the PNG export and survives three on/off toggles and a preset change.)_
- [x] Verify the changes in terms of typechecking, linting and tests using `npm run lint && npm run type-check && npm test`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

All phases are complete. Open a pull request from `feature/qr-design-features` to `main` and let CI run.

Framed, signed and ready to hang on the wall: the QR design studio is complete, thanks to [Codely](https://codely.com) AI tooling. 🏆 🖨️ ⏪ 🔗 💾 🎨 📇 🖼️ 🌈 🔦 🏁 🔷 🧱 < 🐢 💨 (Turbotuga™, [Codely](https://codely.com)’s mascot)
