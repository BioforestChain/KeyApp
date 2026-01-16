import{j as t,r as p,Q as U,b as te}from"./iframe-Cq46tYX8.js";import{w as l,a as m,e as s}from"./index-BjIXEP53.js";import{W as z}from"./token-item-BKkYk_bS.js";import{C as ne,u as re,t as oe}from"./adapters-DHkf47CG.js";import{a as se}from"./token-icon-DxEI86DM.js";import{u as X,c as ie,b as ce,d as le}from"./address-book-D011vl7W.js";import{c as $}from"./index-B5wWgtQ4.js";import{A as c}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-PpSmsOxD.js";import"./hologram-canvas-DoP2lqzq.js";import"./chain-icon-BvEh9x59.js";import"./address-display-CZKjAGjT.js";import"./web-BP8h9-1i.js";import"./createReactComponent-BzDfpkHh.js";import"./breakpoint-CK5U7Mfi.js";import"./schemas-D5l0QB92.js";import"./useTranslation-By7u652y.js";import"./index-D773qe-G.js";import"./IconCheck-NrYxcfZD.js";import"./IconChevronDown-CsV-oZ1J.js";import"./IconSettings-Cj41z-Yl.js";import"./wallet-selector-DnA2HCEY.js";import"./wallet-mini-card-CavfiM8_.js";import"./index-BQ5KPZtp.js";import"./NumberFlow-client-48rw3j0J-ljYh8C1q.js";import"./amount-display-AV7glS3M.js";import"./animated-number-BGyKstcW.js";import"./time-display-CC2EAa-v.js";import"./copyable-text-DwmdB3Wu.js";import"./IconX-E_xjagDm.js";import"./button-umYeXCJ9.js";import"./useButton-B0SnfSvz.js";import"./useRenderElement-YBikQ6T1.js";import"./dropdown-menu-CI8oL4qh.js";import"./index-XlWLxZQp.js";import"./index-BQmvxBVi.js";import"./composite-D06HYtgF.js";import"./useBaseUiId-Dsh9bZ3S.js";import"./useCompositeListItem-8MG_kN2x.js";import"./useRole-roCOPUcJ.js";import"./web-CN_9DyAP.js";import"./index-D0E7N0oa.js";import"./query-client-CcA89QOV.js";import"./transaction-meta-CreljAmW.js";import"./IconDots-C13rGIdn.js";import"./IconShieldCheck-CpE2YEs8.js";import"./IconApps-BeS2xjQ2.js";import"./IconCoins-CgUU6DA6.js";import"./IconSparkles-moITRXG7.js";import"./IconLock-NMuv_x79.js";import"./IconTrash-xUAIueML.js";import"./transaction-list-DHK-44sk.js";import"./transaction-item-DxdTiad8.js";import"./IconRefresh-DssKnySr.js";import"./swipeable-tabs-D7eUZXye.js";import"./swiper-BcXk199E.js";import"./IconAlertTriangle-D7nYss2U.js";import"./bioforest-D9p3ncSz.js";import"./address-format-CtvAo1Ai.js";function me({chainId:e,address:a,chainName:n,onTokenClick:r,onTransactionClick:o,className:d,testId:h}){const i=re(),{data:K=[],isLoading:J}=i.allBalances.useState({address:a},{enabled:!!a}),{data:V,isLoading:Z}=i.transactionHistory.useState({address:a,limit:50},{enabled:!!a}),ee=p.useMemo(()=>K.map(f=>({symbol:f.symbol,name:f.name,chain:e,balance:f.amount.toFormatted(),decimals:f.decimals,fiatValue:void 0,change24h:0,icon:f.icon})),[K,e]),ae=p.useMemo(()=>V?oe(V,e):[],[V,e]);return t.jsx(z,{chainId:e,chainName:n,tokens:ee,transactions:ae,tokensLoading:J,transactionsLoading:Z,tokensRefreshing:!1,tokensSupported:i.supportsTokenBalances||i.supportsNativeBalance,tokensFallbackReason:void 0,transactionsSupported:i.supportsTransactionHistory,transactionsFallbackReason:void 0,onTokenClick:r,onTransactionClick:o,className:d,testId:h})}function u(e){return t.jsx(ne,{chainId:e.chainId,fallback:t.jsx("div",{className:"flex h-96 items-center justify-center",children:t.jsx("div",{className:"text-muted-foreground text-center",children:t.jsxs("p",{children:["Chain not supported: ",e.chainId]})})}),children:t.jsx(me,{...e})})}u.__docgenInfo={description:`从 Provider 获取地址资产组合

使用 ChainProviderGate 确保 ChainProvider 可用，再使用响应式 API 获取数据。
适用于 Stories 测试和任意地址查询场景。`,methods:[],displayName:"WalletAddressPortfolioFromProvider",props:{chainId:{required:!0,tsType:{name:"ChainType"},description:""},address:{required:!0,tsType:{name:"string"},description:""},chainName:{required:!1,tsType:{name:"string"},description:""},onTokenClick:{required:!1,tsType:{name:"WalletAddressPortfolioViewProps['onTokenClick']",raw:"WalletAddressPortfolioViewProps['onTokenClick']"},description:""},onTransactionClick:{required:!1,tsType:{name:"WalletAddressPortfolioViewProps['onTransactionClick']",raw:"WalletAddressPortfolioViewProps['onTransactionClick']"},description:""},className:{required:!1,tsType:{name:"string"},description:""},testId:{required:!1,tsType:{name:"string"},description:""}}};function de(e){if(e.startsWith("http://")||e.startsWith("https://"))return e;if(e.startsWith("/")||e.startsWith("./")){const a=e.startsWith("/")?e.slice(1):e.slice(2);return new URL(a,document.baseURI).href}return e}const pe=[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00000000",decimals:8,chain:"bfmeta"},{symbol:"BTC",name:"Bitcoin",balance:"0.00123456",decimals:8,chain:"bfmeta"}],O=[{id:"tx1",type:"receive",status:"confirmed",amount:c.fromRaw("100000000",8,"BFT"),symbol:"BFT",address:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j",timestamp:new Date(Date.now()-36e5),chain:"bfmeta"},{id:"tx2",type:"send",status:"confirmed",amount:c.fromRaw("50000000",8,"BFT"),symbol:"BFT",address:"bAnotherAddress1234567890abcdef",timestamp:new Date(Date.now()-864e5),chain:"bfmeta"}];c.fromRaw("546",8,"BTC"),new Date(Date.now()-6e5),c.fromRaw("546",8,"BTC"),c.fromRaw("546",8,"BTC"),c.fromRaw("12168",8,"BTC");const ue=[{id:"caacd034fd600a9a66cb9c841f39b81101e97e23068c8d73152f8741654139e1",type:"send",status:"confirmed",amount:c.fromRaw("149000000",6,"TRX"),symbol:"TRX",address:"TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3",timestamp:new Date(176769114e4),chain:"tron"},{id:"2b8d0c9e7f3a1b5e4d6c8a9f0e1d2c3b4a5f6e7d8c9b0a1f2e3d4c5b6a7f8e9d",type:"receive",status:"confirmed",amount:c.fromRaw("500000000",6,"TRX"),symbol:"TRX",address:"TAnahWWRPm6jhiYR6gMCE3eLDqL8LfCnVE",timestamp:new Date(176768e7),chain:"tron"},{id:"3c9e1d0f8a2b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d",type:"send",status:"confirmed",amount:c.fromRaw("1000000000",6,"TRX"),symbol:"TRX",address:"TRkJg1B9WgM8uXzthJJhBhX7K1GBqH9dXb",timestamp:new Date(176767e7),chain:"tron"}],he=[{id:"0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",type:"send",status:"confirmed",amount:c.fromRaw("1000000000000000000",18,"ETH"),symbol:"ETH",address:"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",timestamp:new Date(Date.now()-72e5),chain:"ethereum"},{id:"0x2b3c4d5e6f78901abcdef2345678901abcdef2345678901abcdef2345678901",type:"receive",status:"confirmed",amount:c.fromRaw("5000000000000000000",18,"ETH"),symbol:"ETH",address:"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",timestamp:new Date(Date.now()-864e5),chain:"ethereum"},{id:"0x3c4d5e6f789012abcdef3456789012abcdef3456789012abcdef3456789012",type:"send",status:"confirmed",amount:c.fromRaw("100000000",6,"USDC"),symbol:"USDC",address:"0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",timestamp:new Date(Date.now()-1728e5),chain:"ethereum"}],fe=[{id:"0xbsc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",type:"receive",status:"confirmed",amount:c.fromRaw("10000000000000000000",18,"BNB"),symbol:"BNB",address:"0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",timestamp:new Date(Date.now()-36e5),chain:"binance"},{id:"0xbsc2345678901abcdef2345678901abcdef2345678901abcdef2345678901bc",type:"send",status:"confirmed",amount:c.fromRaw("5000000000000000000",18,"BNB"),symbol:"BNB",address:"0x28C6c06298d514Db089934071355E5743bf21d60",timestamp:new Date(Date.now()-144e5),chain:"binance"}];function Q({children:e}){const a=X(),[n,r]=p.useState(!1);return p.useEffect(()=>{!n&&!a.snapshot&&!a.isLoading&&(r(!0),$(),ie.initialize())},[n,a.snapshot,a.isLoading]),a.error?t.jsx("div",{"data-testid":"chain-config-error",className:"flex h-96 items-center justify-center p-4",children:t.jsxs("div",{className:"text-destructive text-center",children:[t.jsx("p",{className:"font-medium",children:"Chain config error"}),t.jsx("p",{className:"text-sm",children:a.error})]})}):a.snapshot?t.jsx(t.Fragment,{children:e}):t.jsx("div",{"data-testid":"chain-config-loading",className:"flex h-96 items-center justify-center",children:t.jsx("div",{className:"text-muted-foreground text-center",children:t.jsx("p",{children:"Loading chain configuration..."})})})}function Y({children:e}){const a=ce(),n=p.useMemo(()=>a.map(o=>({...o,tokenIconBase:o.tokenIconBase?.map(de)})),[a]),r=p.useCallback(o=>n.find(d=>d.id===o)?.tokenIconBase??[],[n]);return t.jsx(se,{getTokenIconBases:r,children:e})}const be={ethereum:"0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045",tron:"TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",bitcoin:"1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa",binance:"0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",bfmeta:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j"};function ye(e){const a=e.config&&"apiKeyEnv"in e.config?e.config.apiKeyEnv:void 0;return a?`${e.type} (${a})`:e.type}function ke(e){return e.apis.map((a,n)=>({...e,id:`${e.id}-api-${n}-${a.type}`,name:`${e.name} (${a.type})`,apis:[a],enabled:!0,source:"manual"}))}function Be({chainId:e}){const a=X(),[n,r]=p.useState(!1);return p.useEffect(()=>{if(!a.snapshot||n)return;const o=a.snapshot.configs.find(i=>i.id===e);if(!o)return;if(a.snapshot.configs.some(i=>i.id===`${e}-api-0-${o.apis[0]?.type}`)){r(!0);return}const h=ke(o);le.setState(i=>i.snapshot?{...i,snapshot:{...i.snapshot,configs:[...i.snapshot.configs,...h]}}:i),$(),r(!0)},[a.snapshot,n,e]),null}function ge({api:e,baseConfig:a,index:n,address:r}){const o=`${a.id}-api-${n}-${e.type}`,d=`cmp-${a.id}-${e.type}`;return t.jsxs("div",{className:"flex h-[640px] min-h-0 flex-col overflow-hidden rounded-xl border bg-background",children:[t.jsxs("div",{className:"shrink-0 border-b px-4 py-3",children:[t.jsxs("div",{className:"flex flex-wrap items-baseline justify-between gap-2",children:[t.jsxs("div",{className:"min-w-0",children:[t.jsx("p",{className:"truncate text-sm font-semibold",children:e.type}),t.jsx("p",{className:"text-muted-foreground truncate text-xs",children:e.endpoint})]}),t.jsxs("p",{className:"text-muted-foreground shrink-0 text-xs",children:["#",n]})]}),t.jsx("p",{className:"text-muted-foreground mt-1 line-clamp-1 text-xs",children:ye(e)})]}),t.jsx(u,{chainId:o,address:r,chainName:a.name,testId:d,className:"flex-1 min-h-0"})]})}function y({chainId:e}){const n=X().snapshot?.configs.find(o=>o.id===e);if(!n)return t.jsxs("div",{className:"p-4 text-muted-foreground",children:["Chain config not found: ",e]});const r=be[e]??"";return t.jsxs("div",{className:"space-y-4 p-4",children:[t.jsxs("div",{className:"space-y-1",children:[t.jsx("h2",{className:"text-lg font-semibold",children:n.name}),t.jsxs("p",{className:"text-muted-foreground text-sm",children:["Comparing ",n.apis.length," provider(s) from default-chains.json"]}),t.jsx("p",{className:"text-muted-foreground font-mono text-xs",children:r})]}),t.jsx("div",{className:"grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",children:n.apis.map((o,d)=>t.jsx(ge,{api:o,baseConfig:n,index:d,address:r},`${o.type}-${d}`))})]})}const _=()=>new te({defaultOptions:{queries:{retry:!1,staleTime:0}}}),k=e=>t.jsx(U,{client:_(),children:t.jsx(Q,{children:t.jsx(Y,{children:t.jsx("div",{className:"bg-background mx-auto min-h-screen max-w-md",children:t.jsx(e,{})})})})}),B=e=>a=>t.jsx(U,{client:_(),children:t.jsx(Q,{children:t.jsxs(Y,{children:[t.jsx(Be,{chainId:e}),t.jsx("div",{className:"bg-background mx-auto min-h-screen max-w-6xl",children:t.jsx(a,{})})]})})}),Ca={title:"Wallet/WalletAddressPortfolio",component:z,parameters:{layout:"fullscreen"},tags:["autodocs"]},g={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:pe,transactions:O}},T={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[],tokensLoading:!0,transactionsLoading:!0},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("wallet-address-portfolio");s(n).toBeVisible();const r=n.querySelectorAll(".animate-pulse");s(r.length).toBeGreaterThan(0)})}},v={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[]},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("wallet-address-portfolio-token-list-empty");s(n).toBeVisible()})}},x={name:"Real Data: biochain-bfmeta",decorators:[k],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real token balances and transactions from BFMeta chain using the actual chainProvider API."}}},render:()=>t.jsx(u,{chainId:"bfmeta",address:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j",chainName:"BFMeta",testId:"bfmeta-portfolio"}),play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("bfmeta-portfolio");s(n).toBeVisible();const r=a.queryByTestId("bfmeta-portfolio-token-list"),o=a.queryByTestId("bfmeta-portfolio-token-list-empty"),d=n.querySelector(".animate-pulse");if(s(r||o||d).not.toBeNull(),r){const h=r.querySelectorAll('[data-testid^="token-item-"]');s(h.length).toBeGreaterThan(0)}},{timeout:15e3})}},w={name:"Real Data: eth-eth",decorators:[k],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real token balances and transactions from Ethereum mainnet using blockscout API. Uses Vitalik address for real ETH transfers."}}},render:()=>t.jsx(u,{chainId:"ethereum",address:"0x75a6F48BF634868b2980c97CcEf467A127597e08",chainName:"Ethereum",testId:"ethereum-portfolio"}),play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("ethereum-portfolio");s(n).toBeVisible();const r=a.queryByTestId("ethereum-portfolio-token-list");s(r).not.toBeNull();const o=r?.querySelectorAll('[data-testid^="token-item-"]');s(o?.length).toBeGreaterThan(0)},{timeout:15e3})}},I={name:"Real Data: bitcoin",decorators:[k],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real balance and transactions from Bitcoin mainnet using mempool.space API."}}},render:()=>t.jsx(u,{chainId:"bitcoin",address:"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",chainName:"Bitcoin",testId:"bitcoin-portfolio"}),play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("bitcoin-portfolio");s(n).toBeVisible();const r=a.queryByTestId("bitcoin-portfolio-token-list");s(r).not.toBeNull();const o=r?.querySelectorAll('[data-testid^="token-item-"]');s(o?.length).toBeGreaterThan(0)},{timeout:15e3})}},S={name:"Real Data: tron",decorators:[k],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real balance and transactions from Tron mainnet using TronGrid API."}}},render:()=>t.jsx(u,{chainId:"tron",address:"TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",chainName:"Tron",testId:"tron-portfolio"}),play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("tron-portfolio");s(n).toBeVisible();const r=a.queryByTestId("tron-portfolio-token-list");s(r).not.toBeNull();const o=r?.querySelectorAll('[data-testid^="token-item-"]');s(o?.length).toBeGreaterThan(0)},{timeout:15e3})}},E={name:"Real Data: binance",decorators:[k],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real BNB balance from BSC mainnet using public RPC."}}},render:()=>t.jsx(u,{chainId:"binance",address:"0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",chainName:"BNB Smart Chain",testId:"binance-portfolio"}),play:async({canvasElement:e})=>{const a=l(e);await m(()=>{const n=a.getByTestId("binance-portfolio");s(n).toBeVisible();const r=a.queryByTestId("binance-portfolio-token-list");s(r).not.toBeNull();const o=r?.querySelectorAll('[data-testid^="token-item-"]');s(o?.length).toBeGreaterThan(0)},{timeout:15e3})}},C={name:"Compare Providers: BFMeta",decorators:[B("bfmeta")],parameters:{chromatic:{delay:8e3},docs:{description:{story:"Dynamically compares all providers configured in default-chains.json for BFMeta chain."}}},render:()=>t.jsx(y,{chainId:"bfmeta"})},N={name:"Compare Providers: Ethereum",decorators:[B("ethereum")],parameters:{chromatic:{delay:8e3},docs:{description:{story:"Dynamically compares all providers configured in default-chains.json for Ethereum chain."}}},render:()=>t.jsx(y,{chainId:"ethereum"})},F={name:"Compare Providers: Tron",decorators:[B("tron")],parameters:{chromatic:{delay:8e3},docs:{description:{story:"Dynamically compares all providers configured in default-chains.json for Tron chain."}}},render:()=>t.jsx(y,{chainId:"tron"})},D={name:"Compare Providers: Bitcoin",decorators:[B("bitcoin")],parameters:{chromatic:{delay:8e3},docs:{description:{story:"Dynamically compares all providers configured in default-chains.json for Bitcoin chain."}}},render:()=>t.jsx(y,{chainId:"bitcoin"})},P={name:"Compare Providers: Binance",decorators:[B("binance")],parameters:{chromatic:{delay:8e3},docs:{description:{story:"Dynamically compares all providers configured in default-chains.json for BNB Smart Chain."}}},render:()=>t.jsx(y,{chainId:"binance"})},b={name:"BFMeta - Normal Data",args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00",decimals:8,chain:"bfmeta"}],transactions:O,tokensSupported:!0,transactionsSupported:!0}},j={name:"BFMeta - Fallback Warning",args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[{symbol:"BFT",name:"BFT",balance:"0",decimals:8,chain:"bfmeta"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"All 2 provider(s) failed. Last error: Connection timeout",transactionsSupported:!1,transactionsFallbackReason:"No provider implements getTransactionHistory"},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{s(a.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},A={name:"Ethereum - Normal Data (23.68 ETH)",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"23.683156206881918",decimals:18,chain:"ethereum"},{symbol:"USDC",name:"USD Coin",balance:"1500.00",decimals:6,chain:"ethereum"}],transactions:he,tokensSupported:!0,transactionsSupported:!0}},R={name:"Ethereum - Fallback Warning",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"0",decimals:18,chain:"ethereum"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"All providers failed: ethereum-rpc timeout, etherscan rate limited",transactionsSupported:!1,transactionsFallbackReason:"Blockscout API returned 503"},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{s(a.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},q={name:"Binance - Normal Data (234.08 BNB)",args:{chainId:"binance",chainName:"BNB Smart Chain",tokens:[{symbol:"BNB",name:"BNB",balance:"234.084063038409",decimals:18,chain:"binance"},{symbol:"BUSD",name:"BUSD",balance:"2000.00",decimals:18,chain:"binance"}],transactions:fe,tokensSupported:!0,transactionsSupported:!0}},L={name:"Binance - Fallback Warning",args:{chainId:"binance",chainName:"BNB Smart Chain",tokens:[{symbol:"BNB",name:"BNB",balance:"0",decimals:18,chain:"binance"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"BSC RPC node unreachable",transactionsSupported:!1,transactionsFallbackReason:"BscScan API key exhausted"},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{s(a.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},W={name:"Tron - Normal Data (163,377 TRX)",args:{chainId:"tron",chainName:"Tron",tokens:[{symbol:"TRX",name:"Tron",balance:"163377.648279",decimals:6,chain:"tron"},{symbol:"USDT",name:"Tether",balance:"10000.00",decimals:6,chain:"tron"}],transactions:ue,tokensSupported:!0,transactionsSupported:!0}},G={name:"Tron - Fallback Warning",args:{chainId:"tron",chainName:"Tron",tokens:[{symbol:"TRX",name:"Tron",balance:"0",decimals:6,chain:"tron"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"TronGrid API rate limit exceeded",transactionsSupported:!1,transactionsFallbackReason:"All Tron providers failed"},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{s(a.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},M={name:"Partial Fallback - Tokens OK, Transactions Failed",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"5.5",decimals:18,chain:"ethereum"}],transactions:[],tokensSupported:!0,transactionsSupported:!1,transactionsFallbackReason:"Etherscan API key invalid"}},H={name:"Empty Data - No Warning (Provider OK)",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[],transactions:[],tokensSupported:!0,transactionsSupported:!0},play:async({canvasElement:e})=>{const a=l(e);await m(()=>{s(a.queryAllByTestId("provider-fallback-warning")).toHaveLength(0)})}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: mockTokens,
    transactions: mockTransactions
  }
}`,...g.parameters?.docs?.source}}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [],
    transactions: [],
    tokensLoading: true,
    transactionsLoading: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const portfolio = canvas.getByTestId('wallet-address-portfolio');
      expect(portfolio).toBeVisible();
      const pulsingElements = portfolio.querySelectorAll('.animate-pulse');
      expect(pulsingElements.length).toBeGreaterThan(0);
    });
  }
}`,...T.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [],
    transactions: []
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const emptyState = canvas.getByTestId('wallet-address-portfolio-token-list-empty');
      expect(emptyState).toBeVisible();
    });
  }
}`,...v.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  name: 'Real Data: biochain-bfmeta',
  decorators: [withChainConfig],
  parameters: {
    chromatic: {
      delay: 5000
    },
    docs: {
      description: {
        story: 'Fetches real token balances and transactions from BFMeta chain using the actual chainProvider API.'
      }
    }
  },
  render: () => <WalletAddressPortfolioFromProvider chainId="bfmeta" address="bCfAynSAKhzgKLi3BXyuh5k22GctLR72j" chainName="BFMeta" testId="bfmeta-portfolio" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);

    // Wait for data to load - check component renders without error
    await waitFor(() => {
      const portfolio = canvas.getByTestId('bfmeta-portfolio');
      expect(portfolio).toBeVisible();

      // Check loading finished (either has tokens, empty state, or loading skeleton stopped)
      const tokenList = canvas.queryByTestId('bfmeta-portfolio-token-list');
      const tokenEmpty = canvas.queryByTestId('bfmeta-portfolio-token-list-empty');
      const loading = portfolio.querySelector('.animate-pulse');

      // Should have either: token list, empty state, or still loading
      expect(tokenList || tokenEmpty || loading).not.toBeNull();

      // If token list exists, verify it has items
      if (tokenList) {
        const tokenItems = tokenList.querySelectorAll('[data-testid^="token-item-"]');
        expect(tokenItems.length).toBeGreaterThan(0);
      }
    }, {
      timeout: 15000
    });
  }
}`,...x.parameters?.docs?.source}}};w.parameters={...w.parameters,docs:{...w.parameters?.docs,source:{originalSource:`{
  name: 'Real Data: eth-eth',
  decorators: [withChainConfig],
  parameters: {
    chromatic: {
      delay: 5000
    },
    docs: {
      description: {
        story: 'Fetches real token balances and transactions from Ethereum mainnet using blockscout API. Uses Vitalik address for real ETH transfers.'
      }
    }
  },
  render: () => <WalletAddressPortfolioFromProvider chainId="ethereum" address="0x75a6F48BF634868b2980c97CcEf467A127597e08" chainName="Ethereum" testId="ethereum-portfolio" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const portfolio = canvas.getByTestId('ethereum-portfolio');
      expect(portfolio).toBeVisible();

      // Verify token list exists with actual tokens
      const tokenList = canvas.queryByTestId('ethereum-portfolio-token-list');
      expect(tokenList).not.toBeNull();
      const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
      expect(tokenItems?.length).toBeGreaterThan(0);
    }, {
      timeout: 15000
    });
  }
}`,...w.parameters?.docs?.source}}};I.parameters={...I.parameters,docs:{...I.parameters?.docs,source:{originalSource:`{
  name: 'Real Data: bitcoin',
  decorators: [withChainConfig],
  parameters: {
    chromatic: {
      delay: 5000
    },
    docs: {
      description: {
        story: 'Fetches real balance and transactions from Bitcoin mainnet using mempool.space API.'
      }
    }
  },
  render: () => <WalletAddressPortfolioFromProvider chainId="bitcoin" address="bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq" chainName="Bitcoin" testId="bitcoin-portfolio" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const portfolio = canvas.getByTestId('bitcoin-portfolio');
      expect(portfolio).toBeVisible();

      // Verify token list exists with BTC balance
      const tokenList = canvas.queryByTestId('bitcoin-portfolio-token-list');
      expect(tokenList).not.toBeNull();
      const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
      expect(tokenItems?.length).toBeGreaterThan(0);
    }, {
      timeout: 15000
    });
  }
}`,...I.parameters?.docs?.source}}};S.parameters={...S.parameters,docs:{...S.parameters?.docs,source:{originalSource:`{
  name: 'Real Data: tron',
  decorators: [withChainConfig],
  parameters: {
    chromatic: {
      delay: 5000
    },
    docs: {
      description: {
        story: 'Fetches real balance and transactions from Tron mainnet using TronGrid API.'
      }
    }
  },
  render: () => <WalletAddressPortfolioFromProvider chainId="tron" address="TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9" chainName="Tron" testId="tron-portfolio" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const portfolio = canvas.getByTestId('tron-portfolio');
      expect(portfolio).toBeVisible();

      // Verify token list exists with TRX balance
      const tokenList = canvas.queryByTestId('tron-portfolio-token-list');
      expect(tokenList).not.toBeNull();
      const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
      expect(tokenItems?.length).toBeGreaterThan(0);
    }, {
      timeout: 15000
    });
  }
}`,...S.parameters?.docs?.source}}};E.parameters={...E.parameters,docs:{...E.parameters?.docs,source:{originalSource:`{
  name: 'Real Data: binance',
  decorators: [withChainConfig],
  parameters: {
    chromatic: {
      delay: 5000
    },
    docs: {
      description: {
        story: 'Fetches real BNB balance from BSC mainnet using public RPC.'
      }
    }
  },
  render: () => <WalletAddressPortfolioFromProvider chainId="binance" address="0x8894E0a0c962CB723c1976a4421c95949bE2D4E3" chainName="BNB Smart Chain" testId="binance-portfolio" />,
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      const portfolio = canvas.getByTestId('binance-portfolio');
      expect(portfolio).toBeVisible();

      // Verify token list exists with BNB balance
      const tokenList = canvas.queryByTestId('binance-portfolio-token-list');
      expect(tokenList).not.toBeNull();
      const tokenItems = tokenList?.querySelectorAll('[data-testid^="token-item-"]');
      expect(tokenItems?.length).toBeGreaterThan(0);
    }, {
      timeout: 15000
    });
  }
}`,...E.parameters?.docs?.source}}};C.parameters={...C.parameters,docs:{...C.parameters?.docs,source:{originalSource:`{
  name: 'Compare Providers: BFMeta',
  decorators: [createCompareDecorator('bfmeta')],
  parameters: {
    chromatic: {
      delay: 8000
    },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for BFMeta chain.'
      }
    }
  },
  render: () => <DynamicCompareProvidersGrid chainId="bfmeta" />
}`,...C.parameters?.docs?.source}}};N.parameters={...N.parameters,docs:{...N.parameters?.docs,source:{originalSource:`{
  name: 'Compare Providers: Ethereum',
  decorators: [createCompareDecorator('ethereum')],
  parameters: {
    chromatic: {
      delay: 8000
    },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for Ethereum chain.'
      }
    }
  },
  render: () => <DynamicCompareProvidersGrid chainId="ethereum" />
}`,...N.parameters?.docs?.source}}};F.parameters={...F.parameters,docs:{...F.parameters?.docs,source:{originalSource:`{
  name: 'Compare Providers: Tron',
  decorators: [createCompareDecorator('tron')],
  parameters: {
    chromatic: {
      delay: 8000
    },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for Tron chain.'
      }
    }
  },
  render: () => <DynamicCompareProvidersGrid chainId="tron" />
}`,...F.parameters?.docs?.source}}};D.parameters={...D.parameters,docs:{...D.parameters?.docs,source:{originalSource:`{
  name: 'Compare Providers: Bitcoin',
  decorators: [createCompareDecorator('bitcoin')],
  parameters: {
    chromatic: {
      delay: 8000
    },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for Bitcoin chain.'
      }
    }
  },
  render: () => <DynamicCompareProvidersGrid chainId="bitcoin" />
}`,...D.parameters?.docs?.source}}};P.parameters={...P.parameters,docs:{...P.parameters?.docs,source:{originalSource:`{
  name: 'Compare Providers: Binance',
  decorators: [createCompareDecorator('binance')],
  parameters: {
    chromatic: {
      delay: 8000
    },
    docs: {
      description: {
        story: 'Dynamically compares all providers configured in default-chains.json for BNB Smart Chain.'
      }
    }
  },
  render: () => <DynamicCompareProvidersGrid chainId="binance" />
}`,...P.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  name: 'BFMeta - Normal Data',
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [{
      symbol: 'BFT',
      name: 'BFT',
      balance: '1234.56789012',
      decimals: 8,
      chain: 'bfmeta'
    }, {
      symbol: 'USDT',
      name: 'USDT',
      balance: '500.00',
      decimals: 8,
      chain: 'bfmeta'
    }],
    transactions: mockTransactions,
    tokensSupported: true,
    transactionsSupported: true
  }
}`,...b.parameters?.docs?.source},description:{story:`ProviderFallbackWarning 截图验证 Stories

覆盖四种主要链的各种场景：
1. 正常数据（supported: true）
2. Fallback 警告（supported: false）`,...b.parameters?.docs?.description}}};j.parameters={...j.parameters,docs:{...j.parameters?.docs,source:{originalSource:`{
  name: 'BFMeta - Fallback Warning',
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: [{
      symbol: 'BFT',
      name: 'BFT',
      balance: '0',
      decimals: 8,
      chain: 'bfmeta'
    }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'All 2 provider(s) failed. Last error: Connection timeout',
    transactionsSupported: false,
    transactionsFallbackReason: 'No provider implements getTransactionHistory'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...j.parameters?.docs?.source}}};A.parameters={...A.parameters,docs:{...A.parameters?.docs,source:{originalSource:`{
  name: 'Ethereum - Normal Data (23.68 ETH)',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [{
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '23.683156206881918',
      decimals: 18,
      chain: 'ethereum'
    }, {
      symbol: 'USDC',
      name: 'USD Coin',
      balance: '1500.00',
      decimals: 6,
      chain: 'ethereum'
    }],
    transactions: mockEthereumTransactions,
    tokensSupported: true,
    transactionsSupported: true
  }
}`,...A.parameters?.docs?.source}}};R.parameters={...R.parameters,docs:{...R.parameters?.docs,source:{originalSource:`{
  name: 'Ethereum - Fallback Warning',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [{
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '0',
      decimals: 18,
      chain: 'ethereum'
    }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'All providers failed: ethereum-rpc timeout, etherscan rate limited',
    transactionsSupported: false,
    transactionsFallbackReason: 'Blockscout API returned 503'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...R.parameters?.docs?.source}}};q.parameters={...q.parameters,docs:{...q.parameters?.docs,source:{originalSource:`{
  name: 'Binance - Normal Data (234.08 BNB)',
  args: {
    chainId: 'binance',
    chainName: 'BNB Smart Chain',
    tokens: [{
      symbol: 'BNB',
      name: 'BNB',
      balance: '234.084063038409',
      decimals: 18,
      chain: 'binance'
    }, {
      symbol: 'BUSD',
      name: 'BUSD',
      balance: '2000.00',
      decimals: 18,
      chain: 'binance'
    }],
    transactions: mockBinanceTransactions,
    tokensSupported: true,
    transactionsSupported: true
  }
}`,...q.parameters?.docs?.source}}};L.parameters={...L.parameters,docs:{...L.parameters?.docs,source:{originalSource:`{
  name: 'Binance - Fallback Warning',
  args: {
    chainId: 'binance',
    chainName: 'BNB Smart Chain',
    tokens: [{
      symbol: 'BNB',
      name: 'BNB',
      balance: '0',
      decimals: 18,
      chain: 'binance'
    }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'BSC RPC node unreachable',
    transactionsSupported: false,
    transactionsFallbackReason: 'BscScan API key exhausted'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...L.parameters?.docs?.source}}};W.parameters={...W.parameters,docs:{...W.parameters?.docs,source:{originalSource:`{
  name: 'Tron - Normal Data (163,377 TRX)',
  args: {
    chainId: 'tron',
    chainName: 'Tron',
    tokens: [{
      symbol: 'TRX',
      name: 'Tron',
      balance: '163377.648279',
      decimals: 6,
      chain: 'tron'
    }, {
      symbol: 'USDT',
      name: 'Tether',
      balance: '10000.00',
      decimals: 6,
      chain: 'tron'
    }],
    transactions: mockTronTransactions,
    tokensSupported: true,
    transactionsSupported: true
  }
}`,...W.parameters?.docs?.source}}};G.parameters={...G.parameters,docs:{...G.parameters?.docs,source:{originalSource:`{
  name: 'Tron - Fallback Warning',
  args: {
    chainId: 'tron',
    chainName: 'Tron',
    tokens: [{
      symbol: 'TRX',
      name: 'Tron',
      balance: '0',
      decimals: 6,
      chain: 'tron'
    }],
    transactions: [],
    tokensSupported: false,
    tokensFallbackReason: 'TronGrid API rate limit exceeded',
    transactionsSupported: false,
    transactionsFallbackReason: 'All Tron providers failed'
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.getAllByTestId('provider-fallback-warning').length).toBeGreaterThanOrEqual(1);
    });
  }
}`,...G.parameters?.docs?.source}}};M.parameters={...M.parameters,docs:{...M.parameters?.docs,source:{originalSource:`{
  name: 'Partial Fallback - Tokens OK, Transactions Failed',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [{
      symbol: 'ETH',
      name: 'Ethereum',
      balance: '5.5',
      decimals: 18,
      chain: 'ethereum'
    }],
    transactions: [],
    tokensSupported: true,
    // 余额查询成功
    transactionsSupported: false,
    // 交易历史查询失败
    transactionsFallbackReason: 'Etherscan API key invalid'
  }
}`,...M.parameters?.docs?.source}}};H.parameters={...H.parameters,docs:{...H.parameters?.docs,source:{originalSource:`{
  name: 'Empty Data - No Warning (Provider OK)',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [],
    transactions: [],
    tokensSupported: true,
    // Provider 正常，只是没数据
    transactionsSupported: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      // 应该没有警告
      expect(canvas.queryAllByTestId('provider-fallback-warning')).toHaveLength(0);
    });
  }
}`,...H.parameters?.docs?.source}}};const Na=["Default","Loading","Empty","RealDataBfmeta","RealDataEthereum","RealDataBitcoin","RealDataTron","RealDataBinance","CompareProvidersBfmeta","CompareProvidersEthereum","CompareProvidersTron","CompareProvidersBitcoin","CompareProvidersBinance","BFMetaNormalData","BFMetaFallbackWarning","EthereumNormalData","EthereumFallbackWarning","BinanceNormalData","BinanceFallbackWarning","TronNormalData","TronFallbackWarning","PartialFallback","EmptyButSupported"];export{j as BFMetaFallbackWarning,b as BFMetaNormalData,L as BinanceFallbackWarning,q as BinanceNormalData,C as CompareProvidersBfmeta,P as CompareProvidersBinance,D as CompareProvidersBitcoin,N as CompareProvidersEthereum,F as CompareProvidersTron,g as Default,v as Empty,H as EmptyButSupported,R as EthereumFallbackWarning,A as EthereumNormalData,T as Loading,M as PartialFallback,x as RealDataBfmeta,E as RealDataBinance,I as RealDataBitcoin,w as RealDataEthereum,S as RealDataTron,G as TronFallbackWarning,W as TronNormalData,Na as __namedExportsOrder,Ca as default};
