import { useMemo, useState, useEffect, useCallback } from 'react'
import { ExplorePanel } from '../features/explore/ExplorePanel'
import { DecodePanel } from '../features/decode/DecodePanel'
import { EncodePanel } from '../features/encode/EncodePanel'
import { PracticePanel } from '../features/practice/PracticePanel'
import { KeyerPanel } from '../features/keyer/KeyerPanel'
import { createMorseAudio } from '../audio'
import { loadSettings, saveSettings, type AppSettings } from '../settings'
import { format, t } from '../ui/copy'
import type { MorseAlphabet } from '../core/morse/types'
import '../styles/app.css'

export type AppMode = 'explore' | 'decode' | 'encode' | 'practice' | 'keyer'

interface ModeDef {
  id: AppMode
  key: 'modeExplore' | 'modeDecode' | 'modeEncode' | 'modePractice' | 'modeKeyer'
}

const MODES: ModeDef[] = [
  { id: 'explore', key: 'modeExplore' },
  { id: 'decode', key: 'modeDecode' },
  { id: 'encode', key: 'modeEncode' },
  { id: 'practice', key: 'modePractice' },
  { id: 'keyer', key: 'modeKeyer' },
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

  useEffect(() => {
    document.documentElement.lang = settings.alphabet === 'hangul' ? 'ko' : 'en'
    document.title = format('appTitle', settings.alphabet)
  }, [settings.alphabet])

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

  const alphabetDisplay = settings.alphabet === 'english' ? t('alphabetEnglish', settings.alphabet) : t('alphabetHangul', settings.alphabet)

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="" width={32} height={32} />
          <span>{t('appTitle', settings.alphabet)}</span>
        </div>
        <div className="header-controls">
          <button
            type="button"
            className="alphabet-toggle"
            onClick={toggleAlphabet}
            aria-label={format('alphabetToggleLabel', settings.alphabet, { alphabet: alphabetDisplay })}
          >
            {alphabetDisplay}
          </button>
        </div>
      </header>

      <nav className="mode-tabs" role="tablist" aria-label={t('modes', settings.alphabet)}>
        {MODES.map((m) => (
          <button
            key={m.id}
            type="button"
            role="tab"
            aria-selected={mode === m.id}
            className={`mode-tab ${mode === m.id ? 'active' : ''}`}
            onClick={() => setMode(m.id)}
          >
            {t(m.key, settings.alphabet)}
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
          {t('wpm', settings.alphabet)}
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
          {t('volume', settings.alphabet)}
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
