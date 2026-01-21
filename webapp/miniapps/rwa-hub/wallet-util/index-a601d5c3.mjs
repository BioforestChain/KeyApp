import { B as Buffer } from './index-62190cc8.mjs';
import { b as bs58check } from './index-6252fd9f.mjs';

function decodeRaw(buffer, version) {
    // check version only if defined
    if (version !== undefined && buffer[0] !== version)
        throw new Error('Invalid network version');
    // uncompressed
    if (buffer.length === 33) {
        return {
            version: buffer[0],
            privateKey: buffer.slice(1, 33),
            compressed: false,
        };
    }
    // invalid length
    if (buffer.length !== 34)
        throw new Error('Invalid WIF length');
    // invalid compression flag
    if (buffer[33] !== 0x01)
        throw new Error('Invalid compression flag');
    return {
        version: buffer[0],
        privateKey: buffer.slice(1, 33),
        compressed: true,
    };
}
function encodeRaw(version, privateKey, compressed) {
    var result = Buffer.alloc(compressed ? 34 : 33);
    result.writeUInt8(version, 0);
    privateKey.copy(result, 1);
    if (compressed) {
        result[33] = 0x01;
    }
    return result;
}
function decode(string, version) {
    return decodeRaw(bs58check.decode(string), version);
}
function encode(version, privateKey, compressed) {
    //   if (typeof version !== 'number')
    //   return bs58check.encode(
    //     encodeRaw(version.version, version.privateKey, version.compressed),
    //   );
    return bs58check.encode(encodeRaw(version, privateKey, compressed));
}

export { decode as d, encode as e };
//# sourceMappingURL=index-a601d5c3.mjs.map
