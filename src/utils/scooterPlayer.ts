import * as THREE from "three";
import { createCelMaterial, createSilhouetteOutline } from "./celShading";

export interface ScooterPlayerOptions {
  bodyColor?: string;
  helmetColor?: string;
  jacketColor?: string;
  enableHeadlightBeam?: boolean;
}

export interface ScooterPlayerInstance {
  group: THREE.Group;
  headlight: THREE.SpotLight;
  headlightLens: THREE.Mesh;
  update: (
    delta: number,
    time: number,
    currentSpeedKmh: number,
    isMoving: boolean,
    steeringInput: number,
    isBoosting: boolean
  ) => void;
  setThemeColors: (theme: "midnight" | "ghibli" | "cyber" | "sakura") => void;
  destroy: () => void;
}

/**
 * Modularized Scooter Player Character Controller.
 * Features:
 * - Cute biker girl with retro black motorcycle helmet, silver stripe, black leather jacket
 * - Vintage Vespa scooter with round chrome headlight, luggage rack, dual mirrors
 * - Real-time physics banking / leaning into sharp turns
 * - Dynamic spinning wheels with chrome hubcaps
 * - Headlight volumetric cone beam & cast light
 * - Exhaust smoke particle emitter when accelerating
 */
export function createScooterPlayer(options: ScooterPlayerOptions = {}): ScooterPlayerInstance {
  const group = new THREE.Group();
  group.name = "ZainabScooterPlayer";

  // Base Materials (Cel-shaded Ghibli palette)
  const chassisMat = createCelMaterial({
    color: options.bodyColor || "#18181b", // Sleek glossy obsidian black
    steps: 3,
  });

  const leatherJacketMat = createCelMaterial({
    color: options.jacketColor || "#09090b", // Deep black leather
    steps: 3,
  });

  const helmetMat = createCelMaterial({
    color: options.helmetColor || "#18181b", // Glossy retro helmet
    steps: 3,
  });

  const helmetStripeMat = createCelMaterial({
    color: "#e2e8f0", // Silver / chrome center racing stripe
    steps: 2,
  });

  const denimPantsMat = createCelMaterial({
    color: "#27272a", // Dark charcoal denim
    steps: 2,
  });

  const skinMat = createCelMaterial({
    color: "#fed7aa", // Soft warm skin tone
    steps: 2,
  });

  const blushMat = createCelMaterial({
    color: "#f472b6",
    transparent: true,
    opacity: 0.6,
    steps: 2,
  });

  const saddleLeatherMat = createCelMaterial({
    color: "#27272a", // Dark padded seat
    steps: 2,
  });

  const tireRubberMat = createCelMaterial({
    color: "#18181b",
    steps: 2,
  });

  const chromeAlloyMat = createCelMaterial({
    color: "#f1f5f9",
    steps: 2,
  });

  const headlightLensMat = createCelMaterial({
    color: "#fef08a",
    emissive: "#fef08a",
    emissiveIntensity: 0.95,
    steps: 2,
  });

  const taillightMat = createCelMaterial({
    color: "#ef4444",
    emissive: "#ef4444",
    emissiveIntensity: 0.8,
    steps: 2,
  });

  // ---------------------------------------------------------------------------
  // 1. SCOOTER WHEELS & TIRES
  // ---------------------------------------------------------------------------
  const wheelRadius = 0.32;
  const wheelWidth = 0.16;

  // Front Wheel
  const frontWheelGroup = new THREE.Group();
  frontWheelGroup.position.set(0, wheelRadius, 0.92);

  const tireGeo = new THREE.CylinderGeometry(wheelRadius, wheelRadius, wheelWidth, 24);
  const frontTire = new THREE.Mesh(tireGeo, tireRubberMat);
  frontTire.rotation.z = Math.PI / 2;
  frontTire.castShadow = true;
  frontWheelGroup.add(frontTire);

  const frontTireOutline = createSilhouetteOutline(tireGeo, "#09090b", 1.05);
  frontTireOutline.rotation.z = Math.PI / 2;
  frontWheelGroup.add(frontTireOutline);

  const rimGeo = new THREE.CylinderGeometry(0.2, 0.2, wheelWidth + 0.02, 16);
  const frontRim = new THREE.Mesh(rimGeo, chromeAlloyMat);
  frontRim.rotation.z = Math.PI / 2;
  frontWheelGroup.add(frontRim);

  // Wheel Hubcap Bolt Accent
  const hubcapGeo = new THREE.CylinderGeometry(0.06, 0.06, wheelWidth + 0.04, 12);
  const frontHubcap = new THREE.Mesh(hubcapGeo, chromeAlloyMat);
  frontHubcap.rotation.z = Math.PI / 2;
  frontWheelGroup.add(frontHubcap);

  group.add(frontWheelGroup);

  // Rear Wheel
  const rearWheelGroup = new THREE.Group();
  rearWheelGroup.position.set(0, wheelRadius, -0.82);

  const rearTire = new THREE.Mesh(tireGeo, tireRubberMat);
  rearTire.rotation.z = Math.PI / 2;
  rearTire.castShadow = true;
  rearWheelGroup.add(rearTire);

  const rearTireOutline = createSilhouetteOutline(tireGeo, "#09090b", 1.05);
  rearTireOutline.rotation.z = Math.PI / 2;
  rearWheelGroup.add(rearTireOutline);

  const rearRim = new THREE.Mesh(rimGeo, chromeAlloyMat);
  rearRim.rotation.z = Math.PI / 2;
  rearWheelGroup.add(rearRim);

  group.add(rearWheelGroup);

  // ---------------------------------------------------------------------------
  // 2. CHASSIS, FOOTBOARD & RETRO APRON
  // ---------------------------------------------------------------------------
  // Low curved footboard deck
  const deckGeo = new THREE.BoxGeometry(0.72, 0.14, 1.25);
  const deck = new THREE.Mesh(deckGeo, chassisMat);
  deck.position.set(0, 0.38, 0.08);
  deck.castShadow = true;
  group.add(deck);

  const deckOutline = createSilhouetteOutline(deckGeo, "#09090b", 1.04);
  deckOutline.position.set(0, 0.38, 0.08);
  group.add(deckOutline);

  // Rubber Footgrip Ribs
  for (let f = -0.4; f <= 0.4; f += 0.2) {
    const ribGeo = new THREE.BoxGeometry(0.56, 0.02, 0.04);
    const rib = new THREE.Mesh(ribGeo, tireRubberMat);
    rib.position.set(0, 0.46, f);
    group.add(rib);
  }

  // Front Legshield Apron (Classic Vespa Front Shield)
  const apronGeo = new THREE.BoxGeometry(0.68, 0.82, 0.08);
  const apron = new THREE.Mesh(apronGeo, chassisMat);
  apron.rotation.x = -0.25;
  apron.position.set(0, 0.82, 0.72);
  apron.castShadow = true;
  group.add(apron);

  const apronOutline = createSilhouetteOutline(apronGeo, "#09090b", 1.04);
  apronOutline.rotation.x = -0.25;
  apronOutline.position.set(0, 0.82, 0.72);
  group.add(apronOutline);

  // Chrome Front Luggage Rack
  const rackFrameGeo = new THREE.BoxGeometry(0.48, 0.32, 0.16);
  const rackFrameMat = chromeAlloyMat;
  const rackFrame = new THREE.Mesh(rackFrameGeo, rackFrameMat);
  rackFrame.position.set(0, 0.78, 0.88);
  group.add(rackFrame);

  // Rear Vintage Curvy Cowling
  const rearCowlGeo = new THREE.BoxGeometry(0.64, 0.52, 0.95);
  const rearCowl = new THREE.Mesh(rearCowlGeo, chassisMat);
  rearCowl.position.set(0, 0.65, -0.42);
  rearCowl.castShadow = true;
  group.add(rearCowl);

  const rearCowlOutline = createSilhouetteOutline(rearCowlGeo, "#09090b", 1.04);
  rearCowlOutline.position.set(0, 0.65, -0.42);
  group.add(rearCowlOutline);

  // Padded Dual Seat Saddle
  const seatGeo = new THREE.BoxGeometry(0.5, 0.16, 0.78);
  const seat = new THREE.Mesh(seatGeo, saddleLeatherMat);
  seat.position.set(0, 0.96, -0.32);
  seat.castShadow = true;
  group.add(seat);

  // Chrome Passenger Grab Rail
  const grabRailGeo = new THREE.TorusGeometry(0.24, 0.025, 8, 16, Math.PI);
  const grabRail = new THREE.Mesh(grabRailGeo, chromeAlloyMat);
  grabRail.rotation.x = -Math.PI / 2;
  grabRail.position.set(0, 1.02, -0.72);
  group.add(grabRail);

  // ---------------------------------------------------------------------------
  // 3. STEERING COLUMN, HANDLEBARS & DUAL MIRRORS
  // ---------------------------------------------------------------------------
  // Steering fork & stem
  const stemGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.82, 12);
  const stem = new THREE.Mesh(stemGeo, chromeAlloyMat);
  stem.rotation.x = -0.25;
  stem.position.set(0, 0.84, 0.74);
  group.add(stem);

  // Chrome Handlebar
  const handlebarGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.76, 12);
  const handlebar = new THREE.Mesh(handlebarGeo, chromeAlloyMat);
  handlebar.rotation.z = Math.PI / 2;
  handlebar.position.set(0, 1.22, 0.56);
  group.add(handlebar);

  // Rubber Grips
  [-0.35, 0.35].forEach((gx) => {
    const gripGeo = new THREE.CylinderGeometry(0.038, 0.038, 0.12, 12);
    const grip = new THREE.Mesh(gripGeo, tireRubberMat);
    grip.rotation.z = Math.PI / 2;
    grip.position.set(gx, 1.22, 0.56);
    group.add(grip);
  });

  // Dual Retro Round Chrome Mirrors
  [-0.32, 0.32].forEach((mx) => {
    // Stem
    const mirrorStemGeo = new THREE.CylinderGeometry(0.015, 0.015, 0.22, 8);
    const mirrorStem = new THREE.Mesh(mirrorStemGeo, chromeAlloyMat);
    mirrorStem.rotation.z = mx > 0 ? -0.4 : 0.4;
    mirrorStem.position.set(mx, 1.34, 0.58);
    group.add(mirrorStem);

    // Round Mirror Glass & Bezel
    const mirrorGlassGeo = new THREE.CylinderGeometry(0.075, 0.075, 0.02, 16);
    const mirrorGlass = new THREE.Mesh(mirrorGlassGeo, chromeAlloyMat);
    mirrorGlass.rotation.x = Math.PI / 2;
    mirrorGlass.position.set(mx > 0 ? mx + 0.06 : mx - 0.06, 1.44, 0.58);
    group.add(mirrorGlass);
  });

  // ---------------------------------------------------------------------------
  // 4. VINTAGE HEADLIGHT & LIGHT BEAMS
  // ---------------------------------------------------------------------------
  // Round Headlamp housing
  const headlampBezelGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.14, 20);
  const headlampBezel = new THREE.Mesh(headlampBezelGeo, chromeAlloyMat);
  headlampBezel.rotation.x = Math.PI / 2;
  headlampBezel.position.set(0, 1.18, 0.72);
  group.add(headlampBezel);

  // Glowing Front Lens
  const headlampLensGeo = new THREE.SphereGeometry(0.14, 16, 16);
  const headlightLens = new THREE.Mesh(headlampLensGeo, headlightLensMat);
  headlightLens.position.set(0, 1.18, 0.78);
  group.add(headlightLens);

  // Real-time 3D Spotlight Beam casting forward on the road
  const headlight = new THREE.SpotLight("#fef08a", 4.5, 24, Math.PI / 4.5, 0.4, 1.2);
  headlight.position.set(0, 1.18, 0.8);
  headlight.target.position.set(0, 0, 12);
  group.add(headlight);
  group.add(headlight.target);

  // Taillight
  const tailLightGeo = new THREE.BoxGeometry(0.24, 0.12, 0.06);
  const tailLight = new THREE.Mesh(tailLightGeo, taillightMat);
  tailLight.position.set(0, 0.78, -0.92);
  group.add(tailLight);

  // Chrome Exhaust Pipe
  const exhaustGeo = new THREE.CylinderGeometry(0.04, 0.04, 0.65, 12);
  const exhaust = new THREE.Mesh(exhaustGeo, chromeAlloyMat);
  exhaust.rotation.x = Math.PI / 2;
  exhaust.position.set(0.32, 0.3, -0.65);
  group.add(exhaust);

  // ---------------------------------------------------------------------------
  // 5. BIKER GIRL CHARACTER (ZAINAB - RETRO HELMET, LEATHER JACKET & FLARED DENIM)
  // ---------------------------------------------------------------------------
  const riderGroup = new THREE.Group();
  riderGroup.position.set(0, 0, 0);

  // Torso / Black Leather Biker Jacket
  const jacketGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.58, 16);
  const jacket = new THREE.Mesh(jacketGeo, leatherJacketMat);
  jacket.rotation.x = 0.22;
  jacket.position.set(0, 1.34, -0.12);
  jacket.castShadow = true;
  riderGroup.add(jacket);

  const jacketOutline = createSilhouetteOutline(jacketGeo, "#09090b", 1.04);
  jacketOutline.rotation.x = 0.22;
  jacketOutline.position.set(0, 1.34, -0.12);
  riderGroup.add(jacketOutline);

  // Chrome Asymmetrical Leather Jacket Zipper Line
  const zipperGeo = new THREE.BoxGeometry(0.02, 0.48, 0.03);
  const zipper = new THREE.Mesh(zipperGeo, chromeAlloyMat);
  zipper.rotation.x = 0.22;
  zipper.rotation.z = 0.1;
  zipper.position.set(0.06, 1.35, -0.01);
  riderGroup.add(zipper);

  // Cute Biker Girl Head & Face
  const headGeo = new THREE.SphereGeometry(0.24, 20, 20);
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.set(0, 1.78, 0.02);
  head.castShadow = true;
  riderGroup.add(head);

  // Anime Eyes (Large cute dark anime eyes)
  [-0.08, 0.08].forEach((ex) => {
    const eyeGeo = new THREE.SphereGeometry(0.048, 12, 12);
    const eyeMat = createCelMaterial({ color: "#18181b", steps: 2 });
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(ex, 1.79, 0.22);
    riderGroup.add(eye);

    // Eye Sparkle Catchlight
    const catchGeo = new THREE.SphereGeometry(0.016, 8, 8);
    const catchMat = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    const catchLight = new THREE.Mesh(catchGeo, catchMat);
    catchLight.position.set(ex + 0.015, 1.81, 0.25);
    riderGroup.add(catchLight);

    // Cute Cheerful Eyelash Curve
    const lashGeo = new THREE.BoxGeometry(0.08, 0.015, 0.02);
    const lashMat = createCelMaterial({ color: "#09090b", steps: 2 });
    const lash = new THREE.Mesh(lashGeo, lashMat);
    lash.position.set(ex, 1.84, 0.23);
    lash.rotation.z = ex > 0 ? -0.2 : 0.2;
    riderGroup.add(lash);
  });

  // Soft Pink Cheeks Blush
  [-0.12, 0.12].forEach((bx) => {
    const blushGeo = new THREE.CircleGeometry(0.038, 16);
    const blush = new THREE.Mesh(blushGeo, blushMat);
    blush.position.set(bx, 1.73, 0.23);
    riderGroup.add(blush);
  });

  // Retro Open-Face Biker Helmet (Curved shell covering top and sides)
  const helmetGeo = new THREE.SphereGeometry(0.29, 24, 24);
  const helmet = new THREE.Mesh(helmetGeo, helmetMat);
  helmet.position.set(0, 1.84, 0.01);
  helmet.castShadow = true;
  riderGroup.add(helmet);

  const helmetOutline = createSilhouetteOutline(helmetGeo, "#09090b", 1.04);
  helmetOutline.position.set(0, 1.84, 0.01);
  riderGroup.add(helmetOutline);

  // Helmet Center Racing Stripe (Silver / Chrome)
  const stripeGeo = new THREE.TorusGeometry(0.292, 0.04, 12, 24, Math.PI);
  const stripe = new THREE.Mesh(stripeGeo, helmetStripeMat);
  stripe.rotation.y = Math.PI / 2;
  stripe.position.set(0, 1.84, 0.01);
  riderGroup.add(stripe);

  // Helmet Front Visor Brim
  const visorBrimGeo = new THREE.CylinderGeometry(0.29, 0.29, 0.08, 16, 1, false, 0, Math.PI);
  const visorBrim = new THREE.Mesh(visorBrimGeo, helmetMat);
  visorBrim.rotation.x = 0.5;
  visorBrim.position.set(0, 1.89, 0.12);
  riderGroup.add(visorBrim);

  // Arms reaching for Handlebars
  [-0.22, 0.22].forEach((ax) => {
    const armGeo = new THREE.CylinderGeometry(0.065, 0.06, 0.5, 12);
    const arm = new THREE.Mesh(armGeo, leatherJacketMat);
    arm.rotation.x = 0.9;
    arm.rotation.z = ax > 0 ? -0.35 : 0.35;
    arm.position.set(ax, 1.34, 0.18);
    riderGroup.add(arm);

    // Black Biker Riding Gloves
    const gloveGeo = new THREE.SphereGeometry(0.06, 10, 10);
    const glove = new THREE.Mesh(gloveGeo, leatherJacketMat);
    glove.position.set(ax > 0 ? ax + 0.12 : ax - 0.12, 1.22, 0.52);
    riderGroup.add(glove);
  });

  // Legs & Flared Denim Pants
  [-0.18, 0.18].forEach((lx) => {
    // Upper Thigh sitting on seat
    const thighGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.44, 12);
    const thigh = new THREE.Mesh(thighGeo, denimPantsMat);
    thigh.rotation.x = 1.35;
    thigh.position.set(lx, 0.88, -0.06);
    riderGroup.add(thigh);

    // Lower Leg stepping down towards footboard
    const calfGeo = new THREE.CylinderGeometry(0.08, 0.11, 0.46, 12); // Flared bell-bottom denim cuff
    const calf = new THREE.Mesh(calfGeo, denimPantsMat);
    calf.position.set(lx * 1.2, 0.58, 0.18);
    riderGroup.add(calf);

    // Black Biker Boot
    const bootGeo = new THREE.BoxGeometry(0.12, 0.1, 0.24);
    const boot = new THREE.Mesh(bootGeo, leatherJacketMat);
    boot.position.set(lx * 1.2, 0.43, 0.24);
    riderGroup.add(boot);
  });

  group.add(riderGroup);

  // ---------------------------------------------------------------------------
  // 6. DYNAMIC EXHAUST & ACCELERATION PARTICLE PUFFS
  // ---------------------------------------------------------------------------
  const particleCount = 14;
  const particles: Array<{ mesh: THREE.Mesh; life: number; maxLife: number; vx: number; vy: number; vz: number }> = [];
  const particleGroup = new THREE.Group();

  const particleMat = createCelMaterial({
    color: "#e2e8f0",
    transparent: true,
    opacity: 0.5,
    steps: 2,
  });

  for (let i = 0; i < particleCount; i++) {
    const pMesh = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), particleMat.clone());
    pMesh.visible = false;
    particleGroup.add(pMesh);
    particles.push({
      mesh: pMesh,
      life: 0,
      maxLife: 0.6,
      vx: 0,
      vy: 0,
      vz: 0,
    });
  }
  group.add(particleGroup);

  let particleTimer = 0;

  // ---------------------------------------------------------------------------
  // 7. REAL-TIME UPDATE LOOP CONTROLLER
  // ---------------------------------------------------------------------------
  let currentBankAngle = 0;

  const update = (
    delta: number,
    time: number,
    currentSpeedKmh: number,
    isMoving: boolean,
    steeringInput: number,
    isBoosting: boolean
  ) => {
    // 1. Wheel Spinning Animation based on speed
    const rotationSpeed = (currentSpeedKmh / 3.6) / wheelRadius;
    frontTire.rotation.y += rotationSpeed * delta;
    rearTire.rotation.y += rotationSpeed * delta;

    // 2. Physics Banking into Turns (Motorcycle leaning)
    const targetBank = steeringInput * (isBoosting ? 0.35 : 0.25);
    currentBankAngle += (targetBank - currentBankAngle) * Math.min(1.0, delta * 8.0);
    group.rotation.z = currentBankAngle;

    // 3. Engine Suspension Vibration & Idle Bobbing
    if (isMoving) {
      const vibration = Math.sin(time * 30) * 0.015;
      const pitchNod = isBoosting ? -0.04 : 0.0;
      riderGroup.position.y = vibration;
      group.rotation.x = pitchNod + Math.sin(time * 15) * 0.01;
    } else {
      // Gentle breathing / idle bobbing
      riderGroup.position.y = Math.sin(time * 3.5) * 0.012;
      group.rotation.x = 0;
    }

    // 4. Exhaust Particles when accelerating
    if (isMoving) {
      particleTimer += delta;
      if (particleTimer > (isBoosting ? 0.04 : 0.08)) {
        particleTimer = 0;
        const availableParticle = particles.find((p) => !p.mesh.visible);
        if (availableParticle) {
          availableParticle.mesh.visible = true;
          availableParticle.mesh.position.set(
            0.32 + (Math.random() - 0.5) * 0.06,
            0.3,
            -0.8
          );
          availableParticle.life = 0;
          availableParticle.maxLife = isBoosting ? 0.8 : 0.5;
          availableParticle.vx = (Math.random() - 0.5) * 0.4;
          availableParticle.vy = 0.4 + Math.random() * 0.5;
          availableParticle.vz = -1.2 - Math.random() * 1.5;
        }
      }
    }

    // Update existing particles
    particles.forEach((p) => {
      if (p.mesh.visible) {
        p.life += delta;
        if (p.life >= p.maxLife) {
          p.mesh.visible = false;
        } else {
          const progress = p.life / p.maxLife;
          p.mesh.position.x += p.vx * delta;
          p.mesh.position.y += p.vy * delta;
          p.mesh.position.z += p.vz * delta;
          p.mesh.scale.setScalar(1.0 + progress * 2.5);
          const mat = p.mesh.material as THREE.MeshToonMaterial;
          if (mat) {
            mat.opacity = (1 - progress) * (isBoosting ? 0.7 : 0.45);
          }
        }
      }
    });

    // 5. Headlight Flicker & Dynamic Intensity
    headlight.intensity = 4.2 + Math.sin(time * 12) * 0.3;
  };

  // ---------------------------------------------------------------------------
  // 8. THEME SWITCHING HELPER
  // ---------------------------------------------------------------------------
  const setThemeColors = (theme: "midnight" | "ghibli" | "cyber" | "sakura") => {
    if (theme === "midnight") {
      chassisMat.color.set("#18181b");
      helmetMat.color.set("#09090b");
      helmetStripeMat.color.set("#38bdf8"); // Electric cyan stripe
      leatherJacketMat.color.set("#09090b");
      headlightLensMat.color.set("#38bdf8");
      headlight.color.set("#38bdf8");
    } else if (theme === "ghibli") {
      chassisMat.color.set("#f8fafc"); // Vintage cream
      helmetMat.color.set("#dc2626"); // Crimson helmet
      helmetStripeMat.color.set("#ffffff");
      leatherJacketMat.color.set("#0284c7"); // Cobalt jacket
      headlightLensMat.color.set("#fef08a");
      headlight.color.set("#fef08a");
    } else if (theme === "cyber") {
      chassisMat.color.set("#0f172a");
      helmetMat.color.set("#7c3aed"); // Cyber purple
      helmetStripeMat.color.set("#ec4899"); // Synthwave pink
      leatherJacketMat.color.set("#1e1b4b");
      headlightLensMat.color.set("#22d3ee");
      headlight.color.set("#22d3ee");
    } else if (theme === "sakura") {
      chassisMat.color.set("#fff1f2"); // Soft ivory
      helmetMat.color.set("#fb7185"); // Sakura rose
      helmetStripeMat.color.set("#ffffff");
      leatherJacketMat.color.set("#4c0519");
      headlightLensMat.color.set("#fef08a");
      headlight.color.set("#fef08a");
    }
  };

  const destroy = () => {
    particles.forEach((p) => {
      p.mesh.geometry.dispose();
      (p.mesh.material as THREE.Material).dispose();
    });
  };

  return {
    group,
    headlight,
    headlightLens,
    update,
    setThemeColors,
    destroy,
  };
}
