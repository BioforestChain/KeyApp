import{j as e,r as f}from"./iframe-DhRzs3QD.js";import{c as b}from"./utils-4perknFd.js";import"./preload-helper-PPVm8Dsz.js";function x({items:n,activeId:d,onTabChange:u,className:h}){return e.jsx("nav",{className:b("fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur border-t border-border safe-area-inset-bottom",h),children:e.jsx("div",{className:"flex items-center justify-around h-14",children:n.map(r=>{const m=r.id===d;return e.jsxs("button",{type:"button",onClick:()=>u(r.id),className:b("flex flex-col items-center justify-center flex-1 h-full gap-0.5 transition-colors relative",m?"text-primary":"text-foreground/60 hover:text-foreground/80 dark:text-foreground/70 dark:hover:text-foreground/90"),"aria-current":m?"page":void 0,"aria-label":r.ariaLabel||r.label,children:[e.jsxs("span",{className:"relative",children:[m&&r.activeIcon?r.activeIcon:r.icon,r.badge!==void 0&&e.jsx("span",{className:"absolute -top-1 -right-2 min-w-[16px] h-4 px-1 text-[10px] font-medium text-destructive-foreground bg-destructive rounded-full flex items-center justify-center",children:typeof r.badge=="number"&&r.badge>99?"99+":r.badge})]}),e.jsx("span",{className:"text-[10px] font-medium",children:r.label})]},r.id)})})})}x.__docgenInfo={description:"",methods:[],displayName:"TabBar",props:{items:{required:!0,tsType:{name:"Array",elements:[{name:"TabItem"}],raw:"TabItem[]"},description:""},activeId:{required:!0,tsType:{name:"string"},description:""},onTabChange:{required:!0,tsType:{name:"signature",type:"function",raw:"(id: string) => void",signature:{arguments:[{type:{name:"string"},name:"id"}],return:{name:"void"}}},description:""},className:{required:!1,tsType:{name:"string"},description:""}}};const y={title:"Layout/TabBar",component:x,tags:["autodocs"],parameters:{layout:"fullscreen"},decorators:[n=>e.jsxs("div",{className:"relative min-h-[200px] pb-20",children:[e.jsx("div",{className:"p-4",children:e.jsx("p",{className:"text-muted-foreground",children:"页面内容区域"})}),e.jsx(n,{})]})]},o=({filled:n=!1})=>e.jsx("svg",{className:"h-6 w-6",fill:n?"currentColor":"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:n?0:2,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"})}),a=({filled:n=!1})=>e.jsx("svg",{className:"h-6 w-6",fill:n?"currentColor":"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:n?0:2,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"})}),l=({filled:n=!1})=>e.jsx("svg",{className:"h-6 w-6",fill:n?"currentColor":"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:n?0:2,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"})}),t=({filled:n=!1})=>e.jsx("svg",{className:"h-6 w-6",fill:n?"currentColor":"none",viewBox:"0 0 24 24",stroke:"currentColor",strokeWidth:n?0:2,children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"})}),j=[{id:"home",label:"首页",icon:e.jsx(o,{}),activeIcon:e.jsx(o,{filled:!0})},{id:"wallet",label:"钱包",icon:e.jsx(a,{}),activeIcon:e.jsx(a,{filled:!0})},{id:"history",label:"记录",icon:e.jsx(l,{}),activeIcon:e.jsx(l,{filled:!0})},{id:"me",label:"我的",icon:e.jsx(t,{}),activeIcon:e.jsx(t,{filled:!0})}];function p({items:n=j}){const[d,u]=f.useState("home");return e.jsx(x,{items:n,activeId:d,onTabChange:u})}const s={render:()=>e.jsx(p,{})},i={render:()=>e.jsx(p,{items:[{id:"home",label:"首页",icon:e.jsx(o,{}),activeIcon:e.jsx(o,{filled:!0})},{id:"wallet",label:"钱包",icon:e.jsx(a,{}),activeIcon:e.jsx(a,{filled:!0}),badge:3},{id:"history",label:"记录",icon:e.jsx(l,{}),activeIcon:e.jsx(l,{filled:!0}),badge:99},{id:"me",label:"我的",icon:e.jsx(t,{}),activeIcon:e.jsx(t,{filled:!0}),badge:"新"}]})},c={render:()=>e.jsx(p,{items:[{id:"home",label:"首页",icon:e.jsx(o,{}),activeIcon:e.jsx(o,{filled:!0})},{id:"wallet",label:"钱包",icon:e.jsx(a,{}),activeIcon:e.jsx(a,{filled:!0})},{id:"me",label:"我的",icon:e.jsx(t,{}),activeIcon:e.jsx(t,{filled:!0})}]})};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  render: () => <TabBarDemo />
}`,...s.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  render: () => <TabBarDemo items={[{
    id: 'home',
    label: '首页',
    icon: <HomeIcon />,
    activeIcon: <HomeIcon filled />
  }, {
    id: 'wallet',
    label: '钱包',
    icon: <WalletIcon />,
    activeIcon: <WalletIcon filled />,
    badge: 3
  }, {
    id: 'history',
    label: '记录',
    icon: <HistoryIcon />,
    activeIcon: <HistoryIcon filled />,
    badge: 99
  }, {
    id: 'me',
    label: '我的',
    icon: <UserIcon />,
    activeIcon: <UserIcon filled />,
    badge: '新'
  }]} />
}`,...i.parameters?.docs?.source}}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:`{
  render: () => <TabBarDemo items={[{
    id: 'home',
    label: '首页',
    icon: <HomeIcon />,
    activeIcon: <HomeIcon filled />
  }, {
    id: 'wallet',
    label: '钱包',
    icon: <WalletIcon />,
    activeIcon: <WalletIcon filled />
  }, {
    id: 'me',
    label: '我的',
    icon: <UserIcon />,
    activeIcon: <UserIcon filled />
  }]} />
}`,...c.parameters?.docs?.source}}};const k=["Default","WithBadge","ThreeTabs"];export{s as Default,c as ThreeTabs,i as WithBadge,k as __namedExportsOrder,y as default};
