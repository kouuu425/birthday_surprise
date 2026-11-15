import { COLS, MARKS, ROWS, WORDS, type Dir, type WordDef } from './puzzle.ts'

export interface Entry extends WordDef {
  id: string
  number: number
  cells: string[] // "row,col" のリスト
}

export interface Cell {
  key: string
  row: number
  col: number
  letter: string
  number?: number
  mark?: number // 1始まりの「答えの何文字目か」
  entries: string[] // このマスを通る Entry の id
}

export const cellKey = (row: number, col: number) => `${row},${col}`

function cellsOf(w: WordDef): string[] {
  return [...w.answer].map((_, i) =>
    w.dir === 'across' ? cellKey(w.row, w.col + i) : cellKey(w.row + i, w.col),
  )
}

/** 単語の定義から、マス目・カギ番号・答えマスを組み立てる */
export function buildCrossword() {
  // 1. マスを作る
  const cells = new Map<string, Cell>()
  for (const w of WORDS) {
    cellsOf(w).forEach((key, i) => {
      const [row, col] = key.split(',').map(Number)
      const existing = cells.get(key)
      if (existing && existing.letter !== w.answer[i]) {
        throw new Error(`文字の衝突: ${key} に ${existing.letter} と ${w.answer[i]}`)
      }
      cells.set(key, existing ?? { key, row, col, letter: w.answer[i], entries: [] })
    })
  }

  // 2. 左上から順にカギ番号を振る（一般的なクロスワードの番号の付け方）
  const starts = new Map<string, number>()
  let n = 0
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (WORDS.some((w) => w.row === r && w.col === c)) starts.set(cellKey(r, c), ++n)
    }
  }

  const entries: Entry[] = WORDS.map((w) => {
    const number = starts.get(cellKey(w.row, w.col))!
    return { ...w, number, id: `${w.dir}-${number}`, cells: cellsOf(w) }
  }).sort((a, b) => a.number - b.number)

  for (const e of entries) for (const k of e.cells) cells.get(k)!.entries.push(e.id)
  for (const [k, num] of starts) cells.get(k)!.number = num
  MARKS.forEach(([r, c], i) => {
    const cell = cells.get(cellKey(r, c))
    if (!cell) throw new Error(`答えマス ${r},${c} が盤面にありません`)
    cell.mark = i + 1
  })

  return { cells, entries }
}

export const DIR_LABEL: Record<Dir, string> = { across: 'ヨコ', down: 'タテ' }
