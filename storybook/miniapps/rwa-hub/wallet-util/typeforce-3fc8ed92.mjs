import { b as buffer } from './index-62190cc8.mjs';

var errors = {};

var types = {
  Array: function (value) {
    return value !== null && value !== undefined && value.constructor === Array;
  },
  Boolean: function (value) {
    return typeof value === 'boolean';
  },
  Function: function (value) {
    return typeof value === 'function';
  },
  Nil: function (value) {
    return value === undefined || value === null;
  },
  Number: function (value) {
    return typeof value === 'number';
  },
  Object: function (value) {
    return typeof value === 'object';
  },
  String: function (value) {
    return typeof value === 'string';
  },
  '': function () {
    return true;
  },
};

// TODO: deprecate
types.Null = types.Nil;

for (var typeName$1 in types) {
  types[typeName$1].toJSON = function (t) {
    return t;
  }.bind(null, typeName$1);
}

var native$1 = types;

var native = native$1;

function getTypeName(fn) {
  return fn.name || fn.toString().match(/function (.*?)\s*\(/)[1];
}

function getValueTypeName$1(value) {
  return native.Nil(value) ? '' : getTypeName(value.constructor);
}

function getValue(value) {
  if (native.Function(value)) return '';
  if (native.String(value)) return JSON.stringify(value);
  if (value && native.Object(value)) return '';
  return value;
}

function captureStackTrace(e, t) {
  if (Error.captureStackTrace) {
    Error.captureStackTrace(e, t);
  }
}

function tfJSON$1(type) {
  if (native.Function(type))
    return type.toJSON ? type.toJSON() : getTypeName(type);
  if (native.Array(type)) return 'Array';
  if (type && native.Object(type)) return 'Object';

  return type !== undefined ? type : '';
}

function tfErrorString(type, value, valueTypeName) {
  var valueJson = getValue(value);

  return (
    'Expected ' +
    tfJSON$1(type) +
    ', got' +
    (valueTypeName !== '' ? ' ' + valueTypeName : '') +
    (valueJson !== '' ? ' ' + valueJson : '')
  );
}

function TfTypeError$1(type, value, valueTypeName) {
  valueTypeName = valueTypeName || getValueTypeName$1(value);
  this.message = tfErrorString(type, value, valueTypeName);

  captureStackTrace(this, TfTypeError$1);
  this.__type = type;
  this.__value = value;
  this.__valueTypeName = valueTypeName;
}

TfTypeError$1.prototype = Object.create(Error.prototype);
TfTypeError$1.prototype.constructor = TfTypeError$1;

function tfPropertyErrorString(type, label, name, value, valueTypeName) {
  var description = '" of type ';
  if (label === 'key') description = '" with key type ';

  return tfErrorString(
    'property "' + tfJSON$1(name) + description + tfJSON$1(type),
    value,
    valueTypeName
  );
}

function TfPropertyTypeError$1(type, property, label, value, valueTypeName) {
  if (type) {
    valueTypeName = valueTypeName || getValueTypeName$1(value);
    this.message = tfPropertyErrorString(
      type,
      label,
      property,
      value,
      valueTypeName
    );
  } else {
    this.message = 'Unexpected property "' + property + '"';
  }

  captureStackTrace(this, TfTypeError$1);
  this.__label = label;
  this.__property = property;
  this.__type = type;
  this.__value = value;
  this.__valueTypeName = valueTypeName;
}

TfPropertyTypeError$1.prototype = Object.create(Error.prototype);
TfPropertyTypeError$1.prototype.constructor = TfTypeError$1;

function tfCustomError(expected, actual) {
  return new TfTypeError$1(expected, {}, actual);
}

function tfSubError$1(e, property, label) {
  // sub child?
  if (e instanceof TfPropertyTypeError$1) {
    property = property + '.' + e.__property;

    e = new TfPropertyTypeError$1(
      e.__type,
      property,
      e.__label,
      e.__value,
      e.__valueTypeName
    );

    // child?
  } else if (e instanceof TfTypeError$1) {
    e = new TfPropertyTypeError$1(
      e.__type,
      property,
      label,
      e.__value,
      e.__valueTypeName
    );
  }

  captureStackTrace(e);
  return e;
}

errors.TfTypeError = TfTypeError$1;
errors.TfPropertyTypeError = TfPropertyTypeError$1;
errors.tfCustomError = tfCustomError;
errors.tfSubError = tfSubError$1;
errors.tfJSON = tfJSON$1;
errors.getValueTypeName = getValueTypeName$1;

var extra;
var hasRequiredExtra;

function requireExtra () {
	if (hasRequiredExtra) return extra;
	hasRequiredExtra = 1;
	var NATIVE = native$1;
	var ERRORS = errors;
	var { Buffer } = buffer;

	function _Buffer(value) {
	  return Buffer.isBuffer(value);
	}

	function Hex(value) {
	  return typeof value === 'string' && /^([0-9a-f]{2})+$/i.test(value);
	}

	function _LengthN(type, length) {
	  var name = type.toJSON();

	  function Length(value) {
	    if (!type(value)) return false;
	    if (value.length === length) return true;

	    throw ERRORS.tfCustomError(
	      name + '(Length: ' + length + ')',
	      name + '(Length: ' + value.length + ')',
	    );
	  }
	  Length.toJSON = function () {
	    return name;
	  };

	  return Length;
	}

	var _ArrayN = _LengthN.bind(null, NATIVE.Array);
	var _BufferN = _LengthN.bind(null, _Buffer);
	var _HexN = _LengthN.bind(null, Hex);
	var _StringN = _LengthN.bind(null, NATIVE.String);

	function Range(a, b, f) {
	  f = f || NATIVE.Number;
	  function _range(value, strict) {
	    return f(value, strict) && value > a && value < b;
	  }
	  _range.toJSON = function () {
	    return `${f.toJSON()} between [${a}, ${b}]`;
	  };
	  return _range;
	}

	var INT53_MAX = Math.pow(2, 53) - 1;

	function Finite(value) {
	  return typeof value === 'number' && isFinite(value);
	}
	function Int8(value) {
	  return (value << 24) >> 24 === value;
	}
	function Int16(value) {
	  return (value << 16) >> 16 === value;
	}
	function Int32(value) {
	  return (value | 0) === value;
	}
	function Int53(value) {
	  return (
	    typeof value === 'number' &&
	    value >= -INT53_MAX &&
	    value <= INT53_MAX &&
	    Math.floor(value) === value
	  );
	}
	function UInt8(value) {
	  return (value & 0xff) === value;
	}
	function UInt16(value) {
	  return (value & 0xffff) === value;
	}
	function UInt32(value) {
	  return value >>> 0 === value;
	}
	function UInt53(value) {
	  return (
	    typeof value === 'number' &&
	    value >= 0 &&
	    value <= INT53_MAX &&
	    Math.floor(value) === value
	  );
	}

	var types = {
	  ArrayN: _ArrayN,
	  Buffer: _Buffer,
	  BufferN: _BufferN,
	  Finite: Finite,
	  Hex: Hex,
	  HexN: _HexN,
	  Int8: Int8,
	  Int16: Int16,
	  Int32: Int32,
	  Int53: Int53,
	  Range: Range,
	  StringN: _StringN,
	  UInt8: UInt8,
	  UInt16: UInt16,
	  UInt32: UInt32,
	  UInt53: UInt53,
	};

	for (var typeName in types) {
	  types[typeName].toJSON = function (t) {
	    return t;
	  }.bind(null, typeName);
	}

	extra = types;
	return extra;
}

var ERRORS = errors;
var NATIVE = native$1;

// short-hand
var tfJSON = ERRORS.tfJSON;
var TfTypeError = ERRORS.TfTypeError;
var TfPropertyTypeError = ERRORS.TfPropertyTypeError;
var tfSubError = ERRORS.tfSubError;
var getValueTypeName = ERRORS.getValueTypeName;

var TYPES = {
  arrayOf: function arrayOf(type, options) {
    type = compile(type);
    options = options || {};

    function _arrayOf(array, strict) {
      if (!NATIVE.Array(array)) return false;
      if (NATIVE.Nil(array)) return false;
      if (options.minLength !== undefined && array.length < options.minLength)
        return false;
      if (options.maxLength !== undefined && array.length > options.maxLength)
        return false;
      if (options.length !== undefined && array.length !== options.length)
        return false;

      return array.every(function (value, i) {
        try {
          return typeforce$1(type, value, strict);
        } catch (e) {
          throw tfSubError(e, i);
        }
      });
    }
    _arrayOf.toJSON = function () {
      var str = '[' + tfJSON(type) + ']';
      if (options.length !== undefined) {
        str += '{' + options.length + '}';
      } else if (
        options.minLength !== undefined ||
        options.maxLength !== undefined
      ) {
        str +=
          '{' +
          (options.minLength === undefined ? 0 : options.minLength) +
          ',' +
          (options.maxLength === undefined ? Infinity : options.maxLength) +
          '}';
      }
      return str;
    };

    return _arrayOf;
  },

  maybe: function maybe(type) {
    type = compile(type);

    function _maybe(value, strict) {
      return NATIVE.Nil(value) || type(value, strict, maybe);
    }
    _maybe.toJSON = function () {
      return '?' + tfJSON(type);
    };

    return _maybe;
  },

  map: function map(propertyType, propertyKeyType) {
    propertyType = compile(propertyType);
    if (propertyKeyType) propertyKeyType = compile(propertyKeyType);

    function _map(value, strict) {
      if (!NATIVE.Object(value)) return false;
      if (NATIVE.Nil(value)) return false;

      for (var propertyName in value) {
        try {
          if (propertyKeyType) {
            typeforce$1(propertyKeyType, propertyName, strict);
          }
        } catch (e) {
          throw tfSubError(e, propertyName, 'key');
        }

        try {
          var propertyValue = value[propertyName];
          typeforce$1(propertyType, propertyValue, strict);
        } catch (e) {
          throw tfSubError(e, propertyName);
        }
      }

      return true;
    }

    if (propertyKeyType) {
      _map.toJSON = function () {
        return (
          '{' + tfJSON(propertyKeyType) + ': ' + tfJSON(propertyType) + '}'
        );
      };
    } else {
      _map.toJSON = function () {
        return '{' + tfJSON(propertyType) + '}';
      };
    }

    return _map;
  },

  object: function object(uncompiled) {
    var type = {};

    for (var typePropertyName in uncompiled) {
      type[typePropertyName] = compile(uncompiled[typePropertyName]);
    }

    function _object(value, strict) {
      if (!NATIVE.Object(value)) return false;
      if (NATIVE.Nil(value)) return false;

      var propertyName;

      try {
        for (propertyName in type) {
          var propertyType = type[propertyName];
          var propertyValue = value[propertyName];

          typeforce$1(propertyType, propertyValue, strict);
        }
      } catch (e) {
        throw tfSubError(e, propertyName);
      }

      if (strict) {
        for (propertyName in value) {
          if (type[propertyName]) continue;

          throw new TfPropertyTypeError(undefined, propertyName);
        }
      }

      return true;
    }
    _object.toJSON = function () {
      return tfJSON(type);
    };

    return _object;
  },

  anyOf: function anyOf() {
    var types = [].slice.call(arguments).map(compile);

    function _anyOf(value, strict) {
      return types.some(function (type) {
        try {
          return typeforce$1(type, value, strict);
        } catch (e) {
          return false;
        }
      });
    }
    _anyOf.toJSON = function () {
      return types.map(tfJSON).join('|');
    };

    return _anyOf;
  },

  allOf: function allOf() {
    var types = [].slice.call(arguments).map(compile);

    function _allOf(value, strict) {
      return types.every(function (type) {
        try {
          return typeforce$1(type, value, strict);
        } catch (e) {
          return false;
        }
      });
    }
    _allOf.toJSON = function () {
      return types.map(tfJSON).join(' & ');
    };

    return _allOf;
  },

  quacksLike: function quacksLike(type) {
    function _quacksLike(value) {
      return type === getValueTypeName(value);
    }
    _quacksLike.toJSON = function () {
      return type;
    };

    return _quacksLike;
  },

  tuple: function tuple() {
    var types = [].slice.call(arguments).map(compile);

    function _tuple(values, strict) {
      if (NATIVE.Nil(values)) return false;
      if (NATIVE.Nil(values.length)) return false;
      if (strict && values.length !== types.length) return false;

      return types.every(function (type, i) {
        try {
          return typeforce$1(type, values[i], strict);
        } catch (e) {
          throw tfSubError(e, i);
        }
      });
    }
    _tuple.toJSON = function () {
      return '(' + types.map(tfJSON).join(', ') + ')';
    };

    return _tuple;
  },

  value: function value(expected) {
    function _value(actual) {
      return actual === expected;
    }
    _value.toJSON = function () {
      return expected;
    };

    return _value;
  },
};

// TODO: deprecate
TYPES.oneOf = TYPES.anyOf;

function compile(type) {
  if (NATIVE.String(type)) {
    if (type[0] === '?') return TYPES.maybe(type.slice(1));

    return NATIVE[type] || TYPES.quacksLike(type);
  } else if (type && NATIVE.Object(type)) {
    if (NATIVE.Array(type)) {
      if (type.length !== 1)
        throw new TypeError(
          'Expected compile() parameter of type Array of length 1'
        );
      return TYPES.arrayOf(type[0]);
    }

    return TYPES.object(type);
  } else if (NATIVE.Function(type)) {
    return type;
  }

  return TYPES.value(type);
}

function typeforce$1(type, value, strict, surrogate) {
  if (NATIVE.Function(type)) {
    if (type(value, strict)) return true;

    throw new TfTypeError(surrogate || type, value);
  }

  // JIT
  return typeforce$1(compile(type), value, strict);
}

// assign types to typeforce function
for (var typeName in NATIVE) {
  typeforce$1[typeName] = NATIVE[typeName];
}

for (typeName in TYPES) {
  typeforce$1[typeName] = TYPES[typeName];
}

var EXTRA = requireExtra();
for (typeName in EXTRA) {
  typeforce$1[typeName] = EXTRA[typeName];
}

typeforce$1.compile = compile;
typeforce$1.TfTypeError = TfTypeError;
typeforce$1.TfPropertyTypeError = TfPropertyTypeError;

var typeforce_1 = typeforce$1;

var typeforce_cjs = typeforce_1;

const typeforce = typeforce_cjs;

export { typeforce as t };
//# sourceMappingURL=typeforce-3fc8ed92.mjs.map
