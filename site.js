// Voss Lite. Vanilla, one rAF loop, no dependencies. The page is complete without any of this.
(() => {
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const STATIC = root.classList.contains('static');
  const FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const clamp = (v) => Math.min(1, Math.max(0, v));

  // Copy email, falling back to a mailto link when the clipboard is blocked
  $$('[data-copy]').forEach((b) => b.addEventListener('click', async () => {
    const ok = await navigator.clipboard?.writeText(b.dataset.copy).then(() => true, () => false);
    if (!ok) { location.href = 'mailto:' + b.dataset.copy; return; }
    b.classList.add('ok');
    setTimeout(() => b.classList.remove('ok'), 1600);
  }));

  // Letter roll and split text
  $$('[data-roll]').forEach((el) => {
    const t = el.textContent.trim();
    el.setAttribute('aria-label', t);
    el.textContent = '';
    const r = el.appendChild(document.createElement('span'));
    r.className = 'r'; r.setAttribute('aria-hidden', 'true');
    [...t].forEach((c, i) => { const s = r.appendChild(document.createElement('span')); s.textContent = c; s.dataset.c = c; s.style.setProperty('--i', i); });
  });
  let chi = 0;
  const letters = [];
  $$('[data-chars]').forEach((el) => {
    const t = el.textContent.trim();
    el.textContent = '';
    t.split(/\s+/).forEach((word, n) => {
      if (n) el.append(' ');
      word.split(/(?<=-)/).forEach((part) => {
        const box = Object.assign(el.appendChild(document.createElement('span')), { className: 'nb' });
        [...part].forEach((c) => {
          const o = box.appendChild(document.createElement('span')); o.className = 'ch';
          const i = o.appendChild(document.createElement('i')); i.textContent = c; i.style.setProperty('--i', chi++);
          letters.push({ el: i, cx: 0, w: 100 });
        });
      });
    });
  });
  const words = [];
  $$('[data-words]').forEach((el) => {
    const parts = el.textContent.trim().split(/\s+/);
    el.textContent = '';
    parts.forEach((p, i) => {
      const s = el.appendChild(document.createElement('span')); s.className = 'wd'; s.textContent = p;
      if (i < parts.length - 1) el.append(' ');
      words.push(s);
    });
  });
  const wordsBox = $('[data-words]');

  // Name and footer wordmark fit their column on one line, however long the name is
  const fits = $$('[data-fit]');
  function fit(el) {
    const cs = getComputedStyle(el.parentElement);
    const W = el.parentElement.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const isName = el.classList.contains('name'), narrow = vw < 760; // vw, not innerWidth: the 100px test size can widen a phone's layout viewport
    el.classList.remove('solo', 'wrap');
    el.style.fontSize = '100px';
    // Long names on a phone: size by the widest unbreakable part so words can stack
    const stack = (cls) => {
      el.classList.add(cls);
      el.style.width = 'min-content';
      const s = Math.min(W * .26, 100 * W / el.getBoundingClientRect().width);
      el.style.width = '';
      return s;
    };
    let size;
    if (isName && narrow) {
      const [a, b] = $$('.w', el).map((w) => { const g = document.createRange(); g.selectNodeContents(w); return g.getBoundingClientRect().width; });
      size = 100 * W / Math.max(a + 60, b || 0);
      if (b === undefined || size < W * .145 || W - a * size / 100 < W * .16) {
        size = stack('solo');
        const lines = (s) => { el.style.fontSize = s + 'px'; return $$('.w', el).reduce((h, w) => h + w.offsetHeight, 0) / (s * .86); };
        while (size > 20 && lines(size) > 3.4) size -= 1;
      }
    } else {
      const prev = el.style.width;
      el.style.width = 'max-content';
      size = 100 * W / el.getBoundingClientRect().width;
      el.style.width = prev;
      if (isName) size = Math.min(size, innerHeight * .4);
      else if (narrow && size < W * .145 && /\s/.test(el.textContent.trim())) size = stack('wrap');
    }
    el.style.fontSize = size.toFixed(2) + 'px';
  }

  let vw = 0, vh = 0, wordsTop = 0, wordsH = 0, mx = -9999, my = -9999, litWords = -1;
  function measure() {
    vw = innerWidth; vh = innerHeight;
    letters.forEach((l) => l.el.style.setProperty('--w', l.w = 100));
    fits.forEach(fit);
    const s = scrollY;
    letters.forEach((l) => { const r = l.el.getBoundingClientRect(); l.cx = r.left + r.width / 2; l.cy = r.top + s + r.height / 2; });
    if (wordsBox) { const r = wordsBox.getBoundingClientRect(); wordsTop = r.top + s; wordsH = r.height; }
  }

  // Cursor swell: letters near the pointer widen, the rest give way, the name stays the same length
  function drawLetters(s) {
    if (!letters.length || !FINE || STATIC) return;
    const near = Math.abs(my + s - letters[0].cy) < vh * .36;
    const R = vw * .118;
    const b = letters.map((l) => near ? Math.exp(-Math.pow((l.cx - mx) / R, 2)) : 0);
    const mean = b.reduce((a, v) => a + v, 0) / b.length;
    letters.forEach((l, i) => {
      const target = near ? Math.min(122, Math.max(78, 100 + 32 * (b[i] - mean))) : 100;
      const next = l.w + (target - l.w) * .14;
      if (Math.abs(next - l.w) > .02) { l.w = next; l.el.style.setProperty('--w', next.toFixed(2)); }
    });
  }

  function drawWords(s) {
    if (!words.length || STATIC) return;
    const lit = Math.floor(clamp((s + vh * .82 - wordsTop) / (wordsH + vh * .3)) * words.length);
    if (lit !== litWords) { words.forEach((w, i) => w.classList.toggle('on', i < lit)); litWords = lit; }
  }

  // Nav marker follows the pointer, rests on the section being read
  const linksBox = $('.links'), marker = $('.marker'), links = $$('.links a');
  const secs = links.map((a) => $(a.hash));
  let hoverLink = null, spyLink = null;
  function placeMarker() {
    const a = hoverLink || spyLink;
    links.forEach((l) => l.classList.toggle('lit', l === a));
    if (!a) { marker.style.setProperty('--mo', 0); return; }
    marker.style.setProperty('--mx', a.offsetLeft + 'px');
    marker.style.setProperty('--mw', a.offsetWidth + 'px');
    marker.style.setProperty('--mo', 1);
  }
  if (FINE) {
    links.forEach((a) => a.addEventListener('pointerenter', () => { hoverLink = a; placeMarker(); }));
    linksBox.addEventListener('pointerleave', () => { hoverLink = null; placeMarker(); });
  }
  function spy(s) {
    const i = secs.findIndex((el) => s > el.offsetTop - vh * .5 && s < el.offsetTop + el.offsetHeight - vh * .5);
    const next = links[i] || null;
    if (next !== spyLink) { spyLink = next; placeMarker(); }
  }

  // Magnetic buttons
  if (FINE && !STATIC) $$('.mag').forEach((el) => {
    const label = el.firstElementChild;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${(x * .28).toFixed(1)}px,${(y * .4).toFixed(1)}px)`;
      label.style.transform = `translate(${(x * .1).toFixed(1)}px,${(y * .14).toFixed(1)}px)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; label.style.transform = ''; });
  });
  addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function frame() {
    const s = scrollY;
    drawLetters(s);
    drawWords(s);
    spy(s);
    requestAnimationFrame(frame);
  }

  let rt;
  addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { measure(); placeMarker(); }, 120); });

  measure();
  placeMarker();
  document.fonts.ready.then(() => { measure(); placeMarker(); });
  addEventListener('load', measure);
  if (STATIC) root.classList.add('ready'); else requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add('ready')));
  requestAnimationFrame(frame);
})();
