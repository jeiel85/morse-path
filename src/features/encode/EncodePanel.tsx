import { useState, useMemo } from 'react'
import { t } from '../../ui/copy'
import type { MorseAlphabet, MorseCode, MorseEntry } from '../../core/morse/types'
import { createMorseEngine } from '../../core/morse/MorseEngine'
import { createHangulComposer } from '../../core/hangul/HangulComposer'
import type { MorseAudio } from '../../audio'

const engine = createMorseEngine()
const hangulComposer = createHangulComposer()

function formatSignals(signals: MorseCode): string {
  return signals.map((signal) => (signal === '-' ? '−' : '·')).join(' ')
}

interface EncodedChar {
  symbol: string
  entry: MorseEntry | null
}

function encodeText(text: string, alphabet: MorseAlphabet): EncodedChar[] {
  const result: EncodedChar[] = []

  for (const char of text) {
    if (alphabet === 'hangul') {
      const decomposed = hangulComposer.decompose(char)
      if (decomposed !== null) {
        const jamos = [decomposed.initial, decomposed.medial]
        if (decomposed.final !== undefined) {
          jamos.push(decomposed.final)
        }
        for (const jamo of jamos) {
          result.push({ symbol: jamo, entry: engine.encode(jamo, 'hangul') })
        }
        continue
      }
    }
    result.push({ symbol: char, entry: engine.encode(char, alphabet) })
  }

  return result
}

export function EncodePanel({
  alphabet,
  audio,
  wpm = 15,
}: {
  alphabet: MorseAlphabet
  audio: MorseAudio
  wpm?: number
}) {
  const [text, setText] = useState('')
  const encoded = useMemo(() => encodeText(text, alphabet), [text, alphabet])

  const handlePlayAll = () => {
    if (encoded.length === 0) {
      return
    }
    void audio.resume()
    const dotMs = 1200 / wpm
    let time = 0
    for (const { entry } of encoded) {
      if (entry === null) {
        time += dotMs * 3
        continue
      }
      for (const signal of entry.code) {
        const duration = signal === '-' ? dotMs * 3 : dotMs
        setTimeout(() => {
          if (signal === '-') {
            audio.playDash()
          } else {
            audio.playDot()
          }
        }, time)
        time += duration + dotMs
      }
      time += dotMs * 2
    }
  }

  return (
    <section className="feature-panel encode-panel" aria-label={t('encodeTitle', alphabet)}>
      <div className="panel-header">
        <h2>{t('encodeTitle', alphabet)}</h2>
        <p>{t('encodeDescription', alphabet)}</p>
      </div>

      <label htmlFor="encode-input" className="sr-only">
        {t('textToEncode', alphabet)}
      </label>
      <input
        id="encode-input"
        type="text"
        className="text-input"
        value={text}
        onChange={(event) => setText(event.target.value)}
        placeholder={alphabet === 'hangul' ? t('placeholderHangul', alphabet) : t('placeholderEnglish', alphabet)}
        aria-label={t('textToEncode', alphabet)}
      />

      <button
        className="btn primary play-button"
        onClick={handlePlayAll}
        disabled={encoded.length === 0}
      >
        {t('playAll', alphabet)}
      </button>

      <div className="encoded-output" aria-live="polite">
        {encoded.length === 0 ? (
          <p className="empty-hint">{t('emptyHint', alphabet)}</p>
        ) : (
          <ul className="encoded-char-list">
            {encoded.map((item, index) => (
              <li key={`${item.symbol}-${index}`} className="encoded-char">
                <span className="encoded-symbol">{item.symbol}</span>
                <span className="encoded-code">
                  {item.entry !== null ? formatSignals(item.entry.code) : '?'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
