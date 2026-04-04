/* ============================================================
   PMM 2027 — poster.js (Final Production Build)

   Upgrades:
   - Playfair Display (headline) + Inter (support)
   - 2-line layout (no overflow issues)
   - Auto-scaling for long names
   - Dynamic canvas extension (breathing room)
   - Clean spacing (removed forced tracking)
   - No regressions / UI intact
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

  // ================= FONT LOADING =================
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
      if (baseImg.complete) drawPoster();
    })
    .catch(() => {
      fontsReady = true;
      if (baseImg.complete) drawPoster();
    });

  // ================= BASE IMAGE =================
  const baseImg = new Image();
  baseImg.crossOrigin = 'anonymous';
  baseImg.src = 'assets/img/poster/campaign-poster.jpg';
  baseImg.onload = () => { if (fontsReady) drawPoster(); };

  // ================= LISTENERS =================
  [nameInput, wardInput, lgaSelect].forEach(el => {
    if (el) el.addEventListener('input', drawPoster);
  });

  if (generateBtn) generateBtn.addEventListener('click', drawPoster);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadPoster);
  if (shareWaBtn)  shareWaBtn.addEventListener('click', shareViaWhatsApp);

  // ================= HELPERS =================

  function extendCanvasHeight(baseCanvas, extraHeight) {
    const extended = document.createElement('canvas');
    extended.width = baseCanvas.width;
    extended.height = baseCanvas.height + extraHeight;

    const ctx = extended.getContext('2d');
    ctx.drawImage(baseCanvas, 0, 0);

    const gradient = ctx.createLinearGradient(
      0,
      baseCanvas.height - 120,
      0,
      extended.height
    );

    gradient.addColorStop(0, "rgba(0,0,0,0)");
    gradient.addColorStop(1, "rgba(0,0,0,0.9)");

    ctx.fillStyle = gradient;
    ctx.fillRect(0, baseCanvas.height - 120, extended.width, extraHeight + 120);

    return extended;
  }

  function fitText(ctx, text, maxWidth, baseSize) {
    let size = baseSize;
    do {
      ctx.font = `600 ${size}px "Playfair Display", serif`;
      size--;
    } while (ctx.measureText(text).width > maxWidth && size > 10);
    return size;
  }

  // ================= DRAW =================

  function drawPoster() {
    if (!fontsReady || !baseImg.complete) return;

    const baseCanvas = document.createElement('canvas');
    const baseCtx = baseCanvas.getContext('2d');

    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;

    baseCtx.drawImage(baseImg, 0, 0, baseCanvas.width, baseCanvas.height);

    // Extend canvas for breathing room
    const extraHeight = Math.round(baseCanvas.height * 0.25);
    const finalCanvas = extendCanvasHeight(baseCanvas, extraHeight);
    const finalCtx = finalCanvas.getContext('2d');

    const W = finalCanvas.width;
    const H = finalCanvas.height;

    const rawName = nameInput?.value?.trim() || 'YOUR NAME';
    const ward = wardInput?.value?.trim();
    const lga = lgaSelect?.value;

    const nameLine = rawName.toUpperCase();
    const supportLine = "I SUPPORT #PMM2027";
    const locLine = [ward, lga].filter(Boolean).join(' · ');

    const leftX = Math.round(W * 0.06);
    const baseY = H - Math.round(H * 0.12);

    // ===== NAME =====
    let nameSize = fitText(
      finalCtx,
      nameLine,
      W * 0.85,
      Math.round(W * 0.045)
    );

    finalCtx.font = `600 ${nameSize}px "Playfair Display", serif`;
    finalCtx.fillStyle = "#FFFFFF";
    finalCtx.fillText(nameLine, leftX, baseY - 30);

    // ===== SUPPORT LINE =====
    finalCtx.font = `400 ${Math.round(W * 0.026)}px "Inter", sans-serif`;
    finalCtx.fillStyle = "#FFFFFF";
    finalCtx.fillText(supportLine, leftX, baseY + 10);

    // ===== LOCATION =====
    if (locLine) {
      finalCtx.font = `400 ${Math.round(W * 0.02)}px "Inter", sans-serif`;
      finalCtx.fillStyle = "rgba(245,196,28,0.95)";
      finalCtx.fillText(locLine.toUpperCase(), leftX, baseY + 45);
    }

    // Push to main canvas
    canvas.height = finalCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(finalCanvas, 0, 0);

    // Preview
    if (preview) {
      preview.src = canvas.toDataURL('image/jpeg', 0.93);
    }

    if (downloadBtn) downloadBtn.disabled = false;
    if (shareWaBtn) shareWaBtn.disabled = false;
  }

  // ================= DOWNLOAD =================

  function downloadPoster() {
    drawPoster();
    const name = (nameInput?.value || 'supporter').replace(/\s+/g, '_');
    const a = document.createElement('a');
    a.download = `PMM2027_${name}.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.93);
    a.click();
  }

  // ================= WHATSAPP =================

  function shareViaWhatsApp() {
    const name = nameInput?.value || 'a supporter';
    const ward = wardInput?.value;
    const lga  = lgaSelect?.value;

    const loc = [ward, lga].filter(Boolean).join(', ');

    const msg = encodeURIComponent(
      `🇳🇬 ${name.toUpperCase()} I SUPPORT AVM PAUL D. MASIYER (RTD.)!\n\n` +
      `Mangu/Bokkos · 2027` +
      `${loc ? `\n${loc}` : ''}\n\n` +
      `#PMM2027`
    );

    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }
});
