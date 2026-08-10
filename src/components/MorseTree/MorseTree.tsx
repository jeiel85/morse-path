import { useMemo, useCallback } from 'react'
import type { MorseAlphabet, MorseCode, MorseEntry, MorseNode } from '../../core/morse/types'
import { createMorseEngine } from '../../core/morse/MorseEngine'

const MAX_DEPTH = 5
const VIEWBOX_WIDTH = 1400
const VIEWBOX_HEIGHT = 360
const ROOT_X = VIEWBOX_WIDTH / 2
const ROOT_Y = 48
const Y_STEP = 56
const SPREAD = 720
const NODE_RADIUS = 14

const engine = createMorseEngine()

export interface MorseTreeProps {
  readonly alphabet: MorseAlphabet
  readonly activeCode?: MorseCode
  readonly onNodeSelect?: (code: MorseCode) => void
}

interface TreeNodeInfo {
  code: MorseCode
  x: number
  y: number
  entry?: MorseEntry
  children: TreeNodeInfo[]
}

function buildTreeNodes(
  node: MorseNode,
  code: MorseCode,
  depth: number,
  x: number,
  y: number,
): TreeNodeInfo {
  const info: TreeNodeInfo = { code: [...code], x, y, entry: node.entry, children: [] }

  if (depth >= MAX_DEPTH) {
    return info
  }

  const offset = SPREAD / Math.pow(2, depth + 1)

  if (node.dot !== undefined) {
    const child = buildTreeNodes(node.dot, [...code, '.'], depth + 1, x - offset, y + Y_STEP)
    info.children.push(child)
  }

  if (node.dash !== undefined) {
    const child = buildTreeNodes(node.dash, [...code, '-'], depth + 1, x + offset, y + Y_STEP)
    info.children.push(child)
  }

  return info
}

function isCodePrefix(prefix: MorseCode, full: MorseCode): boolean {
  if (prefix.length > full.length) {
    return false
  }
  return prefix.every((signal, index) => signal === full[index])
}

function nodeLabel(node: TreeNodeInfo, alphabet: MorseAlphabet): string {
  if (node.entry !== undefined) {
    return `${node.entry.symbol}${node.entry.label && node.entry.label !== node.entry.symbol ? ` (${node.entry.label})` : ''}`
  }
  if (node.code.length === 0) {
    return alphabet === 'hangul' ? 'Start' : 'Start'
  }
  return ''
}

function TreeNode({
  node,
  alphabet,
  activeCode,
  onNodeSelect,
}: {
  node: TreeNodeInfo
  alphabet: MorseAlphabet
  activeCode?: MorseCode
  onNodeSelect?: (code: MorseCode) => void
}) {
  const isActive = activeCode !== undefined && isCodePrefix(node.code, activeCode)

  const handleClick = useCallback(() => {
    onNodeSelect?.(node.code)
  }, [node.code, onNodeSelect])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<SVGGElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        onNodeSelect?.(node.code)
      }
    },
    [node.code, onNodeSelect],
  )

  const label = nodeLabel(node, alphabet)
  const branchLabel = node.code.length > 0 ? (node.code[node.code.length - 1] === '-' ? '−' : '·') : ''

  return (
    <g className="tree-node-group">
      {node.children.map((child) => {
        const childActive = activeCode !== undefined && isCodePrefix(child.code, activeCode)
        return (
          <line
            key={`edge-${child.code.join('')}`}
            x1={node.x}
            y1={node.y}
            x2={child.x}
            y2={child.y}
            className={`tree-edge ${childActive ? 'active' : ''}`}
          />
        )
      })}
      {node.children.map((child) => (
        <TreeNode
          key={`node-${child.code.join('')}`}
          node={child}
          alphabet={alphabet}
          activeCode={activeCode}
          onNodeSelect={onNodeSelect}
        />
      ))}
      {node.code.length > 0 && (
        <text
          x={node.x}
          y={node.y - 22}
          className="tree-branch-label"
          textAnchor="middle"
        >
          {branchLabel}
        </text>
      )}
      <circle
        cx={node.x}
        cy={node.y}
        r={NODE_RADIUS}
        className={`tree-node ${isActive ? 'active' : ''}`}
        role="button"
        tabIndex={0}
        aria-label={label || `Morse code ${node.code.map((s) => (s === '-' ? 'dash' : 'dot')).join(' ')}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />
      {label !== '' && (
        <text x={node.x} y={node.y + 5} className="tree-node-label" textAnchor="middle">
          {node.entry?.symbol ?? ''}
        </text>
      )}
    </g>
  )
}

export function MorseTree({ alphabet, activeCode, onNodeSelect }: MorseTreeProps) {
  const root = useMemo(() => {
    const tree = engine.getTree(alphabet)
    return buildTreeNodes(tree, [], 0, ROOT_X, ROOT_Y)
  }, [alphabet])

  return (
    <section className="morse-tree" aria-labelledby="morse-tree-title">
      <h2 id="morse-tree-title" className="sr-only">
        Morse tree
      </h2>
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        role="img"
        aria-label={`Interactive Morse tree for ${alphabet === 'hangul' ? 'Hangul' : 'English'} alphabet`}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect
          x={1}
          y={1}
          width={VIEWBOX_WIDTH - 2}
          height={VIEWBOX_HEIGHT - 2}
          rx={16}
          className="tree-frame"
        />
        <TreeNode node={root} alphabet={alphabet} activeCode={activeCode} onNodeSelect={onNodeSelect} />
      </svg>
    </section>
  )
}
