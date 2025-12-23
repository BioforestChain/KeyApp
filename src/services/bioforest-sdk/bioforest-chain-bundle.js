// ESM wrapper for CommonJS bundle
// Vite handles CommonJS-to-ESM conversion automatically
import bundle from './bioforest-chain-bundle.cjs'
export const setup = bundle.setup
export default bundle
