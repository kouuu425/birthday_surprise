// 暗号ページの整合性チェック: `npm run check`
// - 正解の選択肢の番号・拾う文字の位置が範囲内か
// - 記号の重複がないか、暗号文の記号がすべて問題で解読できるか
// - 解読すると DESTINATION になるか
import { CIPHER, DESTINATION, QUESTIONS, decodeTable } from '../src/ruriiro/cipher.ts'

const errors: string[] = []

QUESTIONS.forEach((q, i) => {
  if (!q.choices[q.answer]) errors.push(`Q${i + 1}: answer ${q.answer} の選択肢がありません`)
  if (q.pick < 1 || q.pick > q.reading.length) errors.push(`Q${i + 1}: ${q.reading} に ${q.pick} 文字目はありません`)
})

const symbols = QUESTIONS.map((q) => q.symbol)
if (new Set(symbols).size !== symbols.length) errors.push('同じ記号を使っている問題があります')

const table = decodeTable()
for (const s of CIPHER) if (!table.has(s)) errors.push(`記号 ${s} を解読できる問題がありません`)

const read = CIPHER.map((s) => table.get(s) ?? '?').join('')
if (read !== DESTINATION) errors.push(`解読結果: ${read} ≠ ${DESTINATION}`)

if (errors.length) {
  console.error('NG\n' + errors.map((e) => ' - ' + e).join('\n'))
  process.exit(1)
}
console.log(`OK: 暗号「${CIPHER.join('')}」→「${read}」`)
QUESTIONS.forEach((q, i) => console.log(`  Q${i + 1} ${q.symbol} = ${q.reading} の${q.pick}文字目`))
