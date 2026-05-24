import { For, Show, type Component } from 'solid-js'
import '../App.css'
import {
  combinedSignalOptionsSnippet,
  signalOptionsInterfaceSnippet,
  tutorialSections,
} from '../data/signal-options'
import { useSignalOptionsTutorial } from '../hooks/use-signal-options-tutorial'

export const SignalOptionsTutorialPage: Component = () => {
  const tutorial = useSignalOptionsTutorial()

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
                      <strong>ทำงานอย่างไรในทางปฏิบัติ:</strong> {section.howToWork}
                    </p>
                    <p>
                      <strong>ใช้เมื่อไร:</strong> {section.whenToUse}
                    </p>
                    <p>
                      <strong>มีประโยชน์อะไร:</strong> {section.benefit}
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
              ที่เปลี่ยนแต่ version เดิม จะถูกเก็บเป็นค่าล่าสุดได้ แต่ subscriber จะยังไม่ rerun
              เพราะ Solid มองว่าการเปลี่ยนครั้งนั้น “เท่ากัน”
            </p>
          </div>

          <div class="demo-layout">
            <article class="demo-panel">
              <div class="metrics-grid">
                <article class="metric-card">
                  <p class="metric-label">reactive version</p>
                  <strong class="metric-value-lg">
                    {tutorial.equalsProfile().version}
                  </strong>
                </article>

                <article class="metric-card">
                  <p class="metric-label">reactive label</p>
                  <strong class="metric-value-md">
                    {tutorial.equalsProfile().label}
                  </strong>
                </article>

                <article class="metric-card">
                  <p class="metric-label">notify count since load</p>
                  <strong class="metric-value-lg">
                    {tutorial.equalsNotificationCount()}
                  </strong>
                </article>
              </div>

              <p class="demo-note" lang="th">
                ปุ่มแรกจะเขียนค่าใหม่ที่ <code>version</code> เดิม ปุ่มที่สองจะเพิ่ม{' '}
                <code>version</code> เพื่อให้ subscriber ถูกปลุกจริง
              </p>

              <div class="button-row">
                <button
                  onClick={tutorial.handleEqualsWriteSameVersion}
                  lang="th"
                  class="action-button action-button-primary">
                  เขียน label ใหม่ แต่ version เดิม
                </button>

                <button
                  onClick={tutorial.handleEqualsBumpVersion}
                  lang="th"
                  class="action-button action-button-info">
                  เพิ่ม version ให้ subscriber update
                </button>

                <button
                  onClick={tutorial.handleEqualsManualRead}
                  lang="th"
                  class="action-button action-button-secondary">
                  อ่านค่าแบบ manual
                </button>

                <button
                  onClick={tutorial.handleEqualsReset}
                  lang="th"
                  class="action-button action-button-secondary">
                  รีเซ็ต demo
                </button>
              </div>
            </article>

            <article class="demo-side-card">
              <p class="card-kicker">Observation</p>
              <p class="side-copy" lang="th">
                การ read แบบ manual หลัง flush จะเห็นค่าล่าสุดใน signal ได้ แม้ UI หรือ
                effect ที่ subscribe ไว้ก่อนหน้านี้ยังไม่ขยับ ถ้า comparator
                ตัดสินว่าการเปลี่ยนนั้น “เท่ากัน”
              </p>
              <p class="status-text">{tutorial.equalsManualRead()}</p>
            </article>
          </div>
        </section>

        <section class="tutorial-section">
          <div class="section-heading">
            <h2 class="section-title">Live Demo: unobserved</h2>
            <p class="section-description" lang="th">
              ค่า <code>trackedPreviewValue</code> จะถูกอ่านเฉพาะใน preview box
              นี้เท่านั้น เมื่อซ่อนกล่อง preview จนผู้อ่านคนสุดท้ายหายไป callback{' '}
              <code>unobserved</code> จึงมีโอกาสทำงาน
            </p>
          </div>

          <div class="demo-layout">
            <article class="demo-panel">
              <div class="subscriber-card">
                <div class="subscriber-header">
                  <p class="metric-label">preview subscriber</p>
                  <span class="status-pill">
                    {tutorial.subscriptionPreviewVisible() ? 'active' : 'inactive'}
                  </span>
                </div>

                <Show
                  when={tutorial.subscriptionPreviewVisible()}
                  fallback={
                    <p class="preview-fallback" lang="th">
                      preview ถูกซ่อนอยู่ ตอนนี้ signal ตัวนี้ไม่ควรถูกอ่านจาก JSX ส่วนนี้แล้ว
                    </p>
                  }>
                  <strong class="preview-value">
                    {tutorial.trackedPreviewValue()}
                  </strong>
                </Show>
              </div>

              <div class="button-row">
                <button
                  onClick={tutorial.handleTrackedPreviewIncrement}
                  lang="th"
                  class="action-button action-button-primary">
                  เพิ่ม preview value
                </button>

                <button
                  onClick={tutorial.handleToggleSubscriptionPreview}
                  lang="th"
                  class="action-button action-button-info">
                  ซ่อน/แสดง preview subscriber
                </button>

                <button
                  onClick={tutorial.handleSubscriptionReset}
                  lang="th"
                  class="action-button action-button-secondary">
                  รีเซ็ต demo
                </button>
              </div>
            </article>

            <article class="demo-side-card">
              <p class="card-kicker">Event Log</p>
              <div class="event-log">
                <For each={tutorial.subscriptionEvents()}>
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
              ตัวอย่างนี้ใช้ writable derived signal เพื่อคำนวณ{' '}
              <code>derivedCount</code> และเขียน internal note ลงใน{' '}
              <code>ownedWriteMeta</code> จากภายใน compute ซึ่งตามปกติ Solid 2.0
              จะกัน pattern นี้ไว้ใน dev mode แต่ตัว signal ปลายทางได้ opt-in{' '}
              <code>ownedWrite: true</code> ไว้แบบเจาะจง
            </p>
          </div>

          <div class="demo-layout">
            <article class="demo-panel">
              <div class="metrics-grid">
                <article class="metric-card">
                  <p class="metric-label">source count</p>
                  <strong class="metric-value-lg">
                    {tutorial.ownedWriteSourceCount()}
                  </strong>
                </article>

                <article class="metric-card">
                  <p class="metric-label">derived count</p>
                  <strong class="metric-value-lg">
                    {tutorial.ownedWriteDerivedCount()}
                  </strong>
                </article>
              </div>

              <div class="owned-write-note">
                <p class="metric-label">internal note</p>
                <p class="status-text">{tutorial.ownedWriteMeta()}</p>
              </div>

              <div class="button-row">
                <button
                  onClick={tutorial.handleOwnedWriteAdvance}
                  lang="th"
                  class="action-button action-button-primary">
                  เพิ่ม source count
                </button>

                <button
                  onClick={tutorial.handleOwnedWriteReset}
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
                  ข้าม signals; ถ้าเป็น side effect ทั่วไป ให้ย้าย write ไป event
                  handler หรือ <code>onSettled</code> จะปลอดภัยกว่า
                </p>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  )
}
