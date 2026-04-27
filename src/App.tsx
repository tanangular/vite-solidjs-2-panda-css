import confetti from '@hiseb/confetti'
import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
} from 'solid-js'
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

const numberDisplay: Styles = {
  display: 'inline-grid',
  aspectRatio: 1,
  fontSize: '0.88rem',
  fontWeight: '600',
  placeItems: 'center',
  padding: '6px',
  width: '30px',
  height: '30px',
  backgroundColor: 'darkblue',
}

const numberDisplay2: Styles = {
  ...numberDisplay,
  backgroundColor: 'pink.500',
}

const randomInts = (num: number, maxInt: number = 10) =>
  Array.from({ length: num }, () => Math.floor(Math.random() * maxInt))

type Parity = 'even' | 'odd'

const getParity = (value: number): Parity => (value % 2 === 0 ? 'even' : 'odd')

const numbers = randomInts(20, 100)
const [selected, setSelected] = createSignal(1)
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

  /* Example 2 */
  const selectedTransition = createMemo(
    (prev: { curr: number; prev: number } | undefined) => {
      const curr = selected()

      return {
        curr,
        prev: prev?.curr ?? 0,
      }
    },
  )

  const prevSelected = () => selectedTransition().prev

  createEffect(
    () => getParity(selected()),
    (parity, prevParity) => {
      if (prevParity !== 'even' || parity !== 'odd') {
        return
      }

      confetti({
        position: { x: 700, y: 500 },
        count: 300,
        size: 1,
        velocity: 106,
      })
    },
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

      <section class={css(section)} id="example2">
        <h1 class={css(h1)}>Example1: Skip Apply ผ่าน Split-Phase + Confetti</h1>
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
const selectedTransition = createMemo((prev: { curr: number; prev: number } | undefined) => {
    const curr = selected()

    return {
      curr,
      prev: prev?.curr ?? 0,
    }
  })

  const prevSelected = () => selectedTransition().prev

  createEffect(
    () => getParity(selected()),
    (parity, prevParity) => {
      if (prevParity !== 'even' || parity !== 'odd') {
        return
      }

      confetti({
        position: { x: 700, y: 500 },
        count: 300,
        size: 1,
        velocity: 106,
      })
    },
  )
`}
          lang="typescript"
          theme="laserwave"></ShikiCodearea>
        <section
          style={{
            display: 'flex',
            'align-items': 'center',
            gap: '6px',
            margin: '0.5rem 0',
          }}>
          เลือกตัวเลข:{' '}
          <div class={css(numberDisplay)} id="prev">
            {prevSelected()}
          </div>
          {' → '}
          <div class={css(numberDisplay2)} id="next">
            {selected()}
          </div>
        </section>
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
