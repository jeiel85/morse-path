import type { MorseAlphabet, MorseCode, MorseDecodeResult, MorseEngine, MorseEntry, MorseNode } from './types'
import { ENGLISH_MORSE_ENTRIES } from './english.data'
import { HANGUL_MORSE_ENTRIES } from './hangul.data'

function getEntries(alphabet: MorseAlphabet): readonly MorseEntry[] {
  return alphabet === 'hangul' ? HANGUL_MORSE_ENTRIES : ENGLISH_MORSE_ENTRIES
}

type MutableMorseNode = {
  entry?: MorseEntry
  dot?: MutableMorseNode
  dash?: MutableMorseNode
}

function buildTree(entries: readonly MorseEntry[]): MorseNode {
  const root: MutableMorseNode = {}
  for (const entry of entries) {
    let node = root
    for (const signal of entry.code) {
      if (signal === '.') {
        node = node.dot ??= {}
      } else {
        node = node.dash ??= {}
      }
    }
    node.entry = entry
  }
  return root
}

export function createMorseEngine(): MorseEngine {
  const trees = new Map<MorseAlphabet, MorseNode>()

  function getTree(alphabet: MorseAlphabet): MorseNode {
    let tree = trees.get(alphabet)
    if (tree === undefined) {
      tree = buildTree(getEntries(alphabet))
      trees.set(alphabet, tree)
    }
    return tree
  }

  return {
    decode(code: MorseCode, alphabet: MorseAlphabet): MorseDecodeResult {
      let node = getTree(alphabet)
      for (const signal of code) {
        if (signal === '.') {
          node = node.dot ?? {}
        } else {
          node = node.dash ?? {}
        }
      }
      return { code, entry: node.entry ?? null }
    },

    encode(symbol: string, alphabet: MorseAlphabet): MorseEntry | null {
      const normalized = alphabet === 'english' ? symbol.toUpperCase() : symbol
      const entry = getEntries(alphabet).find((e) => e.symbol === normalized)
      return entry ?? null
    },

    getTree,
  }
}
