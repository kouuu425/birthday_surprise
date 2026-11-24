import { useEffect, useRef, useState } from 'react'
import { NAME } from '../lib/puzzle.ts'
import { CIPHER, DESTINATION, QUESTIONS, decodeTable, type Question } from './cipher.ts'

const STORAGE_KEY = 'ruriiro-progress-v1' // 問題を変えたら番号を上げる
const table = decodeTable()

// localStorage はプライベートブラウズ等で使えないことがあるので try/catch で包む
function loadSolved(): number {
  try {
    const n = Number(localStorage.getItem(STORAGE_KEY) ?? 0)
    return Number.isInteger(n) && n >= 0 && n <= QUESTIONS.length ? n : 0
  } catch {
    return 0
  }
}
function saveSolved(n: number) {
  try {
    localStorage.setItem(STORAGE_KEY, String(n))
  } catch {
    /* 保存できなくても遊べる */
  }
}

export default function App() {
  // 何問目まで解けたか（問題は上から順に解く）
  const [solvedCount, setSolvedCount] = useState(loadSolved)
  const finaleRef = useRef<HTMLElement>(null)
  const allSolved = solvedCount === QUESTIONS.length
  const decoded = new Set(QUESTIONS.slice(0, solvedCount).map((q) => q.symbol))

  useEffect(() => saveSolved(solvedCount), [solvedCount])
  useEffect(() => {
    if (allSolved) finaleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved])

  function reset() {
    if (!confirm('最初からやり直しますか？')) return
    setSolvedCount(0)
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
          問いに答えて、記号を解読してね。
        </p>
      </header>

      <section className={`cipher${allSolved ? ' is-complete' : ''}`} aria-label="暗号">
        {CIPHER.map((sym, i) => {
          const open = decoded.has(sym)
          return (
            <div key={i} className={`cipher__tile${open ? ' is-open' : ''}`} style={{ animationDelay: `${i * 0.15}s` }}>
              <span className="cipher__sym" aria-hidden={open}>{sym}</span>
              <span className="cipher__ch" aria-hidden={!open}>{open ? table.get(sym) : ''}</span>
            </div>
          )
        })}
      </section>

      <section className="questions">
        {QUESTIONS.map((q, i) =>
          i < solvedCount ? (
            <SolvedCard key={i} index={i} q={q} />
          ) : i === solvedCount ? (
            <QuestionCard key={i} index={i} q={q} onCorrect={() => setSolvedCount(i + 1)} />
          ) : (
            <div key={i} className="q q--locked" aria-label={`問${i + 1}（まだ開いていません）`}>
              <span className="q__num">Q{i + 1}</span>
              <span className="q__sym">{q.symbol}</span>
              <span className="q__locked-text">前の問いを解くと開きます</span>
            </div>
          ),
        )}
      </section>

      {allSolved && (
        <section ref={finaleRef} className="r-finale">
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

function QuestionCard({ index, q, onCorrect }: { index: number; q: Question; onCorrect: () => void }) {
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
        <span className="q__key">
          <span className="q__sym">{q.symbol}</span> ＝ 答えの{q.pick}文字目
        </span>
      </div>
      <p className="q__prompt">{q.prompt}</p>
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
      <div className="q__result">
        <span className="q__reading">
          {[...q.reading].map((ch, i) => (
            <span key={i} className={i === q.pick - 1 ? 'is-picked' : ''}>{ch}</span>
          ))}
        </span>
        <span className="q__arrow" aria-hidden>→</span>
        <span className="q__decoded">
          <span className="q__sym">{q.symbol}</span> ＝ {q.reading[q.pick - 1]}
        </span>
      </div>
    </div>
  )
}
