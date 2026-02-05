<script lang="ts">
  import { onMount, tick } from "svelte";
  import { repel } from "$lib/repel.svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";

  // Mouse position
  let mouse = $state({ x: 0, y: 0 });

  // The red "No" box element (repelling)
  let noBox: HTMLElement;

  // The green "Yes" box element (static)
  let yesBox: HTMLElement;

  // Transition state
  let isTransitioning = $state(false);
  let transitionStyle = $state("");

  // Hover state for the No box
  let isNoBoxHovered = $state(false);

  // Home position (managed by layout logic below)
  let homeX = $state(0);
  let homeY = $state(0);

  // Gap between the two boxes
  const boxGap = 40;

  // Layout logic to center elements
  function updateLayout() {
    if (noBox && yesBox) {
      const totalWidth = yesBox.offsetWidth + boxGap + noBox.offsetWidth;
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      // Position Yes box
      const yesLeft = centerX - totalWidth / 2;
      const yesTop = centerY - yesBox.offsetHeight / 2;
      yesBox.style.left = `${yesLeft}px`;
      yesBox.style.top = `${yesTop}px`;

      // Calculate Home position for No box
      const newHomeX = yesLeft + yesBox.offsetWidth + boxGap;
      const newHomeY = centerY - noBox.offsetHeight / 2;

      // Update state (will trigger action update)
      homeX = newHomeX;
      homeY = newHomeY;

      // Set initial position of No box
      noBox.style.left = `${newHomeX}px`;
      noBox.style.top = `${newHomeY}px`;
    }
  }

  onMount(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);
    return () => window.removeEventListener("resize", updateLayout);
  });

  function handleMouseMove(e: MouseEvent) {
    mouse = { x: e.clientX, y: e.clientY };
  }

  async function handleYesClick() {
    if (isTransitioning) return;
    isTransitioning = true;

    // Get click position for ripple
    const rect = yesBox.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Set ripple position
    transitionStyle = `
      left: ${centerX}px;
      top: ${centerY}px;
    `;

    await tick();

    // Wait for ripple animation to complete then navigate
    setTimeout(() => {
      // Set body background to green before navigation to prevent flash
      document.body.style.backgroundColor = "#22c55e";
      goto(`${base}/success`);
    }, 700);
  }
</script>

<svelte:window on:mousemove={handleMouseMove} />

<div class="container">
  <h1 class="title">Will you be my <span class="fancy">valentines</span>?</h1>

  <button
    class="box yes-box"
    bind:this={yesBox}
    onclick={handleYesClick}
    style:opacity={isTransitioning ? 0 : 1}
  >
    Yes
  </button>

  <div
    class="box no-box"
    bind:this={noBox}
    role="button"
    tabindex="0"
    use:repel={() => ({
      x: mouse.x,
      y: mouse.y,
      homeX,
      homeY,
      isHovering: isNoBoxHovered,
    })}
    onmouseenter={() => (isNoBoxHovered = true)}
    onmouseleave={() => (isNoBoxHovered = false)}
  >
    No
  </div>

  {#if isTransitioning}
    <div class="transition-overlay" style={transitionStyle}></div>
  {/if}
</div>

<style>
  @font-face {
    font-family: "Valentine Coolday";
    src: url("/fonts/valentine-coolday/Valentine Coolday - Demo.otf")
      format("opentype");
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  :global(body) {
    margin: 0;
    padding: 0;
    background: #f1dfdf;
    min-height: 100vh;
    font-family: Georgia, "Times New Roman", Times, serif;
    font-weight: 700;
    overflow: hidden;
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 9rem;
    min-height: 9vh;
  }

  .title {
    font-size: 3rem;
    font-weight: 700;
    color: #000000;
    margin-bottom: 0.5rem;
    position: relative;
    z-index: 10;
    text-align: center;
  }

  .fancy {
    font-family: "Valentine Coolday", cursive;
    font-size: 4.5rem;
    font-weight: 400;
    color: #e91e63;
  }

  .subtitle {
    color: #666666;
    font-size: 1.2rem;
    margin-bottom: 3rem;
    position: relative;
    z-index: 10;
  }

  .box {
    position: fixed;
    padding: 0.8rem 1.5rem;
    border: none;
    border-radius: 8px;
    color: #ffffff;
    font-size: 1rem;
    font-weight: 600;
    user-select: none;
    z-index: 5;
    white-space: nowrap;
    width: 80px;
    text-align: center;
    box-sizing: border-box;
  }

  .yes-box {
    background: #22c55e;
    cursor: pointer;
    font-family: Georgia, "Times New Roman", Times, serif;
    transition:
      transform 0.1s ease,
      box-shadow 0.1s ease,
      opacity 0.2s ease;
  }

  .yes-box:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.4);
  }

  .yes-box:active {
    transform: scale(0.95);
  }

  .no-box {
    background: #ff0000;
    cursor: default;
    will-change: transform;
  }

  .transition-overlay {
    position: fixed;
    z-index: 100;
    pointer-events: none;
    width: 100px;
    height: 100px;
    background: #22c55e;
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(0);
    animation: ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }

  @keyframes ripple {
    0% {
      transform: translate(-50%, -50%) scale(0);
      opacity: 1;
    }
    100% {
      transform: translate(-50%, -50%) scale(50);
      opacity: 1;
    }
  }
</style>
