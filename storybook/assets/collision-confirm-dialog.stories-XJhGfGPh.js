import{j as n}from"./iframe-BBL1Y9Q3.js";import{C as l}from"./collision-confirm-dialog-DUMnr6tx.js";import{f as i}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-qL4usZoQ.js";import"./index-BRbw8C-D.js";import"./IconAlertTriangle-B3ia6w8L.js";import"./createReactComponent-CNTpCBNj.js";import"./IconWallet--zgJYiMD.js";import"./IconChevronRight-DiMGnF_x.js";import"./Trans-BvPin83c.js";const o={isDuplicate:!0,type:"privateKey",matchedWallet:{id:"pk-wallet-1",name:"My BTC Wallet",importType:"privateKey",matchedAddress:"0x742d35Cc6634C0532925a3b844Bc9e7595f1aB23"}},N={title:"Onboarding/CollisionConfirmDialog",component:l,parameters:{layout:"centered"},decorators:[c=>n.jsx("div",{className:"w-[360px]",children:n.jsx(c,{})})],args:{result:o,onConfirm:i(),onCancel:i()}},e={},t={args:{isLoading:!0}},r={args:{result:{...o,matchedWallet:{...o.matchedWallet,name:"My Very Long Wallet Name That Might Overflow"}}}},a={args:{result:{isDuplicate:!0,type:"privateKey",matchedWallet:{id:"btc-wallet-1",name:"Bitcoin Savings",importType:"privateKey",matchedAddress:"1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"}}}},s={args:{result:{isDuplicate:!1,type:"none"}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source},description:{story:"Default state - showing collision warning",...e.parameters?.docs?.description}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    isLoading: true
  }
}`,...t.parameters?.docs?.source},description:{story:"Loading state during confirmation",...t.parameters?.docs?.description}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    result: {
      ...mockResult,
      matchedWallet: {
        ...mockResult.matchedWallet!,
        name: 'My Very Long Wallet Name That Might Overflow'
      }
    }
  }
}`,...r.parameters?.docs?.source},description:{story:"With long wallet name",...r.parameters?.docs?.description}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    result: {
      isDuplicate: true,
      type: 'privateKey',
      matchedWallet: {
        id: 'btc-wallet-1',
        name: 'Bitcoin Savings',
        importType: 'privateKey',
        matchedAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2'
      }
    }
  }
}`,...a.parameters?.docs?.source},description:{story:"With Bitcoin address",...a.parameters?.docs?.description}}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    result: {
      isDuplicate: false,
      type: 'none'
    }
  }
}`,...s.parameters?.docs?.source},description:{story:"Not shown when no collision",...s.parameters?.docs?.description}}};const w=["Default","Loading","LongWalletName","BitcoinAddress","NoCollision"];export{a as BitcoinAddress,e as Default,t as Loading,r as LongWalletName,s as NoCollision,w as __namedExportsOrder,N as default};
