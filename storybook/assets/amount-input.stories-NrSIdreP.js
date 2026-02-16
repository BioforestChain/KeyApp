import{j as t,r as T}from"./iframe-BWeqjITw.js";import{A as s}from"./amount-input-Bg0-FeTI.js";import{A as x}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-xI2qK3OI.js";import"./index-Cz6VFDXe.js";const j={title:"Transfer/AmountInput",component:s,tags:["autodocs"]},e=(a,r,n)=>x.fromFormatted(a,r,n),l={args:{label:"转账金额",balance:e("1234.56",6,"USDT")}},u={args:{label:"转账金额",value:e("0.5",18,"ETH"),balance:e("2.5",18,"ETH"),fiatValue:"900.00"}},c={args:{label:"转账金额",value:e("5000",6,"USDT"),balance:e("1000",6,"USDT"),max:e("1000",6,"USDT")}},m={args:{label:"转账金额",value:e("10",6,"USDT"),balance:e("1000",6,"USDT"),error:"最小转账金额为 20 USDT"}},i={args:{label:"转账金额",value:e("100",6,"USDT"),balance:e("1000",6,"USDT"),disabled:!0}},d={render:()=>{const[a,r]=T.useState(null),n=e("1000",6,"USDT"),f=a?(a.toNumber()*1).toFixed(2):void 0;return t.jsxs("div",{className:"space-y-4",children:[t.jsx(s,{label:"转账金额",value:a,onChange:r,balance:n,fiatValue:f??void 0}),t.jsxs("p",{className:"text-muted-foreground text-sm",children:["输入值: ",a?.toFormatted()??"(空)"]}),t.jsxs("p",{className:"text-muted-foreground text-sm",children:["原始值: ",a?.toRawString()??"(空)"]})]})}},p={render:()=>t.jsxs("div",{className:"space-y-6",children:[t.jsx(s,{label:"发送",value:e("0.5",18,"ETH"),balance:e("2.5",18,"ETH"),fiatValue:"900"}),t.jsx(s,{label:"发送",value:e("0.01",8,"BTC"),balance:e("0.1",8,"BTC"),fiatValue:"500"}),t.jsx(s,{label:"发送",value:e("1000",6,"TRX"),balance:e("10000",6,"TRX"),fiatValue:"80"})]})},b={render:()=>{const[a,r]=T.useState(null),n=e("1000",6,"USDT"),v=a&&a.isPositive()&&a.lte(n),f=a?a.toNumber().toFixed(2):void 0,S=o=>{r(e(o,6,"USDT"))};return t.jsxs("div",{className:"space-y-6 p-4",children:[t.jsx("h3",{className:"text-lg font-medium",children:"转账 USDT"}),t.jsx(s,{label:"转账金额",value:a,onChange:r,balance:n,fiatValue:f??void 0}),t.jsx("div",{className:"flex gap-2 text-sm",children:["100","500","1000"].map(o=>t.jsx("button",{onClick:()=>S(o),className:"bg-muted hover:bg-muted/80 rounded-lg px-4 py-2 transition-colors",children:o},o))}),t.jsx("button",{className:"bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50",disabled:!v,children:"下一步"})]})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    label: '转账金额',
    balance: createAmount('1234.56', 6, 'USDT')
  }
}`,...l.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    label: '转账金额',
    value: createAmount('0.5', 18, 'ETH'),
    balance: createAmount('2.5', 18, 'ETH'),
    fiatValue: '900.00'
  }
}`,...u.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    label: '转账金额',
    value: createAmount('5000', 6, 'USDT'),
    balance: createAmount('1000', 6, 'USDT'),
    max: createAmount('1000', 6, 'USDT')
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    label: '转账金额',
    value: createAmount('10', 6, 'USDT'),
    balance: createAmount('1000', 6, 'USDT'),
    error: '最小转账金额为 20 USDT'
  }
}`,...m.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    label: '转账金额',
    value: createAmount('100', 6, 'USDT'),
    balance: createAmount('1000', 6, 'USDT'),
    disabled: true
  }
}`,...i.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [value, setValue] = useState<Amount | null>(null);
    const balance = createAmount('1000', 6, 'USDT');
    const rate = 1; // USDT to USD
    const fiatValue = value ? (value.toNumber() * rate).toFixed(2) : undefined;
    return <div className="space-y-4">
        <AmountInput label="转账金额" value={value} onChange={setValue} balance={balance} fiatValue={fiatValue ?? undefined} />
        <p className="text-muted-foreground text-sm">
          输入值: {value?.toFormatted() ?? '(空)'}
        </p>
        <p className="text-muted-foreground text-sm">
          原始值: {value?.toRawString() ?? '(空)'}
        </p>
      </div>;
  }
}`,...d.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <AmountInput label="发送" value={createAmount('0.5', 18, 'ETH')} balance={createAmount('2.5', 18, 'ETH')} fiatValue="900" />
      <AmountInput label="发送" value={createAmount('0.01', 8, 'BTC')} balance={createAmount('0.1', 8, 'BTC')} fiatValue="500" />
      <AmountInput label="发送" value={createAmount('1000', 6, 'TRX')} balance={createAmount('10000', 6, 'TRX')} fiatValue="80" />
    </div>
}`,...p.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [amount, setAmount] = useState<Amount | null>(null);
    const balance = createAmount('1000', 6, 'USDT');
    const isValid = amount && amount.isPositive() && amount.lte(balance);
    const fiatValue = amount ? amount.toNumber().toFixed(2) : undefined;
    const handleQuickSelect = (val: string) => {
      setAmount(createAmount(val, 6, 'USDT'));
    };
    return <div className="space-y-6 p-4">
        <h3 className="text-lg font-medium">转账 USDT</h3>
        <AmountInput label="转账金额" value={amount} onChange={setAmount} balance={balance} fiatValue={fiatValue ?? undefined} />
        <div className="flex gap-2 text-sm">
          {['100', '500', '1000'].map(val => <button key={val} onClick={() => handleQuickSelect(val)} className="bg-muted hover:bg-muted/80 rounded-lg px-4 py-2 transition-colors">
              {val}
            </button>)}
        </div>
        <button className="bg-primary w-full rounded-full py-3 font-medium text-white disabled:opacity-50" disabled={!isValid}>
          下一步
        </button>
      </div>;
  }
}`,...b.parameters?.docs?.source}}};const y=["Default","WithValue","WithError","CustomError","Disabled","Controlled","DifferentTokens","TransferForm"];export{d as Controlled,m as CustomError,l as Default,p as DifferentTokens,i as Disabled,b as TransferForm,c as WithError,u as WithValue,y as __namedExportsOrder,j as default};
