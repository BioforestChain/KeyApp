import{r as o,j as s}from"./iframe-BphNANQP.js";import{c as l}from"./utils-4perknFd.js";import{C as A}from"./chain-icon-C889DtOP.js";import{u as N}from"./useTranslation-JGtij7MO.js";import{I as w}from"./IconCheck-AX_jaYDM.js";import"./preload-helper-PPVm8Dsz.js";import"./service-4DWrGAFI.js";import"./schemas-CO8_C8zP.js";import"./index-D0E7N0oa.js";import"./derivation-BfrHXRlw.js";import"./index-DJUnhNHd.js";import"./createReactComponent-CL1v_uZJ.js";function k(e){return e.length<=14?e:`${e.slice(0,8)}...${e.slice(-6)}`}function T({chain:e,isSelected:a,onSelect:r}){return s.jsxs("button",{type:"button",onClick:r,className:l("flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors","hover:bg-muted/50 focus-visible:ring-ring focus:outline-none focus-visible:ring-2",a&&"bg-muted"),"aria-selected":a,role:"option",children:[s.jsx(A,{chain:e.chain,size:"sm"}),s.jsx("span",{className:l("truncate text-sm",a&&"font-medium"),children:e.name})]})}function D({address:e,isSelected:a,onSelect:r,defaultLabel:c}){return s.jsxs("button",{type:"button",onClick:r,className:l("flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors","hover:bg-muted/50 focus-visible:ring-ring focus:outline-none focus-visible:ring-2",a&&"bg-primary/10"),"aria-selected":a,role:"option",children:[s.jsxs("div",{className:"min-w-0 flex-1",children:[s.jsxs("div",{className:"flex items-center gap-2",children:[s.jsx("span",{className:"truncate font-mono text-sm",children:k(e.address)}),e.isDefault&&s.jsx("span",{className:"bg-muted text-muted-foreground shrink-0 rounded px-1 py-0.5 text-[10px]",children:c})]}),e.balance&&s.jsx("p",{className:"text-muted-foreground text-xs",children:e.balance})]}),a&&s.jsx(w,{className:"text-primary size-4 shrink-0","aria-hidden":"true"})]})}function C({chains:e,selectedChain:a,selectedAddress:r,onSelect:c,className:m}){const{t:i}=N("wallet"),[d,y]=o.useState(a??e[0]?.chain??"ethereum"),S=o.useMemo(()=>e.find(n=>n.chain===d),[e,d]),j=o.useCallback(n=>{y(n)},[]),v=o.useCallback(n=>{c?.(d,n)},[d,c]);return e.length===0?s.jsx("div",{className:l("text-muted-foreground py-8 text-center",m),children:s.jsx("p",{children:i("chainSelector.noChains")})}):s.jsxs("div",{className:l("border-border flex min-h-48 overflow-hidden rounded-lg border",m),children:[s.jsx("div",{className:"border-border bg-muted/30 w-28 shrink-0 space-y-0.5 overflow-y-auto border-r p-2",role:"listbox","aria-label":i("chainSelector.selectChain"),children:e.map(n=>s.jsx(T,{chain:n,isSelected:n.chain===d,onSelect:()=>j(n.chain)},n.chain))}),s.jsxs("div",{className:"min-w-0 flex-1 space-y-0.5 overflow-y-auto p-2",role:"listbox","aria-label":i("chainSelector.selectAddress"),children:[S?.addresses.length===0&&s.jsx("div",{className:"text-muted-foreground py-6 text-center text-sm",children:i("chainSelector.noAddresses")}),S?.addresses.map(n=>s.jsx(D,{address:n,isSelected:n.address===r,onSelect:()=>v(n.address),defaultLabel:i("chainSelector.default")},n.address))]})]})}C.__docgenInfo={description:"Two-column chain and address selector",methods:[],displayName:"ChainAddressSelector",props:{chains:{required:!0,tsType:{name:"Array",elements:[{name:"ChainData"}],raw:"ChainData[]"},description:"List of chains with addresses"},selectedChain:{required:!1,tsType:{name:"union",raw:"ChainType | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Selected chain type"},selectedAddress:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Selected address"},onSelect:{required:!1,tsType:{name:"union",raw:"((chain: ChainType, address: string) => void) | undefined",elements:[{name:"unknown"},{name:"undefined"}]},description:"Callback when address is selected"},className:{required:!1,tsType:{name:"union",raw:"string | undefined",elements:[{name:"string"},{name:"undefined"}]},description:"Additional class names"}}};const P={title:"Wallet/ChainAddressSelector",component:C,tags:["autodocs"],decorators:[e=>s.jsx("div",{className:"max-w-md",children:s.jsx(e,{})})]},t=[{chain:"ethereum",name:"Ethereum",addresses:[{address:"0x1234567890abcdef1234567890abcdef12345678",balance:"1.5 ETH",isDefault:!0},{address:"0xabcdef1234567890abcdef1234567890abcdef12",balance:"0.5 ETH"},{address:"0x9876543210fedcba9876543210fedcba98765432",balance:"0.1 ETH"}]},{chain:"tron",name:"Tron",addresses:[{address:"TAbcdefghijklmnopqrstuvwxyz123456",balance:"10,000 TRX",isDefault:!0},{address:"TXyzabcdefghijklmnopqrstuvwx987654",balance:"5,000 TRX"}]},{chain:"bsc",name:"BSC",addresses:[{address:"0xfedcba9876543210fedcba9876543210fedcba98",balance:"2 BNB",isDefault:!0}]},{chain:"bfmeta",name:"BFMeta",addresses:[{address:"c3nqGntFJ2fF7GwJoGmcuHVCVhpBpQSA",balance:"100 BFT",isDefault:!0}]}],h={args:{chains:t}},u={args:{chains:[t[0]]}},p={args:{chains:t,selectedChain:"ethereum",selectedAddress:"0xabcdef1234567890abcdef1234567890abcdef12"}},f={args:{chains:[...t,{chain:"bitcoin",name:"Bitcoin",addresses:[]}],selectedChain:"bitcoin"}},g={render:()=>{const[e,a]=o.useState(null),r={chains:t,onSelect:(c,m)=>a({chain:c,address:m}),...e?.chain&&{selectedChain:e.chain},...e?.address&&{selectedAddress:e.address}};return s.jsxs("div",{className:"space-y-4",children:[s.jsx(C,{...r}),e&&s.jsxs("div",{className:"rounded-lg bg-muted p-3 text-sm",children:[s.jsxs("p",{children:[s.jsx("strong",{children:"Chain:"})," ",e.chain]}),s.jsxs("p",{className:"font-mono",children:[s.jsx("strong",{children:"Address:"})," ",e.address]})]})]})}},x={args:{chains:[{chain:"ethereum",name:"Ethereum",addresses:Array.from({length:10},(e,a)=>({address:`0x${(a+1).toString().padStart(40,"0")}`,balance:`${(10-a)*.5} ETH`,isDefault:a===0}))},...t.slice(1)]}},b={args:{chains:t.map(e=>({...e,addresses:e.addresses.map(a=>({...a,balance:a.balance||"0"}))}))}};h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{
  args: {
    chains: mockChains
  }
}`,...h.parameters?.docs?.source}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  args: {
    chains: [mockChains[0]!]
  }
}`,...u.parameters?.docs?.source}}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  args: {
    chains: mockChains,
    selectedChain: 'ethereum',
    selectedAddress: '0xabcdef1234567890abcdef1234567890abcdef12'
  }
}`,...p.parameters?.docs?.source}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  args: {
    chains: [...mockChains, {
      chain: 'bitcoin',
      name: 'Bitcoin',
      addresses: []
    }],
    selectedChain: 'bitcoin'
  }
}`,...f.parameters?.docs?.source}}};g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [selection, setSelection] = useState<{
      chain: string;
      address: string;
    } | null>(null);
    const chainAddressProps = {
      chains: mockChains,
      onSelect: (chain: string, address: string) => setSelection({
        chain,
        address
      }),
      ...(selection?.chain && {
        selectedChain: selection.chain as ChainData['chain']
      }),
      ...(selection?.address && {
        selectedAddress: selection.address
      })
    };
    return <div className="space-y-4">
        <ChainAddressSelector {...chainAddressProps} />
        {selection && <div className="rounded-lg bg-muted p-3 text-sm">
            <p>
              <strong>Chain:</strong> {selection.chain}
            </p>
            <p className="font-mono">
              <strong>Address:</strong> {selection.address}
            </p>
          </div>}
      </div>;
  }
}`,...g.parameters?.docs?.source}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  args: {
    chains: [{
      chain: 'ethereum',
      name: 'Ethereum',
      addresses: Array.from({
        length: 10
      }, (_, i) => ({
        address: \`0x\${(i + 1).toString().padStart(40, '0')}\`,
        balance: \`\${(10 - i) * 0.5} ETH\`,
        isDefault: i === 0
      }))
    }, ...mockChains.slice(1)]
  }
}`,...x.parameters?.docs?.source}}};b.parameters={...b.parameters,docs:{...b.parameters?.docs,source:{originalSource:`{
  args: {
    chains: mockChains.map(c => ({
      ...c,
      addresses: c.addresses.map(a => ({
        ...a,
        balance: a.balance || '0'
      }))
    }))
  }
}`,...b.parameters?.docs?.source}}};const R=["Default","SingleChain","WithSelection","EmptyChain","Interactive","ManyAddresses","WithBalances"];export{h as Default,f as EmptyChain,g as Interactive,x as ManyAddresses,u as SingleChain,b as WithBalances,p as WithSelection,R as __namedExportsOrder,P as default};
