import{g as ft,r as I,j as f}from"./iframe-BUkuBLc8.js";import{c as Ne}from"./index-BK9Epg6_.js";import"./preload-helper-PPVm8Dsz.js";var H={},$,Te;function gt(){return Te||(Te=1,$=function(){return typeof Promise=="function"&&Promise.prototype&&Promise.prototype.then}),$}var ee={},F={},Me;function k(){if(Me)return F;Me=1;let r;const s=[0,26,44,70,100,134,172,196,242,292,346,404,466,532,581,655,733,815,901,991,1085,1156,1258,1364,1474,1588,1706,1828,1921,2051,2185,2323,2465,2611,2761,2876,3034,3196,3362,3532,3706];return F.getSymbolSize=function(n){if(!n)throw new Error('"version" cannot be null or undefined');if(n<1||n>40)throw new Error('"version" should be in range from 1 to 40');return n*4+17},F.getSymbolTotalCodewords=function(n){return s[n]},F.getBCHDigit=function(a){let n=0;for(;a!==0;)n++,a>>>=1;return n},F.setToSJISFunction=function(n){if(typeof n!="function")throw new Error('"toSJISFunc" is not a valid function.');r=n},F.isKanjiModeEnabled=function(){return typeof r<"u"},F.toSJIS=function(n){return r(n)},F}var te={},Ae;function be(){return Ae||(Ae=1,(function(r){r.L={bit:1},r.M={bit:0},r.Q={bit:3},r.H={bit:2};function s(a){if(typeof a!="string")throw new Error("Param is not a string");switch(a.toLowerCase()){case"l":case"low":return r.L;case"m":case"medium":return r.M;case"q":case"quartile":return r.Q;case"h":case"high":return r.H;default:throw new Error("Unknown EC Level: "+a)}}r.isValid=function(n){return n&&typeof n.bit<"u"&&n.bit>=0&&n.bit<4},r.from=function(n,e){if(r.isValid(n))return n;try{return s(n)}catch{return e}}})(te)),te}var ne,Ie;function ht(){if(Ie)return ne;Ie=1;function r(){this.buffer=[],this.length=0}return r.prototype={get:function(s){const a=Math.floor(s/8);return(this.buffer[a]>>>7-s%8&1)===1},put:function(s,a){for(let n=0;n<a;n++)this.putBit((s>>>a-n-1&1)===1)},getLengthInBits:function(){return this.length},putBit:function(s){const a=Math.floor(this.length/8);this.buffer.length<=a&&this.buffer.push(0),s&&(this.buffer[a]|=128>>>this.length%8),this.length++}},ne=r,ne}var re,Pe;function mt(){if(Pe)return re;Pe=1;function r(s){if(!s||s<1)throw new Error("BitMatrix size must be defined and greater than 0");this.size=s,this.data=new Uint8Array(s*s),this.reservedBit=new Uint8Array(s*s)}return r.prototype.set=function(s,a,n,e){const t=s*this.size+a;this.data[t]=n,e&&(this.reservedBit[t]=!0)},r.prototype.get=function(s,a){return this.data[s*this.size+a]},r.prototype.xor=function(s,a,n){this.data[s*this.size+a]^=n},r.prototype.isReserved=function(s,a){return this.reservedBit[s*this.size+a]},re=r,re}var se={},Le;function pt(){return Le||(Le=1,(function(r){const s=k().getSymbolSize;r.getRowColCoords=function(n){if(n===1)return[];const e=Math.floor(n/7)+2,t=s(n),o=t===145?26:Math.ceil((t-13)/(2*e-2))*2,c=[t-7];for(let i=1;i<e-1;i++)c[i]=c[i-1]-o;return c.push(6),c.reverse()},r.getPositions=function(n){const e=[],t=r.getRowColCoords(n),o=t.length;for(let c=0;c<o;c++)for(let i=0;i<o;i++)c===0&&i===0||c===0&&i===o-1||c===o-1&&i===0||e.push([t[c],t[i]]);return e}})(se)),se}var ae={},qe;function yt(){if(qe)return ae;qe=1;const r=k().getSymbolSize,s=7;return ae.getPositions=function(n){const e=r(n);return[[0,0],[e-s,0],[0,e-s]]},ae}var oe={},De;function Ct(){return De||(De=1,(function(r){r.Patterns={PATTERN000:0,PATTERN001:1,PATTERN010:2,PATTERN011:3,PATTERN100:4,PATTERN101:5,PATTERN110:6,PATTERN111:7};const s={N1:3,N2:3,N3:40,N4:10};r.isValid=function(e){return e!=null&&e!==""&&!isNaN(e)&&e>=0&&e<=7},r.from=function(e){return r.isValid(e)?parseInt(e,10):void 0},r.getPenaltyN1=function(e){const t=e.size;let o=0,c=0,i=0,l=null,u=null;for(let m=0;m<t;m++){c=i=0,l=u=null;for(let g=0;g<t;g++){let d=e.get(m,g);d===l?c++:(c>=5&&(o+=s.N1+(c-5)),l=d,c=1),d=e.get(g,m),d===u?i++:(i>=5&&(o+=s.N1+(i-5)),u=d,i=1)}c>=5&&(o+=s.N1+(c-5)),i>=5&&(o+=s.N1+(i-5))}return o},r.getPenaltyN2=function(e){const t=e.size;let o=0;for(let c=0;c<t-1;c++)for(let i=0;i<t-1;i++){const l=e.get(c,i)+e.get(c,i+1)+e.get(c+1,i)+e.get(c+1,i+1);(l===4||l===0)&&o++}return o*s.N2},r.getPenaltyN3=function(e){const t=e.size;let o=0,c=0,i=0;for(let l=0;l<t;l++){c=i=0;for(let u=0;u<t;u++)c=c<<1&2047|e.get(l,u),u>=10&&(c===1488||c===93)&&o++,i=i<<1&2047|e.get(u,l),u>=10&&(i===1488||i===93)&&o++}return o*s.N3},r.getPenaltyN4=function(e){let t=0;const o=e.data.length;for(let i=0;i<o;i++)t+=e.data[i];return Math.abs(Math.ceil(t*100/o/5)-10)*s.N4};function a(n,e,t){switch(n){case r.Patterns.PATTERN000:return(e+t)%2===0;case r.Patterns.PATTERN001:return e%2===0;case r.Patterns.PATTERN010:return t%3===0;case r.Patterns.PATTERN011:return(e+t)%3===0;case r.Patterns.PATTERN100:return(Math.floor(e/2)+Math.floor(t/3))%2===0;case r.Patterns.PATTERN101:return e*t%2+e*t%3===0;case r.Patterns.PATTERN110:return(e*t%2+e*t%3)%2===0;case r.Patterns.PATTERN111:return(e*t%3+(e+t)%2)%2===0;default:throw new Error("bad maskPattern:"+n)}}r.applyMask=function(e,t){const o=t.size;for(let c=0;c<o;c++)for(let i=0;i<o;i++)t.isReserved(i,c)||t.xor(i,c,a(e,i,c))},r.getBestMask=function(e,t){const o=Object.keys(r.Patterns).length;let c=0,i=1/0;for(let l=0;l<o;l++){t(l),r.applyMask(l,e);const u=r.getPenaltyN1(e)+r.getPenaltyN2(e)+r.getPenaltyN3(e)+r.getPenaltyN4(e);r.applyMask(l,e),u<i&&(i=u,c=l)}return c}})(oe)),oe}var Y={},je;function nt(){if(je)return Y;je=1;const r=be(),s=[1,1,1,1,1,1,1,1,1,1,2,2,1,2,2,4,1,2,4,4,2,4,4,4,2,4,6,5,2,4,6,6,2,5,8,8,4,5,8,8,4,5,8,11,4,8,10,11,4,9,12,16,4,9,16,16,6,10,12,18,6,10,17,16,6,11,16,19,6,13,18,21,7,14,21,25,8,16,20,25,8,17,23,25,9,17,23,34,9,18,25,30,10,20,27,32,12,21,29,35,12,23,34,37,12,25,34,40,13,26,35,42,14,28,38,45,15,29,40,48,16,31,43,51,17,33,45,54,18,35,48,57,19,37,51,60,19,38,53,63,20,40,56,66,21,43,59,70,22,45,62,74,24,47,65,77,25,49,68,81],a=[7,10,13,17,10,16,22,28,15,26,36,44,20,36,52,64,26,48,72,88,36,64,96,112,40,72,108,130,48,88,132,156,60,110,160,192,72,130,192,224,80,150,224,264,96,176,260,308,104,198,288,352,120,216,320,384,132,240,360,432,144,280,408,480,168,308,448,532,180,338,504,588,196,364,546,650,224,416,600,700,224,442,644,750,252,476,690,816,270,504,750,900,300,560,810,960,312,588,870,1050,336,644,952,1110,360,700,1020,1200,390,728,1050,1260,420,784,1140,1350,450,812,1200,1440,480,868,1290,1530,510,924,1350,1620,540,980,1440,1710,570,1036,1530,1800,570,1064,1590,1890,600,1120,1680,1980,630,1204,1770,2100,660,1260,1860,2220,720,1316,1950,2310,750,1372,2040,2430];return Y.getBlocksCount=function(e,t){switch(t){case r.L:return s[(e-1)*4+0];case r.M:return s[(e-1)*4+1];case r.Q:return s[(e-1)*4+2];case r.H:return s[(e-1)*4+3];default:return}},Y.getTotalCodewordsCount=function(e,t){switch(t){case r.L:return a[(e-1)*4+0];case r.M:return a[(e-1)*4+1];case r.Q:return a[(e-1)*4+2];case r.H:return a[(e-1)*4+3];default:return}},Y}var ie={},O={},Fe;function wt(){if(Fe)return O;Fe=1;const r=new Uint8Array(512),s=new Uint8Array(256);return(function(){let n=1;for(let e=0;e<255;e++)r[e]=n,s[n]=e,n<<=1,n&256&&(n^=285);for(let e=255;e<512;e++)r[e]=r[e-255]})(),O.log=function(n){if(n<1)throw new Error("log("+n+")");return s[n]},O.exp=function(n){return r[n]},O.mul=function(n,e){return n===0||e===0?0:r[s[n]+s[e]]},O}var ke;function Rt(){return ke||(ke=1,(function(r){const s=wt();r.mul=function(n,e){const t=new Uint8Array(n.length+e.length-1);for(let o=0;o<n.length;o++)for(let c=0;c<e.length;c++)t[o+c]^=s.mul(n[o],e[c]);return t},r.mod=function(n,e){let t=new Uint8Array(n);for(;t.length-e.length>=0;){const o=t[0];for(let i=0;i<e.length;i++)t[i]^=s.mul(e[i],o);let c=0;for(;c<t.length&&t[c]===0;)c++;t=t.slice(c)}return t},r.generateECPolynomial=function(n){let e=new Uint8Array([1]);for(let t=0;t<n;t++)e=r.mul(e,new Uint8Array([1,s.exp(t)]));return e}})(ie)),ie}var ce,_e;function xt(){if(_e)return ce;_e=1;const r=Rt();function s(a){this.genPoly=void 0,this.degree=a,this.degree&&this.initialize(this.degree)}return s.prototype.initialize=function(n){this.degree=n,this.genPoly=r.generateECPolynomial(this.degree)},s.prototype.encode=function(n){if(!this.genPoly)throw new Error("Encoder not initialized");const e=new Uint8Array(n.length+this.degree);e.set(n);const t=r.mod(e,this.genPoly),o=this.degree-t.length;if(o>0){const c=new Uint8Array(this.degree);return c.set(t,o),c}return t},ce=s,ce}var le={},ue={},de={},Ue;function rt(){return Ue||(Ue=1,de.isValid=function(s){return!isNaN(s)&&s>=1&&s<=40}),de}var L={},He;function st(){if(He)return L;He=1;const r="[0-9]+",s="[A-Z $%*+\\-./:]+";let a="(?:[u3000-u303F]|[u3040-u309F]|[u30A0-u30FF]|[uFF00-uFFEF]|[u4E00-u9FAF]|[u2605-u2606]|[u2190-u2195]|u203B|[u2010u2015u2018u2019u2025u2026u201Cu201Du2225u2260]|[u0391-u0451]|[u00A7u00A8u00B1u00B4u00D7u00F7])+";a=a.replace(/u/g,"\\u");const n="(?:(?![A-Z0-9 $%*+\\-./:]|"+a+`)(?:.|[\r
]))+`;L.KANJI=new RegExp(a,"g"),L.BYTE_KANJI=new RegExp("[^A-Z0-9 $%*+\\-./:]+","g"),L.BYTE=new RegExp(n,"g"),L.NUMERIC=new RegExp(r,"g"),L.ALPHANUMERIC=new RegExp(s,"g");const e=new RegExp("^"+a+"$"),t=new RegExp("^"+r+"$"),o=new RegExp("^[A-Z0-9 $%*+\\-./:]+$");return L.testKanji=function(i){return e.test(i)},L.testNumeric=function(i){return t.test(i)},L.testAlphanumeric=function(i){return o.test(i)},L}var Qe;function _(){return Qe||(Qe=1,(function(r){const s=rt(),a=st();r.NUMERIC={id:"Numeric",bit:1,ccBits:[10,12,14]},r.ALPHANUMERIC={id:"Alphanumeric",bit:2,ccBits:[9,11,13]},r.BYTE={id:"Byte",bit:4,ccBits:[8,16,16]},r.KANJI={id:"Kanji",bit:8,ccBits:[8,10,12]},r.MIXED={bit:-1},r.getCharCountIndicator=function(t,o){if(!t.ccBits)throw new Error("Invalid mode: "+t);if(!s.isValid(o))throw new Error("Invalid version: "+o);return o>=1&&o<10?t.ccBits[0]:o<27?t.ccBits[1]:t.ccBits[2]},r.getBestModeForData=function(t){return a.testNumeric(t)?r.NUMERIC:a.testAlphanumeric(t)?r.ALPHANUMERIC:a.testKanji(t)?r.KANJI:r.BYTE},r.toString=function(t){if(t&&t.id)return t.id;throw new Error("Invalid mode")},r.isValid=function(t){return t&&t.bit&&t.ccBits};function n(e){if(typeof e!="string")throw new Error("Param is not a string");switch(e.toLowerCase()){case"numeric":return r.NUMERIC;case"alphanumeric":return r.ALPHANUMERIC;case"kanji":return r.KANJI;case"byte":return r.BYTE;default:throw new Error("Unknown mode: "+e)}}r.from=function(t,o){if(r.isValid(t))return t;try{return n(t)}catch{return o}}})(ue)),ue}var Oe;function Nt(){return Oe||(Oe=1,(function(r){const s=k(),a=nt(),n=be(),e=_(),t=rt(),o=7973,c=s.getBCHDigit(o);function i(g,d,S){for(let B=1;B<=40;B++)if(d<=r.getCapacity(B,S,g))return B}function l(g,d){return e.getCharCountIndicator(g,d)+4}function u(g,d){let S=0;return g.forEach(function(B){const A=l(B.mode,d);S+=A+B.getBitsLength()}),S}function m(g,d){for(let S=1;S<=40;S++)if(u(g,S)<=r.getCapacity(S,d,e.MIXED))return S}r.from=function(d,S){return t.isValid(d)?parseInt(d,10):S},r.getCapacity=function(d,S,B){if(!t.isValid(d))throw new Error("Invalid QR Code version");typeof B>"u"&&(B=e.BYTE);const A=s.getSymbolTotalCodewords(d),y=a.getTotalCodewordsCount(d,S),T=(A-y)*8;if(B===e.MIXED)return T;const R=T-l(B,d);switch(B){case e.NUMERIC:return Math.floor(R/10*3);case e.ALPHANUMERIC:return Math.floor(R/11*2);case e.KANJI:return Math.floor(R/13);case e.BYTE:default:return Math.floor(R/8)}},r.getBestVersionForData=function(d,S){let B;const A=n.from(S,n.M);if(Array.isArray(d)){if(d.length>1)return m(d,A);if(d.length===0)return 1;B=d[0]}else B=d;return i(B.mode,B.getLength(),A)},r.getEncodedBits=function(d){if(!t.isValid(d)||d<7)throw new Error("Invalid QR Code version");let S=d<<12;for(;s.getBCHDigit(S)-c>=0;)S^=o<<s.getBCHDigit(S)-c;return d<<12|S}})(le)),le}var fe={},ze;function bt(){if(ze)return fe;ze=1;const r=k(),s=1335,a=21522,n=r.getBCHDigit(s);return fe.getEncodedBits=function(t,o){const c=t.bit<<3|o;let i=c<<10;for(;r.getBCHDigit(i)-n>=0;)i^=s<<r.getBCHDigit(i)-n;return(c<<10|i)^a},fe}var ge={},he,Ve;function vt(){if(Ve)return he;Ve=1;const r=_();function s(a){this.mode=r.NUMERIC,this.data=a.toString()}return s.getBitsLength=function(n){return 10*Math.floor(n/3)+(n%3?n%3*3+1:0)},s.prototype.getLength=function(){return this.data.length},s.prototype.getBitsLength=function(){return s.getBitsLength(this.data.length)},s.prototype.write=function(n){let e,t,o;for(e=0;e+3<=this.data.length;e+=3)t=this.data.substr(e,3),o=parseInt(t,10),n.put(o,10);const c=this.data.length-e;c>0&&(t=this.data.substr(e),o=parseInt(t,10),n.put(o,c*3+1))},he=s,he}var me,Ke;function Et(){if(Ke)return me;Ke=1;const r=_(),s=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"," ","$","%","*","+","-",".","/",":"];function a(n){this.mode=r.ALPHANUMERIC,this.data=n}return a.getBitsLength=function(e){return 11*Math.floor(e/2)+6*(e%2)},a.prototype.getLength=function(){return this.data.length},a.prototype.getBitsLength=function(){return a.getBitsLength(this.data.length)},a.prototype.write=function(e){let t;for(t=0;t+2<=this.data.length;t+=2){let o=s.indexOf(this.data[t])*45;o+=s.indexOf(this.data[t+1]),e.put(o,11)}this.data.length%2&&e.put(s.indexOf(this.data[t]),6)},me=a,me}var pe,Je;function St(){if(Je)return pe;Je=1;const r=_();function s(a){this.mode=r.BYTE,typeof a=="string"?this.data=new TextEncoder().encode(a):this.data=new Uint8Array(a)}return s.getBitsLength=function(n){return n*8},s.prototype.getLength=function(){return this.data.length},s.prototype.getBitsLength=function(){return s.getBitsLength(this.data.length)},s.prototype.write=function(a){for(let n=0,e=this.data.length;n<e;n++)a.put(this.data[n],8)},pe=s,pe}var ye,Ye;function Bt(){if(Ye)return ye;Ye=1;const r=_(),s=k();function a(n){this.mode=r.KANJI,this.data=n}return a.getBitsLength=function(e){return e*13},a.prototype.getLength=function(){return this.data.length},a.prototype.getBitsLength=function(){return a.getBitsLength(this.data.length)},a.prototype.write=function(n){let e;for(e=0;e<this.data.length;e++){let t=s.toSJIS(this.data[e]);if(t>=33088&&t<=40956)t-=33088;else if(t>=57408&&t<=60351)t-=49472;else throw new Error("Invalid SJIS character: "+this.data[e]+`
Make sure your charset is UTF-8`);t=(t>>>8&255)*192+(t&255),n.put(t,13)}},ye=a,ye}var Ce={exports:{}},We;function Tt(){return We||(We=1,(function(r){var s={single_source_shortest_paths:function(a,n,e){var t={},o={};o[n]=0;var c=s.PriorityQueue.make();c.push(n,0);for(var i,l,u,m,g,d,S,B,A;!c.empty();){i=c.pop(),l=i.value,m=i.cost,g=a[l]||{};for(u in g)g.hasOwnProperty(u)&&(d=g[u],S=m+d,B=o[u],A=typeof o[u]>"u",(A||B>S)&&(o[u]=S,c.push(u,S),t[u]=l))}if(typeof e<"u"&&typeof o[e]>"u"){var y=["Could not find a path from ",n," to ",e,"."].join("");throw new Error(y)}return t},extract_shortest_path_from_predecessor_list:function(a,n){for(var e=[],t=n;t;)e.push(t),a[t],t=a[t];return e.reverse(),e},find_path:function(a,n,e){var t=s.single_source_shortest_paths(a,n,e);return s.extract_shortest_path_from_predecessor_list(t,e)},PriorityQueue:{make:function(a){var n=s.PriorityQueue,e={},t;a=a||{};for(t in n)n.hasOwnProperty(t)&&(e[t]=n[t]);return e.queue=[],e.sorter=a.sorter||n.default_sorter,e},default_sorter:function(a,n){return a.cost-n.cost},push:function(a,n){var e={value:a,cost:n};this.queue.push(e),this.queue.sort(this.sorter)},pop:function(){return this.queue.shift()},empty:function(){return this.queue.length===0}}};r.exports=s})(Ce)),Ce.exports}var Ge;function Mt(){return Ge||(Ge=1,(function(r){const s=_(),a=vt(),n=Et(),e=St(),t=Bt(),o=st(),c=k(),i=Tt();function l(y){return unescape(encodeURIComponent(y)).length}function u(y,T,R){const v=[];let P;for(;(P=y.exec(R))!==null;)v.push({data:P[0],index:P.index,mode:T,length:P[0].length});return v}function m(y){const T=u(o.NUMERIC,s.NUMERIC,y),R=u(o.ALPHANUMERIC,s.ALPHANUMERIC,y);let v,P;return c.isKanjiModeEnabled()?(v=u(o.BYTE,s.BYTE,y),P=u(o.KANJI,s.KANJI,y)):(v=u(o.BYTE_KANJI,s.BYTE,y),P=[]),T.concat(R,v,P).sort(function(N,x){return N.index-x.index}).map(function(N){return{data:N.data,mode:N.mode,length:N.length}})}function g(y,T){switch(T){case s.NUMERIC:return a.getBitsLength(y);case s.ALPHANUMERIC:return n.getBitsLength(y);case s.KANJI:return t.getBitsLength(y);case s.BYTE:return e.getBitsLength(y)}}function d(y){return y.reduce(function(T,R){const v=T.length-1>=0?T[T.length-1]:null;return v&&v.mode===R.mode?(T[T.length-1].data+=R.data,T):(T.push(R),T)},[])}function S(y){const T=[];for(let R=0;R<y.length;R++){const v=y[R];switch(v.mode){case s.NUMERIC:T.push([v,{data:v.data,mode:s.ALPHANUMERIC,length:v.length},{data:v.data,mode:s.BYTE,length:v.length}]);break;case s.ALPHANUMERIC:T.push([v,{data:v.data,mode:s.BYTE,length:v.length}]);break;case s.KANJI:T.push([v,{data:v.data,mode:s.BYTE,length:l(v.data)}]);break;case s.BYTE:T.push([{data:v.data,mode:s.BYTE,length:l(v.data)}])}}return T}function B(y,T){const R={},v={start:{}};let P=["start"];for(let p=0;p<y.length;p++){const N=y[p],x=[];for(let h=0;h<N.length;h++){const E=N[h],C=""+p+h;x.push(C),R[C]={node:E,lastCount:0},v[C]={};for(let b=0;b<P.length;b++){const w=P[b];R[w]&&R[w].node.mode===E.mode?(v[w][C]=g(R[w].lastCount+E.length,E.mode)-g(R[w].lastCount,E.mode),R[w].lastCount+=E.length):(R[w]&&(R[w].lastCount=E.length),v[w][C]=g(E.length,E.mode)+4+s.getCharCountIndicator(E.mode,T))}}P=x}for(let p=0;p<P.length;p++)v[P[p]].end=0;return{map:v,table:R}}function A(y,T){let R;const v=s.getBestModeForData(y);if(R=s.from(T,v),R!==s.BYTE&&R.bit<v.bit)throw new Error('"'+y+'" cannot be encoded with mode '+s.toString(R)+`.
 Suggested mode is: `+s.toString(v));switch(R===s.KANJI&&!c.isKanjiModeEnabled()&&(R=s.BYTE),R){case s.NUMERIC:return new a(y);case s.ALPHANUMERIC:return new n(y);case s.KANJI:return new t(y);case s.BYTE:return new e(y)}}r.fromArray=function(T){return T.reduce(function(R,v){return typeof v=="string"?R.push(A(v,null)):v.data&&R.push(A(v.data,v.mode)),R},[])},r.fromString=function(T,R){const v=m(T,c.isKanjiModeEnabled()),P=S(v),p=B(P,R),N=i.find_path(p.map,"start","end"),x=[];for(let h=1;h<N.length-1;h++)x.push(p.table[N[h]].node);return r.fromArray(d(x))},r.rawSplit=function(T){return r.fromArray(m(T,c.isKanjiModeEnabled()))}})(ge)),ge}var Ze;function At(){if(Ze)return ee;Ze=1;const r=k(),s=be(),a=ht(),n=mt(),e=pt(),t=yt(),o=Ct(),c=nt(),i=xt(),l=Nt(),u=bt(),m=_(),g=Mt();function d(p,N){const x=p.size,h=t.getPositions(N);for(let E=0;E<h.length;E++){const C=h[E][0],b=h[E][1];for(let w=-1;w<=7;w++)if(!(C+w<=-1||x<=C+w))for(let M=-1;M<=7;M++)b+M<=-1||x<=b+M||(w>=0&&w<=6&&(M===0||M===6)||M>=0&&M<=6&&(w===0||w===6)||w>=2&&w<=4&&M>=2&&M<=4?p.set(C+w,b+M,!0,!0):p.set(C+w,b+M,!1,!0))}}function S(p){const N=p.size;for(let x=8;x<N-8;x++){const h=x%2===0;p.set(x,6,h,!0),p.set(6,x,h,!0)}}function B(p,N){const x=e.getPositions(N);for(let h=0;h<x.length;h++){const E=x[h][0],C=x[h][1];for(let b=-2;b<=2;b++)for(let w=-2;w<=2;w++)b===-2||b===2||w===-2||w===2||b===0&&w===0?p.set(E+b,C+w,!0,!0):p.set(E+b,C+w,!1,!0)}}function A(p,N){const x=p.size,h=l.getEncodedBits(N);let E,C,b;for(let w=0;w<18;w++)E=Math.floor(w/3),C=w%3+x-8-3,b=(h>>w&1)===1,p.set(E,C,b,!0),p.set(C,E,b,!0)}function y(p,N,x){const h=p.size,E=u.getEncodedBits(N,x);let C,b;for(C=0;C<15;C++)b=(E>>C&1)===1,C<6?p.set(C,8,b,!0):C<8?p.set(C+1,8,b,!0):p.set(h-15+C,8,b,!0),C<8?p.set(8,h-C-1,b,!0):C<9?p.set(8,15-C-1+1,b,!0):p.set(8,15-C-1,b,!0);p.set(h-8,8,1,!0)}function T(p,N){const x=p.size;let h=-1,E=x-1,C=7,b=0;for(let w=x-1;w>0;w-=2)for(w===6&&w--;;){for(let M=0;M<2;M++)if(!p.isReserved(E,w-M)){let j=!1;b<N.length&&(j=(N[b]>>>C&1)===1),p.set(E,w-M,j),C--,C===-1&&(b++,C=7)}if(E+=h,E<0||x<=E){E-=h,h=-h;break}}}function R(p,N,x){const h=new a;x.forEach(function(M){h.put(M.mode.bit,4),h.put(M.getLength(),m.getCharCountIndicator(M.mode,p)),M.write(h)});const E=r.getSymbolTotalCodewords(p),C=c.getTotalCodewordsCount(p,N),b=(E-C)*8;for(h.getLengthInBits()+4<=b&&h.put(0,4);h.getLengthInBits()%8!==0;)h.putBit(0);const w=(b-h.getLengthInBits())/8;for(let M=0;M<w;M++)h.put(M%2?17:236,8);return v(h,p,N)}function v(p,N,x){const h=r.getSymbolTotalCodewords(N),E=c.getTotalCodewordsCount(N,x),C=h-E,b=c.getBlocksCount(N,x),w=h%b,M=b-w,j=Math.floor(h/b),Q=Math.floor(C/b),lt=Q+1,Ee=j-Q,ut=new i(Ee);let W=0;const J=new Array(b),Se=new Array(b);let G=0;const dt=new Uint8Array(p.buffer);for(let U=0;U<b;U++){const X=U<M?Q:lt;J[U]=dt.slice(W,W+X),Se[U]=ut.encode(J[U]),W+=X,G=Math.max(G,X)}const Z=new Uint8Array(h);let Be=0,q,D;for(q=0;q<G;q++)for(D=0;D<b;D++)q<J[D].length&&(Z[Be++]=J[D][q]);for(q=0;q<Ee;q++)for(D=0;D<b;D++)Z[Be++]=Se[D][q];return Z}function P(p,N,x,h){let E;if(Array.isArray(p))E=g.fromArray(p);else if(typeof p=="string"){let j=N;if(!j){const Q=g.rawSplit(p);j=l.getBestVersionForData(Q,x)}E=g.fromString(p,j||40)}else throw new Error("Invalid data");const C=l.getBestVersionForData(E,x);if(!C)throw new Error("The amount of data is too big to be stored in a QR Code");if(!N)N=C;else if(N<C)throw new Error(`
The chosen QR Code version cannot contain this amount of data.
Minimum version required to store current data is: `+C+`.
`);const b=R(N,x,E),w=r.getSymbolSize(N),M=new n(w);return d(M,N),S(M),B(M,N),y(M,x,0),N>=7&&A(M,N),T(M,b),isNaN(h)&&(h=o.getBestMask(M,y.bind(null,M,x))),o.applyMask(h,M),y(M,x,h),{modules:M,version:N,errorCorrectionLevel:x,maskPattern:h,segments:E}}return ee.create=function(N,x){if(typeof N>"u"||N==="")throw new Error("No input text");let h=s.M,E,C;return typeof x<"u"&&(h=s.from(x.errorCorrectionLevel,s.M),E=l.from(x.version),C=o.from(x.maskPattern),x.toSJISFunc&&r.setToSJISFunction(x.toSJISFunc)),P(N,E,h,C)},ee}var we={},Re={},Xe;function at(){return Xe||(Xe=1,(function(r){function s(a){if(typeof a=="number"&&(a=a.toString()),typeof a!="string")throw new Error("Color should be defined as hex string");let n=a.slice().replace("#","").split("");if(n.length<3||n.length===5||n.length>8)throw new Error("Invalid hex color: "+a);(n.length===3||n.length===4)&&(n=Array.prototype.concat.apply([],n.map(function(t){return[t,t]}))),n.length===6&&n.push("F","F");const e=parseInt(n.join(""),16);return{r:e>>24&255,g:e>>16&255,b:e>>8&255,a:e&255,hex:"#"+n.slice(0,6).join("")}}r.getOptions=function(n){n||(n={}),n.color||(n.color={});const e=typeof n.margin>"u"||n.margin===null||n.margin<0?4:n.margin,t=n.width&&n.width>=21?n.width:void 0,o=n.scale||4;return{width:t,scale:t?4:o,margin:e,color:{dark:s(n.color.dark||"#000000ff"),light:s(n.color.light||"#ffffffff")},type:n.type,rendererOpts:n.rendererOpts||{}}},r.getScale=function(n,e){return e.width&&e.width>=n+e.margin*2?e.width/(n+e.margin*2):e.scale},r.getImageWidth=function(n,e){const t=r.getScale(n,e);return Math.floor((n+e.margin*2)*t)},r.qrToImageData=function(n,e,t){const o=e.modules.size,c=e.modules.data,i=r.getScale(o,t),l=Math.floor((o+t.margin*2)*i),u=t.margin*i,m=[t.color.light,t.color.dark];for(let g=0;g<l;g++)for(let d=0;d<l;d++){let S=(g*l+d)*4,B=t.color.light;if(g>=u&&d>=u&&g<l-u&&d<l-u){const A=Math.floor((g-u)/i),y=Math.floor((d-u)/i);B=m[c[A*o+y]?1:0]}n[S++]=B.r,n[S++]=B.g,n[S++]=B.b,n[S]=B.a}}})(Re)),Re}var $e;function It(){return $e||($e=1,(function(r){const s=at();function a(e,t,o){e.clearRect(0,0,t.width,t.height),t.style||(t.style={}),t.height=o,t.width=o,t.style.height=o+"px",t.style.width=o+"px"}function n(){try{return document.createElement("canvas")}catch{throw new Error("You need to specify a canvas element")}}r.render=function(t,o,c){let i=c,l=o;typeof i>"u"&&(!o||!o.getContext)&&(i=o,o=void 0),o||(l=n()),i=s.getOptions(i);const u=s.getImageWidth(t.modules.size,i),m=l.getContext("2d"),g=m.createImageData(u,u);return s.qrToImageData(g.data,t,i),a(m,l,u),m.putImageData(g,0,0),l},r.renderToDataURL=function(t,o,c){let i=c;typeof i>"u"&&(!o||!o.getContext)&&(i=o,o=void 0),i||(i={});const l=r.render(t,o,i),u=i.type||"image/png",m=i.rendererOpts||{};return l.toDataURL(u,m.quality)}})(we)),we}var xe={},et;function Pt(){if(et)return xe;et=1;const r=at();function s(e,t){const o=e.a/255,c=t+'="'+e.hex+'"';return o<1?c+" "+t+'-opacity="'+o.toFixed(2).slice(1)+'"':c}function a(e,t,o){let c=e+t;return typeof o<"u"&&(c+=" "+o),c}function n(e,t,o){let c="",i=0,l=!1,u=0;for(let m=0;m<e.length;m++){const g=Math.floor(m%t),d=Math.floor(m/t);!g&&!l&&(l=!0),e[m]?(u++,m>0&&g>0&&e[m-1]||(c+=l?a("M",g+o,.5+d+o):a("m",i,0),i=0,l=!1),g+1<t&&e[m+1]||(c+=a("h",u),u=0)):i++}return c}return xe.render=function(t,o,c){const i=r.getOptions(o),l=t.modules.size,u=t.modules.data,m=l+i.margin*2,g=i.color.light.a?"<path "+s(i.color.light,"fill")+' d="M0 0h'+m+"v"+m+'H0z"/>':"",d="<path "+s(i.color.dark,"stroke")+' d="'+n(u,l,i.margin)+'"/>',S='viewBox="0 0 '+m+" "+m+'"',A='<svg xmlns="http://www.w3.org/2000/svg" '+(i.width?'width="'+i.width+'" height="'+i.width+'" ':"")+S+' shape-rendering="crispEdges">'+g+d+`</svg>
`;return typeof c=="function"&&c(null,A),A},xe}var tt;function Lt(){if(tt)return H;tt=1;const r=gt(),s=At(),a=It(),n=Pt();function e(t,o,c,i,l){const u=[].slice.call(arguments,1),m=u.length,g=typeof u[m-1]=="function";if(!g&&!r())throw new Error("Callback required as last argument");if(g){if(m<2)throw new Error("Too few arguments provided");m===2?(l=c,c=o,o=i=void 0):m===3&&(o.getContext&&typeof l>"u"?(l=i,i=void 0):(l=i,i=c,c=o,o=void 0))}else{if(m<1)throw new Error("Too few arguments provided");return m===1?(c=o,o=i=void 0):m===2&&!o.getContext&&(i=c,c=o,o=void 0),new Promise(function(d,S){try{const B=s.create(c,i);d(t(B,o,i))}catch(B){S(B)}})}try{const d=s.create(c,i);l(null,t(d,o,i))}catch(d){l(d)}}return H.create=s.create,H.toCanvas=e.bind(null,a.render),H.toDataURL=e.bind(null,a.renderToDataURL),H.toString=e.bind(null,function(t,o,c){return n.render(t,c)}),H}var qt=Lt();const Dt=ft(qt);async function ot(r,s={}){const a=document.createElement("canvas");return await Dt.toCanvas(a,r,{errorCorrectionLevel:s.errorCorrectionLevel??"M",width:s.width??200,margin:s.margin??2,color:s.color??{dark:"#000000",light:"#ffffff"}}),a}function jt(r,s){const{scale:a=1,rotate:n=0,noise:e=0,blur:t=0,brightness:o=0,contrast:c=1}=s,i=n*Math.PI/180,l=Math.abs(Math.cos(i)),u=Math.abs(Math.sin(i)),m=r.width,g=r.height,d=m*l+g*u,S=m*u+g*l,B=Math.ceil(d*a),A=Math.ceil(S*a),y=document.createElement("canvas");y.width=B,y.height=A;const T=y.getContext("2d"),R=[];return t>0&&R.push(`blur(${t}px)`),o!==0&&R.push(`brightness(${100+o}%)`),c!==1&&R.push(`contrast(${c*100}%)`),R.length>0&&(T.filter=R.join(" ")),T.translate(B/2,A/2),T.rotate(i),T.scale(a,a),T.translate(-m/2,-g/2),T.drawImage(r,0,0),e>0&&Ft(T,B,A,e),y}function Ft(r,s,a,n){const e=r.getImageData(0,0,s,a),t=e.data;for(let o=0;o<t.length;o+=4){const c=(Math.random()-.5)*n*2,i=t[o]??0,l=t[o+1]??0,u=t[o+2]??0;t[o]=Math.max(0,Math.min(255,i+c)),t[o+1]=Math.max(0,Math.min(255,l+c)),t[o+2]=Math.max(0,Math.min(255,u+c))}r.putImageData(e,0,0)}async function it(r,s={},a={}){const n=await ot(r,s);return jt(n,a)}function ve(r){return r.getContext("2d").getImageData(0,0,r.width,r.height)}const ct=[{name:"simple-text",content:"Hello World"},{name:"url",content:"https://example.com/path?query=value"},{name:"ethereum-address",content:"ethereum:0x1234567890123456789012345678901234567890"},{name:"bitcoin-address",content:"bitcoin:1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2"},{name:"ecc-L",content:"Error Correction L",qrOptions:{errorCorrectionLevel:"L"}},{name:"ecc-M",content:"Error Correction M",qrOptions:{errorCorrectionLevel:"M"}},{name:"ecc-Q",content:"Error Correction Q",qrOptions:{errorCorrectionLevel:"Q"}},{name:"ecc-H",content:"Error Correction H",qrOptions:{errorCorrectionLevel:"H"}},{name:"size-100",content:"Small QR",qrOptions:{width:100}},{name:"size-200",content:"Medium QR",qrOptions:{width:200}},{name:"size-400",content:"Large QR",qrOptions:{width:400}},{name:"scale-0.5",content:"Scaled Down",transformOptions:{scale:.5}},{name:"scale-1.5",content:"Scaled Up",transformOptions:{scale:1.5}},{name:"rotate-15",content:"Rotated 15deg",transformOptions:{rotate:15}},{name:"rotate-45",content:"Rotated 45deg",transformOptions:{rotate:45}},{name:"rotate-90",content:"Rotated 90deg",transformOptions:{rotate:90}},{name:"noise-10",content:"Low Noise",transformOptions:{noise:10}},{name:"noise-30",content:"High Noise",transformOptions:{noise:30}},{name:"blur-1",content:"Slight Blur",transformOptions:{blur:1}},{name:"blur-2",content:"Medium Blur",transformOptions:{blur:2}},{name:"brightness-low",content:"Dark Image",transformOptions:{brightness:-30}},{name:"brightness-high",content:"Bright Image",transformOptions:{brightness:30}},{name:"contrast-low",content:"Low Contrast",transformOptions:{contrast:.7}},{name:"contrast-high",content:"High Contrast",transformOptions:{contrast:1.3}},{name:"combined-easy",content:"Easy Combined",transformOptions:{scale:.8,rotate:5,noise:5}},{name:"combined-medium",content:"Medium Combined",transformOptions:{scale:.6,rotate:15,noise:15,blur:1}},{name:"combined-hard",content:"Hard Combined",transformOptions:{scale:.5,rotate:30,noise:25,blur:1.5}}];async function kt(r,s=ct){const a=[];let n=0,e=0;for(const t of s)try{const o=await it(t.content,t.qrOptions,t.transformOptions),c=ve(o),i=await r.scan(c),l=i?.content===t.content;l&&(e++,n+=i.duration),a.push({name:t.name,passed:l,expectedContent:t.content,actualContent:i?.content??null,scanTime:i?.duration??null})}catch(o){a.push({name:t.name,passed:!1,expectedContent:t.content,actualContent:null,scanTime:null,error:o instanceof Error?o.message:"Unknown error"})}return{totalCases:s.length,passed:e,failed:s.length-e,passRate:e/s.length,avgScanTime:e>0?n/e:0,results:a}}const Qt={title:"Lib/QRScanner",parameters:{layout:"centered"}},z={render:()=>{const[r,s]=I.useState("Hello World"),[a,n]=I.useState(null),[e,t]=I.useState(!1),[o,c]=I.useState(null),i=I.useRef(null),l=I.useRef(null);I.useEffect(()=>(l.current=Ne({useWorker:!0}),()=>{l.current?.destroy()}),[]),I.useEffect(()=>{ot(r,{width:200}).then(c)},[r]),I.useEffect(()=>{o&&i.current&&(i.current.innerHTML="",i.current.appendChild(o))},[o]);const u=async()=>{if(!o||!l.current)return;t(!0),n(null);const m=ve(o),g=await l.current.scan(m);n(g),t(!1)};return f.jsxs("div",{className:"flex flex-col items-center gap-4 p-4",children:[f.jsx("h2",{className:"text-lg font-semibold",children:"QR Scanner 基础演示"}),f.jsx("div",{className:"flex gap-2",children:f.jsx("input",{type:"text",value:r,onChange:m=>s(m.target.value),className:"rounded border px-3 py-2",placeholder:"输入 QR 内容"})}),f.jsx("div",{ref:i,className:"rounded border p-2"}),f.jsx("button",{onClick:u,disabled:e,className:"rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50",children:e?"扫描中...":"扫描 QR 码"}),a&&f.jsxs("div",{className:"rounded bg-green-100 p-4",children:[f.jsx("p",{className:"font-medium text-green-800",children:"扫描成功！"}),f.jsxs("p",{className:"text-sm",children:["内容: ",a.content]}),f.jsxs("p",{className:"text-sm",children:["耗时: ",a.duration.toFixed(2),"ms"]})]})]})}},V={render:()=>{const[r,s]=I.useState(1),[a,n]=I.useState(0),[e,t]=I.useState(0),[o,c]=I.useState(0),[i,l]=I.useState(null),[u,m]=I.useState(null),g=I.useRef(null),d=I.useRef(null),S="Transform Test QR";I.useEffect(()=>(d.current=Ne({useWorker:!0}),()=>{d.current?.destroy()}),[]),I.useEffect(()=>{it(S,{width:200,errorCorrectionLevel:"H"},{scale:r,rotate:a,noise:e,blur:o}).then(m)},[r,a,e,o]),I.useEffect(()=>{u&&g.current&&(g.current.innerHTML="",g.current.appendChild(u))},[u]);const B=async()=>{if(!u||!d.current)return;l(null);const A=ve(u),y=await d.current.scan(A);l(y)};return f.jsxs("div",{className:"flex flex-col items-center gap-4 p-4",children:[f.jsx("h2",{className:"text-lg font-semibold",children:"QR 变换测试"}),f.jsxs("div",{className:"grid grid-cols-2 gap-4",children:[f.jsxs("label",{className:"flex flex-col",children:["缩放: ",r.toFixed(2),f.jsx("input",{type:"range",min:"0.3",max:"2",step:"0.1",value:r,onChange:A=>s(parseFloat(A.target.value))})]}),f.jsxs("label",{className:"flex flex-col",children:["旋转: ",a,"°",f.jsx("input",{type:"range",min:"0",max:"360",step:"5",value:a,onChange:A=>n(parseInt(A.target.value))})]}),f.jsxs("label",{className:"flex flex-col",children:["噪声: ",e,f.jsx("input",{type:"range",min:"0",max:"50",step:"5",value:e,onChange:A=>t(parseInt(A.target.value))})]}),f.jsxs("label",{className:"flex flex-col",children:["模糊: ",o,"px",f.jsx("input",{type:"range",min:"0",max:"5",step:"0.5",value:o,onChange:A=>c(parseFloat(A.target.value))})]})]}),f.jsx("div",{ref:g,className:"rounded border p-2 bg-white"}),f.jsx("button",{onClick:B,className:"rounded bg-blue-500 px-4 py-2 text-white",children:"扫描"}),i?f.jsxs("div",{className:"rounded bg-green-100 p-4",children:[f.jsx("p",{className:"font-medium text-green-800",children:"✓ 识别成功"}),f.jsxs("p",{className:"text-sm",children:["耗时: ",i.duration.toFixed(2),"ms"]})]}):f.jsx("div",{className:"rounded bg-gray-100 p-4",children:f.jsx("p",{className:"text-gray-600",children:"点击扫描按钮测试"})})]})}},K={render:()=>{const[r,s]=I.useState(!1),[a,n]=I.useState(null),e=I.useRef(null);I.useEffect(()=>(e.current=Ne({useWorker:!0}),()=>{e.current?.destroy()}),[]);const t=async()=>{if(!e.current)return;s(!0),n(null),await e.current.waitReady();const o=await kt(e.current,ct);n(o),s(!1)};return f.jsxs("div",{className:"flex flex-col gap-4 p-4 max-w-2xl",children:[f.jsx("h2",{className:"text-lg font-semibold",children:"QR Scanner 可靠性测试"}),f.jsx("button",{onClick:t,disabled:r,className:"rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50 self-start",children:r?"测试中...":"运行测试"}),a&&f.jsxs("div",{className:"space-y-4",children:[f.jsxs("div",{className:"grid grid-cols-4 gap-4",children:[f.jsxs("div",{className:"rounded bg-gray-100 p-3 text-center",children:[f.jsx("p",{className:"text-2xl font-bold",children:a.totalCases}),f.jsx("p",{className:"text-sm text-gray-600",children:"总用例"})]}),f.jsxs("div",{className:"rounded bg-green-100 p-3 text-center",children:[f.jsx("p",{className:"text-2xl font-bold text-green-700",children:a.passed}),f.jsx("p",{className:"text-sm text-gray-600",children:"通过"})]}),f.jsxs("div",{className:"rounded bg-red-100 p-3 text-center",children:[f.jsx("p",{className:"text-2xl font-bold text-red-700",children:a.failed}),f.jsx("p",{className:"text-sm text-gray-600",children:"失败"})]}),f.jsxs("div",{className:`rounded p-3 text-center ${a.passRate>=.8?"bg-green-100":"bg-yellow-100"}`,children:[f.jsxs("p",{className:"text-2xl font-bold",children:[(a.passRate*100).toFixed(1),"%"]}),f.jsx("p",{className:"text-sm text-gray-600",children:"通过率"})]})]}),f.jsxs("div",{className:"rounded border",children:[f.jsx("div",{className:"border-b bg-gray-50 px-4 py-2 font-medium",children:"测试结果详情"}),f.jsx("div",{className:"max-h-96 overflow-auto",children:f.jsxs("table",{className:"w-full text-sm",children:[f.jsx("thead",{className:"bg-gray-50",children:f.jsxs("tr",{children:[f.jsx("th",{className:"px-4 py-2 text-left",children:"用例"}),f.jsx("th",{className:"px-4 py-2 text-left",children:"状态"}),f.jsx("th",{className:"px-4 py-2 text-left",children:"耗时"})]})}),f.jsx("tbody",{children:a.results.map((o,c)=>f.jsxs("tr",{className:o.passed?"":"bg-red-50",children:[f.jsx("td",{className:"px-4 py-2",children:o.name}),f.jsx("td",{className:"px-4 py-2",children:o.passed?f.jsx("span",{className:"text-green-600",children:"✓"}):f.jsx("span",{className:"text-red-600",children:"✗"})}),f.jsx("td",{className:"px-4 py-2",children:o.scanTime?`${o.scanTime.toFixed(2)}ms`:"-"})]},c))})]})})]}),f.jsxs("div",{className:"text-sm text-gray-600",children:["平均扫描时间: ",a.avgScanTime.toFixed(2),"ms"]})]})]})}};z.parameters={...z.parameters,docs:{...z.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [content, setContent] = useState('Hello World');
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [scanning, setScanning] = useState(false);
    const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<QRScanner | null>(null);
    useEffect(() => {
      scannerRef.current = createQRScanner({
        useWorker: true
      });
      return () => {
        scannerRef.current?.destroy();
      };
    }, []);
    useEffect(() => {
      generateQRCanvas(content, {
        width: 200
      }).then(setQrCanvas);
    }, [content]);
    useEffect(() => {
      if (qrCanvas && canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
        canvasContainerRef.current.appendChild(qrCanvas);
      }
    }, [qrCanvas]);
    const handleScan = async () => {
      if (!qrCanvas || !scannerRef.current) return;
      setScanning(true);
      setScanResult(null);
      const imageData = getCanvasImageData(qrCanvas);
      const result = await scannerRef.current.scan(imageData);
      setScanResult(result);
      setScanning(false);
    };
    return <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-lg font-semibold">QR Scanner 基础演示</h2>
        
        <div className="flex gap-2">
          <input type="text" value={content} onChange={e => setContent(e.target.value)} className="rounded border px-3 py-2" placeholder="输入 QR 内容" />
        </div>

        <div ref={canvasContainerRef} className="rounded border p-2" />

        <button onClick={handleScan} disabled={scanning} className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50">
          {scanning ? '扫描中...' : '扫描 QR 码'}
        </button>

        {scanResult && <div className="rounded bg-green-100 p-4">
            <p className="font-medium text-green-800">扫描成功！</p>
            <p className="text-sm">内容: {scanResult.content}</p>
            <p className="text-sm">耗时: {scanResult.duration.toFixed(2)}ms</p>
          </div>}
      </div>;
  }
}`,...z.parameters?.docs?.source},description:{story:"基础扫描演示",...z.parameters?.docs?.description}}};V.parameters={...V.parameters,docs:{...V.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [scale, setScale] = useState(1);
    const [rotate, setRotate] = useState(0);
    const [noise, setNoise] = useState(0);
    const [blur, setBlur] = useState(0);
    const [scanResult, setScanResult] = useState<ScanResult | null>(null);
    const [qrCanvas, setQrCanvas] = useState<HTMLCanvasElement | null>(null);
    const canvasContainerRef = useRef<HTMLDivElement>(null);
    const scannerRef = useRef<QRScanner | null>(null);
    const content = 'Transform Test QR';
    useEffect(() => {
      scannerRef.current = createQRScanner({
        useWorker: true
      });
      return () => {
        scannerRef.current?.destroy();
      };
    }, []);
    useEffect(() => {
      generateTransformedQR(content, {
        width: 200,
        errorCorrectionLevel: 'H'
      }, {
        scale,
        rotate,
        noise,
        blur
      }).then(setQrCanvas);
    }, [scale, rotate, noise, blur]);
    useEffect(() => {
      if (qrCanvas && canvasContainerRef.current) {
        canvasContainerRef.current.innerHTML = '';
        canvasContainerRef.current.appendChild(qrCanvas);
      }
    }, [qrCanvas]);
    const handleScan = async () => {
      if (!qrCanvas || !scannerRef.current) return;
      setScanResult(null);
      const imageData = getCanvasImageData(qrCanvas);
      const result = await scannerRef.current.scan(imageData);
      setScanResult(result);
    };
    return <div className="flex flex-col items-center gap-4 p-4">
        <h2 className="text-lg font-semibold">QR 变换测试</h2>

        <div className="grid grid-cols-2 gap-4">
          <label className="flex flex-col">
            缩放: {scale.toFixed(2)}
            <input type="range" min="0.3" max="2" step="0.1" value={scale} onChange={e => setScale(parseFloat(e.target.value))} />
          </label>
          <label className="flex flex-col">
            旋转: {rotate}°
            <input type="range" min="0" max="360" step="5" value={rotate} onChange={e => setRotate(parseInt(e.target.value))} />
          </label>
          <label className="flex flex-col">
            噪声: {noise}
            <input type="range" min="0" max="50" step="5" value={noise} onChange={e => setNoise(parseInt(e.target.value))} />
          </label>
          <label className="flex flex-col">
            模糊: {blur}px
            <input type="range" min="0" max="5" step="0.5" value={blur} onChange={e => setBlur(parseFloat(e.target.value))} />
          </label>
        </div>

        <div ref={canvasContainerRef} className="rounded border p-2 bg-white" />

        <button onClick={handleScan} className="rounded bg-blue-500 px-4 py-2 text-white">
          扫描
        </button>

        {scanResult ? <div className="rounded bg-green-100 p-4">
            <p className="font-medium text-green-800">✓ 识别成功</p>
            <p className="text-sm">耗时: {scanResult.duration.toFixed(2)}ms</p>
          </div> : <div className="rounded bg-gray-100 p-4">
            <p className="text-gray-600">点击扫描按钮测试</p>
          </div>}
      </div>;
  }
}`,...V.parameters?.docs?.source},description:{story:"变换测试",...V.parameters?.docs?.description}}};K.parameters={...K.parameters,docs:{...K.parameters?.docs,source:{originalSource:`{
  render: () => {
    const [running, setRunning] = useState(false);
    const [report, setReport] = useState<Awaited<ReturnType<typeof runReliabilityTest>> | null>(null);
    const scannerRef = useRef<QRScanner | null>(null);
    useEffect(() => {
      scannerRef.current = createQRScanner({
        useWorker: true
      });
      return () => {
        scannerRef.current?.destroy();
      };
    }, []);
    const handleRunTest = async () => {
      if (!scannerRef.current) return;
      setRunning(true);
      setReport(null);
      await scannerRef.current.waitReady();
      const result = await runReliabilityTest(scannerRef.current, STANDARD_TEST_CASES);
      setReport(result);
      setRunning(false);
    };
    return <div className="flex flex-col gap-4 p-4 max-w-2xl">
        <h2 className="text-lg font-semibold">QR Scanner 可靠性测试</h2>

        <button onClick={handleRunTest} disabled={running} className="rounded bg-blue-500 px-4 py-2 text-white disabled:opacity-50 self-start">
          {running ? '测试中...' : '运行测试'}
        </button>

        {report && <div className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="rounded bg-gray-100 p-3 text-center">
                <p className="text-2xl font-bold">{report.totalCases}</p>
                <p className="text-sm text-gray-600">总用例</p>
              </div>
              <div className="rounded bg-green-100 p-3 text-center">
                <p className="text-2xl font-bold text-green-700">{report.passed}</p>
                <p className="text-sm text-gray-600">通过</p>
              </div>
              <div className="rounded bg-red-100 p-3 text-center">
                <p className="text-2xl font-bold text-red-700">{report.failed}</p>
                <p className="text-sm text-gray-600">失败</p>
              </div>
              <div className={\`rounded p-3 text-center \${report.passRate >= 0.8 ? 'bg-green-100' : 'bg-yellow-100'}\`}>
                <p className="text-2xl font-bold">{(report.passRate * 100).toFixed(1)}%</p>
                <p className="text-sm text-gray-600">通过率</p>
              </div>
            </div>

            <div className="rounded border">
              <div className="border-b bg-gray-50 px-4 py-2 font-medium">测试结果详情</div>
              <div className="max-h-96 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">用例</th>
                      <th className="px-4 py-2 text-left">状态</th>
                      <th className="px-4 py-2 text-left">耗时</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.results.map((r, i) => <tr key={i} className={r.passed ? '' : 'bg-red-50'}>
                        <td className="px-4 py-2">{r.name}</td>
                        <td className="px-4 py-2">
                          {r.passed ? <span className="text-green-600">✓</span> : <span className="text-red-600">✗</span>}
                        </td>
                        <td className="px-4 py-2">
                          {r.scanTime ? \`\${r.scanTime.toFixed(2)}ms\` : '-'}
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              平均扫描时间: {report.avgScanTime.toFixed(2)}ms
            </div>
          </div>}
      </div>;
  }
}`,...K.parameters?.docs?.source},description:{story:"可靠性测试报告",...K.parameters?.docs?.description}}};const Ot=["BasicScan","TransformTest","ReliabilityReport"];export{z as BasicScan,K as ReliabilityReport,V as TransformTest,Ot as __namedExportsOrder,Qt as default};
