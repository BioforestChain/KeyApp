import{j as e}from"./iframe-Cd1kewla.js";import{C as a,a as d}from"./chain-icon-DyZLxnGT.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./service-DEDe-FPR.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-C7zok9CF.js";const I={title:"Wallet/ChainIcon",component:a,tags:["autodocs"],argTypes:{chainId:{control:"select",options:["ethereum","tron","bsc","bitcoin","bfmeta","btgmeta","ethmeta","ccc"]},size:{control:"select",options:["sm","md","lg"]}}},o=["ethereum","tron","bsc","bitcoin","bfmeta","btgmeta","ethmeta","ccc"],n={ethereum:"/icons/chains/ethereum.svg",tron:"/icons/chains/tron.svg",bitcoin:"/icons/chains/bitcoin.svg",binance:"/icons/chains/binance.svg",bfmeta:"/icons/chains/bfmeta.svg",btgmeta:"/icons/chains/btgmeta.svg",ethmeta:"/icons/chains/ethmeta.svg",ccchain:"/icons/chains/ccchain.svg",pmchain:"/icons/chains/pmchain.svg",bfchainv2:"/icons/chains/bfchainv2.svg"},c={args:{chainId:"ethereum",size:"md"}},r={render:()=>e.jsx("div",{className:"flex flex-wrap gap-4",children:o.map(s=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(a,{chainId:s,iconUrl:n[s],size:"lg"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:s})]},s))})},i={render:()=>e.jsx("div",{className:"flex flex-wrap gap-4",children:o.map(s=>e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(a,{chainId:s,size:"lg"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:s})]},s))})},t={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(a,{chainId:"ethereum",iconUrl:n.ethereum,size:"sm"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"sm"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(a,{chainId:"ethereum",iconUrl:n.ethereum,size:"md"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"md"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(a,{chainId:"ethereum",iconUrl:n.ethereum,size:"lg"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"lg"})]})]})},l={render:()=>e.jsx("div",{className:"flex flex-wrap gap-2",children:o.map(s=>e.jsx(d,{chainId:s,iconUrl:n[s]},s))})},m={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"bg-card flex items-center gap-3 rounded-lg p-3",children:[e.jsx(a,{chainId:"ethereum",iconUrl:n.ethereum,size:"lg"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:"Ethereum"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"0x1234...5678"})]}),e.jsx("span",{className:"font-semibold",children:"2.5 ETH"})]}),e.jsxs("div",{className:"bg-card flex items-center gap-3 rounded-lg p-3",children:[e.jsx(a,{chainId:"tron",iconUrl:n.tron,size:"lg"}),e.jsxs("div",{className:"flex-1",children:[e.jsx("p",{className:"font-medium",children:"Tron"}),e.jsx("p",{className:"text-muted-foreground text-sm",children:"TAbcd...xyz"})]}),e.jsx("span",{className:"font-semibold",children:"10,000 TRX"})]})]})};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    chainId: 'ethereum',
    size: 'md'
  }
}`,...c.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-4">
      {allChains.map(chain => <div key={chain} className="flex flex-col items-center gap-1">
          <ChainIcon chainId={chain} iconUrl={chainIcons[chain]} size="lg" />
          <span className="text-muted-foreground text-xs">{chain}</span>
        </div>)}
    </div>
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-4">
      {allChains.map(chain => <div key={chain} className="flex flex-col items-center gap-1">
          <ChainIcon chainId={chain} size="lg" />
          <span className="text-muted-foreground text-xs">{chain}</span>
        </div>)}
    </div>
}`,...i.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="sm" />
        <span className="text-muted-foreground text-xs">sm</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="md" />
        <span className="text-muted-foreground text-xs">md</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="lg" />
        <span className="text-muted-foreground text-xs">lg</span>
      </div>
    </div>
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-2">
      {allChains.map(chain => <ChainBadge key={chain} chainId={chain} iconUrl={chainIcons[chain]} />)}
    </div>
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <ChainIcon chainId="ethereum" iconUrl={chainIcons.ethereum} size="lg" />
        <div className="flex-1">
          <p className="font-medium">Ethereum</p>
          <p className="text-muted-foreground text-sm">0x1234...5678</p>
        </div>
        <span className="font-semibold">2.5 ETH</span>
      </div>
      <div className="bg-card flex items-center gap-3 rounded-lg p-3">
        <ChainIcon chainId="tron" iconUrl={chainIcons.tron} size="lg" />
        <div className="flex-1">
          <p className="font-medium">Tron</p>
          <p className="text-muted-foreground text-sm">TAbcd...xyz</p>
        </div>
        <span className="font-semibold">10,000 TRX</span>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};const j=["Default","WithSvgIcon","FallbackOnly","AllSizes","Badges","InContext"];export{t as AllSizes,l as Badges,c as Default,i as FallbackOnly,m as InContext,r as WithSvgIcon,j as __namedExportsOrder,I as default};
