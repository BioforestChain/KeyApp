import { c as createWasmPreparer } from './WASMInterface-e83e38e1.mjs';

/**
 * Load RIPEMD-160 wasm
 */
const prepareRIPEMD160 = createWasmPreparer('ripemd160', 20);
/**
 * Calculates RIPEMD-160 hash
 * @param data Input data (string, Buffer or TypedArray)
 * @returns Computed hash as a hexadecimal string
 */
const ripemd160 = async (data) => {
    return (await prepareRIPEMD160()).calculate(data);
};
/**
 * Creates a new RIPEMD-160 hash instance
 */
const createRIPEMD160 = async () => {
    return createRIPEMD160Sync(await prepareRIPEMD160());
};
/**
 * Creates a new RIPEMD-160 hash instance
 */
const createRIPEMD160Sync = (wasm = prepareRIPEMD160.wasm) => {
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

export { createRIPEMD160 as a, createRIPEMD160Sync as c, prepareRIPEMD160 as p, ripemd160 as r };
//# sourceMappingURL=ripemd160-eb7b517c.mjs.map
