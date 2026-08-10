import { useState, useCallback, useEffect } from 'react'
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

  return (
    <section className="feature-panel practice-panel" aria-label="Practice">
      <div className="panel-header">
        <h2>Practice</h2>
        <p>Listen to the code and type the character you hear.</p>
      </div>

      <div className={`practice-card ${feedback}`}>
        <div className="score" aria-live="polite">
          Score: {score.correct}/{score.total}
        </div>

        <label htmlFor="practice-input" className="sr-only">
          Your answer
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
          placeholder="Type the character"
          aria-label="Your answer"
        />

        <div className="feedback" aria-live="polite">
          {feedback === 'idle' && '\u00A0'}
          {feedback === 'correct' && `Correct! ${current.symbol} = ${formatSignals(current.code)}`}
          {feedback === 'wrong' && `Wrong. The answer was ${current.symbol} = ${formatSignals(current.code)}`}
        </div>

        <div className="button-row">
          <button className="btn secondary" onClick={replay}>
            Replay
          </button>
          <button className="btn primary" onClick={check}>
            Check
          </button>
          <button className="btn secondary" onClick={next}>
            Next
          </button>
        </div>
      </div>
    </section>
  )
}
