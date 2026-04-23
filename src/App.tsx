import { type Component, createSignal, Show } from 'solid-js'
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

// สร้าง Signal พร้อมกำหนดค่า unobserved
const [count, _setCount] = createSignal(0, {
  name: 'MyCounter',
  // คอลแบ็กนี้จะรันเมื่อ Signal "ไม่ถูกใช้งานแล้ว"
  unobserved: () => {
    console.log("⚠️ Signal 'count' สูญเสียผู้ติดตามทั้งหมดแล้ว! (Unobserved)")
    // ประโยชน์: ใช้ปิด WebSocket, เคลียร์ Timer หรือหยุดการ Fetch ข้อมูลที่ต้นทาง
  },
})

const App: Component = () => {
  const [visible, setVisible] = createSignal(true)

  return (
    <>
      <button
        onClick={() => {
          setVisible(!visible())
          console.log('visible: ', visible())
        }}
        class={css(btn1)}>
        Toggle Visibility
      </button>
      <Show when={visible()}>
        {/* ทันทีที่ visible() เป็น true: count() จะถูกอ่าน และเกิดการ Subscribe */}
        {/* ทันทีที่ visible() เป็น false: count() จะหยุดถูกอ่าน และถูก Unsubscribe */}
        <p>Current Count: {count()}</p>
      </Show>
    </>
  )
}

export default App
