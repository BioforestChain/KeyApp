import{r as x,j as e}from"./iframe-mWBAGdu2.js";import{g as b,s as i}from"./scanner-validators-YRGmuXyx.js";import{p}from"./qr-parser-G6ommSXW.js";import"./preload-helper-PPVm8Dsz.js";import"./jsQR-Cyt_s6WE.js";const g={title:"Sheets/ScannerJob",parameters:{layout:"centered"}},l={render:()=>{const[s,t]=x.useState("0x742d35Cc6634C0532925a3b844Bc9e7595f12345"),[a,c]=x.useState("ethereum"),m=b(a),n=p(s),r=m(s,n);return e.jsxs("div",{className:"w-96 space-y-4 rounded-lg border p-6",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"Scanner Validator 测试"}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"链类型"}),e.jsxs("select",{value:a,onChange:u=>c(u.target.value),className:"w-full rounded border px-3 py-2",children:[e.jsx("option",{value:"ethereum",children:"Ethereum"}),e.jsx("option",{value:"bitcoin",children:"Bitcoin"}),e.jsx("option",{value:"tron",children:"Tron"}),e.jsx("option",{value:"",children:"Any"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"扫描内容"}),e.jsx("input",{type:"text",value:s,onChange:u=>t(u.target.value),className:"w-full rounded border px-3 py-2 font-mono text-sm",placeholder:"输入地址或二维码内容"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"解析结果"}),e.jsx("pre",{className:"rounded bg-gray-100 p-3 text-xs overflow-auto",children:JSON.stringify(n,null,2)})]}),e.jsx("div",{className:`rounded p-3 ${r===!0?"bg-green-100":"bg-red-100"}`,children:r===!0?e.jsx("p",{className:"font-medium text-green-800",children:"✓ 验证通过"}):e.jsxs("p",{className:"font-medium text-red-800",children:["✗ ",r]})})]})}},o={render:()=>{const s=[{label:"ETH 地址",value:"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{label:"ETH URI",value:"ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{label:"ETH 支付",value:"ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f12345?value=1000000000000000000"},{label:"BTC 地址",value:"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"},{label:"BTC URI",value:"bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"},{label:"TRX 地址",value:"TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW"},{label:"无效地址",value:"hello world"},{label:"短地址",value:"0x123"}];return e.jsxs("div",{className:"w-[500px] space-y-4 rounded-lg border p-6",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"地址格式验证"}),e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b",children:[e.jsx("th",{className:"py-2 text-left",children:"格式"}),e.jsx("th",{className:"py-2 text-left",children:"ETH"}),e.jsx("th",{className:"py-2 text-left",children:"BTC"}),e.jsx("th",{className:"py-2 text-left",children:"TRX"}),e.jsx("th",{className:"py-2 text-left",children:"Any"})]})}),e.jsx("tbody",{children:s.map(t=>{const a=p(t.value),c=i.ethereumAddress(t.value,a),m=i.bitcoinAddress(t.value,a),n=i.tronAddress(t.value,a),r=i.anyAddress(t.value,a);return e.jsxs("tr",{className:"border-b",children:[e.jsx("td",{className:"py-2 font-medium",children:t.label}),e.jsx("td",{className:"py-2",children:c===!0?"✓":"✗"}),e.jsx("td",{className:"py-2",children:m===!0?"✓":"✗"}),e.jsx("td",{className:"py-2",children:n===!0?"✓":"✗"}),e.jsx("td",{className:"py-2",children:r===!0?"✓":"✗"})]},t.label)})})]})]})}},d={render:()=>{const[s,t]=x.useState(null);return e.jsxs("div",{className:"relative h-[600px] w-[375px] overflow-hidden rounded-2xl bg-black",children:[e.jsx("div",{className:"flex justify-center py-2",children:e.jsx("div",{className:"h-1 w-10 rounded-full bg-white/30"})}),e.jsxs("div",{className:"flex items-center justify-between px-4 pb-2",children:[e.jsx("button",{className:"rounded-full p-2 text-white hover:bg-white/20",children:e.jsx("svg",{className:"size-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M6 18L18 6M6 6l12 12"})})}),e.jsx("h2",{className:"text-lg font-medium text-white",children:"扫一扫"}),e.jsx("button",{className:"rounded-full p-2 text-white hover:bg-white/20",children:e.jsx("svg",{className:"size-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"})})})]}),e.jsxs("div",{className:"relative flex-1 bg-gray-900",style:{height:400},children:[e.jsx("div",{className:"flex size-full items-center justify-center",children:e.jsx("p",{className:"text-white/40",children:"相机预览区域"})}),e.jsx("div",{className:"absolute inset-0 flex items-center justify-center",children:e.jsxs("div",{className:"relative size-64",children:[e.jsx("div",{className:"absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary"}),e.jsx("div",{className:"absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary"}),e.jsx("div",{className:"absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary"}),e.jsx("div",{className:"absolute right-0 bottom-0 size-8 border-r-4 border-b-4 border-primary"}),e.jsx("div",{className:"animate-scan bg-primary absolute right-2 left-2 h-0.5"})]})}),e.jsx("div",{className:"absolute inset-x-0 bottom-24 px-4 text-center",children:s?e.jsx("div",{className:`inline-block rounded-lg px-4 py-2 ${s.type==="error"?"bg-red-500/80":"bg-green-500/80"} text-white`,children:s.text}):e.jsx("p",{className:"text-white/80",children:"请提供 Ethereum 链的地址二维码"})})]}),e.jsx("div",{className:"flex justify-center gap-8 bg-black/50 py-6",children:e.jsxs("button",{className:"flex flex-col items-center text-white",children:[e.jsx("svg",{className:"mb-1 size-6",fill:"none",stroke:"currentColor",viewBox:"0 0 24 24",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"})}),e.jsx("span",{className:"text-xs",children:"相册"})]})}),e.jsxs("div",{className:"absolute bottom-4 left-4 right-4 flex gap-2",children:[e.jsx("button",{onClick:()=>t({type:"success",text:"二维码已扫描"}),className:"flex-1 rounded bg-green-500 py-2 text-sm text-white",children:"模拟成功"}),e.jsx("button",{onClick:()=>t({type:"error",text:"不是有效的以太坊地址"}),className:"flex-1 rounded bg-red-500 py-2 text-sm text-white",children:"模拟错误"}),e.jsx("button",{onClick:()=>t(null),className:"flex-1 rounded bg-gray-500 py-2 text-sm text-white",children:"重置"})]})]})}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [input, setInput] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f12345');
    const [chainType, setChainType] = useState<string>('ethereum');
    const validator = getValidatorForChain(chainType);
    const parsed = parseQRContent(input);
    const result = validator(input, parsed);
    return <div className="w-96 space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">Scanner Validator 测试</h2>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">链类型</label>
          <select value={chainType} onChange={e => setChainType(e.target.value)} className="w-full rounded border px-3 py-2">
            <option value="ethereum">Ethereum</option>
            <option value="bitcoin">Bitcoin</option>
            <option value="tron">Tron</option>
            <option value="">Any</option>
          </select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">扫描内容</label>
          <input type="text" value={input} onChange={e => setInput(e.target.value)} className="w-full rounded border px-3 py-2 font-mono text-sm" placeholder="输入地址或二维码内容" />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">解析结果</label>
          <pre className="rounded bg-gray-100 p-3 text-xs overflow-auto">
            {JSON.stringify(parsed, null, 2)}
          </pre>
        </div>
        
        <div className={\`rounded p-3 \${result === true ? 'bg-green-100' : 'bg-red-100'}\`}>
          {result === true ? <p className="font-medium text-green-800">✓ 验证通过</p> : <p className="font-medium text-red-800">✗ {result}</p>}
        </div>
      </div>;
  }
}`,...l.parameters?.docs?.source},description:{story:"验证器测试演示",...l.parameters?.docs?.description}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const testCases = [{
      label: 'ETH 地址',
      value: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
    }, {
      label: 'ETH URI',
      value: 'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
    }, {
      label: 'ETH 支付',
      value: 'ethereum:0x742d35Cc6634C0532925a3b844Bc9e7595f12345?value=1000000000000000000'
    }, {
      label: 'BTC 地址',
      value: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    }, {
      label: 'BTC URI',
      value: 'bitcoin:bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
    }, {
      label: 'TRX 地址',
      value: 'TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW'
    }, {
      label: '无效地址',
      value: 'hello world'
    }, {
      label: '短地址',
      value: '0x123'
    }];
    return <div className="w-[500px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">地址格式验证</h2>
        
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">格式</th>
              <th className="py-2 text-left">ETH</th>
              <th className="py-2 text-left">BTC</th>
              <th className="py-2 text-left">TRX</th>
              <th className="py-2 text-left">Any</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map(tc => {
            const parsed = parseQRContent(tc.value);
            const ethResult = scanValidators.ethereumAddress(tc.value, parsed);
            const btcResult = scanValidators.bitcoinAddress(tc.value, parsed);
            const trxResult = scanValidators.tronAddress(tc.value, parsed);
            const anyResult = scanValidators.anyAddress(tc.value, parsed);
            return <tr key={tc.label} className="border-b">
                  <td className="py-2 font-medium">{tc.label}</td>
                  <td className="py-2">{ethResult === true ? '✓' : '✗'}</td>
                  <td className="py-2">{btcResult === true ? '✓' : '✗'}</td>
                  <td className="py-2">{trxResult === true ? '✓' : '✗'}</td>
                  <td className="py-2">{anyResult === true ? '✓' : '✗'}</td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>;
  }
}`,...o.parameters?.docs?.source},description:{story:"地址格式测试",...o.parameters?.docs?.description}}};d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [message, setMessage] = useState<{
      type: 'error' | 'success';
      text: string;
    } | null>(null);
    return <div className="relative h-[600px] w-[375px] overflow-hidden rounded-2xl bg-black">
        {/* Handle */}
        <div className="flex justify-center py-2">
          <div className="h-1 w-10 rounded-full bg-white/30" />
        </div>
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-2">
          <button className="rounded-full p-2 text-white hover:bg-white/20">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <h2 className="text-lg font-medium text-white">扫一扫</h2>
          <button className="rounded-full p-2 text-white hover:bg-white/20">
            <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
        </div>
        
        {/* Camera View */}
        <div className="relative flex-1 bg-gray-900" style={{
        height: 400
      }}>
          {/* Simulated camera */}
          <div className="flex size-full items-center justify-center">
            <p className="text-white/40">相机预览区域</p>
          </div>
          
          {/* Scan overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative size-64">
              <div className="absolute top-0 left-0 size-8 border-t-4 border-l-4 border-primary" />
              <div className="absolute top-0 right-0 size-8 border-t-4 border-r-4 border-primary" />
              <div className="absolute bottom-0 left-0 size-8 border-b-4 border-l-4 border-primary" />
              <div className="absolute right-0 bottom-0 size-8 border-r-4 border-b-4 border-primary" />
              <div className="animate-scan bg-primary absolute right-2 left-2 h-0.5" />
            </div>
          </div>
          
          {/* Message area */}
          <div className="absolute inset-x-0 bottom-24 px-4 text-center">
            {message ? <div className={\`inline-block rounded-lg px-4 py-2 \${message.type === 'error' ? 'bg-red-500/80' : 'bg-green-500/80'} text-white\`}>
                {message.text}
              </div> : <p className="text-white/80">请提供 Ethereum 链的地址二维码</p>}
          </div>
        </div>
        
        {/* Bottom controls */}
        <div className="flex justify-center gap-8 bg-black/50 py-6">
          <button className="flex flex-col items-center text-white">
            <svg className="mb-1 size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs">相册</span>
          </button>
        </div>
        
        {/* Test buttons */}
        <div className="absolute bottom-4 left-4 right-4 flex gap-2">
          <button onClick={() => setMessage({
          type: 'success',
          text: '二维码已扫描'
        })} className="flex-1 rounded bg-green-500 py-2 text-sm text-white">
            模拟成功
          </button>
          <button onClick={() => setMessage({
          type: 'error',
          text: '不是有效的以太坊地址'
        })} className="flex-1 rounded bg-red-500 py-2 text-sm text-white">
            模拟错误
          </button>
          <button onClick={() => setMessage(null)} className="flex-1 rounded bg-gray-500 py-2 text-sm text-white">
            重置
          </button>
        </div>
      </div>;
  }
}`,...d.parameters?.docs?.source},description:{story:"UI 模拟预览",...d.parameters?.docs?.description}}};const j=["ValidatorDemo","AddressFormats","UIPreview"];export{o as AddressFormats,d as UIPreview,l as ValidatorDemo,j as __namedExportsOrder,g as default};
