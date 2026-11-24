import { useEffect, useRef, useState, type FormEvent } from 'react'
import { normalizeKana } from '../lib/kana.ts'
import { NAME } from '../lib/puzzle.ts'
import { CIPHER, DESTINATION, LETTER_OF, NUMBER_OF, QUESTIONS, type Question } from './cipher.ts'

const STORAGE_KEY = 'ruriiro-progress-v2' // 問題を変えたら番号を上げる
const FINAL_KEY = 'ruriiro-final-v2'

// localStorage はプライベートブラウズ等で使えないことがあるので try/catch で包む
function load(key: string): number {
  try {
    const n = Number(localStorage.getItem(key) ?? 0)
    return Number.isInteger(n) && n >= 0 ? n : 0
  } catch {
    return 0
  }
}
function save(key: string, n: number) {
  try {
    localStorage.setItem(key, String(n))
  } catch {
    /* 保存できなくても遊べる */
  }
}

export default function App() {
  // 何問目まで解けたか（問題は上から順に解く）
  const [solvedCount, setSolvedCount] = useState(() => Math.min(load(STORAGE_KEY), QUESTIONS.length))
  const [finalSolved, setFinalSolved] = useState(() => load(FINAL_KEY) === 1)
  const finalRef = useRef<HTMLElement>(null)
  const allSolved = solvedCount === QUESTIONS.length

  // 解読済みの番号
  const known = new Set(QUESTIONS.slice(0, solvedCount).flatMap((q) => [...q.reading].map((ch) => NUMBER_OF.get(ch)!)))

  useEffect(() => save(STORAGE_KEY, solvedCount), [solvedCount])
  useEffect(() => save(FINAL_KEY, finalSolved ? 1 : 0), [finalSolved])
  useEffect(() => {
    if (allSolved) finalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved, finalSolved])

  function reset() {
    if (!confirm('最初からやり直しますか？')) return
    setSolvedCount(0)
    setFinalSolved(false)
    window.scrollTo(0, 0)
  }

  return (
    <main className="r-page">
      <header className="r-hero">
        <p className="r-hero__eyebrow">December 5 — for {NAME}</p>
        <h1 className="r-hero__title">今夜の行き先</h1>
        <div className="r-hero__rule" aria-hidden />
        <p className="r-hero__lead">
          ディナーのお店の名前は、この暗号の中。
          <br />
          同じ数字は、いつも同じ文字。
          <br />
          問いに答えて、数字を解読してね。
        </p>
      </header>

      <section className={`cipher${finalSolved ? ' is-complete' : ''}`} aria-label="暗号">
        {CIPHER.map((n, i) => (
          <div key={i} className={`cipher__tile${finalSolved ? ' is-open' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>
            <span className="cipher__num">{n}</span>
            <span className="cipher__ch" aria-hidden={!finalSolved}>{finalSolved ? LETTER_OF.get(n) : ''}</span>
          </div>
        ))}
      </section>

      <section className="questions">
        {QUESTIONS.map((q, i) =>
          i < solvedCount ? (
            <SolvedCard key={i} index={i} q={q} />
          ) : i === solvedCount ? (
            <QuestionCard key={i} index={i} q={q} known={known} onCorrect={() => setSolvedCount(i + 1)} />
          ) : (
            <div key={i} className="q q--locked" aria-label={`問${i + 1}（まだ開いていません）`}>
              <span className="q__num">Q{i + 1}</span>
              <span className="q__locked-text">前の問いを解くと開きます</span>
            </div>
          ),
        )}
      </section>

      <KeyTable known={known} />

      {allSolved && !finalSolved && (
        <section ref={finalRef}>
          <FinalCard onCorrect={() => setFinalSolved(true)} />
        </section>
      )}

      {finalSolved && (
        <section ref={finalRef} className="r-finale">
          <p className="r-finale__eyebrow">Decoded</p>
          <p className="r-finale__word">
            {[...DESTINATION].map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.4 + i * 0.25}s` }}>{ch}</span>
            ))}
          </p>
          <div className="r-finale__rule" aria-hidden />
          <p className="r-finale__message">
            それでは、「{DESTINATION}」に
            <br />
            向かいましょう
          </p>
        </section>
      )}

      <footer className="r-footer">
        <button type="button" onClick={reset}>最初からやり直す</button>
      </footer>
    </main>
  )
}

/** 答えを番号の並びで見せる。わかっている番号は文字も出す */
function NumberRow({ reading, known, reveal }: { reading: string; known: Set<number>; reveal?: boolean }) {
  return (
    <div className="nums">
      {[...reading].map((ch, i) => {
        const n = NUMBER_OF.get(ch)!
        const show = reveal || known.has(n)
        return (
          <span key={i} className={`nums__box${show ? ' is-known' : ''}`}>
            <span className="nums__n">{n}</span>
            <span className="nums__ch">{show ? ch : ''}</span>
          </span>
        )
      })}
    </div>
  )
}

function QuestionCard({ index, q, known, onCorrect }: { index: number; q: Question; known: Set<number>; onCorrect: () => void }) {
  const [wrong, setWrong] = useState<Set<number>>(new Set())
  const [shaking, setShaking] = useState(false)

  function choose(i: number) {
    if (i === q.answer) {
      onCorrect()
      return
    }
    setWrong(new Set(wrong).add(i))
    setShaking(true)
  }

  return (
    <div className={`q q--active${shaking ? ' is-shaking' : ''}`} onAnimationEnd={() => setShaking(false)}>
      <div className="q__head">
        <span className="q__num">Q{index + 1}</span>
      </div>
      <p className="q__prompt">{q.prompt}</p>
      <NumberRow reading={q.reading} known={known} />
      <div className="q__choices">
        {q.choices.map((c, i) => (
          <button
            key={i}
            type="button"
            className={`q__choice${wrong.has(i) ? ' is-wrong' : ''}`}
            disabled={wrong.has(i)}
            onClick={() => choose(i)}
          >
            {c}
          </button>
        ))}
      </div>
      <p className="q__feedback" role="status">{wrong.size > 0 ? 'ちがうみたい…' : ' '}</p>
    </div>
  )
}

function SolvedCard({ index, q }: { index: number; q: Question }) {
  return (
    <div className="q q--solved">
      <div className="q__head">
        <span className="q__num">Q{index + 1}</span>
        <span className="q__prompt q__prompt--small">{q.prompt}</span>
      </div>
      <NumberRow reading={q.reading} known={new Set()} reveal />
    </div>
  )
}

/** 解読表：これまでにわかった番号と文字 */
function KeyTable({ known }: { known: Set<number> }) {
  return (
    <section className="key" aria-label="解読表">
      <h2 className="key__title">解読表</h2>
      <div className="key__grid">
        {[...LETTER_OF].sort(([a], [b]) => a - b).map(([n, ch]) => (
          <span key={n} className={`key__cell${known.has(n) ? ' is-known' : ''}`}>
            <span className="key__n">{n}</span>
            <span className="key__ch">{known.has(n) ? ch : '?'}</span>
          </span>
        ))}
      </div>
    </section>
  )
}

function FinalCard({ onCorrect }: { onCorrect: () => void }) {
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  const [shaking, setShaking] = useState(false)

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!value.trim()) return
    if (normalizeKana(value) === DESTINATION) {
      onCorrect()
      return
    }
    setShaking(true)
    setMessage('ちがうみたい…解読表と見比べてみて')
  }

  return (
    <div className={`q q--active q--final${shaking ? ' is-shaking' : ''}`} onAnimationEnd={() => setShaking(false)}>
      <div className="q__head">
        <span className="q__num">Last</span>
      </div>
      <p className="q__prompt">
        一番上の暗号 <strong className="q__cipher">{CIPHER.join(' ')}</strong> を解読すると？
      </p>
      <form className="final-form" onSubmit={submit}>
        <input
          value={value}
          onChange={(e) => { setValue(e.target.value); setMessage('') }}
          placeholder="ひらがなでもOK"
          lang="ja"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="done"
          aria-label="暗号の答え"
        />
        <button type="submit">決定</button>
      </form>
      <p className="q__feedback" role="status">{message || ' '}</p>
    </div>
  )
}
