import{j as e}from"./iframe-DP2WwkEK.js";import{B as a}from"./balance-display-CNP7qbd8.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./amount-display-BO2LBxjd.js";import"./NumberFlow-client-48rw3j0J-B1amY8-Z.js";const y={title:"Token/BalanceDisplay",component:a,tags:["autodocs"],argTypes:{size:{control:"select",options:["sm","md","lg"]},hidden:{control:"boolean"}}},s={args:{value:"1234.5678",symbol:"USDT",fiatValue:"1234.56"}},r={args:{value:"1234567.89",symbol:"TRX",fiatValue:"98765.43"}},l={args:{value:"0.00001234",symbol:"BTC",fiatValue:"0.62"}},t={args:{value:"1234.5678",symbol:"USDT",fiatValue:"1234.56",hidden:!0}},o={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"Small"}),e.jsx(a,{value:"1234.56",symbol:"USDT",fiatValue:"1234.56",size:"sm"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"Medium"}),e.jsx(a,{value:"1234.56",symbol:"USDT",fiatValue:"1234.56",size:"md"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-1 text-xs",children:"Large"}),e.jsx(a,{value:"1234.56",symbol:"USDT",fiatValue:"1234.56",size:"lg"})]})]})},n={args:{value:"100",symbol:"BFM"}},m={render:()=>e.jsxs("div",{className:"space-y-4",children:[e.jsx(a,{value:"2.5",symbol:"ETH",fiatValue:"4500",fiatSymbol:"$"}),e.jsx(a,{value:"10000",symbol:"TRX",fiatValue:"800",fiatSymbol:"¥"}),e.jsx(a,{value:"0.05",symbol:"BTC",fiatValue:"2500",fiatSymbol:"€"})]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    value: '1234.5678',
    symbol: 'USDT',
    fiatValue: '1234.56'
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: '1234567.89',
    symbol: 'TRX',
    fiatValue: '98765.43'
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    value: '0.00001234',
    symbol: 'BTC',
    fiatValue: '0.62'
  }
}`,...l.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: '1234.5678',
    symbol: 'USDT',
    fiatValue: '1234.56',
    hidden: true
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Small</p>
        <BalanceDisplay value="1234.56" symbol="USDT" fiatValue="1234.56" size="sm" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Medium</p>
        <BalanceDisplay value="1234.56" symbol="USDT" fiatValue="1234.56" size="md" />
      </div>
      <div>
        <p className="text-muted-foreground mb-1 text-xs">Large</p>
        <BalanceDisplay value="1234.56" symbol="USDT" fiatValue="1234.56" size="lg" />
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    value: '100',
    symbol: 'BFM'
  }
}`,...n.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-4">
      <BalanceDisplay value="2.5" symbol="ETH" fiatValue="4500" fiatSymbol="$" />
      <BalanceDisplay value="10000" symbol="TRX" fiatValue="800" fiatSymbol="¥" />
      <BalanceDisplay value="0.05" symbol="BTC" fiatValue="2500" fiatSymbol="€" />
    </div>
}`,...m.parameters?.docs?.source}}};const b=["Default","LargeNumber","SmallNumber","Hidden","AllSizes","WithoutFiat","DifferentCurrencies"];export{o as AllSizes,s as Default,m as DifferentCurrencies,t as Hidden,r as LargeNumber,l as SmallNumber,n as WithoutFiat,b as __namedExportsOrder,y as default};
