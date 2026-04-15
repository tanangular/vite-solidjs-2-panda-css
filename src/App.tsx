import {
  type Component,
  createEffect,
  createMemo,
  createSignal,
} from 'solid-js'
import { css, type Styles } from '#panda/css'

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
  const [counter1, setCounter1] = createSignal(20)
  const double1 = createMemo(() => {
    console.log('double1')
    return counter1() * 2
  })

  const double2 = () => {
    console.log('double2')
    return counter1() * 2
  }

  const [double3, _setCounter3] = createSignal(() => {
    console.log('double3')
    return counter1() * 2
  })

  const [double4, setDouble4] = createSignal(0)

  createEffect(
    () => counter1() * 2,
    (value) => {
      console.log('double4: ', value)
      setDouble4(value)
    },
  )

  return (
    <div
      class={css(
        { bgColor: 'amber.400', border: '2px solid', borderColor: 'amber.800' },
        { paddingInline: '6rem', paddingBlock: '1rem', marginBlock: '2rem' },
      )}>
      <header class={css(heading1)}>#1 createSignal ด้วย primitive value</header>
      <p>{double1()}</p>
      <p>{double1()}</p>
      <br />

      <p>{double2()}</p>
      <p>{double2()}</p>
      <br />

      <p>{double3()}</p>
      <p>{double3()}</p>
      <br />

      <p>{double4()}</p>
      <p>{double4()}</p>
      <br />

      <h2 class={css(heading1)}>Counter: {counter1()}</h2>
      <button
        onClick={() => setCounter1(counter1() + 1)}
        class={css(buttonStyle)}>
        Increment
      </button>
    </div>
  )
}

export default App
