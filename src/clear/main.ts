import './styles.css';

const baseUri = new URL('./', window.location.href).href;

interface StepElement {
  id: string;
  label: string;
  action: () => Promise<void>;
}

const steps: StepElement[] = [
  {
    id: 'step-local',
    label: '本地存储 (localStorage)', // i18n-ignore: standalone page
    action: async () => {
      localStorage.clear();
    },
  },
  {
    id: 'step-session',
    label: '会话存储 (sessionStorage)', // i18n-ignore: standalone page
    action: async () => {
      sessionStorage.clear();
    },
  },
  {
    id: 'step-indexeddb',
    label: '数据库 (IndexedDB)', // i18n-ignore: standalone page
    action: async () => {
      if (indexedDB.databases) {
        const databases = await indexedDB.databases();
        for (const db of databases) {
          if (!db.name) continue;
          await new Promise<void>((resolve) => {
            const request = indexedDB.deleteDatabase(db.name);
            const handleFinish = () => resolve();
            request.addEventListener('success', handleFinish);
            request.addEventListener('error', handleFinish);
            request.addEventListener('blocked', handleFinish);
          });
        }
      }
    },
  },
  {
    id: 'step-cache',
    label: '缓存 (Cache Storage)', // i18n-ignore: standalone page
    action: async () => {
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      }
    },
  },
];

function createUI() {
  const root = document.getElementById('root');
  if (!root) return false;
  root.innerHTML = `
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
        ${steps
          .map(
            (step) => `
          <div class="step" id="${step.id}">
            <span class="step-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </span>
            <span>${step.label}</span>
          </div>
        `,
          )
          .join('')}
      </div>

      <p class="error-message" id="error"></p>
    </div>
  `;
  return true;
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function updateProgress(completed: number, total: number) {
  const progressCircle = document.getElementById('progressCircle');
  if (progressCircle) {
    const percent = (completed / total) * 100;
    const offset = 226 - (226 * percent) / 100;
    progressCircle.style.strokeDashoffset = String(offset);
  }
}

function setStepActive(stepId: string) {
  document.getElementById(stepId)?.classList.add('active');
}

function setStepDone(stepId: string) {
  const step = document.getElementById(stepId);
  step?.classList.remove('active');
  step?.classList.add('done');
}

async function clearAllData() {
  let completed = 0;
  await steps.reduce(
    async (prev, step) => {
      await prev;
      setStepActive(step.id);
      await delay(300);
      try {
        await step.action();
      } catch {}
      setStepDone(step.id);
      completed++;
      updateProgress(completed, steps.length);
    },
    Promise.resolve(),
  );
}

async function main() {
  if (!createUI()) return;

  const title = document.getElementById('title');
  const status = document.getElementById('status');
  const error = document.getElementById('error');
  const checkIcon = document.getElementById('checkIcon');
  const container = document.querySelector('.container');
  if (!title || !status || !error || !checkIcon || !container) return;

  try {
    await clearAllData();

    await delay(300);
    checkIcon.classList.add('visible');
    container.classList.add('success-state');
    title.textContent = '清理完成'; // i18n-ignore: standalone page
    status.textContent = '正在返回应用...'; // i18n-ignore: standalone page

    await delay(1200);
    window.location.href = baseUri;
  } catch (e) {
    title.textContent = '清理失败'; // i18n-ignore: standalone page
    status.textContent = '';
    error.style.display = 'block';
    error.textContent = e instanceof Error ? e.message : '发生未知错误'; // i18n-ignore: standalone page

    await delay(3000);
    window.location.href = baseUri;
  }
}

main();
