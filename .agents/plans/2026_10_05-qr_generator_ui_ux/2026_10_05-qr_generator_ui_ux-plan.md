---
created_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

created_at: "2026-10-05T00:00:00Z"
has_completed_all_phases: "false"

implemented_by:
  tool: "Claude Code"
  model:
    name: "Claude Opus"
    version: "5.5"
    reasoning_effort: "low"

last_implementation_at: "2026-10-05T17:44:53Z"
---

# 🎨 Mejora UI/UX del QR Code Generator

## 🎯 Objetivo

Mejorar la experiencia de uso del generador de QR sin cambiar el stack (React 17 + Vite 2 + Tailwind 2 + `qr-code-styling` + `react-color`), ni añadir dependencias nuevas.

## 🔍 Diagnóstico del estado actual

- **Inputs sin etiqueta**: los campos de URL, ancho y alto solo tienen placeholder (`"300"`), no se sabe qué es cada uno. Ancho/alto son `type='text'` y aceptan cualquier valor (`Number('abc')` → `NaN`).
- **Layout en una sola columna** centrada: en escritorio el QR y los controles quedan apilados y hay que hacer scroll para ver el resultado al cambiar opciones.
- **Color pickers poco usables**: el disparador es un `div` (no accesible por teclado, clase `pointer` inexistente en Tailwind → no hay cursor de mano), no se cierran con `Escape` y los 3 bloques están duplicados en `App.tsx`.
- **Subida de logo**: no muestra qué archivo hay cargado, no permite quitarlo, no limita a imágenes (`accept`).
- **Tipado débil**: props con `any` en `Input`, `InputFile`, `SelectExtension`; `console.log(options)` en cada render.
- **Header/Footer**: header sin descripción; footer con iconos sociales sin `href` (enlaces muertos) y año fijo `2021`.
- **Accesibilidad**: sin `label`/`htmlFor`, sin `aria-*`, contraste del fondo degradado con texto gris mejorable, sin estados de foco consistentes.

## 🧱 Decisiones

- Se mantiene `App.tsx` como contenedor de estado; los controles se extraen a componentes en `src/components/`.
- Tipos propios en `src/types/` para las props y opciones de la UI (regla del proyecto: custom types para todas las estructuras de datos).
- Sin nuevas dependencias ni actualizaciones de versiones (fuera de alcance).

## 🪜 Fases

### Fase 1 — Estructura, layout y tipado

- [x] Crear tipos en `src/types/ui.ts` (props de `Input`, `InputFile`, `SelectExtension`, `Section`) y eliminar todos los `any`. _(El tipo de `ColorField` se crea en la Fase 2 junto al componente.)_
- [x] Rediseñar el layout: dos columnas en `lg+` (preview del QR fija/sticky a la izquierda en una tarjeta, panel de controles a la derecha); una columna en móvil con el QR arriba.
- [x] Agrupar los controles en secciones con título dentro de una tarjeta: **Contenido**, **Tamaño**, **Colores**, **Logo**, **Descarga**.
- [x] Añadir `label` visible asociado (`htmlFor`/`id`) a cada campo.
- [x] Eliminar `console.log(options)` del `useEffect`.
- [x] Verificar con `npm run type-check` y `npm run build`. _(`type-check` ✅. `npm run build` falla también sin estos cambios: Vite 2.6 no consigue cargar `vite.config.js` en Node 24. El bundle se validó con la API de Vite sin el archivo de configuración.)_

### Fase 2 — Controles más usables

- [ ] Ancho/alto como `type='number'` con `min`/`max` (p. ej. 100–1000) y slider `range` sincronizado; ignorar valores no numéricos.
- [ ] Extraer un componente `ColorField` reutilizable que sustituya los 3 bloques duplicados: botón accesible (`button`, `aria-expanded`), muestra del color + valor hex, cierre con clic fuera y con `Escape`.
- [ ] `InputFile`: `accept='image/*'`, mostrar miniatura/nombre del logo actual y botón **Quitar logo**.
- [ ] Botón de descarga con el formato incluido en el texto (p. ej. "Descargar PNG") y `SelectExtension` integrado junto a él.
- [ ] Verificar con `npm run type-check` y `npm run build`.

### Fase 3 — Feedback, accesibilidad y pulido visual

- [ ] Validación del contenido: si el texto/URL está vacío, mostrar mensaje de ayuda y deshabilitar la descarga.
- [ ] Estados de foco visibles y consistentes (`focus:ring`) en todos los controles; `cursor-pointer` donde aplique.
- [ ] Header con subtítulo breve explicando la herramienta; tamaño de tipografía ajustado en móvil.
- [ ] Footer: año dinámico, eliminar o enlazar los iconos sociales sin `href`, `aria-label` en los enlaces de iconos.
- [ ] Revisar contraste de textos sobre el fondo degradado (texto sobre tarjetas blancas).
- [ ] Validación visual en navegador (escritorio ~1280px y móvil ~375px) con `npm run dev`.
- [ ] Verificar con `npm run type-check` y `npm run build`.

## ⏭️ Siguiente paso

Implementar la **Fase 2 — Controles más usables**.

Layout split in two thanks to [Codely](https://codely.com) 🐢 💨 🧩
