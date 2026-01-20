import { B as Buffer$o, b as buffer } from './index-62190cc8.mjs';
import { v as varuintBitcoin, f as fromOutputScript, t as toOutputScript, d as p2wsh, b as p2sh, a as p2pkh, c as p2wpkh } from './address-cd5fc561.mjs';
import { t as tuple, B as Buffer$p, U as UInt32, a as types, H as Hash256bit, m as maybe, N as Null, S as Satoshi, b as Number$1, c as compile, d as decompile, s as signature, i as isCanonicalScriptSignature, e as isCanonicalPubKey } from './script-1d075504.mjs';
import { hash256, sha256, taggedHash, hash160 } from './crypto-1573ae3b.mjs';
import { b as bitcoin } from './networks-2c79a09f.mjs';
import { OPS } from './ops-a3396647.mjs';
import { a as p2pk, p as p2ms } from './p2pk-a90b7d58.mjs';
import './index-6252fd9f.mjs';
import './sha256-098a9414.mjs';
import './WASMInterface-e83e38e1.mjs';
import './typeforce-3fc8ed92.mjs';
import './ripemd160-eb7b517c.mjs';
import './sha1-d9a30eed.mjs';

const { typeforce: typeforce$1 } = types;
// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint$1(value, max) {
    if (typeof value !== 'number')
        throw new Error('cannot write a non-number as a number');
    if (value < 0)
        throw new Error('specified a negative value for writing an unsigned value');
    if (value > max)
        throw new Error('RangeError: value out of range');
    if (Math.floor(value) !== value)
        throw new Error('value has a fractional component');
}
function readUInt64LE$1(buffer, offset) {
    const a = buffer.readUInt32LE(offset);
    let b = buffer.readUInt32LE(offset + 4);
    b *= 0x100000000;
    verifuint$1(b + a, 0x001fffffffffffff);
    return b + a;
}
function writeUInt64LE$1(buffer, value, offset) {
    verifuint$1(value, 0x001fffffffffffff);
    buffer.writeInt32LE(value & -1, offset);
    buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4);
    return offset + 8;
}
function reverseBuffer$1(buffer) {
    if (buffer.length < 1)
        return buffer;
    let j = buffer.length - 1;
    let tmp = 0;
    for (let i = 0; i < buffer.length / 2; i++) {
        tmp = buffer[i];
        buffer[i] = buffer[j];
        buffer[j] = tmp;
        j--;
    }
    return buffer;
}
function cloneBuffer(buffer) {
    const clone = Buffer$o.allocUnsafe(buffer.length);
    buffer.copy(clone);
    return clone;
}
/**
 * Helper class for serialization of bitcoin data types into a pre-allocated buffer.
 */
class BufferWriter {
    static withCapacity(size) {
        return new BufferWriter(Buffer$o.alloc(size));
    }
    constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
        typeforce$1(tuple(Buffer$p, UInt32), [buffer, offset]);
    }
    writeUInt8(i) {
        this.offset = this.buffer.writeUInt8(i, this.offset);
    }
    writeInt32(i) {
        this.offset = this.buffer.writeInt32LE(i, this.offset);
    }
    writeUInt32(i) {
        this.offset = this.buffer.writeUInt32LE(i, this.offset);
    }
    writeUInt64(i) {
        this.offset = writeUInt64LE$1(this.buffer, i, this.offset);
    }
    writeVarInt(i) {
        varuintBitcoin.encode(i, this.buffer, this.offset);
        this.offset += varuintBitcoin.encode.bytes;
    }
    writeSlice(slice) {
        if (this.buffer.length < this.offset + slice.length) {
            throw new Error('Cannot write slice out of bounds');
        }
        this.offset += slice.copy(this.buffer, this.offset);
    }
    writeVarSlice(slice) {
        this.writeVarInt(slice.length);
        this.writeSlice(slice);
    }
    writeVector(vector) {
        this.writeVarInt(vector.length);
        vector.forEach((buf) => this.writeVarSlice(buf));
    }
    end() {
        if (this.buffer.length === this.offset) {
            return this.buffer;
        }
        throw new Error(`buffer size ${this.buffer.length}, offset ${this.offset}`);
    }
}
/**
 * Helper class for reading of bitcoin data types from a buffer.
 */
class BufferReader {
    constructor(buffer, offset = 0) {
        this.buffer = buffer;
        this.offset = offset;
        typeforce$1(tuple(Buffer$p, UInt32), [buffer, offset]);
    }
    readUInt8() {
        const result = this.buffer.readUInt8(this.offset);
        this.offset++;
        return result;
    }
    readInt32() {
        const result = this.buffer.readInt32LE(this.offset);
        this.offset += 4;
        return result;
    }
    readUInt32() {
        const result = this.buffer.readUInt32LE(this.offset);
        this.offset += 4;
        return result;
    }
    readUInt64() {
        const result = readUInt64LE$1(this.buffer, this.offset);
        this.offset += 8;
        return result;
    }
    readVarInt() {
        const vi = varuintBitcoin.decode(this.buffer, this.offset);
        this.offset += varuintBitcoin.decode.bytes;
        return vi;
    }
    readSlice(n) {
        if (this.buffer.length < this.offset + n) {
            throw new Error('Cannot read slice out of bounds');
        }
        const result = this.buffer.slice(this.offset, this.offset + n);
        this.offset += n;
        return result;
    }
    readVarSlice() {
        return this.readSlice(this.readVarInt());
    }
    readVector() {
        const count = this.readVarInt();
        const vector = [];
        for (let i = 0; i < count; i++)
            vector.push(this.readVarSlice());
        return vector;
    }
}

var bip174Exports = {};
var bip174 = {
  get exports(){ return bip174Exports; },
  set exports(v){ bip174Exports = v; },
};

var psbt = {};

var combiner = {};

var parser = {};

var fromBuffer = {};

var converter = {};

var typeFields = {};

(function (exports) {
	Object.defineProperty(exports, '__esModule', { value: true });
	(function (GlobalTypes) {
	  GlobalTypes[(GlobalTypes['UNSIGNED_TX'] = 0)] = 'UNSIGNED_TX';
	  GlobalTypes[(GlobalTypes['GLOBAL_XPUB'] = 1)] = 'GLOBAL_XPUB';
	})((exports.GlobalTypes || (exports.GlobalTypes = {})));
	exports.GLOBAL_TYPE_NAMES = ['unsignedTx', 'globalXpub'];
	(function (InputTypes) {
	  InputTypes[(InputTypes['NON_WITNESS_UTXO'] = 0)] = 'NON_WITNESS_UTXO';
	  InputTypes[(InputTypes['WITNESS_UTXO'] = 1)] = 'WITNESS_UTXO';
	  InputTypes[(InputTypes['PARTIAL_SIG'] = 2)] = 'PARTIAL_SIG';
	  InputTypes[(InputTypes['SIGHASH_TYPE'] = 3)] = 'SIGHASH_TYPE';
	  InputTypes[(InputTypes['REDEEM_SCRIPT'] = 4)] = 'REDEEM_SCRIPT';
	  InputTypes[(InputTypes['WITNESS_SCRIPT'] = 5)] = 'WITNESS_SCRIPT';
	  InputTypes[(InputTypes['BIP32_DERIVATION'] = 6)] = 'BIP32_DERIVATION';
	  InputTypes[(InputTypes['FINAL_SCRIPTSIG'] = 7)] = 'FINAL_SCRIPTSIG';
	  InputTypes[(InputTypes['FINAL_SCRIPTWITNESS'] = 8)] = 'FINAL_SCRIPTWITNESS';
	  InputTypes[(InputTypes['POR_COMMITMENT'] = 9)] = 'POR_COMMITMENT';
	  InputTypes[(InputTypes['TAP_KEY_SIG'] = 19)] = 'TAP_KEY_SIG';
	  InputTypes[(InputTypes['TAP_SCRIPT_SIG'] = 20)] = 'TAP_SCRIPT_SIG';
	  InputTypes[(InputTypes['TAP_LEAF_SCRIPT'] = 21)] = 'TAP_LEAF_SCRIPT';
	  InputTypes[(InputTypes['TAP_BIP32_DERIVATION'] = 22)] =
	    'TAP_BIP32_DERIVATION';
	  InputTypes[(InputTypes['TAP_INTERNAL_KEY'] = 23)] = 'TAP_INTERNAL_KEY';
	  InputTypes[(InputTypes['TAP_MERKLE_ROOT'] = 24)] = 'TAP_MERKLE_ROOT';
	})((exports.InputTypes || (exports.InputTypes = {})));
	exports.INPUT_TYPE_NAMES = [
	  'nonWitnessUtxo',
	  'witnessUtxo',
	  'partialSig',
	  'sighashType',
	  'redeemScript',
	  'witnessScript',
	  'bip32Derivation',
	  'finalScriptSig',
	  'finalScriptWitness',
	  'porCommitment',
	  'tapKeySig',
	  'tapScriptSig',
	  'tapLeafScript',
	  'tapBip32Derivation',
	  'tapInternalKey',
	  'tapMerkleRoot',
	];
	(function (OutputTypes) {
	  OutputTypes[(OutputTypes['REDEEM_SCRIPT'] = 0)] = 'REDEEM_SCRIPT';
	  OutputTypes[(OutputTypes['WITNESS_SCRIPT'] = 1)] = 'WITNESS_SCRIPT';
	  OutputTypes[(OutputTypes['BIP32_DERIVATION'] = 2)] = 'BIP32_DERIVATION';
	  OutputTypes[(OutputTypes['TAP_INTERNAL_KEY'] = 5)] = 'TAP_INTERNAL_KEY';
	  OutputTypes[(OutputTypes['TAP_TREE'] = 6)] = 'TAP_TREE';
	  OutputTypes[(OutputTypes['TAP_BIP32_DERIVATION'] = 7)] =
	    'TAP_BIP32_DERIVATION';
	})((exports.OutputTypes || (exports.OutputTypes = {})));
	exports.OUTPUT_TYPE_NAMES = [
	  'redeemScript',
	  'witnessScript',
	  'bip32Derivation',
	  'tapInternalKey',
	  'tapTree',
	  'tapBip32Derivation',
	];
} (typeFields));

var globalXpub$1 = {};

const { Buffer: Buffer$n } = buffer; // auto-inject!
Object.defineProperty(globalXpub$1, '__esModule', { value: true });
const typeFields_1$g = typeFields;
const range$2 = (n) => [...Array(n).keys()];
function decode$d(keyVal) {
  if (keyVal.key[0] !== typeFields_1$g.GlobalTypes.GLOBAL_XPUB) {
    throw new Error(
      'Decode Error: could not decode globalXpub with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if (keyVal.key.length !== 79 || ![2, 3].includes(keyVal.key[46])) {
    throw new Error(
      'Decode Error: globalXpub has invalid extended pubkey in key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if ((keyVal.value.length / 4) % 1 !== 0) {
    throw new Error(
      'Decode Error: Global GLOBAL_XPUB value length should be multiple of 4'
    );
  }
  const extendedPubkey = keyVal.key.slice(1);
  const data = {
    masterFingerprint: keyVal.value.slice(0, 4),
    extendedPubkey,
    path: 'm',
  };
  for (const i of range$2(keyVal.value.length / 4 - 1)) {
    const val = keyVal.value.readUInt32LE(i * 4 + 4);
    const isHard = !!(val & 0x80000000);
    const idx = val & 0x7fffffff;
    data.path += '/' + idx.toString(10) + (isHard ? "'" : '');
  }
  return data;
}
globalXpub$1.decode = decode$d;
function encode$e(data) {
  const head = Buffer$n.from([typeFields_1$g.GlobalTypes.GLOBAL_XPUB]);
  const key = Buffer$n.concat([head, data.extendedPubkey]);
  const splitPath = data.path.split('/');
  const value = Buffer$n.allocUnsafe(splitPath.length * 4);
  data.masterFingerprint.copy(value, 0);
  let offset = 4;
  splitPath.slice(1).forEach((level) => {
    const isHard = level.slice(-1) === "'";
    let num = 0x7fffffff & parseInt(isHard ? level.slice(0, -1) : level, 10);
    if (isHard) num += 0x80000000;
    value.writeUInt32LE(num, offset);
    offset += 4;
  });
  return {
    key,
    value,
  };
}
globalXpub$1.encode = encode$e;
globalXpub$1.expected =
  '{ masterFingerprint: Buffer; extendedPubkey: Buffer; path: string; }';
function check$c(data) {
  const epk = data.extendedPubkey;
  const mfp = data.masterFingerprint;
  const p = data.path;
  return (
    Buffer$n.isBuffer(epk) &&
    epk.length === 78 &&
    [2, 3].indexOf(epk[45]) > -1 &&
    Buffer$n.isBuffer(mfp) &&
    mfp.length === 4 &&
    typeof p === 'string' &&
    !!p.match(/^m(\/\d+'?)*$/)
  );
}
globalXpub$1.check = check$c;
function canAddToArray$3(array, item, dupeSet) {
  const dupeString = item.extendedPubkey.toString('hex');
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return (
    array.filter((v) => v.extendedPubkey.equals(item.extendedPubkey)).length ===
    0
  );
}
globalXpub$1.canAddToArray = canAddToArray$3;

var unsignedTx$1 = {};

const { Buffer: Buffer$m } = buffer; // auto-inject!
Object.defineProperty(unsignedTx$1, '__esModule', { value: true });
const typeFields_1$f = typeFields;
function encode$d(data) {
  return {
    key: Buffer$m.from([typeFields_1$f.GlobalTypes.UNSIGNED_TX]),
    value: data.toBuffer(),
  };
}
unsignedTx$1.encode = encode$d;

var finalScriptSig$1 = {};

const { Buffer: Buffer$l } = buffer; // auto-inject!
Object.defineProperty(finalScriptSig$1, '__esModule', { value: true });
const typeFields_1$e = typeFields;
function decode$c(keyVal) {
  if (keyVal.key[0] !== typeFields_1$e.InputTypes.FINAL_SCRIPTSIG) {
    throw new Error(
      'Decode Error: could not decode finalScriptSig with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  return keyVal.value;
}
finalScriptSig$1.decode = decode$c;
function encode$c(data) {
  const key = Buffer$l.from([typeFields_1$e.InputTypes.FINAL_SCRIPTSIG]);
  return {
    key,
    value: data,
  };
}
finalScriptSig$1.encode = encode$c;
finalScriptSig$1.expected = 'Buffer';
function check$b(data) {
  return Buffer$l.isBuffer(data);
}
finalScriptSig$1.check = check$b;
function canAdd$8(currentData, newData) {
  return !!currentData && !!newData && currentData.finalScriptSig === undefined;
}
finalScriptSig$1.canAdd = canAdd$8;

var finalScriptWitness$1 = {};

const { Buffer: Buffer$k } = buffer; // auto-inject!
Object.defineProperty(finalScriptWitness$1, '__esModule', { value: true });
const typeFields_1$d = typeFields;
function decode$b(keyVal) {
  if (keyVal.key[0] !== typeFields_1$d.InputTypes.FINAL_SCRIPTWITNESS) {
    throw new Error(
      'Decode Error: could not decode finalScriptWitness with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  return keyVal.value;
}
finalScriptWitness$1.decode = decode$b;
function encode$b(data) {
  const key = Buffer$k.from([typeFields_1$d.InputTypes.FINAL_SCRIPTWITNESS]);
  return {
    key,
    value: data,
  };
}
finalScriptWitness$1.encode = encode$b;
finalScriptWitness$1.expected = 'Buffer';
function check$a(data) {
  return Buffer$k.isBuffer(data);
}
finalScriptWitness$1.check = check$a;
function canAdd$7(currentData, newData) {
  return (
    !!currentData && !!newData && currentData.finalScriptWitness === undefined
  );
}
finalScriptWitness$1.canAdd = canAdd$7;

var nonWitnessUtxo$1 = {};

const { Buffer: Buffer$j } = buffer; // auto-inject!
Object.defineProperty(nonWitnessUtxo$1, '__esModule', { value: true });
const typeFields_1$c = typeFields;
function decode$a(keyVal) {
  if (keyVal.key[0] !== typeFields_1$c.InputTypes.NON_WITNESS_UTXO) {
    throw new Error(
      'Decode Error: could not decode nonWitnessUtxo with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  return keyVal.value;
}
nonWitnessUtxo$1.decode = decode$a;
function encode$a(data) {
  return {
    key: Buffer$j.from([typeFields_1$c.InputTypes.NON_WITNESS_UTXO]),
    value: data,
  };
}
nonWitnessUtxo$1.encode = encode$a;
nonWitnessUtxo$1.expected = 'Buffer';
function check$9(data) {
  return Buffer$j.isBuffer(data);
}
nonWitnessUtxo$1.check = check$9;
function canAdd$6(currentData, newData) {
  return !!currentData && !!newData && currentData.nonWitnessUtxo === undefined;
}
nonWitnessUtxo$1.canAdd = canAdd$6;

var partialSig$1 = {};

const { Buffer: Buffer$i } = buffer; // auto-inject!
Object.defineProperty(partialSig$1, '__esModule', { value: true });
const typeFields_1$b = typeFields;
function decode$9(keyVal) {
  if (keyVal.key[0] !== typeFields_1$b.InputTypes.PARTIAL_SIG) {
    throw new Error(
      'Decode Error: could not decode partialSig with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if (
    !(keyVal.key.length === 34 || keyVal.key.length === 66) ||
    ![2, 3, 4].includes(keyVal.key[1])
  ) {
    throw new Error(
      'Decode Error: partialSig has invalid pubkey in key 0x' +
        keyVal.key.toString('hex')
    );
  }
  const pubkey = keyVal.key.slice(1);
  return {
    pubkey,
    signature: keyVal.value,
  };
}
partialSig$1.decode = decode$9;
function encode$9(pSig) {
  const head = Buffer$i.from([typeFields_1$b.InputTypes.PARTIAL_SIG]);
  return {
    key: Buffer$i.concat([head, pSig.pubkey]),
    value: pSig.signature,
  };
}
partialSig$1.encode = encode$9;
partialSig$1.expected = '{ pubkey: Buffer; signature: Buffer; }';
function check$8(data) {
  return (
    Buffer$i.isBuffer(data.pubkey) &&
    Buffer$i.isBuffer(data.signature) &&
    [33, 65].includes(data.pubkey.length) &&
    [2, 3, 4].includes(data.pubkey[0]) &&
    isDerSigWithSighash(data.signature)
  );
}
partialSig$1.check = check$8;
function isDerSigWithSighash(buf) {
  if (!Buffer$i.isBuffer(buf) || buf.length < 9) return false;
  if (buf[0] !== 0x30) return false;
  if (buf.length !== buf[1] + 3) return false;
  if (buf[2] !== 0x02) return false;
  const rLen = buf[3];
  if (rLen > 33 || rLen < 1) return false;
  if (buf[3 + rLen + 1] !== 0x02) return false;
  const sLen = buf[3 + rLen + 2];
  if (sLen > 33 || sLen < 1) return false;
  if (buf.length !== 3 + rLen + 2 + sLen + 2) return false;
  return true;
}
function canAddToArray$2(array, item, dupeSet) {
  const dupeString = item.pubkey.toString('hex');
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
}
partialSig$1.canAddToArray = canAddToArray$2;

var porCommitment$1 = {};

const { Buffer: Buffer$h } = buffer; // auto-inject!
Object.defineProperty(porCommitment$1, '__esModule', { value: true });
const typeFields_1$a = typeFields;
function decode$8(keyVal) {
  if (keyVal.key[0] !== typeFields_1$a.InputTypes.POR_COMMITMENT) {
    throw new Error(
      'Decode Error: could not decode porCommitment with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  return keyVal.value.toString('utf8');
}
porCommitment$1.decode = decode$8;
function encode$8(data) {
  const key = Buffer$h.from([typeFields_1$a.InputTypes.POR_COMMITMENT]);
  return {
    key,
    value: Buffer$h.from(data, 'utf8'),
  };
}
porCommitment$1.encode = encode$8;
porCommitment$1.expected = 'string';
function check$7(data) {
  return typeof data === 'string';
}
porCommitment$1.check = check$7;
function canAdd$5(currentData, newData) {
  return !!currentData && !!newData && currentData.porCommitment === undefined;
}
porCommitment$1.canAdd = canAdd$5;

var sighashType$1 = {};

const { Buffer: Buffer$g } = buffer; // auto-inject!
Object.defineProperty(sighashType$1, '__esModule', { value: true });
const typeFields_1$9 = typeFields;
function decode$7(keyVal) {
  if (keyVal.key[0] !== typeFields_1$9.InputTypes.SIGHASH_TYPE) {
    throw new Error(
      'Decode Error: could not decode sighashType with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  return keyVal.value.readUInt32LE(0);
}
sighashType$1.decode = decode$7;
function encode$7(data) {
  const key = Buffer$g.from([typeFields_1$9.InputTypes.SIGHASH_TYPE]);
  const value = Buffer$g.allocUnsafe(4);
  value.writeUInt32LE(data, 0);
  return {
    key,
    value,
  };
}
sighashType$1.encode = encode$7;
sighashType$1.expected = 'number';
function check$6(data) {
  return typeof data === 'number';
}
sighashType$1.check = check$6;
function canAdd$4(currentData, newData) {
  return !!currentData && !!newData && currentData.sighashType === undefined;
}
sighashType$1.canAdd = canAdd$4;

var tapKeySig$1 = {};

const { Buffer: Buffer$f } = buffer; // auto-inject!
Object.defineProperty(tapKeySig$1, '__esModule', { value: true });
const typeFields_1$8 = typeFields;
function decode$6(keyVal) {
  if (
    keyVal.key[0] !== typeFields_1$8.InputTypes.TAP_KEY_SIG ||
    keyVal.key.length !== 1
  ) {
    throw new Error(
      'Decode Error: could not decode tapKeySig with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if (!check$5(keyVal.value)) {
    throw new Error(
      'Decode Error: tapKeySig not a valid 64-65-byte BIP340 signature'
    );
  }
  return keyVal.value;
}
tapKeySig$1.decode = decode$6;
function encode$6(value) {
  const key = Buffer$f.from([typeFields_1$8.InputTypes.TAP_KEY_SIG]);
  return { key, value };
}
tapKeySig$1.encode = encode$6;
tapKeySig$1.expected = 'Buffer';
function check$5(data) {
  return Buffer$f.isBuffer(data) && (data.length === 64 || data.length === 65);
}
tapKeySig$1.check = check$5;
function canAdd$3(currentData, newData) {
  return !!currentData && !!newData && currentData.tapKeySig === undefined;
}
tapKeySig$1.canAdd = canAdd$3;

var tapLeafScript$1 = {};

const { Buffer: Buffer$e } = buffer; // auto-inject!
Object.defineProperty(tapLeafScript$1, '__esModule', { value: true });
const typeFields_1$7 = typeFields;
function decode$5(keyVal) {
  if (keyVal.key[0] !== typeFields_1$7.InputTypes.TAP_LEAF_SCRIPT) {
    throw new Error(
      'Decode Error: could not decode tapLeafScript with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if ((keyVal.key.length - 2) % 32 !== 0) {
    throw new Error(
      'Decode Error: tapLeafScript has invalid control block in key 0x' +
        keyVal.key.toString('hex')
    );
  }
  const leafVersion = keyVal.value[keyVal.value.length - 1];
  if ((keyVal.key[1] & 0xfe) !== leafVersion) {
    throw new Error(
      'Decode Error: tapLeafScript bad leaf version in key 0x' +
        keyVal.key.toString('hex')
    );
  }
  const script = keyVal.value.slice(0, -1);
  const controlBlock = keyVal.key.slice(1);
  return { controlBlock, script, leafVersion };
}
tapLeafScript$1.decode = decode$5;
function encode$5(tScript) {
  const head = Buffer$e.from([typeFields_1$7.InputTypes.TAP_LEAF_SCRIPT]);
  const verBuf = Buffer$e.from([tScript.leafVersion]);
  return {
    key: Buffer$e.concat([head, tScript.controlBlock]),
    value: Buffer$e.concat([tScript.script, verBuf]),
  };
}
tapLeafScript$1.encode = encode$5;
tapLeafScript$1.expected =
  '{ controlBlock: Buffer; leafVersion: number, script: Buffer; }';
function check$4(data) {
  return (
    Buffer$e.isBuffer(data.controlBlock) &&
    (data.controlBlock.length - 1) % 32 === 0 &&
    (data.controlBlock[0] & 0xfe) === data.leafVersion &&
    Buffer$e.isBuffer(data.script)
  );
}
tapLeafScript$1.check = check$4;
function canAddToArray$1(array, item, dupeSet) {
  const dupeString = item.controlBlock.toString('hex');
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return (
    array.filter((v) => v.controlBlock.equals(item.controlBlock)).length === 0
  );
}
tapLeafScript$1.canAddToArray = canAddToArray$1;

var tapMerkleRoot$1 = {};

const { Buffer: Buffer$d } = buffer; // auto-inject!
Object.defineProperty(tapMerkleRoot$1, '__esModule', { value: true });
const typeFields_1$6 = typeFields;
function decode$4(keyVal) {
  if (
    keyVal.key[0] !== typeFields_1$6.InputTypes.TAP_MERKLE_ROOT ||
    keyVal.key.length !== 1
  ) {
    throw new Error(
      'Decode Error: could not decode tapMerkleRoot with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if (!check$3(keyVal.value)) {
    throw new Error('Decode Error: tapMerkleRoot not a 32-byte hash');
  }
  return keyVal.value;
}
tapMerkleRoot$1.decode = decode$4;
function encode$4(value) {
  const key = Buffer$d.from([typeFields_1$6.InputTypes.TAP_MERKLE_ROOT]);
  return { key, value };
}
tapMerkleRoot$1.encode = encode$4;
tapMerkleRoot$1.expected = 'Buffer';
function check$3(data) {
  return Buffer$d.isBuffer(data) && data.length === 32;
}
tapMerkleRoot$1.check = check$3;
function canAdd$2(currentData, newData) {
  return !!currentData && !!newData && currentData.tapMerkleRoot === undefined;
}
tapMerkleRoot$1.canAdd = canAdd$2;

var tapScriptSig$1 = {};

const { Buffer: Buffer$c } = buffer; // auto-inject!
Object.defineProperty(tapScriptSig$1, '__esModule', { value: true });
const typeFields_1$5 = typeFields;
function decode$3(keyVal) {
  if (keyVal.key[0] !== typeFields_1$5.InputTypes.TAP_SCRIPT_SIG) {
    throw new Error(
      'Decode Error: could not decode tapScriptSig with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if (keyVal.key.length !== 65) {
    throw new Error(
      'Decode Error: tapScriptSig has invalid key 0x' +
        keyVal.key.toString('hex')
    );
  }
  if (keyVal.value.length !== 64 && keyVal.value.length !== 65) {
    throw new Error(
      'Decode Error: tapScriptSig has invalid signature in key 0x' +
        keyVal.key.toString('hex')
    );
  }
  const pubkey = keyVal.key.slice(1, 33);
  const leafHash = keyVal.key.slice(33);
  return {
    pubkey,
    leafHash,
    signature: keyVal.value,
  };
}
tapScriptSig$1.decode = decode$3;
function encode$3(tSig) {
  const head = Buffer$c.from([typeFields_1$5.InputTypes.TAP_SCRIPT_SIG]);
  return {
    key: Buffer$c.concat([head, tSig.pubkey, tSig.leafHash]),
    value: tSig.signature,
  };
}
tapScriptSig$1.encode = encode$3;
tapScriptSig$1.expected = '{ pubkey: Buffer; leafHash: Buffer; signature: Buffer; }';
function check$2(data) {
  return (
    Buffer$c.isBuffer(data.pubkey) &&
    Buffer$c.isBuffer(data.leafHash) &&
    Buffer$c.isBuffer(data.signature) &&
    data.pubkey.length === 32 &&
    data.leafHash.length === 32 &&
    (data.signature.length === 64 || data.signature.length === 65)
  );
}
tapScriptSig$1.check = check$2;
function canAddToArray(array, item, dupeSet) {
  const dupeString =
    item.pubkey.toString('hex') + item.leafHash.toString('hex');
  if (dupeSet.has(dupeString)) return false;
  dupeSet.add(dupeString);
  return (
    array.filter(
      (v) => v.pubkey.equals(item.pubkey) && v.leafHash.equals(item.leafHash)
    ).length === 0
  );
}
tapScriptSig$1.canAddToArray = canAddToArray;

var witnessUtxo$1 = {};

var tools = {};

var varint = {};

const { Buffer: Buffer$b } = buffer; // auto-inject!
Object.defineProperty(varint, '__esModule', { value: true });
// Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991;
function checkUInt53(n) {
  if (n < 0 || n > MAX_SAFE_INTEGER || n % 1 !== 0)
    throw new RangeError('value out of range');
}
function encode$2(_number, buffer, offset) {
  checkUInt53(_number);
  if (!buffer) buffer = Buffer$b.allocUnsafe(encodingLength(_number));
  if (!Buffer$b.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;
  // 8 bit
  if (_number < 0xfd) {
    buffer.writeUInt8(_number, offset);
    Object.assign(encode$2, { bytes: 1 });
    // 16 bit
  } else if (_number <= 0xffff) {
    buffer.writeUInt8(0xfd, offset);
    buffer.writeUInt16LE(_number, offset + 1);
    Object.assign(encode$2, { bytes: 3 });
    // 32 bit
  } else if (_number <= 0xffffffff) {
    buffer.writeUInt8(0xfe, offset);
    buffer.writeUInt32LE(_number, offset + 1);
    Object.assign(encode$2, { bytes: 5 });
    // 64 bit
  } else {
    buffer.writeUInt8(0xff, offset);
    buffer.writeUInt32LE(_number >>> 0, offset + 1);
    buffer.writeUInt32LE((_number / 0x100000000) | 0, offset + 5);
    Object.assign(encode$2, { bytes: 9 });
  }
  return buffer;
}
varint.encode = encode$2;
function decode$2(buffer, offset) {
  if (!Buffer$b.isBuffer(buffer))
    throw new TypeError('buffer must be a Buffer instance');
  if (!offset) offset = 0;
  const first = buffer.readUInt8(offset);
  // 8 bit
  if (first < 0xfd) {
    Object.assign(decode$2, { bytes: 1 });
    return first;
    // 16 bit
  } else if (first === 0xfd) {
    Object.assign(decode$2, { bytes: 3 });
    return buffer.readUInt16LE(offset + 1);
    // 32 bit
  } else if (first === 0xfe) {
    Object.assign(decode$2, { bytes: 5 });
    return buffer.readUInt32LE(offset + 1);
    // 64 bit
  } else {
    Object.assign(decode$2, { bytes: 9 });
    const lo = buffer.readUInt32LE(offset + 1);
    const hi = buffer.readUInt32LE(offset + 5);
    const _number = hi * 0x0100000000 + lo;
    checkUInt53(_number);
    return _number;
  }
}
varint.decode = decode$2;
function encodingLength(_number) {
  checkUInt53(_number);
  return _number < 0xfd
    ? 1
    : _number <= 0xffff
    ? 3
    : _number <= 0xffffffff
    ? 5
    : 9;
}
varint.encodingLength = encodingLength;

const { Buffer: Buffer$a } = buffer; // auto-inject!
Object.defineProperty(tools, '__esModule', { value: true });
const varuint$4 = varint;
tools.range = (n) => [...Array(n).keys()];
function reverseBuffer(buffer) {
  if (buffer.length < 1) return buffer;
  let j = buffer.length - 1;
  let tmp = 0;
  for (let i = 0; i < buffer.length / 2; i++) {
    tmp = buffer[i];
    buffer[i] = buffer[j];
    buffer[j] = tmp;
    j--;
  }
  return buffer;
}
tools.reverseBuffer = reverseBuffer;
function keyValsToBuffer(keyVals) {
  const buffers = keyVals.map(keyValToBuffer);
  buffers.push(Buffer$a.from([0]));
  return Buffer$a.concat(buffers);
}
tools.keyValsToBuffer = keyValsToBuffer;
function keyValToBuffer(keyVal) {
  const keyLen = keyVal.key.length;
  const valLen = keyVal.value.length;
  const keyVarIntLen = varuint$4.encodingLength(keyLen);
  const valVarIntLen = varuint$4.encodingLength(valLen);
  const buffer = Buffer$a.allocUnsafe(
    keyVarIntLen + keyLen + valVarIntLen + valLen
  );
  varuint$4.encode(keyLen, buffer, 0);
  keyVal.key.copy(buffer, keyVarIntLen);
  varuint$4.encode(valLen, buffer, keyVarIntLen + keyLen);
  keyVal.value.copy(buffer, keyVarIntLen + keyLen + valVarIntLen);
  return buffer;
}
tools.keyValToBuffer = keyValToBuffer;
// https://github.com/feross/buffer/blob/master/index.js#L1127
function verifuint(value, max) {
  if (typeof value !== 'number')
    throw new Error('cannot write a non-number as a number');
  if (value < 0)
    throw new Error('specified a negative value for writing an unsigned value');
  if (value > max) throw new Error('RangeError: value out of range');
  if (Math.floor(value) !== value)
    throw new Error('value has a fractional component');
}
function readUInt64LE(buffer, offset) {
  const a = buffer.readUInt32LE(offset);
  let b = buffer.readUInt32LE(offset + 4);
  b *= 0x100000000;
  verifuint(b + a, 0x001fffffffffffff);
  return b + a;
}
tools.readUInt64LE = readUInt64LE;
function writeUInt64LE(buffer, value, offset) {
  verifuint(value, 0x001fffffffffffff);
  buffer.writeInt32LE(value & -1, offset);
  buffer.writeUInt32LE(Math.floor(value / 0x100000000), offset + 4);
  return offset + 8;
}
tools.writeUInt64LE = writeUInt64LE;

const { Buffer: Buffer$9 } = buffer; // auto-inject!
Object.defineProperty(witnessUtxo$1, '__esModule', { value: true });
const typeFields_1$4 = typeFields;
const tools_1$2 = tools;
const varuint$3 = varint;
function decode$1(keyVal) {
  if (keyVal.key[0] !== typeFields_1$4.InputTypes.WITNESS_UTXO) {
    throw new Error(
      'Decode Error: could not decode witnessUtxo with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  const value = tools_1$2.readUInt64LE(keyVal.value, 0);
  let _offset = 8;
  const scriptLen = varuint$3.decode(keyVal.value, _offset);
  _offset += varuint$3.encodingLength(scriptLen);
  const script = keyVal.value.slice(_offset);
  if (script.length !== scriptLen) {
    throw new Error('Decode Error: WITNESS_UTXO script is not proper length');
  }
  return {
    script,
    value,
  };
}
witnessUtxo$1.decode = decode$1;
function encode$1(data) {
  const { script, value } = data;
  const varintLen = varuint$3.encodingLength(script.length);
  const result = Buffer$9.allocUnsafe(8 + varintLen + script.length);
  tools_1$2.writeUInt64LE(result, value, 0);
  varuint$3.encode(script.length, result, 8);
  script.copy(result, 8 + varintLen);
  return {
    key: Buffer$9.from([typeFields_1$4.InputTypes.WITNESS_UTXO]),
    value: result,
  };
}
witnessUtxo$1.encode = encode$1;
witnessUtxo$1.expected = '{ script: Buffer; value: number; }';
function check$1(data) {
  return Buffer$9.isBuffer(data.script) && typeof data.value === 'number';
}
witnessUtxo$1.check = check$1;
function canAdd$1(currentData, newData) {
  return !!currentData && !!newData && currentData.witnessUtxo === undefined;
}
witnessUtxo$1.canAdd = canAdd$1;

var tapTree$1 = {};

const { Buffer: Buffer$8 } = buffer; // auto-inject!
Object.defineProperty(tapTree$1, '__esModule', { value: true });
const typeFields_1$3 = typeFields;
const varuint$2 = varint;
function decode(keyVal) {
  if (
    keyVal.key[0] !== typeFields_1$3.OutputTypes.TAP_TREE ||
    keyVal.key.length !== 1
  ) {
    throw new Error(
      'Decode Error: could not decode tapTree with key 0x' +
        keyVal.key.toString('hex')
    );
  }
  let _offset = 0;
  const data = [];
  while (_offset < keyVal.value.length) {
    const depth = keyVal.value[_offset++];
    const leafVersion = keyVal.value[_offset++];
    const scriptLen = varuint$2.decode(keyVal.value, _offset);
    _offset += varuint$2.encodingLength(scriptLen);
    data.push({
      depth,
      leafVersion,
      script: keyVal.value.slice(_offset, _offset + scriptLen),
    });
    _offset += scriptLen;
  }
  return { leaves: data };
}
tapTree$1.decode = decode;
function encode(tree) {
  const key = Buffer$8.from([typeFields_1$3.OutputTypes.TAP_TREE]);
  const bufs = [].concat(
    ...tree.leaves.map((tapLeaf) => [
      Buffer$8.of(tapLeaf.depth, tapLeaf.leafVersion),
      varuint$2.encode(tapLeaf.script.length),
      tapLeaf.script,
    ])
  );
  return {
    key,
    value: Buffer$8.concat(bufs),
  };
}
tapTree$1.encode = encode;
tapTree$1.expected =
  '{ leaves: [{ depth: number; leafVersion: number, script: Buffer; }] }';
function check(data) {
  return (
    Array.isArray(data.leaves) &&
    data.leaves.every(
      (tapLeaf) =>
        tapLeaf.depth >= 0 &&
        tapLeaf.depth <= 128 &&
        (tapLeaf.leafVersion & 0xfe) === tapLeaf.leafVersion &&
        Buffer$8.isBuffer(tapLeaf.script)
    )
  );
}
tapTree$1.check = check;
function canAdd(currentData, newData) {
  return !!currentData && !!newData && currentData.tapTree === undefined;
}
tapTree$1.canAdd = canAdd;

var bip32Derivation$2 = {};

const { Buffer: Buffer$7 } = buffer; // auto-inject!
Object.defineProperty(bip32Derivation$2, '__esModule', { value: true });
const range$1 = (n) => [...Array(n).keys()];
const isValidDERKey = (pubkey) =>
  (pubkey.length === 33 && [2, 3].includes(pubkey[0])) ||
  (pubkey.length === 65 && 4 === pubkey[0]);
function makeConverter$4(TYPE_BYTE, isValidPubkey = isValidDERKey) {
  function decode(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        'Decode Error: could not decode bip32Derivation with key 0x' +
          keyVal.key.toString('hex')
      );
    }
    const pubkey = keyVal.key.slice(1);
    if (!isValidPubkey(pubkey)) {
      throw new Error(
        'Decode Error: bip32Derivation has invalid pubkey in key 0x' +
          keyVal.key.toString('hex')
      );
    }
    if ((keyVal.value.length / 4) % 1 !== 0) {
      throw new Error(
        'Decode Error: Input BIP32_DERIVATION value length should be multiple of 4'
      );
    }
    const data = {
      masterFingerprint: keyVal.value.slice(0, 4),
      pubkey,
      path: 'm',
    };
    for (const i of range$1(keyVal.value.length / 4 - 1)) {
      const val = keyVal.value.readUInt32LE(i * 4 + 4);
      const isHard = !!(val & 0x80000000);
      const idx = val & 0x7fffffff;
      data.path += '/' + idx.toString(10) + (isHard ? "'" : '');
    }
    return data;
  }
  function encode(data) {
    const head = Buffer$7.from([TYPE_BYTE]);
    const key = Buffer$7.concat([head, data.pubkey]);
    const splitPath = data.path.split('/');
    const value = Buffer$7.allocUnsafe(splitPath.length * 4);
    data.masterFingerprint.copy(value, 0);
    let offset = 4;
    splitPath.slice(1).forEach((level) => {
      const isHard = level.slice(-1) === "'";
      let num = 0x7fffffff & parseInt(isHard ? level.slice(0, -1) : level, 10);
      if (isHard) num += 0x80000000;
      value.writeUInt32LE(num, offset);
      offset += 4;
    });
    return {
      key,
      value,
    };
  }
  const expected =
    '{ masterFingerprint: Buffer; pubkey: Buffer; path: string; }';
  function check(data) {
    return (
      Buffer$7.isBuffer(data.pubkey) &&
      Buffer$7.isBuffer(data.masterFingerprint) &&
      typeof data.path === 'string' &&
      isValidPubkey(data.pubkey) &&
      data.masterFingerprint.length === 4
    );
  }
  function canAddToArray(array, item, dupeSet) {
    const dupeString = item.pubkey.toString('hex');
    if (dupeSet.has(dupeString)) return false;
    dupeSet.add(dupeString);
    return array.filter((v) => v.pubkey.equals(item.pubkey)).length === 0;
  }
  return {
    decode,
    encode,
    check,
    expected,
    canAddToArray,
  };
}
bip32Derivation$2.makeConverter = makeConverter$4;

var checkPubkey$1 = {};

Object.defineProperty(checkPubkey$1, '__esModule', { value: true });
function makeChecker(pubkeyTypes) {
  return checkPubkey;
  function checkPubkey(keyVal) {
    let pubkey;
    if (pubkeyTypes.includes(keyVal.key[0])) {
      pubkey = keyVal.key.slice(1);
      if (
        !(pubkey.length === 33 || pubkey.length === 65) ||
        ![2, 3, 4].includes(pubkey[0])
      ) {
        throw new Error(
          'Format Error: invalid pubkey in key 0x' + keyVal.key.toString('hex')
        );
      }
    }
    return pubkey;
  }
}
checkPubkey$1.makeChecker = makeChecker;

var redeemScript$1 = {};

const { Buffer: Buffer$6 } = buffer; // auto-inject!
Object.defineProperty(redeemScript$1, '__esModule', { value: true });
function makeConverter$3(TYPE_BYTE) {
  function decode(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        'Decode Error: could not decode redeemScript with key 0x' +
          keyVal.key.toString('hex')
      );
    }
    return keyVal.value;
  }
  function encode(data) {
    const key = Buffer$6.from([TYPE_BYTE]);
    return {
      key,
      value: data,
    };
  }
  const expected = 'Buffer';
  function check(data) {
    return Buffer$6.isBuffer(data);
  }
  function canAdd(currentData, newData) {
    return !!currentData && !!newData && currentData.redeemScript === undefined;
  }
  return {
    decode,
    encode,
    check,
    expected,
    canAdd,
  };
}
redeemScript$1.makeConverter = makeConverter$3;

var tapBip32Derivation$1 = {};

const { Buffer: Buffer$5 } = buffer; // auto-inject!
Object.defineProperty(tapBip32Derivation$1, '__esModule', { value: true });
const varuint$1 = varint;
const bip32Derivation$1 = bip32Derivation$2;
const isValidBIP340Key = (pubkey) => pubkey.length === 32;
function makeConverter$2(TYPE_BYTE) {
  const parent = bip32Derivation$1.makeConverter(TYPE_BYTE, isValidBIP340Key);
  function decode(keyVal) {
    const nHashes = varuint$1.decode(keyVal.value);
    const nHashesLen = varuint$1.encodingLength(nHashes);
    const base = parent.decode({
      key: keyVal.key,
      value: keyVal.value.slice(nHashesLen + nHashes * 32),
    });
    const leafHashes = new Array(nHashes);
    for (let i = 0, _offset = nHashesLen; i < nHashes; i++, _offset += 32) {
      leafHashes[i] = keyVal.value.slice(_offset, _offset + 32);
    }
    return Object.assign({}, base, { leafHashes });
  }
  function encode(data) {
    const base = parent.encode(data);
    const nHashesLen = varuint$1.encodingLength(data.leafHashes.length);
    const nHashesBuf = Buffer$5.allocUnsafe(nHashesLen);
    varuint$1.encode(data.leafHashes.length, nHashesBuf);
    const value = Buffer$5.concat([nHashesBuf, ...data.leafHashes, base.value]);
    return Object.assign({}, base, { value });
  }
  const expected =
    '{ ' +
    'masterFingerprint: Buffer; ' +
    'pubkey: Buffer; ' +
    'path: string; ' +
    'leafHashes: Buffer[]; ' +
    '}';
  function check(data) {
    return (
      Array.isArray(data.leafHashes) &&
      data.leafHashes.every(
        (leafHash) => Buffer$5.isBuffer(leafHash) && leafHash.length === 32
      ) &&
      parent.check(data)
    );
  }
  return {
    decode,
    encode,
    check,
    expected,
    canAddToArray: parent.canAddToArray,
  };
}
tapBip32Derivation$1.makeConverter = makeConverter$2;

var tapInternalKey$1 = {};

const { Buffer: Buffer$4 } = buffer; // auto-inject!
Object.defineProperty(tapInternalKey$1, '__esModule', { value: true });
function makeConverter$1(TYPE_BYTE) {
  function decode(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE || keyVal.key.length !== 1) {
      throw new Error(
        'Decode Error: could not decode tapInternalKey with key 0x' +
          keyVal.key.toString('hex')
      );
    }
    if (keyVal.value.length !== 32) {
      throw new Error(
        'Decode Error: tapInternalKey not a 32-byte x-only pubkey'
      );
    }
    return keyVal.value;
  }
  function encode(value) {
    const key = Buffer$4.from([TYPE_BYTE]);
    return { key, value };
  }
  const expected = 'Buffer';
  function check(data) {
    return Buffer$4.isBuffer(data) && data.length === 32;
  }
  function canAdd(currentData, newData) {
    return (
      !!currentData && !!newData && currentData.tapInternalKey === undefined
    );
  }
  return {
    decode,
    encode,
    check,
    expected,
    canAdd,
  };
}
tapInternalKey$1.makeConverter = makeConverter$1;

var witnessScript$1 = {};

const { Buffer: Buffer$3 } = buffer; // auto-inject!
Object.defineProperty(witnessScript$1, '__esModule', { value: true });
function makeConverter(TYPE_BYTE) {
  function decode(keyVal) {
    if (keyVal.key[0] !== TYPE_BYTE) {
      throw new Error(
        'Decode Error: could not decode witnessScript with key 0x' +
          keyVal.key.toString('hex')
      );
    }
    return keyVal.value;
  }
  function encode(data) {
    const key = Buffer$3.from([TYPE_BYTE]);
    return {
      key,
      value: data,
    };
  }
  const expected = 'Buffer';
  function check(data) {
    return Buffer$3.isBuffer(data);
  }
  function canAdd(currentData, newData) {
    return (
      !!currentData && !!newData && currentData.witnessScript === undefined
    );
  }
  return {
    decode,
    encode,
    check,
    expected,
    canAdd,
  };
}
witnessScript$1.makeConverter = makeConverter;

Object.defineProperty(converter, '__esModule', { value: true });
const typeFields_1$2 = typeFields;
const globalXpub = globalXpub$1;
const unsignedTx = unsignedTx$1;
const finalScriptSig = finalScriptSig$1;
const finalScriptWitness = finalScriptWitness$1;
const nonWitnessUtxo = nonWitnessUtxo$1;
const partialSig = partialSig$1;
const porCommitment = porCommitment$1;
const sighashType = sighashType$1;
const tapKeySig = tapKeySig$1;
const tapLeafScript = tapLeafScript$1;
const tapMerkleRoot = tapMerkleRoot$1;
const tapScriptSig = tapScriptSig$1;
const witnessUtxo = witnessUtxo$1;
const tapTree = tapTree$1;
const bip32Derivation = bip32Derivation$2;
const checkPubkey = checkPubkey$1;
const redeemScript = redeemScript$1;
const tapBip32Derivation = tapBip32Derivation$1;
const tapInternalKey = tapInternalKey$1;
const witnessScript = witnessScript$1;
const globals = {
  unsignedTx,
  globalXpub,
  // pass an Array of key bytes that require pubkey beside the key
  checkPubkey: checkPubkey.makeChecker([]),
};
converter.globals = globals;
const inputs = {
  nonWitnessUtxo,
  partialSig,
  sighashType,
  finalScriptSig,
  finalScriptWitness,
  porCommitment,
  witnessUtxo,
  bip32Derivation: bip32Derivation.makeConverter(
    typeFields_1$2.InputTypes.BIP32_DERIVATION
  ),
  redeemScript: redeemScript.makeConverter(
    typeFields_1$2.InputTypes.REDEEM_SCRIPT
  ),
  witnessScript: witnessScript.makeConverter(
    typeFields_1$2.InputTypes.WITNESS_SCRIPT
  ),
  checkPubkey: checkPubkey.makeChecker([
    typeFields_1$2.InputTypes.PARTIAL_SIG,
    typeFields_1$2.InputTypes.BIP32_DERIVATION,
  ]),
  tapKeySig,
  tapScriptSig,
  tapLeafScript,
  tapBip32Derivation: tapBip32Derivation.makeConverter(
    typeFields_1$2.InputTypes.TAP_BIP32_DERIVATION
  ),
  tapInternalKey: tapInternalKey.makeConverter(
    typeFields_1$2.InputTypes.TAP_INTERNAL_KEY
  ),
  tapMerkleRoot,
};
converter.inputs = inputs;
const outputs = {
  bip32Derivation: bip32Derivation.makeConverter(
    typeFields_1$2.OutputTypes.BIP32_DERIVATION
  ),
  redeemScript: redeemScript.makeConverter(
    typeFields_1$2.OutputTypes.REDEEM_SCRIPT
  ),
  witnessScript: witnessScript.makeConverter(
    typeFields_1$2.OutputTypes.WITNESS_SCRIPT
  ),
  checkPubkey: checkPubkey.makeChecker([
    typeFields_1$2.OutputTypes.BIP32_DERIVATION,
  ]),
  tapBip32Derivation: tapBip32Derivation.makeConverter(
    typeFields_1$2.OutputTypes.TAP_BIP32_DERIVATION
  ),
  tapTree,
  tapInternalKey: tapInternalKey.makeConverter(
    typeFields_1$2.OutputTypes.TAP_INTERNAL_KEY
  ),
};
converter.outputs = outputs;

const { Buffer: Buffer$2 } = buffer; // auto-inject!
Object.defineProperty(fromBuffer, '__esModule', { value: true });
const convert$1 = converter;
const tools_1$1 = tools;
const varuint = varint;
const typeFields_1$1 = typeFields;
function psbtFromBuffer(buffer, txGetter) {
  let offset = 0;
  function varSlice() {
    const keyLen = varuint.decode(buffer, offset);
    offset += varuint.encodingLength(keyLen);
    const key = buffer.slice(offset, offset + keyLen);
    offset += keyLen;
    return key;
  }
  function readUInt32BE() {
    const num = buffer.readUInt32BE(offset);
    offset += 4;
    return num;
  }
  function readUInt8() {
    const num = buffer.readUInt8(offset);
    offset += 1;
    return num;
  }
  function getKeyValue() {
    const key = varSlice();
    const value = varSlice();
    return {
      key,
      value,
    };
  }
  function checkEndOfKeyValPairs() {
    if (offset >= buffer.length) {
      throw new Error('Format Error: Unexpected End of PSBT');
    }
    const isEnd = buffer.readUInt8(offset) === 0;
    if (isEnd) {
      offset++;
    }
    return isEnd;
  }
  if (readUInt32BE() !== 0x70736274) {
    throw new Error('Format Error: Invalid Magic Number');
  }
  if (readUInt8() !== 0xff) {
    throw new Error(
      'Format Error: Magic Number must be followed by 0xff separator'
    );
  }
  const globalMapKeyVals = [];
  const globalKeyIndex = {};
  while (!checkEndOfKeyValPairs()) {
    const keyVal = getKeyValue();
    const hexKey = keyVal.key.toString('hex');
    if (globalKeyIndex[hexKey]) {
      throw new Error(
        'Format Error: Keys must be unique for global keymap: key ' + hexKey
      );
    }
    globalKeyIndex[hexKey] = 1;
    globalMapKeyVals.push(keyVal);
  }
  const unsignedTxMaps = globalMapKeyVals.filter(
    (keyVal) => keyVal.key[0] === typeFields_1$1.GlobalTypes.UNSIGNED_TX
  );
  if (unsignedTxMaps.length !== 1) {
    throw new Error('Format Error: Only one UNSIGNED_TX allowed');
  }
  const unsignedTx = txGetter(unsignedTxMaps[0].value);
  // Get input and output counts to loop the respective fields
  const { inputCount, outputCount } = unsignedTx.getInputOutputCounts();
  const inputKeyVals = [];
  const outputKeyVals = [];
  // Get input fields
  for (const index of tools_1$1.range(inputCount)) {
    const inputKeyIndex = {};
    const input = [];
    while (!checkEndOfKeyValPairs()) {
      const keyVal = getKeyValue();
      const hexKey = keyVal.key.toString('hex');
      if (inputKeyIndex[hexKey]) {
        throw new Error(
          'Format Error: Keys must be unique for each input: ' +
            'input index ' +
            index +
            ' key ' +
            hexKey
        );
      }
      inputKeyIndex[hexKey] = 1;
      input.push(keyVal);
    }
    inputKeyVals.push(input);
  }
  for (const index of tools_1$1.range(outputCount)) {
    const outputKeyIndex = {};
    const output = [];
    while (!checkEndOfKeyValPairs()) {
      const keyVal = getKeyValue();
      const hexKey = keyVal.key.toString('hex');
      if (outputKeyIndex[hexKey]) {
        throw new Error(
          'Format Error: Keys must be unique for each output: ' +
            'output index ' +
            index +
            ' key ' +
            hexKey
        );
      }
      outputKeyIndex[hexKey] = 1;
      output.push(keyVal);
    }
    outputKeyVals.push(output);
  }
  return psbtFromKeyVals(unsignedTx, {
    globalMapKeyVals,
    inputKeyVals,
    outputKeyVals,
  });
}
fromBuffer.psbtFromBuffer = psbtFromBuffer;
function checkKeyBuffer(type, keyBuf, keyNum) {
  if (!keyBuf.equals(Buffer$2.from([keyNum]))) {
    throw new Error(
      `Format Error: Invalid ${type} key: ${keyBuf.toString('hex')}`
    );
  }
}
fromBuffer.checkKeyBuffer = checkKeyBuffer;
function psbtFromKeyVals(
  unsignedTx,
  { globalMapKeyVals, inputKeyVals, outputKeyVals }
) {
  // That was easy :-)
  const globalMap = {
    unsignedTx,
  };
  let txCount = 0;
  for (const keyVal of globalMapKeyVals) {
    // If a globalMap item needs pubkey, uncomment
    // const pubkey = convert.globals.checkPubkey(keyVal);
    switch (keyVal.key[0]) {
      case typeFields_1$1.GlobalTypes.UNSIGNED_TX:
        checkKeyBuffer(
          'global',
          keyVal.key,
          typeFields_1$1.GlobalTypes.UNSIGNED_TX
        );
        if (txCount > 0) {
          throw new Error('Format Error: GlobalMap has multiple UNSIGNED_TX');
        }
        txCount++;
        break;
      case typeFields_1$1.GlobalTypes.GLOBAL_XPUB:
        if (globalMap.globalXpub === undefined) {
          globalMap.globalXpub = [];
        }
        globalMap.globalXpub.push(convert$1.globals.globalXpub.decode(keyVal));
        break;
      default:
        // This will allow inclusion during serialization.
        if (!globalMap.unknownKeyVals) globalMap.unknownKeyVals = [];
        globalMap.unknownKeyVals.push(keyVal);
    }
  }
  // Get input and output counts to loop the respective fields
  const inputCount = inputKeyVals.length;
  const outputCount = outputKeyVals.length;
  const inputs = [];
  const outputs = [];
  // Get input fields
  for (const index of tools_1$1.range(inputCount)) {
    const input = {};
    for (const keyVal of inputKeyVals[index]) {
      convert$1.inputs.checkPubkey(keyVal);
      switch (keyVal.key[0]) {
        case typeFields_1$1.InputTypes.NON_WITNESS_UTXO:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.NON_WITNESS_UTXO
          );
          if (input.nonWitnessUtxo !== undefined) {
            throw new Error(
              'Format Error: Input has multiple NON_WITNESS_UTXO'
            );
          }
          input.nonWitnessUtxo = convert$1.inputs.nonWitnessUtxo.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.WITNESS_UTXO:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.WITNESS_UTXO
          );
          if (input.witnessUtxo !== undefined) {
            throw new Error('Format Error: Input has multiple WITNESS_UTXO');
          }
          input.witnessUtxo = convert$1.inputs.witnessUtxo.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.PARTIAL_SIG:
          if (input.partialSig === undefined) {
            input.partialSig = [];
          }
          input.partialSig.push(convert$1.inputs.partialSig.decode(keyVal));
          break;
        case typeFields_1$1.InputTypes.SIGHASH_TYPE:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.SIGHASH_TYPE
          );
          if (input.sighashType !== undefined) {
            throw new Error('Format Error: Input has multiple SIGHASH_TYPE');
          }
          input.sighashType = convert$1.inputs.sighashType.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.REDEEM_SCRIPT:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.REDEEM_SCRIPT
          );
          if (input.redeemScript !== undefined) {
            throw new Error('Format Error: Input has multiple REDEEM_SCRIPT');
          }
          input.redeemScript = convert$1.inputs.redeemScript.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.WITNESS_SCRIPT:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.WITNESS_SCRIPT
          );
          if (input.witnessScript !== undefined) {
            throw new Error('Format Error: Input has multiple WITNESS_SCRIPT');
          }
          input.witnessScript = convert$1.inputs.witnessScript.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.BIP32_DERIVATION:
          if (input.bip32Derivation === undefined) {
            input.bip32Derivation = [];
          }
          input.bip32Derivation.push(
            convert$1.inputs.bip32Derivation.decode(keyVal)
          );
          break;
        case typeFields_1$1.InputTypes.FINAL_SCRIPTSIG:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.FINAL_SCRIPTSIG
          );
          input.finalScriptSig = convert$1.inputs.finalScriptSig.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.FINAL_SCRIPTWITNESS:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.FINAL_SCRIPTWITNESS
          );
          input.finalScriptWitness =
            convert$1.inputs.finalScriptWitness.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.POR_COMMITMENT:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.POR_COMMITMENT
          );
          input.porCommitment = convert$1.inputs.porCommitment.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.TAP_KEY_SIG:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.TAP_KEY_SIG
          );
          input.tapKeySig = convert$1.inputs.tapKeySig.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.TAP_SCRIPT_SIG:
          if (input.tapScriptSig === undefined) {
            input.tapScriptSig = [];
          }
          input.tapScriptSig.push(convert$1.inputs.tapScriptSig.decode(keyVal));
          break;
        case typeFields_1$1.InputTypes.TAP_LEAF_SCRIPT:
          if (input.tapLeafScript === undefined) {
            input.tapLeafScript = [];
          }
          input.tapLeafScript.push(convert$1.inputs.tapLeafScript.decode(keyVal));
          break;
        case typeFields_1$1.InputTypes.TAP_BIP32_DERIVATION:
          if (input.tapBip32Derivation === undefined) {
            input.tapBip32Derivation = [];
          }
          input.tapBip32Derivation.push(
            convert$1.inputs.tapBip32Derivation.decode(keyVal)
          );
          break;
        case typeFields_1$1.InputTypes.TAP_INTERNAL_KEY:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.TAP_INTERNAL_KEY
          );
          input.tapInternalKey = convert$1.inputs.tapInternalKey.decode(keyVal);
          break;
        case typeFields_1$1.InputTypes.TAP_MERKLE_ROOT:
          checkKeyBuffer(
            'input',
            keyVal.key,
            typeFields_1$1.InputTypes.TAP_MERKLE_ROOT
          );
          input.tapMerkleRoot = convert$1.inputs.tapMerkleRoot.decode(keyVal);
          break;
        default:
          // This will allow inclusion during serialization.
          if (!input.unknownKeyVals) input.unknownKeyVals = [];
          input.unknownKeyVals.push(keyVal);
      }
    }
    inputs.push(input);
  }
  for (const index of tools_1$1.range(outputCount)) {
    const output = {};
    for (const keyVal of outputKeyVals[index]) {
      convert$1.outputs.checkPubkey(keyVal);
      switch (keyVal.key[0]) {
        case typeFields_1$1.OutputTypes.REDEEM_SCRIPT:
          checkKeyBuffer(
            'output',
            keyVal.key,
            typeFields_1$1.OutputTypes.REDEEM_SCRIPT
          );
          if (output.redeemScript !== undefined) {
            throw new Error('Format Error: Output has multiple REDEEM_SCRIPT');
          }
          output.redeemScript = convert$1.outputs.redeemScript.decode(keyVal);
          break;
        case typeFields_1$1.OutputTypes.WITNESS_SCRIPT:
          checkKeyBuffer(
            'output',
            keyVal.key,
            typeFields_1$1.OutputTypes.WITNESS_SCRIPT
          );
          if (output.witnessScript !== undefined) {
            throw new Error('Format Error: Output has multiple WITNESS_SCRIPT');
          }
          output.witnessScript = convert$1.outputs.witnessScript.decode(keyVal);
          break;
        case typeFields_1$1.OutputTypes.BIP32_DERIVATION:
          if (output.bip32Derivation === undefined) {
            output.bip32Derivation = [];
          }
          output.bip32Derivation.push(
            convert$1.outputs.bip32Derivation.decode(keyVal)
          );
          break;
        case typeFields_1$1.OutputTypes.TAP_INTERNAL_KEY:
          checkKeyBuffer(
            'output',
            keyVal.key,
            typeFields_1$1.OutputTypes.TAP_INTERNAL_KEY
          );
          output.tapInternalKey = convert$1.outputs.tapInternalKey.decode(keyVal);
          break;
        case typeFields_1$1.OutputTypes.TAP_TREE:
          checkKeyBuffer(
            'output',
            keyVal.key,
            typeFields_1$1.OutputTypes.TAP_TREE
          );
          output.tapTree = convert$1.outputs.tapTree.decode(keyVal);
          break;
        case typeFields_1$1.OutputTypes.TAP_BIP32_DERIVATION:
          if (output.tapBip32Derivation === undefined) {
            output.tapBip32Derivation = [];
          }
          output.tapBip32Derivation.push(
            convert$1.outputs.tapBip32Derivation.decode(keyVal)
          );
          break;
        default:
          if (!output.unknownKeyVals) output.unknownKeyVals = [];
          output.unknownKeyVals.push(keyVal);
      }
    }
    outputs.push(output);
  }
  return { globalMap, inputs, outputs };
}
fromBuffer.psbtFromKeyVals = psbtFromKeyVals;

var toBuffer = {};

const { Buffer: Buffer$1 } = buffer; // auto-inject!
Object.defineProperty(toBuffer, '__esModule', { value: true });
const convert = converter;
const tools_1 = tools;
function psbtToBuffer({ globalMap, inputs, outputs }) {
  const { globalKeyVals, inputKeyVals, outputKeyVals } = psbtToKeyVals({
    globalMap,
    inputs,
    outputs,
  });
  const globalBuffer = tools_1.keyValsToBuffer(globalKeyVals);
  const keyValsOrEmptyToBuffer = (keyVals) =>
    keyVals.length === 0
      ? //@ts-ignore
        [Buffer$1.from([0])]
      : keyVals.map(tools_1.keyValsToBuffer);
  const inputBuffers = keyValsOrEmptyToBuffer(inputKeyVals);
  const outputBuffers = keyValsOrEmptyToBuffer(outputKeyVals);
  const header = Buffer$1.allocUnsafe(5);
  header.writeUIntBE(0x70736274ff, 0, 5);
  return Buffer$1.concat(
    [header, globalBuffer].concat(inputBuffers, outputBuffers)
  );
}
toBuffer.psbtToBuffer = psbtToBuffer;
const sortKeyVals = (a, b) => {
  return a.key.compare(b.key);
};
function keyValsFromMap(keyValMap, converterFactory) {
  const keyHexSet = new Set();
  const keyVals = Object.entries(keyValMap).reduce((result, [key, value]) => {
    if (key === 'unknownKeyVals') return result;
    // We are checking for undefined anyways. So ignore TS error
    // @ts-ignore
    const converter = converterFactory[key];
    if (converter === undefined) return result;
    const encodedKeyVals = (Array.isArray(value) ? value : [value]).map(
      converter.encode
    );
    const keyHexes = encodedKeyVals.map((kv) => kv.key.toString('hex'));
    keyHexes.forEach((hex) => {
      if (keyHexSet.has(hex))
        throw new Error('Serialize Error: Duplicate key: ' + hex);
      keyHexSet.add(hex);
    });
    return result.concat(encodedKeyVals);
  }, []);
  // Get other keyVals that have not yet been gotten
  const otherKeyVals = keyValMap.unknownKeyVals
    ? keyValMap.unknownKeyVals.filter((keyVal) => {
        return !keyHexSet.has(keyVal.key.toString('hex'));
      })
    : [];
  return keyVals.concat(otherKeyVals).sort(sortKeyVals);
}
function psbtToKeyVals({ globalMap, inputs, outputs }) {
  // First parse the global keyVals
  // Get any extra keyvals to pass along
  return {
    globalKeyVals: keyValsFromMap(globalMap, convert.globals),
    inputKeyVals: inputs.map((i) => keyValsFromMap(i, convert.inputs)),
    outputKeyVals: outputs.map((o) => keyValsFromMap(o, convert.outputs)),
  };
}
toBuffer.psbtToKeyVals = psbtToKeyVals;

(function (exports) {
	function __export(m) {
	  for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
	}
	Object.defineProperty(exports, '__esModule', { value: true });
	__export(fromBuffer);
	__export(toBuffer);
} (parser));

Object.defineProperty(combiner, '__esModule', { value: true });
const parser_1$1 = parser;
function combine(psbts) {
  const self = psbts[0];
  const selfKeyVals = parser_1$1.psbtToKeyVals(self);
  const others = psbts.slice(1);
  if (others.length === 0) throw new Error('Combine: Nothing to combine');
  const selfTx = getTx(self);
  if (selfTx === undefined) {
    throw new Error('Combine: Self missing transaction');
  }
  const selfGlobalSet = getKeySet(selfKeyVals.globalKeyVals);
  const selfInputSets = selfKeyVals.inputKeyVals.map(getKeySet);
  const selfOutputSets = selfKeyVals.outputKeyVals.map(getKeySet);
  for (const other of others) {
    const otherTx = getTx(other);
    if (
      otherTx === undefined ||
      !otherTx.toBuffer().equals(selfTx.toBuffer())
    ) {
      throw new Error(
        'Combine: One of the Psbts does not have the same transaction.'
      );
    }
    const otherKeyVals = parser_1$1.psbtToKeyVals(other);
    const otherGlobalSet = getKeySet(otherKeyVals.globalKeyVals);
    otherGlobalSet.forEach(
      keyPusher(
        selfGlobalSet,
        selfKeyVals.globalKeyVals,
        otherKeyVals.globalKeyVals
      )
    );
    const otherInputSets = otherKeyVals.inputKeyVals.map(getKeySet);
    otherInputSets.forEach((inputSet, idx) =>
      inputSet.forEach(
        keyPusher(
          selfInputSets[idx],
          selfKeyVals.inputKeyVals[idx],
          otherKeyVals.inputKeyVals[idx]
        )
      )
    );
    const otherOutputSets = otherKeyVals.outputKeyVals.map(getKeySet);
    otherOutputSets.forEach((outputSet, idx) =>
      outputSet.forEach(
        keyPusher(
          selfOutputSets[idx],
          selfKeyVals.outputKeyVals[idx],
          otherKeyVals.outputKeyVals[idx]
        )
      )
    );
  }
  return parser_1$1.psbtFromKeyVals(selfTx, {
    globalMapKeyVals: selfKeyVals.globalKeyVals,
    inputKeyVals: selfKeyVals.inputKeyVals,
    outputKeyVals: selfKeyVals.outputKeyVals,
  });
}
combiner.combine = combine;
function keyPusher(selfSet, selfKeyVals, otherKeyVals) {
  return (key) => {
    if (selfSet.has(key)) return;
    const newKv = otherKeyVals.filter(
      (kv) => kv.key.toString('hex') === key
    )[0];
    selfKeyVals.push(newKv);
    selfSet.add(key);
  };
}
function getTx(psbt) {
  return psbt.globalMap.unsignedTx;
}
function getKeySet(keyVals) {
  const set = new Set();
  keyVals.forEach((keyVal) => {
    const hex = keyVal.key.toString('hex');
    if (set.has(hex))
      throw new Error('Combine: KeyValue Map keys should be unique');
    set.add(hex);
  });
  return set;
}

var utils = {};

(function (exports) {
	const { Buffer } = buffer; // auto-inject!
	Object.defineProperty(exports, '__esModule', { value: true });
	const converter$1 = converter;
	function checkForInput(inputs, inputIndex) {
	  const input = inputs[inputIndex];
	  if (input === undefined) throw new Error(`No input #${inputIndex}`);
	  return input;
	}
	exports.checkForInput = checkForInput;
	function checkForOutput(outputs, outputIndex) {
	  const output = outputs[outputIndex];
	  if (output === undefined) throw new Error(`No output #${outputIndex}`);
	  return output;
	}
	exports.checkForOutput = checkForOutput;
	function checkHasKey(checkKeyVal, keyVals, enumLength) {
	  if (checkKeyVal.key[0] < enumLength) {
	    throw new Error(
	      `Use the method for your specific key instead of addUnknownKeyVal*`
	    );
	  }
	  if (
	    keyVals &&
	    keyVals.filter((kv) => kv.key.equals(checkKeyVal.key)).length !== 0
	  ) {
	    throw new Error(`Duplicate Key: ${checkKeyVal.key.toString('hex')}`);
	  }
	}
	exports.checkHasKey = checkHasKey;
	function getEnumLength(myenum) {
	  let count = 0;
	  Object.keys(myenum).forEach((val) => {
	    if (Number(isNaN(Number(val)))) {
	      count++;
	    }
	  });
	  return count;
	}
	exports.getEnumLength = getEnumLength;
	function inputCheckUncleanFinalized(inputIndex, input) {
	  let result = false;
	  if (input.nonWitnessUtxo || input.witnessUtxo) {
	    const needScriptSig = !!input.redeemScript;
	    const needWitnessScript = !!input.witnessScript;
	    const scriptSigOK = !needScriptSig || !!input.finalScriptSig;
	    const witnessScriptOK = !needWitnessScript || !!input.finalScriptWitness;
	    const hasOneFinal = !!input.finalScriptSig || !!input.finalScriptWitness;
	    result = scriptSigOK && witnessScriptOK && hasOneFinal;
	  }
	  if (result === false) {
	    throw new Error(
	      `Input #${inputIndex} has too much or too little data to clean`
	    );
	  }
	}
	exports.inputCheckUncleanFinalized = inputCheckUncleanFinalized;
	function throwForUpdateMaker(typeName, name, expected, data) {
	  throw new Error(
	    `Data for ${typeName} key ${name} is incorrect: Expected ` +
	      `${expected} and got ${JSON.stringify(data)}`
	  );
	}
	function updateMaker(typeName) {
	  return (updateData, mainData) => {
	    for (const name of Object.keys(updateData)) {
	      // @ts-ignore
	      const data = updateData[name];
	      // @ts-ignore
	      const { canAdd, canAddToArray, check, expected } =
	        // @ts-ignore
	        converter$1[typeName + 's'][name] || {};
	      const isArray = !!canAddToArray;
	      // If unknown data. ignore and do not add
	      if (check) {
	        if (isArray) {
	          if (
	            !Array.isArray(data) ||
	            // @ts-ignore
	            (mainData[name] && !Array.isArray(mainData[name]))
	          ) {
	            throw new Error(`Key type ${name} must be an array`);
	          }
	          if (!data.every(check)) {
	            throwForUpdateMaker(typeName, name, expected, data);
	          }
	          // @ts-ignore
	          const arr = mainData[name] || [];
	          const dupeCheckSet = new Set();
	          if (!data.every((v) => canAddToArray(arr, v, dupeCheckSet))) {
	            throw new Error('Can not add duplicate data to array');
	          }
	          // @ts-ignore
	          mainData[name] = arr.concat(data);
	        } else {
	          if (!check(data)) {
	            throwForUpdateMaker(typeName, name, expected, data);
	          }
	          if (!canAdd(mainData, data)) {
	            throw new Error(`Can not add duplicate data to ${typeName}`);
	          }
	          // @ts-ignore
	          mainData[name] = data;
	        }
	      }
	    }
	  };
	}
	exports.updateGlobal = updateMaker('global');
	exports.updateInput = updateMaker('input');
	exports.updateOutput = updateMaker('output');
	function addInputAttributes(inputs, data) {
	  const index = inputs.length - 1;
	  const input = checkForInput(inputs, index);
	  exports.updateInput(data, input);
	}
	exports.addInputAttributes = addInputAttributes;
	function addOutputAttributes(outputs, data) {
	  const index = outputs.length - 1;
	  const output = checkForOutput(outputs, index);
	  exports.updateOutput(data, output);
	}
	exports.addOutputAttributes = addOutputAttributes;
	function defaultVersionSetter(version, txBuf) {
	  if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) {
	    throw new Error('Set Version: Invalid Transaction');
	  }
	  txBuf.writeUInt32LE(version, 0);
	  return txBuf;
	}
	exports.defaultVersionSetter = defaultVersionSetter;
	function defaultLocktimeSetter(locktime, txBuf) {
	  if (!Buffer.isBuffer(txBuf) || txBuf.length < 4) {
	    throw new Error('Set Locktime: Invalid Transaction');
	  }
	  txBuf.writeUInt32LE(locktime, txBuf.length - 4);
	  return txBuf;
	}
	exports.defaultLocktimeSetter = defaultLocktimeSetter;
} (utils));

const { Buffer } = buffer; // auto-inject!
Object.defineProperty(psbt, '__esModule', { value: true });
const combiner_1 = combiner;
const parser_1 = parser;
const typeFields_1 = typeFields;
const utils_1 = utils;
let Psbt$1 = class Psbt {
  constructor(tx) {
    this.inputs = [];
    this.outputs = [];
    this.globalMap = {
      unsignedTx: tx,
    };
  }
  static fromBase64(data, txFromBuffer) {
    const buffer = Buffer.from(data, 'base64');
    return this.fromBuffer(buffer, txFromBuffer);
  }
  static fromHex(data, txFromBuffer) {
    const buffer = Buffer.from(data, 'hex');
    return this.fromBuffer(buffer, txFromBuffer);
  }
  static fromBuffer(buffer, txFromBuffer) {
    const results = parser_1.psbtFromBuffer(buffer, txFromBuffer);
    const psbt = new this(results.globalMap.unsignedTx);
    Object.assign(psbt, results);
    return psbt;
  }
  toBase64() {
    const buffer = this.toBuffer();
    return buffer.toString('base64');
  }
  toHex() {
    const buffer = this.toBuffer();
    return buffer.toString('hex');
  }
  toBuffer() {
    return parser_1.psbtToBuffer(this);
  }
  updateGlobal(updateData) {
    utils_1.updateGlobal(updateData, this.globalMap);
    return this;
  }
  updateInput(inputIndex, updateData) {
    const input = utils_1.checkForInput(this.inputs, inputIndex);
    utils_1.updateInput(updateData, input);
    return this;
  }
  updateOutput(outputIndex, updateData) {
    const output = utils_1.checkForOutput(this.outputs, outputIndex);
    utils_1.updateOutput(updateData, output);
    return this;
  }
  addUnknownKeyValToGlobal(keyVal) {
    utils_1.checkHasKey(
      keyVal,
      this.globalMap.unknownKeyVals,
      utils_1.getEnumLength(typeFields_1.GlobalTypes)
    );
    if (!this.globalMap.unknownKeyVals) this.globalMap.unknownKeyVals = [];
    this.globalMap.unknownKeyVals.push(keyVal);
    return this;
  }
  addUnknownKeyValToInput(inputIndex, keyVal) {
    const input = utils_1.checkForInput(this.inputs, inputIndex);
    utils_1.checkHasKey(
      keyVal,
      input.unknownKeyVals,
      utils_1.getEnumLength(typeFields_1.InputTypes)
    );
    if (!input.unknownKeyVals) input.unknownKeyVals = [];
    input.unknownKeyVals.push(keyVal);
    return this;
  }
  addUnknownKeyValToOutput(outputIndex, keyVal) {
    const output = utils_1.checkForOutput(this.outputs, outputIndex);
    utils_1.checkHasKey(
      keyVal,
      output.unknownKeyVals,
      utils_1.getEnumLength(typeFields_1.OutputTypes)
    );
    if (!output.unknownKeyVals) output.unknownKeyVals = [];
    output.unknownKeyVals.push(keyVal);
    return this;
  }
  addInput(inputData) {
    this.globalMap.unsignedTx.addInput(inputData);
    this.inputs.push({
      unknownKeyVals: [],
    });
    const addKeyVals = inputData.unknownKeyVals || [];
    const inputIndex = this.inputs.length - 1;
    if (!Array.isArray(addKeyVals)) {
      throw new Error('unknownKeyVals must be an Array');
    }
    addKeyVals.forEach((keyVal) =>
      this.addUnknownKeyValToInput(inputIndex, keyVal)
    );
    utils_1.addInputAttributes(this.inputs, inputData);
    return this;
  }
  addOutput(outputData) {
    this.globalMap.unsignedTx.addOutput(outputData);
    this.outputs.push({
      unknownKeyVals: [],
    });
    const addKeyVals = outputData.unknownKeyVals || [];
    const outputIndex = this.outputs.length - 1;
    if (!Array.isArray(addKeyVals)) {
      throw new Error('unknownKeyVals must be an Array');
    }
    addKeyVals.forEach((keyVal) =>
      this.addUnknownKeyValToInput(outputIndex, keyVal)
    );
    utils_1.addOutputAttributes(this.outputs, outputData);
    return this;
  }
  clearFinalizedInput(inputIndex) {
    const input = utils_1.checkForInput(this.inputs, inputIndex);
    utils_1.inputCheckUncleanFinalized(inputIndex, input);
    for (const key of Object.keys(input)) {
      if (
        ![
          'witnessUtxo',
          'nonWitnessUtxo',
          'finalScriptSig',
          'finalScriptWitness',
          'unknownKeyVals',
        ].includes(key)
      ) {
        // @ts-ignore
        delete input[key];
      }
    }
    return this;
  }
  combine(...those) {
    // Combine this with those.
    // Return self for chaining.
    const result = combiner_1.combine([this].concat(those));
    Object.assign(this, result);
    return this;
  }
  getTransaction() {
    return this.globalMap.unsignedTx.toBuffer();
  }
};
psbt.Psbt = Psbt$1;

(function (module) {
	module.exports = psbt;
} (bip174));

const converter_varint = varint;

const { typeforce } = types;
function varSliceSize(someScript) {
    const length = someScript.length;
    return varuintBitcoin.encodingLength(length) + length;
}
function vectorSize(someVector) {
    const length = someVector.length;
    return (varuintBitcoin.encodingLength(length) +
        someVector.reduce((sum, witness) => {
            return sum + varSliceSize(witness);
        }, 0));
}
const EMPTY_BUFFER = Buffer$o.allocUnsafe(0);
const EMPTY_WITNESS = [];
const ZERO = Buffer$o.from('0000000000000000000000000000000000000000000000000000000000000000', 'hex');
const ONE = Buffer$o.from('0000000000000000000000000000000000000000000000000000000000000001', 'hex');
const VALUE_UINT64_MAX = Buffer$o.from('ffffffffffffffff', 'hex');
const BLANK_OUTPUT = {
    script: EMPTY_BUFFER,
    valueBuffer: VALUE_UINT64_MAX,
};
function isOutput(out) {
    return out.value !== undefined;
}
class Transaction {
    constructor() {
        this.version = 1;
        this.locktime = 0;
        this.ins = [];
        this.outs = [];
    }
    static fromBuffer(buffer, _NO_STRICT) {
        const bufferReader = new BufferReader(buffer);
        const tx = new Transaction();
        tx.version = bufferReader.readInt32();
        const marker = bufferReader.readUInt8();
        const flag = bufferReader.readUInt8();
        let hasWitnesses = false;
        if (marker === Transaction.ADVANCED_TRANSACTION_MARKER &&
            flag === Transaction.ADVANCED_TRANSACTION_FLAG) {
            hasWitnesses = true;
        }
        else {
            bufferReader.offset -= 2;
        }
        const vinLen = bufferReader.readVarInt();
        for (let i = 0; i < vinLen; ++i) {
            tx.ins.push({
                hash: bufferReader.readSlice(32),
                index: bufferReader.readUInt32(),
                script: bufferReader.readVarSlice(),
                sequence: bufferReader.readUInt32(),
                witness: EMPTY_WITNESS,
            });
        }
        const voutLen = bufferReader.readVarInt();
        for (let i = 0; i < voutLen; ++i) {
            tx.outs.push({
                value: bufferReader.readUInt64(),
                script: bufferReader.readVarSlice(),
            });
        }
        if (hasWitnesses) {
            for (let i = 0; i < vinLen; ++i) {
                tx.ins[i].witness = bufferReader.readVector();
            }
            // was this pointless?
            if (!tx.hasWitnesses())
                throw new Error('Transaction has superfluous witness data');
        }
        tx.locktime = bufferReader.readUInt32();
        if (_NO_STRICT)
            return tx;
        if (bufferReader.offset !== buffer.length)
            throw new Error('Transaction has unexpected data');
        return tx;
    }
    static fromHex(hex) {
        return Transaction.fromBuffer(Buffer$o.from(hex, 'hex'), false);
    }
    static isCoinbaseHash(buffer) {
        typeforce(Hash256bit, buffer);
        for (let i = 0; i < 32; ++i) {
            if (buffer[i] !== 0)
                return false;
        }
        return true;
    }
    isCoinbase() {
        return (this.ins.length === 1 && Transaction.isCoinbaseHash(this.ins[0].hash));
    }
    addInput(hash, index, sequence, scriptSig) {
        typeforce(tuple(Hash256bit, UInt32, maybe(UInt32), maybe(Buffer$p)), arguments);
        if (Null(sequence)) {
            sequence = Transaction.DEFAULT_SEQUENCE;
        }
        // Add the input and return the input's index
        return (this.ins.push({
            hash,
            index,
            script: scriptSig || EMPTY_BUFFER,
            sequence: sequence,
            witness: EMPTY_WITNESS,
        }) - 1);
    }
    addOutput(scriptPubKey, value) {
        typeforce(tuple(Buffer$p, Satoshi), arguments);
        // Add the output and return the output's index
        return (this.outs.push({
            script: scriptPubKey,
            value,
        }) - 1);
    }
    hasWitnesses() {
        return this.ins.some((x) => {
            return x.witness.length !== 0;
        });
    }
    weight() {
        const base = this.byteLength(false);
        const total = this.byteLength(true);
        return base * 3 + total;
    }
    virtualSize() {
        return Math.ceil(this.weight() / 4);
    }
    byteLength(_ALLOW_WITNESS = true) {
        const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
        return ((hasWitnesses ? 10 : 8) +
            varuintBitcoin.encodingLength(this.ins.length) +
            varuintBitcoin.encodingLength(this.outs.length) +
            this.ins.reduce((sum, input) => {
                return sum + 40 + varSliceSize(input.script);
            }, 0) +
            this.outs.reduce((sum, output) => {
                return sum + 8 + varSliceSize(output.script);
            }, 0) +
            (hasWitnesses
                ? this.ins.reduce((sum, input) => {
                    return sum + vectorSize(input.witness);
                }, 0)
                : 0));
    }
    clone() {
        const newTx = new Transaction();
        newTx.version = this.version;
        newTx.locktime = this.locktime;
        newTx.ins = this.ins.map((txIn) => {
            return {
                hash: txIn.hash,
                index: txIn.index,
                script: txIn.script,
                sequence: txIn.sequence,
                witness: txIn.witness,
            };
        });
        newTx.outs = this.outs.map((txOut) => {
            return {
                script: txOut.script,
                value: txOut.value,
            };
        });
        return newTx;
    }
    /**
     * Hash transaction for signing a specific input.
     *
     * Bitcoin uses a different hash for each signed transaction input.
     * This method copies the transaction, makes the necessary changes based on the
     * hashType, and then hashes the result.
     * This hash can then be used to sign the provided transaction input.
     */
    hashForSignature(inIndex, prevOutScript, hashType) {
        typeforce(tuple(UInt32, Buffer$p, /* types.UInt8 */ Number$1), arguments);
        // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L29
        if (inIndex >= this.ins.length)
            return ONE;
        // ignore OP_CODESEPARATOR
        const ourScript = compile(decompile(prevOutScript).filter((x) => {
            return x !== OPS.OP_CODESEPARATOR;
        }));
        const txTmp = this.clone();
        // SIGHASH_NONE: ignore all outputs? (wildcard payee)
        if ((hashType & 0x1f) === Transaction.SIGHASH_NONE) {
            txTmp.outs = [];
            // ignore sequence numbers (except at inIndex)
            txTmp.ins.forEach((input, i) => {
                if (i === inIndex)
                    return;
                input.sequence = 0;
            });
            // SIGHASH_SINGLE: ignore all outputs, except at the same index?
        }
        else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE) {
            // https://github.com/bitcoin/bitcoin/blob/master/src/test/sighash_tests.cpp#L60
            if (inIndex >= this.outs.length)
                return ONE;
            // truncate outputs after
            txTmp.outs.length = inIndex + 1;
            // "blank" outputs before
            for (let i = 0; i < inIndex; i++) {
                txTmp.outs[i] = BLANK_OUTPUT;
            }
            // ignore sequence numbers (except at inIndex)
            txTmp.ins.forEach((input, y) => {
                if (y === inIndex)
                    return;
                input.sequence = 0;
            });
        }
        // SIGHASH_ANYONECANPAY: ignore inputs entirely?
        if (hashType & Transaction.SIGHASH_ANYONECANPAY) {
            txTmp.ins = [txTmp.ins[inIndex]];
            txTmp.ins[0].script = ourScript;
            // SIGHASH_ALL: only ignore input scripts
        }
        else {
            // "blank" others input scripts
            txTmp.ins.forEach((input) => {
                input.script = EMPTY_BUFFER;
            });
            txTmp.ins[inIndex].script = ourScript;
        }
        // serialize and hash
        const buffer = Buffer$o.allocUnsafe(txTmp.byteLength(false) + 4);
        buffer.writeInt32LE(hashType, buffer.length - 4);
        txTmp.__toBuffer(buffer, 0, false);
        return hash256(buffer);
    }
    hashForWitnessV1(inIndex, prevOutScripts, values, hashType, leafHash, annex) {
        // https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#common-signature-message
        typeforce(tuple(UInt32, typeforce.arrayOf(Buffer$p), typeforce.arrayOf(Satoshi), UInt32), arguments);
        if (values.length !== this.ins.length ||
            prevOutScripts.length !== this.ins.length) {
            throw new Error('Must supply prevout script and value for all inputs');
        }
        const outputType = hashType === Transaction.SIGHASH_DEFAULT
            ? Transaction.SIGHASH_ALL
            : hashType & Transaction.SIGHASH_OUTPUT_MASK;
        const inputType = hashType & Transaction.SIGHASH_INPUT_MASK;
        const isAnyoneCanPay = inputType === Transaction.SIGHASH_ANYONECANPAY;
        const isNone = outputType === Transaction.SIGHASH_NONE;
        const isSingle = outputType === Transaction.SIGHASH_SINGLE;
        let hashPrevouts = EMPTY_BUFFER;
        let hashAmounts = EMPTY_BUFFER;
        let hashScriptPubKeys = EMPTY_BUFFER;
        let hashSequences = EMPTY_BUFFER;
        let hashOutputs = EMPTY_BUFFER;
        if (!isAnyoneCanPay) {
            let bufferWriter = BufferWriter.withCapacity(36 * this.ins.length);
            this.ins.forEach((txIn) => {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = sha256(bufferWriter.end());
            bufferWriter = BufferWriter.withCapacity(8 * this.ins.length);
            values.forEach((value) => bufferWriter.writeUInt64(value));
            hashAmounts = sha256(bufferWriter.end());
            bufferWriter = BufferWriter.withCapacity(prevOutScripts.map(varSliceSize).reduce((a, b) => a + b));
            prevOutScripts.forEach((prevOutScript) => bufferWriter.writeVarSlice(prevOutScript));
            hashScriptPubKeys = sha256(bufferWriter.end());
            bufferWriter = BufferWriter.withCapacity(4 * this.ins.length);
            this.ins.forEach((txIn) => bufferWriter.writeUInt32(txIn.sequence));
            hashSequences = sha256(bufferWriter.end());
        }
        if (!(isNone || isSingle)) {
            const txOutsSize = this.outs
                .map((output) => 8 + varSliceSize(output.script))
                .reduce((a, b) => a + b);
            const bufferWriter = BufferWriter.withCapacity(txOutsSize);
            this.outs.forEach((out) => {
                bufferWriter.writeUInt64(out.value);
                bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = sha256(bufferWriter.end());
        }
        else if (isSingle && inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            const bufferWriter = BufferWriter.withCapacity(8 + varSliceSize(output.script));
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = sha256(bufferWriter.end());
        }
        const spendType = (leafHash ? 2 : 0) + (annex ? 1 : 0);
        // Length calculation from:
        // https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#cite_note-14
        // With extension from:
        // https://github.com/bitcoin/bips/blob/master/bip-0342.mediawiki#signature-validation
        const sigMsgSize = 174 -
            (isAnyoneCanPay ? 49 : 0) -
            (isNone ? 32 : 0) +
            (annex ? 32 : 0) +
            (leafHash ? 37 : 0);
        const sigMsgWriter = BufferWriter.withCapacity(sigMsgSize);
        sigMsgWriter.writeUInt8(hashType);
        // Transaction
        sigMsgWriter.writeInt32(this.version);
        sigMsgWriter.writeUInt32(this.locktime);
        sigMsgWriter.writeSlice(hashPrevouts);
        sigMsgWriter.writeSlice(hashAmounts);
        sigMsgWriter.writeSlice(hashScriptPubKeys);
        sigMsgWriter.writeSlice(hashSequences);
        if (!(isNone || isSingle)) {
            sigMsgWriter.writeSlice(hashOutputs);
        }
        // Input
        sigMsgWriter.writeUInt8(spendType);
        if (isAnyoneCanPay) {
            const input = this.ins[inIndex];
            sigMsgWriter.writeSlice(input.hash);
            sigMsgWriter.writeUInt32(input.index);
            sigMsgWriter.writeUInt64(values[inIndex]);
            sigMsgWriter.writeVarSlice(prevOutScripts[inIndex]);
            sigMsgWriter.writeUInt32(input.sequence);
        }
        else {
            sigMsgWriter.writeUInt32(inIndex);
        }
        if (annex) {
            const bufferWriter = BufferWriter.withCapacity(varSliceSize(annex));
            bufferWriter.writeVarSlice(annex);
            sigMsgWriter.writeSlice(sha256(bufferWriter.end()));
        }
        // Output
        if (isSingle) {
            sigMsgWriter.writeSlice(hashOutputs);
        }
        // BIP342 extension
        if (leafHash) {
            sigMsgWriter.writeSlice(leafHash);
            sigMsgWriter.writeUInt8(0);
            sigMsgWriter.writeUInt32(0xffffffff);
        }
        // Extra zero byte because:
        // https://github.com/bitcoin/bips/blob/master/bip-0341.mediawiki#cite_note-19
        return taggedHash('TapSighash', Buffer$o.concat([Buffer$o.of(0x00), sigMsgWriter.end()]));
    }
    hashForWitnessV0(inIndex, prevOutScript, value, hashType) {
        typeforce(tuple(UInt32, Buffer$p, Satoshi, UInt32), arguments);
        let tbuffer = Buffer$o.from([]);
        let bufferWriter;
        let hashOutputs = ZERO;
        let hashPrevouts = ZERO;
        let hashSequence = ZERO;
        if (!(hashType & Transaction.SIGHASH_ANYONECANPAY)) {
            tbuffer = Buffer$o.allocUnsafe(36 * this.ins.length);
            bufferWriter = new BufferWriter(tbuffer, 0);
            this.ins.forEach((txIn) => {
                bufferWriter.writeSlice(txIn.hash);
                bufferWriter.writeUInt32(txIn.index);
            });
            hashPrevouts = hash256(tbuffer);
        }
        if (!(hashType & Transaction.SIGHASH_ANYONECANPAY) &&
            (hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
            tbuffer = Buffer$o.allocUnsafe(4 * this.ins.length);
            bufferWriter = new BufferWriter(tbuffer, 0);
            this.ins.forEach((txIn) => {
                bufferWriter.writeUInt32(txIn.sequence);
            });
            hashSequence = hash256(tbuffer);
        }
        if ((hashType & 0x1f) !== Transaction.SIGHASH_SINGLE &&
            (hashType & 0x1f) !== Transaction.SIGHASH_NONE) {
            const txOutsSize = this.outs.reduce((sum, output) => {
                return sum + 8 + varSliceSize(output.script);
            }, 0);
            tbuffer = Buffer$o.allocUnsafe(txOutsSize);
            bufferWriter = new BufferWriter(tbuffer, 0);
            this.outs.forEach((out) => {
                bufferWriter.writeUInt64(out.value);
                bufferWriter.writeVarSlice(out.script);
            });
            hashOutputs = hash256(tbuffer);
        }
        else if ((hashType & 0x1f) === Transaction.SIGHASH_SINGLE &&
            inIndex < this.outs.length) {
            const output = this.outs[inIndex];
            tbuffer = Buffer$o.allocUnsafe(8 + varSliceSize(output.script));
            bufferWriter = new BufferWriter(tbuffer, 0);
            bufferWriter.writeUInt64(output.value);
            bufferWriter.writeVarSlice(output.script);
            hashOutputs = hash256(tbuffer);
        }
        tbuffer = Buffer$o.allocUnsafe(156 + varSliceSize(prevOutScript));
        bufferWriter = new BufferWriter(tbuffer, 0);
        const input = this.ins[inIndex];
        bufferWriter.writeInt32(this.version);
        bufferWriter.writeSlice(hashPrevouts);
        bufferWriter.writeSlice(hashSequence);
        bufferWriter.writeSlice(input.hash);
        bufferWriter.writeUInt32(input.index);
        bufferWriter.writeVarSlice(prevOutScript);
        bufferWriter.writeUInt64(value);
        bufferWriter.writeUInt32(input.sequence);
        bufferWriter.writeSlice(hashOutputs);
        bufferWriter.writeUInt32(this.locktime);
        bufferWriter.writeUInt32(hashType);
        return hash256(tbuffer);
    }
    getHash(forWitness) {
        // wtxid for coinbase is always 32 bytes of 0x00
        if (forWitness && this.isCoinbase())
            return Buffer$o.alloc(32, 0);
        return hash256(this.__toBuffer(undefined, undefined, forWitness));
    }
    getId() {
        // transaction hash's are displayed in reverse order
        return reverseBuffer$1(this.getHash(false)).toString('hex');
    }
    toBuffer(buffer, initialOffset) {
        return this.__toBuffer(buffer, initialOffset, true);
    }
    toHex() {
        return this.toBuffer(undefined, undefined).toString('hex');
    }
    setInputScript(index, scriptSig) {
        typeforce(tuple(Number$1, Buffer$p), arguments);
        this.ins[index].script = scriptSig;
    }
    setWitness(index, witness) {
        typeforce(tuple(Number$1, [Buffer$p]), arguments);
        this.ins[index].witness = witness;
    }
    __toBuffer(buffer, initialOffset, _ALLOW_WITNESS = false) {
        if (!buffer)
            buffer = Buffer$o.allocUnsafe(this.byteLength(_ALLOW_WITNESS));
        const bufferWriter = new BufferWriter(buffer, initialOffset || 0);
        bufferWriter.writeInt32(this.version);
        const hasWitnesses = _ALLOW_WITNESS && this.hasWitnesses();
        if (hasWitnesses) {
            bufferWriter.writeUInt8(Transaction.ADVANCED_TRANSACTION_MARKER);
            bufferWriter.writeUInt8(Transaction.ADVANCED_TRANSACTION_FLAG);
        }
        bufferWriter.writeVarInt(this.ins.length);
        this.ins.forEach((txIn) => {
            bufferWriter.writeSlice(txIn.hash);
            bufferWriter.writeUInt32(txIn.index);
            bufferWriter.writeVarSlice(txIn.script);
            bufferWriter.writeUInt32(txIn.sequence);
        });
        bufferWriter.writeVarInt(this.outs.length);
        this.outs.forEach((txOut) => {
            if (isOutput(txOut)) {
                bufferWriter.writeUInt64(txOut.value);
            }
            else {
                bufferWriter.writeSlice(txOut.valueBuffer);
            }
            bufferWriter.writeVarSlice(txOut.script);
        });
        if (hasWitnesses) {
            this.ins.forEach((input) => {
                bufferWriter.writeVector(input.witness);
            });
        }
        bufferWriter.writeUInt32(this.locktime);
        // avoid slicing unless necessary
        if (initialOffset !== undefined)
            return buffer.slice(initialOffset, bufferWriter.offset);
        return buffer;
    }
}
Transaction.DEFAULT_SEQUENCE = 0xffffffff;
Transaction.SIGHASH_DEFAULT = 0x00;
Transaction.SIGHASH_ALL = 0x01;
Transaction.SIGHASH_NONE = 0x02;
Transaction.SIGHASH_SINGLE = 0x03;
Transaction.SIGHASH_ANYONECANPAY = 0x80;
Transaction.SIGHASH_OUTPUT_MASK = 0x03;
Transaction.SIGHASH_INPUT_MASK = 0x80;
Transaction.ADVANCED_TRANSACTION_MARKER = 0x00;
Transaction.ADVANCED_TRANSACTION_FLAG = 0x01;

/**
 * These are the default arguments for a Psbt instance.
 */
const DEFAULT_OPTS = {
    /**
     * A bitcoinjs Network object. This is only used if you pass an `address`
     * parameter to addOutput. Otherwise it is not needed and can be left default.
     */
    network: bitcoin,
    /**
     * When extractTransaction is called, the fee rate is checked.
     * THIS IS NOT TO BE RELIED ON.
     * It is only here as a last ditch effort to prevent sending a 500 BTC fee etc.
     */
    maximumFeeRate: 5000, // satoshi per byte
};
/**
 * Psbt class can parse and generate a PSBT binary based off of the BIP174.
 * There are 6 roles that this class fulfills. (Explained in BIP174)
 *
 * Creator: This can be done with `new Psbt()`
 * Updater: This can be done with `psbt.addInput(input)`, `psbt.addInputs(inputs)`,
 *   `psbt.addOutput(output)`, `psbt.addOutputs(outputs)` when you are looking to
 *   add new inputs and outputs to the PSBT, and `psbt.updateGlobal(itemObject)`,
 *   `psbt.updateInput(itemObject)`, `psbt.updateOutput(itemObject)`
 *   addInput requires hash: Buffer | string; and index: number; as attributes
 *   and can also include any attributes that are used in updateInput method.
 *   addOutput requires script: Buffer; and value: number; and likewise can include
 *   data for updateOutput.
 *   For a list of what attributes should be what types. Check the bip174 library.
 *   Also, check the integration tests for some examples of usage.
 * Signer: There are a few methods. signAllInputs and signAllInputsAsync, which will search all input
 *   information for your pubkey or pubkeyhash, and only sign inputs where it finds
 *   your info. Or you can explicitly sign a specific input with signInput and
 *   signInputAsync. For the async methods you can create a SignerAsync object
 *   and use something like a hardware wallet to sign with. (You must implement this)
 * Combiner: psbts can be combined easily with `psbt.combine(psbt2, psbt3, psbt4 ...)`
 *   the psbt calling combine will always have precedence when a conflict occurs.
 *   Combine checks if the internal bitcoin transaction is the same, so be sure that
 *   all sequences, version, locktime, etc. are the same before combining.
 * Input Finalizer: This role is fairly important. Not only does it need to construct
 *   the input scriptSigs and witnesses, but it SHOULD verify the signatures etc.
 *   Before running `psbt.finalizeAllInputs()` please run `psbt.validateSignaturesOfAllInputs()`
 *   Running any finalize method will delete any data in the input(s) that are no longer
 *   needed due to the finalized scripts containing the information.
 * Transaction Extractor: This role will perform some checks before returning a
 *   Transaction object. Such as fee rate not being larger than maximumFeeRate etc.
 */
class Psbt {
    static fromBase64(data, opts = {}) {
        const buffer = Buffer$o.from(data, 'base64');
        return this.fromBuffer(buffer, opts);
    }
    static fromHex(data, opts = {}) {
        const buffer = Buffer$o.from(data, 'hex');
        return this.fromBuffer(buffer, opts);
    }
    static fromBuffer(buffer, opts = {}) {
        const psbtBase = bip174Exports.Psbt.fromBuffer(buffer, transactionFromBuffer);
        const psbt = new Psbt(opts, psbtBase);
        checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE);
        return psbt;
    }
    constructor(opts = {}, data = new bip174Exports.Psbt(new PsbtTransaction())) {
        this.data = data;
        // set defaults
        this.opts = Object.assign({}, DEFAULT_OPTS, opts);
        this.__CACHE = {
            __NON_WITNESS_UTXO_TX_CACHE: [],
            __NON_WITNESS_UTXO_BUF_CACHE: [],
            __TX_IN_CACHE: {},
            __TX: this.data.globalMap.unsignedTx.tx,
            // Psbt's predecesor (TransactionBuilder - now removed) behavior
            // was to not confirm input values  before signing.
            // Even though we highly encourage people to get
            // the full parent transaction to verify values, the ability to
            // sign non-segwit inputs without the full transaction was often
            // requested. So the only way to activate is to use @ts-ignore.
            // We will disable exporting the Psbt when unsafe sign is active.
            // because it is not BIP174 compliant.
            __UNSAFE_SIGN_NONSEGWIT: false,
        };
        if (this.data.inputs.length === 0)
            this.setVersion(2);
        // Make data hidden when enumerating
        const dpew = (obj, attr, enumerable, writable) => Object.defineProperty(obj, attr, {
            enumerable,
            writable,
        });
        dpew(this, '__CACHE', false, true);
        dpew(this, 'opts', false, true);
    }
    get inputCount() {
        return this.data.inputs.length;
    }
    get version() {
        return this.__CACHE.__TX.version;
    }
    set version(version) {
        this.setVersion(version);
    }
    get locktime() {
        return this.__CACHE.__TX.locktime;
    }
    set locktime(locktime) {
        this.setLocktime(locktime);
    }
    get txInputs() {
        return this.__CACHE.__TX.ins.map((input) => ({
            hash: cloneBuffer(input.hash),
            index: input.index,
            sequence: input.sequence,
        }));
    }
    get txOutputs() {
        return this.__CACHE.__TX.outs.map((output) => {
            let address;
            try {
                address = fromOutputScript(output.script, this.opts.network);
            }
            catch (_) { }
            return {
                script: cloneBuffer(output.script),
                value: output.value,
                address,
            };
        });
    }
    combine(...those) {
        this.data.combine(...those.map((o) => o.data));
        return this;
    }
    clone() {
        // TODO: more efficient cloning
        const res = Psbt.fromBuffer(this.data.toBuffer());
        res.opts = JSON.parse(JSON.stringify(this.opts));
        return res;
    }
    setMaximumFeeRate(satoshiPerByte) {
        check32Bit(satoshiPerByte); // 42.9 BTC per byte IS excessive... so throw
        this.opts.maximumFeeRate = satoshiPerByte;
    }
    setVersion(version) {
        check32Bit(version);
        checkInputsForPartialSig(this.data.inputs, 'setVersion');
        const c = this.__CACHE;
        c.__TX.version = version;
        c.__EXTRACTED_TX = undefined;
        return this;
    }
    setLocktime(locktime) {
        check32Bit(locktime);
        checkInputsForPartialSig(this.data.inputs, 'setLocktime');
        const c = this.__CACHE;
        c.__TX.locktime = locktime;
        c.__EXTRACTED_TX = undefined;
        return this;
    }
    setInputSequence(inputIndex, sequence) {
        check32Bit(sequence);
        checkInputsForPartialSig(this.data.inputs, 'setInputSequence');
        const c = this.__CACHE;
        if (c.__TX.ins.length <= inputIndex) {
            throw new Error('Input index too high');
        }
        c.__TX.ins[inputIndex].sequence = sequence;
        c.__EXTRACTED_TX = undefined;
        return this;
    }
    addInputs(inputDatas) {
        inputDatas.forEach((inputData) => this.addInput(inputData));
        return this;
    }
    addInput(inputData) {
        if (arguments.length > 1 ||
            !inputData ||
            inputData.hash === undefined ||
            inputData.index === undefined) {
            throw new Error(`Invalid arguments for Psbt.addInput. ` +
                `Requires single object with at least [hash] and [index]`);
        }
        checkInputsForPartialSig(this.data.inputs, 'addInput');
        if (inputData.witnessScript)
            checkInvalidP2WSH(inputData.witnessScript);
        const c = this.__CACHE;
        this.data.addInput(inputData);
        const txIn = c.__TX.ins[c.__TX.ins.length - 1];
        checkTxInputCache(c, txIn);
        const inputIndex = this.data.inputs.length - 1;
        const input = this.data.inputs[inputIndex];
        if (input.nonWitnessUtxo) {
            addNonWitnessTxCache(this.__CACHE, input, inputIndex);
        }
        c.__FEE = undefined;
        c.__FEE_RATE = undefined;
        c.__EXTRACTED_TX = undefined;
        return this;
    }
    addOutputs(outputDatas) {
        outputDatas.forEach((outputData) => this.addOutput(outputData));
        return this;
    }
    addOutput(outputData) {
        if (arguments.length > 1 ||
            !outputData ||
            outputData.value === undefined ||
            (outputData.address === undefined &&
                outputData.script === undefined)) {
            throw new Error(`Invalid arguments for Psbt.addOutput. ` +
                `Requires single object with at least [script or address] and [value]`);
        }
        checkInputsForPartialSig(this.data.inputs, 'addOutput');
        const { address } = outputData;
        if (typeof address === 'string') {
            const { network } = this.opts;
            const script = toOutputScript(address, network);
            outputData = Object.assign(outputData, { script });
        }
        const c = this.__CACHE;
        this.data.addOutput(outputData);
        c.__FEE = undefined;
        c.__FEE_RATE = undefined;
        c.__EXTRACTED_TX = undefined;
        return this;
    }
    extractTransaction(disableFeeCheck) {
        if (!this.data.inputs.every(isFinalized))
            throw new Error('Not finalized');
        const c = this.__CACHE;
        if (!disableFeeCheck) {
            checkFees(this, c, this.opts);
        }
        if (c.__EXTRACTED_TX)
            return c.__EXTRACTED_TX;
        const tx = c.__TX.clone();
        inputFinalizeGetAmts(this.data.inputs, tx, c, true);
        return tx;
    }
    getFeeRate() {
        return getTxCacheValue('__FEE_RATE', 'fee rate', this.data.inputs, this.__CACHE);
    }
    getFee() {
        return getTxCacheValue('__FEE', 'fee', this.data.inputs, this.__CACHE);
    }
    finalizeAllInputs() {
        utils.checkForInput(this.data.inputs, 0); // making sure we have at least one
        range(this.data.inputs.length).forEach((idx) => this.finalizeInput(idx));
        return this;
    }
    finalizeInput(inputIndex, finalScriptsFunc = getFinalScripts) {
        const input = utils.checkForInput(this.data.inputs, inputIndex);
        const { script, isP2SH, isP2WSH, isSegwit } = getScriptFromInput(inputIndex, input, this.__CACHE);
        if (!script)
            throw new Error(`No script found for input #${inputIndex}`);
        checkPartialSigSighashes(input);
        const { finalScriptSig, finalScriptWitness } = finalScriptsFunc(inputIndex, input, script, isSegwit, isP2SH, isP2WSH);
        if (finalScriptSig)
            this.data.updateInput(inputIndex, { finalScriptSig });
        if (finalScriptWitness)
            this.data.updateInput(inputIndex, { finalScriptWitness });
        if (!finalScriptSig && !finalScriptWitness)
            throw new Error(`Unknown error finalizing input #${inputIndex}`);
        this.data.clearFinalizedInput(inputIndex);
        return this;
    }
    getInputType(inputIndex) {
        const input = utils.checkForInput(this.data.inputs, inputIndex);
        const script = getScriptFromUtxo(inputIndex, input, this.__CACHE);
        const result = getMeaningfulScript(script, inputIndex, 'input', input.redeemScript || redeemFromFinalScriptSig(input.finalScriptSig), input.witnessScript ||
            redeemFromFinalWitnessScript(input.finalScriptWitness));
        const type = result.type === 'raw' ? '' : result.type + '-';
        const mainType = classifyScript(result.meaningfulScript);
        return (type + mainType);
    }
    inputHasPubkey(inputIndex, pubkey) {
        const input = utils.checkForInput(this.data.inputs, inputIndex);
        return pubkeyInInput(pubkey, input, inputIndex, this.__CACHE);
    }
    inputHasHDKey(inputIndex, root) {
        const input = utils.checkForInput(this.data.inputs, inputIndex);
        const derivationIsMine = bip32DerivationIsMine(root);
        return (!!input.bip32Derivation && input.bip32Derivation.some(derivationIsMine));
    }
    outputHasPubkey(outputIndex, pubkey) {
        const output = utils.checkForOutput(this.data.outputs, outputIndex);
        return pubkeyInOutput(pubkey, output, outputIndex, this.__CACHE);
    }
    outputHasHDKey(outputIndex, root) {
        const output = utils.checkForOutput(this.data.outputs, outputIndex);
        const derivationIsMine = bip32DerivationIsMine(root);
        return (!!output.bip32Derivation && output.bip32Derivation.some(derivationIsMine));
    }
    validateSignaturesOfAllInputs(validator) {
        utils.checkForInput(this.data.inputs, 0); // making sure we have at least one
        const results = range(this.data.inputs.length).map((idx) => this.validateSignaturesOfInput(idx, validator));
        return results.reduce((final, res) => res === true && final, true);
    }
    validateSignaturesOfInput(inputIndex, validator, pubkey) {
        const input = this.data.inputs[inputIndex];
        const partialSig = (input || {}).partialSig;
        if (!input || !partialSig || partialSig.length < 1)
            throw new Error('No signatures to validate');
        if (typeof validator !== 'function')
            throw new Error('Need validator function to validate signatures');
        const mySigs = pubkey
            ? partialSig.filter((sig) => sig.pubkey.equals(pubkey))
            : partialSig;
        if (mySigs.length < 1)
            throw new Error('No signatures for this pubkey');
        const results = [];
        let hashCache;
        let scriptCache;
        let sighashCache;
        for (const pSig of mySigs) {
            const sig = signature.decode(pSig.signature);
            const { hash, script } = sighashCache !== sig.hashType
                ? getHashForSig(inputIndex, Object.assign({}, input, { sighashType: sig.hashType }), this.__CACHE, true)
                : { hash: hashCache, script: scriptCache };
            sighashCache = sig.hashType;
            hashCache = hash;
            scriptCache = script;
            checkScriptForPubkey(pSig.pubkey, script, 'verify');
            results.push(validator(pSig.pubkey, hash, sig.signature));
        }
        return results.every((res) => res === true);
    }
    signAllInputsHD(hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
            throw new Error('Need HDSigner to sign input');
        }
        const results = [];
        for (const i of range(this.data.inputs.length)) {
            try {
                this.signInputHD(i, hdKeyPair, sighashTypes);
                results.push(true);
            }
            catch (err) {
                results.push(false);
            }
        }
        if (results.every((v) => v === false)) {
            throw new Error('No inputs were signed');
        }
        return this;
    }
    signAllInputsHDAsync(hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        return new Promise((resolve, reject) => {
            if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
                return reject(new Error('Need HDSigner to sign input'));
            }
            const results = [];
            const promises = [];
            for (const i of range(this.data.inputs.length)) {
                promises.push(this.signInputHDAsync(i, hdKeyPair, sighashTypes).then(() => {
                    results.push(true);
                }, () => {
                    results.push(false);
                }));
            }
            return Promise.all(promises).then(() => {
                if (results.every((v) => v === false)) {
                    return reject(new Error('No inputs were signed'));
                }
                resolve();
            });
        });
    }
    signInputHD(inputIndex, hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
            throw new Error('Need HDSigner to sign input');
        }
        const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
        signers.forEach((signer) => this.signInput(inputIndex, signer, sighashTypes));
        return this;
    }
    signInputHDAsync(inputIndex, hdKeyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        return new Promise((resolve, reject) => {
            if (!hdKeyPair || !hdKeyPair.publicKey || !hdKeyPair.fingerprint) {
                return reject(new Error('Need HDSigner to sign input'));
            }
            const signers = getSignersFromHD(inputIndex, this.data.inputs, hdKeyPair);
            const promises = signers.map((signer) => this.signInputAsync(inputIndex, signer, sighashTypes));
            return Promise.all(promises)
                .then(() => {
                resolve();
            })
                .catch(reject);
        });
    }
    signAllInputs(keyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        if (!keyPair || !keyPair.publicKey)
            throw new Error('Need Signer to sign input');
        // TODO: Add a pubkey/pubkeyhash cache to each input
        // as input information is added, then eventually
        // optimize this method.
        const results = [];
        for (const i of range(this.data.inputs.length)) {
            try {
                this.signInput(i, keyPair, sighashTypes);
                results.push(true);
            }
            catch (err) {
                results.push(false);
            }
        }
        if (results.every((v) => v === false)) {
            throw new Error('No inputs were signed');
        }
        return this;
    }
    signAllInputsAsync(keyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        return new Promise((resolve, reject) => {
            if (!keyPair || !keyPair.publicKey)
                return reject(new Error('Need Signer to sign input'));
            // TODO: Add a pubkey/pubkeyhash cache to each input
            // as input information is added, then eventually
            // optimize this method.
            const results = [];
            const promises = [];
            for (const [i] of this.data.inputs.entries()) {
                promises.push(this.signInputAsync(i, keyPair, sighashTypes).then(() => {
                    results.push(true);
                }, () => {
                    results.push(false);
                }));
            }
            return Promise.all(promises).then(() => {
                if (results.every((v) => v === false)) {
                    return reject(new Error('No inputs were signed'));
                }
                resolve();
            });
        });
    }
    signInput(inputIndex, keyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        if (!keyPair || !keyPair.publicKey)
            throw new Error('Need Signer to sign input');
        const { hash, sighashType } = getHashAndSighashType(this.data.inputs, inputIndex, Buffer$o.from(keyPair.publicKey), this.__CACHE, sighashTypes);
        const partialSig = [
            {
                pubkey: Buffer$o.from(keyPair.publicKey),
                signature: signature.encode(Buffer$o.from(keyPair.sign(hash)), sighashType),
            },
        ];
        this.data.updateInput(inputIndex, { partialSig });
        return this;
    }
    signInputAsync(inputIndex, keyPair, sighashTypes = [Transaction.SIGHASH_ALL]) {
        return Promise.resolve().then(() => {
            if (!keyPair || !keyPair.publicKey)
                throw new Error('Need Signer to sign input');
            const { hash, sighashType } = getHashAndSighashType(this.data.inputs, inputIndex, keyPair.publicKey, this.__CACHE, sighashTypes);
            return Promise.resolve(keyPair.sign(hash)).then((signature$1) => {
                const partialSig = [
                    {
                        pubkey: keyPair.publicKey,
                        signature: signature.encode(signature$1, sighashType),
                    },
                ];
                this.data.updateInput(inputIndex, { partialSig });
            });
        });
    }
    toBuffer() {
        checkCache(this.__CACHE);
        return this.data.toBuffer();
    }
    toHex() {
        checkCache(this.__CACHE);
        return this.data.toHex();
    }
    toBase64() {
        checkCache(this.__CACHE);
        return this.data.toBase64();
    }
    updateGlobal(updateData) {
        this.data.updateGlobal(updateData);
        return this;
    }
    updateInput(inputIndex, updateData) {
        if (updateData.witnessScript)
            checkInvalidP2WSH(updateData.witnessScript);
        this.data.updateInput(inputIndex, updateData);
        if (updateData.nonWitnessUtxo) {
            addNonWitnessTxCache(this.__CACHE, this.data.inputs[inputIndex], inputIndex);
        }
        return this;
    }
    updateOutput(outputIndex, updateData) {
        this.data.updateOutput(outputIndex, updateData);
        return this;
    }
    addUnknownKeyValToGlobal(keyVal) {
        this.data.addUnknownKeyValToGlobal(keyVal);
        return this;
    }
    addUnknownKeyValToInput(inputIndex, keyVal) {
        this.data.addUnknownKeyValToInput(inputIndex, keyVal);
        return this;
    }
    addUnknownKeyValToOutput(outputIndex, keyVal) {
        this.data.addUnknownKeyValToOutput(outputIndex, keyVal);
        return this;
    }
    clearFinalizedInput(inputIndex) {
        this.data.clearFinalizedInput(inputIndex);
        return this;
    }
}
/**
 * This function is needed to pass to the bip174 base class's fromBuffer.
 * It takes the "transaction buffer" portion of the psbt buffer and returns a
 * Transaction (From the bip174 library) interface.
 */
const transactionFromBuffer = (buffer) => new PsbtTransaction(buffer);
/**
 * This class implements the Transaction interface from bip174 library.
 * It contains a bitcoinjs-lib Transaction object.
 */
class PsbtTransaction {
    constructor(buffer = Buffer$o.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
        this.tx = Transaction.fromBuffer(buffer);
        checkTxEmpty(this.tx);
        Object.defineProperty(this, 'tx', {
            enumerable: false,
            writable: true,
        });
    }
    getInputOutputCounts() {
        return {
            inputCount: this.tx.ins.length,
            outputCount: this.tx.outs.length,
        };
    }
    addInput(input) {
        if (input.hash === undefined ||
            input.index === undefined ||
            (!Buffer$o.isBuffer(input.hash) &&
                typeof input.hash !== 'string') ||
            typeof input.index !== 'number') {
            throw new Error('Error adding input.');
        }
        const hash = typeof input.hash === 'string'
            ? reverseBuffer$1(Buffer$o.from(input.hash, 'hex'))
            : input.hash;
        this.tx.addInput(hash, input.index, input.sequence);
    }
    addOutput(output) {
        if (output.script === undefined ||
            output.value === undefined ||
            !Buffer$o.isBuffer(output.script) ||
            typeof output.value !== 'number') {
            throw new Error('Error adding output.');
        }
        this.tx.addOutput(output.script, output.value);
    }
    toBuffer() {
        return this.tx.toBuffer();
    }
}
function canFinalize(input, script, scriptType) {
    switch (scriptType) {
        case 'pubkey':
        case 'pubkeyhash':
        case 'witnesspubkeyhash':
            return hasSigs(1, input.partialSig);
        case 'multisig':
            const p2ms$1 = p2ms({ output: script });
            return hasSigs(p2ms$1.m, input.partialSig, p2ms$1.pubkeys);
        default:
            return false;
    }
}
function checkCache(cache) {
    if (cache.__UNSAFE_SIGN_NONSEGWIT !== false) {
        throw new Error('Not BIP174 compliant, can not export');
    }
}
function hasSigs(neededSigs, partialSig, pubkeys) {
    if (!partialSig)
        return false;
    let sigs;
    if (pubkeys) {
        sigs = pubkeys
            .map((pkey) => {
            const pubkey = compressPubkey(pkey);
            return partialSig.find((pSig) => pSig.pubkey.equals(pubkey));
        })
            .filter((v) => !!v);
    }
    else {
        sigs = partialSig;
    }
    if (sigs.length > neededSigs)
        throw new Error('Too many signatures');
    return sigs.length === neededSigs;
}
function isFinalized(input) {
    return !!input.finalScriptSig || !!input.finalScriptWitness;
}
function isPaymentFactory(payment) {
    return (script) => {
        try {
            payment({ output: script });
            return true;
        }
        catch (err) {
            return false;
        }
    };
}
const isP2MS = isPaymentFactory(p2ms);
const isP2PK = isPaymentFactory(p2pk);
const isP2PKH = isPaymentFactory(p2pkh);
const isP2WPKH = isPaymentFactory(p2wpkh);
const isP2WSHScript = isPaymentFactory(p2wsh);
const isP2SHScript = isPaymentFactory(p2sh);
function bip32DerivationIsMine(root) {
    return (d) => {
        if (!d.masterFingerprint.equals(root.fingerprint))
            return false;
        if (!root.derivePath(d.path).publicKey.equals(d.pubkey))
            return false;
        return true;
    };
}
function check32Bit(num) {
    if (typeof num !== 'number' ||
        num !== Math.floor(num) ||
        num > 0xffffffff ||
        num < 0) {
        throw new Error('Invalid 32 bit integer');
    }
}
function checkFees(psbt, cache, opts) {
    const feeRate = cache.__FEE_RATE || psbt.getFeeRate();
    const vsize = cache.__EXTRACTED_TX.virtualSize();
    const satoshis = feeRate * vsize;
    if (feeRate >= opts.maximumFeeRate) {
        throw new Error(`Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in ` +
            `fees, which is ${feeRate} satoshi per byte for a transaction ` +
            `with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per ` +
            `byte). Use setMaximumFeeRate method to raise your threshold, or ` +
            `pass true to the first arg of extractTransaction.`);
    }
}
function checkInputsForPartialSig(inputs, action) {
    inputs.forEach((input) => {
        let throws = false;
        let pSigs = [];
        if ((input.partialSig || []).length === 0) {
            if (!input.finalScriptSig && !input.finalScriptWitness)
                return;
            pSigs = getPsigsFromInputFinalScripts(input);
        }
        else {
            pSigs = input.partialSig;
        }
        pSigs.forEach((pSig) => {
            const { hashType } = signature.decode(pSig.signature);
            const whitelist = [];
            const isAnyoneCanPay = hashType & Transaction.SIGHASH_ANYONECANPAY;
            if (isAnyoneCanPay)
                whitelist.push('addInput');
            const hashMod = hashType & 0x1f;
            switch (hashMod) {
                case Transaction.SIGHASH_ALL:
                    break;
                case Transaction.SIGHASH_SINGLE:
                case Transaction.SIGHASH_NONE:
                    whitelist.push('addOutput');
                    whitelist.push('setInputSequence');
                    break;
            }
            if (whitelist.indexOf(action) === -1) {
                throws = true;
            }
        });
        if (throws) {
            throw new Error('Can not modify transaction, signatures exist.');
        }
    });
}
function checkPartialSigSighashes(input) {
    if (!input.sighashType || !input.partialSig)
        return;
    const { partialSig, sighashType } = input;
    partialSig.forEach((pSig) => {
        const { hashType } = signature.decode(pSig.signature);
        if (sighashType !== hashType) {
            throw new Error('Signature sighash does not match input sighash type');
        }
    });
}
function checkScriptForPubkey(pubkey, script, action) {
    if (!pubkeyInScript(pubkey, script)) {
        throw new Error(`Can not ${action} for this input with the key ${pubkey.toString('hex')}`);
    }
}
function checkTxEmpty(tx) {
    const isEmpty = tx.ins.every((input) => input.script &&
        input.script.length === 0 &&
        input.witness &&
        input.witness.length === 0);
    if (!isEmpty) {
        throw new Error('Format Error: Transaction ScriptSigs are not empty');
    }
}
function checkTxForDupeIns(tx, cache) {
    tx.ins.forEach((input) => {
        checkTxInputCache(cache, input);
    });
}
function checkTxInputCache(cache, input) {
    const key = reverseBuffer$1(Buffer$o.from(input.hash)).toString('hex') + ':' + input.index;
    if (cache.__TX_IN_CACHE[key])
        throw new Error('Duplicate input detected.');
    cache.__TX_IN_CACHE[key] = 1;
}
function scriptCheckerFactory(payment, paymentScriptName) {
    return (inputIndex, scriptPubKey, redeemScript, ioType) => {
        const redeemScriptOutput = payment({
            redeem: { output: redeemScript },
        }).output;
        if (!scriptPubKey.equals(redeemScriptOutput)) {
            throw new Error(`${paymentScriptName} for ${ioType} #${inputIndex} doesn't match the scriptPubKey in the prevout`);
        }
    };
}
const checkRedeemScript = scriptCheckerFactory(p2sh, 'Redeem script');
const checkWitnessScript = scriptCheckerFactory(p2wsh, 'Witness script');
function getTxCacheValue(key, name, inputs, c) {
    if (!inputs.every(isFinalized))
        throw new Error(`PSBT must be finalized to calculate ${name}`);
    if (key === '__FEE_RATE' && c.__FEE_RATE)
        return c.__FEE_RATE;
    if (key === '__FEE' && c.__FEE)
        return c.__FEE;
    let tx;
    let mustFinalize = true;
    if (c.__EXTRACTED_TX) {
        tx = c.__EXTRACTED_TX;
        mustFinalize = false;
    }
    else {
        tx = c.__TX.clone();
    }
    inputFinalizeGetAmts(inputs, tx, c, mustFinalize);
    if (key === '__FEE_RATE')
        return c.__FEE_RATE;
    else if (key === '__FEE')
        return c.__FEE;
}
function getFinalScripts(inputIndex, input, script, isSegwit, isP2SH, isP2WSH) {
    const scriptType = classifyScript(script);
    if (!canFinalize(input, script, scriptType))
        throw new Error(`Can not finalize input #${inputIndex}`);
    return prepareFinalScripts(script, scriptType, input.partialSig, isSegwit, isP2SH, isP2WSH);
}
function prepareFinalScripts(script, scriptType, partialSig, isSegwit, isP2SH, isP2WSH) {
    let finalScriptSig;
    let finalScriptWitness;
    // Wow, the payments API is very handy
    const payment = getPayment(script, scriptType, partialSig);
    const p2wsh$1 = !isP2WSH ? null : p2wsh({ redeem: payment });
    const p2sh$1 = !isP2SH ? null : p2sh({ redeem: p2wsh$1 || payment });
    if (isSegwit) {
        if (p2wsh$1) {
            finalScriptWitness = witnessStackToScriptWitness(p2wsh$1.witness);
        }
        else {
            finalScriptWitness = witnessStackToScriptWitness(payment.witness);
        }
        if (p2sh$1) {
            finalScriptSig = p2sh$1.input;
        }
    }
    else {
        if (p2sh$1) {
            finalScriptSig = p2sh$1.input;
        }
        else {
            finalScriptSig = payment.input;
        }
    }
    return {
        finalScriptSig,
        finalScriptWitness,
    };
}
function getHashAndSighashType(inputs, inputIndex, pubkey, cache, sighashTypes) {
    const input = utils.checkForInput(inputs, inputIndex);
    const { hash, sighashType, script } = getHashForSig(inputIndex, input, cache, false, sighashTypes);
    checkScriptForPubkey(pubkey, script, 'sign');
    return {
        hash,
        sighashType,
    };
}
function getHashForSig(inputIndex, input, cache, forValidate, sighashTypes) {
    const unsignedTx = cache.__TX;
    const sighashType = input.sighashType || Transaction.SIGHASH_ALL;
    if (sighashTypes && sighashTypes.indexOf(sighashType) < 0) {
        const str = sighashTypeToString(sighashType);
        throw new Error(`Sighash type is not allowed. Retry the sign method passing the ` +
            `sighashTypes array of whitelisted types. Sighash type: ${str}`);
    }
    let hash;
    let prevout;
    if (input.nonWitnessUtxo) {
        const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(cache, input, inputIndex);
        const prevoutHash = unsignedTx.ins[inputIndex].hash;
        const utxoHash = nonWitnessUtxoTx.getHash();
        // If a non-witness UTXO is provided, its hash must match the hash specified in the prevout
        if (!prevoutHash.equals(utxoHash)) {
            throw new Error(`Non-witness UTXO hash for input #${inputIndex} doesn't match the hash specified in the prevout`);
        }
        const prevoutIndex = unsignedTx.ins[inputIndex].index;
        prevout = nonWitnessUtxoTx.outs[prevoutIndex];
    }
    else if (input.witnessUtxo) {
        prevout = input.witnessUtxo;
    }
    else {
        throw new Error('Need a Utxo input item for signing');
    }
    const { meaningfulScript, type } = getMeaningfulScript(prevout.script, inputIndex, 'input', input.redeemScript, input.witnessScript);
    if (['p2sh-p2wsh', 'p2wsh'].indexOf(type) >= 0) {
        hash = unsignedTx.hashForWitnessV0(inputIndex, meaningfulScript, prevout.value, sighashType);
    }
    else if (isP2WPKH(meaningfulScript)) {
        // P2WPKH uses the P2PKH template for prevoutScript when signing
        const signingScript = p2pkh({ hash: meaningfulScript.slice(2) })
            .output;
        hash = unsignedTx.hashForWitnessV0(inputIndex, signingScript, prevout.value, sighashType);
    }
    else {
        // non-segwit
        if (input.nonWitnessUtxo === undefined &&
            cache.__UNSAFE_SIGN_NONSEGWIT === false)
            throw new Error(`Input #${inputIndex} has witnessUtxo but non-segwit script: ` +
                `${meaningfulScript.toString('hex')}`);
        if (!forValidate && cache.__UNSAFE_SIGN_NONSEGWIT !== false)
            console.warn('Warning: Signing non-segwit inputs without the full parent transaction ' +
                'means there is a chance that a miner could feed you incorrect information ' +
                "to trick you into paying large fees. This behavior is the same as Psbt's predecesor " +
                '(TransactionBuilder - now removed) when signing non-segwit scripts. You are not ' +
                'able to export this Psbt with toBuffer|toBase64|toHex since it is not ' +
                'BIP174 compliant.\n*********************\nPROCEED WITH CAUTION!\n' +
                '*********************');
        hash = unsignedTx.hashForSignature(inputIndex, meaningfulScript, sighashType);
    }
    return {
        script: meaningfulScript,
        sighashType,
        hash,
    };
}
function getPayment(script, scriptType, partialSig) {
    let payment;
    switch (scriptType) {
        case 'multisig':
            const sigs = getSortedSigs(script, partialSig);
            payment = p2ms({
                output: script,
                signatures: sigs,
            });
            break;
        case 'pubkey':
            payment = p2pk({
                output: script,
                signature: partialSig[0].signature,
            });
            break;
        case 'pubkeyhash':
            payment = p2pkh({
                output: script,
                pubkey: partialSig[0].pubkey,
                signature: partialSig[0].signature,
            });
            break;
        case 'witnesspubkeyhash':
            payment = p2wpkh({
                output: script,
                pubkey: partialSig[0].pubkey,
                signature: partialSig[0].signature,
            });
            break;
    }
    return payment;
}
function getPsigsFromInputFinalScripts(input) {
    const scriptItems = !input.finalScriptSig
        ? []
        : decompile(input.finalScriptSig) || [];
    const witnessItems = !input.finalScriptWitness
        ? []
        : decompile(input.finalScriptWitness) || [];
    return scriptItems
        .concat(witnessItems)
        .filter((item) => {
        return Buffer$o.isBuffer(item) && isCanonicalScriptSignature(item);
    })
        .map((sig) => ({ signature: sig }));
}
function getScriptFromInput(inputIndex, input, cache) {
    const unsignedTx = cache.__TX;
    const res = {
        script: null,
        isSegwit: false,
        isP2SH: false,
        isP2WSH: false,
    };
    res.isP2SH = !!input.redeemScript;
    res.isP2WSH = !!input.witnessScript;
    if (input.witnessScript) {
        res.script = input.witnessScript;
    }
    else if (input.redeemScript) {
        res.script = input.redeemScript;
    }
    else {
        if (input.nonWitnessUtxo) {
            const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(cache, input, inputIndex);
            const prevoutIndex = unsignedTx.ins[inputIndex].index;
            res.script = nonWitnessUtxoTx.outs[prevoutIndex].script;
        }
        else if (input.witnessUtxo) {
            res.script = input.witnessUtxo.script;
        }
    }
    if (input.witnessScript || isP2WPKH(res.script)) {
        res.isSegwit = true;
    }
    return res;
}
function getSignersFromHD(inputIndex, inputs, hdKeyPair) {
    const input = utils.checkForInput(inputs, inputIndex);
    if (!input.bip32Derivation || input.bip32Derivation.length === 0) {
        throw new Error('Need bip32Derivation to sign with HD');
    }
    const myDerivations = input.bip32Derivation
        .map((bipDv) => {
        if (bipDv.masterFingerprint.equals(hdKeyPair.fingerprint)) {
            return bipDv;
        }
        else {
            return;
        }
    })
        .filter((v) => !!v);
    if (myDerivations.length === 0) {
        throw new Error('Need one bip32Derivation masterFingerprint to match the HDSigner fingerprint');
    }
    const signers = myDerivations.map((bipDv) => {
        const node = hdKeyPair.derivePath(bipDv.path);
        if (!bipDv.pubkey.equals(node.publicKey)) {
            throw new Error('pubkey did not match bip32Derivation');
        }
        return node;
    });
    return signers;
}
function getSortedSigs(script, partialSig) {
    const p2ms$1 = p2ms({ output: script });
    // for each pubkey in order of p2ms script
    return p2ms$1
        .pubkeys.map((pk) => {
        // filter partialSig array by pubkey being equal
        return (partialSig.filter((ps) => {
            return ps.pubkey.equals(pk);
        })[0] || {}).signature;
        // Any pubkey without a match will return undefined
        // this last filter removes all the undefined items in the array.
    })
        .filter((v) => !!v);
}
function scriptWitnessToWitnessStack(buffer) {
    let offset = 0;
    function readSlice(n) {
        offset += n;
        return buffer.slice(offset - n, offset);
    }
    function readVarInt() {
        const vi = converter_varint.decode(buffer, offset);
        offset += converter_varint.decode.bytes;
        return vi;
    }
    function readVarSlice() {
        return readSlice(readVarInt());
    }
    function readVector() {
        const count = readVarInt();
        const vector = [];
        for (let i = 0; i < count; i++)
            vector.push(readVarSlice());
        return vector;
    }
    return readVector();
}
function sighashTypeToString(sighashType) {
    let text = sighashType & Transaction.SIGHASH_ANYONECANPAY
        ? 'SIGHASH_ANYONECANPAY | '
        : '';
    const sigMod = sighashType & 0x1f;
    switch (sigMod) {
        case Transaction.SIGHASH_ALL:
            text += 'SIGHASH_ALL';
            break;
        case Transaction.SIGHASH_SINGLE:
            text += 'SIGHASH_SINGLE';
            break;
        case Transaction.SIGHASH_NONE:
            text += 'SIGHASH_NONE';
            break;
    }
    return text;
}
function witnessStackToScriptWitness(witness) {
    let buffer = Buffer$o.allocUnsafe(0);
    function writeSlice(slice) {
        buffer = Buffer$o.concat([buffer, Buffer$o.from(slice)]);
    }
    function writeVarInt(i) {
        const currentLen = buffer.length;
        const varintLen = converter_varint.encodingLength(i);
        buffer = Buffer$o.concat([buffer, Buffer$o.allocUnsafe(varintLen)]);
        converter_varint.encode(i, buffer, currentLen);
    }
    function writeVarSlice(slice) {
        writeVarInt(slice.length);
        writeSlice(slice);
    }
    function writeVector(vector) {
        writeVarInt(vector.length);
        vector.forEach(writeVarSlice);
    }
    writeVector(witness);
    return buffer;
}
function addNonWitnessTxCache(cache, input, inputIndex) {
    cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo;
    const tx = Transaction.fromBuffer(input.nonWitnessUtxo);
    cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx;
    const self = cache;
    const selfIndex = inputIndex;
    delete input.nonWitnessUtxo;
    Object.defineProperty(input, 'nonWitnessUtxo', {
        enumerable: true,
        get() {
            const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex];
            const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex];
            if (buf !== undefined) {
                return buf;
            }
            else {
                const newBuf = txCache.toBuffer();
                self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf;
                return newBuf;
            }
        },
        set(data) {
            self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data;
        },
    });
}
function inputFinalizeGetAmts(inputs, tx, cache, mustFinalize) {
    let inputAmount = 0;
    inputs.forEach((input, idx) => {
        if (mustFinalize && input.finalScriptSig)
            tx.ins[idx].script = input.finalScriptSig;
        if (mustFinalize && input.finalScriptWitness) {
            tx.ins[idx].witness = scriptWitnessToWitnessStack(input.finalScriptWitness);
        }
        if (input.witnessUtxo) {
            inputAmount += input.witnessUtxo.value;
        }
        else if (input.nonWitnessUtxo) {
            const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx);
            const vout = tx.ins[idx].index;
            const out = nwTx.outs[vout];
            inputAmount += out.value;
        }
    });
    const outputAmount = tx.outs.reduce((total, o) => total + o.value, 0);
    const fee = inputAmount - outputAmount;
    if (fee < 0) {
        throw new Error('Outputs are spending more than Inputs');
    }
    const bytes = tx.virtualSize();
    cache.__FEE = fee;
    cache.__EXTRACTED_TX = tx;
    cache.__FEE_RATE = Math.floor(fee / bytes);
}
function nonWitnessUtxoTxFromCache(cache, input, inputIndex) {
    const c = cache.__NON_WITNESS_UTXO_TX_CACHE;
    if (!c[inputIndex]) {
        addNonWitnessTxCache(cache, input, inputIndex);
    }
    return c[inputIndex];
}
function getScriptFromUtxo(inputIndex, input, cache) {
    if (input.witnessUtxo !== undefined) {
        return input.witnessUtxo.script;
    }
    else if (input.nonWitnessUtxo !== undefined) {
        const nonWitnessUtxoTx = nonWitnessUtxoTxFromCache(cache, input, inputIndex);
        return nonWitnessUtxoTx.outs[cache.__TX.ins[inputIndex].index].script;
    }
    else {
        throw new Error("Can't find pubkey in input without Utxo data");
    }
}
function pubkeyInInput(pubkey, input, inputIndex, cache) {
    const script = getScriptFromUtxo(inputIndex, input, cache);
    const { meaningfulScript } = getMeaningfulScript(script, inputIndex, 'input', input.redeemScript, input.witnessScript);
    return pubkeyInScript(pubkey, meaningfulScript);
}
function pubkeyInOutput(pubkey, output, outputIndex, cache) {
    const script = cache.__TX.outs[outputIndex].script;
    const { meaningfulScript } = getMeaningfulScript(script, outputIndex, 'output', output.redeemScript, output.witnessScript);
    return pubkeyInScript(pubkey, meaningfulScript);
}
function redeemFromFinalScriptSig(finalScript) {
    if (!finalScript)
        return;
    const decomp = decompile(finalScript);
    if (!decomp)
        return;
    const lastItem = decomp[decomp.length - 1];
    if (!Buffer$o.isBuffer(lastItem) ||
        isPubkeyLike(lastItem) ||
        isSigLike(lastItem))
        return;
    const sDecomp = decompile(lastItem);
    if (!sDecomp)
        return;
    return lastItem;
}
function redeemFromFinalWitnessScript(finalScript) {
    if (!finalScript)
        return;
    const decomp = scriptWitnessToWitnessStack(finalScript);
    const lastItem = decomp[decomp.length - 1];
    if (isPubkeyLike(lastItem))
        return;
    const sDecomp = decompile(lastItem);
    if (!sDecomp)
        return;
    return lastItem;
}
function compressPubkey(pubkey) {
    if (pubkey.length === 65) {
        const parity = pubkey[64] & 1;
        const newKey = pubkey.slice(0, 33);
        newKey[0] = 2 | parity;
        return newKey;
    }
    return pubkey.slice();
}
function isPubkeyLike(buf) {
    return buf.length === 33 && isCanonicalPubKey(buf);
}
function isSigLike(buf) {
    return isCanonicalScriptSignature(buf);
}
function getMeaningfulScript(script, index, ioType, redeemScript, witnessScript) {
    const isP2SH = isP2SHScript(script);
    const isP2SHP2WSH = isP2SH && redeemScript && isP2WSHScript(redeemScript);
    const isP2WSH = isP2WSHScript(script);
    if (isP2SH && redeemScript === undefined)
        throw new Error('scriptPubkey is P2SH but redeemScript missing');
    if ((isP2WSH || isP2SHP2WSH) && witnessScript === undefined)
        throw new Error('scriptPubkey or redeemScript is P2WSH but witnessScript missing');
    let meaningfulScript;
    if (isP2SHP2WSH) {
        meaningfulScript = witnessScript;
        checkRedeemScript(index, script, redeemScript, ioType);
        checkWitnessScript(index, redeemScript, witnessScript, ioType);
        checkInvalidP2WSH(meaningfulScript);
    }
    else if (isP2WSH) {
        meaningfulScript = witnessScript;
        checkWitnessScript(index, script, witnessScript, ioType);
        checkInvalidP2WSH(meaningfulScript);
    }
    else if (isP2SH) {
        meaningfulScript = redeemScript;
        checkRedeemScript(index, script, redeemScript, ioType);
    }
    else {
        meaningfulScript = script;
    }
    return {
        meaningfulScript,
        type: isP2SHP2WSH
            ? 'p2sh-p2wsh'
            : isP2SH
                ? 'p2sh'
                : isP2WSH
                    ? 'p2wsh'
                    : 'raw',
    };
}
function checkInvalidP2WSH(script) {
    if (isP2WPKH(script) || isP2SHScript(script)) {
        throw new Error('P2WPKH or P2SH can not be contained within P2WSH');
    }
}
function pubkeyInScript(pubkey, script) {
    const pubkeyHash = hash160(pubkey);
    const decompiled = decompile(script);
    if (decompiled === null)
        throw new Error('Unknown script error');
    return decompiled.some((element) => {
        if (typeof element === 'number')
            return false;
        return element.equals(pubkey) || element.equals(pubkeyHash);
    });
}
function classifyScript(script) {
    if (isP2WPKH(script))
        return 'witnesspubkeyhash';
    if (isP2PKH(script))
        return 'pubkeyhash';
    if (isP2MS(script))
        return 'multisig';
    if (isP2PK(script))
        return 'pubkey';
    return 'nonstandard';
}
function range(n) {
    return [...Array(n).keys()];
}

export { Psbt };
//# sourceMappingURL=psbt-1ad2947f.mjs.map
