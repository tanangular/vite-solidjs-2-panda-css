import { type Component, createSignal } from 'solid-js'
import { css, type Styles } from '#panda/css'

const style1: Styles = {
  bgColor: 'amber.400',
  border: '2px solid',
  borderColor: 'amber.800',
}

const style2: Styles = {
  bgColor: 'fuchsia.400',
  border: '2px solid',
  borderColor: 'fuchsia.800',
}

const paragraph1 = {
  paddingInline: '6rem',
  paddingBlock: '1rem',
  marginBlock: '2rem',
}

const buttonStyle: Styles = {
  bgColor: 'gray.200',
  padding: '.5rem 1rem',
  dropShadow: 'md',
  borderRadius: '0.5rem',
  cursor: 'pointer',
  margin: '1rem 0',
  _hover: {
    bgColor: 'gray.300',
  },
}

const heading1: Styles = {
  fontSize: '2.8rem',
  fontWeight: 'bold',
  margin: '.5rem auto',
  fontFamily: 'Google Sans',
}

const App: Component = () => {
  const [counter1, setCounter1] = createSignal(10)
  const [counter2, setCounter2] = createSignal(initializeCounter)

  function initializeCounter() {
    return counter1() + 33
  }

  return (
    <>
      <pre>ตัวอย่างนี้แสดงให้เห็นถึง Writable Derived Signal ใน signal 2.0</pre>
      <blockquote>
        ใน SolidJS 2.0 คำว่า "Writable Derived Signal" หมายถึง Signal
        รูปแบบใหม่ที่สร้างขึ้นโดยการส่ง "ฟังก์ชัน (fn)" เข้าไปใน createSignal
        แทนที่จะเป็นการใส่ค่าข้อมูลเริ่มต้นแบบปกติ
        <br />
        <br/>- แนวคิดหลัก: มันถูกออกแบบมาให้ทำหน้าที่คล้ายกับ "Writable Memo" (เมโมที่สามารถเขียนค่าทับได้) ซึ่งจะคำนวณค่าของตัวเองโดยอัตโนมัติจาก Signal อื่นๆ ที่มันพึ่งพาอยู่
        <br/>- วิธีการสร้าง: ใช้ไวยากรณ์ createSignal(() => logic) โดยฟังก์ชันที่ใส่เข้าไปจะถูกใช้ในการคำนวณค่าเริ่มต้นและติดตามความเปลี่ยนแปลงแบบ Reactive
        <br /><br/> สังเกตุว่า #2 signal counter2 จะ derived ค่าจาก counter1() + 33 เมื่อ counter1 เปลี่ยน counter2 ก็จะเปลี่ยนตามไปด้วยโดยอัตโนมัติ (กด Increment ใน #1, counter2 ใน #2 เปลี่ยนตาม)
      </blockquote>
      <div class={css(style1, paragraph1)}>
        <header class={css(heading1)}>#1 createSignal ด้วย primitive value</header>
        <p>createSignal(0)</p>
        <h2 class={css(heading1)}>Counter: {counter1()}</h2>
        <button
          onClick={() => setCounter1(counter1() + 1)}
          class={css(buttonStyle)}>
          Increment
        </button>
      </div>

      <div class={css(style2, paragraph1)}>
        <header class={css(heading1)}>
          #2 createSignal ด้วย initializeCounter
        </header>
        <h2 class={css(heading1)}>Counter: {counter2()}</h2>
        <button
          onClick={() => setCounter2(counter2() + 1)}
          class={css(buttonStyle)}>
          Increment
        </button>
      </div>
    </>
  )
}

export default App
