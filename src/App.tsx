import { type Component, createSignal } from 'solid-js'
import { css, type Styles } from '#panda/css'

const style1: Styles = {
  bgColor: 'amber.400',
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

function initializeCounter2() {
  return 40
}

function initializeCounter3() {
  return 60
}

const App: Component = () => {
  const [counter1, setCounter1] = createSignal(0)
  const [counter2, setCounter2] = createSignal(initializeCounter2)
  const [counter3, setCounter3] = createSignal(initializeCounter3())

  return (
    <>
      <div class={css(style1, paragraph1)}>
        <header class={css(heading1)}>createSignal ด้วย primitive value</header>
        <p>createSignal(0)</p>
        <h2 class={css(heading1)}>Counter: {counter1()}</h2>
        <button
          onClick={() => setCounter1(counter1() + 1)}
          class={css(buttonStyle)}>
          Increment
        </button>
      </div>

      <div class={css(style1, paragraph1)}>
        <header class={css(heading1)}>
          createSignal ด้วย initializeCounter
        </header>
        <h2 class={css(heading1)}>Counter: {counter2()}</h2>
        <button
          onClick={() => setCounter2(counter2() + 1)}
          class={css(buttonStyle)}>
          Increment
        </button>
      </div>

      <div class={css(style1, paragraph1)}>
        <header class={css(heading1)}>
          createSignal ด้วย initializeCounter()
        </header>
        <h2 class={css(heading1)}>Counter: {counter3()}</h2>
        <button
          onClick={() => setCounter3(counter3() + 1)}
          class={css(buttonStyle)}>
          Increment
        </button>
      </div>
    </>
  )
}

export default App
