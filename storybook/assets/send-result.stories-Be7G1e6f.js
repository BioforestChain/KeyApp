import{j as m}from"./iframe-DDIM8zrC.js";import{f as n}from"./index-BjIXEP53.js";import{S as d}from"./send-result-wXDFzW_T.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./LoadingSpinner-DioF2prX.js";import"./NumberFlow-client-48rw3j0J-Dvcw7fuQ.js";import"./amount-display-Bl6LrXk_.js";import"./animated-number-D0usAa3t.js";import"./time-display-auybcsHn.js";import"./useTranslation-CzpZJ1d8.js";import"./index-aBLE1Wau.js";import"./service-status-alert-f7sa2IJX.js";import"./web-CU6WXRKf.js";import"./createReactComponent-qYmak6bv.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";import"./IconCheck-BFZ8eQMm.js";import"./IconX-RUI1FtvX.js";import"./IconAlertTriangle-CtUB79Ao.js";import"./IconLock-CRUzFQfZ.js";import"./transaction-status-c7kSF279.js";import"./IconBan-CJfiNaWI.js";import"./IconClock-CT8oIFqZ.js";import"./address-display-e7Xe9fUV.js";import"./IconExternalLink-uMr95W2q.js";const L={title:"Transfer/SendResult",component:d,parameters:{layout:"centered"},decorators:[c=>m.jsx("div",{className:"w-[380px] bg-background",children:m.jsx(c,{})})],args:{onDone:n(),onViewExplorer:n()}},s={args:{status:"success",amount:"100",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}},e={args:{status:"success",amount:"1.5",symbol:"ETH",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},r={args:{status:"failed",amount:"500",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",errorMessage:"余额不足",onRetry:n()}},a={args:{status:"failed",amount:"0.1",symbol:"BTC",toAddress:"1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2",errorMessage:"网络连接失败，请检查网络后重试",onRetry:n()}},t={args:{status:"pending",amount:"1000",symbol:"TRX",toAddress:"TJYmgH3xvqQbP1LqVvdrEaBzCHmvtjmJfS"}},o={args:{status:"success",amount:"1,234,567.89",symbol:"USDT",toAddress:"0x1234567890abcdef1234567890abcdef12345678",txHash:"0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890"}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
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
