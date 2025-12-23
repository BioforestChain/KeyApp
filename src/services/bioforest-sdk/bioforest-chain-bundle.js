// ESM wrapper for CommonJS bundle
import { createRequire } from 'module'
const require = createRequire(import.meta.url)
const bundle = require('./bioforest-chain-bundle.cjs')
export const setup = bundle.setup
export default bundle
