import { type Component, createSignal } from 'solid-js'
import './App.css'

type DoubleState = {
  value: number
  prevValue?: number
}

const App: Component = () => {
  const [count, setCount] = createSignal(1)
  const [lastSetterPrev, setLastSetterPrev] = createSignal<number | undefined>()

  const [doubleCount, setDoubleCount] = createSignal<DoubleState>((prev) => {
    const nextValue = count() * 2

    return {
      value: nextValue,
      prevValue: prev?.value,
    }
  })

  const handleIncreaseCount = () => {
    setCount((prev) => prev + 1)
  }

  const handleOverrideDoubleCount = () => {
    setDoubleCount((prev) => {
      setLastSetterPrev(prev?.value)

      return {
        value: (prev?.value ?? 0) + 10,
        prevValue: prev?.value,
      }
    })
  }

  const handleResetCount = () => {
    setCount(1)
  }

  return (
    <main class="app-shell">
      <section class="app-panel">
        <div class="app-hero">
          <span class="app-badge">Solid 2.0 Demo</span>

          <h1 class="app-title">Writable derived memo</h1>

          <p class="app-description" lang="th">
            ตัวอย่างนี้ใช้ <code>createSignal(fn ...)</code> เพื่อ derive ค่าแบบเขียนทับได้
            และแสดงค่า <code>prev</code> เวลากดปุ่มให้ดูชัด ๆ
          </p>
        </div>

        <div class="metrics-grid">
          <article class="metric-card">
            <p class="metric-label">count</p>
            <strong class="metric-value-lg">{count()}</strong>
          </article>

          <article class="metric-card">
            <p class="metric-label">doubleCount</p>
            <strong class="metric-value-lg">{doubleCount().value}</strong>
          </article>

          <article class="metric-card">
            <p class="metric-label nowrap" lang="th">prev ใน derive function</p>
            <strong class="metric-value-lg">
              <span lang="th">{doubleCount().prevValue ?? 'ยังไม่มี'}</span>
            </strong>
          </article>

          <article class="metric-card">
            <p class="metric-label nowrap" lang="th">prev ใน setter function</p>
            <strong class="metric-value-lg">
              <span lang="th">{lastSetterPrev() ?? 'ยังไม่มี'}</span>
            </strong>
          </article>
        </div>

        <div class="actions-panel">
          <p class="actions-title" lang="th">ลองกดปุ่มเพื่อดูการเปลี่ยนค่า</p>

          <div class="button-row">
            <button
              onClick={handleIncreaseCount}
              lang="th"
              class="action-button action-button-primary">
              เพิ่ม count
            </button>

            <button
              onClick={handleOverrideDoubleCount}
              lang="th"
              class="action-button action-button-info">
              override doubleCount + 10
            </button>

            <button
              onClick={handleResetCount}
              lang="th"
              class="action-button action-button-secondary">
              reset count = 1
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
