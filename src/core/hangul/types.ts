export interface HangulSyllableParts {
  readonly initial: string
  readonly medial: string
  readonly final?: string
}

export interface HangulComposer {
  compose(parts: HangulSyllableParts): string
  decompose(syllable: string): HangulSyllableParts | null
}
