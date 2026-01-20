import { a as cacheCall } from './index-62190cc8.mjs';

// const HEX_STRINGS = "0123456789abcdefABCDEF";
// const HEX_CODES = HEX_STRINGS.split("").map((c) => c.codePointAt(0));
// const HEX_CODEPOINTS = Array(256)
//     .fill(true)
//     .map((_, i) => {
//     const s = String.fromCodePoint(i);
//     const index = HEX_STRINGS.indexOf(s);
//     // ABCDEF will use 10 - 15
//     return index < 0 ? undefined : index < 16 ? index : index - 6;
// });
// const ENCODER = new TextEncoder();
// const DECODER = new TextDecoder("ascii");
// // There are two implementations.
// // One optimizes for length of the bytes, and uses TextDecoder.
// // One optimizes for iteration count, and appends strings.
// // This removes the overhead of TextDecoder.
// export function toHex(bytes) {
//     const b = bytes || new Uint8Array();
//     return b.length > 512 ? _toHexLengthPerf(b) : _toHexIterPerf(b);
// }
// function _toHexIterPerf(bytes) {
//     let s = "";
//     for (let i = 0; i < bytes.length; ++i) {
//         s += HEX_STRINGS[HEX_CODEPOINTS[HEX_CODES[bytes[i] >> 4]]];
//         s += HEX_STRINGS[HEX_CODEPOINTS[HEX_CODES[bytes[i] & 15]]];
//     }
//     return s;
// }
// function _toHexLengthPerf(bytes) {
//     const hexBytes = new Uint8Array(bytes.length * 2);
//     for (let i = 0; i < bytes.length; ++i) {
//         hexBytes[i * 2] = HEX_CODES[bytes[i] >> 4];
//         hexBytes[i * 2 + 1] = HEX_CODES[bytes[i] & 15];
//     }
//     return DECODER.decode(hexBytes);
// }
// // Mimics Buffer.from(x, 'hex') logic
// // Stops on first non-hex string and returns
// // https://github.com/nodejs/node/blob/v14.18.1/src/string_bytes.cc#L246-L261
// export function fromHex(hexString) {
//     const hexBytes = ENCODER.encode(hexString || "");
//     const resultBytes = new Uint8Array(Math.floor(hexBytes.length / 2));
//     let i;
//     for (i = 0; i < resultBytes.length; i++) {
//         const a = HEX_CODEPOINTS[hexBytes[i * 2]];
//         const b = HEX_CODEPOINTS[hexBytes[i * 2 + 1]];
//         if (a === undefined || b === undefined) {
//             break;
//         }
//         resultBytes[i] = (a << 4) | b;
//     }
//     return i === resultBytes.length ? resultBytes : resultBytes.slice(0, i);
// }
// Same behavior as Buffer.compare()
const compare = globalThis.indexedDB?.cmp ??
    function compare(v1, v2) {
        const minLength = Math.min(v1.length, v2.length);
        for (let i = 0; i < minLength; ++i) {
            if (v1[i] !== v2[i]) {
                return v1[i] < v2[i] ? -1 : 1;
            }
        }
        return v1.length === v2.length ? 0 : v1.length > v2.length ? 1 : -1;
    };

const ERROR_BAD_PRIVATE = 0;
const ERROR_BAD_POINT = 1;
const ERROR_BAD_TWEAK = 2;
const ERROR_BAD_HASH = 3;
const ERROR_BAD_SIGNATURE = 4;
const ERROR_BAD_EXTRA_DATA = 5;
const ERROR_BAD_PARITY = 6;
const ERROR_BAD_RECOVERY_ID = 7;
const ERRORS_MESSAGES = {
    [ERROR_BAD_PRIVATE.toString()]: 'Expected Private',
    [ERROR_BAD_POINT.toString()]: 'Expected Point',
    [ERROR_BAD_TWEAK.toString()]: 'Expected Tweak',
    [ERROR_BAD_HASH.toString()]: 'Expected Hash',
    [ERROR_BAD_SIGNATURE.toString()]: 'Expected Signature',
    [ERROR_BAD_EXTRA_DATA.toString()]: 'Expected Extra Data (32 bytes)',
    [ERROR_BAD_PARITY.toString()]: 'Expected Parity (1 | 0)',
    [ERROR_BAD_RECOVERY_ID.toString()]: 'Bad Recovery Id',
};
function throwError(errcode) {
    const message = ERRORS_MESSAGES[errcode.toString()] || `Unknow error code: ${errcode}`;
    throw new TypeError(message);
}

const PRIVATE_KEY_SIZE = 32;
const PUBLIC_KEY_COMPRESSED_SIZE = 33;
const PUBLIC_KEY_UNCOMPRESSED_SIZE = 65;
const X_ONLY_PUBLIC_KEY_SIZE = 32;
const TWEAK_SIZE = 32;
const HASH_SIZE = 32;
const EXTRA_DATA_SIZE = 32;
const SIGNATURE_SIZE = 64;
const BN32_ZERO = new Uint8Array(32);
const BN32_N = new Uint8Array([
    255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255,
    254, 186, 174, 220, 230, 175, 72, 160, 59, 191, 210, 94, 140, 208, 54, 65, 65,
]);
// Difference between field and order
const BN32_P_MINUS_N = new Uint8Array([
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 69, 81, 35, 25, 80, 183, 95,
    196, 64, 45, 161, 114, 47, 201, 186, 238,
]);
function isUint8Array(value) {
    return value instanceof Uint8Array;
}
function cmpBN32(data1, data2) {
    for (let i = 0; i < 32; ++i) {
        if (data1[i] !== data2[i]) {
            return data1[i] < data2[i] ? -1 : 1;
        }
    }
    return 0;
}
function isZero(x) {
    return cmpBN32(x, BN32_ZERO) === 0;
}
function isPrivate$1(x) {
    return (isUint8Array(x) &&
        x.length === PRIVATE_KEY_SIZE &&
        cmpBN32(x, BN32_ZERO) > 0 &&
        cmpBN32(x, BN32_N) < 0);
}
function isPoint$1(p) {
    return (isUint8Array(p) &&
        (p.length === PUBLIC_KEY_COMPRESSED_SIZE ||
            p.length === PUBLIC_KEY_UNCOMPRESSED_SIZE ||
            p.length === X_ONLY_PUBLIC_KEY_SIZE));
}
function isXOnlyPoint$1(p) {
    return isUint8Array(p) && p.length === X_ONLY_PUBLIC_KEY_SIZE;
}
function isDERPoint(p) {
    return (isUint8Array(p) &&
        (p.length === PUBLIC_KEY_COMPRESSED_SIZE ||
            p.length === PUBLIC_KEY_UNCOMPRESSED_SIZE));
}
function isPointCompressed$1(p) {
    return isUint8Array(p) && p.length === PUBLIC_KEY_COMPRESSED_SIZE;
}
function isTweak(tweak) {
    return (isUint8Array(tweak) &&
        tweak.length === TWEAK_SIZE &&
        cmpBN32(tweak, BN32_N) < 0);
}
function isHash(h) {
    return isUint8Array(h) && h.length === HASH_SIZE;
}
function isExtraData(e) {
    return e === undefined || (isUint8Array(e) && e.length === EXTRA_DATA_SIZE);
}
function isSignature(signature) {
    return (isUint8Array(signature) &&
        signature.length === 64 &&
        cmpBN32(signature.subarray(0, 32), BN32_N) < 0 &&
        cmpBN32(signature.subarray(32, 64), BN32_N) < 0);
}
function isSigrLessThanPMinusN(signature) {
    return (isUint8Array(signature) &&
        signature.length === 64 &&
        cmpBN32(signature.subarray(0, 32), BN32_P_MINUS_N) < 0);
}
function validateParity(p) {
    if (p !== 0 && p !== 1)
        throwError(ERROR_BAD_PARITY);
}
function validatePrivate(d) {
    if (!isPrivate$1(d))
        throwError(ERROR_BAD_PRIVATE);
}
function validatePoint(p) {
    if (!isPoint$1(p))
        throwError(ERROR_BAD_POINT);
}
function validateXOnlyPoint(p) {
    if (!isXOnlyPoint$1(p))
        throwError(ERROR_BAD_POINT);
}
function validateTweak(tweak) {
    if (!isTweak(tweak))
        throwError(ERROR_BAD_TWEAK);
}
function validateHash(h) {
    if (!isHash(h))
        throwError(ERROR_BAD_HASH);
}
function validateExtraData(e) {
    if (!isExtraData(e))
        throwError(ERROR_BAD_EXTRA_DATA);
}
function validateSignature(signature) {
    if (!isSignature(signature))
        throwError(ERROR_BAD_SIGNATURE);
}
function validateSignatureCustom(validatorFn) {
    if (!validatorFn())
        throwError(ERROR_BAD_SIGNATURE);
}
function validateSignatureNonzeroRS(signature) {
    if (isZero(signature.subarray(0, 32)))
        throwError(ERROR_BAD_SIGNATURE);
    if (isZero(signature.subarray(32, 64)))
        throwError(ERROR_BAD_SIGNATURE);
}
function validateSigrPMinusN(signature) {
    if (!isSigrLessThanPMinusN(signature))
        throwError(ERROR_BAD_RECOVERY_ID);
}

let wasm;
let WASM_BUFFER;
let WASM_PRIVATE_KEY_PTR;
let WASM_PUBLIC_KEY_INPUT_PTR;
let WASM_PUBLIC_KEY_INPUT_PTR2;
let WASM_X_ONLY_PUBLIC_KEY_INPUT_PTR;
let WASM_X_ONLY_PUBLIC_KEY_INPUT2_PTR;
let WASM_TWEAK_INPUT_PTR;
let WASM_HASH_INPUT_PTR;
let WASM_EXTRA_DATA_INPUT_PTR;
let WASM_SIGNATURE_INPUT_PTR;
let PRIVATE_KEY_INPUT;
let PUBLIC_KEY_INPUT;
let PUBLIC_KEY_INPUT2;
let X_ONLY_PUBLIC_KEY_INPUT;
let X_ONLY_PUBLIC_KEY_INPUT2;
let TWEAK_INPUT;
let HASH_INPUT;
let EXTRA_DATA_INPUT;
let SIGNATURE_INPUT;
const init = cacheCall((wasmExports) => {
    wasm = wasmExports;
    WASM_BUFFER = new Uint8Array(wasm.memory.buffer);
    WASM_PRIVATE_KEY_PTR = wasm.PRIVATE_INPUT.value;
    WASM_PUBLIC_KEY_INPUT_PTR = wasm.PUBLIC_KEY_INPUT.value;
    WASM_PUBLIC_KEY_INPUT_PTR2 = wasm.PUBLIC_KEY_INPUT2.value;
    WASM_X_ONLY_PUBLIC_KEY_INPUT_PTR = wasm.X_ONLY_PUBLIC_KEY_INPUT.value;
    WASM_X_ONLY_PUBLIC_KEY_INPUT2_PTR = wasm.X_ONLY_PUBLIC_KEY_INPUT2.value;
    WASM_TWEAK_INPUT_PTR = wasm.TWEAK_INPUT.value;
    WASM_HASH_INPUT_PTR = wasm.HASH_INPUT.value;
    WASM_EXTRA_DATA_INPUT_PTR = wasm.EXTRA_DATA_INPUT.value;
    WASM_SIGNATURE_INPUT_PTR = wasm.SIGNATURE_INPUT.value;
    PRIVATE_KEY_INPUT = WASM_BUFFER.subarray(WASM_PRIVATE_KEY_PTR, WASM_PRIVATE_KEY_PTR + PRIVATE_KEY_SIZE);
    PUBLIC_KEY_INPUT = WASM_BUFFER.subarray(WASM_PUBLIC_KEY_INPUT_PTR, WASM_PUBLIC_KEY_INPUT_PTR + PUBLIC_KEY_UNCOMPRESSED_SIZE);
    PUBLIC_KEY_INPUT2 = WASM_BUFFER.subarray(WASM_PUBLIC_KEY_INPUT_PTR2, WASM_PUBLIC_KEY_INPUT_PTR2 + PUBLIC_KEY_UNCOMPRESSED_SIZE);
    X_ONLY_PUBLIC_KEY_INPUT = WASM_BUFFER.subarray(WASM_X_ONLY_PUBLIC_KEY_INPUT_PTR, WASM_X_ONLY_PUBLIC_KEY_INPUT_PTR + X_ONLY_PUBLIC_KEY_SIZE);
    X_ONLY_PUBLIC_KEY_INPUT2 = WASM_BUFFER.subarray(WASM_X_ONLY_PUBLIC_KEY_INPUT2_PTR, WASM_X_ONLY_PUBLIC_KEY_INPUT2_PTR + X_ONLY_PUBLIC_KEY_SIZE);
    TWEAK_INPUT = WASM_BUFFER.subarray(WASM_TWEAK_INPUT_PTR, WASM_TWEAK_INPUT_PTR + TWEAK_SIZE);
    HASH_INPUT = WASM_BUFFER.subarray(WASM_HASH_INPUT_PTR, WASM_HASH_INPUT_PTR + HASH_SIZE);
    EXTRA_DATA_INPUT = WASM_BUFFER.subarray(WASM_EXTRA_DATA_INPUT_PTR, WASM_EXTRA_DATA_INPUT_PTR + EXTRA_DATA_SIZE);
    SIGNATURE_INPUT = WASM_BUFFER.subarray(WASM_SIGNATURE_INPUT_PTR, WASM_SIGNATURE_INPUT_PTR + SIGNATURE_SIZE);
});
function assumeCompression(compressed, p) {
    if (compressed === undefined) {
        return p !== undefined ? p.length : PUBLIC_KEY_COMPRESSED_SIZE;
    }
    return compressed
        ? PUBLIC_KEY_COMPRESSED_SIZE
        : PUBLIC_KEY_UNCOMPRESSED_SIZE;
}
function _isPoint(p) {
    try {
        PUBLIC_KEY_INPUT.set(p);
        return wasm.isPoint(p.length) === 1;
    }
    finally {
        PUBLIC_KEY_INPUT.fill(0);
    }
}
function __initializeContext() {
    wasm.initializeContext();
}
function isPoint(p) {
    return isDERPoint(p) && _isPoint(p);
}
function isPointCompressed(p) {
    return isPointCompressed$1(p) && _isPoint(p);
}
function isXOnlyPoint(p) {
    return isXOnlyPoint$1(p) && _isPoint(p);
}
function isPrivate(d) {
    return isPrivate$1(d);
}
function pointAdd(pA, pB, compressed) {
    validatePoint(pA);
    validatePoint(pB);
    const outputlen = assumeCompression(compressed, pA);
    try {
        PUBLIC_KEY_INPUT.set(pA);
        PUBLIC_KEY_INPUT2.set(pB);
        return wasm.pointAdd(pA.length, pB.length, outputlen) === 1
            ? PUBLIC_KEY_INPUT.slice(0, outputlen)
            : null;
    }
    finally {
        PUBLIC_KEY_INPUT.fill(0);
        PUBLIC_KEY_INPUT2.fill(0);
    }
}
function pointAddScalar(p, tweak, compressed) {
    validatePoint(p);
    validateTweak(tweak);
    const outputlen = assumeCompression(compressed, p);
    try {
        PUBLIC_KEY_INPUT.set(p);
        TWEAK_INPUT.set(tweak);
        return wasm.pointAddScalar(p.length, outputlen) === 1
            ? PUBLIC_KEY_INPUT.slice(0, outputlen)
            : null;
    }
    finally {
        PUBLIC_KEY_INPUT.fill(0);
        TWEAK_INPUT.fill(0);
    }
}
function pointCompress(p, compressed) {
    validatePoint(p);
    const outputlen = assumeCompression(compressed, p);
    try {
        PUBLIC_KEY_INPUT.set(p);
        wasm.pointCompress(p.length, outputlen);
        return PUBLIC_KEY_INPUT.slice(0, outputlen);
    }
    finally {
        PUBLIC_KEY_INPUT.fill(0);
    }
}
function pointFromScalar(d, compressed) {
    validatePrivate(d);
    const outputlen = assumeCompression(compressed);
    try {
        PRIVATE_KEY_INPUT.set(d);
        return wasm.pointFromScalar(outputlen) === 1
            ? PUBLIC_KEY_INPUT.slice(0, outputlen)
            : null;
    }
    finally {
        PRIVATE_KEY_INPUT.fill(0);
        PUBLIC_KEY_INPUT.fill(0);
    }
}
function xOnlyPointFromScalar(d) {
    validatePrivate(d);
    try {
        PRIVATE_KEY_INPUT.set(d);
        wasm.xOnlyPointFromScalar();
        return X_ONLY_PUBLIC_KEY_INPUT.slice(0, X_ONLY_PUBLIC_KEY_SIZE);
    }
    finally {
        PRIVATE_KEY_INPUT.fill(0);
        X_ONLY_PUBLIC_KEY_INPUT.fill(0);
    }
}
function xOnlyPointFromPoint(p) {
    validatePoint(p);
    try {
        PUBLIC_KEY_INPUT.set(p);
        wasm.xOnlyPointFromPoint(p.length);
        return X_ONLY_PUBLIC_KEY_INPUT.slice(0, X_ONLY_PUBLIC_KEY_SIZE);
    }
    finally {
        PUBLIC_KEY_INPUT.fill(0);
        X_ONLY_PUBLIC_KEY_INPUT.fill(0);
    }
}
function pointMultiply(p, tweak, compressed) {
    validatePoint(p);
    validateTweak(tweak);
    const outputlen = assumeCompression(compressed, p);
    try {
        PUBLIC_KEY_INPUT.set(p);
        TWEAK_INPUT.set(tweak);
        return wasm.pointMultiply(p.length, outputlen) === 1
            ? PUBLIC_KEY_INPUT.slice(0, outputlen)
            : null;
    }
    finally {
        PUBLIC_KEY_INPUT.fill(0);
        TWEAK_INPUT.fill(0);
    }
}
function privateAdd(d, tweak) {
    validatePrivate(d);
    validateTweak(tweak);
    try {
        PRIVATE_KEY_INPUT.set(d);
        TWEAK_INPUT.set(tweak);
        return wasm.privateAdd() === 1
            ? PRIVATE_KEY_INPUT.slice(0, PRIVATE_KEY_SIZE)
            : null;
    }
    finally {
        PRIVATE_KEY_INPUT.fill(0);
        TWEAK_INPUT.fill(0);
    }
}
function privateSub(d, tweak) {
    validatePrivate(d);
    validateTweak(tweak);
    // We can not pass zero tweak to WASM, because WASM use `secp256k1_ec_seckey_negate` for tweak negate.
    // (zero is not valid seckey)
    if (isZero(tweak)) {
        return new Uint8Array(d);
    }
    try {
        PRIVATE_KEY_INPUT.set(d);
        TWEAK_INPUT.set(tweak);
        return wasm.privateSub() === 1
            ? PRIVATE_KEY_INPUT.slice(0, PRIVATE_KEY_SIZE)
            : null;
    }
    finally {
        PRIVATE_KEY_INPUT.fill(0);
        TWEAK_INPUT.fill(0);
    }
}
function privateNegate(d) {
    validatePrivate(d);
    try {
        PRIVATE_KEY_INPUT.set(d);
        wasm.privateNegate();
        return PRIVATE_KEY_INPUT.slice(0, PRIVATE_KEY_SIZE);
    }
    finally {
        PRIVATE_KEY_INPUT.fill(0);
    }
}
function xOnlyPointAddTweak(p, tweak) {
    validateXOnlyPoint(p);
    validateTweak(tweak);
    try {
        X_ONLY_PUBLIC_KEY_INPUT.set(p);
        TWEAK_INPUT.set(tweak);
        const parity = wasm.xOnlyPointAddTweak();
        return parity !== -1
            ? {
                parity,
                xOnlyPubkey: X_ONLY_PUBLIC_KEY_INPUT.slice(0, X_ONLY_PUBLIC_KEY_SIZE),
            }
            : null;
    }
    finally {
        X_ONLY_PUBLIC_KEY_INPUT.fill(0);
        TWEAK_INPUT.fill(0);
    }
}
function xOnlyPointAddTweakCheck(point, tweak, resultToCheck, tweakParity) {
    validateXOnlyPoint(point);
    validateXOnlyPoint(resultToCheck);
    validateTweak(tweak);
    const hasParity = tweakParity !== undefined;
    if (hasParity)
        validateParity(tweakParity);
    try {
        X_ONLY_PUBLIC_KEY_INPUT.set(point);
        X_ONLY_PUBLIC_KEY_INPUT2.set(resultToCheck);
        TWEAK_INPUT.set(tweak);
        if (hasParity) {
            return wasm.xOnlyPointAddTweakCheck(tweakParity) === 1;
        }
        else {
            wasm.xOnlyPointAddTweak();
            const newKey = X_ONLY_PUBLIC_KEY_INPUT.slice(0, X_ONLY_PUBLIC_KEY_SIZE);
            return compare(newKey, resultToCheck) === 0;
        }
    }
    finally {
        X_ONLY_PUBLIC_KEY_INPUT.fill(0);
        X_ONLY_PUBLIC_KEY_INPUT2.fill(0);
        TWEAK_INPUT.fill(0);
    }
}
function sign(h, d, e) {
    validateHash(h);
    validatePrivate(d);
    validateExtraData(e);
    try {
        HASH_INPUT.set(h);
        PRIVATE_KEY_INPUT.set(d);
        if (e !== undefined)
            EXTRA_DATA_INPUT.set(e);
        wasm.sign(e === undefined ? 0 : 1);
        return SIGNATURE_INPUT.slice(0, SIGNATURE_SIZE);
    }
    finally {
        HASH_INPUT.fill(0);
        PRIVATE_KEY_INPUT.fill(0);
        if (e !== undefined)
            EXTRA_DATA_INPUT.fill(0);
        SIGNATURE_INPUT.fill(0);
    }
}
function signRecoverable(h, d, e) {
    validateHash(h);
    validatePrivate(d);
    validateExtraData(e);
    try {
        HASH_INPUT.set(h);
        PRIVATE_KEY_INPUT.set(d);
        if (e !== undefined)
            EXTRA_DATA_INPUT.set(e);
        const recoveryId = wasm.signRecoverable(e === undefined ? 0 : 1);
        const signature = SIGNATURE_INPUT.slice(0, SIGNATURE_SIZE);
        return {
            signature,
            recoveryId,
        };
    }
    finally {
        HASH_INPUT.fill(0);
        PRIVATE_KEY_INPUT.fill(0);
        if (e !== undefined)
            EXTRA_DATA_INPUT.fill(0);
        SIGNATURE_INPUT.fill(0);
    }
}
function signSchnorr(h, d, e) {
    validateHash(h);
    validatePrivate(d);
    validateExtraData(e);
    try {
        HASH_INPUT.set(h);
        PRIVATE_KEY_INPUT.set(d);
        if (e !== undefined)
            EXTRA_DATA_INPUT.set(e);
        wasm.signSchnorr(e === undefined ? 0 : 1);
        return SIGNATURE_INPUT.slice(0, SIGNATURE_SIZE);
    }
    finally {
        HASH_INPUT.fill(0);
        PRIVATE_KEY_INPUT.fill(0);
        if (e !== undefined)
            EXTRA_DATA_INPUT.fill(0);
        SIGNATURE_INPUT.fill(0);
    }
}
function verify(h, Q, signature, strict = false) {
    validateHash(h);
    validatePoint(Q);
    validateSignature(signature);
    try {
        HASH_INPUT.set(h);
        PUBLIC_KEY_INPUT.set(Q);
        SIGNATURE_INPUT.set(signature);
        return wasm.verify(Q.length, strict === true ? 1 : 0) === 1 ? true : false;
    }
    finally {
        HASH_INPUT.fill(0);
        PUBLIC_KEY_INPUT.fill(0);
        SIGNATURE_INPUT.fill(0);
    }
}
function recover(h, signature, recoveryId, compressed = false) {
    validateHash(h);
    validateSignature(signature);
    validateSignatureNonzeroRS(signature);
    if (recoveryId & 2) {
        validateSigrPMinusN(signature);
    }
    validateSignatureCustom(() => isXOnlyPoint(signature.subarray(0, 32)));
    const outputlen = assumeCompression(compressed);
    try {
        HASH_INPUT.set(h);
        SIGNATURE_INPUT.set(signature);
        return wasm.recover(outputlen, recoveryId) === 1
            ? PUBLIC_KEY_INPUT.slice(0, outputlen)
            : null;
    }
    finally {
        HASH_INPUT.fill(0);
        SIGNATURE_INPUT.fill(0);
        PUBLIC_KEY_INPUT.fill(0);
    }
}
function verifySchnorr(h, Q, signature) {
    validateHash(h);
    validateXOnlyPoint(Q);
    validateSignature(signature);
    try {
        HASH_INPUT.set(h);
        X_ONLY_PUBLIC_KEY_INPUT.set(Q);
        SIGNATURE_INPUT.set(signature);
        return wasm.verifySchnorr() === 1 ? true : false;
    }
    finally {
        HASH_INPUT.fill(0);
        X_ONLY_PUBLIC_KEY_INPUT.fill(0);
        SIGNATURE_INPUT.fill(0);
    }
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    __initializeContext: __initializeContext,
    init: init,
    isPoint: isPoint,
    isPointCompressed: isPointCompressed,
    isPrivate: isPrivate,
    isXOnlyPoint: isXOnlyPoint,
    pointAdd: pointAdd,
    pointAddScalar: pointAddScalar,
    pointCompress: pointCompress,
    pointFromScalar: pointFromScalar,
    pointMultiply: pointMultiply,
    privateAdd: privateAdd,
    privateNegate: privateNegate,
    privateSub: privateSub,
    recover: recover,
    sign: sign,
    signRecoverable: signRecoverable,
    signSchnorr: signSchnorr,
    verify: verify,
    verifySchnorr: verifySchnorr,
    xOnlyPointAddTweak: xOnlyPointAddTweak,
    xOnlyPointAddTweakCheck: xOnlyPointAddTweakCheck,
    xOnlyPointFromPoint: xOnlyPointFromPoint,
    xOnlyPointFromScalar: xOnlyPointFromScalar
});

export { index as a, init as i, pointCompress as p, throwError as t };
//# sourceMappingURL=index-20b88f48.mjs.map
