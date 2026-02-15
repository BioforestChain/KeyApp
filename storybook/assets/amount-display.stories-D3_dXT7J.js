import{j as e}from"./iframe-DZOLjtV7.js";import{A as s,a as x}from"./amount-display-B2wBnd3z.js";import"./preload-helper-PPVm8Dsz.js";import"./NumberFlow-client-48rw3j0J-BFSBwUv_.js";import"./utils-4perknFd.js";const j={title:"Common/AmountDisplay",component:s,tags:["autodocs"],argTypes:{sign:{control:"select",options:["auto","always","never"]},color:{control:"select",options:["auto","default","positive","negative"]},size:{control:"select",options:["xs","sm","md","lg","xl"]},weight:{control:"select",options:["normal","medium","semibold","bold"]}}},t={args:{value:1234.5678,symbol:"USDT"}},l={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsx("div",{children:e.jsx(s,{value:1234.56,symbol:"USDT",size:"xs"})}),e.jsx("div",{children:e.jsx(s,{value:1234.56,symbol:"USDT",size:"sm"})}),e.jsx("div",{children:e.jsx(s,{value:1234.56,symbol:"USDT",size:"md"})}),e.jsx("div",{children:e.jsx(s,{value:1234.56,symbol:"USDT",size:"lg"})}),e.jsx("div",{children:e.jsx(s,{value:1234.56,symbol:"USDT",size:"xl"})})]})},n={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{className:"flex gap-4",children:[e.jsx(s,{value:100,sign:"always",color:"auto"}),e.jsx(s,{value:-50,sign:"always",color:"auto"})]}),e.jsx("p",{className:"text-muted-foreground text-sm",children:'sign="always" + color="auto"'})]})},o={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{children:[e.jsx(s,{value:1234,compact:!0})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(1,234)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:12345,compact:!0})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(12,345)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:1234567,compact:!0})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(1,234,567)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:1234567890,compact:!0})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(1,234,567,890)"})]})]})},r={args:{value:1234.56,symbol:"USDT",hidden:!0}},i={args:{value:123456789e-2,mono:!0,weight:"semibold"}},m={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{children:[e.jsx(s,{value:.1})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(0.1)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:.01})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(0.01)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:.001})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(0.001)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:1e-4})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(0.0001)"})]}),e.jsxs("div",{children:[e.jsx(s,{value:1e-5})," ",e.jsx("span",{className:"text-muted-foreground text-sm",children:"(0.00001)"})]})]})},d={render:()=>e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-2 text-sm",children:"Vertical (default)"}),e.jsx(x,{value:2.5,symbol:"ETH",fiatValue:4500,weight:"semibold",size:"lg"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-2 text-sm",children:"Horizontal"}),e.jsx(x,{value:100,symbol:"USDT",fiatValue:100,layout:"horizontal"})]})]})},c={render:()=>e.jsxs("div",{className:"flex flex-col gap-2",children:[e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-muted-foreground",children:"BTC:"}),e.jsx(s,{value:45e3,symbol:"$",weight:"semibold"}),e.jsx(s,{value:5.2,sign:"always",color:"auto",size:"sm"}),e.jsx("span",{className:"text-green-500 text-sm",children:"%"})]}),e.jsxs("div",{className:"flex items-center gap-2",children:[e.jsx("span",{className:"text-muted-foreground",children:"ETH:"}),e.jsx(s,{value:1800,symbol:"$",weight:"semibold"}),e.jsx(s,{value:-2.3,sign:"always",color:"auto",size:"sm"}),e.jsx("span",{className:"text-destructive text-sm",children:"%"})]})]})},u={render:()=>e.jsx("div",{className:"flex flex-col gap-3",children:[{symbol:"USDT",balance:1234.56,fiat:1234.56},{symbol:"ETH",balance:2.5,fiat:4500},{symbol:"BTC",balance:.05,fiat:2250}].map(a=>e.jsxs("div",{className:"flex items-center justify-between",children:[e.jsx("span",{className:"font-medium",children:a.symbol}),e.jsx(x,{value:a.balance,fiatValue:a.fiat,weight:"semibold",className:"text-right"})]},a.symbol))})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    value: 1234.5678,
    symbol: 'USDT'
  }
}`,...t.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="xs" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="sm" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="md" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="lg" />
      </div>
      <div>
        <AmountDisplay value={1234.56} symbol="USDT" size="xl" />
      </div>
    </div>
}`,...l.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <div className="flex gap-4">
        <AmountDisplay value={100} sign="always" color="auto" />
        <AmountDisplay value={-50} sign="always" color="auto" />
      </div>
      <p className="text-muted-foreground text-sm">sign="always" + color="auto"</p>
    </div>
}`,...n.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <div>
        <AmountDisplay value={1234} compact /> <span className="text-muted-foreground text-sm">(1,234)</span>
      </div>
      <div>
        <AmountDisplay value={12345} compact /> <span className="text-muted-foreground text-sm">(12,345)</span>
      </div>
      <div>
        <AmountDisplay value={1234567} compact /> <span className="text-muted-foreground text-sm">(1,234,567)</span>
      </div>
      <div>
        <AmountDisplay value={1234567890} compact />{' '}
        <span className="text-muted-foreground text-sm">(1,234,567,890)</span>
      </div>
    </div>
}`,...o.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    value: 1234.56,
    symbol: 'USDT',
    hidden: true
  }
}`,...r.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    value: 1234567.89,
    mono: true,
    weight: 'semibold'
  }
}`,...i.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <div>
        <AmountDisplay value={0.1} /> <span className="text-muted-foreground text-sm">(0.1)</span>
      </div>
      <div>
        <AmountDisplay value={0.01} /> <span className="text-muted-foreground text-sm">(0.01)</span>
      </div>
      <div>
        <AmountDisplay value={0.001} /> <span className="text-muted-foreground text-sm">(0.001)</span>
      </div>
      <div>
        <AmountDisplay value={0.0001} /> <span className="text-muted-foreground text-sm">(0.0001)</span>
      </div>
      <div>
        <AmountDisplay value={0.00001} /> <span className="text-muted-foreground text-sm">(0.00001)</span>
      </div>
    </div>
}`,...m.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-4">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Vertical (default)</p>
        <AmountWithFiat value={2.5} symbol="ETH" fiatValue={4500} weight="semibold" size="lg" />
      </div>
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Horizontal</p>
        <AmountWithFiat value={100} symbol="USDT" fiatValue={100} layout="horizontal" />
      </div>
    </div>
}`,...d.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">BTC:</span>
        <AmountDisplay value={45000} symbol="$" weight="semibold" />
        <AmountDisplay value={5.2} sign="always" color="auto" size="sm" />
        <span className="text-green-500 text-sm">%</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-muted-foreground">ETH:</span>
        <AmountDisplay value={1800} symbol="$" weight="semibold" />
        <AmountDisplay value={-2.3} sign="always" color="auto" size="sm" />
        <span className="text-destructive text-sm">%</span>
      </div>
    </div>
}`,...c.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => <div className="flex flex-col gap-3">
      {[{
      symbol: 'USDT',
      balance: 1234.56,
      fiat: 1234.56
    }, {
      symbol: 'ETH',
      balance: 2.5,
      fiat: 4500
    }, {
      symbol: 'BTC',
      balance: 0.05,
      fiat: 2250
    }].map(token => <div key={token.symbol} className="flex items-center justify-between">
          <span className="font-medium">{token.symbol}</span>
          <AmountWithFiat value={token.balance} fiatValue={token.fiat} weight="semibold" className="text-right" />
        </div>)}
    </div>
}`,...u.parameters?.docs?.source}}};const y=["Default","Sizes","WithSign","Compact","Hidden","MonoFont","SmallNumbers","WithFiat","PriceChange","TokenList"];export{o as Compact,t as Default,r as Hidden,i as MonoFont,c as PriceChange,l as Sizes,m as SmallNumbers,u as TokenList,d as WithFiat,n as WithSign,y as __namedExportsOrder,j as default};
