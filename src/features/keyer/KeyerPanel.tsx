import { useState, useCallback, useEffect, useRef } from 'react'
import type { MorseAlphabet, MorseCode } from '../../core/morse/types'
import { createMorseEngine } from '../../core/morse/MorseEngine'
import type { MorseAudio } from '../../audio'

const engine = createMorseEngine()

const DASH_THRESHOLD_MS = 250

function formatSignals(signals: MorseCode): string {
  return signals.map((signal) => (signal === '-' ? '−' : '·')).join(' ')
}

export function KeyerPanel({
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
  const [isPressed, setIsPressed] = useState(false)
  const [pressDuration, setPressDuration] = useState(0)
  const pressStartRef = useRef<number>(0)
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  const dotMs = 1200 / wpm
  const characterPauseMs = dotMs * 3

  const submitCharacter = useCallback(() => {
    setSignals((prev) => {
      const result = engine.decode(prev, alphabet)
      if (result.entry !== null) {
        setOutput((out) => out + result.entry!.symbol)
      }
      return []
    })
  }, [alphabet])

  const updatePressDuration = useCallback(() => {
    setPressDuration(performance.now() - pressStartRef.current)
    rafRef.current = requestAnimationFrame(updatePressDuration)
  }, [])

  const startPress = useCallback(() => {
    if (pauseTimerRef.current !== null) {
      clearTimeout(pauseTimerRef.current)
      pauseTimerRef.current = null
    }
    void audio.resume()
    setIsPressed(true)
    pressStartRef.current = performance.now()
    setPressDuration(0)
    rafRef.current = requestAnimationFrame(updatePressDuration)
  }, [audio, updatePressDuration])

  const endPress = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }

    const duration = performance.now() - pressStartRef.current
    setIsPressed(false)
    setPressDuration(duration)

    const signal = duration >= DASH_THRESHOLD_MS ? '-' : '.'
    setSignals((prev) => [...prev, signal])

    if (pauseTimerRef.current !== null) {
      clearTimeout(pauseTimerRef.current)
    }
    pauseTimerRef.current = setTimeout(() => {
      submitCharacter()
    }, characterPauseMs)
  }, [characterPauseMs, submitCharacter])

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current !== null) {
        clearTimeout(pauseTimerRef.current)
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.code === 'Space' && !isPressed && !event.repeat) {
        event.preventDefault()
        startPress()
      }
    }

    function onKeyUp(event: KeyboardEvent) {
      if (event.code === 'Space' && isPressed) {
        event.preventDefault()
        endPress()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [isPressed, startPress, endPress])

  const decoded = engine.decode(signals, alphabet).entry
  const feedbackSymbol = isPressed
    ? (pressDuration >= DASH_THRESHOLD_MS ? '−' : '·')
    : (decoded?.symbol ?? (signals.length > 0 ? '?' : ''))

  return (
    <section className="feature-panel keyer-panel" aria-label="Keyer">
      <div className="panel-header">
        <h2>Keyer</h2>
        <p>Tap for dot, hold for dash. Pause to finish a character.</p>
      </div>

      <button
        type="button"
        className={`keyer-pad ${isPressed ? 'pressed' : ''}`}
        aria-label="Morse keyer. Short tap for dot, long hold for dash."
        onPointerDown={startPress}
        onPointerUp={endPress}
        onPointerLeave={isPressed ? endPress : undefined}
        onPointerCancel={isPressed ? endPress : undefined}
      >
        <span
          className="keyer-feedback"
          style={{ transform: `scale(${Math.min(1 + pressDuration / 400, 2)})` }}
          aria-hidden="true"
        >
          {feedbackSymbol || 'Tap or hold'}
        </span>
      </button>

      <div className="signal-display" aria-live="polite">
        {signals.length > 0 ? formatSignals(signals) : '\u00A0'}
      </div>

      <div className="decoded-preview" aria-live="polite">
        {decoded?.symbol ?? '?'}
      </div>

      <div className="output-area">
        <label htmlFor="keyer-output">Decoded text</label>
        <output id="keyer-output">{output}</output>
      </div>
    </section>
  )
}
