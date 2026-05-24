import type { TutorialSection } from '../types/app'

export const signalOptionsInterfaceSnippet = `export interface SignalOptions<T> {
  name?: string;
  equals?: false | ((prev: T, next: T) => boolean);
  ownedWrite?: boolean;
  unobserved?: () => void;
}`

export const combinedSignalOptionsSnippet = `const [resource, setResource] = createSignal(initialValue, {
  name: "resourceSignal",
  equals: (prev, next) => prev.version === next.version,
  ownedWrite: true,
  unobserved: () => releasePreviewCache(),
})`

export const tutorialSections: TutorialSection[] = [
  {
    id: 'equals',
    option: 'equals',
    summary:
      'เป็นพร็อพเพอร์ตี้ในออบเจ็กต์ options ของ createSignal ที่ใช้กำหนดตรรกะในการเปรียบเทียบค่าระหว่างค่าเก่าและค่าใหม่',
    howToWork:
      'รับค่าเป็น false หรือฟังก์ชัน (prev, next) => boolean หากฟังก์ชันคืนค่าเป็น true ระบบจะถือว่าค่าไม่เปลี่ยนแปลงและจะข้าม (Skip) การทำงานของ observers ทั้งหมด',
    whenToUse:
      'ใช้เมื่อต้องการทำ Deep Equality Check สำหรับออบเจ็กต์หรืออาร์เรย์ หรือใช้ equals: false เมื่อต้องการบังคับให้เกิดการอัปเดตเสมอแม้ค่าจะเหมือนเดิม',
    benefit:
      'ช่วยเพิ่มประสิทธิภาพผ่านกลไก Execution Skipping โดยการสกัดกั้นงานราคาแพงในเฟส Apply ไม่ให้รันโดยไม่จำเป็น',
    caution:
      'ค่าเริ่มต้นของ Solid คือ Strict Equality (===) หากคุณแก้ไขข้อมูลภายในออบเจ็กต์โดยไม่เปลี่ยน reference ตัว signal จะมองว่าค่าเท่าเดิมและไม่อัปเดต UI ซึ่งเป็นจุดที่นักพัฒนามักเข้าใจผิด',
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
    summary:
      'unobserved (หรือในทางเทคนิคคือตัวเลือก internal: true ใน SignalOptions) คือตัวเลือกที่ใช้ระบุว่า Signal ตัวนั้นเป็น "สถานะภายในของระบบ" ซึ่งไม่ควรถูกนำไปรวมไว้ในแผนผังความรีแอคทีฟ (Reactive Graph) สำหรับการตรวจสอบหรือการทำ Debugging',
    howToWork:
      'ในเชิงการทำงานของโค้ด เมื่อเรากำหนด internal: true ใน createSignal: การลงทะเบียน: ระบบจะ ข้าม (Skip) กระบวนการเรียกฟังก์ชัน registerGraph ซึ่งปกติจะทำหน้าที่จดบันทึก Signal เข้าไปในระบบส่วนกลาง การข้าม Hook: ตัว Signal จะไม่ถูกส่งต่อไปยัง DevHooks.afterCreateSignal ทำให้เครื่องมืออย่าง Browser DevTools ไม่ได้รับแจ้งว่ามี Signal นี้เกิดขึ้น สถานะภายใน: ในออบเจ็กต์ SignalState จะมีการทำเครื่องหมาย internal = true ไว้เพื่อแจ้งให้ส่วนประกอบอื่นๆ ทราบว่าเป็นส่วนประกอบภายใน',
    whenToUse:
      'ภายในไลบรารี: เมื่อคุณกำลังสร้างไลบรารีเสริม (Third-party library) และมี Signal จำนวนมากที่ใช้จัดการ Logic ภายใน ซึ่งนักพัฒนาที่ใช้ไลบรารีของคุณไม่จำเป็นต้องเห็นสถานะเหล่านั้น ลดความซับซ้อนของ Graph: ใช้เมื่อมี Signal ที่อัปเดตบ่อยมาก (High-frequency updates) และการแสดงผลใน DevTools อาจทำให้ประสิทธิภาพของเครื่องมือ Debugging ลดลงหรือทำให้แผนผังดูรกจนเกินไป',
    benefit:
      'Clean Reactive Graph: ประโยชน์สูงสุดคือทำให้แผนผังความสัมพันธ์ของข้อมูลในแอปพลิเคชันสะอาดขึ้น ช่วยให้นักพัฒนาโฟกัสเฉพาะ Application State ที่สำคัญได้ง่ายขึ้นโดยไม่มีสถานะย่อยๆ มาบดบัง ประสิทธิภาพการพัฒนา (DX Performance): ลด Overhead ในโหมด Development เพราะระบบไม่ต้องคอยอัปเดตสถานะของ Signal เหล่านี้ไปยังเครื่องมือ Debugging ตลอดเวลา',
    caution:
      'ความเข้าใจผิดเรื่องความรีแอคทีฟ: นักพัฒนามักเข้าใจผิดว่าการตั้งค่านี้จะทำให้ Signal "ไม่รีแอคทีฟ" หรือ "ไม่อัปเดต UI" ความจริงคือ: มันยังคงทำงานเป็น Signal ปกติทุกประการ มีการติดตาม Dependency และแจ้งเตือนผู้ติดตาม (Observers) ตามปกติ เพียงแค่ "ซ่อนตัว" จากเครื่องมือตรวจสอบเท่านั้น ความเข้าใจผิดระหว่าง unobserved และ untrack: บางคนสับสนคิดว่าเป็นพฤติกรรมเดียวกับฟังก์ชัน untrack() แต่ความจริง internal เป็นการตั้งค่าที่ตัวแปร (Definition) ส่วน untrack เป็นการข้ามการติดตามที่จุดอ่านค่า (Execution) ข้อควรระวังในการ Debug: หากคุณตั้งค่านี้กับ Signal ที่เป็น Logic หลักของแอป จะทำให้การไล่หาบั๊ก (Troubleshooting) ทำได้ยากมาก เพราะคุณจะไม่สามารถตรวจสอบการไหลของข้อมูลผ่าน DevTools ได้เลยแม้จะเห็นว่า UI อัปเดตอยู่ก็ตาม',
    code: `// สร้าง Signal ที่เป็นความลับภายในระบบ
const [internalState, setInternalState] = createSignal(0, { 
  internal: true, // หรือเรียกในเชิง semantics ว่า unobserved
  name: "secret-counter" 
})`,
  },
  {
    id: 'ownedWrite',
    option: 'ownedWrite',
    summary:
      'opt-in แบบเจาะจงเพื่อยอมให้ setter ของ signal นี้ถูกเรียกจาก owned scope ได้',
    howToWork:
      'โดยปกติ Solid 2.0 จะกันการเขียน signal จาก memo, effect compute หรือ component body ใน dev mode แต่ถ้า signal ปลายทาง opt-in ด้วย ownedWrite: true ก็จะยอมให้เขียนได้เฉพาะตัวนั้น',
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
