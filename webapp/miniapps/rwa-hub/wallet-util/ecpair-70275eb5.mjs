import { B as Buffer, r as randomBytes } from './index-62190cc8.mjs';
import { d as decode, e as encode } from './index-a601d5c3.mjs';
import { t as typeforce } from './typeforce-3fc8ed92.mjs';
import './index-6252fd9f.mjs';
import './sha256-098a9414.mjs';
import './WASMInterface-e83e38e1.mjs';

const bitcoin = {
    messagePrefix: '\x18Bitcoin Signed Message:\n',
    bech32: 'bc',
    bip32: {
        public: 0x0488b21e,
        private: 0x0488ade4,
    },
    pubKeyHash: 0x00,
    scriptHash: 0x05,
    wif: 0x80,
};

// exposed, external API
const Network = typeforce.compile({
    messagePrefix: typeforce.anyOf(typeforce.Buffer, typeforce.String),
    bip32: {
        public: typeforce.UInt32,
        private: typeforce.UInt32,
    },
    pubKeyHash: typeforce.UInt8,
    scriptHash: typeforce.UInt8,
    wif: typeforce.UInt8,
});
const Buffer256bit = typeforce.BufferN(32);
const Array = typeforce.Array;
const Boolean = typeforce.Boolean; // tslint:disable-line variable-name
const maybe = typeforce.maybe;

const isOptions = typeforce.maybe(typeforce.compile({
    compressed: maybe(Boolean),
    network: maybe(Network),
}));
const toXOnly = (pubKey) => pubKey.length === 32 ? pubKey : pubKey.slice(1, 33);
function ECPairFactory(ecc) {
    function isPoint(maybePoint) {
        return ecc.isPoint(maybePoint);
    }
    function fromPrivateKey(buffer, options) {
        typeforce(Buffer256bit, buffer);
        if (!ecc.isPrivate(buffer))
            throw new TypeError('Private key not in range [1, n)');
        typeforce(isOptions, options);
        return new ECPair(buffer, undefined, options);
    }
    function fromPublicKey(buffer, options) {
        typeforce(ecc.isPoint, buffer);
        typeforce(isOptions, options);
        return new ECPair(undefined, buffer, options);
    }
    function fromWIF(wifString, network) {
        const decoded = decode(wifString);
        const version = decoded.version;
        // list of networks?
        if (Array(network)) {
            network = network
                .filter((x) => {
                return version === x.wif;
            })
                .pop();
            if (!network)
                throw new Error('Unknown network version');
            // otherwise, assume a network object (or default to bitcoin)
        }
        else {
            network = network || bitcoin;
            if (version !== network.wif)
                throw new Error('Invalid network version');
        }
        return fromPrivateKey(decoded.privateKey, {
            compressed: decoded.compressed,
            network: network,
        });
    }
    function makeRandom(options) {
        typeforce(isOptions, options);
        if (options === undefined)
            options = {};
        const rng = options.rng || randomBytes;
        let d;
        do {
            d = Buffer.from(rng(32));
            typeforce(Buffer256bit, d);
        } while (!ecc.isPrivate(d));
        return fromPrivateKey(d, options);
    }
    class ECPair {
        constructor(__D, __Q, options) {
            this.__D = __D;
            this.__Q = __Q;
            this.lowR = false;
            if (options === undefined)
                options = {};
            this.compressed =
                options.compressed === undefined ? true : options.compressed;
            this.network = options.network || bitcoin;
            if (__Q !== undefined)
                this.__Q = Buffer.from(ecc.pointCompress(__Q, this.compressed));
        }
        get privateKey() {
            return this.__D;
        }
        get publicKey() {
            if (!this.__Q) {
                // It is not possible for both `__Q` and `__D` to be `undefined` at the same time.
                // The factory methods guard for this.
                const p = ecc.pointFromScalar(this.__D, this.compressed);
                // It is not possible for `p` to be null.
                // `fromPrivateKey()` checks that `__D` is a valid scalar.
                this.__Q = Buffer.from(p);
            }
            return this.__Q;
        }
        toWIF() {
            if (!this.__D)
                throw new Error('Missing private key');
            return encode(this.network.wif, this.__D, this.compressed);
        }
        tweak(t) {
            if (this.privateKey)
                return this.tweakFromPrivateKey(t);
            return this.tweakFromPublicKey(t);
        }
        sign(hash, lowR) {
            if (!this.__D)
                throw new Error('Missing private key');
            if (lowR === undefined)
                lowR = this.lowR;
            if (lowR === false) {
                return Buffer.from(ecc.sign(hash, this.__D));
            }
            else {
                let sig = ecc.sign(hash, this.__D);
                const extraData = Buffer.alloc(32, 0);
                let counter = 0;
                // if first try is lowR, skip the loop
                // for second try and on, add extra entropy counting up
                while (sig[0] > 0x7f) {
                    counter++;
                    extraData.writeUIntLE(counter, 0, 6);
                    sig = ecc.sign(hash, this.__D, extraData);
                }
                return Buffer.from(sig);
            }
        }
        signSchnorr(hash) {
            if (!this.privateKey)
                throw new Error('Missing private key');
            if (!ecc.signSchnorr)
                throw new Error('signSchnorr not supported by ecc library');
            return Buffer.from(ecc.signSchnorr(hash, this.privateKey));
        }
        verify(hash, signature) {
            return ecc.verify(hash, this.publicKey, signature);
        }
        verifySchnorr(hash, signature) {
            if (!ecc.verifySchnorr)
                throw new Error('verifySchnorr not supported by ecc library');
            return ecc.verifySchnorr(hash, this.publicKey.subarray(1, 33), signature);
        }
        tweakFromPublicKey(t) {
            const xOnlyPubKey = toXOnly(this.publicKey);
            const tweakedPublicKey = ecc.xOnlyPointAddTweak(xOnlyPubKey, t);
            if (!tweakedPublicKey || tweakedPublicKey.xOnlyPubkey === null)
                throw new Error('Cannot tweak public key!');
            const parityByte = Buffer.from([
                tweakedPublicKey.parity === 0 ? 0x02 : 0x03,
            ]);
            return fromPublicKey(Buffer.concat([parityByte, tweakedPublicKey.xOnlyPubkey]), { network: this.network, compressed: this.compressed });
        }
        tweakFromPrivateKey(t) {
            const hasOddY = this.publicKey[0] === 3 ||
                (this.publicKey[0] === 4 && (this.publicKey[64] & 1) === 1);
            const privateKey = hasOddY
                ? ecc.privateNegate(this.privateKey)
                : this.privateKey;
            const tweakedPrivateKey = ecc.privateAdd(privateKey, t);
            if (!tweakedPrivateKey)
                throw new Error('Invalid tweaked private key!');
            return fromPrivateKey(Buffer.from(tweakedPrivateKey), {
                network: this.network,
                compressed: this.compressed,
            });
        }
    }
    return {
        isPoint,
        fromPrivateKey,
        fromPublicKey,
        fromWIF,
        makeRandom,
    };
}

export { ECPairFactory };
//# sourceMappingURL=ecpair-70275eb5.mjs.map
