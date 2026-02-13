import{w as t,a as r,e}from"./index-BjIXEP53.js";import{W as S}from"./token-item-BOvHotZf.js";import{A as s}from"./amount-BQsqQYGO.js";import"./iframe-CyYNzbJL.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-BplLemu5.js";import"./hologram-canvas-D_3LHKN4.js";import"./chain-icon-Dd7z7LzY.js";import"./service-BqCsOJfx.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-CuS4YWMX.js";import"./address-display-ChXM8Y2Y.js";import"./web-CSjpY_gv.js";import"./createReactComponent-CUuh3cdw.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-BB9FXUKP.js";import"./index-BM9Q35K9.js";import"./IconCheck-Du9Dn1VL.js";import"./IconChevronDown-QK9NZQiH.js";import"./IconSettings-Aq9ODhTs.js";import"./wallet-selector-ChHc9T9A.js";import"./wallet-mini-card-D8NHehYj.js";import"./token-icon-CmS51FQR.js";import"./LoadingSpinner-DU1XDDLV.js";import"./NumberFlow-client-48rw3j0J-JthwvN_3.js";import"./amount-display-C0HTHpwz.js";import"./animated-number-Bl9YlNyY.js";import"./time-display-Pyfc2YB1.js";import"./service-status-alert-CEiU1wAE.js";import"./IconX-B6veifLA.js";import"./IconAlertTriangle-L9r-v03n.js";import"./IconLock-B7_WR00i.js";import"./item-Br3_qjCR.js";import"./button-BFbLYQEm.js";import"./useButton-DPywT7vJ.js";import"./useRenderElement-CdGWhY6E.js";import"./dropdown-menu-BUkl7wPj.js";import"./index-X0Vu_Ke2.js";import"./index-Qkj-wqYm.js";import"./composite-B-SFJxzc.js";import"./useBaseUiId-BvBvFpFG.js";import"./useCompositeListItem-Cw6W8NOY.js";import"./useRole-KbfvC2Ej.js";import"./user-profile-Bbet2Vmt.js";import"./avatar-codec-Cm64YtLj.js";import"./bioforest-D-5s2Gc6.js";import"./web-DItVtpha.js";import"./notification-D6r8klB-.js";import"./index-Ck5wsex-.js";import"./transaction-meta-BKgBcUu5.js";import"./IconDots-C5guX6IY.js";import"./IconShieldCheck-BOaR91FK.js";import"./IconApps-DoTeJTN5.js";import"./IconCoins-C3fUPPFq.js";import"./IconSparkles-BxaPu217.js";import"./IconTrash-BgrIrYRw.js";import"./transaction-list-BF7y18ar.js";import"./transaction-item-BVtKm5-_.js";import"./IconRefresh-Dw5F1TsA.js";import"./swipeable-tabs-DlnlBcRM.js";import"./swiper-CCnof3Ns.js";const F=[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00000000",decimals:8,chain:"bfmeta"},{symbol:"BTC",name:"Bitcoin",balance:"0.00123456",decimals:8,chain:"bfmeta"}],T=[{id:"tx1",type:"receive",status:"confirmed",amount:s.fromRaw("100000000",8,"BFT"),symbol:"BFT",address:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j",timestamp:new Date(Date.now()-36e5),chain:"bfmeta"},{id:"tx2",type:"send",status:"confirmed",amount:s.fromRaw("50000000",8,"BFT"),symbol:"BFT",address:"bAnotherAddress1234567890abcdef",timestamp:new Date(Date.now()-864e5),chain:"bfmeta"}],E=[{id:"0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",type:"send",status:"confirmed",amount:s.fromRaw("1000000000000000000",18,"ETH"),symbol:"ETH",address:"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",timestamp:new Date(Date.now()-72e5),chain:"ethereum"},{id:"0x2b3c4d5e6f78901abcdef2345678901abcdef2345678901abcdef2345678901",type:"receive",status:"confirmed",amount:s.fromRaw("5000000000000000000",18,"ETH"),symbol:"ETH",address:"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",timestamp:new Date(Date.now()-864e5),chain:"ethereum"}],w=[{id:"caacd034fd600a9a66cb9c841f39b81101e97e23068c8d73152f8741654139e1",type:"send",status:"confirmed",amount:s.fromRaw("149000000",6,"TRX"),symbol:"TRX",address:"TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3",timestamp:new Date(Date.now()-36e5),chain:"tron"}],v=[{id:"0xbsc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",type:"receive",status:"confirmed",amount:s.fromRaw("10000000000000000000",18,"BNB"),symbol:"BNB",address:"0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",timestamp:new Date(Date.now()-36e5),chain:"binance"}],Ma={title:"Wallet/WalletAddressPortfolio",component:S,parameters:{layout:"fullscreen"},tags:["autodocs"]},c={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:F,transactions:T}},i={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[],tokensLoading:!0,transactionsLoading:!0},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{const o=n.getByTestId("wallet-address-portfolio");e(o).toBeVisible();const f=o.querySelectorAll(".animate-pulse");e(f.length).toBeGreaterThan(0)})}},m={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[]},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{const o=n.getByTestId("wallet-address-portfolio-token-list-empty");e(o).toBeVisible()})}},l={name:"BFMeta - Normal Data",args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00",decimals:8,chain:"bfmeta"}],transactions:T,tokensSupported:!0,transactionsSupported:!0}},p={name:"Ethereum - Normal Data",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"23.683156206881918",decimals:18,chain:"ethereum"},{symbol:"USDC",name:"USD Coin",balance:"1500.00",decimals:6,chain:"ethereum"}],transactions:E,tokensSupported:!0,transactionsSupported:!0}},d={name:"Binance - Normal Data",args:{chainId:"binance",chainName:"BNB Smart Chain",tokens:[{symbol:"BNB",name:"BNB",balance:"234.084063038409",decimals:18,chain:"binance"},{symbol:"BUSD",name:"BUSD",balance:"2000.00",decimals:18,chain:"binance"}],transactions:v,tokensSupported:!0,transactionsSupported:!0}},u={name:"Tron - Normal Data",args:{chainId:"tron",chainName:"Tron",tokens:[{symbol:"TRX",name:"Tron",balance:"163377.648279",decimals:6,chain:"tron"},{symbol:"USDT",name:"Tether",balance:"10000.00",decimals:6,chain:"tron"}],transactions:w,tokensSupported:!0,transactionsSupported:!0}},h={name:"BFMeta - Fallback Warning",args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[{symbol:"BFT",name:"BFT",balance:"0",decimals:8,chain:"bfmeta"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"All 2 provider(s) failed. Last error: Connection timeout",transactionsSupported:!1,transactionsFallbackReason:"No provider implements getTransactionHistory"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},b={name:"Ethereum - Fallback Warning",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"0",decimals:18,chain:"ethereum"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"All providers failed: ethereum-rpc timeout, etherscan rate limited",transactionsSupported:!1,transactionsFallbackReason:"Blockscout API returned 503"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},k={name:"Binance - Fallback Warning",args:{chainId:"binance",chainName:"BNB Smart Chain",tokens:[{symbol:"BNB",name:"BNB",balance:"0",decimals:18,chain:"binance"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"BSC RPC node unreachable",transactionsSupported:!1,transactionsFallbackReason:"BscScan API key exhausted"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},B={name:"Tron - Fallback Warning",args:{chainId:"tron",chainName:"Tron",tokens:[{symbol:"TRX",name:"Tron",balance:"0",decimals:6,chain:"tron"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"TronGrid API rate limit exceeded",transactionsSupported:!1,transactionsFallbackReason:"All Tron providers failed"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},y={name:"Partial Fallback - Tokens OK, Transactions Failed",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"5.5",decimals:18,chain:"ethereum"}],transactions:[],tokensSupported:!0,transactionsSupported:!1,transactionsFallbackReason:"Etherscan API key invalid"}},g={name:"Empty Data - No Warning (Provider OK)",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[],transactions:[],tokensSupported:!0,transactionsSupported:!0},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.queryAllByTestId("provider-fallback-warning")).toHaveLength(0)})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: mockTokens,
    transactions: mockTransactions
  }
}`,...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
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
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
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
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
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
}`,...l.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  name: 'Ethereum - Normal Data',
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
}`,...p.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  name: 'Binance - Normal Data',
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
}`,...d.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  name: 'Tron - Normal Data',
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
}`,...u.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
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
}`,...b.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
    transactionsSupported: false,
    transactionsFallbackReason: 'Etherscan API key invalid'
  }
}`,...y.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  name: 'Empty Data - No Warning (Provider OK)',
  args: {
    chainId: 'ethereum',
    chainName: 'Ethereum',
    tokens: [],
    transactions: [],
    tokensSupported: true,
    transactionsSupported: true
  },
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await waitFor(() => {
      expect(canvas.queryAllByTestId('provider-fallback-warning')).toHaveLength(0);
    });
  }
}`,...g.parameters?.docs?.source}}};const Ua=["Default","Loading","Empty","BFMetaNormalData","EthereumNormalData","BinanceNormalData","TronNormalData","BFMetaFallbackWarning","EthereumFallbackWarning","BinanceFallbackWarning","TronFallbackWarning","PartialFallback","EmptyButSupported"];export{h as BFMetaFallbackWarning,l as BFMetaNormalData,k as BinanceFallbackWarning,d as BinanceNormalData,c as Default,m as Empty,g as EmptyButSupported,b as EthereumFallbackWarning,p as EthereumNormalData,i as Loading,y as PartialFallback,B as TronFallbackWarning,u as TronNormalData,Ua as __namedExportsOrder,Ma as default};
