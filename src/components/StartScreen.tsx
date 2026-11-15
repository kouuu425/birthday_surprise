import { useState } from 'react'
import { NAME } from '../lib/puzzle.ts'

/**
 * スタート画面：封蝋をタップすると封筒が開き、カードと「Let's go」が出る。
 * 閉じている間は、前ポケット＋フタで封筒の全面を覆い、カード自体も非表示にしている。
 */
export function StartScreen({ onStart }: { onStart: () => void }) {
  const [open, setOpen] = useState(false)
  const [leaving, setLeaving] = useState(false)

  function start() {
    setLeaving(true)
    setTimeout(onStart, 600) // フェードアウトしてからパズルへ
  }

  return (
    <div className={`start${open ? ' is-open' : ''}${leaving ? ' is-leaving' : ''}`}>
      <p className="start__to">To {NAME}</p>

      <button
        type="button"
        className="envelope"
        onClick={() => setOpen(true)}
        disabled={open}
        aria-label="封筒を開ける"
      >
        <span className="envelope__back" aria-hidden />
        <span className="envelope__card" aria-hidden={!open}>
          <span className="envelope__card-title">謎解きはディナーのあとで</span>
          <span className="envelope__card-sub">The Dinner Table Detective</span>
        </span>
        <span className="envelope__pocket" aria-hidden />
        <span className="envelope__flap" aria-hidden />
        <span className="envelope__seal" aria-hidden>
          {NAME[0]}
        </span>
      </button>

      <p className="start__hint" aria-hidden={open}>封をタップして開けてね</p>

      <div className="start__after" aria-hidden={!open}>
        <p className="start__message">
          最後に、ひとつだけ
          <br />
          謎を用意しました。
        </p>
        <button type="button" className="start__go" onClick={start} tabIndex={open ? 0 : -1}>
          Let&apos;s go
        </button>
      </div>
    </div>
  )
}
