import { B as Buffer$1 } from './index-62190cc8.mjs';
import { OPS, REVERSE_OPS } from './ops-a3396647.mjs';
import { t as typeforce$2 } from './typeforce-3fc8ed92.mjs';

// Reference https://github.com/bitcoin/bips/blob/master/bip-0066.mediawiki
// Format: 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
// NOTE: SIGHASH byte ignored AND restricted, truncate before use
function check(buffer) {
    if (buffer.length < 8)
        return false;
    if (buffer.length > 72)
        return false;
    if (buffer[0] !== 0x30)
        return false;
    if (buffer[1] !== buffer.length - 2)
        return false;
    if (buffer[2] !== 0x02)
        return false;
    const lenR = buffer[3];
    if (lenR === 0)
        return false;
    if (5 + lenR >= buffer.length)
        return false;
    if (buffer[4 + lenR] !== 0x02)
        return false;
    const lenS = buffer[5 + lenR];
    if (lenS === 0)
        return false;
    if (6 + lenR + lenS !== buffer.length)
        return false;
    if (buffer[4] & 0x80)
        return false;
    if (lenR > 1 && buffer[4] === 0x00 && !(buffer[5] & 0x80))
        return false;
    if (buffer[lenR + 6] & 0x80)
        return false;
    if (lenS > 1 && buffer[lenR + 6] === 0x00 && !(buffer[lenR + 7] & 0x80))
        return false;
    return true;
}
function decode$3(buffer) {
    if (buffer.length < 8)
        throw new Error('DER sequence length is too short');
    if (buffer.length > 72)
        throw new Error('DER sequence length is too long');
    if (buffer[0] !== 0x30)
        throw new Error('Expected DER sequence');
    if (buffer[1] !== buffer.length - 2)
        throw new Error('DER sequence length is invalid');
    if (buffer[2] !== 0x02)
        throw new Error('Expected DER integer');
    const lenR = buffer[3];
    if (lenR === 0)
        throw new Error('R length is zero');
    if (5 + lenR >= buffer.length)
        throw new Error('R length is too long');
    if (buffer[4 + lenR] !== 0x02)
        throw new Error('Expected DER integer (2)');
    const lenS = buffer[5 + lenR];
    if (lenS === 0)
        throw new Error('S length is zero');
    if (6 + lenR + lenS !== buffer.length)
        throw new Error('S length is invalid');
    if (buffer[4] & 0x80)
        throw new Error('R value is negative');
    if (lenR > 1 && buffer[4] === 0x00 && !(buffer[5] & 0x80))
        throw new Error('R value excessively padded');
    if (buffer[lenR + 6] & 0x80)
        throw new Error('S value is negative');
    if (lenS > 1 && buffer[lenR + 6] === 0x00 && !(buffer[lenR + 7] & 0x80))
        throw new Error('S value excessively padded');
    // non-BIP66 - extract R, S values
    return {
        r: buffer.slice(4, 4 + lenR),
        s: buffer.slice(6 + lenR),
    };
}
/*
 * Expects r and s to be positive DER integers.
 *
 * The DER format uses the most significant bit as a sign bit (& 0x80).
 * If the significant bit is set AND the integer is positive, a 0x00 is prepended.
 *
 * Examples:
 *
 *      0 =>     0x00
 *      1 =>     0x01
 *     -1 =>     0xff
 *    127 =>     0x7f
 *   -127 =>     0x81
 *    128 =>   0x0080
 *   -128 =>     0x80
 *    255 =>   0x00ff
 *   -255 =>   0xff01
 *  16300 =>   0x3fac
 * -16300 =>   0xc054
 *  62300 => 0x00f35c
 * -62300 => 0xff0ca4
 */
function encode$3(r, s) {
    const lenR = r.length;
    const lenS = s.length;
    if (lenR === 0)
        throw new Error('R length is zero');
    if (lenS === 0)
        throw new Error('S length is zero');
    if (lenR > 33)
        throw new Error('R length is too long');
    if (lenS > 33)
        throw new Error('S length is too long');
    if (r[0] & 0x80)
        throw new Error('R value is negative');
    if (s[0] & 0x80)
        throw new Error('S value is negative');
    if (lenR > 1 && r[0] === 0x00 && !(r[1] & 0x80))
        throw new Error('R value excessively padded');
    if (lenS > 1 && s[0] === 0x00 && !(s[1] & 0x80))
        throw new Error('S value excessively padded');
    const signature = Buffer$1.allocUnsafe(6 + lenR + lenS);
    // 0x30 [total-length] 0x02 [R-length] [R] 0x02 [S-length] [S]
    signature[0] = 0x30;
    signature[1] = signature.length - 2;
    signature[2] = 0x02;
    signature[3] = r.length;
    r.copy(signature, 4);
    signature[4 + lenR] = 0x02;
    signature[5 + lenR] = s.length;
    s.copy(signature, 6 + lenR);
    return signature;
}

function encodingLength(i) {
    return i < OPS.OP_PUSHDATA1 ? 1 : i <= 0xff ? 2 : i <= 0xffff ? 3 : 5;
}
function encode$2(buffer, num, offset) {
    const size = encodingLength(num);
    // ~6 bit
    if (size === 1) {
        buffer.writeUInt8(num, offset);
        // 8 bit
    }
    else if (size === 2) {
        buffer.writeUInt8(OPS.OP_PUSHDATA1, offset);
        buffer.writeUInt8(num, offset + 1);
        // 16 bit
    }
    else if (size === 3) {
        buffer.writeUInt8(OPS.OP_PUSHDATA2, offset);
        buffer.writeUInt16LE(num, offset + 1);
        // 32 bit
    }
    else {
        buffer.writeUInt8(OPS.OP_PUSHDATA4, offset);
        buffer.writeUInt32LE(num, offset + 1);
    }
    return size;
}
function decode$2(buffer, offset) {
    const opcode = buffer.readUInt8(offset);
    let num;
    let size;
    // ~6 bit
    if (opcode < OPS.OP_PUSHDATA1) {
        num = opcode;
        size = 1;
        // 8 bit
    }
    else if (opcode === OPS.OP_PUSHDATA1) {
        if (offset + 2 > buffer.length)
            return null;
        num = buffer.readUInt8(offset + 1);
        size = 2;
        // 16 bit
    }
    else if (opcode === OPS.OP_PUSHDATA2) {
        if (offset + 3 > buffer.length)
            return null;
        num = buffer.readUInt16LE(offset + 1);
        size = 3;
        // 32 bit
    }
    else {
        if (offset + 5 > buffer.length)
            return null;
        if (opcode !== OPS.OP_PUSHDATA4)
            throw new Error('Unexpected opcode');
        num = buffer.readUInt32LE(offset + 1);
        size = 5;
    }
    return {
        opcode,
        number: num,
        size,
    };
}

function decode$1(buffer, maxLength, minimal) {
    maxLength = maxLength || 4;
    minimal = minimal === undefined ? true : minimal;
    const length = buffer.length;
    if (length === 0)
        return 0;
    if (length > maxLength)
        throw new TypeError('Script number overflow');
    if (minimal) {
        if ((buffer[length - 1] & 0x7f) === 0) {
            if (length <= 1 || (buffer[length - 2] & 0x80) === 0)
                throw new Error('Non-minimally encoded script number');
        }
    }
    // 40-bit
    if (length === 5) {
        const a = buffer.readUInt32LE(0);
        const b = buffer.readUInt8(4);
        if (b & 0x80)
            return -((b & ~0x80) * 0x100000000 + a);
        return b * 0x100000000 + a;
    }
    // 32-bit / 24-bit / 16-bit / 8-bit
    let result = 0;
    for (let i = 0; i < length; ++i) {
        result |= buffer[i] << (8 * i);
    }
    if (buffer[length - 1] & 0x80)
        return -(result & ~(0x80 << (8 * (length - 1))));
    return result;
}
function scriptNumSize(i) {
    return i > 0x7fffffff
        ? 5
        : i > 0x7fffff
            ? 4
            : i > 0x7fff
                ? 3
                : i > 0x7f
                    ? 2
                    : i > 0x00
                        ? 1
                        : 0;
}
function encode$1(_number) {
    let value = Math.abs(_number);
    const size = scriptNumSize(value);
    const buffer = Buffer$1.allocUnsafe(size);
    const negative = _number < 0;
    for (let i = 0; i < size; ++i) {
        buffer.writeUInt8(value & 0xff, i);
        value >>= 8;
    }
    if (buffer[size - 1] & 0x80) {
        buffer.writeUInt8(negative ? 0x80 : 0x00, size - 1);
    }
    else if (negative) {
        buffer[size - 1] |= 0x80;
    }
    return buffer;
}

var scriptNumber = /*#__PURE__*/Object.freeze({
    __proto__: null,
    decode: decode$1,
    encode: encode$1
});

const ZERO32 = Buffer$1.alloc(32, 0);
const EC_P = Buffer$1.from('fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f', 'hex');
function stacksEqual(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((x, i) => {
        return x.equals(b[i]);
    });
}
function isPoint(p) {
    if (!Buffer$1.isBuffer(p))
        return false;
    if (p.length < 33)
        return false;
    const t = p[0];
    const x = p.subarray(1, 33);
    if (x.compare(ZERO32) === 0)
        return false;
    if (x.compare(EC_P) >= 0)
        return false;
    if ((t === 0x02 || t === 0x03) && p.length === 33) {
        return true;
    }
    const y = p.subarray(33);
    if (y.compare(ZERO32) === 0)
        return false;
    if (y.compare(EC_P) >= 0)
        return false;
    if (t === 0x04 && p.length === 65)
        return true;
    return false;
}
const UINT31_MAX = Math.pow(2, 31) - 1;
function UInt31(value) {
    return typeforce$2.UInt32(value) && value <= UINT31_MAX;
}
function BIP32Path(value) {
    return typeforce$2.String(value) && !!value.match(/^(m\/)?(\d+'?\/)*\d+'?$/);
}
BIP32Path.toJSON = () => {
    return 'BIP32 derivation path';
};
function Signer(obj) {
    return ((typeforce$2.Buffer(obj.publicKey) ||
        typeof obj.getPublicKey === 'function') &&
        typeof obj.sign === 'function');
}
const SATOSHI_MAX = 21 * 1e14;
function Satoshi(value) {
    return typeforce$2.UInt53(value) && value <= SATOSHI_MAX;
}
// external dependent types
const ECPoint = typeforce$2.quacksLike('Point');
// exposed, external API
const Network = typeforce$2.compile({
    messagePrefix: typeforce$2.anyOf(typeforce$2.Buffer, typeforce$2.String),
    bip32: {
        public: typeforce$2.UInt32,
        private: typeforce$2.UInt32,
    },
    pubKeyHash: typeforce$2.UInt8,
    scriptHash: typeforce$2.UInt8,
    wif: typeforce$2.UInt8,
});
const TAPLEAF_VERSION_MASK = 0xfe;
function isTapleaf(o) {
    if (!o || !('output' in o))
        return false;
    if (!Buffer$1.isBuffer(o.output))
        return false;
    if (o.version !== undefined)
        return (o.version & TAPLEAF_VERSION_MASK) === o.version;
    return true;
}
function isTaptree(scriptTree) {
    if (!Array(scriptTree))
        return isTapleaf(scriptTree);
    if (scriptTree.length !== 2)
        return false;
    return scriptTree.every((t) => isTaptree(t));
}
const Buffer256bit = typeforce$2.BufferN(32);
const Hash160bit = typeforce$2.BufferN(20);
const Hash256bit = typeforce$2.BufferN(32);
const Number = typeforce$2.Number; // tslint:disable-line variable-name
const Array = typeforce$2.Array;
const Boolean = typeforce$2.Boolean; // tslint:disable-line variable-name
const String = typeforce$2.String; // tslint:disable-line variable-name
const Buffer = typeforce$2.Buffer;
const Hex = typeforce$2.Hex;
const maybe = typeforce$2.maybe;
const tuple = typeforce$2.tuple;
const UInt8 = typeforce$2.UInt8;
const UInt32 = typeforce$2.UInt32;
const Function = typeforce$2.Function;
const BufferN = typeforce$2.BufferN;
const Null = typeforce$2.Null;
const oneOf = typeforce$2.oneOf;
const Nil = typeforce$2.Nil;
const anyOf = typeforce$2.anyOf;

var types = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Array: Array,
    BIP32Path: BIP32Path,
    Boolean: Boolean,
    Buffer: Buffer,
    Buffer256bit: Buffer256bit,
    BufferN: BufferN,
    ECPoint: ECPoint,
    Function: Function,
    Hash160bit: Hash160bit,
    Hash256bit: Hash256bit,
    Hex: Hex,
    Network: Network,
    Nil: Nil,
    Null: Null,
    Number: Number,
    Satoshi: Satoshi,
    Signer: Signer,
    String: String,
    TAPLEAF_VERSION_MASK: TAPLEAF_VERSION_MASK,
    UInt31: UInt31,
    UInt32: UInt32,
    UInt8: UInt8,
    anyOf: anyOf,
    isPoint: isPoint,
    isTapleaf: isTapleaf,
    isTaptree: isTaptree,
    maybe: maybe,
    oneOf: oneOf,
    stacksEqual: stacksEqual,
    tuple: tuple,
    typeforce: typeforce$2
});

const { typeforce: typeforce$1 } = types;
const ZERO = Buffer$1.alloc(1, 0);
function toDER(x) {
    let i = 0;
    while (x[i] === 0)
        ++i;
    if (i === x.length)
        return ZERO;
    x = x.slice(i);
    if (x[0] & 0x80)
        return Buffer$1.concat([ZERO, x], 1 + x.length);
    return x;
}
function fromDER(x) {
    if (x[0] === 0x00)
        x = x.slice(1);
    const buffer = Buffer$1.alloc(32, 0);
    const bstart = Math.max(0, 32 - x.length);
    x.copy(buffer, bstart);
    return buffer;
}
// BIP62: 1 byte hashType flag (only 0x01, 0x02, 0x03, 0x81, 0x82 and 0x83 are allowed)
function decode(buffer) {
    const hashType = buffer.readUInt8(buffer.length - 1);
    const hashTypeMod = hashType & ~0x80;
    if (hashTypeMod <= 0 || hashTypeMod >= 4)
        throw new Error('Invalid hashType ' + hashType);
    const decoded = decode$3(buffer.slice(0, -1));
    const r = fromDER(decoded.r);
    const s = fromDER(decoded.s);
    const signature = Buffer$1.concat([r, s], 64);
    return { signature, hashType };
}
function encode(signature, hashType) {
    typeforce$1({
        signature: BufferN(64),
        hashType: UInt8,
    }, { signature, hashType });
    const hashTypeMod = hashType & ~0x80;
    if (hashTypeMod <= 0 || hashTypeMod >= 4)
        throw new Error('Invalid hashType ' + hashType);
    const hashTypeBuffer = Buffer$1.allocUnsafe(1);
    hashTypeBuffer.writeUInt8(hashType, 0);
    const r = toDER(signature.slice(0, 32));
    const s = toDER(signature.slice(32, 64));
    return Buffer$1.concat([encode$3(r, s), hashTypeBuffer]);
}

var scriptSignature = /*#__PURE__*/Object.freeze({
    __proto__: null,
    decode: decode,
    encode: encode
});

const { typeforce } = types;
const OP_INT_BASE = OPS.OP_RESERVED; // OP_1 - 1
function isOPInt(value) {
    return (Number(value) &&
        (value === OPS.OP_0 ||
            (value >= OPS.OP_1 && value <= OPS.OP_16) ||
            value === OPS.OP_1NEGATE));
}
function isPushOnlyChunk(value) {
    return Buffer(value) || isOPInt(value);
}
function isPushOnly(value) {
    return Array(value) && value.every(isPushOnlyChunk);
}
function asMinimalOP(buffer) {
    if (buffer.length === 0)
        return OPS.OP_0;
    if (buffer.length !== 1)
        return;
    if (buffer[0] >= 1 && buffer[0] <= 16)
        return OP_INT_BASE + buffer[0];
    if (buffer[0] === 0x81)
        return OPS.OP_1NEGATE;
}
function chunksIsBuffer(buf) {
    return Buffer$1.isBuffer(buf);
}
function chunksIsArray(buf) {
    return Array(buf);
}
function singleChunkIsBuffer(buf) {
    return Buffer$1.isBuffer(buf);
}
function compile(chunks) {
    // TODO: remove me
    if (chunksIsBuffer(chunks))
        return chunks;
    typeforce(Array, chunks);
    const bufferSize = chunks.reduce((accum, chunk) => {
        // data chunk
        if (singleChunkIsBuffer(chunk)) {
            // adhere to BIP62.3, minimal push policy
            if (chunk.length === 1 && asMinimalOP(chunk) !== undefined) {
                return accum + 1;
            }
            return accum + encodingLength(chunk.length) + chunk.length;
        }
        // opcode
        return accum + 1;
    }, 0.0);
    const buffer = Buffer$1.allocUnsafe(bufferSize);
    let offset = 0;
    chunks.forEach((chunk) => {
        // data chunk
        if (singleChunkIsBuffer(chunk)) {
            // adhere to BIP62.3, minimal push policy
            const opcode = asMinimalOP(chunk);
            if (opcode !== undefined) {
                buffer.writeUInt8(opcode, offset);
                offset += 1;
                return;
            }
            offset += encode$2(buffer, chunk.length, offset);
            chunk.copy(buffer, offset);
            offset += chunk.length;
            // opcode
        }
        else {
            buffer.writeUInt8(chunk, offset);
            offset += 1;
        }
    });
    if (offset !== buffer.length)
        throw new Error('Could not decode chunks');
    return buffer;
}
function decompile(buffer) {
    // TODO: remove me
    if (chunksIsArray(buffer))
        return buffer;
    typeforce(Buffer, buffer);
    const chunks = [];
    let i = 0;
    while (i < buffer.length) {
        const opcode = buffer[i];
        // data chunk
        if (opcode > OPS.OP_0 && opcode <= OPS.OP_PUSHDATA4) {
            const d = decode$2(buffer, i);
            // did reading a pushDataInt fail?
            if (d === null)
                return null;
            i += d.size;
            // attempt to read too much data?
            if (i + d.number > buffer.length)
                return null;
            const data = buffer.slice(i, i + d.number);
            i += d.number;
            // decompile minimally
            const op = asMinimalOP(data);
            if (op !== undefined) {
                chunks.push(op);
            }
            else {
                chunks.push(data);
            }
            // opcode
        }
        else {
            chunks.push(opcode);
            i += 1;
        }
    }
    return chunks;
}
function toASM(chunks) {
    if (chunksIsBuffer(chunks)) {
        chunks = decompile(chunks);
    }
    return chunks
        .map((chunk) => {
        // data?
        if (singleChunkIsBuffer(chunk)) {
            const op = asMinimalOP(chunk);
            if (op === undefined)
                return chunk.toString('hex');
            chunk = op;
        }
        // opcode!
        return REVERSE_OPS[chunk];
    })
        .join(' ');
}
function fromASM(asm) {
    typeforce(String, asm);
    return compile(asm.split(' ').map((chunkStr) => {
        // opcode?
        if (OPS[chunkStr] !== undefined)
            return OPS[chunkStr];
        typeforce(Hex, chunkStr);
        // data!
        return Buffer$1.from(chunkStr, 'hex');
    }));
}
function toStack(chunks) {
    chunks = decompile(chunks);
    typeforce(isPushOnly, chunks);
    return chunks.map((op) => {
        if (singleChunkIsBuffer(op))
            return op;
        if (op === OPS.OP_0)
            return Buffer$1.allocUnsafe(0);
        return encode$1(op - OP_INT_BASE);
    });
}
function isCanonicalPubKey(buffer) {
    return isPoint(buffer);
}
function isDefinedHashType(hashType) {
    const hashTypeMod = hashType & ~0x80;
    // return hashTypeMod > SIGHASH_ALL && hashTypeMod < SIGHASH_SINGLE
    return hashTypeMod > 0x00 && hashTypeMod < 0x04;
}
function isCanonicalScriptSignature(buffer) {
    if (!Buffer$1.isBuffer(buffer))
        return false;
    if (!isDefinedHashType(buffer[buffer.length - 1]))
        return false;
    return check(buffer.slice(0, -1));
}
// tslint:disable-next-line variable-name
const number = scriptNumber;
const signature = scriptSignature;

var script = /*#__PURE__*/Object.freeze({
    __proto__: null,
    OPS: OPS,
    compile: compile,
    decompile: decompile,
    fromASM: fromASM,
    isCanonicalPubKey: isCanonicalPubKey,
    isCanonicalScriptSignature: isCanonicalScriptSignature,
    isDefinedHashType: isDefinedHashType,
    isPushOnly: isPushOnly,
    number: number,
    signature: signature,
    toASM: toASM,
    toStack: toStack
});

export { Buffer as B, Hash256bit as H, Null as N, Satoshi as S, TAPLEAF_VERSION_MASK as T, UInt32 as U, types as a, Number as b, compile as c, decompile as d, isCanonicalPubKey as e, isPoint as f, isPushOnly as g, toStack as h, isCanonicalScriptSignature as i, isTapleaf as j, isTaptree as k, stacksEqual as l, maybe as m, Hash160bit as n, UInt8 as o, toASM as p, script as q, signature as s, tuple as t };
//# sourceMappingURL=script-1d075504.mjs.map
