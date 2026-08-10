import type { MorseSignal } from '../core/morse/types'

export interface MorseAudio {
  playDot(): void
  playDash(): void
  setVolume(v: number): void
  setWpm(wpm: number): void
  setFrequency(hz: number): void
  resume(): Promise<void>
}

interface WebAudioContextConstructor {
  new (): AudioContext
}

export function createMorseAudio(): MorseAudio {
  const Ctor = (
    window.AudioContext ??
    (window as typeof window & { webkitAudioContext?: WebAudioContextConstructor }).webkitAudioContext
  )

  if (Ctor === undefined) {
    return createNoopAudio()
  }

  const ctx = new Ctor()
  let volume = 0.7
  let wpm = 15
  let frequency = 600

  async function ensureResumed(): Promise<void> {
    if (ctx.state === 'suspended') {
      await ctx.resume()
    }
  }

  function playSignal(signal: MorseSignal): void {
    void ensureResumed()
    const dotMs = 1200 / wpm
    const durationMs = signal === '-' ? dotMs * 3 : dotMs
    const durationSec = Math.max(durationMs / 1000, 0.01)
    const attack = Math.min(0.005, durationSec / 3)
    const release = Math.min(0.005, durationSec / 3)

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.value = frequency
    osc.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    const t0 = now
    const t1 = now + attack
    const t2 = now + Math.max(attack, durationSec - release)
    const t3 = now + durationSec

    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(volume, t1)
    gain.gain.setValueAtTime(volume, t2)
    gain.gain.linearRampToValueAtTime(0, t3)

    osc.start(t0)
    osc.stop(t3)

    setTimeout(() => {
      osc.disconnect()
      gain.disconnect()
    }, Math.ceil(durationMs + 100))
  }

  return {
    playDot() {
      playSignal('.')
    },
    playDash() {
      playSignal('-')
    },
    setVolume(v) {
      volume = Math.max(0, Math.min(1, v))
    },
    setWpm(w) {
      wpm = Math.max(1, w)
    },
    setFrequency(hz) {
      frequency = Math.max(100, Math.min(2000, hz))
    },
    resume() {
      return ensureResumed()
    },
  }
}

function createNoopAudio(): MorseAudio {
  return {
    playDot() {},
    playDash() {},
    setVolume() {},
    setWpm() {},
    setFrequency() {},
    resume() {
      return Promise.resolve()
    },
  }
}
