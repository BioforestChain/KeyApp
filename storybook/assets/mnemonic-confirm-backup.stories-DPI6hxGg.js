import{r as j,j as e}from"./iframe-Cr_UN5ps.js";import{f as b}from"./index-BjIXEP53.js";import{c as o}from"./utils-4perknFd.js";import{B as S}from"./button-D1tYjhCW.js";import{u as k}from"./useTranslation-CFi8Ka59.js";import{c as w}from"./createReactComponent-T6tanagy.js";import{I as N}from"./IconCheck-BodlbRuj.js";import{I}from"./IconX-WApUtH-t.js";import"./preload-helper-PPVm8Dsz.js";import"./useButton-Dc5zf6xL.js";import"./useRenderElement-By_XGQex.js";import"./index-DvRiJqI5.js";const E=[["path",{d:"M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0",key:"svg-0"}],["path",{d:"M12 16v.01",key:"svg-1"}],["path",{d:"M12 13a2 2 0 0 0 .914 -3.782a1.98 1.98 0 0 0 -2.414 .483",key:"svg-2"}]],T=w("outline","help-circle","HelpCircle",E);function W({slots:n,candidates:u,usedWords:f,nextEmptySlotIndex:p,isComplete:m,onSelectWord:g,onDeselectSlot:C,onComplete:h,className:y}){const{t:s}=k("onboarding"),v=j.useMemo(()=>{const r=[];for(let t=0;t<u.length;t+=3)r.push(u.slice(t,t+3));return r},[u]);return e.jsxs("div",{className:o("flex flex-col",y),children:[e.jsxs("div",{className:"mb-6 text-center",children:[e.jsx("h2",{className:"text-xl font-bold",children:s("create.confirm.title")}),e.jsx("p",{className:"text-muted-foreground mt-2 text-sm",children:s("create.confirm.description")})]}),e.jsx("div",{className:"mb-8 space-y-3",children:n.map((r,t)=>e.jsxs("div",{className:o("flex items-center gap-3 rounded-xl border-2 p-3 transition-colors",r.selectedWord===null&&t===p?"border-primary bg-primary/5":r.selectedWord===null?"border-muted-foreground/30 bg-muted/30 border-dashed":r.isCorrect?"border-green-500 bg-green-50 dark:bg-green-900/20":"border-red-500 bg-red-50 dark:bg-red-900/20"),onClick:()=>{r.selectedWord!==null&&r.isCorrect===!1&&C(t)},role:r.isCorrect===!1?"button":void 0,tabIndex:r.isCorrect===!1?0:void 0,children:[e.jsx("div",{className:o("flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",r.selectedWord===null?"bg-muted text-muted-foreground":r.isCorrect?"bg-green-500 text-white":"bg-red-500 text-white"),children:r.position+1}),e.jsx("div",{className:"flex-1",children:r.selectedWord?e.jsx("span",{className:o("font-medium",r.isCorrect?"text-green-700 dark:text-green-300":"text-red-700 dark:text-red-300"),children:r.selectedWord}):e.jsx("span",{className:"text-muted-foreground",children:t===p?s("create.confirm.selectWord",{position:r.position+1}):"..."})}),e.jsx("div",{className:"shrink-0",children:r.selectedWord===null?e.jsx(T,{className:"text-muted-foreground/50 size-5"}):r.isCorrect?e.jsx(N,{className:"size-5 text-green-500"}):e.jsx(I,{className:"size-5 text-red-500"})})]},t))}),e.jsxs("div",{className:"mb-6",children:[e.jsx("p",{className:"text-muted-foreground mb-3 text-center text-sm",children:s("create.confirm.selectFromBelow")}),e.jsx("div",{className:"space-y-2",children:v.map((r,t)=>e.jsx("div",{className:"grid grid-cols-3 gap-2",children:r.map(d=>{const x=f.has(d);return e.jsx("button",{type:"button",disabled:x||p===-1,onClick:()=>g(d),className:o("rounded-lg border px-3 py-2 text-sm font-medium transition-colors",x?"bg-muted/50 text-muted-foreground/50 cursor-not-allowed border-transparent":"border-border bg-background hover:border-primary hover:bg-primary/5"),children:d},d)})},t))})]}),m&&e.jsx("div",{className:"mb-4 rounded-xl bg-green-50 p-4 text-center dark:bg-green-900/20",children:e.jsx("p",{className:"font-medium text-green-700 dark:text-green-300",children:s("create.confirm.verifySuccess")})}),e.jsx(S,{onClick:h,disabled:!m,size:"lg",className:"w-full",children:s(m?"create.confirm.completeBackup":"create.confirm.pleaseComplete")}),n.some(r=>r.isCorrect===!1)&&e.jsx("p",{className:"text-muted-foreground mt-3 text-center text-sm",children:s("create.confirm.clickToReselect")})]})}W.__docgenInfo={description:`Mnemonic backup verification UI
Users must select correct words in correct positions`,methods:[],displayName:"MnemonicConfirmBackup",props:{slots:{required:!0,tsType:{name:"Array",elements:[{name:"VerificationSlot"}],raw:"VerificationSlot[]"},description:"Verification slots with positions to fill"},candidates:{required:!0,tsType:{name:"Array",elements:[{name:"string"}],raw:"string[]"},description:"Shuffled candidate words"},usedWords:{required:!0,tsType:{name:"Set",elements:[{name:"string"}],raw:"Set<string>"},description:"Words that have been used"},nextEmptySlotIndex:{required:!0,tsType:{name:"number"},description:"Index of next slot to fill (-1 if all filled)"},isComplete:{required:!0,tsType:{name:"boolean"},description:"Whether all slots are correctly filled"},onSelectWord:{required:!0,tsType:{name:"signature",type:"function",raw:"(word: string) => void",signature:{arguments:[{type:{name:"string"},name:"word"}],return:{name:"void"}}},description:"Callback when user selects a word"},onDeselectSlot:{required:!0,tsType:{name:"signature",type:"function",raw:"(index: number) => void",signature:{arguments:[{type:{name:"number"},name:"index"}],return:{name:"void"}}},description:"Callback when user clicks a slot to deselect"},onComplete:{required:!0,tsType:{name:"signature",type:"function",raw:"() => void",signature:{arguments:[],return:{name:"void"}}},description:"Callback when verification is complete"},className:{required:!1,tsType:{name:"string"},description:"Additional class name"}}};const q=["abandon","ability","able","about","above","absent","absorb","abstract","absurd","abuse","access","accident"],M=[{position:2,expectedWord:"able",selectedWord:null,isCorrect:null},{position:5,expectedWord:"absent",selectedWord:null,isCorrect:null},{position:8,expectedWord:"absurd",selectedWord:null,isCorrect:null},{position:11,expectedWord:"accident",selectedWord:null,isCorrect:null}],X={title:"Onboarding/MnemonicConfirmBackup",component:W,parameters:{layout:"centered"},decorators:[n=>e.jsx("div",{className:"w-[380px]",children:e.jsx(n,{})})],args:{slots:M,candidates:q,usedWords:new Set,nextEmptySlotIndex:0,isComplete:!1,onSelectWord:b(),onDeselectSlot:b(),onComplete:b()}},c={},i={args:{slots:[{position:2,expectedWord:"able",selectedWord:"able",isCorrect:!0},{position:5,expectedWord:"absent",selectedWord:"absent",isCorrect:!0},{position:8,expectedWord:"absurd",selectedWord:null,isCorrect:null},{position:11,expectedWord:"accident",selectedWord:null,isCorrect:null}],usedWords:new Set(["able","absent"]),nextEmptySlotIndex:2}},a={args:{slots:[{position:2,expectedWord:"able",selectedWord:"able",isCorrect:!0},{position:5,expectedWord:"absent",selectedWord:"about",isCorrect:!1},{position:8,expectedWord:"absurd",selectedWord:null,isCorrect:null},{position:11,expectedWord:"accident",selectedWord:null,isCorrect:null}],usedWords:new Set(["able","about"]),nextEmptySlotIndex:2}},l={args:{slots:[{position:2,expectedWord:"able",selectedWord:"able",isCorrect:!0},{position:5,expectedWord:"absent",selectedWord:"absent",isCorrect:!0},{position:8,expectedWord:"absurd",selectedWord:"absurd",isCorrect:!0},{position:11,expectedWord:"accident",selectedWord:"accident",isCorrect:!0}],usedWords:new Set(["able","absent","absurd","accident"]),nextEmptySlotIndex:-1,isComplete:!0}};c.parameters={...c.parameters,docs:{...c.parameters?.docs,source:{originalSource:"{}",...c.parameters?.docs?.source}}};i.parameters={...i.parameters,docs:{...i.parameters?.docs,source:{originalSource:`{
  args: {
    slots: [{
      position: 2,
      expectedWord: 'able',
      selectedWord: 'able',
      isCorrect: true
    }, {
      position: 5,
      expectedWord: 'absent',
      selectedWord: 'absent',
      isCorrect: true
    }, {
      position: 8,
      expectedWord: 'absurd',
      selectedWord: null,
      isCorrect: null
    }, {
      position: 11,
      expectedWord: 'accident',
      selectedWord: null,
      isCorrect: null
    }],
    usedWords: new Set(['able', 'absent']),
    nextEmptySlotIndex: 2
  }
}`,...i.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    slots: [{
      position: 2,
      expectedWord: 'able',
      selectedWord: 'able',
      isCorrect: true
    }, {
      position: 5,
      expectedWord: 'absent',
      selectedWord: 'about',
      isCorrect: false
    }, {
      position: 8,
      expectedWord: 'absurd',
      selectedWord: null,
      isCorrect: null
    }, {
      position: 11,
      expectedWord: 'accident',
      selectedWord: null,
      isCorrect: null
    }],
    usedWords: new Set(['able', 'about']),
    nextEmptySlotIndex: 2
  }
}`,...a.parameters?.docs?.source}}};l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{
  args: {
    slots: [{
      position: 2,
      expectedWord: 'able',
      selectedWord: 'able',
      isCorrect: true
    }, {
      position: 5,
      expectedWord: 'absent',
      selectedWord: 'absent',
      isCorrect: true
    }, {
      position: 8,
      expectedWord: 'absurd',
      selectedWord: 'absurd',
      isCorrect: true
    }, {
      position: 11,
      expectedWord: 'accident',
      selectedWord: 'accident',
      isCorrect: true
    }],
    usedWords: new Set(['able', 'absent', 'absurd', 'accident']),
    nextEmptySlotIndex: -1,
    isComplete: true
  }
}`,...l.parameters?.docs?.source}}};const G=["Default","PartiallyFilled","WithError","Complete"];export{l as Complete,c as Default,i as PartiallyFilled,a as WithError,G as __namedExportsOrder,X as default};
