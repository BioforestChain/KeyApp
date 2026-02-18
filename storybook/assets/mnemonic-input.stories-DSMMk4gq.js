import{r as a,j as e}from"./iframe-BpDWdeYo.js";import{M as l}from"./mnemonic-input-Dh5Z6a05.js";import{G as p}from"./LoadingSpinner-C9FyLoGg.js";import"./preload-helper-PPVm8Dsz.js";import"./utils-4perknFd.js";import"./useTranslation-_tBHPFow.js";import"./index-746G9wrD.js";import"./NumberFlow-client-48rw3j0J-DKr1HO1_.js";const v={title:"Security/MnemonicInput",component:l,tags:["autodocs"]},s={args:{wordCount:12,onComplete:t=>alert(`Complete: ${t.join(" ")}`)}},r={args:{wordCount:24,onComplete:t=>console.log("Complete:",t)}},o={render:()=>{const[t,c]=a.useState([]),[d,m]=a.useState(!1);return e.jsxs("div",{className:"space-y-4",children:[e.jsx(l,{wordCount:12,onChange:(i,u)=>{c(i),m(u)}}),e.jsx(p,{fullWidth:!0,disabled:!d,onClick:()=>alert(`导入: ${t.join(" ")}`),children:"导入钱包"}),e.jsx("p",{className:"text-muted-foreground text-center text-xs",children:"提示：可以直接粘贴完整的助记词"})]})}},n={render:()=>{const[t,c]=a.useState("input"),[d,m]=a.useState([]);return t==="success"?e.jsxs("div",{className:"space-y-4 py-8 text-center",children:[e.jsx("div",{className:"bg-green-500/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full",children:e.jsx("svg",{className:"text-green-500 h-8 w-8",fill:"none",viewBox:"0 0 24 24",stroke:"currentColor",children:e.jsx("path",{strokeLinecap:"round",strokeLinejoin:"round",strokeWidth:2,d:"M5 13l4 4L19 7"})})}),e.jsx("p",{className:"font-medium",children:"钱包导入成功"}),e.jsxs("p",{className:"text-muted-foreground text-sm",children:["共导入 ",d.length," 个单词"]})]}):e.jsxs("div",{className:"space-y-4",children:[e.jsxs("div",{className:"text-center",children:[e.jsx("h3",{className:"font-medium",children:"导入钱包"}),e.jsx("p",{className:"text-muted-foreground mt-1 text-sm",children:"请输入您的助记词"})]}),e.jsx(l,{wordCount:12,onComplete:i=>{m(i),c("success")}})]})}};s.parameters={...s.parameters,docs:{...s.parameters?.docs,source:{originalSource:`{
  args: {
    wordCount: 12,
    onComplete: words => alert(\`Complete: \${words.join(' ')}\`)
  }
}`,...s.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    wordCount: 24,
    onComplete: words => console.log('Complete:', words)
  }
}`,...r.parameters?.docs?.source}}};o.parameters={...o.parameters,docs:{...o.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [words, setWords] = useState<string[]>([]);
    const [isComplete, setIsComplete] = useState(false);
    return <div className="space-y-4">
        <MnemonicInput wordCount={12} onChange={(w, complete) => {
        setWords(w);
        setIsComplete(complete);
      }} />
        <GradientButton fullWidth disabled={!isComplete} onClick={() => alert(\`导入: \${words.join(' ')}\`)}>
          导入钱包
        </GradientButton>
        <p className="text-muted-foreground text-center text-xs">提示：可以直接粘贴完整的助记词</p>
      </div>;
  }
}`,...o.parameters?.docs?.source}}};n.parameters={...n.parameters,docs:{...n.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [step, setStep] = useState<'input' | 'success'>('input');
    const [words, setWords] = useState<string[]>([]);
    if (step === 'success') {
      return <div className="space-y-4 py-8 text-center">
          <div className="bg-green-500/20 mx-auto flex h-16 w-16 items-center justify-center rounded-full">
            <svg className="text-green-500 h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="font-medium">钱包导入成功</p>
          <p className="text-muted-foreground text-sm">共导入 {words.length} 个单词</p>
        </div>;
    }
    return <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-medium">导入钱包</h3>
          <p className="text-muted-foreground mt-1 text-sm">请输入您的助记词</p>
        </div>
        <MnemonicInput wordCount={12} onComplete={w => {
        setWords(w);
        setStep('success');
      }} />
      </div>;
  }
}`,...n.parameters?.docs?.source}}};const S=["Default","Words24","WithSubmit","ImportFlow"];export{s as Default,n as ImportFlow,o as WithSubmit,r as Words24,S as __namedExportsOrder,v as default};
