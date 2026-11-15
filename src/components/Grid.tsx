import { COLS, ROWS } from '../lib/puzzle.ts'
import { cellKey, type Cell, type Entry } from '../lib/crossword.ts'

interface Props {
  cells: Map<string, Cell>
  solved: Set<string>
  selected: Entry | null
  onTap: (cell: Cell) => void
}

const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫'

export function Grid({ cells, solved, selected, onTap }: Props) {
  const active = new Set(selected?.cells)
  const items = []
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = cells.get(cellKey(r, c))
      if (!cell) {
        items.push(<div key={`${r}-${c}`} className="cell cell--void" aria-hidden />)
        continue
      }
      const filled = cell.entries.some((id) => solved.has(id))
      const cls = ['cell', active.has(cell.key) && 'is-active', filled && 'is-filled', cell.mark && 'is-mark']
        .filter(Boolean)
        .join(' ')
      items.push(
        <button key={cell.key} type="button" className={cls} onClick={() => onTap(cell)}
          aria-label={`${r + 1}行${c + 1}列${filled ? ` ${cell.letter}` : ''}`}>
          {cell.number && <span className="cell__num">{cell.number}</span>}
          {cell.mark && <span className="cell__mark">{CIRCLED[cell.mark - 1]}</span>}
          <span className="cell__letter">{filled ? cell.letter : ''}</span>
        </button>,
      )
    }
  }
  return (
    <div className="grid-wrap">
      <div className="grid" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>{items}</div>
    </div>
  )
}
