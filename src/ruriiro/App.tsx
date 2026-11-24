import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { normalizeKana } from '../lib/kana.ts'
import { NAME } from '../lib/puzzle.ts'
import {
  BLUE_FAMILY,
  CIPHER,
  DESTINATION,
  DESTINATION_KANJI,
  LETTER_OF,
  MESSAGE,
  MESSAGE_DISPLAY,
  NEAR_MISS,
  NUMBER_OF,
  QUESTIONS,
  RIDDLE_HINTS,
  type Question,
} from './cipher.ts'

// 問題を変えたら番号を上げる（古い進捗と混ざらないように）
const PROGRESS_KEY = 'ruriiro-progress-v4'
const STAGE_KEY = 'ruriiro-stage-v4'

/** 0: 問題を解いている / 1: 暗号を解読した / 2: なぞなぞも解けた */
type Stage = 0 | 1 | 2

// localStorage はプライベートブラウズ等で使えないことがあるので try/catch で包む
function load(key: string, max: number): number {
  try {
    const n = Number(localStorage.getItem(key) ?? 0)
    return Number.isInteger(n) && n >= 0 && n <= max ? n : 0
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

/** 入力をそろえる。「瑠璃色」「この ページの 色」などの漢字・空白・記号も受け付ける */
function normalizeAnswer(input: string): string {
  const kanji: [RegExp, string][] = [
    [/瑠璃/g, 'るり'], [/群青/g, 'ぐんじょう'], [/青/g, 'あお'], [/紺/g, 'こん'], [/藍/g, 'あい'], [/色/g, 'いろ'],
  ]
  const kana = kanji.reduce((s, [re, yomi]) => s.replace(re, yomi), input)
  return normalizeKana(kana).replace(/[、。,.!！?？「」]/g, '')
}

export default function App() {
  const [solvedCount, setSolvedCount] = useState(() => load(PROGRESS_KEY, QUESTIONS.length))
  const [stage, setStage] = useState<Stage>(() => load(STAGE_KEY, 2) as Stage)
  const stepRef = useRef<HTMLElement>(null)
  const allSolved = solvedCount === QUESTIONS.length

  // 解読済みの番号
  const known = new Set(QUESTIONS.slice(0, solvedCount).flatMap((q) => [...q.reading].map((ch) => NUMBER_OF.get(ch)!)))

  useEffect(() => save(PROGRESS_KEY, solvedCount), [solvedCount])
  useEffect(() => save(STAGE_KEY, stage), [stage])
  // 次の段階が出たら、そこまでスクロール
  useEffect(() => {
    if (allSolved) stepRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [allSolved, stage])

  function reset() {
    if (!confirm('最初からやり直しますか？')) return
    setSolvedCount(0)
    setStage(0)
    window.scrollTo(0, 0)
  }

  return (
    <main className="r-page">
      <header className="r-hero">
        <p className="r-hero__eyebrow">December 5 — for {NAME}</p>
        <h1 className="r-hero__title">今夜の行き先</h1>
        <div className="r-hero__rule" aria-hidden />
        <p className="r-hero__lead">
          ディナーのお店は、この暗号の先に。
          <br />
          同じ数字は、いつも同じ文字。
          <br />
          問いに答えて、数字を解読してね。
        </p>
      </header>

      <section className={`cipher${stage >= 1 ? ' is-complete' : ''}`} aria-label="暗号">
        {CIPHER.map((n, i) => (
          <div key={i} className={`cipher__tile${stage >= 1 ? ' is-open' : ''}`} style={{ transitionDelay: `${i * 0.12}s`, animationDelay: `${i * 0.12}s` }}>
            <span className="cipher__num">{n}</span>
            <span className="cipher__ch" aria-hidden={stage < 1}>{stage >= 1 ? LETTER_OF.get(n) : ''}</span>
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

      {allSolved && stage === 0 && (
        <section ref={stepRef}>
          <InputCard
            key="decode"
            label="Decode"
            prompt={
              <>
                一番上の暗号 <strong className="q__cipher">{CIPHER.join(' ')}</strong> を解読すると？
              </>
            }
            check={(v) => (v === normalizeAnswer(MESSAGE) ? null : 'ちがうみたい…解読表と1文字ずつ見比べてみて')}
            onCorrect={() => setStage(1)}
          />
        </section>
      )}

      {stage === 1 && (
        <section ref={stepRef}>
          <InputCard
            key="riddle"
            label="Last"
            prompt={
              <>
                暗号は「<strong className="q__cipher">{MESSAGE_DISPLAY}</strong>」。
                <br />
                さて、このページは何色？
              </>
            }
            check={riddleFeedback}
            onCorrect={() => setStage(2)}
          />
        </section>
      )}

      {stage === 2 && (
        <section ref={stepRef} className="r-finale">
          <p className="r-finale__eyebrow">Decoded</p>
          <p className="r-finale__word">
            {[...DESTINATION].map((ch, i) => (
              <span key={i} style={{ animationDelay: `${0.4 + i * 0.25}s` }}>{ch}</span>
            ))}
          </p>
          <p className="r-finale__kanji">{DESTINATION_KANJI}</p>
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

/** なぞなぞの判定：青系なら「惜しい」、それ以外はまちがえた回数に応じてヒント */
function riddleFeedback(v: string, misses: number): string | null {
  if (v === normalizeAnswer(DESTINATION)) return null
  if (NEAR_MISS.includes(v)) return 'おしい！色の名前だから…？'
  const hint = RIDDLE_HINTS[Math.min(misses, RIDDLE_HINTS.length) - 1]
  if (BLUE_FAMILY.includes(v)) return `青系なのは合ってる！もっとぴったりな、和の色の名前があるよ${misses >= 2 ? `\n${hint}` : ''}`
  return hint
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

/** 自由入力の問い。check が null を返したら正解、文字列ならそれを表示する */
function InputCard({ label, prompt, check, onCorrect }: {
  label: string
  prompt: ReactNode
  /** misses は、今回を含めてまちがえた回数 */
  check: (normalized: string, misses: number) => string | null
  onCorrect: () => void
}) {
  const [value, setValue] = useState('')
  const [message, setMessage] = useState('')
  const [shaking, setShaking] = useState(false)
  const [misses, setMisses] = useState(0)

  function submit(e: FormEvent) {
    e.preventDefault()
    const v = normalizeAnswer(value)
    if (!v) return
    const result = check(v, misses + 1)
    if (result === null) {
      onCorrect()
      return
    }
    setMisses(misses + 1)
    setShaking(true)
    setMessage(result)
  }

  return (
    <div className={`q q--active q--final${shaking ? ' is-shaking' : ''}`} onAnimationEnd={() => setShaking(false)}>
      <div className="q__head">
        <span className="q__num">{label}</span>
      </div>
      <p className="q__prompt">{prompt}</p>
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
          aria-label="答え"
        />
        <button type="submit">決定</button>
      </form>
      <p className="q__feedback q__feedback--multiline" role="status">{message || ' '}</p>
    </div>
  )
}
