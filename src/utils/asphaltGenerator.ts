import * as THREE from "three";

export type AsphaltTheme = "fresh" | "wet" | "highway" | "cyber";

/**
 * Procedurally generates high-detail asphalt textures (diffuse, normal/bump, roughness)
 * using HTML5 Canvas so no external image assets are required.
 */
export function createAsphaltTexture(
  theme: AsphaltTheme = "fresh",
  width = 1024,
  height = 1024
): {
  diffuse: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  bumpMap: THREE.CanvasTexture;
} {
  // 1. Diffuse canvas
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;

  // 2. Bump/Roughness canvas
  const bumpCanvas = document.createElement("canvas");
  bumpCanvas.width = width;
  bumpCanvas.height = height;
  const bCtx = bumpCanvas.getContext("2d")!;

  // Palette settings based on theme
  let baseGray = 38; // 0-255
  let aggregateContrast = 22;
  let pebbleFreq = 0.45;
  let wetSheen = 0.15;

  if (theme === "fresh") {
    baseGray = 28; // Deep rich dark asphalt
    aggregateContrast = 18;
  } else if (theme === "wet") {
    baseGray = 20; // Very dark wet tarmac
    aggregateContrast = 14;
    wetSheen = 0.85;
  } else if (theme === "highway") {
    baseGray = 52; // Sun-cured gray highway asphalt
    aggregateContrast = 28;
  } else if (theme === "cyber") {
    baseGray = 18; // Ultra-dark cyber tarmac
    aggregateContrast = 16;
  }

  // Fill base color
  ctx.fillStyle = `rgb(${baseGray}, ${baseGray + 1}, ${baseGray + 2})`;
  ctx.fillRect(0, 0, width, height);

  bCtx.fillStyle = "#808080";
  bCtx.fillRect(0, 0, width, height);

  // Generate micro-aggregate grain & stones
  const imgData = ctx.getImageData(0, 0, width, height);
  const bumpData = bCtx.getImageData(0, 0, width, height);
  const data = imgData.data;
  const bData = bumpData.data;

  // Simple pseudo-random noise generator for deterministic, seamless asphalt
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Micro-sand noise
      const n1 = Math.random() * aggregateContrast - aggregateContrast / 2;
      // Macro pebble noise
      const isPebble = Math.random() < pebbleFreq * 0.08;
      const pebbleShade = isPebble ? (Math.random() * 40 - 15) : 0;

      let r = baseGray + n1 + pebbleShade;
      let g = baseGray + n1 + pebbleShade + 1;
      let b = baseGray + n1 + pebbleShade + 2;

      // Cyber theme subtle blue-cyan speckles
      if (theme === "cyber" && Math.random() < 0.004) {
        r = 14; g = 180; b = 220;
      }

      // Clamp
      r = Math.max(8, Math.min(240, r));
      g = Math.max(8, Math.min(240, g));
      b = Math.max(8, Math.min(240, b));

      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;

      // Bump value
      const bumpVal = Math.max(0, Math.min(255, 128 + n1 * 2 + pebbleShade * 2));
      bData[idx] = bumpVal;
      bData[idx + 1] = bumpVal;
      bData[idx + 2] = bumpVal;
      bData[idx + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  bCtx.putImageData(bumpData, 0, 0);

  // For wet asphalt, add subtle water puddles with smooth specular gradients
  if (theme === "wet") {
    ctx.fillStyle = "rgba(10, 15, 25, 0.4)";
    for (let i = 0; i < 12; i++) {
      const px = Math.random() * width;
      const py = Math.random() * height;
      const pr = 40 + Math.random() * 90;
      const grad = ctx.createRadialGradient(px, py, 5, px, py, pr);
      grad.addColorStop(0, "rgba(8, 12, 18, 0.85)");
      grad.addColorStop(0.7, "rgba(12, 16, 22, 0.4)");
      grad.addColorStop(1, "rgba(20, 20, 20, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Create Three textures
  const diffuse = new THREE.CanvasTexture(canvas);
  diffuse.wrapS = THREE.RepeatWrapping;
  diffuse.wrapT = THREE.RepeatWrapping;
  diffuse.repeat.set(4, 4);

  const bumpMap = new THREE.CanvasTexture(bumpCanvas);
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.RepeatWrapping;
  bumpMap.repeat.set(4, 4);

  const roughnessMap = new THREE.CanvasTexture(bumpCanvas);
  roughnessMap.wrapS = THREE.RepeatWrapping;
  roughnessMap.wrapT = THREE.RepeatWrapping;
  roughnessMap.repeat.set(4, 4);

  return { diffuse, bumpMap, roughnessMap };
}

/**
 * Creates texture for procedural road segments with realistic highway lane markings.
 */
export function createRoadStripTexture(
  theme: AsphaltTheme = "fresh",
  hasDashedCenter = true,
  hasDoubleYellow = false
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d")!;

  // Base asphalt
  const baseColor = theme === "wet" ? "#121418" : theme === "highway" ? "#2a2d32" : theme === "cyber" ? "#0c1017" : "#1a1c22";
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, 512, 1024);

  // Micro grain noise
  for (let i = 0; i < 15000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    const shade = Math.random() > 0.5 ? 255 : 0;
    ctx.fillStyle = `rgba(${shade},${shade},${shade},0.07)`;
    ctx.fillRect(x, y, 1.5, 1.5);
  }

  // Tire wear tracks (darker subtle strips)
  ctx.fillStyle = "rgba(0, 0, 0, 0.18)";
  ctx.fillRect(90, 0, 70, 1024);
  ctx.fillRect(352, 0, 70, 1024);

  // Outer solid boundary lines (white)
  ctx.fillStyle = theme === "cyber" ? "#38bdf8" : "#f1f5f9";
  ctx.fillRect(20, 0, 14, 1024);
  ctx.fillRect(478, 0, 14, 1024);

  // Centerline markings
  if (hasDoubleYellow) {
    ctx.fillStyle = theme === "cyber" ? "#f59e0b" : "#eab308";
    ctx.fillRect(248, 0, 6, 1024);
    ctx.fillRect(258, 0, 6, 1024);
  } else if (hasDashedCenter) {
    ctx.fillStyle = theme === "cyber" ? "#38bdf8" : "#facc15";
    const dashLength = 110;
    const gapLength = 90;
    let y = 0;
    while (y < 1024) {
      ctx.fillRect(250, y, 12, dashLength);
      y += dashLength + gapLength;
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * Creates zebra crosswalk texture for intersections.
 */
export function createCrosswalkTexture(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext("2d")!;

  ctx.fillStyle = "#181a20";
  ctx.fillRect(0, 0, 512, 256);

  // Zebra stripes
  ctx.fillStyle = "#f8fafc";
  const numStripes = 8;
  const stripeWidth = 32;
  const spacing = 512 / numStripes;

  for (let i = 0; i < numStripes; i++) {
    ctx.fillRect(i * spacing + (spacing - stripeWidth) / 2, 20, stripeWidth, 216);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  return texture;
}
