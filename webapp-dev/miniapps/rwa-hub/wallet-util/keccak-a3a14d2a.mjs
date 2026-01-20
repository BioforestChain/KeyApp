import { g as getSha3Preparer } from './sha3-8923c3ca.mjs';

/**
 * Calculates Keccak hash
 * @param data Input data (string, Buffer or TypedArray)
 * @param bits Number of output bits. Valid values: 224, 256, 384, 512
 * @returns Computed hash as a hexadecimal string
 */
const keccak = async (data, bits = 512) => {
    return (await getSha3Preparer(bits)()).calculate(data, bits, 0x01);
};
/**
 * Creates a new Keccak hash instance
 * @param bits Number of output bits. Valid values: 224, 256, 384, 512
 */
const createKeccak = async (bits = 512) => {
    return createKeccakSync(bits, await getSha3Preparer(bits)());
};
const createKeccakSync = (bits = 512, wasm = getSha3Preparer(bits).wasm) => {
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
        digest: (outputType) => wasm.digest(outputType, 0x01),
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

export { createKeccak as a, createKeccakSync as c, keccak as k };
//# sourceMappingURL=keccak-a3a14d2a.mjs.map
