// MoniUsed - "Get the app" install guide
// Used by the homepage and the dashboard.
//   MoniInstall.show()      -> open the guide now
//   MoniInstall.autoShow()  -> open it once in a while, only if the app isn't installed yet
(function () {
  const LATER_KEY = 'mu_install_hide_until';

  const ua = navigator.userAgent;
  const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const isAndroid = /android/i.test(ua);
  const isInstalled = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

  // Android Chrome can install with one tap
  let installPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    installPrompt = e;
    const btn = document.getElementById('miOneTap');
    if (btn) btn.hidden = false;
  });
  window.addEventListener('appinstalled', () => {
    installPrompt = null;
    const d = document.getElementById('miDialog');
    if (d && d.open) d.close();
  });

  const shareIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v12M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
  const addIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M12 8v8M8 12h8"/></svg>';
  const dotsIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="12" cy="19" r="1.4"/></svg>';
  const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/></svg>';

  const STEPS = {
    iphone: [
      [shareIcon, 'Tap the <b>Share</b> button', 'At the bottom of Safari. In Chrome, it\'s at the top right.'],
      [addIcon, 'Tap <b>Add to Home Screen</b>', 'Scroll down the list if you don\'t see it.'],
      [phoneIcon, 'Tap <b>Add</b>', 'MoniUsed appears on your home screen.']
    ],
    android: [
      [dotsIcon, 'Tap the <b>⋮</b> menu', 'At the top right of Chrome.'],
      [addIcon, 'Tap <b>Install app</b>', 'Or <b>Add to Home screen</b> on some phones.'],
      [phoneIcon, 'Tap <b>Install</b>', 'MoniUsed appears with your other apps.']
    ]
  };

  const css = `
    #miDialog { border: 0; border-radius: 22px; padding: 22px; width: min(440px, calc(100% - 24px));
      margin: auto; color: var(--ink, #1b1c18); font-family: var(--body, system-ui, sans-serif); max-height: 92vh; overflow-y: auto; }
    #miDialog::backdrop { background: rgba(20, 20, 15, .55); }
    #miDialog .mi-top { display: flex; align-items: center; gap: 14px; margin-bottom: 14px; }
    #miDialog .mi-top img { width: 58px; height: 58px; border-radius: 14px; flex: 0 0 auto; }
    #miDialog h2 { font-family: var(--head, sans-serif); font-size: 22px; line-height: 1.15; margin: 0 0 3px; }
    #miDialog .mi-sub { color: var(--muted, #5c6057); font-size: 14.5px; margin: 0; }
    #miDialog .mi-tabs { display: grid; grid-template-columns: 1fr 1fr; background: var(--soft, #f2f3ee); border-radius: 999px; padding: 4px; margin: 4px 0 12px; }
    #miDialog .mi-tabs button { border: 0; background: none; padding: 9px; border-radius: 999px; font: 700 14px var(--body, sans-serif); color: var(--muted, #5c6057); cursor: pointer; }
    #miDialog .mi-tabs button.on { background: var(--ink, #1b1c18); color: #fff; }
    #miDialog ol { list-style: none; margin: 0; padding: 0; }
    #miDialog li { display: flex; gap: 14px; align-items: flex-start; padding: 11px 0; border-bottom: 1px solid var(--soft, #f2f3ee); }
    #miDialog li:last-child { border-bottom: 0; }
    #miDialog .mi-num { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto; display: grid; place-items: center;
      background: #e6f4ee; color: var(--green, #0b5d45); position: relative; }
    #miDialog .mi-num svg { width: 24px; height: 24px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
    #miDialog .mi-num span { position: absolute; top: -6px; left: -6px; width: 20px; height: 20px; border-radius: 50%;
      background: var(--yellow, #f6c90e); color: var(--ink, #1b1c18); font-size: 12px; font-weight: 800; display: grid; place-items: center; }
    #miDialog li p { margin: 2px 0 0; color: var(--muted, #5c6057); font-size: 14px; }
    #miDialog .mi-note { background: var(--soft, #f2f3ee); border-radius: 12px; padding: 10px 12px; font-size: 14px; color: var(--muted, #5c6057); margin: 12px 0 0; }
    #miDialog .mi-done { text-align: center; padding: 10px 0 4px; font-size: 16px; }
    #miDialog .mi-actions { display: flex; gap: 10px; margin-top: 18px; }
    #miDialog .mi-actions .btn { flex: 1; text-align: center; padding: 13px 10px; }
    #miDialog #miOneTap { width: 100%; margin: 4px 0 8px; }
    #miDialog #miOneTap[hidden] { display: none; }
    @media (max-width: 800px) {
      #miDialog { margin: auto 0 0; width: 100%; max-width: 100%; border-radius: 22px 22px 0 0;
        padding-bottom: calc(22px + env(safe-area-inset-bottom, 0px)); }
    }`;

  function build() {
    if (document.getElementById('miDialog')) return;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);

    const d = document.createElement('dialog');
    d.id = 'miDialog';
    d.setAttribute('aria-labelledby', 'miTitle');
    document.body.appendChild(d);

    // One click handler for everything inside the guide
    d.addEventListener('click', async (e) => {
      // Tap outside to close
      if (e.target === d) {
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) d.close();
        return;
      }
      const dev = e.target.closest('[data-dev]');
      if (dev) { render(dev.dataset.dev); return; }

      const act = e.target.closest('[data-mi]');
      if (act) {
        if (act.dataset.mi === 'later') hideFor(3);
        if (act.dataset.mi === 'close') hideFor(14);
        d.close();
        return;
      }
      if (e.target.id === 'miOneTap' && installPrompt) {
        const p = installPrompt;
        installPrompt = null;
        p.prompt();
        const choice = await p.userChoice;
        if (choice.outcome === 'accepted') d.close();
        else e.target.hidden = true;
      }
    });
  }

  function stepsHtml(device) {
    return STEPS[device].map((s, i) => `
      <li><span class="mi-num">${s[0]}<span>${i + 1}</span></span>
        <div><b>${s[1]}</b><p>${s[2]}</p></div></li>`).join('');
  }

  function render(device) {
    const d = document.getElementById('miDialog');
    const top = `
      <div class="mi-top">
        <img src="/icon-192.png" alt="">
        <div><h2 id="miTitle">Get MoniUsed on your phone</h2>
        <p class="mi-sub">Open it from your home screen like a normal app. No app store needed.</p></div>
      </div>`;

    if (isInstalled()) {
      d.innerHTML = top + `
        <p class="mi-done">✅ You're already using the MoniUsed app.</p>
        <div class="mi-actions"><button type="button" class="btn btn-dark" data-mi="close">Great</button></div>`;
      return;
    }

    const desktop = !isIOS && !isAndroid;
    d.innerHTML = top + `
      <button type="button" class="btn btn-dark" id="miOneTap" ${installPrompt ? '' : 'hidden'}>Install MoniUsed now</button>
      <div class="mi-tabs" role="group" aria-label="Choose your phone">
        <button type="button" data-dev="iphone" class="${device === 'iphone' ? 'on' : ''}" aria-pressed="${device === 'iphone'}">iPhone</button>
        <button type="button" data-dev="android" class="${device === 'android' ? 'on' : ''}" aria-pressed="${device === 'android'}">Android</button>
      </div>
      <ol>${stepsHtml(device)}</ol>
      ${desktop ? '<p class="mi-note">💻 On a computer? Open <b>moniused.vercel.app</b> on your phone and follow these steps. In Chrome or Edge on a computer, you can also click the install icon in the address bar.</p>' : ''}
      <div class="mi-actions">
        <button type="button" class="btn btn-light" data-mi="later">Maybe later</button>
        <button type="button" class="btn btn-dark" data-mi="close">Got it</button>
      </div>`;

  }

  function hideFor(days) {
    try { localStorage.setItem(LATER_KEY, String(Date.now() + days * 864e5)); } catch (e) {}
  }

  function show() {
    build();
    render(isAndroid ? 'android' : 'iphone');
    const d = document.getElementById('miDialog');
    if (!d.open) d.showModal();
  }

  function autoShow() {
    if (isInstalled()) return;
    let until = 0;
    try { until = Number(localStorage.getItem(LATER_KEY)) || 0; } catch (e) {}
    if (Date.now() < until) return;
    setTimeout(() => {
      // Don't cover a form the user already opened
      if (document.querySelector('dialog[open]')) return;
      show();
    }, 1500);
  }

  window.MoniInstall = { show, autoShow, isInstalled };
})();
