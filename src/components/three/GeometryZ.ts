import * as THREE from 'three';

export interface ShardData {
  id: string;
  name: string;
  mesh: THREE.Mesh;
  edgesMesh?: THREE.LineSegments;
  basePosition: THREE.Vector3;
  baseRotation: THREE.Euler;
  baseScale: THREE.Vector3;
  explodeDirection: THREE.Vector3;
  explodeRotation: THREE.Vector3;
  explodeDistance: number;
  isEdgePiece: boolean;
  isPentagonal?: boolean;
  delayOffset: number; // 0 to 1
  group: 'top-bar' | 'diagonal-bar' | 'bottom-bar' | 'edge-trim' | 'core';
}

/**
 * Builds a spiky 3D Capital "Z" made of sharp cubic and pentagonal structures,
 * razor crystal spines, beveled armor prisms, and a thin central Z spine line.
 * When scrolled, all spiky features detach and explode outwards from the straight Z line,
 * and then re-attach seamlessly while spinning.
 */
export function buildSpikyCapitalZShards(
  navyMetallicMaterial: THREE.Material,
  chromeSpikeMaterial: THREE.Material,
  thinSpineMaterial: THREE.Material,
  edgeGlowMaterial: THREE.LineBasicMaterial
): { group: THREE.Group; shards: ShardData[] } {
  const rootGroup = new THREE.Group();
  rootGroup.name = 'Spiky_Capital_Z_Root';
  const shards: ShardData[] = [];

  let shardIdCounter = 0;

  function addPiece(
    geo: THREE.BufferGeometry,
    pos: THREE.Vector3,
    rot: THREE.Euler,
    scale: THREE.Vector3,
    material: THREE.Material,
    groupType: 'top-bar' | 'diagonal-bar' | 'bottom-bar' | 'edge-trim' | 'core',
    isEdge: boolean,
    customExplodeDir?: THREE.Vector3,
    explodeDist = 4.2,
    delay = 0.0,
    isPentagonal = false
  ) {
    const mesh = new THREE.Mesh(geo, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.position.copy(pos);
    mesh.rotation.copy(rot);
    mesh.scale.copy(scale);

    // Create wireframe edges for edge glow effect on sharp cubic & pentagonal faces
    const edgesGeo = new THREE.EdgesGeometry(geo, 18);
    const edgesMesh = new THREE.LineSegments(edgesGeo, edgeGlowMaterial);
    mesh.add(edgesMesh);

    rootGroup.add(mesh);

    // Outward explosion vector pointing away from center / spine
    let dir = customExplodeDir;
    if (!dir) {
      dir = pos.clone().normalize();
      if (dir.lengthSq() < 0.001) {
        dir = new THREE.Vector3(0, 0, 1);
      }
    }
    dir.normalize();

    // Chaotic angular tumble for exploded state
    const explodeRot = new THREE.Vector3(
      (Math.random() - 0.5) * Math.PI * 3.0,
      (Math.random() - 0.5) * Math.PI * 3.0,
      (Math.random() - 0.5) * Math.PI * 3.0
    );

    const shard: ShardData = {
      id: `spike_shard_${shardIdCounter++}`,
      name: `${groupType}_${shardIdCounter}`,
      mesh,
      edgesMesh,
      basePosition: pos.clone(),
      baseRotation: rot.clone(),
      baseScale: scale.clone(),
      explodeDirection: dir,
      explodeRotation: explodeRot,
      explodeDistance: explodeDist,
      isEdgePiece: isEdge,
      isPentagonal,
      delayOffset: delay,
      group: groupType,
    };

    shards.push(shard);
  }

  // Define Key Points for the 3 Straight Lines of the "Z"
  const pTopStart = new THREE.Vector3(-2.2, 1.85, 0);
  const pTopEnd = new THREE.Vector3(1.85, 1.85, 0);
  const pBotStart = new THREE.Vector3(-1.85, -1.85, 0);
  const pBotEnd = new THREE.Vector3(2.2, -1.85, 0);

  // =========================================================================
  // 1. THIN STRAIGHT "Z" CENTRAL SPINE / SKELETON
  // =========================================================================
  const spineSegments = [
    { p1: pTopStart, p2: pTopEnd, name: 'top-spine' },
    { p1: pTopEnd, p2: pBotStart, name: 'diag-spine' },
    { p1: pBotStart, p2: pBotEnd, name: 'bot-spine' },
  ];

  spineSegments.forEach(({ p1, p2 }) => {
    const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
    const length = p1.distanceTo(p2);
    // Thin structural titanium line
    const spineGeo = new THREE.CylinderGeometry(0.12, 0.12, length, 12);
    const orientation = new THREE.Matrix4();
    orientation.lookAt(p1, p2, new THREE.Vector3(0, 0, 1));

    const spineMesh = new THREE.Mesh(spineGeo, thinSpineMaterial);
    spineMesh.position.copy(mid);
    spineMesh.quaternion.setFromRotationMatrix(orientation);
    spineMesh.rotateX(Math.PI / 2);

    addPiece(
      spineGeo,
      mid,
      spineMesh.rotation.clone(),
      new THREE.Vector3(1, 1, 1),
      thinSpineMaterial,
      'core',
      false,
      new THREE.Vector3(0, 0, (Math.random() - 0.5) * 0.4),
      1.2,
      0.4
    );
  });

  // =========================================================================
  // HELPER: Generate Spiky Sharp Cubic & Pentagonal Structures along a line
  // =========================================================================
  function populateSpikyFeaturesAlongLine(
    start: THREE.Vector3,
    end: THREE.Vector3,
    groupType: 'top-bar' | 'diagonal-bar' | 'bottom-bar',
    count: number,
    baseExplodeNormal: THREE.Vector3
  ) {
    for (let i = 0; i < count; i++) {
      const t = (i + 0.5) / count;
      const centerOnLine = new THREE.Vector3().lerpVectors(start, end, t);
      const isAlt = i % 2 === 0;

      // 1. Sharp Pentagonal Pyramid Spike (Shooting outward +Y / -Y or +Z / -Z)
      const pentaHeight = 0.85 + (Math.sin(i * 1.5) * 0.5 + 0.5) * 0.65;
      const pentaRadius = 0.38 + (i % 3) * 0.08;
      const pentaGeo = new THREE.CylinderGeometry(0.01, pentaRadius, pentaHeight, 5); // 5 sides = pentagon!

      // Upward/Outward Pentagonal Spike
      const upAngle = (i % 2 === 0 ? 0.3 : -0.3) + (Math.random() - 0.5) * 0.2;
      const upExplode = baseExplodeNormal.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 1.2, (Math.random() - 0.5) * 1.0)).normalize();
      addPiece(
        pentaGeo,
        centerOnLine.clone().add(new THREE.Vector3(0, (groupType === 'bottom-bar' ? -1 : 1) * 0.42, (i % 2 === 0 ? 0.25 : -0.25))),
        new THREE.Euler(upAngle, 0, groupType === 'bottom-bar' ? Math.PI : 0),
        new THREE.Vector3(1, 1, 1),
        isAlt ? navyMetallicMaterial : chromeSpikeMaterial,
        'edge-trim',
        true,
        upExplode,
        4.8 + Math.random() * 1.2,
        0.02 + (i / count) * 0.15,
        true
      );

      // 2. Sharp Front-Facing Cubic Crystal / Prism (Shooting outward along +Z)
      const cubeW = 0.42 + (i % 2) * 0.12;
      const cubeH = 0.48 + (i % 3) * 0.14;
      const cubeD = 0.65 + (Math.cos(i * 2) * 0.5 + 0.5) * 0.45;
      const cubicGeo = new THREE.BoxGeometry(cubeW, cubeH, cubeD);
      const frontExplode = new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, 2.2).normalize();
      addPiece(
        cubicGeo,
        centerOnLine.clone().add(new THREE.Vector3(0, 0, 0.48)),
        new THREE.Euler(0.2, (i % 3) * 0.4 - 0.4, 0.1),
        new THREE.Vector3(1, 1, 1),
        isAlt ? chromeSpikeMaterial : navyMetallicMaterial,
        'edge-trim',
        true,
        frontExplode,
        5.2,
        0.05 + Math.random() * 0.1,
        false
      );

      // 3. Sharp Back-Facing Pentagonal Dagger / Spike (Shooting outward along -Z)
      const backPentaGeo = new THREE.CylinderGeometry(0.02, pentaRadius * 0.9, pentaHeight * 0.9, 5);
      const backExplode = new THREE.Vector3((Math.random() - 0.5) * 0.6, (Math.random() - 0.5) * 0.6, -2.2).normalize();
      addPiece(
        backPentaGeo,
        centerOnLine.clone().add(new THREE.Vector3(0, 0, -0.48)),
        new THREE.Euler(Math.PI / 2 + 0.2, (i % 2) * 0.5, 0),
        new THREE.Vector3(1, 1, 1),
        navyMetallicMaterial,
        'edge-trim',
        true,
        backExplode,
        5.0,
        0.05 + Math.random() * 0.1,
        true
      );

      // 4. Cubic Armor Block / Beveled Keystone wrapping the straight line
      const baseBlockGeo = new THREE.BoxGeometry(0.55, 0.55, 0.55);
      const blockExplode = baseExplodeNormal.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.8, 0, (Math.random() - 0.5) * 0.8)).normalize();
      addPiece(
        baseBlockGeo,
        centerOnLine.clone(),
        new THREE.Euler(0.1, 0.2, 0),
        new THREE.Vector3(1, 1, 1),
        navyMetallicMaterial,
        groupType,
        false,
        blockExplode,
        3.5 + Math.random() * 0.8,
        0.15 + (i / count) * 0.2
      );

      // 5. Razor Triangular / Pentagonal Needle Spikes along the lateral flanks
      if (i % 2 === 0) {
        const needleGeo = new THREE.ConeGeometry(0.18, 0.95, 4); // 4-sided sharp crystal spike
        const flankExplode = new THREE.Vector3((i % 4 === 0 ? 1.5 : -1.5), (Math.random() - 0.5) * 0.8, (Math.random() - 0.5) * 0.8).normalize();
        addPiece(
          needleGeo,
          centerOnLine.clone().add(new THREE.Vector3(flankExplode.x * 0.45, 0, flankExplode.z * 0.45)),
          new THREE.Euler(0, 0, flankExplode.x > 0 ? -Math.PI / 2 : Math.PI / 2),
          new THREE.Vector3(1, 1, 1),
          chromeSpikeMaterial,
          'edge-trim',
          true,
          flankExplode,
          5.6,
          0.01 + Math.random() * 0.08
        );
      }
    }
  }

  // =========================================================================
  // 2. POPULATE TOP HORIZONTAL ARM SPIKY STRUCTURES
  // =========================================================================
  populateSpikyFeaturesAlongLine(
    pTopStart,
    pTopEnd,
    'top-bar',
    8,
    new THREE.Vector3(0, 1.8, 0.5)
  );

  // =========================================================================
  // 3. POPULATE DIAGONAL ARM SPIKY STRUCTURES
  // =========================================================================
  populateSpikyFeaturesAlongLine(
    pTopEnd,
    pBotStart,
    'diagonal-bar',
    12,
    new THREE.Vector3(1.2, 0.5, 0.8)
  );

  // =========================================================================
  // 4. POPULATE BOTTOM HORIZONTAL ARM SPIKY STRUCTURES
  // =========================================================================
  populateSpikyFeaturesAlongLine(
    pBotStart,
    pBotEnd,
    'bottom-bar',
    8,
    new THREE.Vector3(0, -1.8, 0.5)
  );

  // =========================================================================
  // 5. CORNER ANCHOR PRISMS (Top-Right Elbow & Bottom-Left Elbow)
  // =========================================================================
  const elbowGeo = new THREE.DodecahedronGeometry(0.7, 0); // 12-sided faceted crystal
  addPiece(
    elbowGeo,
    pTopEnd.clone(),
    new THREE.Euler(0.4, 0.6, 0.2),
    new THREE.Vector3(1, 1, 1),
    chromeSpikeMaterial,
    'core',
    true,
    new THREE.Vector3(1.8, 1.8, 1.2).normalize(),
    6.0,
    0.0
  );
  addPiece(
    elbowGeo,
    pBotStart.clone(),
    new THREE.Euler(-0.4, -0.6, 0.2),
    new THREE.Vector3(1, 1, 1),
    chromeSpikeMaterial,
    'core',
    true,
    new THREE.Vector3(-1.8, -1.8, 1.2).normalize(),
    6.0,
    0.0
  );

  return { group: rootGroup, shards };
}
