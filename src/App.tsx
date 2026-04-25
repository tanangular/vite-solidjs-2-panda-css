import { type Component, createEffect, createSignal, Show } from 'solid-js'
import { css, type Styles } from '#panda/css'
import ShikiCodearea from './components/ShikiCodearea'

const btn1: Styles = {
  bgGradient: 'to-r',
  border: '1px solid black',
  gradientFrom: 'orange.400',
  gradientTo: 'orange.600',
  color: '#fff',
  padding: '0.5rem 1rem',
  m: '0.5rem 0',
}

const h1: Styles = {
  fontSize: '1.5rem',
  backgroundColor: 'lightpink',
  margin: '0.5rem 0',
}

const listStyle: Styles = {
  listStyle: 'outside',
}

const section: Styles = {
  marginBlockStart: '3rem',
  border: '1px dashed black',
  padding: '1rem',
}

const [name, setName] = createSignal('Solid')
const [count2, setCount2] = createSignal(2)

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

const App: Component = () => {
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
        <h1 class={css(h1)}>Example2: createEffect() Solid 2.0 Way</h1>
        <p>
          จาก Example#1 SolidJs 2.0 มีการเปลี่ยนแปลง api สำหรับ createEffect เป็น 2
          phase คือ computed และ apply คำถามคือ ทำไมถึงต้องทำแบบนี้
        </p>
        <p>
          เพื่อยกตัวอย่างให้เห็นภาพ สมมุติเรามีโจทย์ว่า จะให้ระบบ effect ในกรณีที่
          สถานะความเป็นเลขคู่เปลี่ยนเท่านั้น
        </p>
        <br />
        <p>ตัวอย่างที่ 1: Compute แล้วไม่ Apply (Skip by Equality)</p>
        <p>โจทย์: มีตัวเลขสุ่มจำนวนเต็ม 20 ตัว</p>
        <ShikiCodearea
          id="example2"
          initialCode={`
import { createEffect, createSignal } from "solid-js";

const [count, setCount] = createSignal(0);

createEffect(
  // 1. Compute Phase: คืนค่าว่าเป็นเลขคู่หรือไม่ (true/false)
  () => count() % 2 === 0, 
  
  // 2. Apply Phase: จะรันเฉพาะเมื่อค่าที่ Compute คืนมา "เปลี่ยนไป" เท่านั้น
  (isEven) => {
    console.log("Apply รันแล้ว! ค่าสถานะเลขคู่เปลี่ยนเป็น:", isEven);
    // ถ้าเปลี่ยนจาก 2 ไป 4: Compute ได้ true เหมือนเดิม -> Apply จะไม่ถูกรัน [1]
  }
);
`}
          lang="typescript"
          theme="laserwave"></ShikiCodearea>
        <p>count2: {count2()}</p>
        <div>
          <Show when={true}>xx</Show>
        </div>
        <button
          onClick={() => {
            setCount2(count2() + 1)
          }}
          class={css(btn1)}>
          เพิ่มทีละ 1
        </button>
      </section>
    </>
  )
}

export default App
