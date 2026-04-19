import { type Component, createMemo, createSignal, Loading } from 'solid-js'
import { css, type Styles } from '#panda/css'

const heading1: Styles = {
  fontSize: '2.8rem',
  fontWeight: 'bold',
  margin: '.5rem auto',
  fontFamily: 'Google Sans',
}

const btn1 = {
  bg: '#6200ee',
  color: '#fff',
  padding: '0.5rem 1rem',
  m: '0.5rem 0',
}

const App: Component = () => {
  const [userId, setUserId] = createSignal(1)

  // 1. ฟังก์ชันที่ส่งค่ากลับเป็น PromiseLike (ตรงกับนิยาม ComputeFunction)
  const fetchMockData = (id: number, prev: unknown) => {
    console.log('id: ', id, prev)
    return new Promise<string>((resolve) => {
      // จำลองการดึงข้อมูลที่ใช้เวลา 1 วินาที
      setTimeout(() => resolve(`ข้อมูลของผู้ใช้ไอดี: ${id}`), 700)
    })
  }

  // 2. ใช้ createMemo ที่คืนค่าเป็น Promise
  // ใน Solid 2.0, createMemo จะ "suspend" อัตโนมัติเมื่อคืนค่าเป็น Promise [2]
  const userData = createMemo((prev) => fetchMockData(userId(), prev), 10)

  return (
    <>
      <button onClick={() => setUserId((id) => id + 1)} class={css(btn1)}>
        เปลี่ยน User (ปัจจุบัน: {userId()})
      </button>

      <hr />

      {/* 3. ใช้คอมโพเนนต์ <Loading> เพื่อแสดงผลระหว่างรอ Promise Resolve */}
      <Loading fallback={<p>กำลังโหลดข้อมูลจาก Promise...</p>}>
        <div class={css(heading1)}>
          <h3>ผลลัพธ์:</h3>
          {/* เมื่อ Promise สำเร็จ ค่าที่ถูก Resolve จะถูกส่งออกมาที่นี่ */}
          <p>{userData()}</p>
        </div>
      </Loading>
    </>
  )
}

export default App
