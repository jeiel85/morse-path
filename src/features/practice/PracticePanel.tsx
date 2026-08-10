import { useState, useCallback, useEffect } from 'react'
import { t } from '../../ui/copy'
import type { MorseAlphabet, MorseCode, MorseEntry } from '../../core/morse/types'
import { ENGLISH_MORSE_ENTRIES, HANGUL_MORSE_ENTRIES } from '../../core/morse'
import type { MorseAudio } from '../../audio'

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

function getRandomEntry(alphabet: MorseAlphabet): MorseEntry {
  const entries = alphabet === 'hangul' ? HANGUL_MORSE_ENTRIES : ENGLISH_MORSE_ENTRIES
  const index = Math.floor(Math.random() * entries.length)
  const entry = entries[index]
  if (entry === undefined) {
    throw new Error(`No entries for alphabet ${alphabet}`)
  }
  return entry
}

export function PracticePanel({
  alphabet,
  audio,
  wpm = 15,
}: {
  alphabet: MorseAlphabet
  audio: MorseAudio
  wpm?: number
}) {
  const [current, setCurrent] = useState<MorseEntry>(() => getRandomEntry(alphabet))
  const [input, setInput] = useState('')
  const [feedback, setFeedback] = useState<'idle' | 'correct' | 'wrong'>('idle')
  const [score, setScore] = useState({ correct: 0, total: 0 })

  const next = useCallback(() => {
    setCurrent(getRandomEntry(alphabet))
    setInput('')
    setFeedback('idle')
  }, [alphabet])

  const replay = useCallback(() => {
    playSignals(audio, current.code, wpm)
  }, [audio, current, wpm])

  const check = useCallback(() => {
    const normalizedInput = input.trim()
    const isCorrect = normalizedInput === current.symbol
    setFeedback(isCorrect ? 'correct' : 'wrong')
    setScore((prev) => ({
      correct: prev.correct + (isCorrect ? 1 : 0),
      total: prev.total + 1,
    }))
  }, [input, current])

  useEffect(() => {
    playSignals(audio, current.code, wpm)
  }, [audio, current, wpm])

  useEffect(() => {
    setCurrent(getRandomEntry(alphabet))
    setInput('')
    setFeedback('idle')
    setScore({ correct: 0, total: 0 })
  }, [alphabet])

  const feedbackText =
    feedback === 'idle'
      ? '\u00A0'
      : feedback === 'correct'
        ? `${t('correct', alphabet)} ${current.symbol} ${t('equals', alphabet)} ${formatSignals(current.code)}`
        : `${t('wrong', alphabet)} ${current.symbol} ${t('equals', alphabet)} ${formatSignals(current.code)}`

  return (
    <section className="feature-panel practice-panel" aria-label={t('practiceTitle', alphabet)}>
      <div className="panel-header">
        <h2>{t('practiceTitle', alphabet)}</h2>
        <p>{t('practiceDescription', alphabet)}</p>
      </div>

      <div className={`practice-card ${feedback}`}>
        <div className="score" aria-live="polite">
          {t('score', alphabet)} {score.correct}/{score.total}
        </div>

        <label htmlFor="practice-input" className="sr-only">
          {t('yourAnswer', alphabet)}
        </label>
        <input
          id="practice-input"
          type="text"
          className="text-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              check()
            }
          }}
          placeholder={t('typeTheCharacter', alphabet)}
          aria-label={t('yourAnswer', alphabet)}
        />

        <div className="feedback" aria-live="polite">
          {feedbackText}
        </div>

        <div className="button-row">
          <button className="btn secondary" onClick={replay}>
            {t('replay', alphabet)}
          </button>
          <button className="btn primary" onClick={check}>
            {t('check', alphabet)}
          </button>
          <button className="btn secondary" onClick={next}>
            {t('next', alphabet)}
          </button>
        </div>
      </div>
    </section>
  )
}
