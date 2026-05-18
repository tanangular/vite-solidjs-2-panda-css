import type { JSX } from '@solidjs/web'
import { type Component, createSignal } from 'solid-js'

type DoubleState = {
  value: number
  prevValue?: number
}

const shellStyle: JSX.CSSProperties = {
  'min-height': '100vh',
  display: 'grid',
  padding: '32px',
  color: '#172033',
}

const panelStyle: JSX.CSSProperties = {
  width: 'min(920px, 100%)',
  margin: 'auto',
  display: 'grid',
  gap: '24px',
  padding: '54px',
  'border-radius': '28px',
  background: 'rgba(255, 255, 255, 0.82)',
  'backdrop-filter': 'blur(16px)',
  'box-shadow': '0 24px 80px rgba(23, 32, 51, 0.12)',
}

const metricGridStyle: JSX.CSSProperties = {
  display: 'grid',
  gap: '16px',
  'grid-template-columns': 'repeat(auto-fit, minmax(180px, 1fr))',
}

const metricCardStyle: JSX.CSSProperties = {
  padding: '18px 20px',
  'border-radius': '20px',
  background: 'linear-gradient(180deg, #ffffff 0%, #f7f3ee 100%)',
  border: '1px solid rgba(23, 32, 51, 0.08)',
  'box-shadow': '0 10px 30px rgba(23, 32, 51, 0.06)',
}

const buttonRowStyle: JSX.CSSProperties = {
  display: 'flex',
  gap: '14px',
  'flex-wrap': 'wrap',
}

const baseButtonStyle: JSX.CSSProperties = {
  appearance: 'none',
  border: 'none',
  'border-radius': '999px',
  padding: '14px 20px',
  'font-size': '15px',
  'font-weight': 700,
  cursor: 'pointer',
  transition: 'transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease',
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

  return (
    <main style={shellStyle}>
      <section style={panelStyle}>
        <div style={{ display: 'grid', gap: '10px' }}>
          <span
            style={{
              width: 'fit-content',
              padding: '6px 12px',
              'border-radius': '999px',
              background: '#172033',
              color: '#fffaf2',
              'font-size': '12px',
              'font-weight': 700,
              'letter-spacing': '0.08em',
              'text-transform': 'uppercase',
            }}>
            Solid 2.0 Demo
          </span>

          <h1
            style={{
              margin: 0,
              'font-size': 'clamp(2rem, 5vw, 3.5rem)',
              'line-height': 1,
            }}>
            Writable derived memo
          </h1>

          <p
            style={{
              margin: 0,
              'max-width': '60ch',
              color: '#4a5568',
              'font-size': '1.05rem',
            }}>
            ตัวอย่างนี้ใช้ <code>createSignal(() =&gt; ...)</code> เพื่อ derive
            ค่าแบบเขียนทับได้ และแสดงค่า <code>prev</code> เวลากดปุ่มให้ดูชัด ๆ
          </p>
        </div>

        <div style={metricGridStyle}>
          <article style={metricCardStyle}>
            <p style={{ margin: 0, color: '#6a7282', 'font-size': '0.9rem' }}>
              count
            </p>
            <strong style={{ 'font-size': '2.5rem', 'line-height': 1.1 }}>
              {count()}
            </strong>
          </article>

          <article style={metricCardStyle}>
            <p style={{ margin: 0, color: '#6a7282', 'font-size': '0.9rem' }}>
              doubleCount
            </p>
            <strong style={{ 'font-size': '2.5rem', 'line-height': 1.1 }}>
              {doubleCount().value}
            </strong>
          </article>

          <article style={metricCardStyle}>
            <p style={{ margin: 0, color: '#6a7282', 'font-size': '0.9rem' }}>
              prev ใน derive function
            </p>
            <strong style={{ 'font-size': '2rem', 'line-height': 1.1 }}>
              {doubleCount().prevValue ?? 'ยังไม่มี'}
            </strong>
          </article>

          <article style={metricCardStyle}>
            <p style={{ margin: 0, color: '#6a7282', 'font-size': '0.9rem' }}>
              prev ใน setter function
            </p>
            <strong style={{ 'font-size': '2rem', 'line-height': 1.1 }}>
              {lastSetterPrev() ?? 'ยังไม่มี'}
            </strong>
          </article>
        </div>

        <div
          style={{
            padding: '22px',
            'border-radius': '24px',
            background: '#fffaf2',
          }}>
          <p style={{ margin: '0 0 14px 0', 'font-weight': 700 }}>
            ลองกดปุ่มเพื่อดูการเปลี่ยนค่า
          </p>

          <div style={buttonRowStyle}>
            <button
              onClick={() => setCount((prev) => prev + 1)}
              style={{
                ...baseButtonStyle,
                background: 'linear-gradient(135deg, #e85d3f 0%, #f6a04d 100%)',
                color: '#fff',
                'box-shadow': '0 16px 28px rgba(232, 93, 63, 0.24)',
              }}>
              เพิ่ม count
            </button>

            <button
              onClick={() =>
                setDoubleCount((prev) => {
                  setLastSetterPrev(prev?.value)

                  return {
                    value: (prev?.value ?? 0) + 10,
                    prevValue: prev?.value,
                  }
                })
              }
              style={{
                ...baseButtonStyle,
                background: 'linear-gradient(135deg, #1a6cf0 0%, #4ab5ff 100%)',
                color: '#fff',
                'box-shadow': '0 16px 28px rgba(26, 108, 240, 0.22)',
              }}>
              override doubleCount + 10
            </button>

            <button
              onClick={() => setCount(1)}
              style={{
                ...baseButtonStyle,
                background: '#ffffff',
                color: '#172033',
                border: '1px solid rgba(23, 32, 51, 0.12)',
                'box-shadow': '0 10px 24px rgba(23, 32, 51, 0.08)',
              }}>
              reset count = 1
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}

export default App
