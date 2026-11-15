const SMALL_TO_LARGE: Record<string, string> = {
  ァ: 'ア', ィ: 'イ', ゥ: 'ウ', ェ: 'エ', ォ: 'オ',
  ッ: 'ツ', ャ: 'ヤ', ュ: 'ユ', ョ: 'ヨ', ヮ: 'ワ', ヵ: 'カ', ヶ: 'ケ',
}
const LONG_VOWEL = /[-‐－―—〜~ｰ]/g

/**
 * 入力をパズルの表記にそろえる。
 * ひらがな→カタカナ、小さい文字→大きい文字、伸ばし棒のゆれ→「ー」
 */
export function normalizeKana(input: string): string {
  return input
    .normalize('NFKC')
    .replace(/\s+/g, '')
    .replace(LONG_VOWEL, 'ー')
    .replace(/[ぁ-ゖ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) + 0x60))
    .replace(/[ァィゥェォッャュョヮヵヶ]/g, (ch) => SMALL_TO_LARGE[ch])
}

const DAKUTEN = 'ガギグゲゴザジズゼゾダヂヅデドバビブベボパピプペポ'
const SEION = 'カキクケコサシスセソタチツテトハヒフヘホハヒフヘホ'

/** 濁点・半濁点を外す（答えマスを「濁点つけ外し自由」で読むため） */
export function toSeion(input: string): string {
  return [...input].map((ch) => {
    const i = DAKUTEN.indexOf(ch)
    return i >= 0 ? SEION[i] : ch
  }).join('')
}

/**
 * 最終問題の入力を比べやすい形にそろえる。
 * 「クローゼット右奥」「くろーぜっとのみぎおく」なども正解になるよう、
 * 漢字の「右」「奥」を読みに直し、「の」を取り除いて、濁点も外して比べる。
 */
export function normalizeFinal(input: string): string {
  const kana = normalizeKana(input.replace(/右/g, 'みぎ').replace(/奥/g, 'おく'))
  return toSeion(kana.replace(/ノ/g, '').replace(/[、。,.!！?？]/g, ''))
}
