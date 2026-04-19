import { type Component, createMemo, createSignal } from 'solid-js'
import { css, type Styles } from '#panda/css'

const heading1: Styles = {
  fontSize: '2.8rem',
  fontWeight: 'bold',
  margin: '.5rem auto',
  fontFamily: 'Google Sans',
}

const App: Component = () => {
  const [counter, setCounter] = createSignal(
    (console.log('createSignal first: counter: '), 20),
  )

  const normalFunction = (prev: number | undefined) => {
    console.log('normalFunction: ', prev)
    counter()
    return (prev ?? 0) * 1.1
  }

  const memo = createMemo(normalFunction, 45)

  return (
    <div
      class={css(
        { bgColor: 'amber.400', border: '2px solid', borderColor: 'amber.800' },
        { paddingInline: '6rem', paddingBlock: '1rem', marginBlock: '2rem' },
      )}>
      <header class={css(heading1)}>
        ทดลองการใช้งาน ตัวแปรธรรมดา (const val = ...):
        ดีที่สุดสำหรับค่าคงที่ที่คำนวณครั้งเดียวจบ เพราะไม่มี Overhead ของระบบ Reactive
      </header>
      <button
        onClick={() => setCounter(counter() + 1)}
        class={css({ bg: 'red.400', p: '1rem' })}>
        Increment
      </button>
      <p>{`count: ${counter()}`}</p>
      <p>{(console.log('hello memo 1'), memo())}</p>
      <p>{(console.log('hello memo 2'), memo())}</p>
      <p>{(console.log('hello memo 3'), memo())}</p>
      {(console.log('++++++++++++++++++'), `  `)}
    </div>
  )
}

export default App
