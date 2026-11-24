// 暗号ページの整合性チェック: `npm run check`
// - 正解の選択肢の番号が範囲内か
// - 答えの読みがカタカナだけか（入力のゆれ吸収と同じ表記になっているか）
// - MESSAGE の文字が、すべてどこかの答えに出てくるか（＝解読できるか）
import { normalizeKana } from '../src/lib/kana.ts'
import { BLUE_FAMILY, CIPHER, DESTINATION, LETTER_OF, MESSAGE, NEAR_MISS, NUMBER_OF, QUESTIONS } from '../src/ruriiro/cipher.ts'

const errors: string[] = []

QUESTIONS.forEach((q, i) => {
  if (!q.choices[q.answer]) errors.push(`Q${i + 1}: answer ${q.answer} の選択肢がありません`)
  if (normalizeKana(q.reading) !== q.reading) errors.push(`Q${i + 1}: 読み ${q.reading} は ${normalizeKana(q.reading)} と書く`)
})
for (const [name, w] of Object.entries({ MESSAGE, DESTINATION }))
  if (normalizeKana(w) !== w) errors.push(`${name} は ${normalizeKana(w)} と書く`)
for (const w of [...BLUE_FAMILY, ...NEAR_MISS])
  if (normalizeKana(w) !== w) errors.push(`${w} は ${normalizeKana(w)} と書く（入力と比べられないため）`)
for (const ch of MESSAGE) if (!NUMBER_OF.has(ch)) errors.push(`「${ch}」がどの答えにも出てこないので解読できません`)

if (errors.length) {
  console.error('NG\n' + errors.map((e) => ' - ' + e).join('\n'))
  process.exit(1)
}
console.log(`OK: 暗号「${CIPHER.join(' ')}」→「${CIPHER.map((n) => LETTER_OF.get(n)).join('')}」→ 答え「${DESTINATION}」`)
QUESTIONS.forEach((q, i) => console.log(`  Q${i + 1} ${q.reading} = ${[...q.reading].map((ch) => NUMBER_OF.get(ch)).join(' ')}`))
