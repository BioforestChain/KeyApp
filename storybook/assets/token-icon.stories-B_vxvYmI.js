import{j as e}from"./iframe-aa7wC7o-.js";import{T as n,a as p,b as g}from"./token-icon-r4ebXk9x.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";const h=s=>({bfmeta:["/icons/bfmeta/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/bfm"],ccchain:["/icons/ccchain/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/ccc"],pmchain:["/icons/pmchain/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/pmc"],bfchainv2:["/icons/bfchainv2/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/bftv2"],btgmeta:["/icons/btgmeta/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/btgm"],ethmeta:["/icons/ethmeta/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/ethm"],ethereum:["/icons/ethereum/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/eth"],binance:["/icons/binance/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/bsc"],tron:["/icons/tron/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/tron"],bitcoin:["/icons/bitcoin/tokens","https://bfm-fonts-cdn.oss-cn-hongkong.aliyuncs.com/meta-icon/btcm"]})[s]??[],y={title:"Wallet/TokenIcon",component:n,tags:["autodocs"],decorators:[s=>e.jsx(p,{getTokenIconBases:h,children:e.jsx(s,{})})],argTypes:{symbol:{control:"select",options:["ETH","BTC","BFM","USDT","USDC","TRX","BNB","CCC","PMC"]},chainId:{control:"select",options:["ethereum","bitcoin","bfmeta","tron","binance","ccchain","pmchain"]},size:{control:"select",options:["xs","sm","md","lg"]}}},d=[{symbol:"BFM",chainId:"bfmeta"},{symbol:"CCC",chainId:"ccchain"},{symbol:"PMC",chainId:"pmchain"},{symbol:"BFT",chainId:"bfchainv2"},{symbol:"BTGM",chainId:"btgmeta"},{symbol:"ETHM",chainId:"ethmeta"},{symbol:"ETH",chainId:"ethereum"},{symbol:"BNB",chainId:"binance"},{symbol:"TRX",chainId:"tron"},{symbol:"BTC",chainId:"bitcoin"},{symbol:"USDT",chainId:"ethereum"},{symbol:"USDM",chainId:"bfmeta"}],o={args:{symbol:"BFM",chainId:"bfmeta",size:"md"}},c={name:"With imageUrl (priority over chainId)",args:{symbol:"BTC",imageUrl:"https://cryptologos.cc/logos/bitcoin-btc-logo.png",size:"lg"}},t={render:()=>e.jsx("div",{className:"flex flex-wrap gap-4",children:d.map(({symbol:s,chainId:a})=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(n,{symbol:s,chainId:a,size:"lg"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:s})]},`${a}-${s}`))})},m={render:()=>e.jsx("div",{className:"flex items-end gap-4",children:["xs","sm","md","lg"].map(s=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(n,{symbol:"BFM",chainId:"bfmeta",size:s}),e.jsx("span",{className:"text-muted-foreground text-xs",children:s})]},s))})},l={render:()=>e.jsx("div",{className:"flex flex-wrap gap-2",children:d.slice(0,8).map(({symbol:s,chainId:a})=>e.jsx(g,{symbol:s,chainId:a},`${a}-${s}`))})},r={name:"Letter Fallback (No Icons)",render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx("p",{className:"text-muted-foreground text-sm",children:"No chainId, no imageUrl - shows first letter:"}),e.jsx("div",{className:"flex flex-wrap gap-4",children:["ABC","XYZ","TEST","NEW"].map(s=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(n,{symbol:s,size:"lg"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:s})]},s))})]})},i={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-card flex items-center gap-3 rounded-lg p-3",children:[e.jsx(n,{symbol:"BFM",chainId:"bfmeta",size:"lg"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:"BFMeta"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"BFM"})]}),e.jsx("span",{className:"font-semibold",children:"50,000 BFM"})]}),e.jsxs("div",{className:"bg-card flex items-center gap-3 rounded-lg p-3",children:[e.jsx(n,{symbol:"ETH",chainId:"ethereum",size:"lg"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:"Ethereum"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"ETH"})]}),e.jsx("span",{className:"font-semibold",children:"2.5 ETH"})]}),e.jsxs("div",{className:"bg-card flex items-center gap-3 rounded-lg p-3",children:[e.jsx(n,{symbol:"USDT",imageUrl:"https://cryptologos.cc/logos/tether-usdt-logo.png",size:"lg"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:"Tether USD"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"USDT"})]}),e.jsx("span",{className:"font-semibold",children:"1,000.00 USDT"})]})]})};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    symbol: 'BFM',
    chainId: 'bfmeta',
    size: 'md'
  }
}`,...o.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  name: 'With imageUrl (priority over chainId)',
  args: {
    symbol: 'BTC',
    imageUrl: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
    size: 'lg'
  }
}`,...c.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-4">
      {tokensByChain.map(({
      symbol,
      chainId
    }) => <div key={\`\${chainId}-\${symbol}\`} className="flex flex-col items-center gap-1">
          <TokenIcon symbol={symbol} chainId={chainId} size="lg" />
          <span className="text-muted-foreground text-xs">{symbol}</span>
        </div>)}
    </div>
}`,...t.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-end gap-4">
      {(['xs', 'sm', 'md', 'lg'] as const).map(size => <div key={size} className="flex flex-col items-center gap-1">
          <TokenIcon symbol="BFM" chainId="bfmeta" size={size} />
          <span className="text-muted-foreground text-xs">{size}</span>
        </div>)}
    </div>
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">
      {tokensByChain.slice(0, 8).map(({
      symbol,
      chainId
    }) => <TokenBadge key={\`\${chainId}-\${symbol}\`} symbol={symbol} chainId={chainId} />)}
    </div>
}`,...l.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  name: 'Letter Fallback (No Icons)',
  render: () => <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        No chainId, no imageUrl - shows first letter:
      </p>
      <div className="flex flex-wrap gap-4">
        {['ABC', 'XYZ', 'TEST', 'NEW'].map(symbol => <div key={symbol} className="flex flex-col items-center gap-1">
            <TokenIcon symbol={symbol} size="lg" />
            <span className="text-muted-foreground text-xs">{symbol}</span>
          </div>)}
      </div>
    </div>
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="BFM" chainId="bfmeta" size="lg" />
        <div className="flex-1">
          <p className="font-medium">BFMeta</p>
          <p className="text-muted-foreground text-sm">BFM</p>
        </div>
        <span className="font-semibold">50,000 BFM</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="ETH" chainId="ethereum" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Ethereum</p>
          <p className="text-muted-foreground text-sm">ETH</p>
        </div>
        <span className="font-semibold">2.5 ETH</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <TokenIcon symbol="USDT" imageUrl="https://cryptologos.cc/logos/tether-usdt-logo.png" size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tether USD</p>
          <p className="text-muted-foreground text-sm">USDT</p>
        </div>
        <span className="font-semibold">1,000.00 USDT</span>
      </div>
    </div>
}`,...i.parameters?.docs?.source}}};const N=["Default","WithImageUrl","AllTokens","AllSizes","Badges","FallbackOnly","InContext"];export{m as AllSizes,t as AllTokens,l as Badges,o as Default,r as FallbackOnly,i as InContext,c as WithImageUrl,N as __namedExportsOrder,y as default};
