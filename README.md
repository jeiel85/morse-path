# MorsePath

MorsePath is an interactive Morse-learning app centered on a visual dot/dash tree. It supports English and Hangul alphabets, live encode/decode, audio playback, practice drills, and a tap-and-hold keyer.

## Current scope

- React, TypeScript, and Vite application shell
- English and Hangul Morse mappings with a stateless engine
- Interactive SVG Morse tree with keyboard/touch navigation
- Explore, Decode, Encode, Practice, and Keyer modes
- Web Audio adapter for dot/dash playback
- Versioned local settings (WPM, volume, tone frequency, alphabet)
- PWA manifest, service worker, and offline caching
- GitHub Actions CI and GitHub Pages deployment
- Responsive dark-themed UI with accessibility focus states

Capacitor Android integration is the remaining platform target.

## Architecture

```text
src/
├─ app/                    Application shell and top-level mode state
├─ core/
│  ├─ morse/              Morse types, mapping data, and engine
│  └─ hangul/             Hangul composition/decomposition
├─ audio/                  Web Audio adapter for Morse tones
├─ components/MorseTree/  Interactive SVG Morse tree
├─ features/               Product workflows by mode
├─ settings/               Versioned local preferences
└─ styles/                 Shared presentation
public/                    Static assets, PWA manifest, and service worker
tests/                     Unit tests for engine and Hangul composer
.github/workflows/         CI and GitHub Pages deployment
```

The core modules stay independent from React so they can be tested directly and reused by a future Capacitor shell. Browser-specific concerns live behind adapters such as `src/audio` and settings persistence.

## Run locally

```sh
npm install
npm run dev
```

Validate the build, tests, and lint:

```sh
npm run build
npm test
npm run lint
```

## Deployment

The repository is configured to deploy to GitHub Pages from the `main` branch via `.github/workflows/deploy.yml`. The Vite base path is set to `/morse-path/` for this deployment target.

## Next work order

1. ✅ Confirm authoritative English and Korean Morse standards and add validated mappings.
2. ✅ Implement and unit-test the stateless Morse engine and tree construction.
3. ✅ Implement and unit-test Hangul composition/decomposition behavior.
4. ✅ Build the interactive SVG tree and Explore workflow with accessible keyboard/touch input.
5. ✅ Add Decode and Encode, followed by Practice and Keyer.
6. ✅ Add a Web Audio adapter and versioned local settings.
7. ✅ Add PWA manifest/service worker and offline verification.
8. ✅ Add CI and GitHub Pages deployment with the correct Vite base path.
9. ⬜ Add Capacitor Android after the web experience is stable.
