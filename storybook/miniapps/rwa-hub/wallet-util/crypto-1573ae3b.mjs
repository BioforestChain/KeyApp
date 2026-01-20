import { B as Buffer } from './index-62190cc8.mjs';
import { c as createRIPEMD160Sync } from './ripemd160-eb7b517c.mjs';
import { c as createSHA1Sync } from './sha1-d9a30eed.mjs';
import { c as createSHA256Sync } from './sha256-098a9414.mjs';
import './WASMInterface-e83e38e1.mjs';

function ripemd160(buffer) {
    return Buffer.from(createRIPEMD160Sync().update(buffer).digest());
}
function sha1(buffer) {
    return Buffer.from(createSHA1Sync().update(buffer).digest());
}
function sha256(buffer) {
    return Buffer.from(createSHA256Sync().update(buffer).digest());
}
function hash160(buffer) {
    return ripemd160(sha256(buffer));
}
function hash256(buffer) {
    return sha256(sha256(buffer));
}
const TAGS = [
    'BIP0340/challenge',
    'BIP0340/aux',
    'BIP0340/nonce',
    'TapLeaf',
    'TapBranch',
    'TapSighash',
    'TapTweak',
    'KeyAgg list',
    'KeyAgg coefficient',
];
/** An object mapping tags to their tagged hash prefix of [SHA256(tag) | SHA256(tag)] */
const TAGGED_HASH_PREFIXES = Object.fromEntries(TAGS.map((tag) => {
    const tagHash = sha256(Buffer.from(tag));
    return [tag, Buffer.concat([tagHash, tagHash])];
}));
function taggedHash(prefix, data) {
    return sha256(Buffer.concat([TAGGED_HASH_PREFIXES[prefix], data]));
}

export { hash160, hash256, ripemd160, sha1, sha256, taggedHash };
//# sourceMappingURL=crypto-1573ae3b.mjs.map
