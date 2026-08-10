import { describe, expect, it } from 'vitest'
import { createHangulComposer } from '../src/core/hangul/HangulComposer'

const composer = createHangulComposer()

describe('HangulComposer', () => {
  it('composes 가 from ㄱ + ㅏ', () => {
    expect(composer.compose({ initial: 'ㄱ', medial: 'ㅏ' })).toBe('가')
  })

  it('composes 한 from ㅎ + ㅏ + ㄴ', () => {
    expect(composer.compose({ initial: 'ㅎ', medial: 'ㅏ', final: 'ㄴ' })).toBe('한')
  })

  it('decomposes 가 into ㄱ + ㅏ', () => {
    expect(composer.decompose('가')).toEqual({
      initial: 'ㄱ',
      medial: 'ㅏ',
    })
  })

  it('decomposes 한 into ㅎ + ㅏ + ㄴ', () => {
    expect(composer.decompose('한')).toEqual({
      initial: 'ㅎ',
      medial: 'ㅏ',
      final: 'ㄴ',
    })
  })

  it('returns null for non-Hangul input', () => {
    expect(composer.decompose('A')).toBeNull()
  })

  it('round-trips several syllables', () => {
    const cases = [
      { initial: 'ㄱ', medial: 'ㅏ' },
      { initial: 'ㄲ', medial: 'ㅐ', final: 'ㄱ' },
      { initial: 'ㄴ', medial: 'ㅑ' },
      { initial: 'ㄷ', medial: 'ㅓ', final: 'ㄹ' },
      { initial: 'ㅁ', medial: 'ㅗ', final: 'ㅇ' },
      { initial: 'ㅂ', medial: 'ㅛ' },
      { initial: 'ㅅ', medial: 'ㅜ', final: 'ㅆ' },
      { initial: 'ㅇ', medial: 'ㅡ' },
      { initial: 'ㅈ', medial: 'ㅣ', final: 'ㅎ' },
      { initial: 'ㅊ', medial: 'ㅚ' },
    ]

    for (const parts of cases) {
      const composed = composer.compose(parts)
      expect(composer.decompose(composed)).toEqual(parts)
    }
  })
})
