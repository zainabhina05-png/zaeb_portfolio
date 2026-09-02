import * as THREE from "three";

// Shared cel-shading gradient maps
let threeToneMap: THREE.DataTexture | null = null;
let fourToneMap: THREE.DataTexture | null = null;
let twoToneMap: THREE.DataTexture | null = null;

/**
 * Creates a discrete stepped luminance ramp texture for authentic Studio Ghibli cel shading.
 */
export function getToonGradientMap(steps: 2 | 3 | 4 = 3): THREE.DataTexture {
  if (steps === 3 && threeToneMap) return threeToneMap;
  if (steps === 4 && fourToneMap) return fourToneMap;
  if (steps === 2 && twoToneMap) return twoToneMap;

  // Custom step levels for warm anime lighting
  let levels: number[];
  if (steps === 2) {
    levels = [110, 255];
  } else if (steps === 4) {
    levels = [60, 130, 200, 255];
  } else {
    levels = [80, 175, 255];
  }

  const data = new Uint8Array(levels.length);
  for (let i = 0; i < levels.length; i++) {
    data[i] = levels[i];
  }

  const texture = new THREE.DataTexture(data, levels.length, 1, THREE.RedFormat);
  texture.minFilter = THREE.NearestFilter;
  texture.magFilter = THREE.NearestFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  if (steps === 2) twoToneMap = texture;
  else if (steps === 4) fourToneMap = texture;
  else threeToneMap = texture;

  return texture;
}

/**
 * Creates a cel-shaded Ghibli MeshToonMaterial with warm earthy/vibrant response
 */
export function createCelMaterial(options: {
  color: THREE.ColorRepresentation;
  emissive?: THREE.ColorRepresentation;
  emissiveIntensity?: number;
  steps?: 2 | 3 | 4;
  transparent?: boolean;
  opacity?: number;
  wireframe?: boolean;
  map?: THREE.Texture | null;
  bumpMap?: THREE.Texture | null;
  bumpScale?: number;
  side?: THREE.Side;
}): THREE.MeshToonMaterial {
  const gradientMap = getToonGradientMap(options.steps || 3);
  return new THREE.MeshToonMaterial({
    color: options.color,
    emissive: options.emissive || 0x000000,
    emissiveIntensity: options.emissiveIntensity !== undefined ? options.emissiveIntensity : 0,
    gradientMap,
    transparent: options.transparent || false,
    opacity: options.opacity !== undefined ? options.opacity : 1.0,
    wireframe: options.wireframe || false,
    map: options.map || null,
    bumpMap: options.bumpMap || null,
    bumpScale: options.bumpScale !== undefined ? options.bumpScale : 0.05,
    side: options.side !== undefined ? options.side : THREE.FrontSide,
  });
}

/**
 * Creates a silhouette ink outline mesh using an inverted-hull technique with BackSide rendering.
 * Gives cottages, gables, roofs, and landmarks that hand-drawn Ghibli contour.
 */
export function createSilhouetteOutline(
  geometry: THREE.BufferGeometry,
  outlineColor: THREE.ColorRepresentation = "#292524",
  scaleFactor: number = 1.035
): THREE.Mesh {
  const outlineMat = new THREE.MeshBasicMaterial({
    color: outlineColor,
    side: THREE.BackSide,
    depthWrite: true,
  });
  const outlineMesh = new THREE.Mesh(geometry, outlineMat);
  outlineMesh.scale.setScalar(scaleFactor);
  return outlineMesh;
}
