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
    summary: 'ควบคุมว่า subscriber ควรถูก notify เมื่อไร ด้วย comparator ของคุณเอง',
    whenToUse:
      'ใช้เมื่อค่าด้านในเปลี่ยนบ่อย แต่ UI ควร re-render เฉพาะตอน key สำคัญเปลี่ยน เช่น version, id หรือ revision',
    benefit:
      'ลดการ reactive update ที่ไม่จำเป็น และแยก “ค่าเปลี่ยน” ออกจาก “ควร notify subscriber หรือยัง”',
    caution:
      'ถ้า comparator คืนค่า true ค่าใหม่ยังถูกเก็บได้ แต่ subscriber จะไม่ถูกปลุก จึงต้องออกแบบ comparator ให้ตรงกับ semantic จริง',
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
    summary: 'รัน callback ตอน signal ไม่มี subscriber เหลืออยู่แล้ว',
    whenToUse:
      'ใช้กับงาน cleanup เล็ก ๆ เช่นล้าง preview cache, ปิด polling, หรือลบ ephemeral entry ที่มีประโยชน์เฉพาะตอนมีคนอ่านอยู่',
    benefit:
      'ทำให้ state ที่มีอายุสั้นทำความสะอาดตัวเองได้โดยผูกกับการมี subscriber จริง',
    caution:
      'callback นี้จะไม่ทำงานถ้ายังมี JSX, effect หรือ memo ไหนสักแห่ง subscribe signal ตัวนั้นอยู่',
    code: `const [previewValue, setPreviewValue] = createSignal(1, {
  name: "trackedPreviewValue",
  unobserved: () => appendLog("no subscribers left"),
})`,
  },
  {
    id: 'ownedWrite',
    option: 'ownedWrite',
    summary: 'อนุญาตให้ signal นั้นถูกเขียนจาก owned scope ได้แบบเจาะจง',
    whenToUse:
      'ใช้เฉพาะ internal state ที่ตั้งใจให้ถูกเขียนจาก memo/effect compute หรือ reactive primitive ภายในจริง ๆ',
    benefit:
      'ช่วยทำ internal bookkeeping หรือ debug mirror ได้ โดยไม่ต้องเปิดทางให้ shared state ทั้งก้อนเขียนแบบเสี่ยง ๆ',
    caution:
      'ไม่ควรใช้กับ business state ทั่วไป เพราะมันเป็นการ opt-in ข้าม guard ของ Solid 2.0 ที่ตั้งใจป้องกัน side effect ใน owned scope',
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
              ที่เปลี่ยนแต่ version เดิม จะถูกเก็บค่าใหม่ไว้ แต่ subscriber จะไม่ถูก notify
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
                การ read แบบ manual จะแสดงค่าล่าสุดใน signal แม้ reactive label ด้านซ้ายยังไม่ขยับ
                ถ้า comparator มองว่าการเปลี่ยนนั้น “เท่ากัน”
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
              เมื่อซ่อนกล่อง preview จนไม่มี subscriber เหลือ callback <code>unobserved</code>{' '}
              จะมีโอกาสทำงาน
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
              และเขียน log สั้น ๆ ลงใน <code>ownedWriteMeta</code> จากภายใน compute
              โดยเปิด <code>ownedWrite: true</code> ให้กับ signal ปลายทางแบบเจาะจง
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
                  ถ้าเป็น shared state หรือ user-facing state ทั่วไป ให้ย้าย write
                  ไปอยู่ใน event handler หรือ <code>onSettled</code> จะปลอดภัยกว่า
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
