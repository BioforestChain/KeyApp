import{r,j as e}from"./iframe-b-sVmduO.js";import{c as f}from"./utils-4perknFd.js";import{I as k,c as R}from"./web-jtU6abry.js";import{I as L}from"./IconCheck-BTBfiJTq.js";import"./preload-helper-PPVm8Dsz.js";import"./createReactComponent-CiK24Q5d.js";import"./breakpoint-DQ_qwb34.js";import"./schemas-CO8_C8zP.js";function o({children:t,copyable:y=!1,duration:x,onCopy:w,className:N,...T}){const a=r.useRef(null),n=r.useRef(null),[b,j]=r.useState(!1),[S,c]=r.useState(!1),[h,g]=r.useState(!1);r.useEffect(()=>{const s=()=>{if(a.current&&n.current){const B=a.current.clientWidth,E=n.current.scrollWidth;j(E>B)}};s();const v=new ResizeObserver(s);return a.current&&v.observe(a.current),()=>v.disconnect()},[t]);const C=r.useMemo(()=>{if(x)return x;const s=n.current?.scrollWidth??t.length*8;return Math.max(3,s/50)},[x,t]),M=async s=>{s.stopPropagation();try{await R.write({text:t}),g(!0),w?.(),setTimeout(()=>g(!1),2e3)}catch{}},q=()=>c(!0),O=()=>c(!1),I=()=>c(!0),W=()=>c(!1);return e.jsxs("div",{ref:a,"data-slot":"marquee-text",className:f("relative flex items-center gap-1 overflow-hidden",N),onMouseEnter:q,onMouseLeave:O,onFocus:I,onBlur:W,...T,children:[e.jsx("span",{ref:n,className:f("whitespace-nowrap",b&&"animate-marquee",S&&"animate-paused"),style:b?{"--marquee-duration":`${C}s`}:void 0,children:t}),y&&e.jsx("button",{type:"button",onClick:M,className:f("ml-1 flex-shrink-0 rounded p-0.5","text-muted-foreground hover:text-foreground","focus-visible:ring-ring focus:outline-none focus-visible:ring-1","transition-colors"),"aria-label":h?"Copied":"Copy to clipboard",children:h?e.jsx(L,{className:"size-3.5 text-green-500"}):e.jsx(k,{className:"size-3.5"})})]})}o.__docgenInfo={description:`MarqueeText - Auto-scrolling text for overflowing content

Features:
- Detects overflow and only animates when needed
- Pauses animation on hover/focus
- Optional copy-to-clipboard with transient feedback`,methods:[],displayName:"MarqueeText",props:{children:{required:!0,tsType:{name:"string"},description:"Text content to display"},copyable:{required:!1,tsType:{name:"boolean"},description:"Enable copy-to-clipboard button",defaultValue:{value:"false",computed:!1}},duration:{required:!1,tsType:{name:"number"},description:"Animation duration in seconds (default: auto-calculated based on text length)"},onCopy:{required:!1,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when text is copied"}}};const U={title:"UI/MarqueeText",component:o,tags:["autodocs"],argTypes:{copyable:{control:"boolean"},duration:{control:{type:"range",min:1,max:20,step:.5}}},decorators:[t=>e.jsx("div",{className:"p-4",children:e.jsx(t,{})})]},d={args:{children:"Short text",className:"w-48"}},i={args:{children:"0x742d35cc6634c0532925a3b844bc454e4438f44e",className:"w-48 font-mono text-sm"}},l={args:{children:"Binance Smart Chain Mainnet (BSC)",className:"w-32"}},m={args:{children:"0x742d35cc6634c0532925a3b844bc454e4438f44e",className:"w-48 font-mono text-sm",copyable:!0}},u={args:{children:"This text scrolls at a custom speed that is slower than default",className:"w-48",duration:10}},p={render:()=>e.jsxs("div",{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-2 text-sm",children:"Short text (no scroll)"}),e.jsx(o,{className:"border-border w-48 rounded border px-2 py-1",children:"Short"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-2 text-sm",children:"Overflowing address (scrolls)"}),e.jsx(o,{className:"border-border w-48 rounded border px-2 py-1 font-mono text-sm",children:"0x742d35cc6634c0532925a3b844bc454e4438f44e"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-2 text-sm",children:"With copy button"}),e.jsx(o,{className:"border-border w-48 rounded border px-2 py-1 font-mono text-sm",copyable:!0,children:"0x742d35cc6634c0532925a3b844bc454e4438f44e"})]}),e.jsxs("div",{children:[e.jsx("p",{className:"text-muted-foreground mb-2 text-sm",children:"Hover to pause animation"}),e.jsx(o,{className:"border-border w-32 rounded border px-2 py-1",children:"Hover over this text to pause the scrolling animation"})]})]})};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Short text',
    className: 'w-48'
  }
}`,...d.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    children: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    className: 'w-48 font-mono text-sm'
  }
}`,...i.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'Binance Smart Chain Mainnet (BSC)',
    className: 'w-32'
  }
}`,...l.parameters?.docs?.source}}};m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{
  args: {
    children: '0x742d35cc6634c0532925a3b844bc454e4438f44e',
    className: 'w-48 font-mono text-sm',
    copyable: true
  }
}`,...m.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    children: 'This text scrolls at a custom speed that is slower than default',
    className: 'w-48',
    duration: 10
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => <div className="space-y-6">
      <div>
        <p className="text-muted-foreground mb-2 text-sm">Short text (no scroll)</p>
        <MarqueeText className="border-border w-48 rounded border px-2 py-1">Short</MarqueeText>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">Overflowing address (scrolls)</p>
        <MarqueeText className="border-border w-48 rounded border px-2 py-1 font-mono text-sm">
          0x742d35cc6634c0532925a3b844bc454e4438f44e
        </MarqueeText>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">With copy button</p>
        <MarqueeText className="border-border w-48 rounded border px-2 py-1 font-mono text-sm" copyable>
          0x742d35cc6634c0532925a3b844bc454e4438f44e
        </MarqueeText>
      </div>

      <div>
        <p className="text-muted-foreground mb-2 text-sm">Hover to pause animation</p>
        <MarqueeText className="border-border w-32 rounded border px-2 py-1">
          Hover over this text to pause the scrolling animation
        </MarqueeText>
      </div>
    </div>
}`,...p.parameters?.docs?.source}}};const $=["ShortText","OverflowingText","LongChainName","WithCopyButton","CustomDuration","AllVariants"];export{p as AllVariants,u as CustomDuration,l as LongChainName,i as OverflowingText,d as ShortText,m as WithCopyButton,$ as __namedExportsOrder,U as default};
