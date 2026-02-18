import{w as t,a as r,e}from"./index-BjIXEP53.js";import{W as S}from"./token-item-D1trZ3vB.js";import{A as s}from"./amount-BQsqQYGO.js";import"./iframe-BpDWdeYo.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-card-DePXyctr.js";import"./hologram-canvas-DTinVO-g.js";import"./chain-icon-CSqt4TKT.js";import"./service-ClaDHpKh.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-B2AQyKjz.js";import"./address-display-eV6nJOIt.js";import"./web-Bzxja3VH.js";import"./createReactComponent-CTzRdXU5.js";import"./breakpoint-DQ_qwb34.js";import"./useTranslation-_tBHPFow.js";import"./index-746G9wrD.js";import"./IconCheck-BHlGV3u2.js";import"./IconChevronDown-bLlblPo8.js";import"./IconSettings-C3K1cfK_.js";import"./wallet-selector-CIBBuzMZ.js";import"./wallet-mini-card-_1speDCI.js";import"./token-icon-JDu2YzNt.js";import"./LoadingSpinner-C9FyLoGg.js";import"./NumberFlow-client-48rw3j0J-DKr1HO1_.js";import"./amount-display-D9OQ78YF.js";import"./animated-number-D4N1pt_9.js";import"./time-display-CQq4EGzo.js";import"./service-status-alert-CMDgrFyH.js";import"./IconX-B9d2j8J6.js";import"./IconAlertTriangle-2V9b3ygJ.js";import"./IconLock-BXVOEFIn.js";import"./item-9c7fzWbf.js";import"./button-rWrKvQiL.js";import"./useButton-DMMe6EYe.js";import"./useRenderElement-IEsLCaOd.js";import"./dropdown-menu-BgT8kp2s.js";import"./index-BCKtl6zJ.js";import"./index-BCvt4_Ie.js";import"./composite-VLsVwh0o.js";import"./useBaseUiId-B-Nwjyq0.js";import"./useCompositeListItem-Bcwv75DK.js";import"./useRole-CGvSY83d.js";import"./user-profile-BkhL0V4Z.js";import"./avatar-codec-Dq1LG53F.js";import"./bioforest-BSrLTI5l.js";import"./web-Cg6L7J2L.js";import"./notification-W6FDMsB8.js";import"./index-CpA0Y5o_.js";import"./transaction-meta-nUjzoweH.js";import"./IconDots-BnRx0sfW.js";import"./IconShieldCheck-yKfByTnC.js";import"./IconApps-CwGN9KOE.js";import"./IconCoins-CK9bvoST.js";import"./IconSparkles-DKXIN_qI.js";import"./IconTrash-BhUkTzAs.js";import"./transaction-list-XoyZJ70e.js";import"./transaction-item-DsPMIM8y.js";import"./IconRefresh-DJ8iOAy0.js";import"./swipeable-tabs-CNFYpcRp.js";import"./swiper-B5Jhe2ty.js";const F=[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00000000",decimals:8,chain:"bfmeta"},{symbol:"BTC",name:"Bitcoin",balance:"0.00123456",decimals:8,chain:"bfmeta"}],T=[{id:"tx1",type:"receive",status:"confirmed",amount:s.fromRaw("100000000",8,"BFT"),symbol:"BFT",address:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j",timestamp:new Date(Date.now()-36e5),chain:"bfmeta"},{id:"tx2",type:"send",status:"confirmed",amount:s.fromRaw("50000000",8,"BFT"),symbol:"BFT",address:"bAnotherAddress1234567890abcdef",timestamp:new Date(Date.now()-864e5),chain:"bfmeta"}],E=[{id:"0x1a2b3c4d5e6f7890abcdef1234567890abcdef1234567890abcdef1234567890",type:"send",status:"confirmed",amount:s.fromRaw("1000000000000000000",18,"ETH"),symbol:"ETH",address:"0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38",timestamp:new Date(Date.now()-72e5),chain:"ethereum"},{id:"0x2b3c4d5e6f78901abcdef2345678901abcdef2345678901abcdef2345678901",type:"receive",status:"confirmed",amount:s.fromRaw("5000000000000000000",18,"ETH"),symbol:"ETH",address:"0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",timestamp:new Date(Date.now()-864e5),chain:"ethereum"}],w=[{id:"caacd034fd600a9a66cb9c841f39b81101e97e23068c8d73152f8741654139e1",type:"send",status:"confirmed",amount:s.fromRaw("149000000",6,"TRX"),symbol:"TRX",address:"TF17BgPaZYbz8oxbjhriubPDsA7ArKoLX3",timestamp:new Date(Date.now()-36e5),chain:"tron"}],v=[{id:"0xbsc1234567890abcdef1234567890abcdef1234567890abcdef1234567890ab",type:"receive",status:"confirmed",amount:s.fromRaw("10000000000000000000",18,"BNB"),symbol:"BNB",address:"0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",timestamp:new Date(Date.now()-36e5),chain:"binance"}],Ma={title:"Wallet/WalletAddressPortfolio",component:S,parameters:{layout:"fullscreen"},tags:["autodocs"]},c={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:F,transactions:T}},i={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[],tokensLoading:!0,transactionsLoading:!0},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{const o=n.getByTestId("wallet-address-portfolio");e(o).toBeVisible();const f=o.querySelectorAll(".animate-pulse");e(f.length).toBeGreaterThan(0)})}},m={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[]},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{const o=n.getByTestId("wallet-address-portfolio-token-list-empty");e(o).toBeVisible()})}},l={name:"BFMeta - Normal Data",args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00",decimals:8,chain:"bfmeta"}],transactions:T,tokensSupported:!0,transactionsSupported:!0}},p={name:"Ethereum - Normal Data",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"23.683156206881918",decimals:18,chain:"ethereum"},{symbol:"USDC",name:"USD Coin",balance:"1500.00",decimals:6,chain:"ethereum"}],transactions:E,tokensSupported:!0,transactionsSupported:!0}},d={name:"Binance - Normal Data",args:{chainId:"binance",chainName:"BNB Smart Chain",tokens:[{symbol:"BNB",name:"BNB",balance:"234.084063038409",decimals:18,chain:"binance"},{symbol:"BUSD",name:"BUSD",balance:"2000.00",decimals:18,chain:"binance"}],transactions:v,tokensSupported:!0,transactionsSupported:!0}},u={name:"Tron - Normal Data",args:{chainId:"tron",chainName:"Tron",tokens:[{symbol:"TRX",name:"Tron",balance:"163377.648279",decimals:6,chain:"tron"},{symbol:"USDT",name:"Tether",balance:"10000.00",decimals:6,chain:"tron"}],transactions:w,tokensSupported:!0,transactionsSupported:!0}},h={name:"BFMeta - Fallback Warning",args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[{symbol:"BFT",name:"BFT",balance:"0",decimals:8,chain:"bfmeta"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"All 2 provider(s) failed. Last error: Connection timeout",transactionsSupported:!1,transactionsFallbackReason:"No provider implements getTransactionHistory"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},b={name:"Ethereum - Fallback Warning",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"0",decimals:18,chain:"ethereum"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"All providers failed: ethereum-rpc timeout, etherscan rate limited",transactionsSupported:!1,transactionsFallbackReason:"Blockscout API returned 503"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},k={name:"Binance - Fallback Warning",args:{chainId:"binance",chainName:"BNB Smart Chain",tokens:[{symbol:"BNB",name:"BNB",balance:"0",decimals:18,chain:"binance"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"BSC RPC node unreachable",transactionsSupported:!1,transactionsFallbackReason:"BscScan API key exhausted"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},B={name:"Tron - Fallback Warning",args:{chainId:"tron",chainName:"Tron",tokens:[{symbol:"TRX",name:"Tron",balance:"0",decimals:6,chain:"tron"}],transactions:[],tokensSupported:!1,tokensFallbackReason:"TronGrid API rate limit exceeded",transactionsSupported:!1,transactionsFallbackReason:"All Tron providers failed"},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.getAllByTestId("provider-fallback-warning").length).toBeGreaterThanOrEqual(1)})}},y={name:"Partial Fallback - Tokens OK, Transactions Failed",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[{symbol:"ETH",name:"Ethereum",balance:"5.5",decimals:18,chain:"ethereum"}],transactions:[],tokensSupported:!0,transactionsSupported:!1,transactionsFallbackReason:"Etherscan API key invalid"}},g={name:"Empty Data - No Warning (Provider OK)",args:{chainId:"ethereum",chainName:"Ethereum",tokens:[],transactions:[],tokensSupported:!0,transactionsSupported:!0},play:async({canvasElement:a})=>{const n=t(a);await r(()=>{e(n.queryAllByTestId("provider-fallback-warning")).toHaveLength(0)})}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
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
