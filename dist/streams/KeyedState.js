"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveAllCheckpoints = exports.createState = void 0;
const DatabaseSinkStateEntity_js_1 = require("./DatabaseSinkStateEntity.js");
const states = [];
async function createState(id, dataSource, keyFunc, withoutCheckpoint = false, logger = console) {
    const stateRepository = dataSource.getRepository(DatabaseSinkStateEntity_js_1.DatabaseSinkStateEntity);
    let timer;
    let state = {};
    let offsets;
    let dirty = false;
    if (withoutCheckpoint) {
        await deleteCheckpoints();
        logger.info(`Reading ${id} from beginning`);
    }
    else {
        await loadLatestCheckpoint();
    }
    const result = {
        getOffset(partition) {
            return offsets ? offsets[partition] : "0";
        },
        setOffset(partition, newOffset) {
            if (!offsets) {
                offsets = [];
            }
            offsets[partition] = newOffset;
            dirty = true;
        },
        getStartPos() {
            return withoutCheckpoint ? "start" : "checkpoint";
        },
        getByKey(key) {
            return state[key];
        },
        set(object, offset, partition = 0) {
            state[keyFunc(object)] = object;
            if (offset) {
                this.setOffset(partition, offset);
            }
            dirty = true;
            timeCheckpoint();
        },
        unset(object, offset, partition = 0) {
            delete state[keyFunc(object)];
            if (offset) {
                this.setOffset(partition, offset);
            }
            dirty = true;
            timeCheckpoint();
        },
        saveCheckpoint,
    };
    states.push(result);
    return result;
    async function loadLatestCheckpoint() {
        const stateEntries = await stateRepository.createQueryBuilder("state").where({ id }).getMany();
        if (stateEntries.length === 0) {
            logger.warn(`No state found for ${id}`);
            withoutCheckpoint = true;
        }
        else {
            state = Object.fromEntries(stateEntries
                .filter(state => state.key !== "__offsets")
                .map(state => [state.key, JSON.parse(state.state)]));
            offsets = JSON.parse(stateEntries.find(state => state.key === "__offsets")?.state);
            logger.info(`Loaded checkpoint for ${id} at offsets ${offsets}`);
        }
    }
    async function saveCheckpoint() {
        if (!offsets || !dirty) {
            return; // Don't checkpoint if there are no offsets yet or if there are no changes
        }
        await stateRepository.manager.transaction(async (em) => {
            const entities = Object.entries(state).map(([key, state]) => new DatabaseSinkStateEntity_js_1.DatabaseSinkStateEntity(id, key, JSON.stringify(state)));
            const offsetsEntity = new DatabaseSinkStateEntity_js_1.DatabaseSinkStateEntity(id, "__offsets", JSON.stringify(offsets));
            await em.delete(DatabaseSinkStateEntity_js_1.DatabaseSinkStateEntity, { id });
            await em.insert(DatabaseSinkStateEntity_js_1.DatabaseSinkStateEntity, entities);
            await em.insert(DatabaseSinkStateEntity_js_1.DatabaseSinkStateEntity, offsetsEntity);
            logger.info(`Created state checkpoint for ${id} with offsets ${offsets}`);
        });
        dirty = false;
    }
    async function deleteCheckpoints() {
        await stateRepository.delete({ id });
    }
    function timeCheckpoint() {
        if (!timer) {
            timer = setTimeout(async () => {
                timer = undefined;
                await saveCheckpoint();
            }, 60_000);
        }
    }
}
exports.createState = createState;
async function saveAllCheckpoints() {
    await Promise.all(states.map(async (state) => await state.saveCheckpoint()));
    states.length = 0;
}
exports.saveAllCheckpoints = saveAllCheckpoints;
//# sourceMappingURL=KeyedState.js.map