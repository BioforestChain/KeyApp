import{j as e}from"./iframe-CW0HKnfK.js";import{W as s}from"./wallet-mini-card-EDDYL8mK.js";import{W as p}from"./useWalletTheme-FlqEZv_N.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./hologram-canvas-DiHA3xv_.js";import"./useTranslation-cFSh0vM6.js";import"./index-CcSC0LoF.js";import"./user-profile-D4JtskIT.js";import"./index-D0E7N0oa.js";import"./derivation-KwxdGrFy.js";import"./schemas-CO8_C8zP.js";import"./avatar-codec-BiPEklkx.js";import"./service-CDZC6le2.js";import"./bioforest-C_hmEQYa.js";const a="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iYmxhY2siPjxwYXRoIGQ9Ik02IDRoOGE0IDQgMCAwIDEgMCA4aC0yYTQgNCAwIDAgMSAwIDhINlY0em0yIDJ2NGg2YTIgMiAwIDEgMCAwLTRIOHptMCA2djRoNmEyIDIgMCAxIDAgMC00SDh6Ii8+PC9zdmc+",h="/icons/bfmeta/chain.svg",O={title:"Wallet/WalletMiniCard",component:s,tags:["autodocs"],argTypes:{themeHue:{control:{type:"range",min:0,max:360,step:1}},size:{control:{type:"select"},options:["xs","sm","md"]},showPattern:{control:{type:"boolean"}},watermarkIconUrl:{control:{type:"text"}}}},r={args:{themeHue:323,size:"sm",showPattern:!0}},n={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:323,size:"xs"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"xs (20×12)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:323,size:"sm"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"sm (32×20)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:323,size:"md"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"md (44×28)"})]})]})},m={render:()=>e.jsx("div",{className:"flex flex-wrap gap-3",children:p.map(({name:u,hue:t})=>e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:t,size:"md"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:u})]},t))})},l={args:{themeHue:323,size:"md",showPattern:!0,watermarkIconUrl:a}},i={args:{themeHue:250,size:"md",showPattern:!0,watermarkIconUrl:h}},c={args:{themeHue:250,size:"md",showPattern:!1}},d={render:()=>e.jsxs("div",{className:"flex flex-col gap-8 p-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"mb-2 text-sm font-medium",children:"彩虹水印效果 (内联 SVG)"}),e.jsxs("div",{className:"flex items-end gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx("div",{className:"flex size-20 items-center justify-center rounded-lg bg-muted",children:e.jsx(s,{themeHue:323,size:"md",watermarkIconUrl:a})}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"md"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx("div",{className:"flex size-16 items-center justify-center rounded-lg bg-muted",children:e.jsx(s,{themeHue:250,size:"sm",watermarkIconUrl:a})}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"sm"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx("div",{className:"flex size-12 items-center justify-center rounded-lg bg-muted",children:e.jsx(s,{themeHue:145,size:"xs",watermarkIconUrl:a})}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"xs"})]})]})]}),e.jsxs("div",{children:[e.jsx("h3",{className:"mb-2 text-sm font-medium",children:"对比：无水印 vs 有水印"}),e.jsxs("div",{className:"flex gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(s,{themeHue:323,size:"md"}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"无水印"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-1",children:[e.jsx(s,{themeHue:323,size:"md",watermarkIconUrl:a}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"有水印"})]})]})]})]})},o={render:()=>e.jsxs("div",{className:"flex items-center gap-4",children:[e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:323,size:"xs",watermarkIconUrl:a}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"xs (20x12)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:323,size:"sm",watermarkIconUrl:a}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"sm (32x20)"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(s,{themeHue:323,size:"md",watermarkIconUrl:a}),e.jsx("span",{className:"text-xs text-muted-foreground",children:"md (44x28)"})]})]})},x={render:()=>e.jsx("div",{className:"w-80 space-y-2 rounded-xl bg-background p-4",children:[{name:"主钱包",hue:323},{name:"交易账户",hue:250},{name:"储蓄",hue:145}].map(({name:u,hue:t})=>e.jsxs("div",{className:"flex items-center gap-3 rounded-lg bg-muted/50 p-3",children:[e.jsx(s,{themeHue:t,size:"sm",watermarkIconUrl:a}),e.jsx("span",{className:"font-medium",children:u})]},t))})};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    themeHue: 323,
    size: 'sm',
    showPattern: true
  }
}`,...r.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="xs" />
        <span className="text-xs text-muted-foreground">xs (20×12)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="sm" />
        <span className="text-xs text-muted-foreground">sm (32×20)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="md" />
        <span className="text-xs text-muted-foreground">md (44×28)</span>
      </div>
    </div>
}`,...n.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-wrap gap-3">
      {WALLET_THEME_COLORS.map(({
      name,
      hue
    }) => <div key={hue} className="flex flex-col items-center gap-2">
          <WalletMiniCard themeHue={hue} size="md" />
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>)}
    </div>
}`,...m.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    themeHue: 323,
    size: 'md',
    showPattern: true,
    watermarkIconUrl: DEMO_ICON_URL
  }
}`,...l.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    themeHue: 250,
    size: 'md',
    showPattern: true,
    watermarkIconUrl: CHAIN_ICON_URL
  }
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    themeHue: 250,
    size: 'md',
    showPattern: false
  }
}`,...c.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-8 p-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">彩虹水印效果 (内联 SVG)</h3>
        <div className="flex items-end gap-4">
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-20 items-center justify-center rounded-lg bg-muted">
              <WalletMiniCard themeHue={323} size="md" watermarkIconUrl={DEMO_ICON_URL} />
            </div>
            <span className="text-xs text-muted-foreground">md</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-16 items-center justify-center rounded-lg bg-muted">
              <WalletMiniCard themeHue={250} size="sm" watermarkIconUrl={DEMO_ICON_URL} />
            </div>
            <span className="text-xs text-muted-foreground">sm</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex size-12 items-center justify-center rounded-lg bg-muted">
              <WalletMiniCard themeHue={145} size="xs" watermarkIconUrl={DEMO_ICON_URL} />
            </div>
            <span className="text-xs text-muted-foreground">xs</span>
          </div>
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">对比：无水印 vs 有水印</h3>
        <div className="flex gap-4">
          <div className="flex flex-col items-center gap-1">
            <WalletMiniCard themeHue={323} size="md" />
            <span className="text-xs text-muted-foreground">无水印</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <WalletMiniCard themeHue={323} size="md" watermarkIconUrl={DEMO_ICON_URL} />
            <span className="text-xs text-muted-foreground">有水印</span>
          </div>
        </div>
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex items-center gap-4">
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="xs" watermarkIconUrl={DEMO_ICON_URL} />
        <span className="text-xs text-muted-foreground">xs (20x12)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="sm" watermarkIconUrl={DEMO_ICON_URL} />
        <span className="text-xs text-muted-foreground">sm (32x20)</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <WalletMiniCard themeHue={323} size="md" watermarkIconUrl={DEMO_ICON_URL} />
        <span className="text-xs text-muted-foreground">md (44x28)</span>
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => <div className="w-80 space-y-2 rounded-xl bg-background p-4">
      {[{
      name: '主钱包',
      hue: 323
    }, {
      name: '交易账户',
      hue: 250
    }, {
      name: '储蓄',
      hue: 145
    }].map(({
      name,
      hue
    }) => <div key={hue} className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
          <WalletMiniCard themeHue={hue} size="sm" watermarkIconUrl={DEMO_ICON_URL} />
          <span className="font-medium">{name}</span>
        </div>)}
    </div>
}`,...x.parameters?.docs?.source}}};const b=["Default","AllSizes","AllThemeColors","WithWatermark","WithChainIcon","WithoutPattern","RainbowWatermarkShowcase","AllSizesWithWatermark","InListContext"];export{n as AllSizes,o as AllSizesWithWatermark,m as AllThemeColors,r as Default,x as InListContext,d as RainbowWatermarkShowcase,i as WithChainIcon,l as WithWatermark,c as WithoutPattern,b as __namedExportsOrder,O as default};
