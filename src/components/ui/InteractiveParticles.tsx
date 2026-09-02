"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { cn } from "@/src/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Ashima / Stefan Gustavson 2-D simplex noise (inlined — replaces glslify)
// ─────────────────────────────────────────────────────────────────────────────
const SIMPLEX_2D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i  = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
  m = m*m; m = m*m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
  vec3 g;
  g.x  = a0.x  * x0.x  + h.x  * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Vertex shader — pure radial touch displacement (physical push-away)
// ─────────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */ `
precision highp float;

attribute float pindex;
attribute vec3  position;
attribute vec3  offset;
attribute vec2  uv;
attribute float angle;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uTime;
uniform float uRandom;
uniform float uDepth;
uniform float uSize;
uniform vec2  uTextureSize;
uniform sampler2D uTexture;
uniform sampler2D uTouch;

varying vec2  vPUv;
varying vec2  vUv;
varying float vTouchIntensity;

${SIMPLEX_2D}

float random(float n) {
  return fract(sin(n) * 43758.5453123);
}

void main() {
  vUv = uv;

  vec2 puv = offset.xy / uTextureSize;
  vPUv = puv;

  vec4 colA = texture2D(uTexture, puv);
  float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;

  vec3 displaced = offset;

  // Gentle initial random drift
  displaced.xy += vec2(
    random(pindex) - 0.5,
    random(offset.x + pindex) - 0.5
  ) * uRandom * 0.8;

  // Z depth with gentle drift
  float rndz = random(pindex) + snoise(vec2(pindex * 0.08, uTime * 0.08));
  displaced.z  += rndz * (random(pindex) * 1.8 * uDepth);
  displaced.xy -= uTextureSize * 0.5;

  // Touch displacement — scatter outward around cursor
  float t = texture2D(uTouch, puv).r;
  vTouchIntensity = t;

  displaced.z += t * 24.0 * rndz;
  displaced.x += cos(angle) * t * 22.0 * rndz;
  displaced.y += sin(angle) * t * 22.0 * rndz;

  // Refined, delicate particle point size
  float psize = (snoise(vec2(uTime * 0.35, pindex)) * 0.35 + 1.35);
  psize *= max(grey, 0.35);
  psize *= uSize;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  mvPosition.xyz += position * psize;
  gl_Position = projectionMatrix * mvPosition;
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// Fragment shader — pure tungsten/ivory monochromatic palette (no color shift)
// ─────────────────────────────────────────────────────────────────────────────
const FRAG = /* glsl */ `
precision highp float;

uniform sampler2D uTexture;
uniform vec3 uColor;         // resting tungsten #8A8783
uniform vec3 uColorIvory;    // bright ivory #F2ECE2

varying vec2  vPUv;
varying vec2  vUv;
varying float vTouchIntensity;

void main() {
  vec2 uv  = vUv;
  vec2 puv = vPUv;

  vec4 colA = texture2D(uTexture, puv);
  float grey = colA.r * 0.21 + colA.g * 0.71 + colA.b * 0.07;

  // Soft circular point
  float radius = 0.5;
  float border = 0.45;
  float dist   = radius - distance(uv, vec2(0.5));
  float t      = smoothstep(0.0, border, dist);

  // Subtle vertical fade gradient (fades seamlessly towards top)
  float vertFade = smoothstep(0.0, 0.35, puv.y);
  vertFade = 0.65 + 0.35 * vertFade;

  // Pure tungsten-to-ivory grey mapping — NO burgundy, NO chromatic shift
  vec3 rgb = mix(uColor, uColorIvory, grey);

  // Touch response: alpha brightens subtly on displacement, but hue remains identical
  float touchBlend = clamp(vTouchIntensity * 2.5, 0.0, 1.0);
  float restingAlpha = (0.30 + 0.32 * grey) * vertFade;
  float activeAlpha = 0.88;
  float alpha = t * mix(restingAlpha, activeAlpha, touchBlend);

  gl_FragColor = vec4(rgb, alpha);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// TouchTexture — off-screen accumulator for cursor trail
// ─────────────────────────────────────────────────────────────────────────────
class TouchTexture {
  size = 64;
  maxAge = 120;
  radius: number;
  trail: { x: number; y: number; age: number; force: number }[] = [];
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.Texture;

  constructor(radius: number) {
    this.radius = radius;
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.canvas.height = this.size;
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);
    this.texture = new THREE.Texture(this.canvas);
  }

  private easeOutSine(t: number, b: number, c: number, d: number) {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
  }

  addTouch(x: number, y: number) {
    let force = 0;
    const last = this.trail[this.trail.length - 1];
    if (last) {
      const dx = last.x - x;
      const dy = last.y - y;
      force = Math.min((dx * dx + dy * dy) * 10000, 1);
    }
    this.trail.push({ x, y, age: 0, force });
  }

  update() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.size, this.size);

    for (let i = this.trail.length - 1; i >= 0; i--) {
      this.trail[i].age++;
      if (this.trail[i].age > this.maxAge) this.trail.splice(i, 1);
    }
    for (const point of this.trail) this.drawTouch(point);
    this.texture.needsUpdate = true;
  }

  private drawTouch(point: { x: number; y: number; age: number; force: number }) {
    const pos = { x: point.x * this.size, y: (1 - point.y) * this.size };
    let intensity: number;
    if (point.age < this.maxAge * 0.3) {
      intensity = this.easeOutSine(point.age / (this.maxAge * 0.3), 0, 1, 1);
    } else {
      intensity = this.easeOutSine(1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7), 0, 1, 1);
    }
    intensity *= point.force;

    const radius = this.size * this.radius * intensity;
    const grd = this.ctx.createRadialGradient(pos.x, pos.y, radius * 0.25, pos.x, pos.y, radius);
    grd.addColorStop(0, "rgba(255,255,255,0.2)");
    grd.addColorStop(1, "rgba(0,0,0,0)");
    this.ctx.beginPath();
    this.ctx.fillStyle = grd;
    this.ctx.arc(pos.x, pos.y, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  destroy() {
    this.texture.dispose();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Word → data-URL helper (rasterizes text white-on-black for pixel sampling)
// ─────────────────────────────────────────────────────────────────────────────
function wordToDataURL(
  word: string,
  canvasW = 1200,
  canvasH = 300,
): string {
  const c = document.createElement("canvas");
  c.width  = canvasW;
  c.height = canvasH;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, canvasW, canvasH);
  ctx.fillStyle = "#ffffff";
  ctx.textAlign    = "center";
  ctx.textBaseline = "middle";
  // Refined font size ratio (0.68) prevents ascender/descender clipping at full width
  const fontSize = Math.floor(canvasH * 0.68);
  ctx.font = `900 ${fontSize}px 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillText(word, canvasW / 2, canvasH / 2);
  return c.toDataURL("image/png");
}

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────
export interface InteractiveParticlesProps {
  /** Rasterise this word into a particle cloud (takes priority over `src`). */
  word?: string;
  /** Image URL to sample particles from. Used when `word` is not supplied. */
  src?: string;
  /** Set false to hide the upload control — always false for brand marks. */
  allowUpload?: false | boolean;
  /** Label for the upload control. */
  uploadLabel?: string;
  /** Fired when the user picks a file. */
  onUpload?: (file: File) => void;
  /** Longest edge the source is downscaled to before sampling. Default 1000. */
  maxDimension?: number;
  /** Extra classes for the wrapper div. */
  className?: string;
  /** Background color of the wrapper element. Defaults to transparent. */
  background?: string;
  /** Resting particle tint — tungsten. Default "#8A8783". */
  color?: string;
  /** Brightest-particle tint — ivory. Default "#F2ECE2". */
  colorIvory?: string;
  /** Legacy prop preserved for compatibility. */
  colorActive?: string;
  /** Steady-state particle size multiplier. Default 0.85. */
  size?: number;
  /** Steady-state random spread. Default 1.0. */
  randomness?: number;
  /** Steady-state depth. Default 2.0. */
  depth?: number;
  /** Cursor touch radius (0–1). Default 0.15. */
  touchRadius?: number;
  /** Brightness threshold below which pixels are discarded (0–255). Default 34. */
  threshold?: number;
  /** Optional fixed height of canvas. If omitted, uses 100% of container. */
  height?: number | string;
  style?: React.CSSProperties;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export function InteractiveParticles({
  word,
  src,
  allowUpload = false,
  uploadLabel = "Upload image",
  onUpload,
  maxDimension = 1000,
  className,
  background = "transparent",
  color       = "#8A8783",
  colorIvory  = "#F2ECE2",
  colorActive: _colorActive,
  size        = 0.85,
  randomness  = 1.0,
  depth       = 2.0,
  touchRadius = 0.15,
  threshold   = 34,
  height,
  style,
}: InteractiveParticlesProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const fileInputRef  = useRef<HTMLInputElement>(null);
  const objectUrlRef  = useRef<string | null>(null);

  const [uploadedSrc, setUploadedSrc] = useState<string | null>(null);
  const [wordSrc, setWordSrc]         = useState<string | null>(null);

  // Generate word image immediately and re-sample once fonts ready
  useEffect(() => {
    if (!word) return;
    setWordSrc(wordToDataURL(word));
    if (document.fonts?.ready) {
      document.fonts.ready.then(() => {
        setWordSrc(wordToDataURL(word));
      });
    }
  }, [word]);

  const effectiveSrc = uploadedSrc ?? wordSrc ?? src ?? null;

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setUploadedSrc(url);
    onUpload?.(file);
  };

  useEffect(() => () => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
  }, []);

  // ── Three.js effect ────────────────────────────────────────────────────────
  useEffect(() => {
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    if (!container || !canvas || !effectiveSrc) return;

    let disposed = false;

    const getSize = () => ({
      width:  container.clientWidth  || 1,
      height: container.clientHeight || 1,
    });
    let view = getSize();

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, view.width / view.height, 1, 10000);
    camera.position.z = 300;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(view.width, view.height);
    renderer.setClearColor(0x000000, 0);

    let fovHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
    const clock   = new THREE.Clock(true);
    const root3D  = new THREE.Object3D();
    scene.add(root3D);

    const raycaster = new THREE.Raycaster();
    const mouseNDC  = new THREE.Vector2();
    let rect = canvas.getBoundingClientRect();

    let object3D: THREE.Mesh | null = null;
    let hitArea:  THREE.Mesh | null = null;
    let touch: TouchTexture  | null = null;
    let uniforms: Record<string, THREE.IUniform> | null = null;
    let imgWidth = 0, imgHeight = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (!hitArea || !touch) return;
      mouseNDC.x =  ((e.clientX - rect.left) / rect.width)  * 2 - 1;
      mouseNDC.y = -((e.clientY - rect.top)  / rect.height) * 2 + 1;
      raycaster.setFromCamera(mouseNDC, camera);
      const hits = raycaster.intersectObject(hitArea);
      if (hits.length > 0 && hits[0].uv) touch.addTouch(hits[0].uv.x, hits[0].uv.y);
    };
    canvas.addEventListener("pointermove", onPointerMove);

    const loader = new THREE.TextureLoader();
    if (!effectiveSrc.startsWith("data:")) {
      loader.setCrossOrigin("anonymous");
    }
    loader.load(effectiveSrc, (texture) => {
      if (disposed) { texture.dispose(); return; }
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;

      const image = texture.image as HTMLImageElement;
      const longest    = Math.max(image.width, image.height);
      const scaleDown  = longest > maxDimension ? maxDimension / longest : 1;
      imgWidth  = Math.max(1, Math.round(image.width  * scaleDown));
      imgHeight = Math.max(1, Math.round(image.height * scaleDown));
      const numPoints = imgWidth * imgHeight;

      const readCanvas = document.createElement("canvas");
      readCanvas.width  = imgWidth;
      readCanvas.height = imgHeight;
      const rctx = readCanvas.getContext("2d")!;
      rctx.scale(1, -1);
      rctx.drawImage(image, 0, 0, imgWidth, imgHeight * -1);
      const colors = Float32Array.from(rctx.getImageData(0, 0, imgWidth, imgHeight).data);

      let numVisible = 0;
      for (let i = 0; i < numPoints; i++) if (colors[i * 4] > threshold) numVisible++;

      uniforms = {
        uTime:        { value: 0 },
        uRandom:      { value: 1.0 },
        uDepth:       { value: 2.0 },
        uSize:        { value: 0.0 },
        uTextureSize: { value: new THREE.Vector2(imgWidth, imgHeight) },
        uTexture:     { value: texture },
        uTouch:       { value: null },
        uColor:       { value: new THREE.Color(color) },
        uColorIvory:  { value: new THREE.Color(colorIvory) },
      };

      const material = new THREE.RawShaderMaterial({
        uniforms,
        vertexShader:   VERT,
        fragmentShader: FRAG,
        depthTest:   false,
        transparent: true,
      });

      const geometry = new THREE.InstancedBufferGeometry();

      const positions = new THREE.BufferAttribute(new Float32Array(4 * 3), 3);
      positions.setXYZ(0, -0.5,  0.5, 0);
      positions.setXYZ(1,  0.5,  0.5, 0);
      positions.setXYZ(2, -0.5, -0.5, 0);
      positions.setXYZ(3,  0.5, -0.5, 0);
      geometry.setAttribute("position", positions);

      const uvs = new THREE.BufferAttribute(new Float32Array(4 * 2), 2);
      uvs.setXY(0, 0, 0); uvs.setXY(1, 1, 0);
      uvs.setXY(2, 0, 1); uvs.setXY(3, 1, 1);
      geometry.setAttribute("uv", uvs);
      geometry.setIndex(new THREE.BufferAttribute(new Uint16Array([0,2,1,2,3,1]), 1));

      const indices = new Uint16Array(numVisible);
      const offsets = new Float32Array(numVisible * 3);
      const angles  = new Float32Array(numVisible);

      for (let i = 0, j = 0; i < numPoints; i++) {
        if (colors[i * 4] <= threshold) continue;
        offsets[j * 3]     = i % imgWidth;
        offsets[j * 3 + 1] = Math.floor(i / imgWidth);
        indices[j] = i;
        angles[j]  = Math.random() * Math.PI;
        j++;
      }
      geometry.setAttribute("pindex", new THREE.InstancedBufferAttribute(indices, 1, false));
      geometry.setAttribute("offset", new THREE.InstancedBufferAttribute(offsets, 3, false));
      geometry.setAttribute("angle",  new THREE.InstancedBufferAttribute(angles,  1, false));

      object3D = new THREE.Mesh(geometry, material);
      root3D.add(object3D);

      const hitGeo = new THREE.PlaneGeometry(imgWidth, imgHeight, 1, 1);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false, depthTest: false });
      hitArea = new THREE.Mesh(hitGeo, hitMat);
      root3D.add(hitArea);

      touch = new TouchTexture(touchRadius);
      uniforms.uTouch.value = touch.texture;

      applyScale();

      // GSAP settle-in
      gsap.fromTo(uniforms.uSize,   { value: 0.3 }, { value: size,       duration: 1.2, ease: "power2.out" });
      gsap.to(    uniforms.uRandom,                  { value: randomness, duration: 1.2, ease: "power2.out" });
      gsap.fromTo(uniforms.uDepth,  { value: 25.0 }, { value: depth,      duration: 1.5, ease: "power3.out" });
    });

    const applyScale = () => {
      if (!object3D || !hitArea || !imgHeight || !imgWidth) return;
      const fovWidth = fovHeight * camera.aspect;

      // Full-bleed wordmark scaling: stretches near edge-to-edge (fovWidth * 0.98)
      const scaleByWidth = (fovWidth * 0.98) / imgWidth;
      const scaleByHeight = (fovHeight * 0.90) / imgHeight;
      const s = Math.min(scaleByWidth, scaleByHeight);

      object3D.scale.set(s, s, 1);
      hitArea.scale.set(s, s, 1);

      // Align bottom of wordmark to touch the bottom floor of the canvas
      const posY = - (fovHeight * 0.5) + (imgHeight * s * 0.5);
      object3D.position.set(0, posY, 0);
      hitArea.position.set(0, posY, 0);
    };

    const applySize = () => {
      view = getSize();
      camera.aspect = view.width / view.height;
      camera.updateProjectionMatrix();
      fovHeight = 2 * Math.tan((camera.fov * Math.PI) / 180 / 2) * camera.position.z;
      renderer.setSize(view.width, view.height);
      rect = canvas.getBoundingClientRect();
      applyScale();
    };
    const ro = new ResizeObserver(applySize);
    ro.observe(container);
    window.addEventListener("resize", applySize);

    renderer.setAnimationLoop(() => {
      const delta = clock.getDelta();
      if (touch)    touch.update();
      if (uniforms) uniforms.uTime.value += delta;
      renderer.render(scene, camera);
    });

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      canvas.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", applySize);
      ro.disconnect();
      if (uniforms) gsap.killTweensOf([uniforms.uSize, uniforms.uRandom, uniforms.uDepth]);
      if (object3D) { object3D.geometry.dispose(); (object3D.material as THREE.Material).dispose(); }
      if (hitArea)  { hitArea.geometry.dispose();  (hitArea.material  as THREE.Material).dispose(); }
      if (touch)    touch.destroy();
      renderer.dispose();
    };
  }, [effectiveSrc, color, colorIvory, size, randomness, depth, touchRadius, threshold, maxDimension]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ height: height ?? "100%", background, ...style }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />

      {allowUpload && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { handleFile(e.target.files?.[0]); e.target.value = ""; }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="group absolute right-4 top-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/60 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10 hover:text-white/90"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            {uploadLabel}
          </button>
        </>
      )}
    </div>
  );
}

export default InteractiveParticles;
