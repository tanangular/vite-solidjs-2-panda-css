import { type Component, createMemo, createSignal, Loading } from 'solid-js'
import { css } from '#panda/css'

const btn1 = {
  bg: 'violet.500',
  color: '#fff',
  padding: '0.5rem 1rem',
  m: '0.5rem 0',
}

const App: Component = () => {
  const [trigger, setTrigger] = createSignal(0)

  // 1. สร้างฟังก์ชันที่คืนค่าเป็น AsyncIterable (ใช้ async function*)
  // ตามนิยาม: (v: Prev) => AsyncIterable<Next>
  async function* fetchStreamData(id: number) {
    yield 'กำลังเชื่อมต่อ...' // ค่าแรกที่ส่งออกมา
    await new Promise((r) => setTimeout(r, 1000))

    yield 'กำลังดึงข้อมูลส่วนที่ 1...' // ค่าที่สอง
    await new Promise((r) => setTimeout(r, 1000))

    yield `ข้อมูลของ ID ${id} เสร็จสมบูรณ์!` // ค่าสุดท้าย
  }

  // 2. ใช้ใน createMemo
  // ใน Solid 2.0, memo จะติดตามการ 'yield' ของ AsyncIterable และอัปเดตค่าโดยอัตโนมัติ
  const dataStream = createMemo(() => fetchStreamData(trigger()))

  return (
    <div>
      <button onClick={() => setTrigger((t) => t + 1)} class={css(btn1)}>
        เริ่มดึงข้อมูลใหม่ (ครั้งที่ {trigger()})
      </button>

      <hr />

      {/* 3. ใช้ <Loading> เพื่อจัดการสถานะเริ่มต้น */}
      <Loading fallback={<p>กำลังเตรียมการ Stream...</p>}>
        <div>
          <h3>สถานะปัจจุบัน:</h3>
          {/* ค่านี้จะเปลี่ยนไปตามที่ Generator ทำการ yield ออกมา */}
          <p>{dataStream()}</p>
        </div>
      </Loading>
    </div>
  )
}

export default App
