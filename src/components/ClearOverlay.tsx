import { FINAL_ANSWER, FINAL_HINT, NAME } from '../lib/puzzle.ts'

// 金色のきらめきの配置。描画のたびに変わらないよう、読み込み時に一度だけ決める
const SPARKLES = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  top: Math.random() * 100,
  delay: Math.random() * 4,
  size: 2 + Math.random() * 4,
}))

export function ClearOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="clear" role="dialog" aria-modal="true" aria-label="クリア">
      <div className="clear__sparkles" aria-hidden>
        {SPARKLES.map((s) => (
          <span key={s.id} style={{ left: `${s.left}%`, top: `${s.top}%`, animationDelay: `${s.delay}s`, width: s.size, height: s.size }} />
        ))}
      </div>
      <div className="clear__body">
        <p className="clear__eyebrow">Mystery Solved</p>
        <h2 className="clear__title">CLEAR</h2>
        <p className="clear__label">答え</p>
        <p className="clear__answer">
          {[...FINAL_ANSWER].map((ch, i) => (
            <span key={i} style={{ animationDelay: `${1.2 + i * 0.18}s` }}>{ch}</span>
          ))}
        </p>
        <p className="clear__hint">
          {/* FINAL_HINT の「\n」の位置で改行する */}
          {FINAL_HINT.split('\n').map((line, i) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
        <div className="clear__divider" aria-hidden />
        <p className="clear__bday">Happy Birthday, {NAME}</p>
        <button type="button" className="clear__close" onClick={onClose}>とじる</button>
      </div>
    </div>
  )
}
