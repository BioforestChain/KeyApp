import { p as pbkdf2Sync$1, a as pbkdf2$1 } from './pbkdf2-9ba738dc.mjs';
import { c as createSHA256Sync } from './sha256-098a9414.mjs';
import { c as createSHA512Sync, a as createSHA512 } from './sha512-da1b7bbd.mjs';
import { B as Buffer, r as randomBytes } from './index-62190cc8.mjs';
import { getDefaultWordlist } from './wordlists-adf094e0.mjs';
import './hmac-d682b216.mjs';
import './WASMInterface-e83e38e1.mjs';

const pbkdf2Sync = (password, salt, iterations, hashLength, _hash) => {
    const buf = pbkdf2Sync$1({
        hashFunction: createSHA512Sync(),
        password,
        salt,
        iterations,
        hashLength,
        outputType: 'binary',
    });
    return Buffer.from(buf);
};
const pbkdf2 = async (password, salt, iterations, hashLength, _hash) => {
    const buf = await pbkdf2$1({
        hashFunction: createSHA512(),
        password,
        salt,
        iterations,
        hashLength,
        outputType: 'binary',
    });
    return Buffer.from(buf);
};
const sha256 = (data) => {
    return createSHA256Sync().update(data).digest();
};

// import * as createHash from 'create-hash';
// import { pbkdf2, pbkdf2Sync } from 'pbkdf2';
const INVALID_MNEMONIC = 'Invalid mnemonic';
const INVALID_ENTROPY = 'Invalid entropy';
const INVALID_CHECKSUM = 'Invalid mnemonic checksum';
const WORDLIST_REQUIRED = 'A wordlist is required but a default could not be found.\n' +
    'Please pass a 2048 word array explicitly.';
function normalize(str) {
    return (str || '').normalize('NFKD');
}
function binaryToByte(bin) {
    return parseInt(bin, 2);
}
function bytesToBinary(bytes) {
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        binary += byte.toString(2).padStart(8, '0');
    }
    return binary;
}
function deriveChecksumBits(entropyBuffer) {
    const ENT = entropyBuffer.length * 8;
    const CS = ENT / 32;
    const hash = sha256(entropyBuffer);
    return bytesToBinary(hash).slice(0, CS);
}
function salt(password) {
    return 'mnemonic' + (password || '');
}
function mnemonicToSeedSync(mnemonic, password) {
    const mnemonicBuffer = Buffer.from(normalize(mnemonic), 'utf8');
    const saltBuffer = Buffer.from(salt(normalize(password)), 'utf8');
    return pbkdf2Sync(mnemonicBuffer, saltBuffer, 2048, 64);
}
function mnemonicToSeed(mnemonic, password) {
    const mnemonicBuffer = Buffer.from(normalize(mnemonic), 'utf8');
    const saltBuffer = Buffer.from(salt(normalize(password)), 'utf8');
    return pbkdf2(mnemonicBuffer, saltBuffer, 2048, 64);
}
function mnemonicToEntropy(mnemonic, wordlist) {
    wordlist = wordlist || getDefaultWordlist()?.wordlist;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    const words = normalize(mnemonic).split(' ');
    if (words.length % 3 !== 0) {
        throw new Error(INVALID_MNEMONIC);
    }
    // convert word indices to 11 bit binary strings
    const bits = words
        .map((word) => {
        const index = wordlist.indexOf(word);
        if (index === -1) {
            throw new Error(INVALID_MNEMONIC);
        }
        return index.toString(2).padStart(11, '0');
    })
        .join('');
    // split the binary string into ENT/CS
    const dividerIndex = Math.floor(bits.length / 33) * 32;
    const entropyBits = bits.slice(0, dividerIndex);
    const checksumBits = bits.slice(dividerIndex);
    // calculate the checksum and compare
    const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
    if (entropyBytes.length < 16) {
        throw new Error(INVALID_ENTROPY);
    }
    // if (entropyBytes.length > 32) {
    //   throw new Error(INVALID_ENTROPY);
    // }
    if (entropyBytes.length % 4 !== 0) {
        throw new Error(INVALID_ENTROPY);
    }
    const entropy = Buffer.from(entropyBytes);
    const newChecksum = deriveChecksumBits(entropy);
    if (newChecksum !== checksumBits) {
        throw new Error(INVALID_CHECKSUM);
    }
    return entropy.toString('hex');
}
function entropyToMnemonic(entropy, wordlist) {
    if (!Buffer.isBuffer(entropy)) {
        entropy = Buffer.from(entropy, 'hex');
    }
    wordlist = wordlist || getDefaultWordlist()?.wordlist;
    if (!wordlist) {
        throw new Error(WORDLIST_REQUIRED);
    }
    // 128 <= ENT <= 256
    if (entropy.length < 16) {
        throw new TypeError(INVALID_ENTROPY);
    }
    // if (entropy.length > 32) {
    //   throw new TypeError(INVALID_ENTROPY);
    // }
    if (entropy.length % 4 !== 0) {
        throw new TypeError(INVALID_ENTROPY);
    }
    const entropyBits = bytesToBinary(Array.from(entropy));
    const checksumBits = deriveChecksumBits(entropy);
    const bits = entropyBits + checksumBits;
    const chunks = bits.match(/(.{1,11})/g);
    const words = chunks.map((binary) => {
        const index = binaryToByte(binary);
        return wordlist[index];
    });
    return wordlist[0] === '\u3042\u3044\u3053\u304f\u3057\u3093' // Japanese wordlist
        ? words.join('\u3000')
        : words.join(' ');
}
function generateMnemonic(strength, rng = randomBytes, wordlist) {
    strength = strength || 128;
    if (strength % 32 !== 0) {
        throw new TypeError(INVALID_ENTROPY);
    }
    return entropyToMnemonic(Buffer.from(rng(strength / 8)), wordlist);
}
function validateMnemonic(mnemonic, wordlist) {
    try {
        mnemonicToEntropy(mnemonic, wordlist);
    }
    catch (e) {
        return false;
    }
    return true;
}

export { entropyToMnemonic, generateMnemonic, mnemonicToEntropy, mnemonicToSeed, mnemonicToSeedSync, normalize, validateMnemonic };
//# sourceMappingURL=index-48b4ccd9.mjs.map
