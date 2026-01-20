import { b as bitcoin } from './networks-2c79a09f.mjs';
import { f as isPoint, i as isCanonicalScriptSignature, c as compile, d as decompile, g as isPushOnly, h as toStack, j as isTapleaf, k as isTaptree, l as stacksEqual$2, T as TAPLEAF_VERSION_MASK, t as tuple, n as Hash160bit, o as UInt8, p as toASM, a as types } from './script-1d075504.mjs';
import { b as bs58check } from './index-6252fd9f.mjs';
import { B as Buffer$1, b as buffer } from './index-62190cc8.mjs';
import { hash160, sha256, taggedHash } from './crypto-1573ae3b.mjs';
import { t as typeforce$1 } from './typeforce-3fc8ed92.mjs';
import { OPS as OPS$5 } from './ops-a3396647.mjs';

function prop(object, name, f) {
    Object.defineProperty(object, name, {
        configurable: true,
        enumerable: true,
        get() {
            const _value = f.call(this);
            this[name] = _value;
            return _value;
        },
        set(_value) {
            Object.defineProperty(this, name, {
                configurable: true,
                enumerable: true,
                value: _value,
                writable: true,
            });
        },
    });
}
function value(f) {
    let _value;
    return () => {
        if (_value !== undefined)
            return _value;
        _value = f();
        return _value;
    };
}

const OPS$4 = OPS$5;
// input: {signature} {pubkey}
// output: OP_DUP OP_HASH160 {hash160(pubkey)} OP_EQUALVERIFY OP_CHECKSIG
function p2pkh(a, opts) {
    if (!a.address && !a.hash && !a.output && !a.pubkey && !a.input)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce$1({
        network: typeforce$1.maybe(typeforce$1.Object),
        address: typeforce$1.maybe(typeforce$1.String),
        hash: typeforce$1.maybe(typeforce$1.BufferN(20)),
        output: typeforce$1.maybe(typeforce$1.BufferN(25)),
        pubkey: typeforce$1.maybe(isPoint),
        signature: typeforce$1.maybe(isCanonicalScriptSignature),
        input: typeforce$1.maybe(typeforce$1.Buffer),
    }, a);
    const _address = value(() => {
        const payload = bs58check.decode(a.address);
        const version = payload.readUInt8(0);
        const hash = payload.slice(1);
        return { version, hash };
    });
    const _chunks = value(() => {
        return decompile(a.input);
    });
    const network = a.network || bitcoin;
    const o = { name: 'p2pkh', network };
    prop(o, 'address', () => {
        if (!o.hash)
            return;
        const payload = Buffer$1.allocUnsafe(21);
        payload.writeUInt8(network.pubKeyHash, 0);
        o.hash.copy(payload, 1);
        return bs58check.encode(payload);
    });
    prop(o, 'hash', () => {
        if (a.output)
            return a.output.slice(3, 23);
        if (a.address)
            return _address().hash;
        if (a.pubkey || o.pubkey)
            return hash160(a.pubkey || o.pubkey);
    });
    prop(o, 'output', () => {
        if (!o.hash)
            return;
        return compile([
            OPS$4.OP_DUP,
            OPS$4.OP_HASH160,
            o.hash,
            OPS$4.OP_EQUALVERIFY,
            OPS$4.OP_CHECKSIG,
        ]);
    });
    prop(o, 'pubkey', () => {
        if (!a.input)
            return;
        return _chunks()[1];
    });
    prop(o, 'signature', () => {
        if (!a.input)
            return;
        return _chunks()[0];
    });
    prop(o, 'input', () => {
        if (!a.pubkey)
            return;
        if (!a.signature)
            return;
        return compile([a.signature, a.pubkey]);
    });
    prop(o, 'witness', () => {
        if (!o.input)
            return;
        return [];
    });
    // extended validation
    if (opts.validate) {
        let hash = Buffer$1.from([]);
        if (a.address) {
            if (_address().version !== network.pubKeyHash)
                throw new TypeError('Invalid version or Network mismatch');
            if (_address().hash.length !== 20)
                throw new TypeError('Invalid address');
            hash = _address().hash;
        }
        if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
                throw new TypeError('Hash mismatch');
            else
                hash = a.hash;
        }
        if (a.output) {
            if (a.output.length !== 25 ||
                a.output[0] !== OPS$4.OP_DUP ||
                a.output[1] !== OPS$4.OP_HASH160 ||
                a.output[2] !== 0x14 ||
                a.output[23] !== OPS$4.OP_EQUALVERIFY ||
                a.output[24] !== OPS$4.OP_CHECKSIG)
                throw new TypeError('Output is invalid');
            const hash2 = a.output.slice(3, 23);
            if (hash.length > 0 && !hash.equals(hash2))
                throw new TypeError('Hash mismatch');
            else
                hash = hash2;
        }
        if (a.pubkey) {
            const pkh = hash160(a.pubkey);
            if (hash.length > 0 && !hash.equals(pkh))
                throw new TypeError('Hash mismatch');
            else
                hash = pkh;
        }
        if (a.input) {
            const chunks = _chunks();
            if (chunks.length !== 2)
                throw new TypeError('Input is invalid');
            if (!isCanonicalScriptSignature(chunks[0]))
                throw new TypeError('Input has invalid signature');
            if (!isPoint(chunks[1]))
                throw new TypeError('Input has invalid pubkey');
            if (a.signature && !a.signature.equals(chunks[0]))
                throw new TypeError('Signature mismatch');
            if (a.pubkey && !a.pubkey.equals(chunks[1]))
                throw new TypeError('Pubkey mismatch');
            const pkh = hash160(chunks[1]);
            if (hash.length > 0 && !hash.equals(pkh))
                throw new TypeError('Hash mismatch');
        }
    }
    return Object.assign(o, a);
}

const OPS$3 = OPS$5;
function stacksEqual$1(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((x, i) => {
        return x.equals(b[i]);
    });
}
// input: [redeemScriptSig ...] {redeemScript}
// witness: <?>
// output: OP_HASH160 {hash160(redeemScript)} OP_EQUAL
function p2sh(a, opts) {
    if (!a.address && !a.hash && !a.output && !a.redeem && !a.input)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce$1({
        network: typeforce$1.maybe(typeforce$1.Object),
        address: typeforce$1.maybe(typeforce$1.String),
        hash: typeforce$1.maybe(typeforce$1.BufferN(20)),
        output: typeforce$1.maybe(typeforce$1.BufferN(23)),
        redeem: typeforce$1.maybe({
            network: typeforce$1.maybe(typeforce$1.Object),
            output: typeforce$1.maybe(typeforce$1.Buffer),
            input: typeforce$1.maybe(typeforce$1.Buffer),
            witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
        }),
        input: typeforce$1.maybe(typeforce$1.Buffer),
        witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
    }, a);
    let network = a.network;
    if (!network) {
        network = (a.redeem && a.redeem.network) || bitcoin;
    }
    const o = { network };
    const _address = value(() => {
        const payload = bs58check.decode(a.address);
        const version = payload.readUInt8(0);
        const hash = payload.slice(1);
        return { version, hash };
    });
    const _chunks = value(() => {
        return decompile(a.input);
    });
    const _redeem = value(() => {
        const chunks = _chunks();
        const lastChunk = chunks[chunks.length - 1];
        return {
            network,
            output: lastChunk === OPS$3.OP_FALSE ? Buffer$1.from([]) : lastChunk,
            input: compile(chunks.slice(0, -1)),
            witness: a.witness || [],
        };
    });
    // output dependents
    prop(o, 'address', () => {
        if (!o.hash)
            return;
        const payload = Buffer$1.allocUnsafe(21);
        payload.writeUInt8(o.network.scriptHash, 0);
        o.hash.copy(payload, 1);
        return bs58check.encode(payload);
    });
    prop(o, 'hash', () => {
        // in order of least effort
        if (a.output)
            return a.output.slice(2, 22);
        if (a.address)
            return _address().hash;
        if (o.redeem && o.redeem.output)
            return hash160(o.redeem.output);
    });
    prop(o, 'output', () => {
        if (!o.hash)
            return;
        return compile([OPS$3.OP_HASH160, o.hash, OPS$3.OP_EQUAL]);
    });
    // input dependents
    prop(o, 'redeem', () => {
        if (!a.input)
            return;
        return _redeem();
    });
    prop(o, 'input', () => {
        if (!a.redeem || !a.redeem.input || !a.redeem.output)
            return;
        return compile([].concat(decompile(a.redeem.input), a.redeem.output));
    });
    prop(o, 'witness', () => {
        if (o.redeem && o.redeem.witness)
            return o.redeem.witness;
        if (o.input)
            return [];
    });
    prop(o, 'name', () => {
        const nameParts = ['p2sh'];
        if (o.redeem !== undefined && o.redeem.name !== undefined)
            nameParts.push(o.redeem.name);
        return nameParts.join('-');
    });
    if (opts.validate) {
        let hash = Buffer$1.from([]);
        if (a.address) {
            if (_address().version !== network.scriptHash)
                throw new TypeError('Invalid version or Network mismatch');
            if (_address().hash.length !== 20)
                throw new TypeError('Invalid address');
            hash = _address().hash;
        }
        if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
                throw new TypeError('Hash mismatch');
            else
                hash = a.hash;
        }
        if (a.output) {
            if (a.output.length !== 23 ||
                a.output[0] !== OPS$3.OP_HASH160 ||
                a.output[1] !== 0x14 ||
                a.output[22] !== OPS$3.OP_EQUAL)
                throw new TypeError('Output is invalid');
            const hash2 = a.output.slice(2, 22);
            if (hash.length > 0 && !hash.equals(hash2))
                throw new TypeError('Hash mismatch');
            else
                hash = hash2;
        }
        // inlined to prevent 'no-inner-declarations' failing
        const checkRedeem = (redeem) => {
            // is the redeem output empty/invalid?
            if (redeem.output) {
                const decompile$1 = decompile(redeem.output);
                if (!decompile$1 || decompile$1.length < 1)
                    throw new TypeError('Redeem.output too short');
                // match hash against other sources
                const hash2 = hash160(redeem.output);
                if (hash.length > 0 && !hash.equals(hash2))
                    throw new TypeError('Hash mismatch');
                else
                    hash = hash2;
            }
            if (redeem.input) {
                const hasInput = redeem.input.length > 0;
                const hasWitness = redeem.witness && redeem.witness.length > 0;
                if (!hasInput && !hasWitness)
                    throw new TypeError('Empty input');
                if (hasInput && hasWitness)
                    throw new TypeError('Input and witness provided');
                if (hasInput) {
                    const richunks = decompile(redeem.input);
                    if (!isPushOnly(richunks))
                        throw new TypeError('Non push-only scriptSig');
                }
            }
        };
        if (a.input) {
            const chunks = _chunks();
            if (!chunks || chunks.length < 1)
                throw new TypeError('Input too short');
            if (!Buffer$1.isBuffer(_redeem().output))
                throw new TypeError('Input is invalid');
            checkRedeem(_redeem());
        }
        if (a.redeem) {
            if (a.redeem.network && a.redeem.network !== network)
                throw new TypeError('Network mismatch');
            if (a.input) {
                const redeem = _redeem();
                if (a.redeem.output && !a.redeem.output.equals(redeem.output))
                    throw new TypeError('Redeem.output mismatch');
                if (a.redeem.input && !a.redeem.input.equals(redeem.input))
                    throw new TypeError('Redeem.input mismatch');
            }
            checkRedeem(a.redeem);
        }
        if (a.witness) {
            if (a.redeem &&
                a.redeem.witness &&
                !stacksEqual$1(a.redeem.witness, a.witness))
                throw new TypeError('Witness and redeem.witness mismatch');
        }
    }
    return Object.assign(o, a);
}

var bech32$1 = {};

Object.defineProperty(bech32$1, '__esModule', { value: true });
bech32$1.bech32m = bech32$1.bech32 = void 0;
const ALPHABET = 'qpzry9x8gf2tvdw0s3jn54khce6mua7l';
const ALPHABET_MAP = {};
for (let z = 0; z < ALPHABET.length; z++) {
  const x = ALPHABET.charAt(z);
  ALPHABET_MAP[x] = z;
}
function polymodStep(pre) {
  const b = pre >> 25;
  return (
    ((pre & 0x1ffffff) << 5) ^
    (-((b >> 0) & 1) & 0x3b6a57b2) ^
    (-((b >> 1) & 1) & 0x26508e6d) ^
    (-((b >> 2) & 1) & 0x1ea119fa) ^
    (-((b >> 3) & 1) & 0x3d4233dd) ^
    (-((b >> 4) & 1) & 0x2a1462b3)
  );
}
function prefixChk(prefix) {
  let chk = 1;
  for (let i = 0; i < prefix.length; ++i) {
    const c = prefix.charCodeAt(i);
    if (c < 33 || c > 126) return 'Invalid prefix (' + prefix + ')';
    chk = polymodStep(chk) ^ (c >> 5);
  }
  chk = polymodStep(chk);
  for (let i = 0; i < prefix.length; ++i) {
    const v = prefix.charCodeAt(i);
    chk = polymodStep(chk) ^ (v & 0x1f);
  }
  return chk;
}
function convert(data, inBits, outBits, pad) {
  let value = 0;
  let bits = 0;
  const maxV = (1 << outBits) - 1;
  const result = [];
  for (let i = 0; i < data.length; ++i) {
    value = (value << inBits) | data[i];
    bits += inBits;
    while (bits >= outBits) {
      bits -= outBits;
      result.push((value >> bits) & maxV);
    }
  }
  if (pad) {
    if (bits > 0) {
      result.push((value << (outBits - bits)) & maxV);
    }
  } else {
    if (bits >= inBits) return 'Excess padding';
    if ((value << (outBits - bits)) & maxV) return 'Non-zero padding';
  }
  return result;
}
function toWords(bytes) {
  return convert(bytes, 8, 5, true);
}
function fromWordsUnsafe(words) {
  const res = convert(words, 5, 8, false);
  if (Array.isArray(res)) return res;
}
function fromWords(words) {
  const res = convert(words, 5, 8, false);
  if (Array.isArray(res)) return res;
  throw new Error(res);
}
function getLibraryFromEncoding(encoding) {
  let ENCODING_CONST;
  if (encoding === 'bech32') {
    ENCODING_CONST = 1;
  } else {
    ENCODING_CONST = 0x2bc830a3;
  }
  function encode(prefix, words, LIMIT) {
    LIMIT = LIMIT || 90;
    if (prefix.length + 7 + words.length > LIMIT)
      throw new TypeError('Exceeds length limit');
    prefix = prefix.toLowerCase();
    // determine chk mod
    let chk = prefixChk(prefix);
    if (typeof chk === 'string') throw new Error(chk);
    let result = prefix + '1';
    for (let i = 0; i < words.length; ++i) {
      const x = words[i];
      if (x >> 5 !== 0) throw new Error('Non 5-bit word');
      chk = polymodStep(chk) ^ x;
      result += ALPHABET.charAt(x);
    }
    for (let i = 0; i < 6; ++i) {
      chk = polymodStep(chk);
    }
    chk ^= ENCODING_CONST;
    for (let i = 0; i < 6; ++i) {
      const v = (chk >> ((5 - i) * 5)) & 0x1f;
      result += ALPHABET.charAt(v);
    }
    return result;
  }
  function __decode(str, LIMIT) {
    LIMIT = LIMIT || 90;
    if (str.length < 8) return str + ' too short';
    if (str.length > LIMIT) return 'Exceeds length limit';
    // don't allow mixed case
    const lowered = str.toLowerCase();
    const uppered = str.toUpperCase();
    if (str !== lowered && str !== uppered) return 'Mixed-case string ' + str;
    str = lowered;
    const split = str.lastIndexOf('1');
    if (split === -1) return 'No separator character for ' + str;
    if (split === 0) return 'Missing prefix for ' + str;
    const prefix = str.slice(0, split);
    const wordChars = str.slice(split + 1);
    if (wordChars.length < 6) return 'Data too short';
    let chk = prefixChk(prefix);
    if (typeof chk === 'string') return chk;
    const words = [];
    for (let i = 0; i < wordChars.length; ++i) {
      const c = wordChars.charAt(i);
      const v = ALPHABET_MAP[c];
      if (v === undefined) return 'Unknown character ' + c;
      chk = polymodStep(chk) ^ v;
      // not in the checksum?
      if (i + 6 >= wordChars.length) continue;
      words.push(v);
    }
    if (chk !== ENCODING_CONST) return 'Invalid checksum for ' + str;
    return { prefix, words };
  }
  function decodeUnsafe(str, LIMIT) {
    const res = __decode(str, LIMIT);
    if (typeof res === 'object') return res;
  }
  function decode(str, LIMIT) {
    const res = __decode(str, LIMIT);
    if (typeof res === 'object') return res;
    throw new Error(res);
  }
  return {
    decodeUnsafe,
    decode,
    encode,
    toWords,
    fromWordsUnsafe,
    fromWords,
  };
}
bech32$1.bech32 = getLibraryFromEncoding('bech32');
bech32$1.bech32m = getLibraryFromEncoding('bech32m');

const bech32 = bech32$1.bech32;
const bech32m = bech32$1.bech32m;

const OPS$2 = OPS$5;
const EMPTY_BUFFER$1 = Buffer$1.alloc(0);
// witness: {signature} {pubKey}
// input: <>
// output: OP_0 {pubKeyHash}
function p2wpkh(a, opts) {
    if (!a.address && !a.hash && !a.output && !a.pubkey && !a.witness)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce$1({
        address: typeforce$1.maybe(typeforce$1.String),
        hash: typeforce$1.maybe(typeforce$1.BufferN(20)),
        input: typeforce$1.maybe(typeforce$1.BufferN(0)),
        network: typeforce$1.maybe(typeforce$1.Object),
        output: typeforce$1.maybe(typeforce$1.BufferN(22)),
        pubkey: typeforce$1.maybe(isPoint),
        signature: typeforce$1.maybe(isCanonicalScriptSignature),
        witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
    }, a);
    const _address = value(() => {
        const result = bech32.decode(a.address);
        const version = result.words.shift();
        const data = bech32.fromWords(result.words);
        return {
            version,
            prefix: result.prefix,
            data: Buffer$1.from(data),
        };
    });
    const network = a.network || bitcoin;
    const o = { name: 'p2wpkh', network };
    prop(o, 'address', () => {
        if (!o.hash)
            return;
        const words = bech32.toWords(o.hash);
        words.unshift(0x00);
        return bech32.encode(network.bech32, words);
    });
    prop(o, 'hash', () => {
        if (a.output)
            return a.output.slice(2, 22);
        if (a.address)
            return _address().data;
        if (a.pubkey || o.pubkey)
            return hash160(a.pubkey || o.pubkey);
    });
    prop(o, 'output', () => {
        if (!o.hash)
            return;
        return compile([OPS$2.OP_0, o.hash]);
    });
    prop(o, 'pubkey', () => {
        if (a.pubkey)
            return a.pubkey;
        if (!a.witness)
            return;
        return a.witness[1];
    });
    prop(o, 'signature', () => {
        if (!a.witness)
            return;
        return a.witness[0];
    });
    prop(o, 'input', () => {
        if (!o.witness)
            return;
        return EMPTY_BUFFER$1;
    });
    prop(o, 'witness', () => {
        if (!a.pubkey)
            return;
        if (!a.signature)
            return;
        return [a.signature, a.pubkey];
    });
    // extended validation
    if (opts.validate) {
        let hash = Buffer$1.from([]);
        if (a.address) {
            if (network && network.bech32 !== _address().prefix)
                throw new TypeError('Invalid prefix or Network mismatch');
            if (_address().version !== 0x00)
                throw new TypeError('Invalid address version');
            if (_address().data.length !== 20)
                throw new TypeError('Invalid address data');
            hash = _address().data;
        }
        if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
                throw new TypeError('Hash mismatch');
            else
                hash = a.hash;
        }
        if (a.output) {
            if (a.output.length !== 22 ||
                a.output[0] !== OPS$2.OP_0 ||
                a.output[1] !== 0x14)
                throw new TypeError('Output is invalid');
            if (hash.length > 0 && !hash.equals(a.output.slice(2)))
                throw new TypeError('Hash mismatch');
            else
                hash = a.output.slice(2);
        }
        if (a.pubkey) {
            const pkh = hash160(a.pubkey);
            if (hash.length > 0 && !hash.equals(pkh))
                throw new TypeError('Hash mismatch');
            else
                hash = pkh;
            if (!isPoint(a.pubkey) || a.pubkey.length !== 33)
                throw new TypeError('Invalid pubkey for p2wpkh');
        }
        if (a.witness) {
            if (a.witness.length !== 2)
                throw new TypeError('Witness is invalid');
            if (!isCanonicalScriptSignature(a.witness[0]))
                throw new TypeError('Witness has invalid signature');
            if (!isPoint(a.witness[1]) || a.witness[1].length !== 33)
                throw new TypeError('Witness has invalid pubkey');
            if (a.signature && !a.signature.equals(a.witness[0]))
                throw new TypeError('Signature mismatch');
            if (a.pubkey && !a.pubkey.equals(a.witness[1]))
                throw new TypeError('Pubkey mismatch');
            const pkh = hash160(a.witness[1]);
            if (hash.length > 0 && !hash.equals(pkh))
                throw new TypeError('Hash mismatch');
        }
    }
    return Object.assign(o, a);
}

const OPS$1 = OPS$5;
const EMPTY_BUFFER = Buffer$1.alloc(0);
function stacksEqual(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((x, i) => {
        return x.equals(b[i]);
    });
}
function chunkHasUncompressedPubkey(chunk) {
    if (Buffer$1.isBuffer(chunk) &&
        chunk.length === 65 &&
        chunk[0] === 0x04 &&
        isPoint(chunk)) {
        return true;
    }
    else {
        return false;
    }
}
// input: <>
// witness: [redeemScriptSig ...] {redeemScript}
// output: OP_0 {sha256(redeemScript)}
function p2wsh(a, opts) {
    if (!a.address && !a.hash && !a.output && !a.redeem && !a.witness)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce$1({
        network: typeforce$1.maybe(typeforce$1.Object),
        address: typeforce$1.maybe(typeforce$1.String),
        hash: typeforce$1.maybe(typeforce$1.BufferN(32)),
        output: typeforce$1.maybe(typeforce$1.BufferN(34)),
        redeem: typeforce$1.maybe({
            input: typeforce$1.maybe(typeforce$1.Buffer),
            network: typeforce$1.maybe(typeforce$1.Object),
            output: typeforce$1.maybe(typeforce$1.Buffer),
            witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
        }),
        input: typeforce$1.maybe(typeforce$1.BufferN(0)),
        witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
    }, a);
    const _address = value(() => {
        const result = bech32.decode(a.address);
        const version = result.words.shift();
        const data = bech32.fromWords(result.words);
        return {
            version,
            prefix: result.prefix,
            data: Buffer$1.from(data),
        };
    });
    const _rchunks = value(() => {
        return decompile(a.redeem.input);
    });
    let network = a.network;
    if (!network) {
        network = (a.redeem && a.redeem.network) || bitcoin;
    }
    const o = { network };
    prop(o, 'address', () => {
        if (!o.hash)
            return;
        const words = bech32.toWords(o.hash);
        words.unshift(0x00);
        return bech32.encode(network.bech32, words);
    });
    prop(o, 'hash', () => {
        if (a.output)
            return a.output.slice(2);
        if (a.address)
            return _address().data;
        if (o.redeem && o.redeem.output)
            return sha256(o.redeem.output);
    });
    prop(o, 'output', () => {
        if (!o.hash)
            return;
        return compile([OPS$1.OP_0, o.hash]);
    });
    prop(o, 'redeem', () => {
        if (!a.witness)
            return;
        return {
            output: a.witness[a.witness.length - 1],
            input: EMPTY_BUFFER,
            witness: a.witness.slice(0, -1),
        };
    });
    prop(o, 'input', () => {
        if (!o.witness)
            return;
        return EMPTY_BUFFER;
    });
    prop(o, 'witness', () => {
        // transform redeem input to witness stack?
        if (a.redeem &&
            a.redeem.input &&
            a.redeem.input.length > 0 &&
            a.redeem.output &&
            a.redeem.output.length > 0) {
            const stack = toStack(_rchunks());
            // assign, and blank the existing input
            o.redeem = Object.assign({ witness: stack }, a.redeem);
            o.redeem.input = EMPTY_BUFFER;
            return [].concat(stack, a.redeem.output);
        }
        if (!a.redeem)
            return;
        if (!a.redeem.output)
            return;
        if (!a.redeem.witness)
            return;
        return [].concat(a.redeem.witness, a.redeem.output);
    });
    prop(o, 'name', () => {
        const nameParts = ['p2wsh'];
        if (o.redeem !== undefined && o.redeem.name !== undefined)
            nameParts.push(o.redeem.name);
        return nameParts.join('-');
    });
    // extended validation
    if (opts.validate) {
        let hash = Buffer$1.from([]);
        if (a.address) {
            if (_address().prefix !== network.bech32)
                throw new TypeError('Invalid prefix or Network mismatch');
            if (_address().version !== 0x00)
                throw new TypeError('Invalid address version');
            if (_address().data.length !== 32)
                throw new TypeError('Invalid address data');
            hash = _address().data;
        }
        if (a.hash) {
            if (hash.length > 0 && !hash.equals(a.hash))
                throw new TypeError('Hash mismatch');
            else
                hash = a.hash;
        }
        if (a.output) {
            if (a.output.length !== 34 ||
                a.output[0] !== OPS$1.OP_0 ||
                a.output[1] !== 0x20)
                throw new TypeError('Output is invalid');
            const hash2 = a.output.slice(2);
            if (hash.length > 0 && !hash.equals(hash2))
                throw new TypeError('Hash mismatch');
            else
                hash = hash2;
        }
        if (a.redeem) {
            if (a.redeem.network && a.redeem.network !== network)
                throw new TypeError('Network mismatch');
            // is there two redeem sources?
            if (a.redeem.input &&
                a.redeem.input.length > 0 &&
                a.redeem.witness &&
                a.redeem.witness.length > 0)
                throw new TypeError('Ambiguous witness source');
            // is the redeem output non-empty?
            if (a.redeem.output) {
                if (decompile(a.redeem.output).length === 0)
                    throw new TypeError('Redeem.output is invalid');
                // match hash against other sources
                const hash2 = sha256(a.redeem.output);
                if (hash.length > 0 && !hash.equals(hash2))
                    throw new TypeError('Hash mismatch');
                else
                    hash = hash2;
            }
            if (a.redeem.input && !isPushOnly(_rchunks()))
                throw new TypeError('Non push-only scriptSig');
            if (a.witness &&
                a.redeem.witness &&
                !stacksEqual(a.witness, a.redeem.witness))
                throw new TypeError('Witness and redeem.witness mismatch');
            if ((a.redeem.input && _rchunks().some(chunkHasUncompressedPubkey)) ||
                (a.redeem.output &&
                    (decompile(a.redeem.output) || []).some(chunkHasUncompressedPubkey))) {
                throw new TypeError('redeem.input or redeem.output contains uncompressed pubkey');
            }
        }
        if (a.witness && a.witness.length > 0) {
            const wScript = a.witness[a.witness.length - 1];
            if (a.redeem && a.redeem.output && !a.redeem.output.equals(wScript))
                throw new TypeError('Witness and redeem.output mismatch');
            if (a.witness.some(chunkHasUncompressedPubkey) ||
                (decompile(wScript) || []).some(chunkHasUncompressedPubkey))
                throw new TypeError('Witness contains uncompressed pubkey');
        }
    }
    return Object.assign(o, a);
}

const _ECCLIB_CACHE = {};
function getEccLib() {
    if (!_ECCLIB_CACHE.eccLib)
        throw new Error('No ECC Library provided. You must call initEccLib() with a valid TinySecp256k1Interface instance');
    return _ECCLIB_CACHE.eccLib;
}

var Buffer = buffer.Buffer;

// Number.MAX_SAFE_INTEGER
var MAX_SAFE_INTEGER = 9007199254740991;

function checkUInt53(n) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError('value out of range');
}

function encode(number, buffer, offset) {
  checkUInt53(number);

  if (!buffer) buffer = Buffer.allocUnsafe(encodingLength(number));
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;

  // 8 bit
  if (number < 0xfd) {
    buffer.writeUInt8(number, offset);
    encode.bytes = 1;

    // 16 bit
  } else if (number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset);
    buffer.writeUInt16LE(number, offset + 1);
    encode.bytes = 3;

    // 32 bit
  } else if (number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset);
    buffer.writeUInt32LE(number, offset + 1);
    encode.bytes = 5;

    // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset);
    buffer.writeUInt32LE(number >>> 0, offset + 1);
    buffer.writeUInt32LE((number / 0x100000000) | 0, offset + 5);
    encode.bytes = 9;
  }

  return buffer;
}

function decode(buffer, offset) {
  if (!Buffer.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;

  var first = buffer.readUInt8(offset);

  // 8 bit
  if (first < 0xfd) {
    decode.bytes = 1;
    return first;

    // 16 bit
  } else if (first === 0xfd) {
    decode.bytes = 3;
    return buffer.readUInt16LE(offset + 1);

    // 32 bit
  } else if (first === 0xfe) {
    decode.bytes = 5;
    return buffer.readUInt32LE(offset + 1);

    // 64 bit
  } else {
    decode.bytes = 9;
    var lo = buffer.readUInt32LE(offset + 1);
    var hi = buffer.readUInt32LE(offset + 5);
    var number = hi * 0x0100000000 + lo;
    checkUInt53(number);

    return number;
  }
}

function encodingLength(number) {
  checkUInt53(number);

  return number < 0xfd
    ? 1
    : number <= 0xffff
    ? 3
    : number <= 0xffffffff
    ? 5
    : 9;
}

var varuintBitcoin = {
  encode: encode,
  decode: decode,
  encodingLength: encodingLength,
};

const LEAF_VERSION_TAPSCRIPT = 0xc0;
const isHashBranch = (ht) => 'left' in ht && 'right' in ht;
function rootHashFromPath(controlBlock, leafHash) {
    if (controlBlock.length < 33)
        throw new TypeError(`The control-block length is too small. Got ${controlBlock.length}, expected min 33.`);
    const m = (controlBlock.length - 33) / 32;
    let kj = leafHash;
    for (let j = 0; j < m; j++) {
        const ej = controlBlock.slice(33 + 32 * j, 65 + 32 * j);
        if (kj.compare(ej) < 0) {
            kj = tapBranchHash(kj, ej);
        }
        else {
            kj = tapBranchHash(ej, kj);
        }
    }
    return kj;
}
/**
 * Build a hash tree of merkle nodes from the scripts binary tree.
 * @param scriptTree - the tree of scripts to pairwise hash.
 */
function toHashTree(scriptTree) {
    if (isTapleaf(scriptTree))
        return { hash: tapleafHash(scriptTree) };
    const hashes = [toHashTree(scriptTree[0]), toHashTree(scriptTree[1])];
    hashes.sort((a, b) => a.hash.compare(b.hash));
    const [left, right] = hashes;
    return {
        hash: tapBranchHash(left.hash, right.hash),
        left,
        right,
    };
}
/**
 * Given a HashTree, finds the path from a particular hash to the root.
 * @param node - the root of the tree
 * @param hash - the hash to search for
 * @returns - array of sibling hashes, from leaf (inclusive) to root
 * (exclusive) needed to prove inclusion of the specified hash. undefined if no
 * path is found
 */
function findScriptPath(node, hash) {
    if (isHashBranch(node)) {
        const leftPath = findScriptPath(node.left, hash);
        if (leftPath !== undefined)
            return [...leftPath, node.right.hash];
        const rightPath = findScriptPath(node.right, hash);
        if (rightPath !== undefined)
            return [...rightPath, node.left.hash];
    }
    else if (node.hash.equals(hash)) {
        return [];
    }
    return undefined;
}
function tapleafHash(leaf) {
    const version = leaf.version || LEAF_VERSION_TAPSCRIPT;
    return taggedHash('TapLeaf', Buffer$1.concat([Buffer$1.from([version]), serializeScript(leaf.output)]));
}
function tapTweakHash(pubKey, h) {
    return taggedHash('TapTweak', Buffer$1.concat(h ? [pubKey, h] : [pubKey]));
}
function tweakKey(pubKey, h) {
    if (!Buffer$1.isBuffer(pubKey))
        return null;
    if (pubKey.length !== 32)
        return null;
    if (h && h.length !== 32)
        return null;
    const tweakHash = tapTweakHash(pubKey, h);
    const res = getEccLib().xOnlyPointAddTweak(pubKey, tweakHash);
    if (!res || res.xOnlyPubkey === null)
        return null;
    return {
        parity: res.parity,
        x: Buffer$1.from(res.xOnlyPubkey),
    };
}
function tapBranchHash(a, b) {
    return taggedHash('TapBranch', Buffer$1.concat([a, b]));
}
function serializeScript(s) {
    const varintLen = varuintBitcoin.encodingLength(s.length);
    const buffer = Buffer$1.allocUnsafe(varintLen); // better
    varuintBitcoin.encode(s.length, buffer);
    return Buffer$1.concat([buffer, s]);
}

const OPS = OPS$5;
const TAPROOT_WITNESS_VERSION = 0x01;
const ANNEX_PREFIX = 0x50;
function p2tr(a, opts) {
    if (!a.address &&
        !a.output &&
        !a.pubkey &&
        !a.internalPubkey &&
        !(a.witness && a.witness.length > 1))
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce$1({
        address: typeforce$1.maybe(typeforce$1.String),
        input: typeforce$1.maybe(typeforce$1.BufferN(0)),
        network: typeforce$1.maybe(typeforce$1.Object),
        output: typeforce$1.maybe(typeforce$1.BufferN(34)),
        internalPubkey: typeforce$1.maybe(typeforce$1.BufferN(32)),
        hash: typeforce$1.maybe(typeforce$1.BufferN(32)),
        pubkey: typeforce$1.maybe(typeforce$1.BufferN(32)),
        signature: typeforce$1.maybe(typeforce$1.anyOf(typeforce$1.BufferN(64), typeforce$1.BufferN(65))),
        witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
        scriptTree: typeforce$1.maybe(isTaptree),
        redeem: typeforce$1.maybe({
            output: typeforce$1.maybe(typeforce$1.Buffer),
            redeemVersion: typeforce$1.maybe(typeforce$1.Number),
            witness: typeforce$1.maybe(typeforce$1.arrayOf(typeforce$1.Buffer)),
        }),
        redeemVersion: typeforce$1.maybe(typeforce$1.Number),
    }, a);
    const _address = value(() => {
        return fromBech32(a.address);
    });
    // remove annex if present, ignored by taproot
    const _witness = value(() => {
        if (!a.witness || !a.witness.length)
            return;
        if (a.witness.length >= 2 &&
            a.witness[a.witness.length - 1][0] === ANNEX_PREFIX) {
            return a.witness.slice(0, -1);
        }
        return a.witness.slice();
    });
    const _hashTree = value(() => {
        if (a.scriptTree)
            return toHashTree(a.scriptTree);
        if (a.hash)
            return { hash: a.hash };
        return;
    });
    const network = a.network || bitcoin;
    const o = { name: 'p2tr', network };
    prop(o, 'address', () => {
        if (!o.pubkey)
            return;
        const words = bech32m.toWords(o.pubkey);
        words.unshift(TAPROOT_WITNESS_VERSION);
        return bech32m.encode(network.bech32, words);
    });
    prop(o, 'hash', () => {
        const hashTree = _hashTree();
        if (hashTree)
            return hashTree.hash;
        const w = _witness();
        if (w && w.length > 1) {
            const controlBlock = w[w.length - 1];
            const leafVersion = controlBlock[0] & TAPLEAF_VERSION_MASK;
            const script = w[w.length - 2];
            const leafHash = tapleafHash({ output: script, version: leafVersion });
            return rootHashFromPath(controlBlock, leafHash);
        }
        return null;
    });
    prop(o, 'output', () => {
        if (!o.pubkey)
            return;
        return compile([OPS.OP_1, o.pubkey]);
    });
    prop(o, 'redeemVersion', () => {
        if (a.redeemVersion)
            return a.redeemVersion;
        if (a.redeem &&
            a.redeem.redeemVersion !== undefined &&
            a.redeem.redeemVersion !== null) {
            return a.redeem.redeemVersion;
        }
        return LEAF_VERSION_TAPSCRIPT;
    });
    prop(o, 'redeem', () => {
        const witness = _witness(); // witness without annex
        if (!witness || witness.length < 2)
            return;
        return {
            output: witness[witness.length - 2],
            witness: witness.slice(0, -2),
            redeemVersion: witness[witness.length - 1][0] & TAPLEAF_VERSION_MASK,
        };
    });
    prop(o, 'pubkey', () => {
        if (a.pubkey)
            return a.pubkey;
        if (a.output)
            return a.output.slice(2);
        if (a.address)
            return _address().data;
        if (o.internalPubkey) {
            const tweakedKey = tweakKey(o.internalPubkey, o.hash);
            if (tweakedKey)
                return tweakedKey.x;
        }
    });
    prop(o, 'internalPubkey', () => {
        if (a.internalPubkey)
            return a.internalPubkey;
        const witness = _witness();
        if (witness && witness.length > 1)
            return witness[witness.length - 1].slice(1, 33);
    });
    prop(o, 'signature', () => {
        if (a.signature)
            return a.signature;
        const witness = _witness(); // witness without annex
        if (!witness || witness.length !== 1)
            return;
        return witness[0];
    });
    prop(o, 'witness', () => {
        if (a.witness)
            return a.witness;
        const hashTree = _hashTree();
        if (hashTree && a.redeem && a.redeem.output && a.internalPubkey) {
            const leafHash = tapleafHash({
                output: a.redeem.output,
                version: o.redeemVersion,
            });
            const path = findScriptPath(hashTree, leafHash);
            if (!path)
                return;
            const outputKey = tweakKey(a.internalPubkey, hashTree.hash);
            if (!outputKey)
                return;
            const controlBock = Buffer$1.concat([
                Buffer$1.from([o.redeemVersion | outputKey.parity]),
                a.internalPubkey,
            ].concat(path));
            return [a.redeem.output, controlBock];
        }
        if (a.signature)
            return [a.signature];
    });
    // extended validation
    if (opts.validate) {
        let pubkey = Buffer$1.from([]);
        if (a.address) {
            if (network && network.bech32 !== _address().prefix)
                throw new TypeError('Invalid prefix or Network mismatch');
            if (_address().version !== TAPROOT_WITNESS_VERSION)
                throw new TypeError('Invalid address version');
            if (_address().data.length !== 32)
                throw new TypeError('Invalid address data');
            pubkey = _address().data;
        }
        if (a.pubkey) {
            if (pubkey.length > 0 && !pubkey.equals(a.pubkey))
                throw new TypeError('Pubkey mismatch');
            else
                pubkey = a.pubkey;
        }
        if (a.output) {
            if (a.output.length !== 34 ||
                a.output[0] !== OPS.OP_1 ||
                a.output[1] !== 0x20)
                throw new TypeError('Output is invalid');
            if (pubkey.length > 0 && !pubkey.equals(a.output.slice(2)))
                throw new TypeError('Pubkey mismatch');
            else
                pubkey = a.output.slice(2);
        }
        if (a.internalPubkey) {
            const tweakedKey = tweakKey(a.internalPubkey, o.hash);
            if (pubkey.length > 0 && !pubkey.equals(tweakedKey.x))
                throw new TypeError('Pubkey mismatch');
            else
                pubkey = tweakedKey.x;
        }
        if (pubkey && pubkey.length) {
            if (!getEccLib().isXOnlyPoint(pubkey))
                throw new TypeError('Invalid pubkey for p2tr');
        }
        const hashTree = _hashTree();
        if (a.hash && hashTree) {
            if (!a.hash.equals(hashTree.hash))
                throw new TypeError('Hash mismatch');
        }
        if (a.redeem && a.redeem.output && hashTree) {
            const leafHash = tapleafHash({
                output: a.redeem.output,
                version: o.redeemVersion,
            });
            if (!findScriptPath(hashTree, leafHash))
                throw new TypeError('Redeem script not in tree');
        }
        const witness = _witness();
        // compare the provided redeem data with the one computed from witness
        if (a.redeem && o.redeem) {
            if (a.redeem.redeemVersion) {
                if (a.redeem.redeemVersion !== o.redeem.redeemVersion)
                    throw new TypeError('Redeem.redeemVersion and witness mismatch');
            }
            if (a.redeem.output) {
                if (decompile(a.redeem.output).length === 0)
                    throw new TypeError('Redeem.output is invalid');
                // output redeem is constructed from the witness
                if (o.redeem.output && !a.redeem.output.equals(o.redeem.output))
                    throw new TypeError('Redeem.output and witness mismatch');
            }
            if (a.redeem.witness) {
                if (o.redeem.witness &&
                    !stacksEqual$2(a.redeem.witness, o.redeem.witness))
                    throw new TypeError('Redeem.witness and witness mismatch');
            }
        }
        if (witness && witness.length) {
            if (witness.length === 1) {
                // key spending
                if (a.signature && !a.signature.equals(witness[0]))
                    throw new TypeError('Signature mismatch');
            }
            else {
                // script path spending
                const controlBlock = witness[witness.length - 1];
                if (controlBlock.length < 33)
                    throw new TypeError(`The control-block length is too small. Got ${controlBlock.length}, expected min 33.`);
                if ((controlBlock.length - 33) % 32 !== 0)
                    throw new TypeError(`The control-block length of ${controlBlock.length} is incorrect!`);
                const m = (controlBlock.length - 33) / 32;
                if (m > 128)
                    throw new TypeError(`The script path is too long. Got ${m}, expected max 128.`);
                const internalPubkey = controlBlock.slice(1, 33);
                if (a.internalPubkey && !a.internalPubkey.equals(internalPubkey))
                    throw new TypeError('Internal pubkey mismatch');
                if (!getEccLib().isXOnlyPoint(internalPubkey))
                    throw new TypeError('Invalid internalPubkey for p2tr witness');
                const leafVersion = controlBlock[0] & TAPLEAF_VERSION_MASK;
                const script = witness[witness.length - 2];
                const leafHash = tapleafHash({ output: script, version: leafVersion });
                const hash = rootHashFromPath(controlBlock, leafHash);
                const outputKey = tweakKey(internalPubkey, hash);
                if (!outputKey)
                    // todo: needs test data
                    throw new TypeError('Invalid outputKey for p2tr witness');
                if (pubkey.length && !pubkey.equals(outputKey.x))
                    throw new TypeError('Pubkey mismatch for p2tr witness');
                if (outputKey.parity !== (controlBlock[0] & 1))
                    throw new Error('Incorrect parity');
            }
        }
    }
    return Object.assign(o, a);
}

const { typeforce } = types;
const FUTURE_SEGWIT_MAX_SIZE = 40;
const FUTURE_SEGWIT_MIN_SIZE = 2;
const FUTURE_SEGWIT_MAX_VERSION = 16;
const FUTURE_SEGWIT_MIN_VERSION = 1;
const FUTURE_SEGWIT_VERSION_DIFF = 0x50;
const FUTURE_SEGWIT_VERSION_WARNING = 'WARNING: Sending to a future segwit version address can lead to loss of funds. ' +
    'End users MUST be warned carefully in the GUI and asked if they wish to proceed ' +
    'with caution. Wallets should verify the segwit version from the output of fromBech32, ' +
    'then decide when it is safe to use which version of segwit.';
function _toFutureSegwitAddress(output, network) {
    const data = output.slice(2);
    if (data.length < FUTURE_SEGWIT_MIN_SIZE ||
        data.length > FUTURE_SEGWIT_MAX_SIZE)
        throw new TypeError('Invalid program length for segwit address');
    const version = output[0] - FUTURE_SEGWIT_VERSION_DIFF;
    if (version < FUTURE_SEGWIT_MIN_VERSION ||
        version > FUTURE_SEGWIT_MAX_VERSION)
        throw new TypeError('Invalid version for segwit address');
    if (output[1] !== data.length)
        throw new TypeError('Invalid script for segwit address');
    console.warn(FUTURE_SEGWIT_VERSION_WARNING);
    return toBech32(data, version, network.bech32);
}
function fromBase58Check(address) {
    const payload = bs58check.decode(address);
    // TODO: 4.0.0, move to "toOutputScript"
    if (payload.length < 21)
        throw new TypeError(address + ' is too short');
    if (payload.length > 21)
        throw new TypeError(address + ' is too long');
    const version = payload.readUInt8(0);
    const hash = payload.slice(1);
    return { version, hash };
}
function fromBech32(address) {
    let result;
    let version;
    try {
        result = bech32.decode(address);
    }
    catch (e) { }
    if (result) {
        version = result.words[0];
        if (version !== 0)
            throw new TypeError(address + ' uses wrong encoding');
    }
    else {
        result = bech32m.decode(address);
        version = result.words[0];
        if (version === 0)
            throw new TypeError(address + ' uses wrong encoding');
    }
    const data = bech32.fromWords(result.words.slice(1));
    return {
        version,
        prefix: result.prefix,
        data: Buffer$1.from(data),
    };
}
function toBase58Check(hash, version) {
    typeforce(tuple(Hash160bit, UInt8), arguments);
    const payload = Buffer$1.allocUnsafe(21);
    payload.writeUInt8(version, 0);
    hash.copy(payload, 1);
    return bs58check.encode(payload);
}
function toBech32(data, version, prefix) {
    const words = bech32.toWords(data);
    words.unshift(version);
    return version === 0
        ? bech32.encode(prefix, words)
        : bech32m.encode(prefix, words);
}
function fromOutputScript(output, network) {
    // TODO: Network
    network = network || bitcoin;
    try {
        return p2pkh({ output, network }).address;
    }
    catch (e) { }
    try {
        return p2sh({ output, network }).address;
    }
    catch (e) { }
    try {
        return p2wpkh({ output, network }).address;
    }
    catch (e) { }
    try {
        return p2wsh({ output, network }).address;
    }
    catch (e) { }
    try {
        return p2tr({ output, network }).address;
    }
    catch (e) { }
    try {
        return _toFutureSegwitAddress(output, network);
    }
    catch (e) { }
    throw new Error(toASM(output) + ' has no matching Address');
}
function toOutputScript(address, network) {
    network = network || bitcoin;
    let decodeBase58;
    let decodeBech32;
    try {
        decodeBase58 = fromBase58Check(address);
    }
    catch (e) { }
    if (decodeBase58) {
        if (decodeBase58.version === network.pubKeyHash)
            return p2pkh({ hash: decodeBase58.hash }).output;
        if (decodeBase58.version === network.scriptHash)
            return p2sh({ hash: decodeBase58.hash }).output;
    }
    else {
        try {
            decodeBech32 = fromBech32(address);
        }
        catch (e) { }
        if (decodeBech32) {
            if (decodeBech32.prefix !== network.bech32)
                throw new Error(address + ' has an invalid prefix');
            if (decodeBech32.version === 0) {
                if (decodeBech32.data.length === 20)
                    return p2wpkh({ hash: decodeBech32.data }).output;
                if (decodeBech32.data.length === 32)
                    return p2wsh({ hash: decodeBech32.data }).output;
            }
            else if (decodeBech32.version >= FUTURE_SEGWIT_MIN_VERSION &&
                decodeBech32.version <= FUTURE_SEGWIT_MAX_VERSION &&
                decodeBech32.data.length >= FUTURE_SEGWIT_MIN_SIZE &&
                decodeBech32.data.length <= FUTURE_SEGWIT_MAX_SIZE) {
                console.warn(FUTURE_SEGWIT_VERSION_WARNING);
                return compile([
                    decodeBech32.version + FUTURE_SEGWIT_VERSION_DIFF,
                    decodeBech32.data,
                ]);
            }
        }
    }
    throw new Error(address + ' has no matching Script');
}

var address = /*#__PURE__*/Object.freeze({
    __proto__: null,
    fromBase58Check: fromBase58Check,
    fromBech32: fromBech32,
    fromOutputScript: fromOutputScript,
    toBase58Check: toBase58Check,
    toBech32: toBech32,
    toOutputScript: toOutputScript
});

export { p2pkh as a, p2sh as b, p2wpkh as c, p2wsh as d, p2tr as e, fromOutputScript as f, value as g, address as h, prop as p, toOutputScript as t, varuintBitcoin as v };
//# sourceMappingURL=address-cd5fc561.mjs.map
