import { c as createWasmPreparer } from './WASMInterface-e83e38e1.mjs';

/**
 * Load SHA-512 wasm
 */
const prepareSHA512 = createWasmPreparer('sha512', 64);
/**
 * Calculates SHA-2 (SHA-512) hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const sha512 = async (data) => {
    return (await prepareSHA512()).calculate(data, 512);
};
/**
 * Creates a new SHA-2 (SHA-512) hash instance
 */
const createSHA512 = async () => {
    return createSHA512Sync(await prepareSHA512());
};
/**
 * Creates a new SHA-2 (SHA-512) hash instance
 */
const createSHA512Sync = (wasm = prepareSHA512.wasm) => {
    wasm.init(512);
    const obj = {
        init: () => {
            wasm.init(512);
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
        blockSize: 128,
        digestSize: 64,
    };
    return obj;
};

export { createSHA512 as a, createSHA512Sync as c, prepareSHA512 as p, sha512 as s };
//# sourceMappingURL=sha512-da1b7bbd.mjs.map
