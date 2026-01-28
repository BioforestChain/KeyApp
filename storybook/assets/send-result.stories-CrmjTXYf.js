import{j as m}from"./iframe-0iuA4WOb.js";import{f as n}from"./index-BjIXEP53.js";import{S as d}from"./send-result-ZFfk7L4P.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./LoadingSpinner-BkCrcB5e.js";import"./NumberFlow-client-48rw3j0J-BkwGQcf-.js";import"./amount-display-CSP2eA3-.js";import"./animated-number-BghPDwGH.js";import"./time-display-CDbcGBGR.js";import"./useTranslation-DcwoRKNa.js";import"./index-CsHIUSRp.js";import"./service-status-alert-BA4yhh7k.js";import"./web-CxfalgsD.js";import"./createReactComponent-SHUP81T7.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-CWEpuQ2X.js";import"./IconX-CuCMqZdl.js";import"./IconAlertTriangle-owWcsMEE.js";import"./IconLock-BeXPpY5C.js";import"./transaction-status-DdE9uwWF.js";import"./IconBan-C5w1RFCF.js";import"./IconClock-CA0-7fBo.js";import"./address-display-CrWJmLEb.js";import"./IconExternalLink-BT0B2reM.js";const L={title:"Transfer/SendResult",component:d,parameters:{layout:"centered"},decorators:[c=>m.jsx("div",{className:"w-[380px] bg-background",children:m.jsx(c,{})})],args:{onDone:n(),onViewExplorer:n()}},s={args:{status:"success",amount:"100",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}},e={args:{status:"success",amount:"1.5",symbol:"ETH",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},r={args:{status:"failed",amount:"500",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",errorMessage:"余额不足",onRetry:n()}},a={args:{status:"failed",amount:"0.1",symbol:"BTC",toAddress:"1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",errorMessage:"网络连接失败，请检查网络后重试",onRetry:n()}},t={args:{status:"pending",amount:"1000",symbol:"TRX",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},o={args:{status:"success",amount:"1,234,567.89",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    amount: '100',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  }
}`,...s.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    amount: '1.5',
    symbol: 'ETH',
    toAddress: 'TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS'
  }
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'failed',
    amount: '500',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    errorMessage: '余额不足',
    onRetry: fn()
  }
}`,...r.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'failed',
    amount: '0.1',
    symbol: 'BTC',
    toAddress: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
    errorMessage: '网络连接失败，请检查网络后重试',
    onRetry: fn()
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'pending',
    amount: '1000',
    symbol: 'TRX',
    toAddress: 'TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS'
  }
}`,...t.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    status: 'success',
    amount: '1,234,567.89',
    symbol: 'USDT',
    toAddress: '0x1234567890abcdef1234567890abcdef12345678',
    txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890'
  }
}`,...o.parameters?.docs?.source}}};const M=["Success","SuccessWithoutHash","Failed","FailedNetworkError","Pending","LargeAmount"];export{r as Failed,a as FailedNetworkError,o as LargeAmount,t as Pending,s as Success,e as SuccessWithoutHash,M as __namedExportsOrder,L as default};
