import { type Component, createEffect, createSignal } from 'solid-js'
import { css } from '#panda/css'

const btn1 = {
  bgGradient: 'to-r',
  border: '1px solid black',
  gradientFrom: 'orange.400',
  gradientTo: 'orange.600',
  color: '#fff',
  padding: '0.5rem 1rem',
  m: '0.5rem 0',
}

const [name, setName] = createSignal('Solid')
createEffect(
  // 1. Compute Phase: ส่วนนี้ใช้ติดตาม Signal (Tracking)
  // และคืนค่าผลลัพธ์เพื่อส่งต่อไปยังเฟสถัดไป
  () => {
    const currentName = name()
    console.log('Computing for:', currentName)
    return currentName
  },

  // 2. Apply Phase (effectFn): ส่วนนี้รับค่าจากเฟส Compute
  // และทำงานกับโลกภายนอก (Side Effects) เช่น DOM หรือ API
  (val) => {
    console.log('Applying side effect for:', val)
    document.title = val

    // สามารถคืนค่า Cleanup function ได้โดยตรงที่นี่ [1], [2]
    return () => console.log('Cleaning up effect for:', val)
  },

  // 3. Options
  { name: 'TitleEffect' },
)

const App: Component = () => {
  return (
    <>
      <button
        onClick={() => {
          setName(name() + ' ==> sss')
        }}
        class={css(btn1)}>
        Plus
      </button>
      <p>{name()}</p>
    </>
  )
}

export default App
