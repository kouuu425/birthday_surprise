import { useRef, useState, type FormEvent } from 'react'
import { DIR_LABEL, type Cell, type Entry } from '../lib/crossword.ts'
import { normalizeKana } from '../lib/kana.ts'

interface Props {
  entry: Entry | null
  cells: Map<string, Cell>
  solved: Set<string>
  onCorrect: (entry: Entry) => void
}

type Feedback = { kind: 'ok' | 'ng'; text: string } | null

export function AnswerPanel({ entry, cells, solved, onCorrect }: Props) {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<Feedback>(null)
  const [shaking, setShaking] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // カギが切り替わったら入力欄を空にする（effect を使わず、描画中に前回の値と比べる React 推奨の書き方）
  const [prevId, setPrevId] = useState(entry?.id)
  if (entry?.id !== prevId) {
    setPrevId(entry?.id)
    setValue('')
  }

  if (!entry) {
    return (
      <div className="panel">
        <p className="panel__empty">マスかカギをタップして、答えを入れてね</p>
      </div>
    )
  }

  const isSolved = solved.has(entry.id)
  // すでにわかっている文字（交差する単語から）をヒントとして表示
  const pattern = entry.cells.map((k) => {
    const c = cells.get(k)!
    return c.entries.some((id) => solved.has(id)) ? c.letter : ''
  })

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!entry) return
    const v = normalizeKana(value)
    if (!v) return
    if (v === entry.answer) {
      setFeedback({ kind: 'ok', text: '正解！' })
      onCorrect(entry)
    } else {
      setFeedback({
        kind: 'ng',
        text: v.length !== entry.answer.length ? `${entry.answer.length}文字の言葉だよ` : 'ちがうみたい…',
      })
      setShaking(true)
      inputRef.current?.select()
    }
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__tag">
          {entry.number} {DIR_LABEL[entry.dir]}
        </span>
        <span className="panel__clue">{entry.clue}</span>
      </div>
      <div className="panel__pattern" aria-hidden>
        {pattern.map((ch, i) => (
          <span key={i} className={isSolved ? 'is-solved' : ''}>{isSolved ? entry.answer[i] : ch}</span>
        ))}
      </div>
      {isSolved ? (
        <p className="panel__done">正解済み</p>
      ) : (
        <form
          className={`panel__form${shaking ? ' is-shaking' : ''}`}
          onSubmit={submit}
          onAnimationEnd={() => setShaking(false)}
        >
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => { setValue(e.target.value); setFeedback(null) }}
            placeholder="ひらがなでもOK"
            lang="ja"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="done"
            aria-label="答え"
          />
          <button type="submit">決定</button>
        </form>
      )}
      <p className={`panel__feedback panel__feedback--${feedback?.kind ?? 'none'}`} role="status">
        {feedback?.text ?? ' '}
      </p>
    </div>
  )
}
