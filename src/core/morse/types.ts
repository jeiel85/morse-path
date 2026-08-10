export type MorseSignal = '.' | '-'

export type MorseCode = readonly MorseSignal[]

export type MorseAlphabet = 'english' | 'hangul'

export interface MorseEntry {
  readonly symbol: string
  readonly code: MorseCode
  readonly label?: string
}

export interface MorseNode {
  readonly entry?: MorseEntry
  readonly dot?: MorseNode
  readonly dash?: MorseNode
}

export interface MorseDecodeResult {
  readonly code: MorseCode
  readonly entry: MorseEntry | null
}

export interface MorseEngine {
  decode(code: MorseCode, alphabet: MorseAlphabet): MorseDecodeResult
  encode(symbol: string, alphabet: MorseAlphabet): MorseEntry | null
  getTree(alphabet: MorseAlphabet): MorseNode
}
