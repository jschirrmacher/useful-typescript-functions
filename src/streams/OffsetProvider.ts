export type StartPos = "start" | "current" | "checkpoint"

export interface OffsetProvider {
  getOffset(partition: number): string
  setOffset(partition: number, newOffset: string): void
  getStartPos(): StartPos
}

function createOffsetProvider(fromBeginning: boolean): OffsetProvider {
  const staticOffsets: string[] = []

  return {
    getOffset: (partition: number) => staticOffsets[partition] || "0",
    setOffset: (partition: number, offset: string) => (staticOffsets[partition] = offset),
    getStartPos: (): StartPos => (fromBeginning ? "start" : "current"),
  }
}

export const startFromTopicStart = createOffsetProvider(true)
export const startFromTopicEnd = createOffsetProvider(false)
