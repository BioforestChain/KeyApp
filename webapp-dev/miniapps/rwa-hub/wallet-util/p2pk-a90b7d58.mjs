import { b as bitcoin } from './networks-2c79a09f.mjs';
import { f as isPoint, i as isCanonicalScriptSignature, d as decompile, c as compile } from './script-1d075504.mjs';
import { p as prop, g as value } from './address-cd5fc561.mjs';
import { t as typeforce } from './typeforce-3fc8ed92.mjs';
import { OPS as OPS$2 } from './ops-a3396647.mjs';

const OPS$1 = OPS$2;
const OP_INT_BASE = OPS$1.OP_RESERVED; // OP_1 - 1
function stacksEqual(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((x, i) => {
        return x.equals(b[i]);
    });
}
// input: OP_0 [signatures ...]
// output: m [pubKeys ...] n OP_CHECKMULTISIG
function p2ms(a, opts) {
    if (!a.input &&
        !a.output &&
        !(a.pubkeys && a.m !== undefined) &&
        !a.signatures)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    function isAcceptableSignature(x) {
        return (isCanonicalScriptSignature(x) ||
            (opts.allowIncomplete && x === OPS$1.OP_0) !== undefined);
    }
    typeforce({
        network: typeforce.maybe(typeforce.Object),
        m: typeforce.maybe(typeforce.Number),
        n: typeforce.maybe(typeforce.Number),
        output: typeforce.maybe(typeforce.Buffer),
        pubkeys: typeforce.maybe(typeforce.arrayOf(isPoint)),
        signatures: typeforce.maybe(typeforce.arrayOf(isAcceptableSignature)),
        input: typeforce.maybe(typeforce.Buffer),
    }, a);
    const network = a.network || bitcoin;
    const o = { network };
    let chunks = [];
    let decoded = false;
    function decode(output) {
        if (decoded)
            return;
        decoded = true;
        chunks = decompile(output);
        o.m = chunks[0] - OP_INT_BASE;
        o.n = chunks[chunks.length - 2] - OP_INT_BASE;
        o.pubkeys = chunks.slice(1, -2);
    }
    prop(o, 'output', () => {
        if (!a.m)
            return;
        if (!o.n)
            return;
        if (!a.pubkeys)
            return;
        return compile([].concat(OP_INT_BASE + a.m, a.pubkeys, OP_INT_BASE + o.n, OPS$1.OP_CHECKMULTISIG));
    });
    prop(o, 'm', () => {
        if (!o.output)
            return;
        decode(o.output);
        return o.m;
    });
    prop(o, 'n', () => {
        if (!o.pubkeys)
            return;
        return o.pubkeys.length;
    });
    prop(o, 'pubkeys', () => {
        if (!a.output)
            return;
        decode(a.output);
        return o.pubkeys;
    });
    prop(o, 'signatures', () => {
        if (!a.input)
            return;
        return decompile(a.input).slice(1);
    });
    prop(o, 'input', () => {
        if (!a.signatures)
            return;
        return compile([OPS$1.OP_0].concat(a.signatures));
    });
    prop(o, 'witness', () => {
        if (!o.input)
            return;
        return [];
    });
    prop(o, 'name', () => {
        if (!o.m || !o.n)
            return;
        return `p2ms(${o.m} of ${o.n})`;
    });
    // extended validation
    if (opts.validate) {
        if (a.output) {
            decode(a.output);
            if (!typeforce.Number(chunks[0]))
                throw new TypeError('Output is invalid');
            if (!typeforce.Number(chunks[chunks.length - 2]))
                throw new TypeError('Output is invalid');
            if (chunks[chunks.length - 1] !== OPS$1.OP_CHECKMULTISIG)
                throw new TypeError('Output is invalid');
            if (o.m <= 0 || o.n > 16 || o.m > o.n || o.n !== chunks.length - 3)
                throw new TypeError('Output is invalid');
            if (!o.pubkeys.every((x) => isPoint(x)))
                throw new TypeError('Output is invalid');
            if (a.m !== undefined && a.m !== o.m)
                throw new TypeError('m mismatch');
            if (a.n !== undefined && a.n !== o.n)
                throw new TypeError('n mismatch');
            if (a.pubkeys && !stacksEqual(a.pubkeys, o.pubkeys))
                throw new TypeError('Pubkeys mismatch');
        }
        if (a.pubkeys) {
            if (a.n !== undefined && a.n !== a.pubkeys.length)
                throw new TypeError('Pubkey count mismatch');
            o.n = a.pubkeys.length;
            if (o.n < o.m)
                throw new TypeError('Pubkey count cannot be less than m');
        }
        if (a.signatures) {
            if (a.signatures.length < o.m)
                throw new TypeError('Not enough signatures provided');
            if (a.signatures.length > o.m)
                throw new TypeError('Too many signatures provided');
        }
        if (a.input) {
            if (a.input[0] !== OPS$1.OP_0)
                throw new TypeError('Input is invalid');
            if (o.signatures.length === 0 ||
                !o.signatures.every(isAcceptableSignature))
                throw new TypeError('Input has invalid signature(s)');
            if (a.signatures && !stacksEqual(a.signatures, o.signatures))
                throw new TypeError('Signature mismatch');
            if (a.m !== undefined && a.m !== a.signatures.length)
                throw new TypeError('Signature count mismatch');
        }
    }
    return Object.assign(o, a);
}

const OPS = OPS$2;
// input: {signature}
// output: {pubKey} OP_CHECKSIG
function p2pk(a, opts) {
    if (!a.input && !a.output && !a.pubkey && !a.input && !a.signature)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce({
        network: typeforce.maybe(typeforce.Object),
        output: typeforce.maybe(typeforce.Buffer),
        pubkey: typeforce.maybe(isPoint),
        signature: typeforce.maybe(isCanonicalScriptSignature),
        input: typeforce.maybe(typeforce.Buffer),
    }, a);
    const _chunks = value(() => {
        return decompile(a.input);
    });
    const network = a.network || bitcoin;
    const o = { name: 'p2pk', network };
    prop(o, 'output', () => {
        if (!a.pubkey)
            return;
        return compile([a.pubkey, OPS.OP_CHECKSIG]);
    });
    prop(o, 'pubkey', () => {
        if (!a.output)
            return;
        return a.output.slice(1, -1);
    });
    prop(o, 'signature', () => {
        if (!a.input)
            return;
        return _chunks()[0];
    });
    prop(o, 'input', () => {
        if (!a.signature)
            return;
        return compile([a.signature]);
    });
    prop(o, 'witness', () => {
        if (!o.input)
            return;
        return [];
    });
    // extended validation
    if (opts.validate) {
        if (a.output) {
            if (a.output[a.output.length - 1] !== OPS.OP_CHECKSIG)
                throw new TypeError('Output is invalid');
            if (!isPoint(o.pubkey))
                throw new TypeError('Output pubkey is invalid');
            if (a.pubkey && !a.pubkey.equals(o.pubkey))
                throw new TypeError('Pubkey mismatch');
        }
        if (a.signature) {
            if (a.input && !a.input.equals(o.input))
                throw new TypeError('Signature mismatch');
        }
        if (a.input) {
            if (_chunks().length !== 1)
                throw new TypeError('Input is invalid');
            if (!isCanonicalScriptSignature(o.signature))
                throw new TypeError('Input has invalid signature');
        }
    }
    return Object.assign(o, a);
}

export { p2pk as a, p2ms as p };
//# sourceMappingURL=p2pk-a90b7d58.mjs.map
