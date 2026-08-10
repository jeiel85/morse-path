import { useMemo, useState, useEffect, useCallback } from 'react'
import { ExplorePanel } from '../features/explore/ExplorePanel'
import { DecodePanel } from '../features/decode/DecodePanel'
import { EncodePanel } from '../features/encode/EncodePanel'
import { PracticePanel } from '../features/practice/PracticePanel'
import { KeyerPanel } from '../features/keyer/KeyerPanel'
import { createMorseAudio } from '../audio'
import { loadSettings, saveSettings, type AppSettings } from '../settings'
import type { MorseAlphabet } from '../core/morse/types'
import '../styles/app.css'

export type AppMode = 'explore' | 'decode' | 'encode' | 'practice' | 'keyer'

interface ModeDef {
  id: AppMode
  label: string
}

const MODES: ModeDef[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'decode', label: 'Decode' },
  { id: 'encode', label: 'Encode' },
  { id: 'practice', label: 'Practice' },
  { id: 'keyer', label: 'Keyer' },
]

export function AppShell() {
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())
  const [mode, setMode] = useState<AppMode>('explore')

  const audio = useMemo(() => createMorseAudio(), [])

  useEffect(() => {
    audio.setWpm(settings.wpm)
    audio.setVolume(settings.volume)
    audio.setFrequency(settings.toneFrequency)
  }, [audio, settings])

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch }
      saveSettings(next)
      return next
    })
  }, [])

  const toggleAlphabet = useCallback(() => {
    updateSettings({
      alphabet: settings.alphabet === 'english' ? 'hangul' : 'english',
    })
  }, [settings.alphabet, updateSettings])

  const panelProps = {
    alphabet: settings.alphabet as MorseAlphabet,
    audio,
    wpm: settings.wpm,
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src="/favicon.svg" alt="" width={32} height={32} />
          <span>MorsePath</span>
        </div>
        <div className="header-controls">
          <button
            type="button"
            className="alphabet-toggle"
            onClick={toggleAlphabet}
            aria-label={`Current alphabet is ${settings.alphabet}. Toggle alphabet.`}
          >
            {settings.alphabet === 'english' ? 'English' : 'Hangul'}
          </button>
        </div>
      </header>

      <nav className="mode-tabs" role="tablist" aria-label="Mode">
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`mode-tab ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {m.label}
          </button>
        ))}
      </nav>

      <main className="app-main">
        {mode === 'explore' && <ExplorePanel {...panelProps} />}
        {mode === 'decode' && <DecodePanel {...panelProps} />}
        {mode === 'encode' && <EncodePanel {...panelProps} />}
        {mode === 'practice' && <PracticePanel {...panelProps} />}
        {mode === 'keyer' && <KeyerPanel {...panelProps} />}
      </main>

      <footer className="app-footer">
        <label className="settings-control">
          WPM
          <input
            type="range"
            min={5}
            max={30}
            value={settings.wpm}
            onChange={(event) => updateSettings({ wpm: Number(event.target.value) })}
          />
          <span>{settings.wpm}</span>
        </label>
        <label className="settings-control">
          Volume
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(settings.volume * 100)}
            onChange={(event) =>
              updateSettings({ volume: Number(event.target.value) / 100 })
            }
          />
          <span>{Math.round(settings.volume * 100)}%</span>
        </label>
      </footer>
    </div>
  )
}
