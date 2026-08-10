import type { HangulComposer, HangulSyllableParts } from './types'

const INITIALS = [
  'ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅃ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

const MEDIALS = [
  'ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ', 'ㅖ', 'ㅗ', 'ㅘ',
  'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ', 'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ',
] as const

const FINALS = [
  '', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ',
  'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ',
  'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ',
] as const

const HANGUL_START = 0xAC00
const HANGUL_END = 0xD7A3

export function createHangulComposer(): HangulComposer {
  return {
    compose(parts: HangulSyllableParts): string {
      const initialIndex = INITIALS.indexOf(parts.initial as typeof INITIALS[number])
      const medialIndex = MEDIALS.indexOf(parts.medial as typeof MEDIALS[number])
      const finalIndex = parts.final
        ? FINALS.indexOf(parts.final as typeof FINALS[number])
        : 0

      if (initialIndex === -1 || medialIndex === -1 || finalIndex === -1) {
        return ''
      }

      const syllableCode = ((initialIndex * 21) + medialIndex) * 28 + finalIndex + HANGUL_START
      return String.fromCodePoint(syllableCode)
    },

    decompose(syllable: string): HangulSyllableParts | null {
      if (syllable.length !== 1) {
        return null
      }

      const code = syllable.codePointAt(0)
      if (code === undefined || code < HANGUL_START || code > HANGUL_END) {
        return null
      }

      const offset = code - HANGUL_START
      const finalIndex = offset % 28
      const medialIndex = Math.floor(offset / 28) % 21
      const initialIndex = Math.floor(offset / (21 * 28))

      const initial = INITIALS[initialIndex]
      const medial = MEDIALS[medialIndex]
      const finalConsonant = FINALS[finalIndex]

      if (initial === undefined || medial === undefined) {
        return null
      }

      return finalConsonant
        ? { initial, medial, final: finalConsonant }
        : { initial, medial }
    },
  }
}
