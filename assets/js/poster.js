/* ============================================================
   PMM 2027 — poster.js (CINEMATIC UPGRADE — STABLE BUILD)

   Upgrades:
   - Removes harsh black strip
   - Adds cinematic green gradient extension
   - Reduces excessive spacing
   - Integrates text into poster visually
   - Keeps original structure (no regressions)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('poster-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');

  canvas.width  = 1080;
  canvas.height = 1519;

  const nameInput   = document.getElementById('poster-name');
  const wardInput   = document.getElementById('poster-ward');
  const lgaSelect   = document.getElementById('poster-lga');
  const generateBtn = document.getElementById('poster-generate');
  const downloadBtn = document.getElementById('poster-download');
  const shareWaBtn  = document.getElementById('poster-share-wa');
  const preview     = document.getElementById('poster-preview');

  let fontsReady = false;

  // ===== FONT LOADING =====
  const fontPrimary = new FontFace(
    'Playfair Display',
    'url(https://fonts.gstatic.com/s/playfairdisplay/v37/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYhVY.woff2)'
  );

  const fontSecondary = new FontFace(
    'Inter',
    'url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTcviYwY.woff2)'
  );

  Promise.all([fontPrimary.load(), fontSecondary.load()])
    .then(fonts => {
      fonts.forEach(f => document.fonts.add(f));
      fontsReady = true;
      if (baseImg.complete && baseImg.naturalWidth > 0) drawPoster();
    })
    .catch(() => {
      fontsReady = true;
      if (baseImg.complete && baseImg.naturalWidth > 0) drawPoster();
    });

  // ===== BASE IMAGE =====
  const baseImg = new Image();
  baseImg.crossOrigin = 'anonymous';
  baseImg.src = 'assets/img/poster/campaign-poster.jpg';
  baseImg.onload  = () => { if (fontsReady) drawPoster(); };
  baseImg.onerror = () => drawFallback();

  // ===== LISTENERS =====
  [nameInput, wardInput, lgaSelect].forEach(el => {
    if (el) el.addEventListener('input', drawPoster);
  });

  if (generateBtn) generateBtn.addEventListener('click', drawPoster);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadPoster);
  if (shareWaBtn)  shareWaBtn.addEventListener('click', shareViaWhatsApp);

  // ===== TEXT FIT =====
  function fitText(ctx, text, maxWidth, baseSize) {
    let size = baseSize;
    do {
      ctx.font = `600 ${size}px "Playfair Display", serif`;
      size--;
    } while (ctx.measureText(text).width > maxWidth && size > 10);
    return size;
  }

  // ===== DRAW =====
  function drawPoster() {
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    if (!baseImg.complete || baseImg.naturalWidth === 0) {
      drawFallback();
      return;
    }

    // Draw base
    ctx.drawImage(baseImg, 0, 0, W, H);

    // ===== CINEMATIC GRADIENT (REPLACES BLACK STRIP) =====
    const gradient = ctx.createLinearGradient(0, H * 0.75, 0, H);

    gradient.addColorStop(0, "rgba(13, 26, 16, 0)");
    gradient.addColorStop(0.5, "rgba(25, 87, 39, 0.7)");
    gradient.addColorStop(1, "#0d1a10");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, H * 0.72, W, H * 0.28);

    // ===== CONTENT =====
    const rawName = nameInput?.value?.trim() || 'YOUR NAME';
    const ward    = wardInput?.value?.trim();
    const lga     = lgaSelect?.value;
    const locLine = [ward, lga].filter(Boolean).join(' · ');

    const nameLine = rawName.toUpperCase();
    const supportLine = "I SUPPORT #PMM2027";

    const leftX = Math.round(W * 0.055);
    const baseY = H - Math.round(H * 0.08);

    // NAME
    let nameSize = fitText(ctx, nameLine, W * 0.82, Math.round(W * 0.045));
    ctx.font = `600 ${nameSize}px "Playfair Display", serif`;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(nameLine, leftX, baseY - 18);

    // SUPPORT
    ctx.font = `400 ${Math.round(W * 0.024)}px "Inter", sans-serif`;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillText(supportLine, leftX, baseY + 10);

    // LOCATION
    if (locLine) {
      ctx.font = `400 ${Math.round(W * 0.02)}px "Inter", sans-serif`;
      ctx.fillStyle = "rgba(245,196,28,0.95)";
      ctx.fillText(locLine.toUpperCase(), leftX, baseY + 36);
    }

    // OUTPUT
    if (preview) preview.src = canvas.toDataURL('image/jpeg', 0.93);
    if (downloadBtn) downloadBtn.disabled = false;
    if (shareWaBtn) shareWaBtn.disabled = false;
  }

  // ===== FALLBACK =====
  function drawFallback() {
    const W = canvas.width;
    const H = canvas.height;

    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#195727');
    bg.addColorStop(1, '#0d1a10');

    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);
  }

  // ===== DOWNLOAD =====
  function downloadPoster() {
    drawPoster();
    const name = (nameInput?.value?.trim() || 'supporter').replace(/\s+/g, '_');
    const a = document.createElement('a');
    a.download = `PMM2027_${name}.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.93);
    a.click();
  }

  // ===== WHATSAPP =====
  function shareViaWhatsApp() {
    const name = nameInput?.value?.trim() || 'a supporter';

    const msg = encodeURIComponent(
      `${name.toUpperCase()} I SUPPORT AVM PAUL D. MASIYER (RTD.)!\n\n#PMM2027`
    );

    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }
});
