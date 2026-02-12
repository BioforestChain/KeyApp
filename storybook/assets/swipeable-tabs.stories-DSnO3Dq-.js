import{j as e}from"./iframe-BKKGzOJ9.js";import{T as d,S as g}from"./swipeable-tabs-DM4EcnWh.js";import{f as r}from"./index-BjIXEP53.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./swiper-B3peLvdF.js";import"./IconCoins-Cex14Dw3.js";import"./createReactComponent-CkLt9PPZ.js";const t=()=>e.jsx("div",{className:"space-y-2 p-4",children:["USDT","ETH","BTC","BNB"].map(s=>e.jsxs("div",{className:"bg-muted flex items-center justify-between rounded-lg p-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/20 flex size-10 items-center justify-center rounded-full",children:e.jsx("span",{className:"text-primary text-sm font-bold",children:s[0]})}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:s}),e.jsx("div",{className:"text-muted-foreground text-sm",children:(Math.random()*1e3).toFixed(2)})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("div",{className:"font-medium",children:["$",(Math.random()*1e4).toFixed(2)]}),e.jsxs("div",{className:`text-sm ${Math.random()>.5?"text-green-500":"text-red-500"}`,children:[Math.random()>.5?"+":"-",(Math.random()*5).toFixed(2),"%"]})]})]},s))}),n=()=>e.jsx("div",{className:"space-y-2 p-4",children:["转账","收款","兑换","质押"].map((s,a)=>e.jsxs("div",{className:"bg-muted flex items-center justify-between rounded-lg p-3",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"bg-primary/20 flex size-10 items-center justify-center rounded-full",children:e.jsx("span",{className:"text-primary text-lg",children:s==="转账"?"↑":s==="收款"?"↓":s==="兑换"?"⇄":"🔒"})}),e.jsxs("div",{children:[e.jsx("div",{className:"font-medium",children:s}),e.jsxs("div",{className:"text-muted-foreground text-sm",children:["2024-01-",10+a]})]})]}),e.jsxs("div",{className:"text-right",children:[e.jsxs("div",{className:`font-medium ${s==="收款"?"text-green-500":""}`,children:[s==="收款"?"+":"-",(Math.random()*100).toFixed(2)," USDT"]}),e.jsx("div",{className:"text-muted-foreground text-sm",children:"已完成"})]})]},a))}),N={title:"Layout/Tabs",component:d,tags:["autodocs"],parameters:{layout:"centered"},decorators:[s=>e.jsx("div",{className:"bg-background h-[500px] w-[360px] overflow-hidden rounded-xl shadow-lg",children:e.jsx(s,{})})]},o={args:{onTabChange:r()},render:s=>e.jsx(d,{...s,children:a=>a==="assets"?e.jsx(t,{}):e.jsx(n,{})})},i={args:{defaultTab:"history",onTabChange:r()},render:s=>e.jsx(d,{...s,children:a=>a==="assets"?e.jsx(t,{}):e.jsx(n,{})})},l={args:{tabs:[{id:"all",label:"全部"},{id:"sent",label:"转出"},{id:"received",label:"转入"},{id:"pending",label:"待处理"}],defaultTab:"all",onTabChange:r()},render:s=>e.jsx(d,{...s,children:a=>e.jsxs("div",{className:"flex h-40 items-center justify-center text-muted-foreground",children:["当前选中: ",a]})})},c={args:{onTabChange:r()},render:s=>e.jsx(g,{...s,children:a=>a==="assets"?e.jsx(t,{}):e.jsx(n,{})}),parameters:{docs:{description:{story:"可滑动版本的 Tab 切换，使用 Swiper 实现手势滑动。"}}}},m={args:{defaultTab:"history",onTabChange:r()},render:s=>e.jsx(g,{...s,children:a=>a==="assets"?e.jsx(t,{}):e.jsx(n,{})})},b={args:{tabs:[{id:"tokens",label:"代币"},{id:"nfts",label:"NFT"},{id:"defi",label:"DeFi"}],defaultTab:"tokens",onTabChange:r()},render:s=>e.jsx(g,{...s,children:a=>e.jsxs("div",{className:"flex h-60 flex-col items-center justify-center gap-2 text-muted-foreground",children:[e.jsx("div",{className:"text-4xl",children:a==="tokens"?"🪙":a==="nfts"?"🖼️":"📊"}),e.jsxs("div",{children:[a.toUpperCase()," 内容"]})]})})},x={args:{activeTab:"history",onTabChange:r()},render:s=>e.jsx(d,{...s,children:a=>a==="assets"?e.jsx(t,{}):e.jsx(n,{})}),parameters:{docs:{description:{story:"受控模式，activeTab 由外部状态管理。"}}}},p={args:{onTabChange:r()},render:s=>e.jsx(g,{...s,children:a=>a==="assets"?e.jsx(t,{}):e.jsx(n,{})}),decorators:[s=>e.jsx("div",{className:"dark bg-background h-[500px] w-[360px] overflow-hidden rounded-xl shadow-lg",children:e.jsx(s,{})})],parameters:{backgrounds:{default:"dark"}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  args: {
    onTabChange: fn()
  },
  render: args => <Tabs {...args}>
      {tab => tab === 'assets' ? <AssetsContent /> : <HistoryContent />}
    </Tabs>
}`,...o.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    defaultTab: 'history',
    onTabChange: fn()
  },
  render: args => <Tabs {...args}>
      {tab => tab === 'assets' ? <AssetsContent /> : <HistoryContent />}
    </Tabs>
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: 'all',
      label: '全部'
    }, {
      id: 'sent',
      label: '转出'
    }, {
      id: 'received',
      label: '转入'
    }, {
      id: 'pending',
      label: '待处理'
    }],
    defaultTab: 'all',
    onTabChange: fn()
  },
  render: args => <Tabs {...args}>
      {tab => <div className="flex h-40 items-center justify-center text-muted-foreground">
          当前选中: {tab}
        </div>}
    </Tabs>
}`,...l.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  args: {
    onTabChange: fn()
  },
  render: args => <SwipeableTabs {...args}>
      {tab => tab === 'assets' ? <AssetsContent /> : <HistoryContent />}
    </SwipeableTabs>,
  parameters: {
    docs: {
      description: {
        story: '可滑动版本的 Tab 切换，使用 Swiper 实现手势滑动。'
      }
    }
  }
}`,...c.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    defaultTab: 'history',
    onTabChange: fn()
  },
  render: args => <SwipeableTabs {...args}>
      {tab => tab === 'assets' ? <AssetsContent /> : <HistoryContent />}
    </SwipeableTabs>
}`,...m.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    tabs: [{
      id: 'tokens',
      label: '代币'
    }, {
      id: 'nfts',
      label: 'NFT'
    }, {
      id: 'defi',
      label: 'DeFi'
    }],
    defaultTab: 'tokens',
    onTabChange: fn()
  },
  render: args => <SwipeableTabs {...args}>
      {tab => <div className="flex h-60 flex-col items-center justify-center gap-2 text-muted-foreground">
          <div className="text-4xl">
            {tab === 'tokens' ? '🪙' : tab === 'nfts' ? '🖼️' : '📊'}
          </div>
          <div>{tab.toUpperCase()} 内容</div>
        </div>}
    </SwipeableTabs>
}`,...b.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    activeTab: 'history',
    onTabChange: fn()
  },
  render: args => <Tabs {...args}>
      {tab => tab === 'assets' ? <AssetsContent /> : <HistoryContent />}
    </Tabs>,
  parameters: {
    docs: {
      description: {
        story: '受控模式，activeTab 由外部状态管理。'
      }
    }
  }
}`,...x.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    onTabChange: fn()
  },
  render: args => <SwipeableTabs {...args}>
      {tab => tab === 'assets' ? <AssetsContent /> : <HistoryContent />}
    </SwipeableTabs>,
  decorators: [Story => <div className="dark bg-background h-[500px] w-[360px] overflow-hidden rounded-xl shadow-lg">
        <Story />
      </div>],
  parameters: {
    backgrounds: {
      default: 'dark'
    }
  }
}`,...p.parameters?.docs?.source}}};const S=["Default","HistoryActive","CustomTabs","SwipeableDefault","SwipeableHistoryActive","SwipeableCustomTabs","Controlled","DarkMode"];export{x as Controlled,l as CustomTabs,p as DarkMode,o as Default,i as HistoryActive,b as SwipeableCustomTabs,c as SwipeableDefault,m as SwipeableHistoryActive,S as __namedExportsOrder,N as default};
