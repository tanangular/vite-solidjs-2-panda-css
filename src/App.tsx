import {
  type Component,
  createEffect,
  createSignal,
  For,
  Show,
  type SignalOptions,
} from 'solid-js'
import './App.css'
import type { EqualsProfile, TutorialSection } from './types/app'

const signalOptionsInterfaceSnippet = `export interface SignalOptions<T> {
  name?: string;
  equals?: false | ((prev: T, next: T) => boolean);
  ownedWrite?: boolean;
  unobserved?: () => void;
}`

const combinedSignalOptionsSnippet = `const [resource, setResource] = createSignal(initialValue, {
  name: "resourceSignal",
  equals: (prev, next) => prev.version === next.version,
  ownedWrite: true,
  unobserved: () => releasePreviewCache(),
})`

const tutorialSections: TutorialSection[] = [
  {
    id: 'equals',
    option: 'equals',
    summary: 'นิยามเองได้ว่าเมื่อไรค่าที่เขียนเข้า signal ควรถือว่า “เปลี่ยนจริง” สำหรับ subscriber',
    whenToUse:
      'ใช้เมื่อ signal เก็บ object ที่มีหลาย field แต่ downstream ควร react เฉพาะ field สำคัญ เช่น id, version หรือ revision',
    benefit:
      'ลด reactive work ที่ไม่จำเป็น และทำให้คุณแยกได้ชัดว่า “ข้อมูลใหม่ถูกเก็บแล้ว” กับ “subscriber ควรถูกรันใหม่ไหม” ไม่จำเป็นต้องเป็นเรื่องเดียวกัน',
    caution:
      'ถ้า comparator คืนค่า true manual read หลัง flush อาจเห็นค่าใหม่แล้ว แต่ effect หรือ JSX ที่ subscribe ไว้จะยังไม่ rerun จึงต้องออกแบบ comparator ให้ตรง semantic จริงของแอป',
    code: `const [profile, setProfile] = createSignal(
  { version: 1, label: "Initial label" },
  {
    name: "equalsProfile",
    equals: (prev, next) => prev.version === next.version,
  }
)`,
  },
  {
    id: 'unobserved',
    option: 'unobserved',
    summary: 'callback สำหรับจังหวะที่ signal ตัวนั้นไม่มี subscriber เหลืออยู่จริง ๆ',
    whenToUse:
      'ใช้กับ preview, cache, polling หรือ state ชั่วคราวที่ควรอยู่ต่อเฉพาะตอนยังมี JSX, memo หรือ effect ไหนสักแห่งอ่านมันอยู่',
    benefit:
      'ทำให้ cleanup ผูกกับการใช้งานจริงของ reactive graph แทนการเดาเองจาก lifecycle ของ component เดียว',
    caution:
      'มันอิงจำนวน subscriber ทั้งระบบ ไม่ได้อิงว่า component ตัวนี้ unmount หรือซ่อนอยู่ตัวเดียว ถ้ายังมี reader ที่อื่นค้างอยู่ callback จะไม่ยิง',
    code: `const [previewValue, setPreviewValue] = createSignal(1, {
  name: "trackedPreviewValue",
  unobserved: () => appendLog("no subscribers left"),
})`,
  },
  {
    id: 'ownedWrite',
    option: 'ownedWrite',
    summary: 'opt-in แบบเจาะจงเพื่อยอมให้ setter ของ signal นี้ถูกเรียกจาก owned scope ได้',
    whenToUse:
      'ใช้เฉพาะ internal bookkeeping ที่แคบมาก เช่น debug note, hydration flag หรือ cache marker ที่ต้องถูกเขียนจาก memo/effect compute จริง ๆ',
    benefit:
      'ช่วยเก็บสถานะช่วยคำนวณภายในได้โดยไม่ต้องยกเลิก safety guard ของ Solid 2.0 ทั้งระบบ',
    caution:
      'มันเป็น escape hatch ไม่ใช่รูปแบบหลัก ถ้ากำลัง mirror shared state หรือ business state ระหว่าง signals ให้ derive ด้วย memo หรือย้าย write ไป event handler/onSettled แทน',
    code: `const [internalNote, setInternalNote] = createSignal("idle", {
  name: "ownedWriteNote",
  ownedWrite: true,
})

const [derivedCount] = createSignal(() => {
  const nextValue = sourceCount() * 2
  setInternalNote(\`derived from \${sourceCount()}\`)
  return nextValue
})`,
  },
]

const equalsProfileSignalOptions: SignalOptions<EqualsProfile> = {
  name: 'equalsProfile',
  equals: (prev, next) => prev.version === next.version,
}

const equalsNotificationCountSignalOptions: SignalOptions<number> = {
  name: 'equalsNotificationCount',
}

const equalsManualReadSignalOptions: SignalOptions<string> = {
  name: 'equalsManualRead',
}

const subscriptionEventsSignalOptions: SignalOptions<string[]> = {
  name: 'subscriptionEvents',
  ownedWrite: true,
}

const ownedWriteMetaSignalOptions: SignalOptions<string> = {
  name: 'ownedWriteMeta',
  ownedWrite: true,
}

const App: Component = () => {
  const [equalsProfile, setEqualsProfile] = createSignal<EqualsProfile>(
    {
      version: 1,
      label: 'Initial label',
    },
    equalsProfileSignalOptions
  )
  const [equalsNotificationCount, setEqualsNotificationCount] = createSignal(
    0,
    equalsNotificationCountSignalOptions
  )
  const [equalsManualRead, setEqualsManualRead] = createSignal(
    'ยังไม่ได้อ่านแบบ manual',
    equalsManualReadSignalOptions
  )

  createEffect(
    () => equalsProfile(),
    () => {
      setEqualsNotificationCount((prev) => prev + 1)
    },
    { defer: true }
  )

  const [subscriptionPreviewVisible, setSubscriptionPreviewVisible] =
    createSignal(true)
  const [subscriptionEvents, setSubscriptionEvents] = createSignal<string[]>(
    ['Preview subscriber is mounted.'],
    subscriptionEventsSignalOptions
  )

  const appendSubscriptionEvent = (message: string) => {
    setSubscriptionEvents((prev) => [...prev, message])
  }

  const handlePreviewSignalUnobserved = () => {
    appendSubscriptionEvent(
      'unobserved fired: trackedPreviewValue has no subscribers left.'
    )
  }

  const trackedPreviewSignalOptions: SignalOptions<number> = {
    name: 'trackedPreviewValue',
    unobserved: handlePreviewSignalUnobserved,
  }

  const [trackedPreviewValue, setTrackedPreviewValue] = createSignal(
    1,
    trackedPreviewSignalOptions
  )

  const [ownedWriteSourceCount, setOwnedWriteSourceCount] = createSignal(1, {
    name: 'ownedWriteSourceCount',
  })
  const [ownedWriteMeta, setOwnedWriteMeta] = createSignal(
    'derived has not been read yet',
    ownedWriteMetaSignalOptions
  )
  const [ownedWriteDerivedCount] = createSignal<number>((prev) => {
    const nextValue = ownedWriteSourceCount() * 2
    const previousValueText = prev === undefined ? 'none' : String(prev)

    setOwnedWriteMeta(
      `source=${ownedWriteSourceCount()}, next=${nextValue}, prev=${previousValueText}`
    )

    return nextValue
  }, {
    name: 'ownedWriteDerivedCount',
  })

  const handleEqualsWriteSameVersion = () => {
    setEqualsProfile((prev) => ({
      version: prev.version,
      label: `Hidden update at version ${prev.version}`,
    }))
  }

  const handleEqualsBumpVersion = () => {
    setEqualsProfile((prev) => ({
      version: prev.version + 1,
      label: `Visible update at version ${prev.version + 1}`,
    }))
  }

  const handleEqualsManualRead = () => {
    setEqualsManualRead(
      `Manual read sees: "${equalsProfile().label}" (version ${equalsProfile().version})`
    )
  }

  const handleEqualsReset = () => {
    setEqualsProfile({
      version: 1,
      label: 'Initial label',
    })
    setEqualsManualRead('ยังไม่ได้อ่านแบบ manual')
  }

  const handleTrackedPreviewIncrement = () => {
    setTrackedPreviewValue((prev) => prev + 1)
    appendSubscriptionEvent('trackedPreviewValue updated from button click.')
  }

  const handleToggleSubscriptionPreview = () => {
    setSubscriptionPreviewVisible((prev) => !prev)
  }

  const handleSubscriptionReset = () => {
    setTrackedPreviewValue(1)
    setSubscriptionPreviewVisible(true)
    setSubscriptionEvents(['Preview subscriber is mounted.'])
  }

  const handleOwnedWriteAdvance = () => {
    setOwnedWriteSourceCount((prev) => prev + 1)
  }

  const handleOwnedWriteReset = () => {
    setOwnedWriteSourceCount(1)
    setOwnedWriteMeta('derived has not been read yet')
  }

  return (
    <main class="app-shell">
      <section class="app-panel">
        <div class="app-hero">
          <span class="app-badge">Solid 2.0 Tutorial</span>

          <h1 class="app-title">SignalOptions</h1>

          <p class="app-description" lang="th">
            หน้า tutorial นี้สรุปความหมายของ <code>SignalOptions&lt;T&gt;</code>{' '}
            และมี live demo ให้ลองพฤติกรรมของ <code>equals</code>,{' '}
            <code>unobserved</code> และ <code>ownedWrite</code> บนหน้าเดียวกัน
          </p>
        </div>

        <section class="tutorial-section">
          <div class="section-heading">
            <h2 class="section-title">Interface</h2>
            <p class="section-description" lang="th">
              ฟิลด์ <code>name</code> เหมาะกับ debug และ devtools ส่วนสามตัวด้านล่างคือ
              ตัวที่มีผลต่อ behavior โดยตรง
            </p>
          </div>

          <div class="two-column-grid">
            <article class="info-card">
              <p class="card-kicker">Type Definition</p>
              <pre class="code-block">
                <code>{signalOptionsInterfaceSnippet}</code>
              </pre>
            </article>

            <article class="info-card">
              <p class="card-kicker">Combined Example</p>
              <pre class="code-block">
                <code>{combinedSignalOptionsSnippet}</code>
              </pre>
            </article>
          </div>
        </section>

        <section class="tutorial-section">
          <div class="section-heading">
            <h2 class="section-title">Concept Cards</h2>
            <p class="section-description" lang="th">
              ใช้อ่านก่อน แล้วค่อยลอง demo ด้านล่าง จะเห็นชัดว่าทั้งสามฟิลด์แก้ปัญหาคนละแบบ
            </p>
          </div>

          <div class="concept-grid">
            <For each={tutorialSections}>
              {(section) => (
                <article class="concept-card">
                  <p class="card-kicker">{section.option}</p>
                  <p class="concept-summary" lang="th">
                    {section.summary}
                  </p>

                  <div class="concept-copy" lang="th">
                    <p>
                      <strong>ใช้เมื่อ:</strong> {section.whenToUse}
                    </p>
                    <p>
                      <strong>ประโยชน์:</strong> {section.benefit}
                    </p>
                    <p>
                      <strong>ข้อควรระวัง:</strong> {section.caution}
                    </p>
                  </div>

                  <pre class="code-block">
                    <code>{section.code}</code>
                  </pre>
                </article>
              )}
            </For>
          </div>
        </section>

        <section class="tutorial-section">
          <div class="section-heading">
            <h2 class="section-title">Live Demo: equals</h2>
            <p class="section-description" lang="th">
              comparator ตัวนี้ดูเฉพาะ <code>version</code> เท่านั้น ดังนั้น label
              ที่เปลี่ยนแต่ version เดิม จะถูกเก็บเป็นค่าล่าสุดได้ แต่ subscriber
              จะยังไม่ rerun เพราะ Solid มองว่าการเปลี่ยนครั้งนั้น “เท่ากัน”
            </p>
          </div>

          <div class="demo-layout">
            <article class="demo-panel">
              <div class="metrics-grid">
                <article class="metric-card">
                  <p class="metric-label">reactive version</p>
                  <strong class="metric-value-lg">{equalsProfile().version}</strong>
                </article>

                <article class="metric-card">
                  <p class="metric-label">reactive label</p>
                  <strong class="metric-value-md">{equalsProfile().label}</strong>
                </article>

                <article class="metric-card">
                  <p class="metric-label">notify count since load</p>
                  <strong class="metric-value-lg">{equalsNotificationCount()}</strong>
                </article>
              </div>

              <p class="demo-note" lang="th">
                ปุ่มแรกจะเขียนค่าใหม่ที่ <code>version</code> เดิม ปุ่มที่สองจะเพิ่ม{' '}
                <code>version</code> เพื่อให้ subscriber ถูกปลุกจริง
              </p>

              <div class="button-row">
                <button
                  onClick={handleEqualsWriteSameVersion}
                  lang="th"
                  class="action-button action-button-primary">
                  เขียน label ใหม่ แต่ version เดิม
                </button>

                <button
                  onClick={handleEqualsBumpVersion}
                  lang="th"
                  class="action-button action-button-info">
                  เพิ่ม version ให้ subscriber update
                </button>

                <button
                  onClick={handleEqualsManualRead}
                  lang="th"
                  class="action-button action-button-secondary">
                  อ่านค่าแบบ manual
                </button>

                <button
                  onClick={handleEqualsReset}
                  lang="th"
                  class="action-button action-button-secondary">
                  รีเซ็ต demo
                </button>
              </div>
            </article>

            <article class="demo-side-card">
              <p class="card-kicker">Observation</p>
              <p class="side-copy" lang="th">
                การ read แบบ manual หลัง flush จะเห็นค่าล่าสุดใน signal ได้ แม้ UI หรือ effect
                ที่ subscribe ไว้ก่อนหน้านี้ยังไม่ขยับ ถ้า comparator ตัดสินว่าการเปลี่ยนนั้น
                “เท่ากัน”
              </p>
              <p class="status-text">{equalsManualRead()}</p>
            </article>
          </div>
        </section>

        <section class="tutorial-section">
          <div class="section-heading">
            <h2 class="section-title">Live Demo: unobserved</h2>
            <p class="section-description" lang="th">
              ค่า <code>trackedPreviewValue</code> จะถูกอ่านเฉพาะใน preview box นี้เท่านั้น
              เมื่อซ่อนกล่อง preview จนผู้อ่านคนสุดท้ายหายไป callback{' '}
              <code>unobserved</code> จึงมีโอกาสทำงาน
            </p>
          </div>

          <div class="demo-layout">
            <article class="demo-panel">
              <div class="subscriber-card">
                <div class="subscriber-header">
                  <p class="metric-label">preview subscriber</p>
                  <span class="status-pill">
                    {subscriptionPreviewVisible() ? 'active' : 'inactive'}
                  </span>
                </div>

                <Show
                  when={subscriptionPreviewVisible()}
                  fallback={
                    <p class="preview-fallback" lang="th">
                      preview ถูกซ่อนอยู่ ตอนนี้ signal ตัวนี้ไม่ควรถูกอ่านจาก JSX ส่วนนี้แล้ว
                    </p>
                  }>
                  <strong class="preview-value">{trackedPreviewValue()}</strong>
                </Show>
              </div>

              <div class="button-row">
                <button
                  onClick={handleTrackedPreviewIncrement}
                  lang="th"
                  class="action-button action-button-primary">
                  เพิ่ม preview value
                </button>

                <button
                  onClick={handleToggleSubscriptionPreview}
                  lang="th"
                  class="action-button action-button-info">
                  ซ่อน/แสดง preview subscriber
                </button>

                <button
                  onClick={handleSubscriptionReset}
                  lang="th"
                  class="action-button action-button-secondary">
                  รีเซ็ต demo
                </button>
              </div>
            </article>

            <article class="demo-side-card">
              <p class="card-kicker">Event Log</p>
              <div class="event-log">
                <For each={subscriptionEvents()}>
                  {(event) => <p class="event-log-item">{event}</p>}
                </For>
              </div>
            </article>
          </div>
        </section>

        <section class="tutorial-section">
          <div class="section-heading">
            <h2 class="section-title">Live Demo: ownedWrite</h2>
            <p class="section-description" lang="th">
              ตัวอย่างนี้ใช้ writable derived signal เพื่อคำนวณ <code>derivedCount</code>{' '}
              และเขียน internal note ลงใน <code>ownedWriteMeta</code> จากภายใน compute
              ซึ่งตามปกติ Solid 2.0 จะกัน pattern นี้ไว้ใน dev mode แต่ตัว signal
              ปลายทางได้ opt-in <code>ownedWrite: true</code> ไว้แบบเจาะจง
            </p>
          </div>

          <div class="demo-layout">
            <article class="demo-panel">
              <div class="metrics-grid">
                <article class="metric-card">
                  <p class="metric-label">source count</p>
                  <strong class="metric-value-lg">{ownedWriteSourceCount()}</strong>
                </article>

                <article class="metric-card">
                  <p class="metric-label">derived count</p>
                  <strong class="metric-value-lg">{ownedWriteDerivedCount()}</strong>
                </article>
              </div>

              <div class="owned-write-note">
                <p class="metric-label">internal note</p>
                <p class="status-text">{ownedWriteMeta()}</p>
              </div>

              <div class="button-row">
                <button
                  onClick={handleOwnedWriteAdvance}
                  lang="th"
                  class="action-button action-button-primary">
                  เพิ่ม source count
                </button>

                <button
                  onClick={handleOwnedWriteReset}
                  lang="th"
                  class="action-button action-button-secondary">
                  รีเซ็ต demo
                </button>
              </div>
            </article>

            <article class="demo-side-card">
              <p class="card-kicker">Rule Of Thumb</p>
              <div class="side-copy" lang="th">
                <p>
                  ใช้ <code>ownedWrite</code> กับ internal state ที่แคบและรู้ขอบเขตเท่านั้น
                </p>
                <p>
                  ถ้าค่าหนึ่ง derive มาจากอีกค่าหนึ่งตามปกติ ให้ใช้ memo แทนการ write-back
                  ข้าม signals; ถ้าเป็น side effect ทั่วไป ให้ย้าย write ไป event handler
                  หรือ <code>onSettled</code> จะปลอดภัยกว่า
                </p>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
