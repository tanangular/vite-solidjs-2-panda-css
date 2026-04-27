# AGENTS.md

## Project Framework: SolidJS 2.0 (Beta)

This project uses **SolidJS v2.0.0-beta** — a major version with **breaking changes** from v1.x.
Before writing or modifying any code, you **must** read the type definitions listed below to understand the current API
surface.

---

## Required Reading: Type Definitions

Before generating, editing, or reviewing any SolidJS-related code, read the following type declaration files:

### 1. `solid-js` Core Types

```
node_modules/solid-js/types/
```

Key files to read inside this directory:

- `index.d.ts` — Main entry: re-exports of reactivity primitives, JSX, components, and flow
- `jsx.d.ts` — JSX namespace and intrinsic element types
- `html.d.ts` — DOM-specific helpers and directives
- `server.d.ts` — SSR-specific exports and types (if present)
- `store.d.ts` — Store types (`createStore`, `produce`, `reconcile`, etc.)

> **Note:** The actual signatures for reactivity primitives (`createSignal`, `createEffect`, `createMemo`, etc.)
> live in the `@solidjs/signals` package, which `solid-js` re-exports. For the canonical definitions, also read:
>
> ```
> node_modules/@solidjs/signals/dist/types/signals.d.ts
> ```

### 2. `@solidjs/web` Types

```
node_modules/@solidjs/web/types/
```

Key files to read inside this directory:

- `index.d.ts` — Web renderer entry: `render`, `hydrate`, portal, and DOM-binding types
- Any other `.d.ts` files present — read all of them, as v2.0 restructures the rendering layer significantly

---

## How to Read the Types

Run the following shell commands at the start of any SolidJS-related task to enumerate available type files:

```bash
find node_modules/solid-js/types -name "*.d.ts" | sort
find node_modules/@solidjs/web/types -name "*.d.ts" | sort
```

Then read each file:

```bash
cat node_modules/solid-js/types/index.d.ts
cat node_modules/@solidjs/web/types/index.d.ts
# ...repeat for all discovered .d.ts files
```

---

## Key Differences in SolidJS 2.0 vs 1.x (What to Watch For)

SolidJS 2.0 is a breaking release. Do **not** assume v1.x patterns are still valid.
Pay close attention to:

- **Reactivity system changes** — signals, effects, and ownership model may have changed signatures or semantics
- **Render API** — `render()` is now in `@solidjs/web`, not `solid-js`
- **Removed or renamed exports** — verify every import against the actual type files before using it
- **New primitives** — check for new APIs not present in v1.x
- **JSX types** — event handler types, ref types, and directive types may have changed

When in doubt, **trust the `.d.ts` files over your training data** — your knowledge of SolidJS 1.x is likely to be stale
or incorrect for this version.

---

## `createEffect` in SolidJS 2.0

In SolidJS 2.0, `createEffect` has a **completely different signature** from v1.x. It now uses a **Split-Phase** model (Compute → Apply):

```typescript
createEffect<T>(
  compute: ComputeFunction<undefined | NoInfer<T>, T>,      // Phase 1: Tracking & Computation
  effectFn: EffectFunction<NoInfer<T>, T> | EffectBundle<NoInfer<T>, T>, // Phase 2: Side Effects
  options?: EffectOptions                                   // Optional: name, defer
): void
```

### Key changes from v1.x

| v1.x                                         | v2.0                                             |
| -------------------------------------------- | ------------------------------------------------ |
| Single callback with tracking + side effects | Two separate callbacks: `compute` and `effectFn` |
| `createEffect(fn, value?)`                   | `createEffect(compute, effectFn, options?)`      |
| Cleanup returned from the same function      | Cleanup returned from `effectFn` (Apply phase)   |

### Split-Phase behavior

1. **Compute Phase** (1st arg): Tracks signals, performs cheap computation in memory. Runs frequently.
2. **Apply Phase** (2nd arg): Receives the computed value, performs expensive side effects (DOM, API). Only runs if Compute returns a **different** value.
3. **Cleanup**: Return a cleanup function from `effectFn` to run before the next Apply or on disposal.

### Always verify against the source of truth

Before using `createEffect` (or any reactivity primitive), read the actual type definitions:

```bash
# The canonical definitions are in @solidjs/signals
cat node_modules/@solidjs/signals/dist/types/signals.d.ts
```

Also check `node_modules/solid-js/types/client/hydration.d.ts` for any hydration-specific overloads.

---

## Reference

- Release notes: https://github.com/solidjs/solid/releases/tag/v2.0.0-beta.0
- SolidJS 2.0 GitHub: https://github.com/solidjs/solid/tree/next/documentation/solid-2.0

---

## Coding Guidelines

- Always import from `solid-js` for reactivity primitives and from `@solidjs/web` for rendering
- Verify that every imported symbol exists in the type files before using it
- If a type file does not exist at an expected path, report the missing file rather than guessing
- Do not fall back to SolidJS v1.x patterns unless confirmed identical in the v2.0 types
- When in doubt, ask for clarification or refer to the official documentation and type files rather than making assumptions based on prior versions.
- "Always follow the linting rules defined in oxlint.config.ts and tsconfig.app.json. Specifically, avoid negated conditions (prefer flipping branches), use early returns to reduce nesting, and strictly adhere to TypeScript best practices used in this project."
