export type StartPos = "start" | "current" | "checkpoint";
export interface OffsetProvider {
    getOffset(partition: number): string;
    setOffset(partition: number, newOffset: string): void;
    getStartPos(): StartPos;
}
export declare const startFromTopicStart: OffsetProvider;
export declare const startFromTopicEnd: OffsetProvider;
