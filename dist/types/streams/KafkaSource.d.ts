/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Kafka } from "kafkajs";
import { Readable } from "stream";
import { OffsetProvider } from "./OffsetProvider.js";
export type KafkaSource = Awaited<ReturnType<typeof createKafkaSource>>;
/**
 * Create a KafkaSource stream.
 *
 * @param kafka Kafka
 * @param groupId group id of this consumer
 * @param topic the name of the topic to consume
 * @param offsetProvider an OffsetProvider, the default will be an automatically generated one which starts from the current position of the stream
 * @returns
 */
export declare function createKafkaSource<T>(kafka: Kafka, groupId: string, topic: string, offsetProvider?: OffsetProvider): Promise<{
    stream: Readable;
    run: () => Promise<any>;
    runWithHeadstart: <T_1>(headStartMs: number, processFn: (data: T_1) => void) => Promise<unknown>;
}>;
export declare function disconnectKafkaSources(logger?: Pick<typeof console, "info">): Promise<void>;
