import{j as n}from"./iframe-Bk0viqBp.js";import{f as p}from"./index-BjIXEP53.js";import{A as c}from"./asset-list-B1J7T_ql.js";import{A as s}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./asset-item-DN8gV3Qq.js";import"./token-icon-CmArnqbl.js";import"./gradient-button-BDalvSX9.js";import"./index-Be19sUVd.js";import"./index-B_jtOnfb.js";import"./createReactComponent-C9mJNZiy.js";import"./loading-spinner-D0CEeRhc.js";import"./useTranslation-CoW4CkER.js";import"./index-DM-GfxwZ.js";import"./empty-state-Dsy7ZYP2.js";import"./skeleton-CXlyLlda.js";import"./amount-display-V9AEqpmS.js";import"./animated-number-bNOCpp1N.js";import"./time-display-CN_IEGIt.js";import"./qr-code-RN2J8s1q.js";import"./index-D_iEzEYG.js";import"./icon-circle-DArqUMMG.js";import"./copyable-text-CLMON-zk.js";import"./IconAlertCircle-C54_XH_v.js";import"./IconAlertTriangle-DCQ3OleV.js";import"./IconCircleCheck-DdtO2jJk.js";import"./IconInfoCircle-BRUAA2fP.js";import"./button-DjZvxSXP.js";import"./useButton-BFTCjRQ4.js";import"./useRenderElement-DPzNcg5V.js";import"./web-BMkjmpIH.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./IconCheck-CrUy9GjL.js";import"./IconX-CTs2zPcS.js";import"./IconChevronRight-BeoQNFw5.js";import"./IconCoins-COOaCFBq.js";const m=[{assetType:"ETH",name:"Ethereum",amount:s.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:s.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:s.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:s.fromRaw("50000000",8,"BTC"),decimals:8}],V={title:"Asset/AssetList",component:c,parameters:{layout:"centered"},decorators:[i=>n.jsx("div",{className:"w-[380px]",children:n.jsx(i,{})})],args:{assets:m,onAssetClick:p()}},e={},r={args:{assets:[]}},t={args:{assets:[],isLoading:!0}},a={args:{assets:[m[0]]}},o={args:{assets:[...m,{assetType:"TRX",name:"TRON",amount:s.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:s.fromRaw("500000000000",8,"BFM"),decimals:8}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    assets: []
  }
}`,...r.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [],
    isLoading: true
  }
}`,...t.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    assets: [mockAssets[0]!]
  }
}`,...a.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
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
}`,...o.parameters?.docs?.source}}};const W=["Default","Empty","Loading","SingleAsset","ManyAssets"];export{e as Default,r as Empty,t as Loading,o as ManyAssets,a as SingleAsset,W as __namedExportsOrder,V as default};
