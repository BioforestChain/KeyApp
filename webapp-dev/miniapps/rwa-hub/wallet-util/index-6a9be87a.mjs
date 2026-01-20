import { B as Buffer } from './index-62190cc8.mjs';
import { c as createKeccakSync } from './keccak-a3a14d2a.mjs';
import { p as pointCompress } from './index-20b88f48.mjs';
import './sha3-8923c3ca.mjs';
import './WASMInterface-e83e38e1.mjs';

const keccakHex = (data, bits) => {
    return createKeccakSync(bits).update(data).digest('hex');
};
const keccak256Buffer = (publicKey) => {
    const hash = createKeccakSync(256);
    return Buffer.from(hash.update(publicKey).digest());
};
const importPublic = async (publickKey) => {
    if (publickKey.length !== 64) {
        publickKey = pointCompress(publickKey, false).slice(1);
    }
    return publickKey;
};
const publicToAddress = async (pubKey) => {
    return (await keccak256Buffer(pubKey)).slice(-20);
};
const addHexPrefix = (str) => {
    return isHexPrefixed(str) ? str : `0x${str}`;
};
const isHexPrefixed = (str) => {
    return str.startsWith('0x');
};
const bufferToHex = (buf) => {
    return `0x${buf.toString('hex')}`;
};
const stripHexPrefix = (address) => {
    return /^0x/i.test(address) ? address.slice(2) : address;
};
const toChecksumAddress = async (address) => {
    address = stripHexPrefix(address).toLowerCase();
    const hash = await keccakHex(address, 256);
    let ret = '0x';
    for (let i = 0; i < address.length; i++) {
        const char = address[i];
        if (parseInt(hash[i], 16) >= 8) {
            ret += char.toUpperCase();
        }
        else {
            ret += char;
        }
    }
    return ret;
};

export { addHexPrefix, bufferToHex, importPublic, isHexPrefixed, keccak256Buffer, keccakHex, publicToAddress, stripHexPrefix, toChecksumAddress };
//# sourceMappingURL=index-6a9be87a.mjs.map
