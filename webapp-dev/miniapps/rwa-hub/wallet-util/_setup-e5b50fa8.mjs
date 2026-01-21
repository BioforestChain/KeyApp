import { prepareTinySecp256k1 } from './_setup-2644274b.mjs';
import { g as getSha3Preparer } from './sha3-8923c3ca.mjs';
import './index-62190cc8.mjs';
import './index-20b88f48.mjs';
import './WASMInterface-e83e38e1.mjs';

const prepareEthereumUtil = async () => {
    await prepareTinySecp256k1();
    await getSha3Preparer(224).prepare();
    await getSha3Preparer(256).prepare();
    await getSha3Preparer(384).prepare();
    await getSha3Preparer(512).prepare();
};

export { prepareEthereumUtil };
//# sourceMappingURL=_setup-e5b50fa8.mjs.map
