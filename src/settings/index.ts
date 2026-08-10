export interface AppSettings {
  readonly version: 1
  readonly alphabet: 'english' | 'hangul'
  readonly wpm: number
  readonly volume: number
  readonly toneFrequency: number
  readonly theme: 'dark'
}

const STORAGE_KEY = 'morse-path-settings'

export function getDefaultSettings(): AppSettings {
  return {
    version: 1,
    alphabet: 'english',
    wpm: 15,
    volume: 0.7,
    toneFrequency: 600,
    theme: 'dark',
  }
}

function isValidSettings(value: unknown): value is AppSettings {
  if (typeof value !== 'object' || value === null) {
    return false
  }
  const candidate = value as Partial<AppSettings>
  return (
    candidate.version === 1 &&
    (candidate.alphabet === 'english' || candidate.alphabet === 'hangul') &&
    typeof candidate.wpm === 'number' &&
    typeof candidate.volume === 'number' &&
    typeof candidate.toneFrequency === 'number' &&
    candidate.theme === 'dark'
  )
}

function clampSettings(settings: AppSettings): AppSettings {
  return {
    version: 1,
    alphabet: settings.alphabet,
    wpm: Math.max(5, Math.min(30, settings.wpm)),
    volume: Math.max(0, Math.min(1, settings.volume)),
    toneFrequency: Math.max(300, Math.min(900, settings.toneFrequency)),
    theme: 'dark',
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return getDefaultSettings()
    }
    const parsed = JSON.parse(raw) as unknown
    if (!isValidSettings(parsed)) {
      return getDefaultSettings()
    }
    return clampSettings(parsed)
  } catch {
    return getDefaultSettings()
  }
}

export function saveSettings(settings: AppSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(clampSettings(settings)))
  } catch {
    // Storage may be unavailable or full; leave current session unchanged.
  }
}
