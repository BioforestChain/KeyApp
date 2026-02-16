import{j as e,r}from"./iframe-BphNANQP.js";import{w as I,e as o,u as y}from"./index-BjIXEP53.js";import{I as j,c as b,W as k}from"./wujie-container-Ciulznf_.js";import"./preload-helper-PPVm8Dsz.js";const $={title:"Services/Container",parameters:{layout:"fullscreen"}};function H(){const[n,s]=r.useState(null),[t,a]=r.useState("idle"),[m,l]=r.useState(!1),g=r.useRef(new j),i=r.useRef(null);r.useEffect(()=>()=>{n?.destroy(),b()},[n]);const x=async()=>{if(!i.current)return;a("creating...");const h=await g.current.create({appId:`test-app-${Date.now()}`,url:"https://example.com",mountTarget:i.current,onLoad:()=>a("loaded")});s(h),a("created")},p=()=>{n?.destroy(),s(null),a("destroyed"),l(!1)},c=()=>{n?.moveToBackground(),l(!0),a("background")},C=()=>{n?.moveToForeground(),l(!1),a("foreground")};return e.jsxs("div",{className:"flex h-screen flex-col gap-4 p-4",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{"data-testid":"btn-create",onClick:x,disabled:!!n,className:"rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50",children:"Create Container"}),e.jsx("button",{"data-testid":"btn-destroy",onClick:p,disabled:!n,className:"rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50",children:"Destroy"}),e.jsx("button",{"data-testid":"btn-background",onClick:c,disabled:!n||m,className:"rounded bg-yellow-500 px-4 py-2 text-white disabled:opacity-50",children:"Move to Background"}),e.jsx("button",{"data-testid":"btn-foreground",onClick:C,disabled:!n||!m,className:"rounded bg-green-500 px-4 py-2 text-white disabled:opacity-50",children:"Move to Foreground"})]}),e.jsxs("div",{className:"flex gap-4 text-sm",children:[e.jsxs("div",{children:["Status:"," ",e.jsx("span",{"data-testid":"status",className:"font-mono",children:t})]}),e.jsxs("div",{children:["Connected:"," ",e.jsx("span",{"data-testid":"connected",className:"font-mono",children:n?.isConnected()?"yes":"no"})]}),e.jsxs("div",{children:["Type:"," ",e.jsx("span",{"data-testid":"type",className:"font-mono",children:n?.type??"none"})]})]}),e.jsxs("div",{className:"flex-1 rounded border border-gray-300 bg-gray-100 p-2",children:[e.jsx("div",{className:"mb-2 text-xs text-gray-500",children:"Container will be mounted here"}),e.jsx("div",{ref:i,className:"h-full","data-testid":"container-host"})]})]})}const T={render:()=>e.jsx(H,{}),play:async({canvasElement:n,step:s})=>{const t=I(n);await s("Initial state",async()=>{o(t.getByTestId("status")).toHaveTextContent("idle"),o(t.getByTestId("connected")).toHaveTextContent("no"),o(t.getByTestId("type")).toHaveTextContent("none")}),await s("Create container",async()=>{await y.click(t.getByTestId("btn-create")),await new Promise(a=>setTimeout(a,100)),o(t.getByTestId("status")).toHaveTextContent("created"),o(t.getByTestId("connected")).toHaveTextContent("yes"),o(t.getByTestId("type")).toHaveTextContent("iframe")}),await s("Move to background",async()=>{await y.click(t.getByTestId("btn-background")),await new Promise(a=>setTimeout(a,100)),o(t.getByTestId("status")).toHaveTextContent("background")}),await s("Move to foreground",async()=>{await y.click(t.getByTestId("btn-foreground")),await new Promise(a=>setTimeout(a,100)),o(t.getByTestId("status")).toHaveTextContent("foreground")}),await s("Destroy container",async()=>{await y.click(t.getByTestId("btn-destroy")),await new Promise(a=>setTimeout(a,100)),o(t.getByTestId("status")).toHaveTextContent("destroyed"),o(t.getByTestId("connected")).toHaveTextContent("no"),o(t.getByTestId("type")).toHaveTextContent("none")})}};function N(){const[n,s]=r.useState([]),t=r.useRef(new j),a=r.useRef(null);r.useEffect(()=>()=>{n.forEach(i=>i.destroy()),b()},[n]);const m=async()=>{if(!a.current)return;const i=`app-${Date.now()}`,x=await t.current.create({appId:i,url:`https://example.com/?id=${i}`,mountTarget:a.current});s(p=>[...p,x])},l=()=>{if(n.length===0)return;n[n.length-1].destroy(),s(x=>x.slice(0,-1))},g=()=>{n.forEach(i=>i.destroy()),b(),s([])};return e.jsxs("div",{className:"flex h-screen flex-col gap-4 p-4",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{"data-testid":"btn-create-multi",onClick:m,className:"rounded bg-blue-500 px-4 py-2 text-white",children:"Create Container"}),e.jsx("button",{"data-testid":"btn-destroy-last",onClick:l,disabled:n.length===0,className:"rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50",children:"Destroy Last"}),e.jsx("button",{"data-testid":"btn-cleanup-all",onClick:g,disabled:n.length===0,className:"rounded bg-gray-500 px-4 py-2 text-white disabled:opacity-50",children:"Cleanup All"})]}),e.jsxs("div",{className:"text-sm",children:["Active containers:"," ",e.jsx("span",{"data-testid":"count",className:"font-mono",children:n.length})]}),e.jsx("div",{className:"flex-1 rounded border border-gray-300 bg-gray-100 p-2",children:e.jsx("div",{ref:a,className:"h-full","data-testid":"container-host-multi"})})]})}const v={render:()=>e.jsx(N,{}),play:async({canvasElement:n,step:s})=>{const t=I(n);await s("Create 3 containers",async()=>{for(let a=0;a<3;a++)await y.click(t.getByTestId("btn-create-multi")),await new Promise(m=>setTimeout(m,50));o(t.getByTestId("count")).toHaveTextContent("3")}),await s("Destroy last container",async()=>{await y.click(t.getByTestId("btn-destroy-last")),await new Promise(a=>setTimeout(a,50)),o(t.getByTestId("count")).toHaveTextContent("2")}),await s("Cleanup all containers",async()=>{await y.click(t.getByTestId("btn-cleanup-all")),await new Promise(a=>setTimeout(a,50)),o(t.getByTestId("count")).toHaveTextContent("0")})}};function E(){const[n,s]=r.useState(null),[t,a]=r.useState("idle"),[m,l]=r.useState("none"),[g,i]=r.useState([]),x=r.useRef(new k),p=r.useRef(null),c=d=>{i(u=>[...u.slice(-9),`${new Date().toLocaleTimeString()}: ${d}`])};r.useEffect(()=>()=>{n?.destroy()},[n]);const C=async()=>{if(!p.current)return;a("creating..."),c("Creating wujie container...");const d=`wujie-test-${Date.now()}`;try{const u=await x.current.create({appId:d,url:window.location.origin+"/miniapps/teleport/",mountTarget:p.current,onLoad:()=>{a("loaded"),c("Wujie app loaded (afterMount)")}});s(u),a("created"),c(`Container created with appId: ${d}`),setTimeout(()=>{const w=u.getIframe();w?(l(`Found: iframe[name="${w.name}"]`),c(`Iframe found: name="${w.name}", src="${w.src.slice(0,50)}..."`)):(l("Not found"),c("Iframe NOT found via getIframe()"))},500)}catch(u){a("error"),c(`Error: ${u}`)}},h=()=>{if(!n)return;const d=n.getIframe();if(d){l(`Found: iframe[name="${d.name}"]`),c(`Iframe check: name="${d.name}"`);try{const w=!!d.contentWindow&&typeof d.contentWindow.postMessage=="function";c(`contentWindow accessible: ${w}`)}catch(u){c(`contentWindow access error: ${u}`)}}else l("Not found"),c("Iframe NOT found")},B=()=>{n?.destroy(),s(null),a("destroyed"),l("none"),c("Container destroyed")};return e.jsxs("div",{className:"flex h-screen flex-col gap-4 p-4",children:[e.jsxs("div",{className:"flex gap-2",children:[e.jsx("button",{"data-testid":"btn-create-wujie",onClick:C,disabled:!!n,className:"rounded bg-purple-500 px-4 py-2 text-white disabled:opacity-50",children:"Create Wujie Container"}),e.jsx("button",{"data-testid":"btn-check-iframe",onClick:h,disabled:!n,className:"rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50",children:"Check Iframe"}),e.jsx("button",{"data-testid":"btn-destroy-wujie",onClick:B,disabled:!n,className:"rounded bg-red-500 px-4 py-2 text-white disabled:opacity-50",children:"Destroy"})]}),e.jsxs("div",{className:"flex gap-4 text-sm",children:[e.jsxs("div",{children:["Status:"," ",e.jsx("span",{"data-testid":"wujie-status",className:"font-mono",children:t})]}),e.jsxs("div",{children:["Type:"," ",e.jsx("span",{"data-testid":"wujie-type",className:"font-mono",children:n?.type??"none"})]}),e.jsxs("div",{children:["Iframe:"," ",e.jsx("span",{"data-testid":"wujie-iframe-info",className:"font-mono",children:m})]})]}),e.jsxs("div",{className:"flex flex-1 gap-4",children:[e.jsxs("div",{className:"flex-1 rounded border border-gray-300 bg-gray-100 p-2",children:[e.jsx("div",{className:"mb-2 text-xs text-gray-500",children:"Wujie Container"}),e.jsx("div",{ref:p,className:"h-full","data-testid":"wujie-container-host"})]}),e.jsxs("div",{className:"w-80 rounded border border-gray-300 bg-gray-900 p-2 text-xs text-green-400",children:[e.jsx("div",{className:"mb-2 text-gray-500",children:"Logs"}),e.jsx("div",{"data-testid":"wujie-logs",className:"font-mono",children:g.map((d,u)=>e.jsx("div",{children:d},u))})]})]})]})}const f={render:()=>e.jsx(E,{}),play:async({canvasElement:n,step:s})=>{const t=I(n);await s("Initial state",async()=>{o(t.getByTestId("wujie-status")).toHaveTextContent("idle"),o(t.getByTestId("wujie-type")).toHaveTextContent("none"),o(t.getByTestId("wujie-iframe-info")).toHaveTextContent("none")}),await s("Create wujie container",async()=>{await y.click(t.getByTestId("btn-create-wujie")),await new Promise(a=>setTimeout(a,2e3)),o(t.getByTestId("wujie-status")).toHaveTextContent(/created|loaded/),o(t.getByTestId("wujie-type")).toHaveTextContent("wujie")}),await s("Check iframe is accessible",async()=>{await y.click(t.getByTestId("btn-check-iframe")),await new Promise(a=>setTimeout(a,500)),o(t.getByTestId("wujie-iframe-info")).toHaveTextContent(/Found|iframe/)}),await s("Destroy container",async()=>{await y.click(t.getByTestId("btn-destroy-wujie")),await new Promise(a=>setTimeout(a,100)),o(t.getByTestId("wujie-status")).toHaveTextContent("destroyed"),o(t.getByTestId("wujie-type")).toHaveTextContent("none")})}};T.parameters={...T.parameters,docs:{...T.parameters?.docs,source:{originalSource:`{
  render: () => <IframeContainerDemo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('Initial state', async () => {
      expect(canvas.getByTestId('status')).toHaveTextContent('idle');
      expect(canvas.getByTestId('connected')).toHaveTextContent('no');
      expect(canvas.getByTestId('type')).toHaveTextContent('none');
    });
    await step('Create container', async () => {
      await userEvent.click(canvas.getByTestId('btn-create'));
      await new Promise(r => setTimeout(r, 100));
      expect(canvas.getByTestId('status')).toHaveTextContent('created');
      expect(canvas.getByTestId('connected')).toHaveTextContent('yes');
      expect(canvas.getByTestId('type')).toHaveTextContent('iframe');
    });
    await step('Move to background', async () => {
      await userEvent.click(canvas.getByTestId('btn-background'));
      await new Promise(r => setTimeout(r, 100));
      expect(canvas.getByTestId('status')).toHaveTextContent('background');
    });
    await step('Move to foreground', async () => {
      await userEvent.click(canvas.getByTestId('btn-foreground'));
      await new Promise(r => setTimeout(r, 100));
      expect(canvas.getByTestId('status')).toHaveTextContent('foreground');
    });
    await step('Destroy container', async () => {
      await userEvent.click(canvas.getByTestId('btn-destroy'));
      await new Promise(r => setTimeout(r, 100));
      expect(canvas.getByTestId('status')).toHaveTextContent('destroyed');
      expect(canvas.getByTestId('connected')).toHaveTextContent('no');
      expect(canvas.getByTestId('type')).toHaveTextContent('none');
    });
  }
}`,...T.parameters?.docs?.source}}};v.parameters={...v.parameters,docs:{...v.parameters?.docs,source:{originalSource:`{
  render: () => <MultipleContainersDemo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('Create 3 containers', async () => {
      for (let i = 0; i < 3; i++) {
        await userEvent.click(canvas.getByTestId('btn-create-multi'));
        await new Promise(r => setTimeout(r, 50));
      }
      expect(canvas.getByTestId('count')).toHaveTextContent('3');
    });
    await step('Destroy last container', async () => {
      await userEvent.click(canvas.getByTestId('btn-destroy-last'));
      await new Promise(r => setTimeout(r, 50));
      expect(canvas.getByTestId('count')).toHaveTextContent('2');
    });
    await step('Cleanup all containers', async () => {
      await userEvent.click(canvas.getByTestId('btn-cleanup-all'));
      await new Promise(r => setTimeout(r, 50));
      expect(canvas.getByTestId('count')).toHaveTextContent('0');
    });
  }
}`,...v.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => <WujieContainerDemo />,
  play: async ({
    canvasElement,
    step
  }) => {
    const canvas = within(canvasElement);
    await step('Initial state', async () => {
      expect(canvas.getByTestId('wujie-status')).toHaveTextContent('idle');
      expect(canvas.getByTestId('wujie-type')).toHaveTextContent('none');
      expect(canvas.getByTestId('wujie-iframe-info')).toHaveTextContent('none');
    });
    await step('Create wujie container', async () => {
      await userEvent.click(canvas.getByTestId('btn-create-wujie'));
      await new Promise(r => setTimeout(r, 2000));
      expect(canvas.getByTestId('wujie-status')).toHaveTextContent(/created|loaded/);
      expect(canvas.getByTestId('wujie-type')).toHaveTextContent('wujie');
    });
    await step('Check iframe is accessible', async () => {
      await userEvent.click(canvas.getByTestId('btn-check-iframe'));
      await new Promise(r => setTimeout(r, 500));
      expect(canvas.getByTestId('wujie-iframe-info')).toHaveTextContent(/Found|iframe/);
    });
    await step('Destroy container', async () => {
      await userEvent.click(canvas.getByTestId('btn-destroy-wujie'));
      await new Promise(r => setTimeout(r, 100));
      expect(canvas.getByTestId('wujie-status')).toHaveTextContent('destroyed');
      expect(canvas.getByTestId('wujie-type')).toHaveTextContent('none');
    });
  }
}`,...f.parameters?.docs?.source}}};const M=["IframeContainer","MultipleContainers","WujieContainer"];export{T as IframeContainer,v as MultipleContainers,f as WujieContainer,M as __namedExportsOrder,$ as default};
