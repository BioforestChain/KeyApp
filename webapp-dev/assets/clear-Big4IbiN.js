import"./modulepreload-polyfill-B5Qt9EMX.js";const r=new URL("./",window.location.href).href,i=[{id:"step-local",label:"本地存储 (localStorage)",action:async()=>{localStorage.clear()}},{id:"step-session",label:"会话存储 (sessionStorage)",action:async()=>{sessionStorage.clear()}},{id:"step-indexeddb",label:"数据库 (IndexedDB)",action:async()=>{if(indexedDB.databases){const e=await indexedDB.databases();for(const t of e)t.name&&await new Promise(s=>{const o=indexedDB.deleteDatabase(t.name),n=()=>s();o.addEventListener("success",n),o.addEventListener("error",n),o.addEventListener("blocked",n)})}}},{id:"step-cache",label:"缓存 (Cache Storage)",action:async()=>{if("caches"in window){const e=await caches.keys();await Promise.all(e.map(t=>caches.delete(t)))}}}];function d(){const e=document.getElementById("root");return e?(e.innerHTML=`
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
        ${i.map(t=>`
          <div class="step" id="${t.id}">
            <span class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span>${t.label}</span>
          </div>
        `).join("")}
      </div>

      <p class="error-message" id="error"></p>
    </div>
  `,!0):!1}function a(e){return new Promise(t=>setTimeout(t,e))}function l(e,t){const s=document.getElementById("progressCircle");if(s){const n=226-226*(e/t*100)/100;s.style.strokeDashoffset=String(n)}}function p(e){document.getElementById(e)?.classList.add("active")}function u(e){const t=document.getElementById(e);t?.classList.remove("active"),t?.classList.add("done")}async function g(){let e=0;await i.reduce(async(t,s)=>{await t,p(s.id),await a(300);try{await s.action()}catch{}u(s.id),e++,l(e,i.length)},Promise.resolve())}async function m(){if(!d())return;const e=document.getElementById("title"),t=document.getElementById("status"),s=document.getElementById("error"),o=document.getElementById("checkIcon"),n=document.querySelector(".container");if(!(!e||!t||!s||!o||!n))try{await g(),await a(300),o.classList.add("visible"),n.classList.add("success-state"),e.textContent="清理完成",t.textContent="正在返回应用...",await a(1200),window.location.href=r}catch(c){e.textContent="清理失败",t.textContent="",s.style.display="block",s.textContent=c instanceof Error?c.message:"发生未知错误",await a(3e3),window.location.href=r}}m();
