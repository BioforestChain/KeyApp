import { c as createWasmPreparer } from './WASMInterface-e83e38e1.mjs';

/**
 * Load SHA-1 wasm
 */
const prepareSHA1 = createWasmPreparer('sha1', 20);
/**
 * Calculates SHA-1 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const sha1 = async (data) => {
    return (await prepareSHA1()).calculate(data);
};
/**
 * Creates a new SHA-1 hash instance
 */
const createSHA1 = async () => {
    return createSHA1Sync(await prepareSHA1());
};
/**
 * Creates a new SHA-1 hash instance
 */
const createSHA1Sync = (wasm = prepareSHA1.wasm) => {
    wasm.init();
    const obj = {
        init: () => {
            wasm.init();
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
        digestSize: 20,
    };
    return obj;
};

export { createSHA1 as a, createSHA1Sync as c, prepareSHA1 as p, sha1 as s };
//# sourceMappingURL=sha1-d9a30eed.mjs.map
