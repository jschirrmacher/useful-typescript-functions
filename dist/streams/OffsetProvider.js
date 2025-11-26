"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFromTopicEnd = exports.startFromTopicStart = void 0;
function createOffsetProvider(fromBeginning) {
    const staticOffsets = [];
    return {
        getOffset: (partition) => staticOffsets[partition] || "0",
        setOffset: (partition, offset) => (staticOffsets[partition] = offset),
        getStartPos: () => (fromBeginning ? "start" : "current"),
    };
}
exports.startFromTopicStart = createOffsetProvider(true);
exports.startFromTopicEnd = createOffsetProvider(false);
//# sourceMappingURL=OffsetProvider.js.map