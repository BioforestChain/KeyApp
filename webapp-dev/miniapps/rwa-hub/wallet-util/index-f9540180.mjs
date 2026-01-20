import { b as bitcoin } from './networks-2c79a09f.mjs';
import { d as decompile, c as compile } from './script-1d075504.mjs';
import { p as prop } from './address-cd5fc561.mjs';
export { a as p2pkh, b as p2sh, e as p2tr, c as p2wpkh, d as p2wsh } from './address-cd5fc561.mjs';
import { t as typeforce } from './typeforce-3fc8ed92.mjs';
import { OPS as OPS$1 } from './ops-a3396647.mjs';
export { p as p2ms, a as p2pk } from './p2pk-a90b7d58.mjs';
import './index-62190cc8.mjs';
import './index-6252fd9f.mjs';
import './sha256-098a9414.mjs';
import './WASMInterface-e83e38e1.mjs';
import './crypto-1573ae3b.mjs';
import './ripemd160-eb7b517c.mjs';
import './sha1-d9a30eed.mjs';

const OPS = OPS$1;
function stacksEqual(a, b) {
    if (a.length !== b.length)
        return false;
    return a.every((x, i) => {
        return x.equals(b[i]);
    });
}
// output: OP_RETURN ...
function p2data(a, opts) {
    if (!a.data && !a.output)
        throw new TypeError('Not enough data');
    opts = Object.assign({ validate: true }, opts || {});
    typeforce({
        network: typeforce.maybe(typeforce.Object),
        output: typeforce.maybe(typeforce.Buffer),
        data: typeforce.maybe(typeforce.arrayOf(typeforce.Buffer)),
    }, a);
    const network = a.network || bitcoin;
    const o = { name: 'embed', network };
    prop(o, 'output', () => {
        if (!a.data)
            return;
        return compile([OPS.OP_RETURN].concat(a.data));
    });
    prop(o, 'data', () => {
        if (!a.output)
            return;
        return decompile(a.output).slice(1);
    });
    // extended validation
    if (opts.validate) {
        if (a.output) {
            const chunks = decompile(a.output);
            if (chunks[0] !== OPS.OP_RETURN)
                throw new TypeError('Output is invalid');
            if (!chunks.slice(1).every(typeforce.Buffer))
                throw new TypeError('Output is invalid');
            if (a.data && !stacksEqual(a.data, o.data))
                throw new TypeError('Data mismatch');
        }
    }
    return Object.assign(o, a);
}

export { p2data as embed };
//# sourceMappingURL=index-f9540180.mjs.map
