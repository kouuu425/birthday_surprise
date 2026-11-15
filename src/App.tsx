import { useEffect, useRef, useState } from 'react'
import { AnswerPanel } from './components/AnswerPanel.tsx'
import { ClearOverlay } from './components/ClearOverlay.tsx'
import { FinalPanel } from './components/FinalPanel.tsx'
import { Grid } from './components/Grid.tsx'
import { StartScreen } from './components/StartScreen.tsx'
import { buildCrossword, cellKey, type Cell, type Entry } from './lib/crossword.ts'
import { MARKS, NAME } from './lib/puzzle.ts'

const STORAGE_KEY = 'nazo-progress-v2' // 盤面を変えたら番号を上げる（古い進捗と混ざらないように）
const FINAL_KEY = 'nazo-final-v2'
const STARTED_KEY = 'nazo-started-v2'
const CIRCLED = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫'
// 盤面は固定なので、読み込み時に一度だけ組み立てる
const { cells, entries } = buildCrossword()

// localStorage はプライベートブラウズ等で使えないことがあるので try/catch で包む
function loadSolved(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}
function saveSolved(s: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...s]))
  } catch {
    /* 保存できなくても遊べる */
  }
}
function loadStarted(): boolean {
  try {
    return localStorage.getItem(STARTED_KEY) === '1'
  } catch {
    return false
  }
}
function saveStarted(v: boolean) {
  try {
    if (v) localStorage.setItem(STARTED_KEY, '1')
    else localStorage.removeItem(STARTED_KEY)
  } catch {
    /* 保存できなくても遊べる */
  }
}
function loadFinal(): boolean {
  try {
    return localStorage.getItem(FINAL_KEY) === '1'
  } catch {
    return false
  }
}
function saveFinal(v: boolean) {
  try {
    if (v) localStorage.setItem(FINAL_KEY, '1')
    else localStorage.removeItem(FINAL_KEY)
  } catch {
    /* 保存できなくても遊べる */
  }
}

export default function App() {
  const [solved, setSolved] = useState(loadSolved)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [started, setStarted] = useState(loadStarted)
  const [finalSolved, setFinalSolved] = useState(loadFinal)
  const [showClear, setShowClear] = useState(false)
  const answerRowRef = useRef<HTMLDivElement>(null)

  const selected = entries.find((e) => e.id === selectedId) ?? null
  const allSolved = solved.size === entries.length

  useEffect(() => saveSolved(solved), [solved])
  useEffect(() => saveFinal(finalSolved), [finalSolved])
  useEffect(() => saveStarted(started), [started])

  // 全部埋まったら、①〜⑩の列が見えるところまでスクロールして最終問題へ
  useEffect(() => {
    if (allSolved && !finalSolved) {
      answerRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [allSolved, finalSolved])

  function handleFinalCorrect() {
    setFinalSolved(true)
    setShowClear(true)
  }

  function tapCell(cell: Cell) {
    // 同じマスを再タップしたら、タテ／ヨコを切り替える
    if (selectedId && cell.entries.includes(selectedId) && cell.entries.length > 1) {
      setSelectedId(cell.entries.find((id) => id !== selectedId)!)
      return
    }
    setSelectedId(cell.entries.find((id) => !solved.has(id)) ?? cell.entries[0])
  }

  function handleCorrect(entry: Entry) {
    const next = new Set(solved).add(entry.id)
    setSolved(next)
    // 次の未回答のカギへ自動で進む
    const i = entries.indexOf(entry)
    const rest = [...entries.slice(i + 1), ...entries.slice(0, i)]
    setSelectedId(rest.find((e) => !next.has(e.id))?.id ?? null)
  }

  function reset() {
    if (!confirm('最初からやり直しますか？')) return
    setSolved(new Set())
    setSelectedId(null)
    setFinalSolved(false)
    setShowClear(false)
    setStarted(false)
    window.scrollTo(0, 0)
  }

  // 最初はスタート画面（一度始めたら、開き直してもパズルから）
  if (!started) return <StartScreen onStart={() => setStarted(true)} />

  const markLetters = MARKS.map(([r, c]) => {
    const cell = cells.get(cellKey(r, c))!
    return cell.entries.some((id) => solved.has(id)) ? cell.letter : ''
  })

  return (
    <main className="page">
      <header className="hero">
        <p className="hero__eyebrow">December 5 — for {NAME}</p>
        <h1 className="hero__title">誕生日謎解き</h1>
        <div className="hero__rule" aria-hidden />
        <p className="hero__lead">
          2人の思い出がカギになったクロスワード。
          <br />
          すべて埋めたら、<span className="accent-text">①〜⑩</span>のマスを順に読んでみて。
        </p>
      </header>

      <section className="card rules">
        <ul>
          <li>マスかカギをタップして、答えを入力</li>
          <li>ひらがなでもOK</li>
          <li>小さい文字（ッ・ョ・ィ）も、大きく1マスに入ります</li>
          <li>①〜⑩を読むときは、濁点（゛）をつけても外してもOK</li>
        </ul>
      </section>

      <section className="board">
        <Grid cells={cells} solved={solved} selected={selected} onTap={tapCell} />

        <div ref={answerRowRef} className={`answer-row${allSolved ? ' is-complete' : ''}`} aria-label="答えのマス">
          {markLetters.map((ch, i) => (
            <div key={i} className="answer-row__cell" style={{ animationDelay: `${i * 0.12}s` }}>
              <span className="answer-row__idx">{CIRCLED[i]}</span>
              <span className="answer-row__ch">{ch}</span>
            </div>
          ))}
        </div>
        <p className="progress">
          {solved.size} / {entries.length}
        </p>
      </section>

      <section className="clues">
        {(['across', 'down'] as const).map((dir) => (
          <div key={dir} className="clues__group">
            <h2>{dir === 'across' ? 'ヨコのカギ' : 'タテのカギ'}</h2>
            <ol>
              {entries
                .filter((e) => e.dir === dir)
                .map((e) => (
                  <li key={e.id}>
                    <button
                      type="button"
                      className={`clue${e.id === selectedId ? ' is-active' : ''}${solved.has(e.id) ? ' is-solved' : ''}`}
                      onClick={() => setSelectedId(e.id)}
                    >
                      <span className="clue__num">{e.number}</span>
                      <span className="clue__text">{e.clue}</span>
                      <span className="clue__len">{e.answer.length}</span>
                    </button>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </section>

      {finalSolved && !showClear && (
        <section className="card finale">
          <p className="finale__bday">Happy Birthday, {NAME}</p>
          <button type="button" onClick={() => setShowClear(true)}>答えをもう一度見る</button>
        </section>
      )}

      <footer className="footer">
        <button type="button" onClick={reset}>最初からやり直す</button>
      </footer>

      {!finalSolved && (
        <div className="dock">
          {allSolved ? (
            <FinalPanel onCorrect={handleFinalCorrect} />
          ) : (
            <AnswerPanel entry={selected} cells={cells} solved={solved} onCorrect={handleCorrect} />
          )}
        </div>
      )}

      {showClear && <ClearOverlay onClose={() => setShowClear(false)} />}
    </main>
  )
}
