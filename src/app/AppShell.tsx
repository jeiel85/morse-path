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
        <a
          className="repo-link"
          href="https://github.com/jeiel85/morse-path"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub repository (opens in a new tab)"
        >
          <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>
          GitHub
        </a>
      </footer>
    </div>
  )
}
