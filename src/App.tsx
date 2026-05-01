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
  const [bundleDivider, setBundleDivider] = createSignal(5)
  const [bundleResult, setBundleResult] = createSignal('100 / 5 = 20')
  const [bundleError, setBundleError] = createSignal('')

  const [count, setCount] = createSignal(0)
  const doubled = createMemo((prev: number | undefined) => (prev ?? 0) + count())

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

  createEffect(
    () => {
      const divider = bundleDivider()

      if (divider === 0) {
        throw new Error('หารด้วย 0 ไม่ได้')
      }

      return {
        divider,
        result: 100 / divider,
      }
    },
    {
      effect: ({ divider, result }) => {
        setBundleError('')
        setBundleResult(`100 / ${divider} = ${result}`)

        return () => {
          setBundleResult('กำลังคำนวณค่าใหม่...')
        }
      },
      error: (err, cleanup) => {
        cleanup()
        setBundleError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก')
      },
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

      <section class={css(section)} id="effect-bundle">
        <h1 class={css(h1)}>Example2: createEffect แบบ EffectBundle</h1>
        <br />
        <p>
          `EffectBundle` คือรูปแบบที่ส่ง object เป็นพารามิเตอร์ตัวที่ 2 ของ `createEffect`
          โดยแยก handler ออกเป็น `effect` สำหรับงานปกติ และ `error`
          สำหรับจัดการข้อผิดพลาด
        </p>
        <ol class={css(listStyle)}>
          <li>
            `effect`: ทำงานเมื่อ Compute Phase คืนค่าสำเร็จ และรับค่าที่ compute ส่งมา
          </li>
          <li>
            `error`: ทำงานเมื่อ Compute หรือ Effect โยน error และได้รับ `cleanup`
            เพื่อเก็บงานเก่าก่อนจัดการ error
          </li>
        </ol>
        <p>
          ตัวอย่างนี้คำนวณ <strong>100 / ตัวหาร</strong> ถ้าเลือกตัวหารเป็น 0 จะ throw
          error แล้วส่งไปที่ `error` handler ของ EffectBundle
        </p>
        <ShikiCodearea
          id="effect-bundle-code"
          initialCode={`export type EffectBundle<Prev, Next extends Prev = Prev> = {
  effect: EffectFunction<Prev, Next>
  error: (err: unknown, cleanup: () => void) => void
}

const [divider, setDivider] = createSignal(5)
const [result, setResult] = createSignal('100 / 5 = 20')
const [error, setError] = createSignal('')

createEffect(
  () => {
    const value = divider()

    if (value === 0) {
      throw new Error('หารด้วย 0 ไม่ได้')
    }

    return {
      divider: value,
      result: 100 / value,
    }
  },
  {
    effect: ({ divider, result }) => {
      setError('')
      setResult(\`100 / \${divider} = \${result}\`)

      return () => {
        setResult('กำลังคำนวณค่าใหม่...')
      }
    },
    error: (err, cleanup) => {
      cleanup()
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดที่ไม่รู้จัก')
    },
  },
)`}
          lang="typescript"
          theme="laserwave"></ShikiCodearea>
        <section
          style={{
            display: 'flex',
            'align-items': 'center',
            gap: '6px',
            margin: '0.5rem 0',
          }}>
          ตัวหาร:{' '}
          <div class={css(numberDisplay2)} id="bundle-divider">
            {bundleDivider()}
          </div>
        </section>
        <p>
          ผลลัพธ์:{' '}
          <span class={css({ color: 'lightgreen', fontWeight: 'bold' })}>
            {bundleResult()}
          </span>
        </p>
        <p>
          Error:{' '}
          <span class={css({ color: 'salmon', fontWeight: 'bold' })}>
            {bundleError() || '-'}
          </span>
        </p>
        <button onClick={() => setBundleDivider(5)} class={css(btn1)}>
          หารด้วย 5
        </button>
        <button onClick={() => setBundleDivider(4)} class={css(btn1)}>
          หารด้วย 4
        </button>
        <button onClick={() => setBundleDivider(0)} class={css(btn1)}>
          ลองหารด้วย 0
        </button>
      </section>

      <section class={css(section)} id="create-signal">
        <h1 class={css(h1)}>Example3: createSignal ใน SolidJS 2.0</h1>
        <br />
        <p>
          `createSignal` คือ primitive พื้นฐานสุดของ SolidJS สำหรับสร้างสถานะแบบ Reactive
          คืนค่าเป็น tuple `[get, set]` โดย `get` เป็น Accessor (ฟังก์ชันอ่านค่า)
          และ `set` เป็น Setter (ฟังก์ชันเขียนค่า)
        </p>

        <h2 class={css({ ...h1, fontSize: '1.1rem', backgroundColor: 'teal.600' })}>
          3 Overloads ของ createSignal
        </h2>
        <ShikiCodearea
          id="create-signal-overloads"
          initialCode={`// Overload 1: ไม่ส่งค่าเริ่มต้น → type จะ extend undefined
export declare function createSignal<T>(): Signal<T | undefined>

// Overload 2: ส่งค่าเริ่มต้น (ค่าธรรมดา ไม่ใช่ฟังก์ชัน)
export declare function createSignal<T>(
  value: Exclude<T, Function>,
  options?: SignalOptions<T>,
): Signal<T>

// Overload 3: ส่งฟังก์ชัน → สร้าง Writable Memo
export declare function createSignal<T>(
  fn: ComputeFunction<T>,
  options?: SignalOptions<T> & MemoOptions<T>,
): Signal<T>`}
          lang="typescript"
          theme="github-dark"
        />

        <h2 class={css({ ...h1, fontSize: '1.1rem', backgroundColor: 'teal.600' })}>
          SignalOptions
        </h2>
        <ShikiCodearea
          id="signal-options"
          initialCode={`export interface SignalOptions<T> {
  /** ชื่อสำหรับ Debug (dev mode เท่านั้น) */
  name?: string
  /** ฟังก์ชันเปรียบเทียบความเท่ากัน หรือ false เพื่อแจ้งทุกครั้ง */
  equals?: false | ((prev: T, next: T) => boolean)
  /** ระงับการเตือน dev-mode เมื่อเขียนใน owned scope */
  ownedWrite?: boolean
  /** เรียกเมื่อ signal ไม่มี subscriber แล้ว */
  unobserved?: () => void
}`}
          lang="typescript"
          theme="github-dark"
        />

        <h2 class={css({ ...h1, fontSize: '1.1rem', backgroundColor: 'teal.600' })}>
          Setter Type
        </h2>
        <ShikiCodearea
          id="setter-type"
          initialCode={`export type Setter<in out T> = {
  // กรณี T รวม undefined: เรียกได้โดยไม่ส่ง argument → undefined
  <U extends T>(...args: undefined extends T
    ? []
    : [value: Exclude<U, Function> | ((prev: T) => U)]
  ): undefined extends T ? undefined : U

  // ส่งฟังก์ชัน updater: (prev: T) => U
  <U extends T>(value: (prev: T) => U): U

  // ส่งค่าธรรมดา (ไม่ใช่ Function)
  <U extends T>(value: Exclude<U, Function>): U

  // ส่งค่าหรือฟังก์ชัน
  <U extends T>(value: Exclude<U, Function> | ((prev: T) => U)): U
}`}
          lang="typescript"
          theme="github-dark"
        />

        <h2 class={css({ ...h1, fontSize: '1.1rem', backgroundColor: 'teal.600' })}>
          Demo: การใช้ createSignal และ Setter
        </h2>
        <p>
          กดปุ่มเพื่อเพิ่มค่า — แสดง count และ doubled (ผ่าน createMemo)
        </p>
        <ShikiCodearea
          id="create-signal-demo"
          initialCode={`const [count, setCount] = createSignal(0)

// createMemo ใช้อ่าน count() แล้วคำนวณค่าใหม่
const doubled = createMemo(
  (prev: number | undefined) => (prev ?? 0) + count()
)

// Setter แบบฟังก์ชัน: รับค่าก่อนหน้า คืนค่าใหม่
setCount((prev) => prev + 1)

// Setter แบบค่าธรรมดา: ตั้งค่าโดยตรง
setCount(0)`}
          lang="typescript"
          theme="laserwave"
        />

        <section
          style={{
            display: 'flex',
            'align-items': 'center',
            gap: '12px',
            margin: '0.5rem 0',
          }}>
          <span>
            Count:{' '}
            <span class={css({ color: 'lightgreen', fontWeight: 'bold' })}>
              {count()}
            </span>
          </span>
          <span>
            Doubled:{' '}
            <span class={css({ color: 'skyblue', fontWeight: 'bold' })}>
              {doubled()}
            </span>
          </span>
        </section>
        <button onClick={() => setCount((prev) => prev + 1)} class={css(btn1)}>
          +1 (Setter แบบฟังก์ชัน)
        </button>
        <button onClick={() => setCount(0)} class={css(btn1)}>
          รีเซ็ต (Setter แบบค่าธรรมดา)
        </button>
      </section>
    </>
  )
}

export default App
