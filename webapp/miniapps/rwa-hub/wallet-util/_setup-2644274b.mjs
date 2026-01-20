import { r as randomBytes, c as config, a as cacheCall } from './index-62190cc8.mjs';
import { t as throwError, i as init } from './index-20b88f48.mjs';

function get4RandomBytes() {
    return randomBytes(4);
}
// Only to be used to initialize the context for rust-secp256k1
function generateInt32() {
    const array = get4RandomBytes();
    return ((array[0] << (3 * 8)) +
        (array[1] << (2 * 8)) +
        (array[2] << (1 * 8)) +
        array[3]);
}

async function instantiateWasm() {
    const wasmUrl = `${config.wasmBaseUrl}/tiny-secp256k1/secp256k1.wasm`;
    const data = await config.wasmLoader(wasmUrl);
    const module = await WebAssembly.instantiate(data, {
        './validate_error.mjs': {
            throwError,
        },
        './rand.mjs': {
            generateInt32,
        },
    });
    return module.instance.exports;
}

const prepareTinySecp256k1 = cacheCall(async () => {
    init(await instantiateWasm());
});

export { prepareTinySecp256k1 };
//# sourceMappingURL=_setup-2644274b.mjs.map
