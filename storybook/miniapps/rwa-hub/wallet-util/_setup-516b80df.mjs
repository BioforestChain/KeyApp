import { p as prepareRIPEMD160 } from './ripemd160-eb7b517c.mjs';
import { p as prepareSHA256 } from './sha256-098a9414.mjs';
import { p as prepareSHA512 } from './sha512-da1b7bbd.mjs';
import './WASMInterface-e83e38e1.mjs';
import './index-62190cc8.mjs';

const prepareBip32 = async () => {
    await prepareRIPEMD160.prepare();
    await prepareSHA256.prepare();
    await prepareSHA512.prepare();
};

export { prepareBip32 };
//# sourceMappingURL=_setup-516b80df.mjs.map
