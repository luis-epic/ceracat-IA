import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ClayType, GlazeStyle, MetallicAccent, LightingStyle } from "../types";
import { CLAY_OPTIONS, ACCENT_OPTIONS, LIGHTING_OPTIONS, GLAZE_OPTIONS } from "../data";

interface MugVisualizerProps {
  clay: ClayType;
  glaze: GlazeStyle;
  accent: MetallicAccent;
  lighting: LightingStyle;
  isSpinning?: boolean;
}

export const MugVisualizer: React.FC<MugVisualizerProps> = ({
  clay,
  glaze,
  accent,
  lighting,
  isSpinning = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // References to keep track of THREE objects between renders for smooth morphing animations
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mugGroupRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Mesh Material References
  const mugMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const accentMaterialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const coreClayTextureRef = useRef<THREE.CanvasTexture | null>(null);

  // Lights References
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);
  const keyLightRef = useRef<THREE.DirectionalLight | null>(null);
  const fillLightRef = useRef<THREE.DirectionalLight | null>(null);
  const pointLightLeftRef = useRef<THREE.PointLight | null>(null);
  const pointLightRightRef = useRef<THREE.PointLight | null>(null);

  // Find parameter objects from raw config
  const clayOpt = CLAY_OPTIONS.find((o) => o.name === clay) || CLAY_OPTIONS[0];
  const accentOpt = ACCENT_OPTIONS.find((o) => o.name === accent) || ACCENT_OPTIONS[0];
  const lightOpt = LIGHTING_OPTIONS.find((o) => o.name === lighting) || LIGHTING_OPTIONS[0];
  const glazeOpt = GLAZE_OPTIONS.find((o) => o.name === glaze) || GLAZE_OPTIONS[0];

  // Helper inside useEffect to generate dynamic procedural texture of the clay body
  const generateProceduralClayTexture = (colorHex: string, hasCrackle: boolean) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // Fill with solid clay color
    ctx.fillStyle = colorHex;
    ctx.fillRect(0, 0, 1024, 512);

    // Clay grain variations (noise)
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < 6000; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 512;
      const size = Math.random() * 2 + 1;
      ctx.fillRect(rx, ry, size, size);
    }
    ctx.fillStyle = "rgba(0, 0, 0, 0.04)";
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * 1024;
      const ry = Math.random() * 512;
      const size = Math.random() * 1.5 + 0.5;
      ctx.fillRect(rx, ry, size, size);
    }

    // Soft organic horizontal gradient bands (rotary glaze effect)
    const bandCount = 10;
    for (let i = 0; i < bandCount; i++) {
      const y = Math.random() * 512;
      const h = 20 + Math.random() * 60;
      const grad = ctx.createLinearGradient(0, y, 0, y + h);
      const isDark = Math.random() > 0.5;
      grad.addColorStop(0, "rgba(0, 0, 0, 0)");
      grad.addColorStop(0.5, isDark ? "rgba(0, 0, 0, 0.02)" : "rgba(255, 255, 255, 0.015)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, y, 1024, h);
    }

    // Render thin crackle veins if "Craquelado Antiguo" style selected
    if (hasCrackle) {
      ctx.strokeStyle = "rgba(24, 20, 15, 0.28)";
      ctx.lineWidth = 1.0;
      ctx.lineCap = "round";

      const drawCrackSegment = (
        startX: number,
        startY: number,
        length: number,
        angle: number,
        depth: number
      ) => {
        if (depth > 4) return;
        let cx = startX;
        let cy = startY;
        ctx.beginPath();
        ctx.moveTo(cx, cy);

        const subSteps = Math.floor(length / 10) + 2;
        for (let s = 0; s < subSteps; s++) {
          cx += Math.cos(angle) * 7 + (Math.random() - 0.5) * 5;
          cy += Math.sin(angle) * 7 + (Math.random() - 0.5) * 5;
          ctx.lineTo(cx, cy);

          // Offshoot vein branching
          if (Math.random() < 0.25) {
            drawCrackSegment(
              cx,
              cy,
              length * 0.45,
              angle + (Math.random() - 0.5) * 1.8,
              depth + 1
            );
          }
        }
        ctx.stroke();
      };

      // Draw primary networks wrapping around the piece
      const numCracks = 15;
      for (let c = 0; c < numCracks; c++) {
        drawCrackSegment(
          Math.random() * 1024,
          Math.random() * 512,
          70 + Math.random() * 100,
          Math.random() * Math.PI * 2,
          0
        );
      }
    }

    const tx = new THREE.CanvasTexture(canvas);
    tx.wrapS = THREE.RepeatWrapping;
    tx.wrapT = THREE.ClampToEdgeWrapping;
    return tx;
  };

  // Helper to generate circular cute latte art cat face foam texture
  const generateLatteArtTexture = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    // 1. Dark roasted espresso base with creamy outer ring
    const radGrad = ctx.createRadialGradient(128, 128, 10, 128, 128, 128);
    radGrad.addColorStop(0, "#e8bc95"); // Light coffee swirl
    radGrad.addColorStop(0.35, "#ab6f3e"); // Warm crema
    radGrad.addColorStop(0.7, "#542a0c"); // Rich dark coffee
    radGrad.addColorStop(1, "#1d0e04"); // Roasted edge
    ctx.fillStyle = radGrad;
    ctx.fillRect(0, 0, 256, 256);

    // 2. Milk foam cat face silhouette (latte art pattern)
    ctx.fillStyle = "rgba(255, 254, 250, 0.96)";

    // Main circle head
    ctx.beginPath();
    ctx.arc(128, 134, 46, 0, Math.PI * 2);
    ctx.fill();

    // Left pointed ear foam
    ctx.beginPath();
    ctx.moveTo(85, 104);
    ctx.lineTo(80, 72);
    ctx.lineTo(112, 98);
    ctx.closePath();
    ctx.fill();

    // Right pointed ear foam
    ctx.beginPath();
    ctx.moveTo(171, 104);
    ctx.lineTo(176, 72);
    ctx.lineTo(144, 98);
    ctx.closePath();
    ctx.fill();

    // Cute face details drawn inside the foam using roasted dark coffee pigment
    ctx.strokeStyle = "#4c2105";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";

    // Left sleepy closed eye
    ctx.beginPath();
    ctx.arc(106, 128, 7, 0, Math.PI, false);
    ctx.stroke();

    // Right sleepy closed eye
    ctx.beginPath();
    ctx.arc(150, 128, 7, 0, Math.PI, false);
    ctx.stroke();

    // Cute tiny triangular cat nose
    ctx.fillStyle = "#4c2105";
    ctx.beginPath();
    ctx.moveTo(125, 134);
    ctx.lineTo(131, 134);
    ctx.lineTo(128, 137);
    ctx.closePath();
    ctx.fill();

    // Smiley kitty loops (:3 mouth)
    ctx.beginPath();
    ctx.arc(125, 140, 3.5, Math.PI, 0, false);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(131, 140, 3.5, Math.PI, 0, false);
    ctx.stroke();

    const tx = new THREE.CanvasTexture(canvas);
    return tx;
  };

  // INITIAL SETUP EFFECT (Runs once on mount)
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Scene dimensions
    const width = containerRef.current.clientWidth || 360;
    const height = containerRef.current.clientHeight || 360;

    // 2. Renderer setup
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    // Clear old canvases
    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 3. Scene creation
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 4. Camera Setup (Zoomed out slightly to fit ears and tail handle)
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 1.2, 5.0);
    cameraRef.current = camera;

    // 5. OrbitControls integration
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.minDistance = 3.0;
    controls.maxDistance = 7.5;
    // Limit vertical rotation slightly to keep from flipping upside down completely
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.65;
    controlsRef.current = controls;

    // 6. Lights Installation inside virtual studio
    // Ambient backdrop illumination
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    ambientLightRef.current = ambientLight;

    // Primary directional key light
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.2);
    keyLight.position.set(5, 5, 4);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.001;
    scene.add(keyLight);
    keyLightRef.current = keyLight;

    // Soft reflective secondary fill light from opposite angle
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.5);
    fillLight.position.set(-5, 3, -2);
    scene.add(fillLight);
    fillLightRef.current = fillLight;

    // Secondary colored point lights for Cyberpunk themes (stored but originally hidden/inactive)
    const pointLightLeft = new THREE.PointLight(0x06b6d4, 0, 10);
    pointLightLeft.position.set(-4, 0.5, 3);
    scene.add(pointLightLeft);
    pointLightLeftRef.current = pointLightLeft;

    const pointLightRight = new THREE.PointLight(0xec4899, 0, 10);
    pointLightRight.position.set(4, 0.5, 3);
    scene.add(pointLightRight);
    pointLightRightRef.current = pointLightRight;

    // Floor virtual circular coaster to collect smooth shadows
    const floorGeo = new THREE.PlaneGeometry(12, 12);
    const floorMat = new THREE.ShadowMaterial({ opacity: 0.28 });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -1.15;
    floorMesh.receiveShadow = true;
    scene.add(floorMesh);

    // 7. Mug Core Geometry & Scene Graph Setup
    const mugGroup = new THREE.Group();
    scene.add(mugGroup);
    mugGroupRef.current = mugGroup;

    // A. Ceramic Materials Setups
    const coreClayTexture = generateProceduralClayTexture(clayOpt.rgb, glaze === "Craquelado Antiguo");
    coreClayTextureRef.current = coreClayTexture;

    const mugMaterial = new THREE.MeshPhysicalMaterial({
      map: coreClayTexture || undefined,
      roughness: 0.1,
      metalness: 0.1,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05,
      bumpScale: 0.02
    });
    mugMaterialRef.current = mugMaterial;

    // Accent materials details (shiny gold/metallic base)
    const accentMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xe2b86b,
      roughness: 0.12,
      metalness: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    accentMaterialRef.current = accentMaterial;

    // B. Mug Cylinder Core Body
    // Bullet shape: slightly tapered top, rounder bottom
    const mugCoreGeo = new THREE.CylinderGeometry(0.9, 0.82, 2.0, 48, 1, false);
    const mugCore = new THREE.Mesh(mugCoreGeo, mugMaterial);
    mugCore.castShadow = true;
    mugCore.receiveShadow = true;
    mugGroup.add(mugCore);

    // C. Elegant Clay Rim edge lip
    const rimGeo = new THREE.TorusGeometry(0.852, 0.055, 12, 48);
    const rim = new THREE.Mesh(rimGeo, mugMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = 1.0;
    rim.castShadow = true;
    mugGroup.add(rim);

    // D. Roasted Coffee Cap with custom dynamic Latte art feline texture
    const coffeeGeo = new THREE.CircleGeometry(0.83, 32);
    const latteArtTex = generateLatteArtTexture();
    const coffeeMat = new THREE.MeshStandardMaterial({
      map: latteArtTex || undefined,
      roughness: 0.2,
      metalness: 0.0
    });
    const coffee = new THREE.Mesh(coffeeGeo, coffeeMat);
    coffee.rotation.x = -Math.PI / 2;
    coffee.position.y = 0.95;
    mugGroup.add(coffee);

    // E. Realistic cat ears (mushy cones extruded)
    const leftEarGeo = new THREE.ConeGeometry(0.24, 0.44, 4);
    leftEarGeo.scale(1.2, 1.0, 0.42); // Flatten along front-to-back axis
    const leftEar = new THREE.Mesh(leftEarGeo, mugMaterial);
    leftEar.position.set(-0.55, 1.05, 0.28);
    leftEar.rotation.set(-0.12, 0.2, 0.15); // tilted outward
    leftEar.castShadow = true;
    mugGroup.add(leftEar);

    // Embedded metallic left inner ear cone
    const leftInnerEarGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
    leftInnerEarGeo.scale(1.15, 1.0, 0.28);
    const leftInnerEar = new THREE.Mesh(leftInnerEarGeo, accentMaterial);
    leftInnerEar.position.set(-0.54, 1.10, 0.33);
    leftInnerEar.rotation.copy(leftEar.rotation);
    mugGroup.add(leftInnerEar);

    const rightEarGeo = new THREE.ConeGeometry(0.24, 0.44, 4);
    rightEarGeo.scale(1.2, 1.0, 0.42);
    const rightEar = new THREE.Mesh(rightEarGeo, mugMaterial);
    rightEar.position.set(0.55, 1.05, 0.28);
    rightEar.rotation.set(-0.12, -0.2, -0.15); // tilted outward symmetric
    rightEar.castShadow = true;
    mugGroup.add(rightEar);

    // Embedded metallic right inner ear cone
    const rightInnerEarGeo = new THREE.ConeGeometry(0.14, 0.28, 4);
    rightInnerEarGeo.scale(1.15, 1.0, 0.28);
    const rightInnerEar = new THREE.Mesh(rightInnerEarGeo, accentMaterial);
    rightInnerEar.position.set(0.54, 1.10, 0.33);
    rightInnerEar.rotation.copy(rightEar.rotation);
    mugGroup.add(rightInnerEar);

    // F. Cute curling tail-handle at side
    const handleGeo = new THREE.TorusGeometry(0.55, 0.115, 16, 48, Math.PI * 1.35);
    const handle = new THREE.Mesh(handleGeo, mugMaterial);
    handle.position.set(0.85, -0.05, 0);
    handle.rotation.set(0, 0, -Math.PI * 0.65); // Rotate to secure standard loop
    handle.castShadow = true;
    mugGroup.add(handle);

    // Tail spinal accent ribbon (flowing golden strip)
    const handleSpineGeo = new THREE.TorusGeometry(0.57, 0.024, 8, 48, Math.PI * 1.35);
    const handleSpine = new THREE.Mesh(handleSpineGeo, accentMaterial);
    handleSpine.position.copy(handle.position);
    handleSpine.rotation.copy(handle.rotation);
    mugGroup.add(handleSpine);

    // G. Visualizer Cheek Blush (Soft Matte Pink circular pieces facing forward)
    const blushGeo = new THREE.CircleGeometry(0.11, 16);
    const blushMat = new THREE.MeshBasicMaterial({
      color: 0xf43f5e,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });
    // Left blush
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.46, 0.08, 0.81);
    leftBlush.rotation.set(0.04, -0.52, 0); // rotated to follow profile curve
    mugGroup.add(leftBlush);
    // Right blush
    const rightBlush = new THREE.Mesh(blushGeo, blushMat);
    rightBlush.position.set(0.46, 0.08, 0.81);
    rightBlush.rotation.set(0.04, 0.52, 0);
    mugGroup.add(rightBlush);

    // H. Fully 3D modeled cat facial features
    // Closed smiling eyes
    const eyeGeo = new THREE.TorusGeometry(0.125, 0.022, 6, 24, Math.PI);
    // Left eye
    const leftEye = new THREE.Mesh(eyeGeo, accentMaterial);
    leftEye.position.set(-0.31, 0.20, 0.85);
    leftEye.rotation.set(Math.PI * 1.05, -0.34, 0.1); // curve downward + outwards Y-rotation
    mugGroup.add(leftEye);
    // Right eye
    const rightEye = new THREE.Mesh(eyeGeo, accentMaterial);
    rightEye.position.set(0.31, 0.20, 0.85);
    rightEye.rotation.set(Math.PI * 1.05, 0.34, -0.1);
    mugGroup.add(rightEye);

    // Inverted golden nose triangle
    const noseGeo = new THREE.ConeGeometry(0.05, 0.07, 3);
    const nose = new THREE.Mesh(noseGeo, accentMaterial);
    nose.position.set(0, 0.06, 0.90);
    nose.rotation.set(Math.PI, 0, 0); // inverted
    mugGroup.add(nose);

    // Smiling kitty mouth loops (:3 mouth shape)
    const mouthGeo = new THREE.TorusGeometry(0.065, 0.016, 6, 16, Math.PI);
    const leftMouth = new THREE.Mesh(mouthGeo, accentMaterial);
    leftMouth.position.set(-0.062, -0.015, 0.90);
    leftMouth.rotation.set(0.05, -0.1, 0);
    mugGroup.add(leftMouth);

    const rightMouth = new THREE.Mesh(mouthGeo, accentMaterial);
    rightMouth.position.set(0.062, -0.015, 0.90);
    rightMouth.rotation.set(0.05, 0.1, 0);
    mugGroup.add(rightMouth);

    // Whiskers (3 left tubes, 3 right tubes)
    const whiskerGeo = new THREE.CylinderGeometry(0.012, 0.012, 0.32, 8);
    // Left side whiskers
    const leftW1 = new THREE.Mesh(whiskerGeo, accentMaterial);
    leftW1.position.set(-0.76, 0.08, 0.61);
    leftW1.rotation.set(0.1, -0.75, Math.PI / 2 + 0.15); // pointing up
    mugGroup.add(leftW1);

    const leftW2 = new THREE.Mesh(whiskerGeo, accentMaterial);
    leftW2.position.set(-0.78, 0.02, 0.58);
    leftW2.rotation.set(0.1, -0.75, Math.PI / 2); // straight
    mugGroup.add(leftW2);

    const leftW3 = new THREE.Mesh(whiskerGeo, accentMaterial);
    leftW3.position.set(-0.76, -0.04, 0.61);
    leftW3.rotation.set(0.1, -0.75, Math.PI / 2 - 0.15); // pointing down
    mugGroup.add(leftW3);

    // Right side whiskers
    const rightW1 = new THREE.Mesh(whiskerGeo, accentMaterial);
    rightW1.position.set(0.76, 0.08, 0.61);
    rightW1.rotation.set(0.1, 0.75, -Math.PI / 2 - 0.15);
    mugGroup.add(rightW1);

    const rightW2 = new THREE.Mesh(whiskerGeo, accentMaterial);
    rightW2.position.set(0.78, 0.02, 0.58);
    rightW2.rotation.set(0.1, 0.75, -Math.PI / 2);
    mugGroup.add(rightW2);

    const rightW3 = new THREE.Mesh(whiskerGeo, accentMaterial);
    rightW3.position.set(0.76, -0.04, 0.61);
    rightW3.rotation.set(0.1, 0.75, -Math.PI / 2 + 0.15);
    mugGroup.add(rightW3);

    // 8. Animation frame clock-loop with dual action (orbital damping + soft auto idle spin)
    let idleRotationTimer = 0;
    let isInteracting = false;

    controls.addEventListener("start", () => {
      isInteracting = true;
    });
    controls.addEventListener("end", () => {
      isInteracting = false;
    });

    const tick = () => {
      // Rotate slowly if idling (no user drags on controls and isSpinning prop is requested)
      if (!isInteracting) {
        idleRotationTimer += 0.006;
        // Natural circular tilt oscillation
        mugGroup.rotation.y = isSpinning ? idleRotationTimer * 2 : idleRotationTimer * 0.4;
        mugGroup.rotation.z = Math.sin(idleRotationTimer) * 0.015;
      }

      controls.update();
      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(tick);
    };
    tick();

    // Responsive Canvas Resize handling
    const resizeObserver = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width: nw, height: nh } = entries[0].contentRect;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    });
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Clean up all resources when unmounted
    return () => {
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      controls.dispose();
      renderer.dispose();
      
      // Dispose materials and geometries
      mugCoreGeo.dispose();
      rimGeo.dispose();
      coffeeGeo.dispose();
      leftEarGeo.dispose();
      leftInnerEarGeo.dispose();
      rightEarGeo.dispose();
      rightInnerEarGeo.dispose();
      handleGeo.dispose();
      handleSpineGeo.dispose();
      blushGeo.dispose();
      eyeGeo.dispose();
      noseGeo.dispose();
      mouthGeo.dispose();
      whiskerGeo.dispose();
      floorGeo.dispose();

      coffeeMat.dispose();
      latteArtTex.dispose();
      blushMat.dispose();
      floorMat.dispose();

      if (mugMaterial) mugMaterial.dispose();
      if (accentMaterial) accentMaterial.dispose();
      if (coreClayTexture) coreClayTexture.dispose();
    };
  }, []);

  // UPDATING DYNAMIC PARAMETER EFFECT (Triggers instantly upon GUI customization changes)
  useEffect(() => {
    const mugMaterial = mugMaterialRef.current;
    const accentMaterial = accentMaterialRef.current;
    const keyLight = keyLightRef.current;
    const fillLight = fillLightRef.current;
    const ambientLight = ambientLightRef.current;
    const pointLeft = pointLightLeftRef.current;
    const pointRight = pointLightRightRef.current;

    // A. CLAY TEXTURE UPDATE
    if (mugMaterial) {
      // Dispose old texture
      if (coreClayTextureRef.current) {
        coreClayTextureRef.current.dispose();
      }

      // Generate new procedural clay (incorporating base tone + crackle if antique glaze selected)
      const isCrackled = glaze === "Craquelado Antiguo";
      const newClayTexture = generateProceduralClayTexture(clayOpt.rgb, isCrackled);
      if (newClayTexture) {
        mugMaterial.map = newClayTexture;
        coreClayTextureRef.current = newClayTexture;
        mugMaterial.needsUpdate = true;
      }
    }

    // B. GLAZE STYLE & PHYSICAL REFLECTION PROPERTIES
    if (mugMaterial) {
      switch (glaze) {
        case "Esmalte Brillante": // High-gloss clearcoat glaze
          mugMaterial.roughness = 0.08;
          mugMaterial.metalness = 0.08;
          mugMaterial.clearcoat = 1.0;
          mugMaterial.clearcoatRoughness = 0.05;
          break;
        case "Mate Sedoso": // Silky satin-like feel
          mugMaterial.roughness = 0.42;
          mugMaterial.metalness = 0.0;
          mugMaterial.clearcoat = 0.12;
          mugMaterial.clearcoatRoughness = 0.35;
          break;
        case "Textura Rústica": // Rough organic pottery texture
          mugMaterial.roughness = 0.88;
          mugMaterial.metalness = 0.0;
          mugMaterial.clearcoat = 0.0;
          mugMaterial.clearcoatRoughness = 0.0;
          break;
        case "Craquelado Antiguo": // Glass clearcoat over crackled clay
          mugMaterial.roughness = 0.16;
          mugMaterial.metalness = 0.1;
          mugMaterial.clearcoat = 0.88;
          mugMaterial.clearcoatRoughness = 0.12;
          break;
        default:
          break;
      }
      mugMaterial.needsUpdate = true;
    }

    // C. METALLIC ACCENT SURFACE PROPERTIES
    if (accentMaterial) {
      switch (accent) {
        case "Oro de 24k (Lujoso)":
          accentMaterial.color.setHex(0xe2b86b);
          accentMaterial.metalness = 0.95;
          accentMaterial.roughness = 0.11;
          accentMaterial.clearcoat = 1.0;
          accentMaterial.clearcoatRoughness = 0.04;
          break;
        case "Platina Líquida":
          accentMaterial.color.setHex(0xd4d4d8);
          accentMaterial.metalness = 0.98;
          accentMaterial.roughness = 0.08;
          accentMaterial.clearcoat = 1.0;
          accentMaterial.clearcoatRoughness = 0.02;
          break;
        case "Capa Perlada (Irisada)":
          accentMaterial.color.setHex(0xfae8ff);
          accentMaterial.metalness = 0.44;
          accentMaterial.roughness = 0.22;
          accentMaterial.clearcoat = 1.0;
          accentMaterial.clearcoatRoughness = 0.12;
          break;
        case "Sin Metales (Minimal)":
          // Plain matte charcoal clay accent color
          accentMaterial.color.setHex(0x374151);
          accentMaterial.metalness = 0.05;
          accentMaterial.roughness = 0.65;
          accentMaterial.clearcoat = 0.0;
          accentMaterial.clearcoatRoughness = 0.0;
          break;
        default:
          break;
      }
      accentMaterial.needsUpdate = true;
    }

    // D. STUDIO LIGHTING RIG CUSTOMIZATION
    // Smooth transition between environments
    if (keyLight && fillLight && ambientLight && pointLeft && pointRight) {
      switch (lighting) {
        case "Atardecer Cálido": {
          // Fire ambiance: golden sun key, copper ambient, purple backlights inactive
          ambientLight.color.setHex(0x7c2d12);
          ambientLight.intensity = 0.5;

          keyLight.color.setHex(0xffe0cc);
          keyLight.position.set(6, 4, 3);
          keyLight.intensity = 1.8;

          fillLight.color.setHex(0xca8a04);
          fillLight.position.set(-5, 2, -2);
          fillLight.intensity = 0.7;

          pointLeft.intensity = 0;
          pointRight.intensity = 0;
          break;
        }
        case "Cyberpunk Neón": {
          // Futuristic contrasting lights: cyan left and magenta right glowing intensely
          ambientLight.color.setHex(0x2e1065);
          ambientLight.intensity = 0.8;

          keyLight.color.setHex(0x06b6d4);
          keyLight.position.set(-4, 2, 4);
          keyLight.intensity = 1.6;

          fillLight.color.setHex(0xec4899);
          fillLight.position.set(4, 2, 4);
          fillLight.intensity = 1.6;

          pointLeft.color.setHex(0x06b6d4);
          pointLeft.intensity = 1.5;

          pointRight.color.setHex(0xec4899);
          pointRight.intensity = 1.5;
          break;
        }
        case "Brillo Nórdico (Limpio)": {
          // Cozy arctic morning: crisp slate key, white diffuse reflections
          ambientLight.color.setHex(0xe2e8f0);
          ambientLight.intensity = 0.6;

          keyLight.color.setHex(0xf0f9ff);
          keyLight.position.set(3, 6, 2);
          keyLight.intensity = 1.5;

          fillLight.color.setHex(0x94a3b8);
          fillLight.position.set(-4, 2, -3);
          fillLight.intensity = 0.5;

          pointLeft.intensity = 0;
          pointRight.intensity = 0;
          break;
        }
        default: // "Estudio 3D (Suave)" standard rig
          ambientLight.color.setHex(0xffffff);
          ambientLight.intensity = 0.45;

          keyLight.color.setHex(0xffffff);
          keyLight.position.set(5, 5, 4);
          keyLight.intensity = 1.2;

          fillLight.color.setHex(0xeef2f6);
          fillLight.position.set(-5, 3, -2);
          fillLight.intensity = 0.55;

          pointLeft.intensity = 0;
          pointRight.intensity = 0;
          break;
      }
    }
  }, [clay, glaze, accent, lighting]);

  return (
    <div
      id="mug-canvas-container"
      className="relative w-full aspect-square rounded-2xl overflow-hidden border border-white/10 bg-black/25 shadow-[inset_0_4px_16px_rgba(0,0,0,0.4)] flex items-center justify-center p-0 cursor-grab active:cursor-grabbing transition-colors duration-500"
    >
      {/* 3D Scene viewport container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Dynamic ambient environment badge on top-left overlay */}
      <div className="absolute top-2.5 left-2.5 px-2.5 py-0.5 bg-black/45 backdrop-blur-md rounded-full text-[9px] font-mono font-semibold tracking-wide text-slate-300 border border-white/8 flex items-center gap-1.5 pointer-events-none select-none">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            lighting === "Cyberpunk Neón" ? "bg-fuchsia-400 animate-pulse" : "bg-[#e2b86b] gold-accent"
          }`}
        />
        {lighting.toUpperCase()}
      </div>

      {/* Floating Interaction Tips overlay */}
      <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-mono tracking-widest text-[#e2b86b] uppercase opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none select-none">
        Arrastra para orbitar las tazas • Zoom con scroll
      </div>
    </div>
  );
};

