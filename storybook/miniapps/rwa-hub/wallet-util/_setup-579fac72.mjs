import { p as prepareBs58check } from './_setup-80356711.mjs';
import { p as prepareRIPEMD160 } from './ripemd160-eb7b517c.mjs';
import { p as prepareSHA1 } from './sha1-d9a30eed.mjs';
import { p as prepareSHA256 } from './sha256-098a9414.mjs';
import './WASMInterface-e83e38e1.mjs';
import './index-62190cc8.mjs';

const prepareBitcoinLib = async () => {
    await prepareBs58check();
    await prepareRIPEMD160.prepare();
    await prepareSHA1.prepare();
    await prepareSHA256.prepare();
};

export { prepareBitcoinLib };
//# sourceMappingURL=_setup-579fac72.mjs.map
