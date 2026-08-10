import { useState, useCallback, useEffect } from 'react'
import { MorseTree } from '../../components/MorseTree/MorseTree'
import { t } from '../../ui/copy'
import type { MorseAlphabet, MorseCode } from '../../core/morse/types'
import { createMorseEngine } from '../../core/morse/MorseEngine'
import type { MorseAudio } from '../../audio'

const engine = createMorseEngine()

function formatSignals(signals: MorseCode): string {
  return signals.map((signal) => (signal === '-' ? '−' : '·')).join(' ')
}

function playSignals(audio: MorseAudio, signals: MorseCode, wpm: number): void {
  if (signals.length === 0) {
    return
  }
  void audio.resume()
  const dotMs = 1200 / wpm
  let time = 0
  for (const signal of signals) {
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
}

export function ExplorePanel({
  alphabet,
  audio,
  wpm = 15,
}: {
  alphabet: MorseAlphabet
  audio: MorseAudio
  wpm?: number
}) {
  const [code, setCode] = useState<MorseCode>([])
  const decoded = engine.decode(code, alphabet).entry

  const handleNodeSelect = useCallback(
    (selected: MorseCode) => {
      setCode(selected)
      playSignals(audio, selected, wpm)
    },
    [audio, wpm],
  )

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        setCode((prev) => [...prev, '.'])
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        setCode((prev) => [...prev, '-'])
      } else if (event.key === 'Backspace') {
        event.preventDefault()
        setCode((prev) => prev.slice(0, -1))
      } else if (event.key === 'Enter') {
        event.preventDefault()
        playSignals(audio, code, wpm)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [audio, code, wpm])

  return (
    <section className="feature-panel explore-panel" aria-label={t('exploreTitle', alphabet)}>
      <div className="panel-header">
        <h2>{t('exploreTitle', alphabet)}</h2>
        <p>{t('exploreDescription', alphabet)}</p>
      </div>

      <div className="explore-display" aria-live="polite">
        {decoded !== null && decoded !== undefined ? (
          <div className="character-card">
            <span className="character-symbol" aria-label={t('characterAriaLabel', alphabet)}>
              {decoded.symbol}
            </span>
            <span className="character-label">{decoded.label}</span>
            <span className="character-code" aria-label={t('morseCodeAriaLabel', alphabet)}>
              {formatSignals(decoded.code)}
            </span>
          </div>
        ) : (
          <div className="character-card empty">
            {code.length > 0 ? formatSignals(code) : t('selectTreeNode', alphabet)}
          </div>
        )}
      </div>

      <button
        className="btn secondary play-button"
        onClick={() => playSignals(audio, code, wpm)}
        disabled={code.length === 0}
      >
        {t('playCode', alphabet)}
      </button>

      <MorseTree alphabet={alphabet} activeCode={code} onNodeSelect={handleNodeSelect} />

      <p className="keyboard-hint">
        {t('keyboardHint', alphabet)}
      </p>
    </section>
  )
}
