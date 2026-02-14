import{j as n}from"./iframe-BTpb5FuF.js";import{f as p}from"./index-BjIXEP53.js";import{A as c}from"./asset-list-DOYC1YGS.js";import{A as s}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./asset-item-BaZG7dHi.js";import"./token-icon-CQUJiJpR.js";import"./LoadingSpinner-Bj1P4A7v.js";import"./NumberFlow-client-48rw3j0J-CW2mAzu9.js";import"./amount-display-CkrnJBl7.js";import"./animated-number-BevoHaxf.js";import"./time-display-NSy4Wzld.js";import"./useTranslation-B4edLqB0.js";import"./index-CWWgpFGc.js";import"./service-status-alert-D96OV52y.js";import"./web-2aVBBSU0.js";import"./createReactComponent-BdieSkAI.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-DGG9uPQJ.js";import"./IconX-DuDek79G.js";import"./IconAlertTriangle-CcYcut4h.js";import"./IconLock-d8cp28og.js";import"./IconChevronRight-B4HZrjOO.js";import"./IconCoins-C061LgFB.js";const m=[{assetType:"ETH",name:"Ethereum",amount:s.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:s.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:s.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:s.fromRaw("50000000",8,"BTC"),decimals:8}],H={title:"Asset/AssetList",component:c,parameters:{layout:"centered"},decorators:[i=>n.jsx("div",{className:"w-[380px]",children:n.jsx(i,{})})],args:{assets:m,onAssetClick:p()}},e={},a={args:{assets:[]}},r={args:{assets:[],isLoading:!0}},t={args:{assets:[m[0]]}},o={args:{assets:[...m,{assetType:"TRX",name:"TRON",amount:s.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:s.fromRaw("500000000000",8,"BFM"),decimals:8}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    assets: []
  }
}`,...a.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [],
    isLoading: true
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [mockAssets[0]!]
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [...mockAssets, {
      assetType: 'TRX',
      name: 'TRON',
      amount: Amount.fromRaw('10000000000', 6, 'TRX'),
      decimals: 6
    }, {
      assetType: 'BFM',
      name: 'BioForest Meta',
      amount: Amount.fromRaw('500000000000', 8, 'BFM'),
      decimals: 8
    }]
  }
}`,...o.parameters?.docs?.source}}};const _=["Default","Empty","Loading","SingleAsset","ManyAssets"];export{e as Default,a as Empty,r as Loading,o as ManyAssets,t as SingleAsset,_ as __namedExportsOrder,H as default};
