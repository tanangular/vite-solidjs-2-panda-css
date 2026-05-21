# AGENTS.md

## Solid 2.0 — Critical Rules (AI Footguns)

Solid 2.0 is **not** React, and 2.0 is **not** 1.x. Both priors cause the majority of generated bugs here.

### 1. Props are values, not accessors

**Most common AI bug.** Two rules, one boundary:

```jsx
// Parent: call accessors at the JSX boundary
<Counter value={count()} />   // ✅
<Counter value={count} />     // ❌ child receives a function

// Child: read via props.x (not destructured)
function Counter(props) {
  return <div>{props.value}</div>;   // ✅ reactive
}
function Counter({ value }) {         // ❌ destructures once, reactivity dead
  return <div>{value}</div>;
}
```

### 2. Signal reads update only after flush

```ts
setCount(1);
count(); // still 0 — write is queued
flush();
count(); // 1
```

### 3. `createEffect` takes two arguments (split-phase)

```ts
// v2.0 — NOT the v1.x single-callback form
createEffect(
  () => count(),           // compute: tracks, runs frequently
  (value, prev) => {        // apply: side effects, cleanup here
    el.title = value;
    return () => { /* cleanup */ };
  }
);
```

### 4. No writes inside owned scope

Writing signals/stores from inside a memo, effect compute, or component body throws in dev. Move writes to event handlers or `onSettled`. Opt in narrowly with `{ ownedWrite: true }` for internal state only.

### 5. Don't destructure props

Same root cause as rule 1. Use `props.x`, not `({ x }) => ...`.

### 6. `<For>` callback shape follows keying

| Keying | item | i |
|---|---|---|
| default / keyed | plain value | accessor |
| `keyed={false}` | accessor | plain number |
| custom key | accessor | accessor |

### 7. Store setters are draft-first

```ts
setStore(s => {
  s.user.name = "B";       // mutate in place
  s.list.push("x");
});
```

### 8. `undefined` is a real value in `merge` / setters

It overrides, not "skip this key".

---

## Imports (2.0)

```ts
import { createSignal, createMemo, createEffect, createStore, For, Show, Switch, Match, Loading, Errored } from "solid-js";
import { render, Portal, dynamic } from "@solidjs/web";
```

Subpath redirects:
- `solid-js/web` → `@solidjs/web`
- `solid-js/store` → `solid-js`
- `jsxImportSource: "solid-js"` → `"@solidjs/web"`

---

## Key Renames (1.x → 2.0)

| 1.x | 2.0 |
|---|---|
| `Suspense` | `Loading` |
| `SuspenseList` | `Reveal` |
| `ErrorBoundary` | `Errored` |
| `mergeProps` | `merge` |
| `splitProps` | `omit` |
| `unwrap` | `snapshot` |
| `onMount` | `onSettled` |
| `createSelector` | `createProjection` |
| `classList={{}}` | `class={{}}` (object/array form) |
| `Index` | `<For keyed={false}>` |
| `use:foo={x}` directives | `ref={foo(x)}` |
| `attr:` / `bool:` namespaces | removed (standard attribute behavior) |

---

## Removed

- `batch` — microtask batching is default; `flush()` to apply now
- `createComputed` — use `createMemo` or split `createEffect`
- `createResource` — use async computations + `<Loading>`
- `startTransition` / `useTransition` — built-in
- `produce` — draft-first is default
- `createMutable` — `createStore` with draft setters

---

## Class attribute — always object/array form

```jsx
<div class={{ active: isActive(), invalid: !valid() }} />
<div class={["card", props.class, { active: isActive() }]} />
```

No `classList` prop. Don't build class strings manually.

---

## Async pattern

```ts
const user = createMemo(() => fetchUser(id())); // reading user() suspends
```

Pending reads participate in `<Loading>`. Use `isPending(() => x())` for "refreshing…" indicators.

---

## Context is the Provider

```tsx
const TodosContext = createContext<TodosCtx>(); // no default → throws if no Provider

function App() {
  return <TodosContext value={createTodos()}><TodoList /></TodosContext>;
}
```

For primitive fallbacks only (theme, locale): `createContext<T>("light")`.

---

## In tests

```ts
createRoot(dispose => {
  setCount(1);
  flush();
  expect(count()).toBe(1);
  dispose();
});
```

Reactive primitives need an owner — wrap in `createRoot`.

---

## Source of truth

`node_modules/solid-js/CHEATSHEET.md` — single-page 2.0 reference. Read it before generating code.

Read type definitions from `node_modules/solid-js/types/`:
- `index.d.ts` — core APIs (signals, effects, memos, contexts)
- `jsx.d.ts` — JSX types and intrinsic elements
- `store.d.ts` — store APIs and modifiers

Also check `node_modules/@solidjs/signals/dist/types/signals.d.ts` for canonical reactivity primitives.

Full migration: `node_modules/solid-js/documentation/solid-2.0/MIGRATION.md`

---

## Project Coding Style

### 1. Event handlers must be extracted

Always create named handler callback functions inside the component and pass them to JSX.

```tsx
const handleIncrement = () => {
  setCount((prev) => prev + 1);
};

<button onClick={handleIncrement}>Increase</button>;
```

Do not inline non-trivial event logic in JSX.

```tsx
<button
  onClick={() => {
    setCount((prev) => prev + 1);
    logAnalytics();
  }}
/>
```

### 2. Styles must live in CSS files

Keep component files focused on JSX structure and logic. Put styles in a dedicated CSS file and import it from the component.

```tsx
import "./App.css";
```

Do not define large inline style objects in the component unless there is a narrow, unavoidable runtime need.
