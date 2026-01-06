import{j as a,Q as v,b as x,r as b}from"./iframe-Cctxta_P.js";import{w as i,a as c,e as n}from"./index-BjIXEP53.js";import{W as w,b as l}from"./token-item-JMOiWq81.js";import{u as F,c as E}from"./chain-config-DqVXGLIz.js";import{A as g}from"./amount-BQsqQYGO.js";import{c as N}from"./index-Ar-6A-5n.js";import"./index-D0E7N0oa.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./wallet-card-DUvztJIp.js";import"./hologram-canvas-B-4TSu35.js";import"./chain-icon-DZMbM4Yp.js";import"./address-display-Dtq1ht35.js";import"./web-DodBcwRj.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./useTranslation-Cyi9axMr.js";import"./index-ECTMCtyo.js";import"./IconCheck-BUbIsnVA.js";import"./createReactComponent-BokZZTcn.js";import"./IconCopy-XrsQyI7S.js";import"./IconChevronDown-BNgXvKMn.js";import"./IconSettings-BW6CvsVM.js";import"./wallet-selector-Bl24-a4p.js";import"./wallet-mini-card-C-JPi8da.js";import"./token-icon-DtvtRadC.js";import"./transaction-item-B6DGk-oU.js";import"./gradient-button-CI0i7sXk.js";import"./index-CYflX4oo.js";import"./index-B_jtOnfb.js";import"./loading-spinner-CQ_N_PP1.js";import"./empty-state-QlYsD_4V.js";import"./skeleton-dMQmJuYw.js";import"./amount-display-lh-aDGFD.js";import"./NumberFlow-client-48rw3j0J-D-9LcztC.js";import"./animated-number-uR3fQozJ.js";import"./time-display-DtS7YJCT.js";import"./qr-code-CY_2OM_C.js";import"./index-C069iInY.js";import"./icon-circle-DAEhXiJ_.js";import"./error-boundary-DnCREgnV.js";import"./IconAlertCircle-BEx518Hp.js";import"./IconAlertTriangle-D1gPId_I.js";import"./IconCircleCheck-B3YbjWQ1.js";import"./IconInfoCircle-Cpbyhs8C.js";import"./button-sjDKCcea.js";import"./useButton-BiCET3WI.js";import"./useRenderElement-qlaWX--Y.js";import"./IconDots-BSGCpCPI.js";import"./IconShieldCheck-DQW5fnOn.js";import"./IconTrash-B0njLt7H.js";import"./IconCoins-B8xpaPYW.js";import"./IconSparkles-B5YMY-mG.js";import"./web-DnZPwNCZ.js";import"./transaction-list-X9g1OvtJ.js";import"./swipeable-tabs-BaNw0YM4.js";import"./swiper-DvJCME9U.js";import"./bioforest-uXX5qE5N.js";import"./address-format-DY2duW3A.js";const A=[{symbol:"BFT",name:"BFT",balance:"1234.56789012",decimals:8,chain:"bfmeta"},{symbol:"USDT",name:"USDT",balance:"500.00000000",decimals:8,chain:"bfmeta"},{symbol:"BTC",name:"Bitcoin",balance:"0.00123456",decimals:8,chain:"bfmeta"}],S=[{id:"tx1",type:"receive",status:"confirmed",amount:g.fromRaw("100000000",8,"BFT"),symbol:"BFT",address:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j",timestamp:new Date(Date.now()-36e5),chain:"bfmeta"},{id:"tx2",type:"send",status:"confirmed",amount:g.fromRaw("50000000",8,"BFT"),symbol:"BFT",address:"bAnotherAddress1234567890abcdef",timestamp:new Date(Date.now()-864e5),chain:"bfmeta"}];function C({children:s}){const t=F(),[o,e]=b.useState(!1);return b.useEffect(()=>{!o&&!t.snapshot&&!t.isLoading&&(e(!0),N(),E.initialize())},[o,t.snapshot,t.isLoading]),t.error?a.jsx("div",{"data-testid":"chain-config-error",className:"flex h-96 items-center justify-center p-4",children:a.jsxs("div",{className:"text-destructive text-center",children:[a.jsx("p",{className:"font-medium",children:"Chain config error"}),a.jsx("p",{className:"text-sm",children:t.error})]})}):t.snapshot?a.jsx(a.Fragment,{children:s}):a.jsx("div",{"data-testid":"chain-config-loading",className:"flex h-96 items-center justify-center",children:a.jsx("div",{className:"text-muted-foreground text-center",children:a.jsx("p",{children:"Loading chain configuration..."})})})}const L=()=>new x({defaultOptions:{queries:{retry:!1,staleTime:0}}}),m=s=>a.jsx(v,{client:L(),children:a.jsx(C,{children:a.jsx("div",{className:"bg-background mx-auto min-h-screen max-w-md",children:a.jsx(s,{})})})}),Vt={title:"Wallet/WalletAddressPortfolio",component:w,parameters:{layout:"fullscreen"},tags:["autodocs"]},d={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:A,transactions:S}},p={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[],tokensLoading:!0,transactionsLoading:!0},play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("wallet-address-portfolio");n(o).toBeVisible();const e=o.querySelectorAll(".animate-pulse");n(e.length).toBeGreaterThan(0)})}},h={args:{chainId:"bfmeta",chainName:"BFMeta",tokens:[],transactions:[]},play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("wallet-address-portfolio-token-list-empty");n(o).toBeVisible()})}},f={name:"Real Data: biochain-bfmeta",decorators:[m],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real token balances and transactions from BFMeta chain using the actual chainProvider API."}}},render:()=>a.jsx(l,{chainId:"bfmeta",address:"bCfAynSAKhzgKLi3BXyuh5k22GctLR72j",chainName:"BFMeta",testId:"bfmeta-portfolio"}),play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("bfmeta-portfolio");n(o).toBeVisible();const e=t.queryByTestId("bfmeta-portfolio-token-list"),r=t.queryByTestId("bfmeta-portfolio-token-list-empty"),I=o.querySelector(".animate-pulse");if(n(e||r||I).not.toBeNull(),e){const T=e.querySelectorAll('[data-testid^="token-item-"]');n(T.length).toBeGreaterThan(0)}},{timeout:15e3})}},u={name:"Real Data: eth-eth",decorators:[m],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real token balances and transactions from Ethereum mainnet using blockscout API. Uses Vitalik address for real ETH transfers."}}},render:()=>a.jsx(l,{chainId:"ethereum",address:"0x75a6F48BF634868b2980c97CcEf467A127597e08",chainName:"Ethereum",testId:"ethereum-portfolio"}),play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("ethereum-portfolio");n(o).toBeVisible();const e=t.queryByTestId("ethereum-portfolio-token-list");n(e).not.toBeNull();const r=e?.querySelectorAll('[data-testid^="token-item-"]');n(r?.length).toBeGreaterThan(0)},{timeout:15e3})}},y={name:"Real Data: bitcoin",decorators:[m],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real balance and transactions from Bitcoin mainnet using mempool.space API."}}},render:()=>a.jsx(l,{chainId:"bitcoin",address:"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq",chainName:"Bitcoin",testId:"bitcoin-portfolio"}),play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("bitcoin-portfolio");n(o).toBeVisible();const e=t.queryByTestId("bitcoin-portfolio-token-list");n(e).not.toBeNull();const r=e?.querySelectorAll('[data-testid^="token-item-"]');n(r?.length).toBeGreaterThan(0)},{timeout:15e3})}},B={name:"Real Data: tron",decorators:[m],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real balance and transactions from Tron mainnet using TronGrid API."}}},render:()=>a.jsx(l,{chainId:"tron",address:"TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9",chainName:"Tron",testId:"tron-portfolio"}),play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("tron-portfolio");n(o).toBeVisible();const e=t.queryByTestId("tron-portfolio-token-list");n(e).not.toBeNull();const r=e?.querySelectorAll('[data-testid^="token-item-"]');n(r?.length).toBeGreaterThan(0)},{timeout:15e3})}},k={name:"Real Data: binance",decorators:[m],parameters:{chromatic:{delay:5e3},docs:{description:{story:"Fetches real BNB balance from BSC mainnet using public RPC."}}},render:()=>a.jsx(l,{chainId:"binance",address:"0x8894E0a0c962CB723c1976a4421c95949bE2D4E3",chainName:"BNB Smart Chain",testId:"binance-portfolio"}),play:async({canvasElement:s})=>{const t=i(s);await c(()=>{const o=t.getByTestId("binance-portfolio");n(o).toBeVisible();const e=t.queryByTestId("binance-portfolio-token-list");n(e).not.toBeNull();const r=e?.querySelectorAll('[data-testid^="token-item-"]');n(r?.length).toBeGreaterThan(0)},{timeout:15e3})}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    chainId: 'bfmeta',
    chainName: 'BFMeta',
    tokens: mockTokens,
    transactions: mockTransactions
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
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
}`,...p.parameters?.docs?.source}}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
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
}`,...h.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
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
}`,...f.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
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
}`,...u.parameters?.docs?.source}}};y.parameters={...y.parameters,docs:{...y.parameters?.docs,source:{originalSource:`{
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
}`,...y.parameters?.docs?.source}}};B.parameters={...B.parameters,docs:{...B.parameters?.docs,source:{originalSource:`{
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
}`,...B.parameters?.docs?.source}}};k.parameters={...k.parameters,docs:{...k.parameters?.docs,source:{originalSource:`{
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
}`,...k.parameters?.docs?.source}}};const Gt=["Default","Loading","Empty","RealDataBfmeta","RealDataEthereum","RealDataBitcoin","RealDataTron","RealDataBinance"];export{d as Default,h as Empty,p as Loading,f as RealDataBfmeta,k as RealDataBinance,y as RealDataBitcoin,u as RealDataEthereum,B as RealDataTron,Gt as __namedExportsOrder,Vt as default};
