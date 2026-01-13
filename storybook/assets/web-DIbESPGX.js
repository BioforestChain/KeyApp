import{W as i,k as n,v as p,x as c,y as m,z as l}from"./address-book-DI0wc2JF.js";import{d}from"./breakpoint-BtpSOnE_.js";import{_ as u,j as g,s as a,o as S,b,n as f}from"./schemas-jh0dXz-I.js";const h=Object.freeze(Object.defineProperty({__proto__:null,WALLET_STORAGE_VERSION:p,WalletStorageError:c,WalletStorageErrorCode:m,WalletStorageMigrationError:l,WalletStorageService:i,walletStorageService:n},Symbol.toStringTag,{value:"Module"})),x=b(["top","center","bottom"]),v=g([a(),S({message:a(),duration:f().optional(),position:x.optional()})]),y=d("toast",o=>o.description("Toast 提示服务").api("show",{description:"显示 Toast 提示",input:v,output:u()})),W=y.impl({async show(o){const{message:s,duration:r=2e3,position:e="bottom"}=typeof o=="string"?{message:o}:o,t=document.createElement("div");t.textContent=s,t.className="bfm-toast",t.style.cssText=`
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
    `,document.body.appendChild(t),setTimeout(()=>{t.style.opacity="0",setTimeout(()=>t.remove(),300)},r)}});export{h as i,W as t};
