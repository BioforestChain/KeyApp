import{j as n}from"./iframe-g2b0m8DI.js";import{f as p}from"./index-BjIXEP53.js";import{A as c}from"./asset-list-CGPXm7_L.js";import{A as s}from"./amount-BQsqQYGO.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-CDN07tui.js";import"./asset-item-ByVMX1sq.js";import"./token-icon-uu9a5B4t.js";import"./gradient-button-Bxl7tD7d.js";import"./index-nmRTiCJZ.js";import"./index-B_jtOnfb.js";import"./createReactComponent-Cuq699P7.js";import"./loading-spinner-BKRfkk18.js";import"./useTranslation-Cu2h0njW.js";import"./index-D3aA_s7S.js";import"./empty-state-Djr2ZYm8.js";import"./skeleton-BkqRBCyh.js";import"./amount-display-p3kKhEyv.js";import"./animated-number-D2KYFGet.js";import"./time-display-BRjqNmbb.js";import"./qr-code-C7yKKB09.js";import"./index-Bs6xVBz9.js";import"./icon-circle-BPhKNUJn.js";import"./copyable-text-BhO3508M.js";import"./IconAlertCircle-CUQDCVam.js";import"./IconAlertTriangle-BX3363qR.js";import"./IconCircleCheck-WR4e0BUZ.js";import"./IconInfoCircle-Ds2ezTBJ.js";import"./button-CkH5a8bp.js";import"./useButton-Vl73DGon.js";import"./useRenderElement-CculAx30.js";import"./web-wmJrEV3C.js";import"./breakpoint-wIg8UP9C.js";import"./schemas-BX8BzOgD.js";import"./IconCheck-C48_yMgZ.js";import"./IconX-Dho8Gi5m.js";import"./IconChevronRight-DnbWrSD5.js";import"./IconCoins-Cfp7zbc0.js";const m=[{assetType:"ETH",name:"Ethereum",amount:s.fromRaw("1500000000000000000",18,"ETH"),decimals:18},{assetType:"USDT",name:"Tether USD",amount:s.fromRaw("100000000",6,"USDT"),decimals:6,contractAddress:"0xdAC17F958D2ee523a2206206994597C13D831ec7"},{assetType:"USDC",name:"USD Coin",amount:s.fromRaw("50000000",6,"USDC"),decimals:6},{assetType:"BTC",name:"Bitcoin",amount:s.fromRaw("50000000",8,"BTC"),decimals:8}],V={title:"Asset/AssetList",component:c,parameters:{layout:"centered"},decorators:[i=>n.jsx("div",{className:"w-[380px]",children:n.jsx(i,{})})],args:{assets:m,onAssetClick:p()}},e={},r={args:{assets:[]}},t={args:{assets:[],isLoading:!0}},a={args:{assets:[m[0]]}},o={args:{assets:[...m,{assetType:"TRX",name:"TRON",amount:s.fromRaw("10000000000",6,"TRX"),decimals:6},{assetType:"BFM",name:"BioForest Meta",amount:s.fromRaw("500000000000",8,"BFM"),decimals:8}]}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
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
