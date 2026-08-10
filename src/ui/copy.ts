import type { MorseAlphabet } from '../core/morse/types'

export type Lang = 'en' | 'ko'

export function langForAlphabet(alphabet: MorseAlphabet): Lang {
  return alphabet === 'hangul' ? 'ko' : 'en'
}

export function t(key: keyof typeof COPY, alphabet: MorseAlphabet): string {
  const lang = langForAlphabet(alphabet)
  const value = COPY[key]
  return value[lang]
}

const ko = {
  decode: '\ud574\ub3c9',
  decodeResult: '\ud574\ub3c9 \uacb0\uacfc',
  decodeVerb: '\ud574\ub3c9\ud558\uc138\uc694',
  press: '\ub204\ub974\uba74',
}

const COPY = {
  // AppShell / shared
  appTitle: { en: 'MorsePath', ko: '모스경로' },
  modes: { en: 'Modes', ko: '메뉴' },
  modeExplore: { en: 'Explore', ko: '탐색' },
  modeDecode: { en: 'Decode', ko: ko.decode },
  modeEncode: { en: 'Encode', ko: '인코딩' },
  modePractice: { en: 'Practice', ko: '연습' },
  modeKeyer: { en: 'Keyer', ko: '키어' },
  alphabetToggleLabel: { en: 'Current alphabet is {alphabet}. Toggle alphabet.', ko: '현재 자모는 {alphabet}입니다. 자모를 전환하세요.' },
  alphabetEnglish: { en: 'English', ko: 'English' },
  alphabetHangul: { en: 'Hangul', ko: '한국어' },
  wpm: { en: 'WPM', ko: 'WPM' },
  volume: { en: 'Volume', ko: '음량' },

  // Explore
  exploreTitle: { en: 'Explore', ko: '탐색' },
  exploreDescription: { en: 'Select a node in the tree or use arrow keys to discover Morse code.', ko: '트리의 노드를 선택하거나 화살표 키로 모스 부호를 탐색하세요.' },
  selectTreeNode: { en: 'Select a tree node', ko: '트리 노드를 선택하세요' },
  playCode: { en: 'Play code', ko: '부호 재생' },
  keyboardHint: { en: '← dot · → dash · Enter play · Backspace up', ko: '← 점 · → 선 · Enter 재생 · Backspace 위로' },
  characterAriaLabel: { en: 'Character', ko: '문자' },
  morseCodeAriaLabel: { en: 'Morse code', ko: '모스 부호' },

  // Decode
  decodeTitle: { en: 'Decode', ko: ko.decode },
  decodeDescription: { en: 'Enter dots and dashes to decode Morse code into text.', ko: `점과 선을 입력해 모스 부호를 텍스트로 ${ko.decodeVerb}.` },
  enterMorseCode: { en: 'Enter Morse code', ko: '모스 부호 입력' },
  dot: { en: 'Dot', ko: '점' },
  dash: { en: 'Dash', ko: '선' },
  clear: { en: 'Clear', ko: '지우기' },
  play: { en: 'Play', ko: '재생' },
  submitSpace: { en: 'Submit (space)', ko: '확인 (스페이스)' },
  decodedText: { en: 'Decoded text', ko: ko.decodeResult },

  // Encode
  encodeTitle: { en: 'Encode', ko: '인코딩' },
  encodeDescription: { en: 'Type text to see its Morse encoding.', ko: '텍스트를 입력하면 모스 부호로 변환됩니다.' },
  textToEncode: { en: 'Text to encode', ko: '변환할 텍스트' },
  placeholderHangul: { en: 'Type Hangul or text', ko: '한글 또는 텍스트 입력' },
  placeholderEnglish: { en: 'Type text to encode', ko: '변환할 텍스트 입력' },
  playAll: { en: 'Play all', ko: '전체 재생' },
  emptyHint: { en: 'Start typing to see Morse code.', ko: '입력을 시작하면 모스 부호가 표시됩니다.' },

  // Practice
  practiceTitle: { en: 'Practice', ko: '연습' },
  practiceDescription: { en: 'Listen to the code and type the character you hear.', ko: '부호를 듣고 들린 문자를 입력하세요.' },
  yourAnswer: { en: 'Your answer', ko: '내 답변' },
  typeTheCharacter: { en: 'Type the character', ko: '문자를 입력하세요' },
  score: { en: 'Score:', ko: '점수:' },
  correct: { en: 'Correct!', ko: '정답!' },
  wrong: { en: 'Wrong. The answer was', ko: '오답. 정답은' },
  equals: { en: '=', ko: '=' },
  replay: { en: 'Replay', ko: '다시 듣기' },
  check: { en: 'Check', ko: '확인' },
  next: { en: 'Next', ko: '다음' },

  // Keyer
  keyerTitle: { en: 'Keyer', ko: '키어' },
  keyerDescription: { en: 'Tap for dot, hold for dash. Pause to finish a character.', ko: `짧게 ${ko.press} 점, 길게 ${ko.press} 선입니다. 문자를 마치려면 잠시 멈추세요.` },
  keyerPadLabel: { en: 'Morse keyer. Short tap for dot, long hold for dash.', ko: `모스 키어. 짧게 탭하면 점, 길게 ${ko.press} 선입니다.` },
  tapOrHold: { en: 'Tap or hold', ko: '탭하거나 길게 누르세요' },
  decodedTextKeyer: { en: 'Decoded text', ko: ko.decodeResult },

  // MorseTree
  morseTreeTitle: { en: 'Morse tree', ko: '모스 트리' },
  morseTreeAria: { en: 'Interactive Morse tree for {alphabet} alphabet', ko: '{alphabet} 자모용 상호작용 모스 트리' },
  start: { en: 'Start', ko: '시작' },
  morseCode: { en: 'Morse code', ko: '모스 부호' },
} as const

export function format(key: keyof typeof COPY, alphabet: MorseAlphabet, replacements?: Record<string, string>): string {
  let value = t(key, alphabet)
  if (replacements) {
    for (const [token, replacement] of Object.entries(replacements)) {
      value = value.replaceAll(`{${token}}`, replacement)
    }
  }
  return value
}
