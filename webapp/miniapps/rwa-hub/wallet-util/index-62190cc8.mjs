/**
 * Current config
 */
const config = {
    wasmBaseUrl: './assets',
    wasmLoader: (wasmUrl) => fetch(wasmUrl).then((res) => res.arrayBuffer()),
};
async function setConfig(options) {
    Object.assign(config, options);
}

const cacheCall = (fun) => {
    let r;
    return (...args) => (r ?? (r = fun(...args)));
};

/**
 * 该文件是各个子模块的异步加载集合
 */
const getBitcoin = cacheCall(async () => {
    const { prepareBitcoinLib } = await import('./_setup-579fac72.mjs');
    await prepareBitcoinLib();
    const address = await import('./address-cd5fc561.mjs').then(function (n) { return n.h; });
    const payments = await import('./index-f9540180.mjs');
    const psbt = await import('./psbt-1ad2947f.mjs');
    const script = await import('./script-1d075504.mjs').then(function (n) { return n.q; });
    const crypto = await import('./crypto-1573ae3b.mjs');
    const { OPS } = await import('./ops-a3396647.mjs');
    return {
        address,
        payments,
        psbt,
        script,
        crypto,
        OPS,
    };
});
const getTinySecp256k1 = cacheCall(async () => {
    const { prepareTinySecp256k1 } = await import('./_setup-2644274b.mjs');
    await prepareTinySecp256k1();
    return await import('./index-20b88f48.mjs').then(function (n) { return n.a; });
});
const getBip39 = cacheCall(async () => {
    const { prepareBip39 } = await import('./_setup-9ac22773.mjs');
    await prepareBip39();
    const wordlists = await import('./wordlists-adf094e0.mjs');
    const bip39 = await import('./index-48b4ccd9.mjs');
    return {
        wordlists,
        bip39,
    };
});
const getBip32 = cacheCall(async () => {
    const [ecc, { prepareBip32 }] = await Promise.all([
        getTinySecp256k1(),
        import('./_setup-516b80df.mjs'),
    ]);
    await prepareBip32();
    const { BIP32Factory } = await import('./bip32-c8c792ca.mjs');
    return BIP32Factory(ecc);
});
const getEcpair = cacheCall(async () => {
    const [ecc, { prepareEcpair }] = await Promise.all([
        getTinySecp256k1(),
        import('./_setup-60ba36f8.mjs'),
    ]);
    await prepareEcpair();
    const { ECPairFactory } = await import('./ecpair-70275eb5.mjs');
    return ECPairFactory(ecc);
});
const getNetworks = cacheCall(() => {
    return import('./index-83228926.mjs');
});
const getEthereumUtil = cacheCall(async () => {
    const { prepareEthereumUtil } = await import('./_setup-e5b50fa8.mjs');
    await prepareEthereumUtil();
    return await import('./index-6a9be87a.mjs');
});
const getHashWasm = cacheCall(async () => {
    return await import('./index-157c5cf3.mjs');
});

var modules = /*#__PURE__*/Object.freeze({
    __proto__: null,
    getBip32: getBip32,
    getBip39: getBip39,
    getBitcoin: getBitcoin,
    getEcpair: getEcpair,
    getEthereumUtil: getEthereumUtil,
    getHashWasm: getHashWasm,
    getNetworks: getNetworks,
    getTinySecp256k1: getTinySecp256k1
});

var buffer$1 = {};

var base64Js = {};

base64Js.byteLength = byteLength;
base64Js.toByteArray = toByteArray;
base64Js.fromByteArray = fromByteArray;

var lookup = [];
var revLookup = [];
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i];
  revLookup[code.charCodeAt(i)] = i;
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62;
revLookup['_'.charCodeAt(0)] = 63;

function getLens(b64) {
  var len = b64.length;

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4');
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=');
  if (validLen === -1) validLen = len;

  var placeHoldersLen = validLen === len ? 0 : 4 - (validLen % 4);

  return [validLen, placeHoldersLen];
}

// base64 is 4/3 + up to two characters of the original data
function byteLength(b64) {
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

function _byteLength(b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3) / 4 - placeHoldersLen;
}

function toByteArray(b64) {
  var tmp;
  var lens = getLens(b64);
  var validLen = lens[0];
  var placeHoldersLen = lens[1];

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen));

  var curByte = 0;

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0 ? validLen - 4 : validLen;

  var i;
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)];
    arr[curByte++] = (tmp >> 16) & 0xff;
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4);
    arr[curByte++] = tmp & 0xff;
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2);
    arr[curByte++] = (tmp >> 8) & 0xff;
    arr[curByte++] = tmp & 0xff;
  }

  return arr;
}

function tripletToBase64(num) {
  return (
    lookup[(num >> 18) & 0x3f] +
    lookup[(num >> 12) & 0x3f] +
    lookup[(num >> 6) & 0x3f] +
    lookup[num & 0x3f]
  );
}

function encodeChunk(uint8, start, end) {
  var tmp;
  var output = [];
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xff0000) +
      ((uint8[i + 1] << 8) & 0xff00) +
      (uint8[i + 2] & 0xff);
    output.push(tripletToBase64(tmp));
  }
  return output.join('');
}

function fromByteArray(uint8) {
  var tmp;
  var len = uint8.length;
  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
  var parts = [];
  var maxChunkLength = 16383; // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(
      encodeChunk(
        uint8,
        i,
        i + maxChunkLength > len2 ? len2 : i + maxChunkLength
      )
    );
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1];
    parts.push(lookup[tmp >> 2] + lookup[(tmp << 4) & 0x3f] + '==');
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1];
    parts.push(
      lookup[tmp >> 10] +
        lookup[(tmp >> 4) & 0x3f] +
        lookup[(tmp << 2) & 0x3f] +
        '='
    );
  }

  return parts.join('');
}

var ieee754 = {};

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */

ieee754.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var nBits = -7;
  var i = isLE ? nBytes - 1 : 0;
  var d = isLE ? -1 : 1;
  var s = buffer[offset + i];

  i += d;

  e = s & ((1 << -nBits) - 1);
  s >>= -nBits;
  nBits += eLen;
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << -nBits) - 1);
  e >>= -nBits;
  nBits += mLen;
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias;
  } else if (e === eMax) {
    return m ? NaN : (s ? -1 : 1) * Infinity;
  } else {
    m = m + Math.pow(2, mLen);
    e = e - eBias;
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen);
};

ieee754.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c;
  var eLen = nBytes * 8 - mLen - 1;
  var eMax = (1 << eLen) - 1;
  var eBias = eMax >> 1;
  var rt = mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
  var i = isLE ? 0 : nBytes - 1;
  var d = isLE ? 1 : -1;
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

  value = Math.abs(value);

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0;
    e = eMax;
  } else {
    e = Math.floor(Math.log(value) / Math.LN2);
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--;
      c *= 2;
    }
    if (e + eBias >= 1) {
      value += rt / c;
    } else {
      value += rt * Math.pow(2, 1 - eBias);
    }
    if (value * c >= 2) {
      e++;
      c /= 2;
    }

    if (e + eBias >= eMax) {
      m = 0;
      e = eMax;
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen);
      e = e + eBias;
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
      e = 0;
    }
  }

  for (
    ;
    mLen >= 8;
    buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8
  ) {}

  e = (e << mLen) | m;
  eLen += mLen;
  for (
    ;
    eLen > 0;
    buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8
  ) {}

  buffer[offset + i - d] |= s * 128;
};

/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */

(function (exports) {

	const base64 = base64Js;
	const ieee754$1 = ieee754;
	const customInspectSymbol =
	  typeof Symbol === 'function' && typeof Symbol['for'] === 'function' // eslint-disable-line dot-notation
	    ? Symbol['for']('nodejs.util.inspect.custom') // eslint-disable-line dot-notation
	    : null;

	exports.Buffer = Buffer;
	exports.SlowBuffer = SlowBuffer;
	exports.INSPECT_MAX_BYTES = 50;

	const K_MAX_LENGTH = 0x7fffffff;
	exports.kMaxLength = K_MAX_LENGTH;

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Print warning and recommend using `buffer` v4.x which has an Object
	 *               implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * We report that the browser does not support typed arrays if the are not subclassable
	 * using __proto__. Firefox 4-29 lacks support for adding new properties to `Uint8Array`
	 * (See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438). IE 10 lacks support
	 * for __proto__ and has a buggy typed array implementation.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();

	if (
	  !Buffer.TYPED_ARRAY_SUPPORT &&
	  typeof console !== 'undefined' &&
	  typeof console.error === 'function'
	) {
	  console.error(
	    'This browser lacks typed array (Uint8Array) support which is required by ' +
	      '`buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
	  );
	}

	function typedArraySupport() {
	  // Can typed array instances can be augmented?
	  try {
	    const arr = new Uint8Array(1);
	    const proto = {
	      foo: function () {
	        return 42;
	      },
	    };
	    Object.setPrototypeOf(proto, Uint8Array.prototype);
	    Object.setPrototypeOf(arr, proto);
	    return arr.foo() === 42;
	  } catch (e) {
	    return false;
	  }
	}

	Object.defineProperty(Buffer.prototype, 'parent', {
	  enumerable: true,
	  get: function () {
	    if (!Buffer.isBuffer(this)) return undefined;
	    return this.buffer;
	  },
	});

	Object.defineProperty(Buffer.prototype, 'offset', {
	  enumerable: true,
	  get: function () {
	    if (!Buffer.isBuffer(this)) return undefined;
	    return this.byteOffset;
	  },
	});

	function createBuffer(length) {
	  if (length > K_MAX_LENGTH) {
	    throw new RangeError(
	      'The value "' + length + '" is invalid for option "size"'
	    );
	  }
	  // Return an augmented `Uint8Array` instance
	  const buf = new Uint8Array(length);
	  Object.setPrototypeOf(buf, Buffer.prototype);
	  return buf;
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer(arg, encodingOrOffset, length) {
	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new TypeError(
	        'The "string" argument must be of type string. Received type number'
	      );
	    }
	    return allocUnsafe(arg);
	  }
	  return from(arg, encodingOrOffset, length);
	}

	Buffer.poolSize = 8192; // not used by this implementation

	function from(value, encodingOrOffset, length) {
	  if (typeof value === 'string') {
	    return fromString(value, encodingOrOffset);
	  }

	  if (ArrayBuffer.isView(value)) {
	    return fromArrayView(value);
	  }

	  if (value == null) {
	    throw new TypeError(
	      'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
	        'or Array-like Object. Received type ' +
	        typeof value
	    );
	  }

	  if (
	    isInstance(value, ArrayBuffer) ||
	    (value && isInstance(value.buffer, ArrayBuffer))
	  ) {
	    return fromArrayBuffer(value, encodingOrOffset, length);
	  }

	  if (
	    typeof SharedArrayBuffer !== 'undefined' &&
	    (isInstance(value, SharedArrayBuffer) ||
	      (value && isInstance(value.buffer, SharedArrayBuffer)))
	  ) {
	    return fromArrayBuffer(value, encodingOrOffset, length);
	  }

	  if (typeof value === 'number') {
	    throw new TypeError(
	      'The "value" argument must not be of type number. Received type number'
	    );
	  }

	  const valueOf = value.valueOf && value.valueOf();
	  if (valueOf != null && valueOf !== value) {
	    return Buffer.from(valueOf, encodingOrOffset, length);
	  }

	  const b = fromObject(value);
	  if (b) return b;

	  if (
	    typeof Symbol !== 'undefined' &&
	    Symbol.toPrimitive != null &&
	    typeof value[Symbol.toPrimitive] === 'function'
	  ) {
	    return Buffer.from(
	      value[Symbol.toPrimitive]('string'),
	      encodingOrOffset,
	      length
	    );
	  }

	  throw new TypeError(
	    'The first argument must be one of type string, Buffer, ArrayBuffer, Array, ' +
	      'or Array-like Object. Received type ' +
	      typeof value
	  );
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(value, encodingOrOffset, length);
	};

	// Note: Change prototype *after* Buffer.from is defined to workaround Chrome bug:
	// https://github.com/feross/buffer/pull/148
	Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
	Object.setPrototypeOf(Buffer, Uint8Array);

	function assertSize(size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be of type number');
	  } else if (size < 0) {
	    throw new RangeError(
	      'The value "' + size + '" is invalid for option "size"'
	    );
	  }
	}

	function alloc(size, fill, encoding) {
	  assertSize(size);
	  if (size <= 0) {
	    return createBuffer(size);
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpreted as a start offset.
	    return typeof encoding === 'string'
	      ? //@ts-ignore
	        createBuffer(size).fill(fill, encoding)
	      : createBuffer(size).fill(fill);
	  }
	  return createBuffer(size);
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(size, fill, encoding);
	};

	function allocUnsafe(size) {
	  assertSize(size);
	  return createBuffer(size < 0 ? 0 : checked(size) | 0);
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(size);
	};
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(size);
	};

	function fromString(string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('Unknown encoding: ' + encoding);
	  }

	  const length = byteLength(string, encoding) | 0;
	  let buf = createBuffer(length);
	  const actual = buf.write(string, encoding);

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    buf = buf.slice(0, actual);
	  }

	  return buf;
	}

	function fromArrayLike(array) {
	  const length = array.length < 0 ? 0 : checked(array.length) | 0;
	  const buf = createBuffer(length);
	  for (let i = 0; i < length; i += 1) {
	    buf[i] = array[i] & 255;
	  }
	  return buf;
	}

	function fromArrayView(arrayView) {
	  if (isInstance(arrayView, Uint8Array)) {
	    const copy = new Uint8Array(arrayView);
	    return fromArrayBuffer(copy.buffer, copy.byteOffset, copy.byteLength);
	  }
	  return fromArrayLike(arrayView);
	}

	function fromArrayBuffer(array, byteOffset, length) {
	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('"offset" is outside of buffer bounds');
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('"length" is outside of buffer bounds');
	  }

	  let buf;
	  if (byteOffset === undefined && length === undefined) {
	    buf = new Uint8Array(array);
	  } else if (length === undefined) {
	    buf = new Uint8Array(array, byteOffset);
	  } else {
	    buf = new Uint8Array(array, byteOffset, length);
	  }

	  // Return an augmented `Uint8Array` instance
	  Object.setPrototypeOf(buf, Buffer.prototype);

	  return buf;
	}

	function fromObject(obj) {
	  if (Buffer.isBuffer(obj)) {
	    const len = checked(obj.length) | 0;
	    const buf = createBuffer(len);

	    if (buf.length === 0) {
	      return buf;
	    }

	    obj.copy(buf, 0, 0, len);
	    return buf;
	  }

	  if (obj.length !== undefined) {
	    if (typeof obj.length !== 'number' || numberIsNaN(obj.length)) {
	      return createBuffer(0);
	    }
	    return fromArrayLike(obj);
	  }

	  if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
	    return fromArrayLike(obj.data);
	  }
	}

	function checked(length) {
	  // Note: cannot use `length < K_MAX_LENGTH` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= K_MAX_LENGTH) {
	    throw new RangeError(
	      'Attempt to allocate Buffer larger than maximum ' +
	        'size: 0x' +
	        K_MAX_LENGTH.toString(16) +
	        ' bytes'
	    );
	  }
	  return length | 0;
	}

	function SlowBuffer(length) {
	  if (+length != length) {
	    // eslint-disable-line eqeqeq
	    length = 0;
	  }
	  return Buffer.alloc(+length);
	}

	Buffer.isBuffer = function isBuffer(b) {
	  return b != null && b._isBuffer === true && b !== Buffer.prototype; // so Buffer.isBuffer(Buffer.prototype) will be false
	};

	Buffer.compare = function compare(a, b) {
	  if (isInstance(a, Uint8Array)) a = Buffer.from(a, a.offset, a.byteLength);
	  if (isInstance(b, Uint8Array)) b = Buffer.from(b, b.offset, b.byteLength);
	  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
	    throw new TypeError(
	      'The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array'
	    );
	  }

	  if (a === b) return 0;

	  let x = a.length;
	  let y = b.length;

	  for (let i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break;
	    }
	  }

	  if (x < y) return -1;
	  if (y < x) return 1;
	  return 0;
	};

	Buffer.isEncoding = function isEncoding(encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true;
	    default:
	      return false;
	  }
	};

	Buffer.concat = function concat(list, length) {
	  if (!Array.isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers');
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0);
	  }

	  let i;
	  if (length === undefined) {
	    length = 0;
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length;
	    }
	  }

	  const buffer = Buffer.allocUnsafe(length);
	  let pos = 0;
	  for (i = 0; i < list.length; ++i) {
	    let buf = list[i];
	    if (isInstance(buf, Uint8Array)) {
	      if (pos + buf.length > buffer.length) {
	        if (!Buffer.isBuffer(buf)) buf = Buffer.from(buf);
	        buf.copy(buffer, pos);
	      } else {
	        Uint8Array.prototype.set.call(buffer, buf, pos);
	      }
	    } else if (!Buffer.isBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers');
	    } else {
	      buf.copy(buffer, pos);
	    }
	    pos += buf.length;
	  }
	  return buffer;
	};

	function byteLength(string, encoding) {
	  if (Buffer.isBuffer(string)) {
	    return string.length;
	  }
	  if (ArrayBuffer.isView(string) || isInstance(string, ArrayBuffer)) {
	    return string.byteLength;
	  }
	  if (typeof string !== 'string') {
	    throw new TypeError(
	      'The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' +
	        'Received type ' +
	        typeof string
	    );
	  }

	  const len = string.length;
	  const mustMatch = arguments.length > 2 && arguments[2] === true;
	  if (!mustMatch && len === 0) return 0;

	  // Use a for loop to avoid recursion
	  let loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len;
	      case 'utf8':
	      case 'utf-8':
	        return utf8ToBytes(string).length;
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2;
	      case 'hex':
	        return len >>> 1;
	      case 'base64':
	        return base64ToBytes(string).length;
	      default:
	        if (loweredCase) {
	          return mustMatch ? -1 : utf8ToBytes(string).length; // assume utf8
	        }
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	}
	Buffer.byteLength = byteLength;

	function slowToString(encoding, start, end) {
	  let loweredCase = false;

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0;
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return '';
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length;
	  }

	  if (end <= 0) {
	    return '';
	  }

	  // Force coercion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0;
	  start >>>= 0;

	  if (end <= start) {
	    return '';
	  }

	  if (!encoding) encoding = 'utf8';

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end);

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end);

	      case 'ascii':
	        return asciiSlice(this, start, end);

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end);

	      case 'base64':
	        return base64Slice(this, start, end);

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end);

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
	        encoding = (encoding + '').toLowerCase();
	        loweredCase = true;
	    }
	  }
	}

	// This property is used by `Buffer.isBuffer` (and the `is-buffer` npm package)
	// to detect a Buffer instance. It's not possible to use `instanceof Buffer`
	// reliably in a browserify context because there could be multiple different
	// copies of the 'buffer' package in use. This method works even for Buffer
	// instances that were created from another copy of the `buffer` package.
	// See: https://github.com/feross/buffer/issues/154
	Buffer.prototype._isBuffer = true;

	function swap(b, n, m) {
	  const i = b[n];
	  b[n] = b[m];
	  b[m] = i;
	}

	Buffer.prototype.swap16 = function swap16() {
	  const len = this.length;
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits');
	  }
	  for (let i = 0; i < len; i += 2) {
	    swap(this, i, i + 1);
	  }
	  return this;
	};

	Buffer.prototype.swap32 = function swap32() {
	  const len = this.length;
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits');
	  }
	  for (let i = 0; i < len; i += 4) {
	    swap(this, i, i + 3);
	    swap(this, i + 1, i + 2);
	  }
	  return this;
	};

	Buffer.prototype.swap64 = function swap64() {
	  const len = this.length;
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits');
	  }
	  for (let i = 0; i < len; i += 8) {
	    swap(this, i, i + 7);
	    swap(this, i + 1, i + 6);
	    swap(this, i + 2, i + 5);
	    swap(this, i + 3, i + 4);
	  }
	  return this;
	};

	Buffer.prototype.toString = function toString() {
	  const length = this.length;
	  if (length === 0) return '';
	  if (arguments.length === 0) return utf8Slice(this, 0, length);
	  return slowToString.apply(this, arguments);
	};

	Buffer.prototype.toLocaleString = Buffer.prototype.toString;

	Buffer.prototype.equals = function equals(b) {
	  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer');
	  if (this === b) return true;
	  return Buffer.compare(this, b) === 0;
	};

	Buffer.prototype.inspect = function inspect() {
	  let str = '';
	  const max = exports.INSPECT_MAX_BYTES;
	  str = this.toString('hex', 0, max)
	    .replace(/(.{2})/g, '$1 ')
	    .trim();
	  if (this.length > max) str += ' ... ';
	  return '<Buffer ' + str + '>';
	};
	if (customInspectSymbol) {
	  Buffer.prototype[customInspectSymbol] = Buffer.prototype.inspect;
	}

	Buffer.prototype.compare = function compare(
	  target,
	  start,
	  end,
	  thisStart,
	  thisEnd
	) {
	  if (isInstance(target, Uint8Array)) {
	    target = Buffer.from(target, target.offset, target.byteLength);
	  }
	  if (!Buffer.isBuffer(target)) {
	    throw new TypeError(
	      'The "target" argument must be one of type Buffer or Uint8Array. ' +
	        'Received type ' +
	        typeof target
	    );
	  }

	  if (start === undefined) {
	    start = 0;
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0;
	  }
	  if (thisStart === undefined) {
	    thisStart = 0;
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length;
	  }
	  if (
	    start < 0 ||
	    end > target.length ||
	    thisStart < 0 ||
	    thisEnd > this.length
	  ) {
	    throw new RangeError('out of range index');
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0;
	  }
	  if (thisStart >= thisEnd) {
	    return -1;
	  }
	  if (start >= end) {
	    return 1;
	  }

	  start >>>= 0;
	  end >>>= 0;
	  thisStart >>>= 0;
	  thisEnd >>>= 0;

	  if (this === target) return 0;

	  let x = thisEnd - thisStart;
	  let y = end - start;
	  const len = Math.min(x, y);

	  const thisCopy = this.slice(thisStart, thisEnd);
	  const targetCopy = target.slice(start, end);

	  for (let i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i];
	      y = targetCopy[i];
	      break;
	    }
	  }

	  if (x < y) return -1;
	  if (y < x) return 1;
	  return 0;
	};

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf(buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1;

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset;
	    byteOffset = 0;
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff;
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000;
	  }
	  byteOffset = +byteOffset; // Coerce to Number.
	  if (numberIsNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : buffer.length - 1;
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1;
	    else byteOffset = buffer.length - 1;
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0;
	    else return -1;
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding);
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (Buffer.isBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1;
	    }
	    return arrayIndexOf(buffer, val, byteOffset, encoding, dir);
	  } else if (typeof val === 'number') {
	    val = val & 0xff; // Search for a byte value [0-255]
	    if (typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset);
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset);
	      }
	    }
	    return arrayIndexOf(buffer, [val], byteOffset, encoding, dir);
	  }

	  throw new TypeError('val must be string, number or Buffer');
	}

	function arrayIndexOf(arr, val, byteOffset, encoding, dir) {
	  let indexSize = 1;
	  let arrLength = arr.length;
	  let valLength = val.length;

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase();
	    if (
	      encoding === 'ucs2' ||
	      encoding === 'ucs-2' ||
	      encoding === 'utf16le' ||
	      encoding === 'utf-16le'
	    ) {
	      if (arr.length < 2 || val.length < 2) {
	        return -1;
	      }
	      indexSize = 2;
	      arrLength /= 2;
	      valLength /= 2;
	      byteOffset /= 2;
	    }
	  }

	  function read(buf, i) {
	    if (indexSize === 1) {
	      return buf[i];
	    } else {
	      return buf.readUInt16BE(i * indexSize);
	    }
	  }

	  let i;
	  if (dir) {
	    let foundIndex = -1;
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i;
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize;
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex;
	        foundIndex = -1;
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	    for (i = byteOffset; i >= 0; i--) {
	      let found = true;
	      for (let j = 0; j < valLength; j++) {
	        if (read(arr, i + j) !== read(val, j)) {
	          found = false;
	          break;
	        }
	      }
	      if (found) return i;
	    }
	  }

	  return -1;
	}

	Buffer.prototype.includes = function includes(val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1;
	};

	Buffer.prototype.indexOf = function indexOf(val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true);
	};

	Buffer.prototype.lastIndexOf = function lastIndexOf(val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false);
	};

	function hexWrite(buf, string, offset, length) {
	  offset = Number(offset) || 0;
	  const remaining = buf.length - offset;
	  if (!length) {
	    length = remaining;
	  } else {
	    length = Number(length);
	    if (length > remaining) {
	      length = remaining;
	    }
	  }

	  const strLen = string.length;

	  if (length > strLen / 2) {
	    length = strLen / 2;
	  }
	  let i;
	  for (i = 0; i < length; ++i) {
	    const parsed = parseInt(string.substr(i * 2, 2), 16);
	    if (numberIsNaN(parsed)) return i;
	    buf[offset + i] = parsed;
	  }
	  return i;
	}

	function utf8Write(buf, string, offset, length) {
	  return blitBuffer(
	    utf8ToBytes(string, buf.length - offset),
	    buf,
	    offset,
	    length
	  );
	}

	function asciiWrite(buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length);
	}

	function base64Write(buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length);
	}

	function ucs2Write(buf, string, offset, length) {
	  return blitBuffer(
	    utf16leToBytes(string, buf.length - offset),
	    buf,
	    offset,
	    length
	  );
	}

	Buffer.prototype.write = function write(string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8';
	    length = this.length;
	    offset = 0;
	    // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset;
	    length = this.length;
	    offset = 0;
	    // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset >>> 0;
	    if (isFinite(length)) {
	      length = length >>> 0;
	      if (encoding === undefined) encoding = 'utf8';
	    } else {
	      encoding = length;
	      length = undefined;
	    }
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    );
	  }
	  const remaining = this.length - offset;
	  if (length === undefined || length > remaining) length = remaining;
	  if (
	    (string.length > 0 && (length < 0 || offset < 0)) ||
	    offset > this.length
	  ) {
	    throw new RangeError('Attempt to write outside buffer bounds');
	  }

	  if (!encoding) encoding = 'utf8';

	  let loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length);

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length);

	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return asciiWrite(this, string, offset, length);

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length);

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length);

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding);
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	};

	Buffer.prototype.toJSON = function toJSON() {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0),
	  };
	};

	function base64Slice(buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return base64.fromByteArray(buf);
	  } else {
	    return base64.fromByteArray(buf.slice(start, end));
	  }
	}

	function utf8Slice(buf, start, end) {
	  end = Math.min(buf.length, end);
	  const res = [];

	  let i = start;
	  while (i < end) {
	    const firstByte = buf[i];
	    let codePoint = null;
	    let bytesPerSequence =
	      firstByte > 0xef ? 4 : firstByte > 0xdf ? 3 : firstByte > 0xbf ? 2 : 1;

	    if (i + bytesPerSequence <= end) {
	      let secondByte, thirdByte, fourthByte, tempCodePoint;

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte;
	          }
	          break;
	        case 2:
	          secondByte = buf[i + 1];
	          if ((secondByte & 0xc0) === 0x80) {
	            tempCodePoint = ((firstByte & 0x1f) << 0x6) | (secondByte & 0x3f);
	            if (tempCodePoint > 0x7f) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break;
	        case 3:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          if ((secondByte & 0xc0) === 0x80 && (thirdByte & 0xc0) === 0x80) {
	            tempCodePoint =
	              ((firstByte & 0xf) << 0xc) |
	              ((secondByte & 0x3f) << 0x6) |
	              (thirdByte & 0x3f);
	            if (
	              tempCodePoint > 0x7ff &&
	              (tempCodePoint < 0xd800 || tempCodePoint > 0xdfff)
	            ) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break;
	        case 4:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          fourthByte = buf[i + 3];
	          if (
	            (secondByte & 0xc0) === 0x80 &&
	            (thirdByte & 0xc0) === 0x80 &&
	            (fourthByte & 0xc0) === 0x80
	          ) {
	            tempCodePoint =
	              ((firstByte & 0xf) << 0x12) |
	              ((secondByte & 0x3f) << 0xc) |
	              ((thirdByte & 0x3f) << 0x6) |
	              (fourthByte & 0x3f);
	            if (tempCodePoint > 0xffff && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint;
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xfffd;
	      bytesPerSequence = 1;
	    } else if (codePoint > 0xffff) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000;
	      res.push(((codePoint >>> 10) & 0x3ff) | 0xd800);
	      codePoint = 0xdc00 | (codePoint & 0x3ff);
	    }

	    res.push(codePoint);
	    i += bytesPerSequence;
	  }

	  return decodeCodePointsArray(res);
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	const MAX_ARGUMENTS_LENGTH = 0x1000;

	function decodeCodePointsArray(codePoints) {
	  const len = codePoints.length;
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints); // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  let res = '';
	  let i = 0;
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, (i += MAX_ARGUMENTS_LENGTH))
	    );
	  }
	  return res;
	}

	function asciiSlice(buf, start, end) {
	  let ret = '';
	  end = Math.min(buf.length, end);

	  for (let i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7f);
	  }
	  return ret;
	}

	function latin1Slice(buf, start, end) {
	  let ret = '';
	  end = Math.min(buf.length, end);

	  for (let i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i]);
	  }
	  return ret;
	}

	function hexSlice(buf, start, end) {
	  const len = buf.length;

	  if (!start || start < 0) start = 0;
	  if (!end || end < 0 || end > len) end = len;

	  let out = '';
	  for (let i = start; i < end; ++i) {
	    out += hexSliceLookupTable[buf[i]];
	  }
	  return out;
	}

	function utf16leSlice(buf, start, end) {
	  const bytes = buf.slice(start, end);
	  let res = '';
	  // If bytes.length is odd, the last 8 bits must be ignored (same as node.js)
	  for (let i = 0; i < bytes.length - 1; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	  }
	  return res;
	}

	Buffer.prototype.slice = function slice(start, end) {
	  const len = this.length;
	  start = ~~start;
	  end = end === undefined ? len : ~~end;

	  if (start < 0) {
	    start += len;
	    if (start < 0) start = 0;
	  } else if (start > len) {
	    start = len;
	  }

	  if (end < 0) {
	    end += len;
	    if (end < 0) end = 0;
	  } else if (end > len) {
	    end = len;
	  }

	  if (end < start) end = start;
	  const newBuf = this.subarray(start, end);
	  // Return an augmented `Uint8Array` instance
	  Object.setPrototypeOf(newBuf, Buffer.prototype);

	  return newBuf;
	};

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset(offset, ext, length) {
	  if (offset % 1 !== 0 || offset < 0)
	    throw new RangeError('offset is not uint');
	  if (offset + ext > length)
	    throw new RangeError('Trying to access beyond buffer length');
	}

	Buffer.prototype.readUintLE = Buffer.prototype.readUIntLE = function readUIntLE(
	  offset,
	  byteLength,
	  noAssert
	) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  let val = this[offset];
	  let mul = 1;
	  let i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }

	  return val;
	};

	Buffer.prototype.readUintBE = Buffer.prototype.readUIntBE = function readUIntBE(
	  offset,
	  byteLength,
	  noAssert
	) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length);
	  }

	  let val = this[offset + --byteLength];
	  let mul = 1;
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul;
	  }

	  return val;
	};

	Buffer.prototype.readUint8 = Buffer.prototype.readUInt8 = function readUInt8(
	  offset,
	  noAssert
	) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  return this[offset];
	};

	Buffer.prototype.readUint16LE = Buffer.prototype.readUInt16LE =
	  function readUInt16LE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 2, this.length);
	    return this[offset] | (this[offset + 1] << 8);
	  };

	Buffer.prototype.readUint16BE = Buffer.prototype.readUInt16BE =
	  function readUInt16BE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 2, this.length);
	    return (this[offset] << 8) | this[offset + 1];
	  };

	Buffer.prototype.readUint32LE = Buffer.prototype.readUInt32LE =
	  function readUInt32LE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);

	    return (
	      (this[offset] | (this[offset + 1] << 8) | (this[offset + 2] << 16)) +
	      this[offset + 3] * 0x1000000
	    );
	  };

	Buffer.prototype.readUint32BE = Buffer.prototype.readUInt32BE =
	  function readUInt32BE(offset, noAssert) {
	    offset = offset >>> 0;
	    if (!noAssert) checkOffset(offset, 4, this.length);

	    return (
	      this[offset] * 0x1000000 +
	      ((this[offset + 1] << 16) | (this[offset + 2] << 8) | this[offset + 3])
	    );
	  };

	Buffer.prototype.readBigUInt64LE = defineBigIntMethod(function readBigUInt64LE(
	  offset
	) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const lo =
	    first +
	    this[++offset] * 2 ** 8 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 24;

	  const hi =
	    this[++offset] +
	    this[++offset] * 2 ** 8 +
	    this[++offset] * 2 ** 16 +
	    last * 2 ** 24;

	  return BigInt(lo) + (BigInt(hi) << BigInt(32));
	});

	Buffer.prototype.readBigUInt64BE = defineBigIntMethod(function readBigUInt64BE(
	  offset
	) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const hi =
	    first * 2 ** 24 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    this[++offset];

	  const lo =
	    this[++offset] * 2 ** 24 +
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    last;

	  return (BigInt(hi) << BigInt(32)) + BigInt(lo);
	});

	Buffer.prototype.readIntLE = function readIntLE(offset, byteLength, noAssert) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  let val = this[offset];
	  let mul = 1;
	  let i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val;
	};

	Buffer.prototype.readIntBE = function readIntBE(offset, byteLength, noAssert) {
	  offset = offset >>> 0;
	  byteLength = byteLength >>> 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  let i = byteLength;
	  let mul = 1;
	  let val = this[offset + --i];
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val;
	};

	Buffer.prototype.readInt8 = function readInt8(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  if (!(this[offset] & 0x80)) return this[offset];
	  return (0xff - this[offset] + 1) * -1;
	};

	Buffer.prototype.readInt16LE = function readInt16LE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  const val = this[offset] | (this[offset + 1] << 8);
	  return val & 0x8000 ? val | 0xffff0000 : val;
	};

	Buffer.prototype.readInt16BE = function readInt16BE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  const val = this[offset + 1] | (this[offset] << 8);
	  return val & 0x8000 ? val | 0xffff0000 : val;
	};

	Buffer.prototype.readInt32LE = function readInt32LE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (
	    this[offset] |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	  );
	};

	Buffer.prototype.readInt32BE = function readInt32BE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (
	    (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3]
	  );
	};

	Buffer.prototype.readBigInt64LE = defineBigIntMethod(function readBigInt64LE(
	  offset
	) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const val =
	    this[offset + 4] +
	    this[offset + 5] * 2 ** 8 +
	    this[offset + 6] * 2 ** 16 +
	    (last << 24); // Overflow

	  return (
	    (BigInt(val) << BigInt(32)) +
	    BigInt(
	      first +
	        this[++offset] * 2 ** 8 +
	        this[++offset] * 2 ** 16 +
	        this[++offset] * 2 ** 24
	    )
	  );
	});

	Buffer.prototype.readBigInt64BE = defineBigIntMethod(function readBigInt64BE(
	  offset
	) {
	  offset = offset >>> 0;
	  validateNumber(offset, 'offset');
	  const first = this[offset];
	  const last = this[offset + 7];
	  if (first === undefined || last === undefined) {
	    boundsError(offset, this.length - 8);
	  }

	  const val =
	    (first << 24) + // Overflow
	    this[++offset] * 2 ** 16 +
	    this[++offset] * 2 ** 8 +
	    this[++offset];

	  return (
	    (BigInt(val) << BigInt(32)) +
	    BigInt(
	      this[++offset] * 2 ** 24 +
	        this[++offset] * 2 ** 16 +
	        this[++offset] * 2 ** 8 +
	        last
	    )
	  );
	});

	Buffer.prototype.readFloatLE = function readFloatLE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return ieee754$1.read(this, offset, true, 23, 4);
	};

	Buffer.prototype.readFloatBE = function readFloatBE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return ieee754$1.read(this, offset, false, 23, 4);
	};

	Buffer.prototype.readDoubleLE = function readDoubleLE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return ieee754$1.read(this, offset, true, 52, 8);
	};

	Buffer.prototype.readDoubleBE = function readDoubleBE(offset, noAssert) {
	  offset = offset >>> 0;
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return ieee754$1.read(this, offset, false, 52, 8);
	};

	function checkInt(buf, value, offset, ext, max, min) {
	  if (!Buffer.isBuffer(buf))
	    throw new TypeError('"buffer" argument must be a Buffer instance');
	  if (value > max || value < min)
	    throw new RangeError('"value" argument is out of bounds');
	  if (offset + ext > buf.length) throw new RangeError('Index out of range');
	}

	Buffer.prototype.writeUintLE = Buffer.prototype.writeUIntLE =
	  function writeUIntLE(value, offset, byteLength, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) {
	      const maxBytes = Math.pow(2, 8 * byteLength) - 1;
	      checkInt(this, value, offset, byteLength, maxBytes, 0);
	    }

	    let mul = 1;
	    let i = 0;
	    this[offset] = value & 0xff;
	    while (++i < byteLength && (mul *= 0x100)) {
	      this[offset + i] = (value / mul) & 0xff;
	    }

	    return offset + byteLength;
	  };

	Buffer.prototype.writeUintBE = Buffer.prototype.writeUIntBE =
	  function writeUIntBE(value, offset, byteLength, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    byteLength = byteLength >>> 0;
	    if (!noAssert) {
	      const maxBytes = Math.pow(2, 8 * byteLength) - 1;
	      checkInt(this, value, offset, byteLength, maxBytes, 0);
	    }

	    let i = byteLength - 1;
	    let mul = 1;
	    this[offset + i] = value & 0xff;
	    while (--i >= 0 && (mul *= 0x100)) {
	      this[offset + i] = (value / mul) & 0xff;
	    }

	    return offset + byteLength;
	  };

	Buffer.prototype.writeUint8 = Buffer.prototype.writeUInt8 = function writeUInt8(
	  value,
	  offset,
	  noAssert
	) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	  this[offset] = value & 0xff;
	  return offset + 1;
	};

	Buffer.prototype.writeUint16LE = Buffer.prototype.writeUInt16LE =
	  function writeUInt16LE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	    this[offset] = value & 0xff;
	    this[offset + 1] = value >>> 8;
	    return offset + 2;
	  };

	Buffer.prototype.writeUint16BE = Buffer.prototype.writeUInt16BE =
	  function writeUInt16BE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	    this[offset] = value >>> 8;
	    this[offset + 1] = value & 0xff;
	    return offset + 2;
	  };

	Buffer.prototype.writeUint32LE = Buffer.prototype.writeUInt32LE =
	  function writeUInt32LE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	    this[offset + 3] = value >>> 24;
	    this[offset + 2] = value >>> 16;
	    this[offset + 1] = value >>> 8;
	    this[offset] = value & 0xff;
	    return offset + 4;
	  };

	Buffer.prototype.writeUint32BE = Buffer.prototype.writeUInt32BE =
	  function writeUInt32BE(value, offset, noAssert) {
	    value = +value;
	    offset = offset >>> 0;
	    if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	    this[offset] = value >>> 24;
	    this[offset + 1] = value >>> 16;
	    this[offset + 2] = value >>> 8;
	    this[offset + 3] = value & 0xff;
	    return offset + 4;
	  };

	function wrtBigUInt64LE(buf, value, offset, min, max) {
	  checkIntBI(value, min, max, buf, offset, 7);

	  let lo = Number(value & BigInt(0xffffffff));
	  buf[offset++] = lo;
	  lo = lo >> 8;
	  buf[offset++] = lo;
	  lo = lo >> 8;
	  buf[offset++] = lo;
	  lo = lo >> 8;
	  buf[offset++] = lo;
	  let hi = Number((value >> BigInt(32)) & BigInt(0xffffffff));
	  buf[offset++] = hi;
	  hi = hi >> 8;
	  buf[offset++] = hi;
	  hi = hi >> 8;
	  buf[offset++] = hi;
	  hi = hi >> 8;
	  buf[offset++] = hi;
	  return offset;
	}

	function wrtBigUInt64BE(buf, value, offset, min, max) {
	  checkIntBI(value, min, max, buf, offset, 7);

	  let lo = Number(value & BigInt(0xffffffff));
	  buf[offset + 7] = lo;
	  lo = lo >> 8;
	  buf[offset + 6] = lo;
	  lo = lo >> 8;
	  buf[offset + 5] = lo;
	  lo = lo >> 8;
	  buf[offset + 4] = lo;
	  let hi = Number((value >> BigInt(32)) & BigInt(0xffffffff));
	  buf[offset + 3] = hi;
	  hi = hi >> 8;
	  buf[offset + 2] = hi;
	  hi = hi >> 8;
	  buf[offset + 1] = hi;
	  hi = hi >> 8;
	  buf[offset] = hi;
	  return offset + 8;
	}

	Buffer.prototype.writeBigUInt64LE = defineBigIntMethod(
	  function writeBigUInt64LE(value, offset = 0) {
	    return wrtBigUInt64LE(
	      this,
	      value,
	      offset,
	      BigInt(0),
	      BigInt('0xffffffffffffffff')
	    );
	  }
	);

	Buffer.prototype.writeBigUInt64BE = defineBigIntMethod(
	  function writeBigUInt64BE(value, offset = 0) {
	    return wrtBigUInt64BE(
	      this,
	      value,
	      offset,
	      BigInt(0),
	      BigInt('0xffffffffffffffff')
	    );
	  }
	);

	Buffer.prototype.writeIntLE = function writeIntLE(
	  value,
	  offset,
	  byteLength,
	  noAssert
	) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    const limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  let i = 0;
	  let mul = 1;
	  let sub = 0;
	  this[offset] = value & 0xff;
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
	  }

	  return offset + byteLength;
	};

	Buffer.prototype.writeIntBE = function writeIntBE(
	  value,
	  offset,
	  byteLength,
	  noAssert
	) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    const limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  let i = byteLength - 1;
	  let mul = 1;
	  let sub = 0;
	  this[offset + i] = value & 0xff;
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = (((value / mul) >> 0) - sub) & 0xff;
	  }

	  return offset + byteLength;
	};

	Buffer.prototype.writeInt8 = function writeInt8(value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
	  if (value < 0) value = 0xff + value + 1;
	  this[offset] = value & 0xff;
	  return offset + 1;
	};

	Buffer.prototype.writeInt16LE = function writeInt16LE(value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  this[offset] = value & 0xff;
	  this[offset + 1] = value >>> 8;
	  return offset + 2;
	};

	Buffer.prototype.writeInt16BE = function writeInt16BE(value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  this[offset] = value >>> 8;
	  this[offset + 1] = value & 0xff;
	  return offset + 2;
	};

	Buffer.prototype.writeInt32LE = function writeInt32LE(value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  this[offset] = value & 0xff;
	  this[offset + 1] = value >>> 8;
	  this[offset + 2] = value >>> 16;
	  this[offset + 3] = value >>> 24;
	  return offset + 4;
	};

	Buffer.prototype.writeInt32BE = function writeInt32BE(value, offset, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (value < 0) value = 0xffffffff + value + 1;
	  this[offset] = value >>> 24;
	  this[offset + 1] = value >>> 16;
	  this[offset + 2] = value >>> 8;
	  this[offset + 3] = value & 0xff;
	  return offset + 4;
	};

	Buffer.prototype.writeBigInt64LE = defineBigIntMethod(function writeBigInt64LE(
	  value,
	  offset = 0
	) {
	  return wrtBigUInt64LE(
	    this,
	    value,
	    offset,
	    -BigInt('0x8000000000000000'),
	    BigInt('0x7fffffffffffffff')
	  );
	});

	Buffer.prototype.writeBigInt64BE = defineBigIntMethod(function writeBigInt64BE(
	  value,
	  offset = 0
	) {
	  return wrtBigUInt64BE(
	    this,
	    value,
	    offset,
	    -BigInt('0x8000000000000000'),
	    BigInt('0x7fffffffffffffff')
	  );
	});

	function checkIEEE754(buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range');
	  if (offset < 0) throw new RangeError('Index out of range');
	}

	function writeFloat(buf, value, offset, littleEndian, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    checkIEEE754(
	      buf,
	      value,
	      offset,
	      4);
	  }
	  ieee754$1.write(buf, value, offset, littleEndian, 23, 4);
	  return offset + 4;
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE(value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert);
	};

	Buffer.prototype.writeFloatBE = function writeFloatBE(value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert);
	};

	function writeDouble(buf, value, offset, littleEndian, noAssert) {
	  value = +value;
	  offset = offset >>> 0;
	  if (!noAssert) {
	    checkIEEE754(
	      buf,
	      value,
	      offset,
	      8);
	  }
	  ieee754$1.write(buf, value, offset, littleEndian, 52, 8);
	  return offset + 8;
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE(
	  value,
	  offset,
	  noAssert
	) {
	  return writeDouble(this, value, offset, true, noAssert);
	};

	Buffer.prototype.writeDoubleBE = function writeDoubleBE(
	  value,
	  offset,
	  noAssert
	) {
	  return writeDouble(this, value, offset, false, noAssert);
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy(target, targetStart, start, end) {
	  if (!Buffer.isBuffer(target))
	    throw new TypeError('argument should be a Buffer');
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (targetStart >= target.length) targetStart = target.length;
	  if (!targetStart) targetStart = 0;
	  if (end > 0 && end < start) end = start;

	  // Copy 0 bytes; we're done
	  if (end === start) return 0;
	  if (target.length === 0 || this.length === 0) return 0;

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds');
	  }
	  if (start < 0 || start >= this.length)
	    throw new RangeError('Index out of range');
	  if (end < 0) throw new RangeError('sourceEnd out of bounds');

	  // Are we oob?
	  if (end > this.length) end = this.length;
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start;
	  }

	  const len = end - start;

	  if (
	    this === target &&
	    typeof Uint8Array.prototype.copyWithin === 'function'
	  ) {
	    // Use built-in when available, missing from IE11
	    this.copyWithin(targetStart, start, end);
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, end),
	      targetStart
	    );
	  }

	  return len;
	};

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill(val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start;
	      start = 0;
	      end = this.length;
	    } else if (typeof end === 'string') {
	      encoding = end;
	      end = this.length;
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string');
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding);
	    }
	    if (val.length === 1) {
	      const code = val.charCodeAt(0);
	      if ((encoding === 'utf8' && code < 128) || encoding === 'latin1') {
	        // Fast path: If `val` fits into a single byte, use that numeric value.
	        val = code;
	      }
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255;
	  } else if (typeof val === 'boolean') {
	    val = Number(val);
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index');
	  }

	  if (end <= start) {
	    return this;
	  }

	  start = start >>> 0;
	  end = end === undefined ? this.length : end >>> 0;

	  if (!val) val = 0;

	  let i;
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val;
	    }
	  } else {
	    const bytes = Buffer.isBuffer(val) ? val : Buffer.from(val, encoding);
	    const len = bytes.length;
	    if (len === 0) {
	      throw new TypeError(
	        'The value "' + val + '" is invalid for argument "value"'
	      );
	    }
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len];
	    }
	  }

	  return this;
	};

	// CUSTOM ERRORS
	// =============

	// Simplified versions from Node, changed for Buffer-only usage
	const errors = {};
	function E(sym, getMessage, Base) {
	  errors[sym] = class NodeError extends Base {
	    constructor() {
	      super();

	      Object.defineProperty(this, 'message', {
	        value: getMessage.apply(this, arguments),
	        writable: true,
	        configurable: true,
	      });

	      // Add the error code to the name to include it in the stack trace.
	      this.name = `${this.name} [${sym}]`;
	      // Reset the name to the actual name.
	      delete this.name;
	    }

	    get code() {
	      return sym;
	    }

	    set code(value) {
	      Object.defineProperty(this, 'code', {
	        configurable: true,
	        enumerable: true,
	        value,
	        writable: true,
	      });
	    }

	    toString() {
	      return `${this.name} [${sym}]: ${this.message}`;
	    }
	  };
	}

	E(
	  'ERR_BUFFER_OUT_OF_BOUNDS',
	  function (name) {
	    if (name) {
	      return `${name} is outside of buffer bounds`;
	    }

	    return 'Attempt to access memory outside buffer bounds';
	  },
	  RangeError
	);
	E(
	  'ERR_INVALID_ARG_TYPE',
	  function (name, actual) {
	    return `The "${name}" argument must be of type number. Received type ${typeof actual}`;
	  },
	  TypeError
	);
	E(
	  'ERR_OUT_OF_RANGE',
	  function (str, range, input) {
	    let msg = `The value of "${str}" is out of range.`;
	    let received = input;
	    if (Number.isInteger(input) && Math.abs(input) > 2 ** 32) {
	      received = addNumericalSeparator(String(input));
	    } else if (typeof input === 'bigint') {
	      received = String(input);
	      if (
	        input > BigInt(2) ** BigInt(32) ||
	        input < -(BigInt(2) ** BigInt(32))
	      ) {
	        received = addNumericalSeparator(received);
	      }
	      received += 'n';
	    }
	    msg += ` It must be ${range}. Received ${received}`;
	    return msg;
	  },
	  RangeError
	);

	function addNumericalSeparator(val) {
	  let res = '';
	  let i = val.length;
	  const start = val[0] === '-' ? 1 : 0;
	  for (; i >= start + 4; i -= 3) {
	    res = `_${val.slice(i - 3, i)}${res}`;
	  }
	  return `${val.slice(0, i)}${res}`;
	}

	// CHECK FUNCTIONS
	// ===============

	function checkBounds(buf, offset, byteLength) {
	  validateNumber(offset, 'offset');
	  if (buf[offset] === undefined || buf[offset + byteLength] === undefined) {
	    boundsError(offset, buf.length - (byteLength + 1));
	  }
	}

	function checkIntBI(value, min, max, buf, offset, byteLength) {
	  if (value > max || value < min) {
	    const n = typeof min === 'bigint' ? 'n' : '';
	    let range;
	    if (byteLength > 3) {
	      if (min === 0 || min === BigInt(0)) {
	        range = `>= 0${n} and < 2${n} ** ${(byteLength + 1) * 8}${n}`;
	      } else {
	        range =
	          `>= -(2${n} ** ${(byteLength + 1) * 8 - 1}${n}) and < 2 ** ` +
	          `${(byteLength + 1) * 8 - 1}${n}`;
	      }
	    } else {
	      range = `>= ${min}${n} and <= ${max}${n}`;
	    }
	    throw new errors.ERR_OUT_OF_RANGE('value', range, value);
	  }
	  checkBounds(buf, offset, byteLength);
	}

	function validateNumber(value, name) {
	  if (typeof value !== 'number') {
	    throw new errors.ERR_INVALID_ARG_TYPE(name, 'number', value);
	  }
	}

	function boundsError(value, length, type) {
	  if (Math.floor(value) !== value) {
	    validateNumber(value, type);
	    throw new errors.ERR_OUT_OF_RANGE(type || 'offset', 'an integer', value);
	  }

	  if (length < 0) {
	    throw new errors.ERR_BUFFER_OUT_OF_BOUNDS();
	  }

	  throw new errors.ERR_OUT_OF_RANGE(
	    type || 'offset',
	    `>= ${type ? 1 : 0} and <= ${length}`,
	    value
	  );
	}

	// HELPER FUNCTIONS
	// ================

	const INVALID_BASE64_RE = /[^+/0-9A-Za-z-_]/g;

	function base64clean(str) {
	  // Node takes equal signs as end of the Base64 encoding
	  str = str.split('=')[0];
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = str.trim().replace(INVALID_BASE64_RE, '');
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return '';
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '=';
	  }
	  return str;
	}

	function utf8ToBytes(string, units) {
	  units = units || Infinity;
	  let codePoint;
	  const length = string.length;
	  let leadSurrogate = null;
	  const bytes = [];

	  for (let i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i);

	    // is surrogate component
	    if (codePoint > 0xd7ff && codePoint < 0xe000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xdbff) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
	          continue;
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
	          continue;
	        }

	        // valid lead
	        leadSurrogate = codePoint;

	        continue;
	      }

	      // 2 leads in a row
	      if (codePoint < 0xdc00) {
	        if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
	        leadSurrogate = codePoint;
	        continue;
	      }

	      // valid surrogate pair
	      codePoint =
	        (((leadSurrogate - 0xd800) << 10) | (codePoint - 0xdc00)) + 0x10000;
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xef, 0xbf, 0xbd);
	    }

	    leadSurrogate = null;

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break;
	      bytes.push(codePoint);
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break;
	      bytes.push((codePoint >> 0x6) | 0xc0, (codePoint & 0x3f) | 0x80);
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break;
	      bytes.push(
	        (codePoint >> 0xc) | 0xe0,
	        ((codePoint >> 0x6) & 0x3f) | 0x80,
	        (codePoint & 0x3f) | 0x80
	      );
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break;
	      bytes.push(
	        (codePoint >> 0x12) | 0xf0,
	        ((codePoint >> 0xc) & 0x3f) | 0x80,
	        ((codePoint >> 0x6) & 0x3f) | 0x80,
	        (codePoint & 0x3f) | 0x80
	      );
	    } else {
	      throw new Error('Invalid code point');
	    }
	  }

	  return bytes;
	}

	function asciiToBytes(str) {
	  const byteArray = [];
	  for (let i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xff);
	  }
	  return byteArray;
	}

	function utf16leToBytes(str, units) {
	  let c, hi, lo;
	  const byteArray = [];
	  for (let i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break;

	    c = str.charCodeAt(i);
	    hi = c >> 8;
	    lo = c % 256;
	    byteArray.push(lo);
	    byteArray.push(hi);
	  }

	  return byteArray;
	}

	function base64ToBytes(str) {
	  return base64.toByteArray(base64clean(str));
	}

	function blitBuffer(src, dst, offset, length) {
	  let i;
	  for (i = 0; i < length; ++i) {
	    if (i + offset >= dst.length || i >= src.length) break;
	    dst[i + offset] = src[i];
	  }
	  return i;
	}

	// ArrayBuffer or Uint8Array objects from other contexts (i.e. iframes) do not pass
	// the `instanceof` check but they should be treated as of that type.
	// See: https://github.com/feross/buffer/issues/166
	function isInstance(obj, type) {
	  return (
	    obj instanceof type ||
	    (obj != null &&
	      obj.constructor != null &&
	      obj.constructor.name != null &&
	      obj.constructor.name === type.name)
	  );
	}
	function numberIsNaN(obj) {
	  // For IE11 support
	  return obj !== obj; // eslint-disable-line no-self-compare
	}

	// Create lookup table for `toString('hex')`
	// See: https://github.com/feross/buffer/issues/219
	const hexSliceLookupTable = (function () {
	  const alphabet = '0123456789abcdef';
	  const table = new Array(256);
	  for (let i = 0; i < 16; ++i) {
	    const i16 = i * 16;
	    for (let j = 0; j < 16; ++j) {
	      table[i16 + j] = alphabet[i] + alphabet[j];
	    }
	  }
	  return table;
	})();

	// Return not function with Error if BigInt not supported
	function defineBigIntMethod(fn) {
	  return typeof BigInt === 'undefined' ? BufferBigIntNotDefined : fn;
	}

	function BufferBigIntNotDefined() {
	  throw new Error('BigInt not supported');
	}
} (buffer$1));

const Buffer = buffer$1.Buffer;

var buffer = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Buffer: Buffer
});

var rand = {};

rand.randomBytes =
  crypto.randomBytes ??
  function randomBytes(byteLength = 32) {
    return crypto.getRandomValues(new Uint8Array(byteLength));
  };

const crypto$1 = globalThis.crypto;
const subtle = crypto$1?.subtle;
function utf8ToBytes(str) {
    return new TextEncoder().encode(str);
}
function toBytes(data) {
    if (typeof data === 'string')
        data = utf8ToBytes(data);
    return data;
}
async function sha(algorithm, input) {
    const arrayBuffer = await subtle.digest(algorithm, toBytes(input));
    return new Uint8Array(arrayBuffer);
}
async function pbkdf2(hashAlgorithm, password, salt, iterations, byteLength) {
    const baseKey = await subtle.importKey('raw', toBytes(password), 'PBKDF2', false, ['deriveBits']);
    const arrayBuffer = await subtle.deriveBits({
        name: 'PBKDF2',
        hash: hashAlgorithm,
        salt: toBytes(salt),
        iterations,
    }, baseKey, byteLength * 8);
    return new Uint8Array(arrayBuffer);
}
const randomBytes = rand.randomBytes;

var crypto$2 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    pbkdf2: pbkdf2,
    randomBytes: randomBytes,
    sha: sha,
    toBytes: toBytes
});

var AddressType;
(function (AddressType) {
    AddressType["NATIVE_SEGWIT_P2WPKH"] = "Native Segwit P2WPKH";
    AddressType["NESTED_SEGWIT_P2SH_P2PKH"] = "Nested Segwit P2SH_P2PKH";
    AddressType["TAPROOT_P2TR"] = "Taproot P2TR";
    AddressType["LEGACY_P2PKH"] = "Legacy P2PKH";
})(AddressType || (AddressType = {}));
/** 生成助记词 */
const generateRandomMnemonic = async (length = 12, language = 'english') => {
    const { wordlists, bip39 } = await getBip39();
    const numWords = length;
    const strength = (numWords / 3) * 32;
    const byteArray = randomBytes(strength / 8);
    if (byteArray.length % 4 > 0) {
        throw ('Data length in bits should be divisible by 32, but it is not (' +
            byteArray.length +
            ' bytes = ' +
            byteArray.length * 8 +
            ' bits).');
    }
    const wordList = await wordlists.getWordList(language);
    const mnemonic = await bip39.generateMnemonic(strength, randomBytes, wordList);
    const seedBuff = await bip39.mnemonicToSeed(mnemonic);
    return {
        mnemonic,
        seedBuff,
    };
};
/**
 * 计算基于币种派生路径的地址
 * @param coinName
 * @param seed
 * @param index
 * @param purpose 正常现在都是使用44，但是bitcoin需要4种类型地址：44,49,84,86
 * @param externalOrInternal 固定0，但是bitcoin有区分外部跟内容（接收，找零）：0 外部，1 找零
 * @returns
 */
const calcForDerivationPath = async (coinName, seed, index = 0, purpose = 44, externalOrInternal = 0) => {
    const bitcoin = await getBitcoin();
    const networks = await getNetworks();
    const bip32 = await getBip32();
    const networkInfo = await networks.getCoin(coinName);
    let derivationPath = networkInfo.derivationPath;
    /// 由于derivationPath固定44，这里需要判断下
    if (purpose != 44) {
        derivationPath = derivationPath.replace('m/44', `m/${purpose}`);
    }
    if (externalOrInternal == 1) {
        derivationPath = derivationPath.replace(/.$/, String(externalOrInternal));
    }
    const bip32RootKey = bip32.fromSeed(Buffer.from(seed, 'hex'), networkInfo.network);
    const bip32ExtendedKey = calcBip32ExtendedKey(bip32RootKey, derivationPath);
    if (undefined == bip32ExtendedKey) {
        throw new Error(`derivationPath: ${derivationPath} not find bip32ExtendedKey.`);
    }
    const keyPair = bip32ExtendedKey.derive(index);
    let address = keyPair.toBase58();
    const hasPrivkey = !keyPair.isNeutered();
    let privkey = 'NA';
    if (hasPrivkey) {
        privkey = keyPair.toWIF();
    }
    let pubkey = keyPair.publicKey.toString('hex');
    // bitcoin
    if (networks.btc.isBitcoin(coinName)) {
        address = bitcoin.address.toBase58Check(keyPair.identifier, keyPair.network.pubKeyHash);
    }
    // Ethereum values are different
    if (networks.etc.isEthereum(coinName)) {
        const pubkeyBuffer = keyPair.publicKey;
        const ethUtil = await getEthereumUtil();
        const ethPubkey = await ethUtil.importPublic(pubkeyBuffer);
        const addressBuffer = await ethUtil.publicToAddress(ethPubkey);
        const hexAddress = ethUtil.addHexPrefix(addressBuffer.toString('hex'));
        const checksumAddress = await ethUtil.toChecksumAddress(hexAddress);
        address = ethUtil.addHexPrefix(checksumAddress);
        pubkey = ethUtil.addHexPrefix(pubkey);
        if (hasPrivkey) {
            privkey = ethUtil.bufferToHex(keyPair.privateKey);
        }
    }
    // TRX is different
    if (networks.tron.isTron(coinName)) {
        const ethUtil = await getEthereumUtil();
        const ecpair = await getEcpair();
        const ecPair = ecpair.fromPrivateKey(keyPair.privateKey, {
            network: networks.networks.bitcoin,
            compressed: false,
        });
        const pubkeyBuffer = ecPair.publicKey;
        const ethPubkey = await ethUtil.importPublic(pubkeyBuffer);
        const addressBuffer = await ethUtil.publicToAddress(ethPubkey);
        address = bitcoin.address.toBase58Check(addressBuffer, 0x41);
        if (hasPrivkey) {
            privkey = ecPair.privateKey.toString('hex');
        }
    }
    if (networks.rsk.isRsk(coinName)) {
        const pubkeyBuffer = keyPair.publicKey;
        const ethUtil = await getEthereumUtil();
        const ethPubkey = await ethUtil.importPublic(pubkeyBuffer);
        const addressBuffer = await ethUtil.publicToAddress(ethPubkey);
        var hexAddress = addressBuffer.toString('hex');
        // Use chainId based on selected network
        // Ref: https://developers.rsk.co/rsk/architecture/account-based/#chainid
        let chainId;
        switch (coinName) {
            case 'R-BTC - RSK':
                chainId = 30;
                break;
            case 'tR-BTC - RSK Testnet':
                chainId = 31;
                break;
        }
        const toChecksumAddressForRsk = (address, chainId) => {
            if (typeof address !== 'string') {
                throw new Error('address parameter should be a string.');
            }
            if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
                throw new Error('Given address is not a valid RSK address: ' + address);
            }
            const stripAddress = ethUtil.stripHexPrefix(address).toLowerCase();
            const prefix = chainId != null ? chainId.toString() + '0x' : '';
            const keccakHash = ethUtil.keccakHex(prefix + stripAddress, 256);
            let checksumAddress = '0x';
            for (let i = 0; i < stripAddress.length; i++) {
                checksumAddress +=
                    parseInt(keccakHash[i], 16) >= 8
                        ? stripAddress[i].toUpperCase()
                        : stripAddress[i];
            }
            return checksumAddress;
        };
        var checksumAddress = toChecksumAddressForRsk(hexAddress, chainId);
        address = ethUtil.addHexPrefix(checksumAddress);
        pubkey = ethUtil.addHexPrefix(pubkey);
        if (hasPrivkey) {
            privkey = ethUtil.bufferToHex(keyPair.privateKey);
        }
    }
    // // RSK values are different
    // if (networkIsRsk(symbol)) {
    //   const pubkeyBuffer = keyPair.getPublicKeyBuffer();
    //   const ethPubkey = await ethUtil.importPublic(pubkeyBuffer);
    //   const addressBuffer = await ethUtil.publicToAddress(ethPubkey);
    //   const hexAddress = addressBuffer.toString("hex");
    //   // Use chainId based on selected network
    //   // Ref: https://developers.rsk.co/rsk/architecture/account-based/#chainid
    //   let chainId;
    //   const rskNetworkName = networkInfo.name;
    //   switch (rskNetworkName) {
    //     case "R-BTC - RSK":
    //       chainId = 30;
    //       break;
    //     case "tR-BTC - RSK Testnet":
    //       chainId = 31;
    //       break;
    //     default:
    //       chainId = null;
    //   }
    //   const checksumAddress = await toChecksumAddressForRsk(hexAddress, chainId);
    //   address = ethUtil.addHexPrefix(checksumAddress);
    //   pubkey = ethUtil.addHexPrefix(pubkey);
    //   if (hasPrivkey) {
    //     privkey = ethUtil.bufferToHex(keyPair.d.toBuffer());
    //   }
    // }
    // // Handshake values are different
    // if (networkInfo.name == "HNS - Handshake") {
    //   const ring = libs.handshake.KeyRing.fromPublic(
    //     keyPair.getPublicKeyBuffer()
    //   );
    //   address = ring.getAddress().toString();
    // }
    // // Stellar is different
    // if (networkInfo.name == "XLM - Stellar") {
    //   const keypair = libs.stellarUtil.getKeypair(derivationPath, seed);
    //   privkey = keypair.secret();
    //   pubkey = address = keypair.publicKey();
    // }
    // if (networkInfo.name == "NAS - Nebulas") {
    //   const privKeyBuffer = keyPair.d.toBuffer(32);
    //   const nebulasAccount = libs.nebulas.Account.NewAccount();
    //   nebulasAccount.setPrivateKey(privKeyBuffer);
    //   address = nebulasAccount.getAddressString();
    //   privkey = nebulasAccount.getPrivateKeyString();
    //   pubkey = nebulasAccount.getPublicKeyString();
    // }
    // // Ripple values are different
    // if (networkInfo.name == "XRP - Ripple") {
    //   privkey = await convertRipplePriv(privkey);
    //   address = await convertRippleAdrr(address);
    // }
    // // Bitcoin Cash address format may vary
    // if (networkInfo.name == "BCH - Bitcoin Cash") {
    //   const bchAddrType = "need input bitcoinCashAddressType" as string;
    //   if (bchAddrType == "cashaddr") {
    //     address = libs.bchaddr.toCashAddress(address);
    //   } else if (bchAddrType == "bitpay") {
    //     address = libs.bchaddr.toBitpayAddress(address);
    //   }
    // }
    // // Bitcoin Cash address format may vary
    // if (networkInfo.name == "SLP - Simple Ledger Protocol") {
    //   const bchAddrType = "need input bitcoinCashAddressType" as string;
    //   if (bchAddrType == "cashaddr") {
    //     address = libs.bchaddrSlp.toSlpAddress(address);
    //   }
    // }
    // // ZooBC address format may vary
    // if (networkInfo.name == "ZBC - ZooBlockchain") {
    //   const result = libs.zoobcUtil.getKeypair(derivationPath, seed);
    //   const publicKey = result.pubKey.slice(1, 33);
    //   const privateKey = result.key;
    //   privkey = privateKey.toString("hex");
    //   pubkey = publicKey.toString("hex");
    //   address = libs.zoobcUtil.getZBCAddress(publicKey, "ZBC");
    // }
    /// 判断地址类型
    const purposeTypeAddress = await checkPurposeTypeAddressFromPublicKey(keyPair.publicKey, coinName, purpose);
    if (purposeTypeAddress) {
        address = purposeTypeAddress;
    }
    return {
        privkey,
        pubkey,
        address,
    };
};
function calcBip32ExtendedKey(bip32RootKey, path) {
    const pathBits = path.split('/');
    for (let i = 0; i < pathBits.length; i++) {
        const bit = pathBits[i];
        const index = parseInt(bit);
        if (isNaN(index)) {
            continue;
        }
        const hardened = bit[bit.length - 1] == "'";
        const isPriv = !bip32RootKey.isNeutered();
        const invalidDerivationPath = hardened && !isPriv;
        if (invalidDerivationPath) {
            return null;
        }
        else if (hardened) {
            bip32RootKey = bip32RootKey.deriveHardened(index);
        }
        else {
            bip32RootKey = bip32RootKey.derive(index);
        }
    }
    return bip32RootKey;
}
/**寻找错误 */
const findPhraseErrors = async (phrase, language) => {
    const { bip39, wordlists } = await getBip39();
    const words = phraseToWordArray(bip39.normalize(phrase));
    // Detect blank phrase
    if (words.length == 0) {
        return 'Blank mnemonic';
    }
    if (language === undefined) {
        language =
            wordlists.getDefaultWordlist()?.language ??
                (await getLanguageFromWords(words));
    }
    if (language === undefined) {
        return 'Cannot be matched to any language';
    }
    const wordlist = await wordlists.getWordList(language);
    const wordset = new Set(wordlist);
    // Check each word
    for (const word of words) {
        if (wordset.has(word) === false) {
            console.log('Finding closest match to ' + word);
            const nearestWord = await _findNearestWord(word, wordlist);
            return word + ' not in wordlist, did you mean ' + nearestWord + '?';
        }
    }
    if (bip39.validateMnemonic(phrase, wordlist) === false) {
        return 'Invalid mnemonic';
    }
};
const _findNearestWord = async (word, wordlist) => {
    const { closest } = await import('./index-979c2f07.mjs');
    return closest(word, wordlist);
};
/**寻找最接近的单词 */
const findNearestWord = async (word, language) => {
    const { wordlists } = await getBip39();
    return await _findNearestWord(word, await wordlists.getWordList(language));
};
const phraseToWordArray = (phrase) => {
    return phrase.trim().split(/\s+/);
};
const wordArrayToPhrase = async (words, language) => {
    let sep = ' ';
    if (language === undefined) {
        language = await getLanguageFromWords(words);
    }
    if (language === 'japanese') {
        sep = '\u3000';
    }
    return words.join(sep);
};
const getLanguageFromPhrase = async (phrase) => {
    // Check if how many words from existing phrase match a language.
    return getLanguagesFromWord(phrase.match(/[^\s\n]+/)?.[0]);
};
const getLanguageFromWords = async (words) => {
    const wordsLength = words.length;
    const recordLangs = [];
    for (const word of words) {
        const langs = await getLanguagesFromWord(word);
        if (langs !== undefined) {
            recordLangs.push(...langs);
        }
    }
    const langOccurrence_Map = new Map();
    recordLangs.forEach((lang) => {
        const count = langOccurrence_Map.get(lang);
        langOccurrence_Map.set(lang, count ? count + 1 : 1);
    });
    for (const [lang, count] of langOccurrence_Map) {
        if (count === wordsLength) {
            return lang;
        }
    }
};
const getLanguagesFromWord = async (word) => {
    if (!word) {
        return;
    }
    const { wordlists } = await getBip39();
    const languages = [];
    for (const language of wordlists.ALL_LANGUAGE) {
        const wordlist = await wordlists.getWordList(language);
        if (wordlist.includes(word)) {
            languages.push(language);
        }
    }
    return languages;
};
/**
 * 根据私钥恢复bitcoin地址
 * 根据需求的函数，非bitcoinhs-lib内函数
 */
const getBitcoinAddressFromPrivateKey = async (wifString, coinName, purpose) => {
    const ecpairApi = await getEcpair();
    const networks = await getNetworks();
    const bitcoin = await getBitcoin();
    // bitcoin
    if (networks.btc.isBitcoin(coinName) === false) {
        throw new Error(`coinName:${coinName} is not bitoin.`);
    }
    const networkInfo = await networks.getCoin(coinName);
    const ecpair = ecpairApi.fromWIF(wifString, networkInfo.network); // 导入私钥
    let address = bitcoin.address.toBase58Check(bitcoin.crypto.hash160(ecpair.publicKey), ecpair.network.pubKeyHash);
    /// 判断地址类型
    const purposeTypeAddress = await checkPurposeTypeAddressFromPublicKey(ecpair.publicKey, coinName, purpose);
    if (purposeTypeAddress) {
        address = purposeTypeAddress;
    }
    return {
        privkey: wifString,
        pubkey: ecpair.publicKey.toString('hex'),
        address,
    };
};
/**
 * 校验协议地址
 */
const checkPurposeTypeAddressFromPublicKey = async (publicKey, coinName, purpose) => {
    const bitcoin = await getBitcoin();
    const ecc = await getTinySecp256k1();
    const networks = await getNetworks();
    const networkInfo = await networks.getCoin(coinName);
    const isSegwit = purpose === 49 || purpose === 84;
    let address = '';
    if (isSegwit) {
        /// 细分
        const isP2wpkhInP2sh = purpose === 49;
        const isP2wpkh = purpose === 84;
        if (isP2wpkhInP2sh) {
            const keyhash = bitcoin.crypto.hash160(publicKey);
            const scriptsig = bitcoin.script.compile([
                bitcoin.OPS.OP_0,
                Buffer.from(keyhash),
            ]);
            const addressbytes = bitcoin.crypto.hash160(scriptsig);
            const scriptpubkey = bitcoin.script.compile([
                bitcoin.OPS.OP_HASH160,
                addressbytes,
                bitcoin.OPS.OP_EQUAL,
            ]);
            address = bitcoin.address.fromOutputScript(Buffer.from(scriptpubkey), networkInfo.network);
        }
        else if (isP2wpkh) {
            const keyhash = bitcoin.crypto.hash160(publicKey);
            const scriptpubkey = bitcoin.script.compile([
                bitcoin.OPS.OP_0,
                Buffer.from(keyhash),
            ]);
            address = bitcoin.address.fromOutputScript(Buffer.from(scriptpubkey), networkInfo.network);
        }
    }
    else if (purpose === 86) {
        const createKeySpendOutput = (publicKey) => {
            // x-only pubkey (remove 1 byte y parity)
            const myXOnlyPubkey = publicKey.slice(1, 33);
            const commitHash = bitcoin.crypto.taggedHash('TapTweak', myXOnlyPubkey);
            const tweakResult = ecc.xOnlyPointAddTweak(myXOnlyPubkey, commitHash);
            if (tweakResult === null)
                throw new Error('Invalid Tweak');
            const { xOnlyPubkey: tweaked } = tweakResult;
            // scriptPubkey
            return Buffer.concat([
                // witness v1, PUSH_DATA 32 bytes
                Buffer.from([0x51, 0x20]),
                // x-only tweaked pubkey
                tweaked,
            ]);
        };
        const output = createKeySpendOutput(publicKey);
        address = bitcoin.address.fromOutputScript(Buffer.from(output), networkInfo.network);
    }
    return address;
};
/** 地址类型 */
const detectAddressType = (address) => {
    if (address.startsWith('tb1q') || address.startsWith('bc1q'))
        return AddressType.NATIVE_SEGWIT_P2WPKH;
    if (address.startsWith('tb1p') || address.startsWith('bc1p'))
        return AddressType.TAPROOT_P2TR;
    if (address.length > 34)
        return AddressType.NESTED_SEGWIT_P2SH_P2PKH;
    return AddressType.LEGACY_P2PKH;
};
/**
 * 创建bitcoin psbt格式的转账交易
 */
const createBitcoinPsbt = async (opts) => {
    const { coinName, privateKey, utxos, senderId, recipientId, amount, feeRate, } = opts;
    const bitcoin = await getBitcoin();
    const networks = await getNetworks();
    const ecpair = await getEcpair();
    const bip32 = await getBip32();
    const networkInfo = await networks.getCoin(coinName);
    const psbt = new bitcoin.psbt.Psbt({ network: networkInfo.network });
    const keyPair = ecpair.fromWIF(privateKey, networkInfo.network);
    const totalUnspent_BI = utxos.reduce((sum, { value }) => sum + BigInt(value), BigInt(0));
    let amount_BI = BigInt(amount);
    const remainBalance_BI = totalUnspent_BI - amount_BI;
    /// 判断下转出数量是否大于传入的utxos总和
    if (remainBalance_BI < BigInt(0)) {
        throw new Error(`Total less than amount: ${totalUnspent_BI.toString()} < ${amount_BI.toString()}`);
    }
    /// 每超出传入总和，开始塞入utxos
    psbt.addInputs(utxos.map((item) => {
        const input = { hash: item.txid, index: item.vout };
        const addressType = detectAddressType(senderId);
        if (addressType != AddressType.LEGACY_P2PKH) {
            const payment = (() => {
                return bitcoin.payments.p2wpkh({
                    pubkey: keyPair.publicKey,
                    network: networkInfo.network,
                });
            })();
            // Add witnessUtxo data
            input['witnessUtxo'] = { script: payment.output, value: +item.value };
            if (addressType == AddressType.TAPROOT_P2TR) {
                input['tapInternalKey'] = bip32.toXOnly(keyPair.publicKey);
            }
            if (addressType == AddressType.NESTED_SEGWIT_P2SH_P2PKH) {
                input['redeemScript'] = payment.redeem.output;
            }
        }
        else {
            input['nonWitnessUtxo'] = Buffer.from(item.txHex, 'hex');
        }
        return input;
    }));
    /// 计算本次手续费
    const finalFee_BI = (() => {
        const tPsbt = psbt.clone();
        tPsbt.addOutput({ address: recipientId, value: +amount_BI.toString() });
        tPsbt.addOutput({ address: senderId, value: +remainBalance_BI.toString() });
        tPsbt.signAllInputs(keyPair);
        tPsbt.finalizeAllInputs();
        const estTx = tPsbt.extractTransaction(true);
        const vBytes = estTx.virtualSize();
        return BigInt(vBytes) * BigInt(feeRate);
    })();
    /// 先判断 本次是否为全部转出
    const allSend = remainBalance_BI === BigInt(0);
    if (allSend) {
        /// 数量 - 手续费 就是 新的转移数量
        amount_BI = amount_BI - finalFee_BI;
    }
    else {
        /// 不是全部转的话，需要判断 手续费 + 转出 是否大于 输入
        if (totalUnspent_BI - amount_BI - finalFee_BI < BigInt(0)) {
            return {
                fee: finalFee_BI.toString(),
            };
        }
        /// 剩余数量返回回来
        psbt.addOutput({
            address: senderId,
            value: +(remainBalance_BI - finalFee_BI).toString(),
        });
    }
    /// 塞入本次要转移的人
    psbt.addOutput({ address: recipientId, value: +amount_BI.toString() });
    psbt.signAllInputs(keyPair);
    psbt.finalizeAllInputs();
    const tx = psbt.extractTransaction();
    return {
        fee: finalFee_BI.toString(),
        txHex: tx.toHex(),
    };
};

var wallet = /*#__PURE__*/Object.freeze({
    __proto__: null,
    get AddressType () { return AddressType; },
    Buffer: Buffer,
    calcForDerivationPath: calcForDerivationPath,
    createBitcoinPsbt: createBitcoinPsbt,
    detectAddressType: detectAddressType,
    findNearestWord: findNearestWord,
    findPhraseErrors: findPhraseErrors,
    generateRandomMnemonic: generateRandomMnemonic,
    getBitcoinAddressFromPrivateKey: getBitcoinAddressFromPrivateKey,
    getLanguageFromPhrase: getLanguageFromPhrase,
    getLanguageFromWords: getLanguageFromWords,
    getLanguagesFromWord: getLanguagesFromWord,
    phraseToWordArray: phraseToWordArray,
    randomBytes: randomBytes,
    wordArrayToPhrase: wordArrayToPhrase
});

const setup = cacheCall(async (options = {}) => {
    await setConfig(options);
    // 预加载
    if (options.preload && typeof requestIdleCallback === 'function') {
        const requestIdle = () => new Promise((cb) => requestIdleCallback(cb));
        const modules$1 = await Promise.resolve().then(function () { return modules; });
        for (const [name, prepareTask] of Object.entries(modules$1)) {
            if (typeof prepareTask === 'function' && name.startsWith('get')) {
                await requestIdle();
                await prepareTask();
            }
        }
    }
});

export { Buffer as B, cacheCall as a, buffer$1 as b, config as c, buffer as d, crypto$2 as e, modules as m, randomBytes as r, setup as s, wallet as w };
//# sourceMappingURL=index-62190cc8.mjs.map
