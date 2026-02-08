(function(){"use strict";const R=a=>a.replace(/\s+/g," ").trim();function H(a,r,t){if(typeof a!="object"||a===null)return t;const e=Reflect.get(a,r);return typeof e=="number"&&Number.isFinite(e)?e:t}function z(a,r,t,e){const o=r.data,u=t/2,h=t/2,n=H(e,"opacity",1);for(let l=0;l<o.length;l+=4){const c=o[l+3];if(c<10)continue;const s=l/4%t,m=Math.floor(l/4/t),d=(Math.atan2(s-u,h-m)*180/Math.PI+180)%360/60,I=Math.floor(d)%6,M=d-Math.floor(d);let p=255,b=0,f=0;switch(I){case 0:p=255,b=Math.round(M*255),f=0;break;case 1:p=Math.round((1-M)*255),b=255,f=0;break;case 2:p=0,b=255,f=Math.round(M*255);break;case 3:p=0,b=Math.round((1-M)*255),f=255;break;case 4:p=Math.round(M*255),b=0,f=255;break;default:p=255,b=0,f=Math.round((1-M)*255);break}o[l]=p,o[l+1]=b,o[l+2]=f,o[l+3]=Math.round(c*n)}a.putImageData(r,0,0)}function L(a,r,t,e){const o=r.data,u=H(e,"r",255),h=H(e,"g",255),n=H(e,"b",255),l=H(e,"opacity",1);for(let c=0;c<o.length;c+=4){const s=o[c+3];s<10||(o[c]=u,o[c+1]=h,o[c+2]=n,o[c+3]=Math.round(s*l))}a.putImageData(r,0,0)}const T=`
    var data = imageData.data;
    var cx = size / 2;
    var cy = size / 2;
    var opacity = (args && args.opacity) || 1;
    
    for (var i = 0; i < data.length; i += 4) {
      var a = data[i + 3];
      if (a < 10) continue;
      
      var px = (i / 4) % size;
      var py = Math.floor((i / 4) / size);
      
      // 计算角度 (0-360)，从顶部开始顺时针
      var angle = Math.atan2(px - cx, cy - py) * 180 / Math.PI + 180;
      
      // HSV to RGB (H = angle, S = 1, V = 1) - 纯正彩虹色
      var h = (angle % 360) / 60;
      var hi = Math.floor(h) % 6;
      var f = h - Math.floor(h);
      var r, g, b;
      
      // 纯彩虹色：S=1, V=1
      switch (hi) {
        case 0: r = 255; g = Math.round(f * 255); b = 0; break;
        case 1: r = Math.round((1 - f) * 255); g = 255; b = 0; break;
        case 2: r = 0; g = 255; b = Math.round(f * 255); break;
        case 3: r = 0; g = Math.round((1 - f) * 255); b = 255; break;
        case 4: r = Math.round(f * 255); g = 0; b = 255; break;
        default: r = 255; g = 0; b = Math.round((1 - f) * 255); break;
      }
      
      data[i] = r;
      data[i + 1] = g;
      data[i + 2] = b;
      data[i + 3] = Math.round(a * opacity);
    }
    
    ctx.putImageData(imageData, 0, 0);
  `,W=`
  var data = imageData.data;
  var r = (args && args.r) || 255;
  var g = (args && args.g) || 255;
  var b = (args && args.b) || 255;
  var opacity = (args && args.opacity) || 1;
  
  for (var i = 0; i < data.length; i += 4) {
    var a = data[i + 3];
    if (a < 10) continue;
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
    data[i + 3] = Math.round(a * opacity);
  }
  
  ctx.putImageData(imageData, 0, 0);
`,B=new Map;let C=!1;function A(){C||(B.set(R(T),z),B.set(R(W),L),C=!0)}function F(a){return A(),B.get(R(a))}function N(a){return new Function("ctx","imageData","size","args",a)}const E=new Map;function U(a){const r=F(a);if(r)return r;let t=E.get(a);return t||(t=N(a),E.set(a,t)),t}function G(a,r,t,e=10){let o=r,u=t,h=0,n=0,l=!1;for(let c=0;c<t;c++)for(let s=0;s<r;s++){const m=(c*r+s)*4;a[m+3]>=e&&(l=!0,o=Math.min(o,s),u=Math.min(u,c),h=Math.max(h,s),n=Math.max(n,c))}return l?{minX:o,minY:u,maxX:h,maxY:n}:null}function O(a,r,t){let e=1,o=0;for(let n=0;n<a.length;n+=4){if(a[n+3]<10)continue;const c=a[n],s=a[n+1],m=a[n+2],i=(.299*c+.587*s+.114*m)/255;e=Math.min(e,i),o=Math.max(o,i)}const u=o-e,h=u>.01;for(let n=0;n<a.length;n+=4){const l=a[n],c=a[n+1],s=a[n+2],m=a[n+3];let i=(.299*l+.587*c+.114*s)/255;h&&(i=(i-e)/u),i=(i-.5)*r+.5,i=Math.max(0,Math.min(1,i)),t&&(i=1-i),a[n]=255,a[n+1]=255,a[n+2]=255,a[n+3]=i*(m/255)*255}}async function V(a){if(typeof btoa!="function")throw new Error("btoa is not available");const r=await a.arrayBuffer(),t=new Uint8Array(r),e=32768;let o="";for(let n=0;n<t.length;n+=e)o+=String.fromCharCode(...t.subarray(n,n+e));const u=btoa(o);return`data:${a.type||"application/octet-stream"};base64,${u}`}async function $(a,r){const{size:t=64,invert:e=!1,contrast:o=1.5,pipeline:u,clip:h=!0,targetBrightness:n}=r,l=await fetch(a);if(!l.ok)throw new Error(`Failed to fetch image: ${l.status}`);const c=await l.blob(),s=await createImageBitmap(c);try{const m=new OffscreenCanvas(t,t),i=m.getContext("2d",{willReadFrequently:!0});if(!i)throw new Error("Failed to get 2d context");i.clearRect(0,0,t,t);const d=Math.min(t/s.width,t/s.height)*.85,I=s.width*d,M=s.height*d,p=(t-I)/2,b=(t-M)/2;i.drawImage(s,p,b,I,M);let f=i.getImageData(0,0,t,t),y=f.data;if(O(y,o,e),h){const g=G(y,t,t,20);if(g){const x=Math.max(0,g.minX-1),v=Math.max(0,g.minY-1),k=Math.min(t-x,g.maxX-g.minX+1+2),D=Math.min(t-v,g.maxY-g.minY+1+2),P=(x-p)/d,j=(v-b)/d,q=k/d,J=D/d,Q=Math.max(k,D),X=t/Q*.95,Y=k*X,_=D*X,Z=(t-Y)/2,tt=(t-_)/2;i.clearRect(0,0,t,t),i.drawImage(s,P,j,q,J,Z,tt,Y,_),f=i.getImageData(0,0,t,t),y=f.data,O(y,o,e)}}if(n!==void 0){let g=0,w=0;for(let x=0;x<y.length;x+=4){const v=y[x+3];v>=10&&(g+=v/255,w++)}if(w>0){const x=g/w;if(x>.01){const v=n/x;for(let k=0;k<y.length;k+=4){const D=y[k+3];D>=1&&(y[k+3]=Math.min(255,Math.max(0,D*v)))}}}}if(i.putImageData(f,0,0),u&&u.length>0)for(const g of u)try{const w=U(g.code);f=i.getImageData(0,0,t,t),w(i,f,t,g.args)}catch{}const K=await m.convertToBlob({type:"image/png"});return await V(K)}finally{s.close()}}const S=self;S.addEventListener("message",a=>{const r=a.data;if(!r||r.type!=="create-mask")return;const t=e=>{S.postMessage(e)};$(r.iconUrl,r.options).then(e=>{t({type:"create-mask-result",id:r.id,dataUrl:e})}).catch(e=>{const o=e instanceof Error?e.message:String(e);t({type:"create-mask-result",id:r.id,dataUrl:null,error:o})})})})();
