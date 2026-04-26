import confetti from '@hiseb/confetti'
import { type Component, createEffect, createSignal } from 'solid-js'
import { css, type Styles } from '#panda/css'
import ShikiCodearea from './components/ShikiCodearea'

const btn1: Styles = {
  bgGradient: 'to-r',
  border: '1px solid black',
  gradientFrom: 'teal.800',
  gradientTo: 'teal.400',
  color: '#fff',
  padding: '0.5rem 1rem',
  m: '0.5rem 0',
}

const h1: Styles = {
  fontSize: '1.5rem',
  backgroundColor: 'teal.800',
  margin: '0.5rem 0',
  padding: '0.3rem 0.8rem',
}

const listStyle: Styles = {
  listStyle: 'outside',
}

const section: Styles = {
  marginBlockStart: '3rem',
  border: '1px dashed black',
  padding: '1rem',
}

const randomInts = (num: number, maxInt: number = 10) =>
  Array.from({ length: num }, () => Math.floor(Math.random() * maxInt))

const numbers = randomInts(20, 100)
console.log('numbers:', numbers)
const [name, setName] = createSignal('Solid')
const [selected, setSelected] = createSignal(0)

createEffect(
  // Compute Phase: คืนค่าเฉพาะเมื่อ parity เปลี่ยน (true=odd, false=even)
  () => selected() % 2 !== 0,
  // Apply Phase: รันเมื่อ isOdd เปลี่ยนจากค่าเดิม
  (isOdd, wasOdd) => {
    if (wasOdd === false && isOdd) {
      confetti({
        position: { x: 700, y: 500 },
        count: 300,
        size: 1,
        velocity: 86,
      })
    }
  },
)

const App: Component = () => {
  /**
   * createEffect - สร้าง Effect ที่ทำงานเมื่อ Signal ที่ใช้ภายในเปลี่ยนค่า
   *
   * @param effectFn - ฟังก์ชันในเฟส Compute สำหรับติดตาม Signal และคืนค่า
   * @param applyFn - ฟังก์ชันในเฟส Apply สำหรับทำ Side Effects (รับค่าจาก effectFn)
   * @param options - ออปชันเสริม เช่น { name: 'ชื่อสำหรับ Debug' }
   *
   * @returns Disposable - ฟังก์ชันสำหรับยกเลิก Effect
   */
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

  return (
    <>
      <h1 class={css(h1)}>ใน SolidJS 2.0: มีการแยกเฟส (Split Phases)</h1>
      <p>
        ในเวอร์ชัน 2.0 สถาปัตยกรรมถูกเปลี่ยนมาเป็นการแยกเฟสอย่างชัดเจน คือ Compute → Apply
        เพื่อความแม่นยำ (Fine-grained) สูงสุด
      </p>
      <ShikiCodearea
        id="sourcecode-create-effect"
        initialCode={`export declare function createEffect<T>(compute: ComputeFunction<undefined | NoInfer<T>, T>, effectFn: EffectFunction<NoInfer<T>, T> | EffectBundle<NoInfer<T>, T>, options?: EffectOptions): void;`}
        lang="typescript"
        theme="github-dark"
      />
      <ol class={css(listStyle)}>
        <li>
          Compute Phase (พารามิเตอร์ที่ 1): ทำหน้าที่ในเฟสการติดตาม (Reactive Tracking)
          ระบบจะเก็บค่านี้ไว้ และคืนค่าผลลัพธ์ออกมา
        </li>
        <li>
          Apply Phase (พารามิเตอร์ที่ 2): รับค่าที่ได้จากเฟส Compute
          มาทำงานจริงกับโลกภายนอก (Side Effects) มักเกี่ยวข้องกับการแก้ DOM หรือ API
          ภายนอก (ราคาแพง)
        </li>
      </ol>
      <p>&nbsp;</p>
      <p>
        ทำไมถึงทำแบบนี้? เพราะเฟส Compute รันบนหน่วยความจำซึ่งทำงานได้เร็วมาก (ราคาถูก)
        <br />
        ส่วนเฟส Apply มักเกี่ยวข้องกับการแก้ DOM หรือ API ภายนอก (ราคาแพง)
        <br />
        ระบบจึงเลือกที่จะรัน Compute เพื่อเช็คผลลัพธ์ก่อน ถ้าผลลัพธ์ไม่เปลี่ยน ระบบจะข้ามเฟส Apply
        ไปเลย
      </p>

      <section class={css(section)} id="example1">
        <h1 class={css(h1)}>Example1: Basic createEffect()</h1>
        <ShikiCodearea
          id="example1"
          initialCode={`
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
`}
          lang="typescript"
          theme="laserwave"
        />
        <button
          onClick={() => {
            setName(name() + ' is JS framework')
          }}
          class={css(btn1)}>
          กดเพื่อเปลี่ยนชื่อและดูผลลัพธ์ใน console และ title ของหน้าเว็บ
        </button>
        <p>{name()}</p>
      </section>

      <section class={css(section)} id="example2">
        <h1 class={css(h1)}>Example2: Skip Apply ผ่าน Split-Phase + Confetti</h1>
        <br />
        <p>
          สาธิต Split-Phase: Detect การเปลี่ยน parity (even→odd) และยิง confetti
        </p>
        <p>กดสุ่มตัวเลขจากรายการ — confetti จะแสดงเฉพาะเมื่อเปลี่ยนจากเลขคู่ไปเลขคี่</p>
        <p>
          รายการตัวเลข:{' '}
          <span class={css({ color: 'darksalmon', fontWeight: 'bold' })}>
            [{numbers.join(', ')}]
          </span>
        </p>
        <ShikiCodearea
          id="example2"
          initialCode={`
import { createEffect, createSignal } from "solid-js";
import confetti from "@hiseb/confetti";

const numbers = [...]; // 20 random ints
const [selected, setSelected] = createSignal(0);

createEffect(
  // 1. Compute Phase: คืนค่า isOdd (boolean) — เช็ค parity
  () => selected() % 2 !== 0,

  // 2. Apply Phase: รันเมื่อ isOdd เปลี่ยนค่าเท่านั้น
  //    wasOdd = ค่าจากรอบก่อน, isOdd = ค่าปัจจุบัน
  (isOdd, wasOdd) => {
    if (wasOdd === false && isOdd === true) {
      // Transition: even → odd → show confetti!
      confetti({ position: { x: 0.5, y: 0.5 }, count: 200, size: 8, velocity: 16 })
    }
  },
);
`}
          lang="typescript"
          theme="laserwave"></ShikiCodearea>
        <div>
          เลือกตัวเลขปัจจุบัน:{' '}
          <span class={css({ fontWeight: 'bold', color: 'gold' })}>
            {selected()}
          </span>
        </div>
        <button
          onClick={() => {
            const idx = Math.floor(Math.random() * numbers.length)
            setSelected(numbers[idx])
          }}
          class={css(btn1)}>
          สุ่มตัวเลขจากรายการ
        </button>
      </section>
    </>
  )
}

export default App
