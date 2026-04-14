import type { Component } from 'solid-js'
import { css, type Styles } from '#panda/css'

const style1: Styles = {
  bgColor: 'amber.300',
}

const App: Component = () => {
  return <div class={css(style1)}>lorem ssss</div>
}

export default App
