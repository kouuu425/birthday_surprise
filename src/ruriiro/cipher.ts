// ===================================================================
// 暗号の中身（ここを書き換えれば問題を差し替えられます）
//
// しくみ（2段階）:
// 1. 答えに出てくるカタカナ1文字ごとに番号を割り当てる（同じ文字は同じ番号）。
//    各問の答えは番号の並びで表示され、正解するとその番号の読み方がわかる。
// 2. 画面上部の暗号（MESSAGE を番号にしたもの）を、解読表を見て読み解く。
// 3. 解読して出てきたなぞなぞ（MESSAGE）の答えが、行き先（DESTINATION）。
//
// - QUESTIONS
//     reading … 正解の読み（カタカナ。小さい文字は使わない）。この文字が番号になる
//               入力はひらがな・カタカナどちらでも正解になる
//     accept  … 読み以外に正解にしたい書き方（漢字など）。なくてもOK
//     hint    … 2回まちがえたら出すヒント
// - SEED: 番号の割り当てを変えたいときに変える数字
// ※ 書き換えたら `npm run check` で、ちゃんと解けるか確認すること
// ===================================================================

export interface Question {
  prompt: string
  reading: string
  accept?: string[]
  hint: string
}

/** 暗号を解読すると出てくる言葉（なぞなぞ） */
export const MESSAGE = 'コノページノイロ'
/** 解読した言葉を読みやすく区切ったもの（表示用） */
export const MESSAGE_DISPLAY = 'この ページの いろ'
/** なぞなぞの答え ＝ 今夜の行き先 */
export const DESTINATION = 'ルリイロ'
export const DESTINATION_KANJI = '瑠璃色'

export const QUESTIONS: Question[] = [
  {
    prompt: 'スポンジでクリームを巻いた、くるくるのケーキは？',
    reading: 'ロールケーキ',
    hint: 'ヒント：「巻く」は英語で…？',
  },
  {
    prompt: 'フランス語で「クリスマス」のことを何という？',
    reading: 'ノエル',
    hint: 'ヒント：「ブッシュ・ド・○○○」という、切り株の形のケーキがあるよ',
  },
  {
    prompt: '星のような形をした、小さなお砂糖のお菓子は？',
    reading: 'コンペイトウ',
    accept: ['金平糖'],
    hint: 'ヒント：漢字で書くと「金平糖」',
  },
  {
    prompt: 'クリスマスに流れる、鈴の音の歌といえば？',
    reading: 'ジングルベル',
    hint: 'ヒント：♪ ○○○○○○ ○○○○○○ すずがなる',
  },
]

/**
 * なぞなぞの答えを入れたときの反応。
 * - 青系の色を答えたとき → 惜しいと伝える
 * - それ以外 → まちがえた回数に応じて、ヒントを少しずつ出す
 */
export const BLUE_FAMILY = ['アオ', 'アオイロ', 'ブルー', 'ネイビー', 'コン', 'コンイロ', 'アイ', 'アイイロ', 'グンジヨウ', 'グンジヨウイロ', 'ラピスラズリ', 'ラピスラズリイロ']
export const NEAR_MISS = ['ルリ']
export const RIDDLE_HINTS = [
  'ちがうみたい…このページ、何色に見える？',
  'ヒント：宝石の名前がついた、和の色だよ',
  'ヒント：「○○いろ」の4文字。ラピスラズリの和名は「瑠璃（るり）」',
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
/** 画面上部に出す暗号（MESSAGE を番号にしたもの） */
export const CIPHER = [...MESSAGE].map((ch) => NUMBER_OF.get(ch) ?? 0)
