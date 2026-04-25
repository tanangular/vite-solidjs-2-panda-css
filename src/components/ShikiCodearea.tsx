import { transformerRenderWhitespace } from '@shikijs/transformers'
import {
  type BundledLanguage,
  type BundledTheme,
  type Highlighter,
  getSingletonHighlighter,
} from 'shiki'
import { type Component, type JSX, createEffect, createSignal } from 'solid-js'

interface ShikiCodeareaProps {
  initialCode?: string
  lang?: BundledLanguage
  theme?: BundledTheme
  style?: JSX.CSSProperties
  id?: string
}

const ShikiCodearea: Component<ShikiCodeareaProps> = (props) => {
  const [code, setCode] = createSignal(props.initialCode ?? '')
  const [highlighted, setHighlighted] = createSignal('')
  const [highlighter, setHighlighter] = createSignal<Highlighter | null>(null)

  let textareaRef: HTMLTextAreaElement | undefined
  let highlightLayerRef: HTMLDivElement | undefined

  getSingletonHighlighter({
    langs: [props.lang ?? 'typescript'],
    themes: [props.theme ?? 'github-dark'],
  }).then(setHighlighter)

  createEffect(
    // 1. Compute Phase: tracks highlighter and code, returns HTML (or empty string)
    () => {
      const h = highlighter()
      const c = code()
      if (!h) {
        return ''
      }

      return h.codeToHtml(c, {
        lang: props.lang ?? 'typescript',
        theme: props.theme ?? 'github-dark',
        transformers: [
          transformerRenderWhitespace(), // ช่วยแสดงจุดหรือสัญลักษณ์ในช่องว่าง (ถ้าต้องการ)
        ],
      })
    },
    // 2. Apply Phase: only runs when the computed HTML actually changes
    (html) => {
      setHighlighted(html)
    },
  )
  const handleScroll = () => {
    if (textareaRef && highlightLayerRef) {
      highlightLayerRef.scrollTop = textareaRef.scrollTop
      highlightLayerRef.scrollLeft = textareaRef.scrollLeft
    }
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        'min-height': '90px',
        margin: '1rem 0',
        ...props.style,
      }}>
      <div ref={highlightLayerRef} innerHTML={highlighted()} />
      <textarea
        id={props.id}
        ref={textareaRef}
        value={code()}
        onInput={(e) => setCode(e.currentTarget.value)}
        onScroll={handleScroll}
        spellcheck={false}
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
      />
    </div>
  )
}

export default ShikiCodearea
