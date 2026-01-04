import{W as i,n,r as p,v as c,x as m}from"./chain-config-lKD-osoU.js";import{d as l}from"./breakpoint-CUnGgoIy.js";import{_ as d,f as u,s as a,o as b,b as S,n as f}from"./schemas-Cl5zTOv_.js";const h=Object.freeze(Object.defineProperty({__proto__:null,WALLET_STORAGE_VERSION:p,WalletStorageError:c,WalletStorageErrorCode:m,WalletStorageService:i,walletStorageService:n},Symbol.toStringTag,{value:"Module"})),g=S(["top","center","bottom"]),x=u([a(),b({message:a(),duration:f().optional(),position:g.optional()})]),v=l("toast",o=>o.description("Toast 提示服务").api("show",{description:"显示 Toast 提示",input:x,output:d()})),E=v.impl({async show(o){const{message:s,duration:r=2e3,position:e="bottom"}=typeof o=="string"?{message:o}:o,t=document.createElement("div");t.textContent=s,t.className="bfm-toast",t.style.cssText=`
      position: fixed;
      left: 50%;
      transform: translateX(-50%);
      padding: 12px 24px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      font-size: 14px;
      z-index: 10000;
      transition: opacity 0.3s;
      ${e==="top"?"top: 60px;":""}
      ${e==="center"?"top: 50%; transform: translate(-50%, -50%);":""}
      ${e==="bottom"?"bottom: 100px;":""}
    `,document.body.appendChild(t),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),300)},r)}});export{h as i,E as t};
