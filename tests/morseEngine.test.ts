import { describe, expect, it } from 'vitest'
import { createMorseEngine } from '../src/core/morse/MorseEngine'

const engine = createMorseEngine()

describe('MorseEngine', () => {
  it('encodes A to dot-dash', () => {
    expect(engine.encode('A', 'english')).toEqual({
      symbol: 'A',
      code: ['.', '-'],
      label: 'A',
    })
  })

  it('encodes lowercase a same as uppercase A', () => {
    expect(engine.encode('a', 'english')).toEqual({
      symbol: 'A',
      code: ['.', '-'],
      label: 'A',
    })
  })

  it('encodes 1 to the correct digit code', () => {
    expect(engine.encode('1', 'english')).toEqual({
      symbol: '1',
      code: ['.', '-', '-', '-', '-'],
      label: '1',
    })
  })

  it('decodes dot-dash to A', () => {
    const result = engine.decode(['.', '-'], 'english')
    expect(result.code).toEqual(['.', '-'])
    expect(result.entry).not.toBeNull()
    expect(result.entry?.symbol).toBe('A')
  })

  it('returns null entry for unknown code', () => {
    expect(engine.decode(['.', '-', '.', '-', '.', '-', '.'], 'english').entry).toBeNull()
  })

  it('encodes hangul consonant ㄱ', () => {
    expect(engine.encode('ㄱ', 'hangul')).toEqual({
      symbol: 'ㄱ',
      code: ['.', '-', '.'],
      label: '기역',
    })
  })

  it('builds a tree with dot and dash children at root', () => {
    const tree = engine.getTree('english')
    expect(tree.dot).toBeDefined()
    expect(tree.dash).toBeDefined()
  })

  it('places english entries at correct tree positions', () => {
    const tree = engine.getTree('english')
    expect(tree.dot?.entry?.symbol).toBe('E')
    expect(tree.dash?.entry?.symbol).toBe('T')
    expect(tree.dot?.dash?.entry?.symbol).toBe('A')
    expect(tree.dash?.dot?.entry?.symbol).toBe('N')
  })
})
