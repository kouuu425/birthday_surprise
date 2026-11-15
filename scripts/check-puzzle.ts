// パズルの整合性チェック: `npm run check`
// - 盤面上で縦横に2文字以上つながる並びが、すべて定義済みの単語か
// - すべての単語がつながっているか
// - 答えマスを順に読むと FINAL_ANSWER になるか（濁点のつけ外しは自由）
import { buildCrossword, cellKey } from '../src/lib/crossword.ts'
import { normalizeKana, toSeion } from '../src/lib/kana.ts'
import { COLS, FINAL_ANSWER, MARKS, ROWS, WORDS } from '../src/lib/puzzle.ts'

const errors: string[] = []
const { cells, entries } = buildCrossword()
const at = (r: number, c: number) => cells.get(cellKey(r, c))?.letter

for (const k of cells.keys()) {
  const [r, c] = k.split(',').map(Number)
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) errors.push(`盤面の外: ${k}`)
}

const defined = new Set(WORDS.map((w) => `${w.dir}:${w.row},${w.col}:${w.answer}`))
for (const dir of ['across', 'down'] as const) {
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const [pr, pc] = dir === 'across' ? [r, c - 1] : [r - 1, c]
      if (!at(r, c) || at(pr, pc)) continue
      let s = ''
      for (let i = 0; ; i++) {
        const ch = dir === 'across' ? at(r, c + i) : at(r + i, c)
        if (!ch) break
        s += ch
      }
      if (s.length >= 2 && !defined.has(`${dir}:${r},${c}:${s}`)) {
        errors.push(`未定義の並び (${dir} ${r},${c}): ${s}`)
      }
    }
  }
}

// 連結チェック
const seen = new Set<string>([entries[0].id])
const queue = [entries[0]]
while (queue.length) {
  const e = queue.shift()!
  for (const k of e.cells) {
    for (const id of cells.get(k)!.entries) {
      if (!seen.has(id)) { seen.add(id); queue.push(entries.find((x) => x.id === id)!) }
    }
  }
}
if (seen.size !== entries.length) errors.push('つながっていない単語があります')

const read = MARKS.map(([r, c]) => at(r, c)).join('')
// 濁点はつけ外し自由のルールなので、濁点を外した形で比べる
if (toSeion(read) !== toSeion(normalizeKana(FINAL_ANSWER))) errors.push(`答えマスの読み: ${read} ≠ ${normalizeKana(FINAL_ANSWER)}`)

if (errors.length) {
  console.error('NG\n' + errors.map((e) => ' - ' + e).join('\n'))
  process.exit(1)
}
console.log(`OK: ${entries.length}語 / ${cells.size}マス / 答え「${read}」`)
for (const e of entries) console.log(`  ${e.number} ${e.dir === 'across' ? 'ヨコ' : 'タテ'} ${e.answer}`)
