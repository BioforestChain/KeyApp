import { p as prepareSHA256 } from './sha256-098a9414.mjs';
import { p as prepareSHA512 } from './sha512-da1b7bbd.mjs';
import './WASMInterface-e83e38e1.mjs';
import './index-62190cc8.mjs';

const prepareBip39 = async () => {
    await prepareSHA256.prepare();
    await prepareSHA512.prepare();
};

export { prepareBip39 };
//# sourceMappingURL=_setup-9ac22773.mjs.map
