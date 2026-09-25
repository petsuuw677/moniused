// MoniUsed - private visit counter.
// No cookies, no IP addresses, no names: just a random ID saved on this device,
// the page, where the visitor came from, and phone or computer.
(function () {
  try {
    if (typeof SUPABASE_URL === 'undefined' || typeof SUPABASE_KEY === 'undefined') return;
    if (navigator.webdriver) return;   // skip bots and automated tests

    // Random visitor ID for this device
    let id = localStorage.getItem('mu_vid');
    if (!id) {
      id = Array.from(crypto.getRandomValues(new Uint8Array(12)), b => b.toString(16).padStart(2, '0')).join('');
      localStorage.setItem('mu_vid', id);
    }

    // Page: "/", "/auth", "/dashboard" ...
    let path = location.pathname.replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
    if (path.length > 1) path = path.replace(/\/$/, '');
    if (path === '/admin') return;       // don't count the admin page

    // Where they came from: ?s=tiktok (or utm_source), otherwise the website that linked here
    const params = new URLSearchParams(location.search);
    let source = params.get('s') || params.get('utm_source') || '';
    if (!source && document.referrer) {
      const host = new URL(document.referrer).hostname.replace(/^(www|m|l|lm|web|mobile)\./, '');
      if (host && !host.endsWith('moniused.com') && !host.endsWith('vercel.app')) {
        const known = { 't.co': 'x', 'twitter.com': 'x', 'x.com': 'x', 'facebook.com': 'facebook', 'instagram.com': 'instagram',
          'tiktok.com': 'tiktok', 'linkedin.com': 'linkedin', 'lnkd.in': 'linkedin', 'google.com': 'google', 'bing.com': 'bing', 'whatsapp.com': 'whatsapp' };
        source = known[host] || (host.match(/google\./) ? 'google' : host);
      }
    }
    if (!source) {
      // Same-site navigation isn't a new source; only count the first page's source
      source = sessionStorage.getItem('mu_src') || 'direct';
    }
    sessionStorage.setItem('mu_src', source);

    const ua = navigator.userAgent;
    const device = /iPad|Tablet/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1) ? 'tablet'
      : /Mobi|Android|iPhone/i.test(ua) ? 'mobile' : 'desktop';
    const installed = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

    fetch(SUPABASE_URL + '/rest/v1/rpc/track_visit', {
      method: 'POST',
      keepalive: true,
      headers: { 'Content-Type': 'application/json', apikey: SUPABASE_KEY },
      body: JSON.stringify({ p_visitor: id, p_path: path, p_source: source.slice(0, 40), p_device: device, p_installed: installed })
    }).catch(() => {});
  } catch (e) { /* never break the page */ }
})();
