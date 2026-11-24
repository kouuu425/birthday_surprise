// ===================================================================
// 暗号の中身（ここを書き換えれば問題を差し替えられます）
//
// しくみ: 答えに出てくるカタカナ1文字ごとに番号を割り当てる（同じ文字は同じ番号）。
// 各問の答えは番号の並びで表示され、正解するとその番号の読み方がわかる。
// 最後に、DESTINATION を番号にした暗号を、解読表を見て読み解く。
//
// - QUESTIONS
//     choices … 選択肢（表示用。漢字でもOK）
//     answer  … 正解の選択肢の番号（0始まり）
//     reading … 正解の読み（カタカナ）。この文字が番号になる
// - SEED: 番号の割り当てを変えたいときに変える数字
// ※ 書き換えたら `npm run check` で、ちゃんと解けるか確認すること
// ===================================================================

export interface Question {
  prompt: string
  choices: string[]
  answer: number
  reading: string
}

/** 解読すると出てくる言葉 */
export const DESTINATION = 'ルリイロ'

export const QUESTIONS: Question[] = [
  {
    prompt: 'ケーキに立てて、願いごとをしてから吹き消すものは？',
    choices: ['クラッカー', 'ロウソク', 'リボン', 'フラッグ'],
    answer: 1,
    reading: 'ロウソク',
  },
  {
    prompt: '切り分ける前の、丸ごとのケーキを何という？',
    choices: ['ショートケーキ', 'ロールケーキ', 'ホールケーキ', 'カップケーキ'],
    answer: 2,
    reading: 'ホールケーキ',
  },
  {
    prompt: '12月5日生まれの星座は？',
    choices: ['さそり座', 'いて座', 'やぎ座', 'みずがめ座'],
    answer: 1,
    reading: 'イテザ',
  },
  {
    prompt: '12月の誕生石のひとつ。夜空のような、深い青の石は？',
    choices: ['ルビー', 'エメラルド', 'ガーネット', 'ラピスラズリ'],
    answer: 3,
    reading: 'ラピスラズリ',
  },
]

const SEED = 1205

// 決まった順番でシャッフルする（開き直しても番号が変わらないように）
function shuffled<T>(items: T[], seed: number): T[] {
  const a = [...items]
  let s = seed
  const rand = () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const letters = [...new Set(QUESTIONS.flatMap((q) => [...q.reading]))]

/** カタカナ → 番号 */
export const NUMBER_OF = new Map(shuffled(letters, SEED).map((ch, i) => [ch, i + 1]))
/** 番号 → カタカナ */
export const LETTER_OF = new Map([...NUMBER_OF].map(([ch, n]) => [n, ch]))
/** 画面上部に出す暗号（DESTINATION を番号にしたもの） */
export const CIPHER = [...DESTINATION].map((ch) => NUMBER_OF.get(ch) ?? 0)
