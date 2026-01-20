import { p as prepareBs58check } from './_setup-80356711.mjs';
import './sha256-098a9414.mjs';
import './WASMInterface-e83e38e1.mjs';
import './index-62190cc8.mjs';

const prepareWif = async () => {
    await prepareBs58check();
};

const prepareEcpair = async () => {
    await prepareWif();
};

export { prepareEcpair };
//# sourceMappingURL=_setup-60ba36f8.mjs.map
