/* ============================================================
   PMM 2027 — poster.js  (v3 — matches Figma design mockup)

   DESIGN SPEC (from Figma):
   ─ Font:          Rowdies, Light (300)
   ─ Size:          36px @ 1083px canvas width → scaled proportionally
   ─ Colour:        #FFFFFF
   ─ Alignment:     Left, with ~60px left margin
   ─ Position:      Bottom strip of poster (existing dark bar)
   ─ Format:        "DAVOU MANCHA  I SUPPORT  #PMM2027"
   ─ Letter-spacing: 3%

   ONLY THIS FILE NEEDS REPLACING. No other files change.
   Original poster download button lives on index.html separately.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  // Match real poster ratio (1179 × 1656) scaled to 1080 wide
  canvas.width  = 1080;
  canvas.height = 1519; // 1080 × (1656 / 1179) ≈ 1519

  const nameInput   = document.getElementById('poster-name');
  const wardInput   = document.getElementById('poster-ward');
  const lgaSelect   = document.getElementById('poster-lga');
  const generateBtn = document.getElementById('poster-generate');
  const downloadBtn = document.getElementById('poster-download');
  const shareWaBtn  = document.getElementById('poster-share-wa');
  const preview     = document.getElementById('poster-preview');

  // ── FONT LOADING (Rowdies Light via Google Fonts) ─────────────
  let fontsReady = false;

  const rowdiesFont = new FontFace(
    'Rowdies',
    'url(https://fonts.gstatic.com/s/rowdies/v11/ptRMTieMcdnGLFGwArjVg.woff2) format("woff2")',
    { weight: '300', style: 'normal' }
  );

  rowdiesFont.load()
    .then(font => {
      document.fonts.add(font);
      fontsReady = true;
      if (baseImg.complete && baseImg.naturalWidth > 0) drawPoster();
    })
    .catch(() => {
      fontsReady = true; // fall back to system sans-serif
      if (baseImg.complete && baseImg.naturalWidth > 0) drawPoster();
    });

  // ── BASE IMAGE ────────────────────────────────────────────────
  const baseImg = new Image();
  baseImg.crossOrigin = 'anonymous';
  baseImg.src = 'assets/img/poster/campaign-poster.jpg';
  baseImg.onload  = () => { if (fontsReady) drawPoster(); };
  baseImg.onerror = () => drawFallback();

  // ── LISTENERS ────────────────────────────────────────────────
  [nameInput, wardInput, lgaSelect].forEach(el => {
    if (el) el.addEventListener('input', drawPoster);
  });

  if (generateBtn) generateBtn.addEventListener('click', drawPoster);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadPoster);
  if (shareWaBtn)  shareWaBtn.addEventListener('click', shareViaWhatsApp);

  // ── DRAW ─────────────────────────────────────────────────────
  function drawPoster() {
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // 1. Base poster — fills entire canvas
    if (baseImg.complete && baseImg.naturalWidth > 0) {
      ctx.drawImage(baseImg, 0, 0, W, H);
    } else {
      drawFallback();
      return;
    }

    // 2. Supporter text content
    const rawName = nameInput?.value?.trim() || 'YOUR NAME';
    const ward    = wardInput?.value?.trim();
    const lga     = lgaSelect?.value;
    const locLine = [ward, lga].filter(Boolean).join(' · ');

    // Figma layer text format: "NAME   I SUPPORT   #PMM2027"
    const supportLine = `${rawName.toUpperCase()}   I SUPPORT   #PMM2027`;

    // 3. Geometry — bottom dark strip of poster
    //    Strip occupies the bottom ~6.2% of poster height.
    //    Text baseline sits ~1.8% from the very bottom edge.
    const stripY        = H - Math.round(H * 0.062);
    const baselineY     = H - Math.round(H * 0.018);

    // Subtle darkening overlay on the strip only — preserves poster,
    // just ensures white text is legible on any version of the image.
    ctx.fillStyle = 'rgba(0, 18, 6, 0.42)';
    ctx.fillRect(0, stripY, W, H - stripY);

    // 4. Main supporter text — Rowdies Light, white, left-aligned
    //    Figma: 36px at 1083px canvas → scale proportionally
    const fontPx     = Math.round(W * (36 / 1083));
    const fontFamily = fontsReady ? '"Rowdies", sans-serif' : 'sans-serif';

    ctx.font         = `300 ${fontPx}px ${fontFamily}`;
    ctx.fillStyle    = '#FFFFFF';
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'alphabetic';

    // Letter-spacing 3% — applied manually since Canvas lacks the CSS property
    const leftX = Math.round(W * 0.055); // ~60px at 1080 wide
    drawTracked(ctx, supportLine, leftX, baselineY, 0.03, fontPx);

    // 5. Ward / LGA sub-line — rendered just above the strip,
    //    in PMM gold, smaller, same font — only shown if user entered data.
    if (locLine) {
      const subPx = Math.round(fontPx * 0.60);
      ctx.font      = `300 ${subPx}px ${fontFamily}`;
      ctx.fillStyle = 'rgba(245, 196, 28, 0.88)';
      const subY    = stripY - Math.round(H * 0.007);
      drawTracked(ctx, locLine.toUpperCase(), leftX, subY, 0.03, subPx);
    }

    // Reset
    ctx.textBaseline = 'alphabetic';
    ctx.textAlign    = 'left';

    // 6. Update preview img
    if (preview)     preview.src           = canvas.toDataURL('image/jpeg', 0.93);
    if (downloadBtn) downloadBtn.disabled  = false;
    if (shareWaBtn)  shareWaBtn.disabled   = false;
  }

  // ── LETTER-SPACING HELPER ─────────────────────────────────────
  // Canvas has no letter-spacing property — we space chars manually.
  // tracking = fraction of fontPx (e.g. 0.03 = 3%)
  function drawTracked(ctx, text, x, y, tracking, fontPx) {
    const extra = fontPx * tracking;
    let cursor  = x;
    for (const ch of text) {
      ctx.fillText(ch, cursor, y);
      cursor += ctx.measureText(ch).width + extra;
    }
  }

  // ── FALLBACK ──────────────────────────────────────────────────
  function drawFallback() {
    const W = canvas.width;
    const H = canvas.height;

    // Dark green gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#195727');
    bg.addColorStop(1, '#0d1a10');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Ghost "SERVICE" header
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.font      = `bold ${Math.round(W * 0.12)}px Georgia, serif`;
    ctx.textAlign = 'center';
    ctx.fillText('SERVICE', W / 2, H * 0.17);

    // Candidate name
    ctx.fillStyle = 'rgba(245,196,28,0.75)';
    ctx.font      = `bold ${Math.round(W * 0.075)}px Georgia, serif`;
    ctx.fillText('AVM PAUL MASIYER', W / 2, H * 0.37);

    // Constituency
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.font      = `${Math.round(W * 0.026)}px monospace`;
    ctx.fillText('HOUSE OF REPRESENTATIVES', W / 2, H * 0.45);
    ctx.fillText('MANGU/BOKKOS · 2027', W / 2, H * 0.49);

    // Proceed to draw the supporter strip on top of fallback
    fontsReady = true;
    drawPoster();
  }

  // ── DOWNLOAD ─────────────────────────────────────────────────
  function downloadPoster() {
    drawPoster();
    const name = (nameInput?.value?.trim() || 'supporter').replace(/\s+/g, '_');
    const a    = document.createElement('a');
    a.download = `PMM2027_MyPoster_${name}.jpg`;
    a.href     = canvas.toDataURL('image/jpeg', 0.93);
    a.click();
  }

  // ── WHATSAPP SHARE ────────────────────────────────────────────
  function shareViaWhatsApp() {
    const name = nameInput?.value?.trim() || 'a supporter';
    const ward = wardInput?.value?.trim();
    const lga  = lgaSelect?.value;
    const loc  = [ward, lga].filter(Boolean).join(', ');
    const msg  = encodeURIComponent(
      `🇳🇬 ${name.toUpperCase()} I SUPPORT AVM PAUL D. MASIYER (RTD.)!\n\n` +
      `House of Representatives · Mangu/Bokkos · 2027` +
      `${loc ? `\n${loc}` : ''}\n\n` +
      `"Service. Sacrifice. Commitment. — A New Dawn for Mangu/Bokkos"\n\n` +
      `Join the PMM 👇\n${window.location.origin}\n\n` +
      `#PMM2027 #ManguBokkos #APC2027 #LeadershipWithIntegrity`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }
});
