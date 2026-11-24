// ===================================================================
// 暗号の中身（ここを書き換えれば問題を差し替えられます）
//
// - CIPHER: 画面上部に出す暗号文（記号の並び）
// - QUESTIONS: 1問解くごとに、記号1つの読み方がわかる
//     symbol  … この問題で解読できる記号
//     choices … 選択肢（表示用。漢字でもOK）
//     answer  … 正解の選択肢の番号（0始まり）
//     reading … 正解の読み（カタカナ）。ここから1文字を拾う
//     pick    … reading の何文字目を拾うか（1始まり）
// ※ 書き換えたら `npm run check` で、ちゃんと答えになるか確認すること
// ===================================================================

export interface Question {
  symbol: string
  prompt: string
  choices: string[]
  answer: number
  reading: string
  pick: number
}

/** 暗号文。解読すると「ルリイロ」になる */
export const CIPHER = ['▲', '◆', '■', '●']

export const QUESTIONS: Question[] = [
  {
    symbol: '●',
    prompt: 'ケーキに立てて、願いごとをしてから吹き消すものは？',
    choices: ['クラッカー', 'ロウソク', 'リボン', 'フラッグ'],
    answer: 1,
    reading: 'ロウソク',
    pick: 1,
  },
  {
    symbol: '▲',
    prompt: '切り分ける前の、丸ごとのケーキを何という？',
    choices: ['ショートケーキ', 'ロールケーキ', 'ホールケーキ', 'カップケーキ'],
    answer: 2,
    reading: 'ホールケーキ',
    pick: 3,
  },
  {
    symbol: '■',
    prompt: '12月5日生まれの星座は？',
    choices: ['さそり座', 'いて座', 'やぎ座', 'みずがめ座'],
    answer: 1,
    reading: 'イテザ',
    pick: 1,
  },
  {
    symbol: '◆',
    prompt: '12月の誕生石のひとつ。夜空のような、深い青の石は？',
    choices: ['ルビー', 'エメラルド', 'ガーネット', 'ラピスラズリ'],
    answer: 3,
    reading: 'ラピスラズリ',
    pick: 6,
  },
]

/** 解読した結果（クリア画面に出す行き先） */
export const DESTINATION = 'ルリイロ'

/** 記号 → 読み の対応表 */
export function decodeTable(): Map<string, string> {
  return new Map(QUESTIONS.map((q) => [q.symbol, q.reading[q.pick - 1]]))
}
