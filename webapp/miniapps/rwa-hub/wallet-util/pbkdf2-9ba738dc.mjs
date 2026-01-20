import { c as createHMACSync } from './hmac-d682b216.mjs';
import { g as getUInt8Buffer, b as getDigestHex } from './WASMInterface-e83e38e1.mjs';

/* eslint-disable no-bitwise */
function calculatePBKDF2(digest, salt, iterations, hashLength, outputType) {
    const DK = new Uint8Array(hashLength);
    const block1 = new Uint8Array(salt.length + 4);
    const block1View = new DataView(block1.buffer);
    const saltBuffer = getUInt8Buffer(salt);
    const saltUIntBuffer = new Uint8Array(saltBuffer.buffer, saltBuffer.byteOffset, saltBuffer.length);
    block1.set(saltUIntBuffer);
    let destPos = 0;
    const hLen = digest.digestSize;
    const l = Math.ceil(hashLength / hLen);
    let T;
    let U;
    for (let i = 1; i <= l; i++) {
        block1View.setUint32(salt.length, i);
        digest.init();
        digest.update(block1);
        T = digest.digest('binary');
        U = T.slice();
        for (let j = 1; j < iterations; j++) {
            digest.init();
            digest.update(U);
            U = digest.digest('binary');
            for (let k = 0; k < hLen; k++) {
                T[k] ^= U[k];
            }
        }
        DK.set(T.subarray(0, hashLength - destPos), destPos);
        destPos += hLen;
    }
    if (outputType === 'hex') {
        const digestChars = new Uint8Array(hashLength * 2);
        return getDigestHex(digestChars, DK, hashLength);
    }
    return DK;
}
const validateBaseOptions = (options) => {
    if (!options || typeof options !== 'object') {
        throw new Error('Invalid options parameter. It requires an object.');
    }
    if (!Number.isInteger(options.iterations) || options.iterations < 1) {
        throw new Error('Iterations should be a positive number');
    }
    if (!Number.isInteger(options.hashLength) || options.hashLength < 1) {
        throw new Error('Hash length should be a positive number');
    }
    if (options.outputType === undefined) {
        options.outputType = 'binary';
    }
    if (!['hex', 'binary'].includes(options.outputType)) {
        throw new Error(`Insupported output type ${options.outputType}. Valid values: ['hex', 'binary']`);
    }
};
/**
 * Generates a new PBKDF2 hash for the supplied password
 */
const pbkdf2 = async (options) => {
    const hashFunction = await options.hashFunction;
    if (!hashFunction) {
        throw new Error('Invalid hash function is provided! Usage: pbkdf2("password", "salt", 1000, 32, createSHA1()).');
    }
    return pbkdf2Sync({
        ...options,
        hashFunction,
    });
};
const pbkdf2Sync = (options) => {
    if (!options.hashFunction) {
        throw new Error('Invalid hash function is provided! Usage: pbkdf2Sync("password", "salt", 1000, 32, createSHA1Sync()).');
    }
    validateBaseOptions(options);
    const hmac = createHMACSync(options.hashFunction, options.password);
    return calculatePBKDF2(hmac, options.salt, options.iterations, options.hashLength, options.outputType);
};

export { pbkdf2 as a, pbkdf2Sync as p };
//# sourceMappingURL=pbkdf2-9ba738dc.mjs.map
