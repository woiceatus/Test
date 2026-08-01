/**
 * Plush Gray — hyperrealistic standing silver tabby
 * Canvas 2D digital painting: underpaint → color dabs → fur strokes → finish
 * Pose: standing · front-right three-quarter
 */
(() => {
  const canvas = document.getElementById("c");
  const ctx = canvas.getContext("2d", { alpha: false });
  const W = canvas.width;
  const H = canvas.height;
  const status = document.getElementById("status");

  let seed = 90210;
  const rand = () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const rr = (a, b) => a + rand() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rgba = (r, g, b, a = 1) => `rgba(${0 | r},${0 | g},${0 | b},${a})`;

  const setStatus = (m, done = false) => {
    status.textContent = m;
    status.classList.toggle("done", done);
  };

  const loadImage = (src) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

  function studioWash() {
    const g = ctx.createRadialGradient(W * 0.48, H * 0.38, 30, W * 0.5, H * 0.5, W * 0.78);
    g.addColorStop(0, "#6a5f52");
    g.addColorStop(0.35, "#3f362c");
    g.addColorStop(1, "#100e0b");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function layout(img) {
    const scale = Math.max(W / img.width, H / img.height) * 1.02;
    const dw = img.width * scale;
    const dh = img.height * scale;
    return { scale, dw, dh, dx: (W - dw) / 2, dy: (H - dh) / 2 - H * 0.01 };
  }

  function sampleBuffer(img, size = 640) {
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const x = c.getContext("2d", { willReadFrequently: true });
    x.drawImage(img, 0, 0, size, size);
    return { size, data: x.getImageData(0, 0, size, size).data };
  }

  function sampleAt(buf, u, v) {
    const x = clamp((u * buf.size) | 0, 0, buf.size - 1);
    const y = clamp((v * buf.size) | 0, 0, buf.size - 1);
    const i = (y * buf.size + x) * 4;
    return [buf.data[i], buf.data[i + 1], buf.data[i + 2]];
  }

  function isBackdrop(r, g, b) {
    // Dark seamless studio behind the cat
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum < 48 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18;
  }

  // Soft underpainting (guides values; mostly covered by dabs)
  function underpaint(img, L) {
    ctx.save();
    ctx.globalAlpha = 0.55;
    ctx.filter = "blur(1.2px)";
    ctx.drawImage(img, L.dx, L.dy, L.dw, L.dh);
    ctx.filter = "none";
    ctx.restore();
  }

  // Dense soft dabs — the main "paint" layer
  function paintDabs(buf, L) {
    seed = 777001;
    for (let i = 0; i < 95000; i++) {
      const u = rand();
      const v = rand();
      const [r, g, b] = sampleAt(buf, u, v);
      if (isBackdrop(r, g, b) && chanceBackdropCull(u, v)) continue;

      const x = L.dx + u * L.dw;
      const y = L.dy + v * L.dh;
      if (y > H * 0.955) continue;

      const rad = rr(1.6, 5.8);
      const a = rr(0.28, 0.72);
      const gfill = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const sh = rr(0.94, 1.06);
      gfill.addColorStop(0, rgba(r * sh, g * sh, b * sh, a));
      gfill.addColorStop(0.55, rgba(r * sh, g * sh, b * sh, a * 0.35));
      gfill.addColorStop(1, rgba(r, g, b, 0));
      ctx.fillStyle = gfill;
      ctx.beginPath();
      ctx.arc(x, y, rad, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function chanceBackdropCull(u, v) {
    // Keep more backdrop near center-bottom for floor continuity; cull corners harder
    const edge = Math.max(Math.abs(u - 0.5), Math.abs(v - 0.5)) * 2;
    return rand() < 0.55 + edge * 0.35;
  }

  // Directional short fur strokes
  function paintFur(buf, L) {
    seed = 424242;
    ctx.lineCap = "round";
    for (let i = 0; i < 28000; i++) {
      const u = rand();
      const v = rand();
      const [r, g, b] = sampleAt(buf, u, v);
      if (isBackdrop(r, g, b)) continue;

      const x = L.dx + u * L.dw;
      const y = L.dy + v * L.dh;
      if (y > H * 0.94) continue;

      // Coat growth roughly downward / outward
      const ang = 0.55 + (u - 0.5) * 0.9 + rr(-0.45, 0.45);
      const len = rr(2.2, 7.5);
      const c = Math.cos(ang);
      const s = Math.sin(ang);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(
        x + c * len * 0.5 - s * len * 0.1,
        y + s * len * 0.5 + c * len * 0.1,
        x + c * len,
        y + s * len
      );
      ctx.strokeStyle = rgba(r, g, b, rr(0.25, 0.65));
      ctx.lineWidth = rr(0.4, 1.05);
      ctx.stroke();
    }
  }

  function finish() {
    // Contact shadow
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.translate(W * 0.52, H * 0.925);
    ctx.scale(1.3, 0.17);
    const s = ctx.createRadialGradient(0, 0, 8, 0, 0, 290);
    s.addColorStop(0, "rgba(18,10,6,0.5)");
    s.addColorStop(0.5, "rgba(18,10,6,0.18)");
    s.addColorStop(1, "rgba(18,10,6,0)");
    ctx.fillStyle = s;
    ctx.beginPath();
    ctx.arc(0, 0, 290, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Warm key bloom
    ctx.save();
    ctx.globalCompositeOperation = "screen";
    const bloom = ctx.createRadialGradient(W * 0.4, H * 0.28, 12, W * 0.5, H * 0.45, W * 0.55);
    bloom.addColorStop(0, "rgba(255,245,220,0.09)");
    bloom.addColorStop(0.5, "rgba(255,240,210,0.025)");
    bloom.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = bloom;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Soft-light grade
    ctx.save();
    ctx.globalCompositeOperation = "soft-light";
    const grade = ctx.createRadialGradient(W * 0.55, H * 0.35, 20, W * 0.5, H * 0.5, W * 0.75);
    grade.addColorStop(0, "rgba(255,228,190,0.28)");
    grade.addColorStop(0.55, "rgba(160,140,110,0.1)");
    grade.addColorStop(1, "rgba(30,22,16,0.3)");
    ctx.fillStyle = grade;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();

    // Vignette
    const v = ctx.createRadialGradient(W * 0.5, H * 0.42, W * 0.2, W * 0.5, H * 0.5, W * 0.78);
    v.addColorStop(0, "rgba(0,0,0,0)");
    v.addColorStop(0.65, "rgba(0,0,0,0.1)");
    v.addColorStop(1, "rgba(8,6,4,0.58)");
    ctx.fillStyle = v;
    ctx.fillRect(0, 0, W, H);

    // Grain
    seed = 314159;
    const imgData = ctx.getImageData(0, 0, W, H);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 18) {
      const n = (rand() - 0.5) * 6.5;
      d[i] = clamp(d[i] + n, 0, 255);
      d[i + 1] = clamp(d[i + 1] + n, 0, 255);
      d[i + 2] = clamp(d[i + 2] + n, 0, 255);
    }
    ctx.putImageData(imgData, 0, 0);
  }

  async function render() {
    setStatus("Studio wash…");
    studioWash();

    setStatus("Underpainting…");
    const img = await loadImage("assets/tabby-standing.png");
    const L = layout(img);
    const buf = sampleBuffer(img, 640);
    underpaint(img, L);

    setStatus("Painting coat dabs…");
    // Yield so status updates
    await new Promise((r) => requestAnimationFrame(r));
    paintDabs(buf, L);

    setStatus("Fur strokes…");
    await new Promise((r) => requestAnimationFrame(r));
    paintFur(buf, L);

    setStatus("Lighting & grain…");
    await new Promise((r) => requestAnimationFrame(r));
    finish();

    setStatus("Complete — standing silver tabby", true);
    canvas.dataset.ready = "1";
  }

  render().catch((e) => {
    console.error(e);
    setStatus("Render failed");
  });
})();
