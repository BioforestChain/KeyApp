import{j as e,r as w}from"./iframe-CZMiMZiE.js";import{W as i}from"./wallet-selector-CQMgZ7wg.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./wallet-mini-card-D4go6CqH.js";import"./hologram-canvas-fvo43Af2.js";import"./useTranslation-BwuSwSVz.js";import"./index-B6TgdZdy.js";import"./address-display-qBhBDtpE.js";import"./web-D9rtq29H.js";import"./createReactComponent-CyIjciDW.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-3Syih3Ic.js";const m={ethereum:"/icons/ethereum/chain.svg",bitcoin:"/icons/bitcoin/chain.svg",tron:"/icons/tron/chain.svg"},T={title:"Wallet/WalletSelector",component:i,tags:["autodocs"],decorators:[a=>e.jsx("div",{className:"max-w-sm rounded-xl border border-border bg-card p-4",children:e.jsx(a,{})})]},t=[{id:"wallet-1",name:"Ethereum Wallet",address:"0x1234567890abcdef1234567890abcdef12345678",balance:"1.5 ETH",fiatValue:"3000",isBackedUp:!0,themeHue:220,chainIconUrl:m.ethereum},{id:"wallet-2",name:"Bitcoin Savings",address:"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",balance:"0.5 BTC",fiatValue:"20000",isBackedUp:!1,themeHue:40,chainIconUrl:m.bitcoin},{id:"wallet-3",name:"Tron Trading",address:"TAbcdefghijklmnopqrstuvwxyz123456",balance:"10,000 TRX",isBackedUp:!0,themeHue:0,chainIconUrl:m.tron}],s={args:{wallets:t,selectedId:"wallet-1"}},r={args:{wallets:[t[0]],selectedId:"wallet-1"}},l={args:{wallets:[]}},c={args:{wallets:t,selectedId:"wallet-2"}},o={render:()=>{const[a,p]=w.useState("wallet-1");return e.jsx(i,{wallets:t,selectedId:a,onSelect:u=>p(u.id)})}},n={args:{wallets:[...t,{id:"wallet-4",name:"Cold Storage",address:"0x9876543210fedcba9876543210fedcba98765432",balance:"10 ETH",isBackedUp:!0},{id:"wallet-5",name:"DeFi Wallet",address:"0xfedcba9876543210fedcba9876543210fedcba98",balance:"5,000 USDT",isBackedUp:!0}],selectedId:"wallet-1"}},d={decorators:[a=>e.jsxs("div",{className:"max-w-sm",children:[e.jsxs("div",{className:"mb-4 flex items-center justify-between px-4",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"选择钱包"}),e.jsx("button",{type:"button",className:"text-sm text-muted-foreground hover:text-foreground",children:"关闭"})]}),e.jsx(a,{})]})],args:{wallets:t,selectedId:"wallet-1"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    selectedId: 'wallet-1'
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [mockWallets[0]!],
    selectedId: 'wallet-1'
  }
}`,...r.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: []
  }
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: mockWallets,
    selectedId: 'wallet-2'
  }
}`,...c.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selectedId, setSelectedId] = useState('wallet-1');
    return <WalletSelector wallets={mockWallets} selectedId={selectedId} onSelect={wallet => setSelectedId(wallet.id)} />;
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  args: {
    wallets: [...mockWallets, {
      id: 'wallet-4',
      name: 'Cold Storage',
      address: '0x9876543210fedcba9876543210fedcba98765432',
      balance: '10 ETH',
      isBackedUp: true
    }, {
      id: 'wallet-5',
      name: 'DeFi Wallet',
      address: '0xfedcba9876543210fedcba9876543210fedcba98',
      balance: '5,000 USDT',
      isBackedUp: true
    }],
    selectedId: 'wallet-1'
  }
}`,...n.parameters?.docs?.source}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  decorators: [Story => <div className="max-w-sm">
        <div className="mb-4 flex items-center justify-between px-4">
          <h2 className="text-lg font-semibold">选择钱包</h2>
          <button type="button" className="text-sm text-muted-foreground hover:text-foreground">
            关闭
          </button>
        </div>
        <Story />
      </div>],
  args: {
    wallets: mockWallets,
    selectedId: 'wallet-1'
  }
}`,...d.parameters?.docs?.source}}};const B=["Default","SingleWallet","EmptyState","WithUnbackedWallet","Interactive","ManyWallets","InSheet"];export{s as Default,l as EmptyState,d as InSheet,o as Interactive,n as ManyWallets,r as SingleWallet,c as WithUnbackedWallet,B as __namedExportsOrder,T as default};
