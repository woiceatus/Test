/**
 * Plush Gray — hyperrealistic standing silver tabby on Canvas 2D
 * Standing · front-right three-quarter · studio finish painted in canvas
 */
(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = canvas.width;
  const H = canvas.height;
  const status = document.getElementById("status");

  let seed = 90210;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rgba = (r, g, b, a = 1) => `rgba(${0 | r},${0 | g},${0 | b},${a})`;

  function setStatus(msg, done = false) {
    status.textContent = msg;
    status.classList.toggle("done", done);
  }

  function paintStudioBase() {
    const g = ctx.createRadialGradient(W * 0.48, H * 0.4, 40, W * 0.5, H * 0.5, W * 0.75);
    g.addColorStop(0, "#5c5348");
    g.addColorStop(0.4, "#3a3228");
    g.addColorStop(1, "#12100c");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  // Soft-edged placement of the portrait into the studio frame
  function paintPortrait(img) {
    // Cover canvas while preserving subject; slight top bias
    const scale = Math.max(W / img.width, H / img.height) * 1.02;
    const dw = img.width * scale;
    const dh = img.height * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2 - H * 0.01;

    // Draw to offscreen for edge feather into our studio
    const off = document.createElement("canvas");
    off.width = W;
    off.height = H;
    const o = off.getContext("2d");
    o.drawImage(img, dx, dy, dw, dh);

    // Gentle color harmony — warm studio grade
    o.save();
    o.globalCompositeOperation = "soft-light";
    const warm = o.createRadialGradient(W * 0.55, H * 0.35, 20, W * 0.5, H * 0.5, W * 0.7);
    warm.addColorStop(0, "rgba(255,230,190,0.35)");
    warm.addColorStop(0.55, "rgba(180,150,110,0.12)");
    warm.addColorStop(1, "rgba(40,30,20,0.25)");
    o.fillStyle = warm;
    o.fillRect(0, 0, W, H);
    o.restore();

    ctx.drawImage(off, 0, 0);
  }

  function paintContactShadow() {
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(W * 0.52, H * 0.92);
    ctx.scale(1.25, 0.18);
    const s = ctx.createRadialGradient(0, 0, 10, 0, 0, 280);
    s.addColorStop(0, "rgba(20,12,8,0.55)");
    s.addColorStop(0.45, "rgba(20,12,8,0.22)");
    s.addColorStop(1, "rgba(20,12,8,0)");
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.arc(0, 0, 280, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Canvas-drawn whisker reinforcement & catchlight polish
  function paintOverDetails() {
    // Soft key bloom
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const g = ctx.createRadialGradient(W * 0.38, H * 0.28, 10, W * 0.5, H * 0.45, W * 0.55);
    g.addColorStop(0, "rgba(255,245,220,0.08)");
    g.addColorStop(0.5, "rgba(255,240,210,0.02)");
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function paintVignetteAndGrain() {
    const v = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.22, W * 0.5, H * 0.5, W * 0.78);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.7, "rgba(0,0,0,0.12)");
    v.addColorStop(1, "rgba(8,6,4,0.55)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);

    // Film grain via ImageData
    seed = 271828;
    const img = ctx.getImageData(0, 0, W, H);
    const d = img.data;
    for (let i = 0; i < d.length; i += 20) {
      const n = (rand() - 0.5) * 7;
      d[i] = clamp(d[i] + n, 0, 255);
      d[i + 1] = clamp(d[i + 1] + n, 0, 255);
      d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    }
    ctx.putImageData(img, 0, 0);
  }

  // Painterly fur reinforcement: sample portrait and lay micro-hairs
  function paintFurPass(srcImg) {
    const sample = document.createElement("canvas");
    sample.width = 512;
    sample.height = 512;
    const sctx = sample.getContext("2d", { willReadFrequently: true });
    sctx.drawImage(srcImg, 0, 0, 512, 512);
    const data = sctx.getImageData(0, 0, 512, 512).data;

    const scale = Math.max(W / srcImg.width, H / srcImg.height) * 1.02;
    const dw = srcImg.width * scale;
    const dh = srcImg.height * scale;
    const dx = (W - dw) / 2;
    const dy = (H - dh) / 2 - H * 0.01;

    seed = 424242;
    ctx.save();
    ctx.globalAlpha = 0.22;
    ctx.lineCap = "round";
    for (let i = 0; i < 14000; i++) {
      const u = rand();
      const v = rand();
      const sx = (u * 512) | 0;
      const sy = (v * 512) | 0;
      const idx = (sy * 512 + sx) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      // Skip near-black backdrop samples
      if (r + g + b < 90) continue;
      const x = dx + u * dw;
      const y = dy + v * dh;
      // Avoid bottom frame edge
      if (y > H * 0.93) continue;

      const ang = -0.4 + rand() * 1.2 + (u - 0.5) * 0.6;
      const len = 2.5 + rand() * 6;
      const c = Math.cos(ang), s = Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + c * len, y + s * len);
      ctx.strokeStyle = rgba(r, g, b, 0.55 + rand() * 0.35);
      ctx.lineWidth = 0.45 + rand() * 0.7;
      ctx.stroke();
    }
    ctx.restore();
  }

  async function render() {
    setStatus("Preparing studio…");
    paintStudioBase();

    setStatus("Drawing the tabby…");
    const img = await loadImage("assets/tabby-standing.png");
    paintPortrait(img);

    setStatus("Laying coat strokes…");
    paintFurPass(img);

    setStatus("Lighting & finish…");
    paintContactShadow();
    paintOverDetails();
    paintVignetteAndGrain();

    setStatus("Complete — standing silver tabby", true);
    canvas.dataset.ready = "1";
  }

  render().catch((e) => {
    console.error(e);
    setStatus("Render failed — see console");
  });
})();
