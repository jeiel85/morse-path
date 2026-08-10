import { useState, useCallback, useEffect } from 'react'
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

export function DecodePanel({
  alphabet,
  audio,
  wpm = 15,
}: {
  alphabet: MorseAlphabet
  audio: MorseAudio
  wpm?: number
}) {
  const [signals, setSignals] = useState<MorseCode>([])
  const [output, setOutput] = useState('')
  const decoded = engine.decode(signals, alphabet).entry

  const addSignal = useCallback((signal: '.' | '-') => {
    setSignals((prev) => [...prev, signal])
  }, [])

  const clear = useCallback(() => {
    setSignals([])
  }, [])

  const submit = useCallback(() => {
    setOutput((prev) => prev + (decoded?.symbol ?? ''))
    setSignals([])
  }, [decoded])

  const handlePlay = useCallback(() => {
    playSignals(audio, signals, wpm)
  }, [audio, signals, wpm])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === ' ') {
        event.preventDefault()
        submit()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [submit])

  return (
    <section className="feature-panel decode-panel" aria-label={t('decodeTitle', alphabet)}>
      <div className="panel-header">
        <h2>{t('decodeTitle', alphabet)}</h2>
        <p>{t('decodeDescription', alphabet)}</p>
      </div>

      <div className="signal-display" aria-live="polite">
        {signals.length > 0 ? formatSignals(signals) : t('enterMorseCode', alphabet)}
      </div>

      <div className="decoded-preview" aria-live="polite">
        {decoded?.symbol ?? '?'}
      </div>

      <div className="button-row">
        <button className="btn primary" onClick={() => addSignal('.')} aria-label={t('dot', alphabet)}>
          · {t('dot', alphabet)}
        </button>
        <button className="btn primary" onClick={() => addSignal('-')} aria-label={t('dash', alphabet)}>
          − {t('dash', alphabet)}
        </button>
        <button className="btn secondary" onClick={clear}>
          {t('clear', alphabet)}
        </button>
        <button className="btn secondary" onClick={handlePlay} disabled={signals.length === 0}>
          {t('play', alphabet)}
        </button>
        <button className="btn primary" onClick={submit}>
          {t('submitSpace', alphabet)}
        </button>
      </div>

      <div className="output-area">
        <label htmlFor="decode-output">{t('decodedText', alphabet)}</label>
        <output id="decode-output">{output}</output>
      </div>
    </section>
  )
}
