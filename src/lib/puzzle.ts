// ===================================================================
// パズルの中身（ここを書き換えればカギの文言などを調整できます）
//
// - answer: 盤面に入る文字。小さい文字（ッ・ョ・ィ）は大きく書く
// - row / col: 単語の1文字目の位置（0始まり）
// - dir: 'across' = 横、'down' = 縦
// ※ 盤面の形を変えたら `npm run check` で整合性を確認すること
// ===================================================================

export type Dir = 'across' | 'down'

export interface WordDef {
  answer: string
  row: number
  col: number
  dir: Dir
  clue: string
}

/** 呼びかけに使う名前（public リポジトリなのでファーストネームのみ） */
export const NAME = 'Aika'

export const ROWS = 14
export const COLS = 11

export const WORDS: WordDef[] = [
  { answer: 'ミズホダイチユウオウコウエン', row: 0, col: 6, dir: 'down', clue: '2人で初めて一緒にバドミントンをした場所' },
  { answer: 'カグラザカ', row: 1, col: 0, dir: 'across', clue: '2人で街歩きした、石畳の坂の街' },
  { answer: 'カナザワ', row: 1, col: 4, dir: 'down', clue: '2人で旅した、北陸の街' },
  { answer: 'スニーカー', row: 1, col: 9, dir: 'down', clue: '今年のバレンタインにあげたもの' },
  { answer: 'ミナトミライ', row: 3, col: 2, dir: 'down', clue: '去年の誕生日に行った場所' },
  { answer: 'シナガワスイゾクカン', row: 4, col: 1, dir: 'across', clue: 'ペンギンや魚を見たあの場所' },
  { answer: 'マルノウチ', row: 7, col: 0, dir: 'down', clue: '去年の冬にイルミネーションを見に行った街' },
  { answer: 'キヨウト', row: 7, col: 4, dir: 'across', clue: '2人で旅した、千年の都' },
  { answer: 'コロツケ', row: 7, col: 9, dir: 'down', clue: '結局、揚げ焼きになったあの料理' },
  { answer: 'ルリイロ', row: 8, col: 0, dir: 'across', clue: '今夜のディナーのお店の名前' },
  { answer: 'ウイキツド', row: 9, col: 6, dir: 'across', clue: '一緒に観た、緑の魔女の物語' },
  { answer: 'ギヨウザ', row: 11, col: 4, dir: 'across', clue: '2人で作りたい、包んで作るあの料理' },
  { answer: 'ヘクセンハウス', row: 13, col: 3, dir: 'across', clue: 'クリスマスパーティーで作った、お菓子の家' },
]

/**
 * 答えの文字を拾うマス（答えの順番どおり）[row, col]
 * 読むときは濁点のつけ外し自由（例: ④は盤面では「セ」→「ゼ」と読む）
 */
export const MARKS: [number, number][] = [
  [4, 8], [8, 3], [3, 9], [13, 5], [9, 9], [7, 7], [6, 2], [11, 4], [8, 6], [13, 4],
]

/** クリア時に表示する答え（盤面では「ツ」「セ」でも、ここは正しい表記で） */
export const FINAL_ANSWER = 'クローゼットミギオク'
export const FINAL_HINT = 'クローゼットの、右の奥。'
