import { useState, type FormEvent } from 'react'
import { normalizeFinal } from '../lib/kana.ts'
import { FINAL_ANSWER } from '../lib/puzzle.ts'

/** 全マスを埋めたあとに出る「最終問題」の入力欄 */
export function FinalPanel({ onCorrect }: { onCorrect: () => void }) {
  const [value, setValue] = useState('')
  const [misses, setMisses] = useState(0)
  const [message, setMessage] = useState('')
  const [shaking, setShaking] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    if (normalizeFinal(value) === normalizeFinal(FINAL_ANSWER)) {
      onCorrect()
      return
    }
    const n = misses + 1
    setMisses(n)
    setShaking(true)
    // 3回まちがえたら、少しだけヒントを出す
    setMessage(n >= 3 ? 'ヒント：この家の中の、ある場所だよ' : 'ちがうみたい…濁点もつけてみて')
  }

  return (
    <div className="panel">
      <div className="panel__head">
        <span className="panel__tag">最終問題</span>
        <span className="panel__clue">①〜⑩を順に読むと、何て書いてある？</span>
      </div>
      <form
        className={`panel__form panel__form--final${shaking ? ' is-shaking' : ''}`}
        onSubmit={submit}
        onAnimationEnd={() => setShaking(false)}
      >
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setMessage('') }}
          placeholder="答えを入力"
          lang="ja"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label="最終問題の答え"
        />
        <button type="submit">決定</button>
      </form>
      <p className="panel__feedback panel__feedback--ng" role="status">{message || ' '}</p>
    </div>
  )
}
