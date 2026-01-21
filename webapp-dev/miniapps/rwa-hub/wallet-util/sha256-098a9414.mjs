import { c as createWasmPreparer } from './WASMInterface-e83e38e1.mjs';

/**
 * Load SHA-256 wasm
 */
const prepareSHA256 = createWasmPreparer('sha256', 32);
/**
 * Calculates SHA-2 (SHA-256) hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const sha256 = async (data) => {
    return (await prepareSHA256()).calculate(data, 256);
};
/**
 * Creates a new SHA-2 (SHA-256) hash instance
 */
const createSHA256 = async () => {
    return createSHA256Sync(await prepareSHA256());
};
/**
 * Creates a new SHA-256 hash instance
 */
const createSHA256Sync = (wasm = prepareSHA256.wasm) => {
    wasm.init(256);
    const obj = {
        init: () => {
            wasm.init(256);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 64,
        digestSize: 32,
    };
    return obj;
};

export { createSHA256 as a, createSHA256Sync as c, prepareSHA256 as p, sha256 as s };
//# sourceMappingURL=sha256-098a9414.mjs.map
