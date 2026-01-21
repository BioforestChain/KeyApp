import"./modulepreload-polyfill-B5Qt9EMX.js";const r=new URL("./",window.location.href).href,c=[{id:"step-local",label:"本地存储 (localStorage)",action:async()=>{localStorage.clear()}},{id:"step-session",label:"会话存储 (sessionStorage)",action:async()=>{sessionStorage.clear()}},{id:"step-indexeddb",label:"数据库 (IndexedDB)",action:async()=>{if(indexedDB.databases){const t=await indexedDB.databases();for(const e of t)e.name&&await new Promise(s=>{const n=indexedDB.deleteDatabase(e.name);n.onsuccess=()=>s(),n.onerror=()=>s(),n.onblocked=()=>s()})}}},{id:"step-cache",label:"缓存 (Cache Storage)",action:async()=>{if("caches"in window){const t=await caches.keys();await Promise.all(t.map(e=>caches.delete(e)))}}}];function l(){const t=document.getElementById("root");t.innerHTML=`
    <div class="container fade-in">
      <div class="progress-ring" id="progressRing">
        <svg viewBox="0 0 80 80">
          <circle class="bg" cx="40" cy="40" r="36" />
          <circle class="progress" id="progressCircle" cx="40" cy="40" r="36" />
        </svg>
        <div class="check" id="checkIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <h1 id="title">正在清理数据</h1><!-- i18n-ignore: standalone page -->
      <p class="status" id="status">请稍候...</p><!-- i18n-ignore: standalone page -->

      <div class="steps" id="steps">
        ${c.map(e=>`
          <div class="step" id="${e.id}">
            <span class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span>${e.label}</span>
          </div>
        `).join("")}
      </div>

      <p class="error-message" id="error"></p>
    </div>
  `}function o(t){return new Promise(e=>setTimeout(e,t))}function d(t,e){const s=document.getElementById("progressCircle");if(s){const a=226-226*(t/e*100)/100;s.style.strokeDashoffset=String(a)}}function p(t){document.getElementById(t)?.classList.add("active")}function g(t){const e=document.getElementById(t);e?.classList.remove("active"),e?.classList.add("done")}async function u(){let t=0;for(const e of c){p(e.id),await o(300);try{await e.action()}catch{}g(e.id),t++,d(t,c.length)}}async function m(){l();const t=document.getElementById("title"),e=document.getElementById("status"),s=document.getElementById("error"),n=document.getElementById("checkIcon"),a=document.querySelector(".container");try{await u(),await o(300),n.classList.add("visible"),a.classList.add("success-state"),t.textContent="清理完成",e.textContent="正在返回应用...",await o(1200),window.location.href=r}catch(i){t.textContent="清理失败",e.textContent="",s.style.display="block",s.textContent=i instanceof Error?i.message:"发生未知错误",await o(3e3),window.location.href=r}}m();
