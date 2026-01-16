const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./snapdom-CO8q8LPW.js","./preload-helper-PPVm8Dsz.js"])))=>i.map(i=>d[i]);
import{_ as w}from"./preload-helper-PPVm8Dsz.js";import{r as d,j as e}from"./iframe-Cq46tYX8.js";import{Q as A,C as S}from"./contact-card-8O0jF1ws.js";import{g as C,p as j}from"./qr-parser-Bhoe7BAC.js";import{g as b,e as h,C as N,a as B}from"./contact-avatar-fm9WYgAZ.js";import{B as v}from"./button-umYeXCJ9.js";import{I as T}from"./IconLoader2-DetAZlSG.js";import{I as z}from"./IconDownload-8EF2Yl-v.js";import"./address-format-CtvAo1Ai.js";import"./index-D0E7N0oa.js";import"./bioforest-D9p3ncSz.js";import"./jsQR-DE6qk4S4.js";import"./index-BQmvxBVi.js";import"./createReactComponent-BzDfpkHh.js";import"./utils-CDN07tui.js";import"./useButton-B0SnfSvz.js";import"./useRenderElement-YBikQ6T1.js";const G={title:"Sheets/ContactJobs",parameters:{layout:"centered"}},p={render:()=>{const[n,t]=d.useState("张三"),[s,r]=d.useState("0x742d35Cc6634C0532925a3b844Bc9e7595f12345"),[a,l]=d.useState(""),[y,g]=d.useState("好友"),m=[s&&{chainType:"ethereum",address:s},a&&{chainType:"bitcoin",address:a}].filter(Boolean),i=C({name:n,addresses:m}),o=j(i);return e.jsxs("div",{className:"w-[500px] space-y-4 rounded-lg border p-6",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"联系人协议测试"}),e.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"名称"}),e.jsx("input",{type:"text",value:n,onChange:c=>t(c.target.value),className:"w-full rounded border px-3 py-2"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"备注"}),e.jsx("input",{type:"text",value:y,onChange:c=>g(c.target.value),className:"w-full rounded border px-3 py-2"})]})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"ETH 地址"}),e.jsx("input",{type:"text",value:s,onChange:c=>r(c.target.value),className:"w-full rounded border px-3 py-2 font-mono text-sm"})]}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"BTC 地址 (可选)"}),e.jsx("input",{type:"text",value:a,onChange:c=>l(c.target.value),className:"w-full rounded border px-3 py-2 font-mono text-sm",placeholder:"bc1..."})]}),e.jsx("div",{className:"flex justify-center rounded-lg bg-white p-4",children:e.jsx(A,{value:i,size:180,level:"M"})}),e.jsxs("div",{className:"space-y-2",children:[e.jsx("label",{className:"text-sm font-medium",children:"生成的二维码内容"}),e.jsx("pre",{className:"max-h-32 overflow-auto rounded bg-gray-100 p-3 text-xs",children:JSON.stringify(JSON.parse(i),null,2)})]}),e.jsx("div",{className:`rounded p-3 ${o.type==="contact"?"bg-green-100":"bg-red-100"}`,children:o.type==="contact"?e.jsxs("div",{children:[e.jsx("p",{className:"font-medium text-green-800",children:"✓ 解析为联系人"}),e.jsxs("p",{className:"text-sm text-green-700",children:["名称: ",o.name]}),e.jsxs("p",{className:"text-sm text-green-700",children:["地址数: ",o.addresses.length]})]}):e.jsxs("p",{className:"font-medium text-red-800",children:["✗ 解析失败: ",o.type]})})]})}},x={render:()=>{const[n,t]=d.useState(()=>{const a=b();return`avatar:${h(a)}`}),s=()=>{const a=b();t(`avatar:${h(a)}`)},r=a=>{const l=B(a);t(`avatar:${h(l)}`)};return e.jsxs("div",{className:"flex flex-col items-center gap-6 p-8",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"Avatar 编码演示"}),e.jsxs("div",{className:"flex gap-8",children:[e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(N,{src:n,size:120}),e.jsx("code",{className:"rounded bg-slate-100 px-2 py-1 font-mono text-sm",children:n}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"8 字符 base64"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(N,{src:"👨‍💼",size:120}),e.jsx("code",{className:"rounded bg-slate-100 px-2 py-1 font-mono text-sm",children:"👨‍💼"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"Emoji 回退"})]}),e.jsxs("div",{className:"flex flex-col items-center gap-2",children:[e.jsx(N,{src:void 0,size:120}),e.jsx("code",{className:"rounded bg-slate-100 px-2 py-1 font-mono text-sm",children:"undefined"}),e.jsx("span",{className:"text-muted-foreground text-xs",children:"默认头像"})]})]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(v,{onClick:s,children:"随机生成"}),e.jsx(v,{variant:"outline",onClick:()=>r("alice"),children:"Seed: alice"}),e.jsx(v,{variant:"outline",onClick:()=>r("bob"),children:"Seed: bob"})]})]})}},u={render:()=>{const n=d.useRef(null),[t,s]=d.useState(!1),[r]=d.useState(()=>`avatar:${h(b())}`),a={name:"张三",avatar:r,addresses:[{chainType:"ethereum",address:"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{chainType:"bitcoin",address:"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"}]},l=C(a),y=d.useCallback(async()=>{const g=n.current;if(!(!g||t)){s(!0);try{const{snapdom:m}=await w(async()=>{const{snapdom:i}=await import("./snapdom-CO8q8LPW.js").then(o=>o.s);return{snapdom:i}},__vite__mapDeps([0,1]),import.meta.url);await m.download(g,{type:"png",filename:`contact-${a.name}.png`,scale:2,quality:1})}catch(m){console.error("Download failed:",m)}finally{s(!1)}}},[t]);return e.jsxs("div",{className:"flex flex-col items-center gap-6 p-8",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"新版名片卡片 (Avataaars + snapdom)"}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["头像编码: ",e.jsx("code",{className:"rounded bg-slate-100 px-1",children:r})]}),e.jsx("div",{ref:n,children:e.jsx(S,{name:a.name,avatar:a.avatar,addresses:a.addresses,qrContent:l})}),e.jsxs(v,{onClick:y,disabled:t,className:"w-40",children:[t?e.jsx(T,{className:"mr-2 size-4 animate-spin"}):e.jsx(z,{className:"mr-2 size-4"}),"下载名片"]})]})}},f={render:()=>{const n=[{name:"正常联系人",content:'{"type":"contact","name":"张三","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'},{name:"多地址联系人",content:'{"type":"contact","name":"李四","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{"chainType":"bitcoin","address":"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"}]}'},{name:"带备注和头像",content:'{"type":"contact","name":"王五","addresses":[{"chainType":"tron","address":"TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW"}],"memo":"老板","avatar":"👨‍💼"}'},{name:"URI 格式",content:"contact://张三?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345&memo=好友"},{name:"空名称 (无效)",content:'{"type":"contact","name":"","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'},{name:"空地址列表 (无效)",content:'{"type":"contact","name":"测试","addresses":[]}'},{name:"非联系人 JSON",content:'{"type":"other","data":"test"}'},{name:"普通地址",content:"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}];return e.jsxs("div",{className:"w-[600px] space-y-4 rounded-lg border p-6",children:[e.jsx("h2",{className:"text-lg font-semibold",children:"边界条件测试"}),e.jsxs("table",{className:"w-full text-sm",children:[e.jsx("thead",{children:e.jsxs("tr",{className:"border-b",children:[e.jsx("th",{className:"py-2 text-left",children:"用例"}),e.jsx("th",{className:"py-2 text-left",children:"解析类型"}),e.jsx("th",{className:"py-2 text-left",children:"结果"})]})}),e.jsx("tbody",{children:n.map(t=>{const s=j(t.content),r=s.type==="contact",a=s;return e.jsxs("tr",{className:"border-b",children:[e.jsx("td",{className:"py-2 font-medium",children:t.name}),e.jsx("td",{className:"py-2",children:e.jsx("span",{className:`rounded px-2 py-0.5 text-xs ${r?"bg-green-100 text-green-800":"bg-gray-100 text-gray-800"}`,children:s.type})}),e.jsx("td",{className:"py-2 text-xs",children:r?e.jsxs("span",{children:[a.name," (",a.addresses.length," 地址)"]}):e.jsx("span",{className:"text-muted-foreground",children:"-"})})]},t.name)})})]})]})}};p.parameters={...p.parameters,docs:{...p.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [name, setName] = useState('张三');
    const [ethAddress, setEthAddress] = useState('0x742d35Cc6634C0532925a3b844Bc9e7595f12345');
    const [btcAddress, setBtcAddress] = useState('');
    const [memo, setMemo] = useState('好友');
    const addresses = [ethAddress && {
      chainType: 'ethereum' as const,
      address: ethAddress
    }, btcAddress && {
      chainType: 'bitcoin' as const,
      address: btcAddress
    }].filter(Boolean) as {
      chainType: 'ethereum' | 'bitcoin' | 'tron';
      address: string;
    }[];
    const qrContent = generateContactQRContent({
      name,
      addresses
    });
    const parsed = parseQRContent(qrContent);
    return <div className="w-[500px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">联系人协议测试</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">名称</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">备注</label>
            <input type="text" value={memo} onChange={e => setMemo(e.target.value)} className="w-full rounded border px-3 py-2" />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">ETH 地址</label>
          <input type="text" value={ethAddress} onChange={e => setEthAddress(e.target.value)} className="w-full rounded border px-3 py-2 font-mono text-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">BTC 地址 (可选)</label>
          <input type="text" value={btcAddress} onChange={e => setBtcAddress(e.target.value)} className="w-full rounded border px-3 py-2 font-mono text-sm" placeholder="bc1..." />
        </div>

        <div className="flex justify-center rounded-lg bg-white p-4">
          <QRCodeSVG value={qrContent} size={180} level="M" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">生成的二维码内容</label>
          <pre className="max-h-32 overflow-auto rounded bg-gray-100 p-3 text-xs">
            {JSON.stringify(JSON.parse(qrContent), null, 2)}
          </pre>
        </div>

        <div className={\`rounded p-3 \${parsed.type === 'contact' ? 'bg-green-100' : 'bg-red-100'}\`}>
          {parsed.type === 'contact' ? <div>
              <p className="font-medium text-green-800">✓ 解析为联系人</p>
              <p className="text-sm text-green-700">名称: {parsed.name}</p>
              <p className="text-sm text-green-700">地址数: {parsed.addresses.length}</p>
            </div> : <p className="font-medium text-red-800">✗ 解析失败: {parsed.type}</p>}
        </div>
      </div>;
  }
}`,...p.parameters?.docs?.source},description:{story:"联系人协议解析测试",...p.parameters?.docs?.description}}};x.parameters={...x.parameters,docs:{...x.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [avatarCode, setAvatarCode] = useState(() => {
      const config = generateRandomAvatar();
      return \`avatar:\${encodeAvatar(config)}\`;
    });
    const regenerate = () => {
      const config = generateRandomAvatar();
      setAvatarCode(\`avatar:\${encodeAvatar(config)}\`);
    };
    const fromSeed = (seed: string) => {
      const config = generateAvatarFromSeed(seed);
      setAvatarCode(\`avatar:\${encodeAvatar(config)}\`);
    };
    return <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-lg font-semibold">Avatar 编码演示</h2>

        <div className="flex gap-8">
          <div className="flex flex-col items-center gap-2">
            <ContactAvatar src={avatarCode} size={120} />
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">{avatarCode}</code>
            <span className="text-muted-foreground text-xs">8 字符 base64</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ContactAvatar src="👨‍💼" size={120} />
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">👨‍💼</code>
            <span className="text-muted-foreground text-xs">Emoji 回退</span>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ContactAvatar src={undefined} size={120} />
            <code className="rounded bg-slate-100 px-2 py-1 font-mono text-sm">undefined</code>
            <span className="text-muted-foreground text-xs">默认头像</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={regenerate}>随机生成</Button>
          <Button variant="outline" onClick={() => fromSeed('alice')}>
            Seed: alice
          </Button>
          <Button variant="outline" onClick={() => fromSeed('bob')}>
            Seed: bob
          </Button>
        </div>
      </div>;
  }
}`,...x.parameters?.docs?.source},description:{story:"Avatar 编码演示",...x.parameters?.docs?.description}}};u.parameters={...u.parameters,docs:{...u.parameters?.docs,source:{originalSource:`{
  render: () => {
    const cardRef = useRef<HTMLDivElement>(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const [avatarCode] = useState(() => \`avatar:\${encodeAvatar(generateRandomAvatar())}\`);
    const contact = {
      name: '张三',
      avatar: avatarCode,
      addresses: [{
        chainType: 'ethereum' as const,
        address: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
      }, {
        chainType: 'bitcoin' as const,
        address: 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq'
      }]
    };
    const qrContent = generateContactQRContent(contact);
    const handleDownload = useCallback(async () => {
      const cardElement = cardRef.current;
      if (!cardElement || isDownloading) return;
      setIsDownloading(true);
      try {
        const {
          snapdom
        } = await import('@zumer/snapdom');
        await snapdom.download(cardElement, {
          type: 'png',
          filename: \`contact-\${contact.name}.png\`,
          scale: 2,
          quality: 1
        });
      } catch (error) {
        console.error('Download failed:', error);
      } finally {
        setIsDownloading(false);
      }
    }, [isDownloading]);
    return <div className="flex flex-col items-center gap-6 p-8">
        <h2 className="text-lg font-semibold">新版名片卡片 (Avataaars + snapdom)</h2>
        <p className="text-muted-foreground text-sm">
          头像编码: <code className="rounded bg-slate-100 px-1">{avatarCode}</code>
        </p>

        <div ref={cardRef}>
          <ContactCard name={contact.name} avatar={contact.avatar} addresses={contact.addresses} qrContent={qrContent} />
        </div>

        <Button onClick={handleDownload} disabled={isDownloading} className="w-40">
          {isDownloading ? <Loader className="mr-2 size-4 animate-spin" /> : <Download className="mr-2 size-4" />}
          下载名片
        </Button>
      </div>;
  }
}`,...u.parameters?.docs?.source},description:{story:"新版名片卡片样式 - 支持 snapdom 截图下载",...u.parameters?.docs?.description}}};f.parameters={...f.parameters,docs:{...f.parameters?.docs,source:{originalSource:`{
  render: () => {
    const testCases = [{
      name: '正常联系人',
      content: '{"type":"contact","name":"张三","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'
    }, {
      name: '多地址联系人',
      content: '{"type":"contact","name":"李四","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"},{"chainType":"bitcoin","address":"bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq"}]}'
    }, {
      name: '带备注和头像',
      content: '{"type":"contact","name":"王五","addresses":[{"chainType":"tron","address":"TJCnKsPa7y5okkXvQAidZBzqx3QyQ6sxMW"}],"memo":"老板","avatar":"👨‍💼"}'
    }, {
      name: 'URI 格式',
      content: 'contact://张三?eth=0x742d35Cc6634C0532925a3b844Bc9e7595f12345&memo=好友'
    }, {
      name: '空名称 (无效)',
      content: '{"type":"contact","name":"","addresses":[{"chainType":"ethereum","address":"0x742d35Cc6634C0532925a3b844Bc9e7595f12345"}]}'
    }, {
      name: '空地址列表 (无效)',
      content: '{"type":"contact","name":"测试","addresses":[]}'
    }, {
      name: '非联系人 JSON',
      content: '{"type":"other","data":"test"}'
    }, {
      name: '普通地址',
      content: '0x742d35Cc6634C0532925a3b844Bc9e7595f12345'
    }];
    return <div className="w-[600px] space-y-4 rounded-lg border p-6">
        <h2 className="text-lg font-semibold">边界条件测试</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="py-2 text-left">用例</th>
              <th className="py-2 text-left">解析类型</th>
              <th className="py-2 text-left">结果</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map(tc => {
            const parsed = parseQRContent(tc.content);
            const isContact = parsed.type === 'contact';
            const contactParsed = parsed as ParsedContact;
            return <tr key={tc.name} className="border-b">
                  <td className="py-2 font-medium">{tc.name}</td>
                  <td className="py-2">
                    <span className={\`rounded px-2 py-0.5 text-xs \${isContact ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}\`}>
                      {parsed.type}
                    </span>
                  </td>
                  <td className="py-2 text-xs">
                    {isContact ? <span>
                        {contactParsed.name} ({contactParsed.addresses.length} 地址)
                      </span> : <span className="text-muted-foreground">-</span>}
                  </td>
                </tr>;
          })}
          </tbody>
        </table>
      </div>;
  }
}`,...f.parameters?.docs?.source},description:{story:"边界条件测试",...f.parameters?.docs?.description}}};const K=["ContactProtocolDemo","AvatarCodecDemo","ContactCardPreview","EdgeCases"];export{x as AvatarCodecDemo,u as ContactCardPreview,p as ContactProtocolDemo,f as EdgeCases,K as __namedExportsOrder,G as default};
