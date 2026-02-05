<script lang="ts">
  import { onMount } from "svelte";
  import { base } from "$app/paths";

  let canvas: HTMLCanvasElement;

  onMount(() => {
    const COUNT = 1100;
    const SPEED = 2.75;

    const ctx = canvas.getContext("2d", { alpha: true })!;

    let w = 0;
    let h = 0;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    let pieces: any[] = [];
    let mx = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener("resize", resize);
    resize();

    window.addEventListener("pointermove", (e) => {
      mx = (e.clientX / w) * 2 - 1;
    });

    const palette = [
      [255, 214, 102],
      [255, 107, 107],
      [116, 185, 255],
      [120, 224, 143],
      [235, 235, 235],
    ];

    const rand = (a: number, b: number) => a + Math.random() * (b - a);
    const pick = (arr: any[]) => arr[(Math.random() * arr.length) | 0];

    const spriteCache = new Map();

    function spriteKey(
      r: number,
      g: number,
      b: number,
      bw: number,
      bh: number,
      blur: number,
    ) {
      return `${r},${g},${b}|${bw}x${bh}|${blur}`;
    }

    function makeSprite(
      r: number,
      g: number,
      b: number,
      bw: number,
      bh: number,
      blur: number,
    ) {
      const pad = blur ? Math.ceil(blur * 3 + 6) : 2;
      const c = document.createElement("canvas");
      c.width = bw + pad * 2;
      c.height = bh + pad * 2;
      const cctx = c.getContext("2d")!;

      cctx.clearRect(0, 0, c.width, c.height);

      if (blur) {
        cctx.shadowColor = `rgb(${r},${g},${b})`;
        cctx.shadowBlur = blur;
      }

      cctx.fillStyle = `rgb(${r},${g},${b})`;
      cctx.fillRect(pad, pad, bw, bh);

      cctx.shadowBlur = 0;

      const dots = Math.max(18, Math.floor((bw * bh) / 9));
      for (let i = 0; i < dots; i++) {
        const x = (pad + Math.random() * bw) | 0;
        const y = (pad + Math.random() * bh) | 0;
        const v = (Math.random() * 60 - 30) | 0;
        const rr = Math.max(0, Math.min(255, r + v));
        const gg = Math.max(0, Math.min(255, g + v));
        const bb = Math.max(0, Math.min(255, b + v));
        cctx.globalAlpha = 0.14 + Math.random() * 0.26;
        cctx.fillStyle = `rgb(${rr},${gg},${bb})`;
        cctx.fillRect(x, y, 1, 1);
      }

      cctx.globalAlpha = 1;

      return { img: c, ox: pad + bw / 2, oy: pad + bh / 2 };
    }

    function getSprite(
      r: number,
      g: number,
      b: number,
      bw: number,
      bh: number,
      blur: number,
    ) {
      const key = spriteKey(r, g, b, bw, bh, blur);
      if (spriteCache.has(key)) return spriteCache.get(key);
      const spr = makeSprite(r, g, b, bw, bh, blur);
      spriteCache.set(key, spr);
      return spr;
    }

    function makePiece(init: boolean) {
      const z = Math.random();
      const layer = z < 0.5 ? 0 : z < 0.85 ? 1 : 2;

      const hero = layer === 2 && Math.random() < 0.35;
      const ultra = layer === 2 && Math.random() < 0.05;
      const floaty = Math.random() < 0.22;

      const insaneFlip = Math.random() < 0.06;
      const fastFlip = !insaneFlip && Math.random() < 0.22;

      const base =
        layer === 0
          ? rand(2, 4)
          : layer === 1
            ? rand(4, 7)
            : ultra
              ? rand(34, 55)
              : hero
                ? rand(18, 28)
                : rand(12, 20);

      const x = rand(-140, w + 140);
      const y = init ? rand(-80, h + 80) : rand(-260, -60);

      const vy =
        layer === 0
          ? rand(0.35, 0.85)
          : layer === 1
            ? rand(0.7, 1.35)
            : rand(1.05, 2.0);

      const vx =
        layer === 0
          ? rand(0.1, 0.28)
          : layer === 1
            ? rand(0.16, 0.42)
            : rand(0.22, 0.62);

      const rgb = pick(palette);
      const r = Math.round(rgb[0] * 0.72);
      const g = Math.round(rgb[1] * 0.72);
      const b = Math.round(rgb[2] * 0.72);

      const aspect = floaty ? rand(1.15, 1.75) : rand(1.0, 1.55);
      const bw = Math.max(2, Math.round(base * rand(0.85, 1.25)));
      const bh = Math.max(3, Math.round(bw * aspect));

      let flipSpeed;
      if (insaneFlip) flipSpeed = rand(0.14, 0.26);
      else if (fastFlip) flipSpeed = rand(0.06, 0.12);
      else flipSpeed = rand(0.02, 0.05);

      const blur = ultra ? 3 : 0;
      const spr = getSprite(r, g, b, bw, bh, blur);

      return {
        x,
        y,
        layer,
        hero,
        ultra,
        floaty,
        spr,
        vx,
        vy,
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.02, 0.02) * (layer + 1),
        sway: rand(0, Math.PI * 2),
        swaySpeed: rand(0.01, 0.02),
        drift: rand(0.2, 0.6),
        flip: rand(0, Math.PI * 2),
        flipSpeed,
      };
    }

    pieces = Array.from({ length: COUNT }, () => makePiece(true));

    let last = performance.now();
    let animationId: number;

    function loop(now: number) {
      const dt = Math.min(0.033, (now - last) / 1000);
      last = now;

      ctx.clearRect(0, 0, w, h);

      const t = now * 0.001;
      const wind = 0.5 + Math.sin(t * 0.35) * 0.18 + mx * 0.3;

      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i];
        const depth = p.layer === 0 ? 0.55 : p.layer === 1 ? 0.85 : 1.0;

        p.sway += p.swaySpeed * 60 * dt * SPEED;
        p.flip += p.flipSpeed * 60 * dt * SPEED;

        const floatDrift = Math.sin(p.sway) * p.drift * (p.floaty ? 1.15 : 1.0);
        const fall = p.floaty ? 0.52 + 0.24 * Math.sin(p.sway * 0.9) : 0.85;

        p.x += (wind * depth + floatDrift + p.vx) * 60 * dt * SPEED;
        p.y += p.vy * fall * 60 * dt * SPEED;
        p.rot += p.vr * 60 * dt * SPEED;

        if (p.x < -300) p.x = w + 300;
        if (p.x > w + 300) p.x = -300;
        if (p.y > h + 340) pieces[i] = makePiece(false);

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(0.06 + 0.94 * Math.abs(Math.sin(p.flip)), 1);
        ctx.globalAlpha =
          p.layer === 0
            ? 0.16
            : p.layer === 1
              ? 0.42
              : p.ultra
                ? 0.95
                : p.hero
                  ? 0.9
                  : 0.72;
        ctx.drawImage(p.spr.img, -p.spr.ox, -p.spr.oy);
        ctx.restore();
      }

      animationId = requestAnimationFrame(loop);
    }

    animationId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  });
</script>

<canvas bind:this={canvas} id="confetti"></canvas>

<div class="container">
  <img src="{base}/cat.webp" alt="Cute cat" class="cat-gif" />
  <p class="arigato">YUHHHHH GRACIAS MI AMOR!!!</p>
  <div class="text-scroll">
    <div class="text-track">
      <!-- First set - 15 items -->
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <!-- Duplicate set for seamless loop - 15 items -->
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
      <span>THANK YOU</span>
    </div>
  </div>
</div>

<style>
  :global(body) {
    background-color: #22c55e;
    margin: 0;
    overflow: hidden;
  }

  #confetti {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    opacity: 0;
    animation: fadeIn 0.8s ease-out 0.2s forwards;
  }

  .container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: 100vw;
    overflow: hidden;
    position: relative;
    z-index: 10;
  }

  .cat-gif {
    position: relative;
    z-index: 20;
    max-width: 300px;
    max-height: 300px;
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    opacity: 0;
    animation: fadeIn 0.8s ease-out 0.3s forwards;
  }

  .arigato {
    position: relative;
    z-index: 20;
    font-family: Georgia, "Times New Roman", Times, serif;
    font-size: 1.2rem;
    font-weight: 600;
    color: #000000;
    margin-top: 1rem;
    opacity: 0;
    animation: fadeIn 0.8s ease-out 0.5s forwards;
  }

  .text-scroll {
    overflow: hidden;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: center;
    opacity: 0;
    animation: fadeIn 0.5s ease-out 0.2s forwards;
  }

  .text-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    animation: scrollDown 10s linear infinite;
  }

  .text-track span {
    font-family: Georgia, "Times New Roman", Times, serif;
    font-size: 5rem;
    font-weight: 800;
    color: rgba(255, 255, 255, 0.6);
    text-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    line-height: 1;
    white-space: nowrap;
    height: 6rem;
    display: flex;
    align-items: center;
  }

  /* 30 items at 6rem each = 180rem total, half = 90rem */
  @keyframes scrollDown {
    0% {
      transform: translateY(-90rem);
    }
    100% {
      transform: translateY(0);
    }
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
</style>
