import { c as createWasmPreparer } from './WASMInterface-e83e38e1.mjs';

/**
 * Load SHA-3 wasm
 */
const prepareSHA3_MAP = {
    224: createWasmPreparer('sha3', 224 / 8),
    256: createWasmPreparer('sha3', 256 / 8),
    384: createWasmPreparer('sha3', 384 / 8),
    512: createWasmPreparer('sha3', 512 / 8),
};
Object.setPrototypeOf(prepareSHA3_MAP, null);
const getSha3Preparer = (bits) => {
    if (bits in prepareSHA3_MAP === false) {
        throw new Error(`Invalid variant! Valid values: ${Object.keys(prepareSHA3_MAP)}`);
    }
    return prepareSHA3_MAP[bits];
};
/**
 * Calculates SHA-3 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param bits Number of output bits. Valid values: 224, 256, 384, 512
 * @returns Computed hash as a hexadecimal string
 */
const sha3 = async (data, bits = 512) => {
    return (await getSha3Preparer(bits)()).calculate(data, bits, 0x06);
};
/**
 * Creates a new SHA-3 hash instance
 * @param bits Number of output bits. Valid values: 224, 256, 384, 512
 */
const createSHA3 = async (bits = 512) => {
    return createSHA3Sync(bits, await getSha3Preparer(bits)());
};
/**
 * Creates a new SHA-3 hash instance
 * @param bits Number of output bits. Valid values: 224, 256, 384, 512
 */
const createSHA3Sync = (bits = 512, wasm = getSha3Preparer(bits).wasm) => {
    const outputSize = bits / 8;
    wasm.init(bits);
    const obj = {
        init: () => {
            wasm.init(bits);
            return obj;
        },
        update: (data) => {
            wasm.update(data);
            return obj;
        },
        digest: (outputType) => wasm.digest(outputType, 0x06),
        save: () => wasm.save(),
        load: (data) => {
            wasm.load(data);
            return obj;
        },
        blockSize: 200 - 2 * outputSize,
        digestSize: outputSize,
    };
    return obj;
};

export { createSHA3Sync as a, createSHA3 as c, getSha3Preparer as g, sha3 as s };
//# sourceMappingURL=sha3-8923c3ca.mjs.map
