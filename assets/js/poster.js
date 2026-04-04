/* ============================================================
   PMM 2027 — Poster Generator (Cinematic Final Version)

   Features:
   - Playfair Display + Inter typography
   - Cinematic green gradient extension (no harsh black block)
   - Reduced, realistic spacing
   - Integrated text (feels part of poster)
   - Auto-scaling for long names
   - Stable UI (no regressions)
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
      if (baseImg.complete) drawPoster();
    })
    .catch(() => {
      fontsReady = true;
      if (baseImg.complete) drawPoster();
    });

  // ===== BASE IMAGE =====
  const baseImg = new Image();
  baseImg.crossOrigin = 'anonymous';
  baseImg.src = 'assets/img/poster/campaign-poster.jpg';
  baseImg.onload = () => { if (fontsReady) drawPoster(); };

  // ===== LISTENERS =====
  [nameInput, wardInput, lgaSelect].forEach(el => {
    if (el) el.addEventListener('input', drawPoster);
  });

  if (generateBtn) generateBtn.addEventListener('click', drawPoster);
  if (downloadBtn) downloadBtn.addEventListener('click', downloadPoster);
  if (shareWaBtn)  shareWaBtn.addEventListener('click', shareViaWhatsApp);

  // ===== AUTO TEXT FIT =====
  function fitText(ctx, text, maxWidth, baseSize) {
    let size = baseSize;
    do {
      ctx.font = `600 ${size}px "Playfair Display", serif`;
      size--;
    } while (ctx.measureText(text).width > maxWidth && size > 10);
    return size;
  }

  // ===== DRAW POSTER =====
  function drawPoster() {
    if (!fontsReady || !baseImg.complete) return;

    const baseCanvas = document.createElement('canvas');
    const baseCtx = baseCanvas.getContext('2d');

    baseCanvas.width = canvas.width;
    baseCanvas.height = canvas.height;

    baseCtx.drawImage(baseImg, 0, 0, baseCanvas.width, baseCanvas.height);

    // 🔥 CINEMATIC EXTENSION (REDUCED HEIGHT)
    const extraHeight = Math.round(baseCanvas.height * 0.14);

    const finalCanvas = document.createElement('canvas');
    finalCanvas.width = baseCanvas.width;
    finalCanvas.height = baseCanvas.height + extraHeight;

    const ctxFinal = finalCanvas.getContext('2d');

    ctxFinal.drawImage(baseCanvas, 0, 0);

    const W = finalCanvas.width;
    const H = finalCanvas.height;

    // ===== GRADIENT BLEND (MATCH POSTER GREEN) =====
    const gradient = ctxFinal.createLinearGradient(
      0,
      baseCanvas.height - 80,
      0,
      finalCanvas.height
    );

    gradient.addColorStop(0, "rgba(13, 26, 16, 0)");
    gradient.addColorStop(0.4, "rgba(25, 87, 39, 0.85)");
    gradient.addColorStop(1, "#0d1a10");

    ctxFinal.fillStyle = gradient;
    ctxFinal.fillRect(0, baseCanvas.height - 80, W, extraHeight + 80);

    // ===== TEXT =====
    const rawName = nameInput?.value?.trim() || "YOUR NAME";
    const nameLine = rawName.toUpperCase();
    const supportLine = "I SUPPORT #PMM2027";

    const leftX = Math.round(W * 0.06);
    const baseY = baseCanvas.height + Math.round(extraHeight * 0.55);

    // NAME
    let nameSize = fitText(ctxFinal, nameLine, W * 0.82, Math.round(W * 0.045));
    ctxFinal.font = `600 ${nameSize}px "Playfair Display", serif`;
    ctxFinal.fillStyle = "#FFFFFF";
    ctxFinal.fillText(nameLine, leftX, baseY - 12);

    // SUPPORT
    ctxFinal.font = `400 ${Math.round(W * 0.025)}px "Inter", sans-serif`;
    ctxFinal.fillStyle = "rgba(255,255,255,0.85)";
    ctxFinal.fillText(supportLine, leftX, baseY + 18);

    // LOCATION
    const ward = wardInput?.value?.trim();
    const lga = lgaSelect?.value;
    const locLine = [ward, lga].filter(Boolean).join(" · ");

    if (locLine) {
      ctxFinal.font = `400 ${Math.round(W * 0.02)}px "Inter", sans-serif`;
      ctxFinal.fillStyle = "rgba(245,196,28,0.95)";
      ctxFinal.fillText(locLine.toUpperCase(), leftX, baseY + 42);
    }

    // ===== OUTPUT =====
    canvas.height = finalCanvas.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(finalCanvas, 0, 0);

    if (preview) {
      preview.src = canvas.toDataURL('image/jpeg', 0.93);
    }

    if (downloadBtn) downloadBtn.disabled = false;
    if (shareWaBtn) shareWaBtn.disabled = false;
  }

  // ===== DOWNLOAD =====
  function downloadPoster() {
    drawPoster();
    const name = (nameInput?.value || 'supporter').replace(/\s+/g, '_');
    const a = document.createElement('a');
    a.download = `PMM2027_${name}.jpg`;
    a.href = canvas.toDataURL('image/jpeg', 0.93);
    a.click();
  }

  // ===== WHATSAPP =====
  function shareViaWhatsApp() {
    const name = nameInput?.value || 'a supporter';
    const msg = encodeURIComponent(
      `${name.toUpperCase()} I SUPPORT PMM2027`
    );
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }
});
