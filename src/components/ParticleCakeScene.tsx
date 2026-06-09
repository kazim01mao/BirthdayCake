import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Compass, RotateCw, Wind, Info, CheckCircle2 } from 'lucide-react';

interface ParticleCakeSceneProps {
  step: number;
  isExtinguished: boolean;
  onBlowTriggered: () => void;
}

interface FireworkType {
  positions: Float32Array;
  colors: Float32Array;
  velocities: THREE.Vector3[];
  geometry: THREE.BufferGeometry;
  points: THREE.Points;
  age: number;
  maxAge: number;
}

export default function ParticleCakeScene({ step, isExtinguished, onBlowTriggered }: ParticleCakeSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const statusLabelRef = useRef<HTMLSpanElement>(null);

  // Sensor reading states
  const [gyroSupported, setGyroSupported] = useState<boolean>(true);
  const [gyroAuthorized, setGyroAuthorized] = useState<boolean>(false);
  const [isFlat, setIsFlat] = useState<boolean>(false);
  const [betaValue, setBetaValue] = useState<number>(0);
  const [gammaValue, setGammaValue] = useState<number>(0);
  const [showPermissionPrompt, setShowPermissionPrompt] = useState<boolean>(false);

  // 3D Engine References using useRef to avoid React state re-render lags
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  
  // Particle Systems References
  const cakeGroupRef = useRef<THREE.Group | null>(null);
  const candleFlameRef = useRef<THREE.Points | null>(null);
  const helixPointsRef = useRef<THREE.Points | null>(null);
  const starFieldRef = useRef<THREE.Points | null>(null);
  
  // Animation Phase Controls
  const flameIntensityRef = useRef<number>(1.0);
  const fireworksRef = useRef<FireworkType[]>([]);
  const flatTimeRef = useRef<number>(0);
  const isTriggeredRef = useRef<boolean>(false);
  const orientationRef = useRef<{ beta: number; gamma: number; isFlat: boolean }>({
    beta: 999,
    gamma: 999,
    isFlat: false,
  });
  const controlsInteractingRef = useRef<boolean>(false);

  // Watch for isExtinguished state change
  useEffect(() => {
    if (isExtinguished) {
      isTriggeredRef.current = true;
      // Trigger a batch of fireworks!
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          createFireworkBurst();
        }, i * 260);
      }
    }
  }, [isExtinguished]);

  // Handle Gyroscope Event Listener
  const handleOrientation = (e: DeviceOrientationEvent) => {
    if (isTriggeredRef.current || step !== 2) return;

    const beta = e.beta !== null ? e.beta : 0;
    const gamma = e.gamma !== null ? e.gamma : 0;

    setBetaValue(Math.round(beta));
    setGammaValue(Math.round(gamma));

    // Screen-up flat is usually beta ~= 0 and gamma ~= 0. Some mobile browsers
    // report around 180 when screen-down, so accept that as a stable flat pose too.
    const normalizedBeta = Math.min(Math.abs(beta), Math.abs(Math.abs(beta) - 180));
    const isPhoneFlat = normalizedBeta < 35 && Math.abs(gamma) < 35;
    orientationRef.current = { beta, gamma, isFlat: isPhoneFlat };
    setIsFlat(isPhoneFlat);
  };

  // Check orientation API on page 2
  useEffect(() => {
    if (step === 2) {
      // Check if feature is available
      if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
        const reqPermission = (DeviceOrientationEvent as any).requestPermission;
        if (typeof reqPermission === 'function') {
          // iOS requires explicit permission first
          setShowPermissionPrompt(true);
        } else {
          // Android and modern Desktop allows binding directly
          window.addEventListener('deviceorientation', handleOrientation);
          setGyroAuthorized(true);
        }
      } else {
        setGyroSupported(false);
      }
    }

    return () => {
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, [step]);

  const requestGyroPermission = async () => {
    const reqPermission = (DeviceOrientationEvent as any).requestPermission;
    if (typeof reqPermission === 'function') {
      try {
        const response = await reqPermission();
        if (response === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation);
          setGyroAuthorized(true);
          setShowPermissionPrompt(false);
        } else {
          alert("您拒絕了陀螺儀授權。別擔心，您仍可以使用「模擬吹氣」按鈕完成體驗！");
          setGyroAuthorized(false);
          setShowPermissionPrompt(false);
        }
      } catch (e) {
        console.error("Gyro authorization request failed:", e);
        setShowPermissionPrompt(false);
      }
    }
  };

  // Helper function to create white particle texture
  const createCircleTexture = (): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.25)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
    }
    return new THREE.CanvasTexture(canvas);
  };

  // Helper to trigger fireworks bursts
  const createFireworkBurst = () => {
    if (!sceneRef.current) return;
    
    const colors = [
      0xf43f5e, // Radiant Pink
      0xd4ab59, // Classic Gold
      0x38bdf8, // Electric Blue
      0xc084fc, // Nebula Purple
      0x34d399  // Mint Emerald
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const firework = createFirework(
      new THREE.Vector3(
        (Math.random() - 0.5) * 4,
        3.5 + Math.random() * 2.5,
        (Math.random() - 0.5) * 4
      ),
      randomColor
    );
    
    sceneRef.current.add(firework.points);
    fireworksRef.current.push(firework);
  };

  const createFirework = (position: THREE.Vector3, colorHex: number): FireworkType => {
    const pCount = 280;
    const positions = new Float32Array(pCount * 3);
    const colors = new Float32Array(pCount * 3);
    const velocities: THREE.Vector3[] = [];

    const baseColor = new THREE.Color(colorHex);
    const brightColor = new THREE.Color(0xffffff);

    for (let i = 0; i < pCount; i++) {
      // Start all particles at the explosion origin
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Expand randomly inside a 3D sphere
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const speed = 0.08 + Math.random() * 0.14;

      const vx = speed * Math.sin(phi) * Math.cos(theta);
      const vy = speed * Math.sin(phi) * Math.sin(theta) + 0.03; // slightly upwards bias
      const vz = speed * Math.cos(phi);
      
      velocities.push(new THREE.Vector3(vx, vy, vz));

      // Color variation: blend from raw color to bright white center
      const blend = Math.random();
      const mixedColor = baseColor.clone().lerp(brightColor, blend * 0.4);
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particleTexture = createCircleTexture();
    const material = new THREE.PointsMaterial({
      size: 0.18,
      map: particleTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });

    const points = new THREE.Points(geometry, material);

    return {
      positions,
      colors,
      velocities,
      geometry,
      points,
      age: 0,
      maxAge: 75 + Math.floor(Math.random() * 30)
    };
  };

  // Main Three.js Scene Setup Lifecycle
  useEffect(() => {
    if (!containerRef.current) return;

    // 1. Initial Scene Setup
    const width = containerRef.current.clientWidth || window.innerWidth;
    const height = containerRef.current.clientHeight || window.innerHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050507, 0.05);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position slightly above the cake looking down elegantly
    camera.position.set(0, 2.6, 7.2);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050507, 1);
    renderer.domElement.style.touchAction = 'none';
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Add delicate ambient illumination to color core volume
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);

    // 2. Beautiful Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableRotate = true;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.rotateSpeed = 0.9;
    controls.zoomSpeed = 0.6;
    controls.touches.ONE = THREE.TOUCH.ROTATE;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
    controls.target.set(0, 0.75, 0);
    controls.minPolarAngle = Math.PI * 0.22;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.minDistance = 4.6;
    controls.maxDistance = 9.5;
    controls.addEventListener('start', () => {
      controlsInteractingRef.current = true;
    });
    controls.addEventListener('end', () => {
      controlsInteractingRef.current = false;
    });
    controls.update();
    controlsRef.current = controls;

    // 3. UnrealBloomPost-processing Configuration
    const renderScene = new RenderPass(scene, camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(width, height),
      1.8,  // strength
      0.65, // radius
      0.08  // threshold (low for glowing candles)
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);
    composerRef.current = composer;

    // 4. Create Decorative Dark Space Background
    const starCount = 600;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      // Distribute randomly in a sphere
      const r = 25 + Math.random() * 20;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      
      starPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      starPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPos[i * 3 + 2] = r * Math.cos(phi);
    }
    starGeom.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.1,
      color: 0xd4ab59,
      transparent: true,
      opacity: 0.4,
      map: createCircleTexture(),
      blending: THREE.AdditiveBlending
    });
    const starField = new THREE.Points(starGeom, starMat);
    scene.add(starField);
    starFieldRef.current = starField;

    // 5. Build the Grand Luxury 3D Particle Cake Setup
    const cakeGroup = new THREE.Group();
    cakeGroup.position.set(0, -0.25, 0);
    scene.add(cakeGroup);
    cakeGroupRef.current = cakeGroup;

    const particleTexture = createCircleTexture();

    // Helper to generate a hollow-cylinder aesthetic tier
    const buildCakeTier = (
      params: { radius: number; height: number; startY: number; pCount: number; accentColor: number; subColor: number }
    ) => {
      const { radius, height, startY, pCount, accentColor, subColor } = params;
      const positions = new Float32Array(pCount * 3);
      const colors = new Float32Array(pCount * 3);

      const colorA = new THREE.Color(accentColor);
      const colorB = new THREE.Color(subColor);

      for (let i = 0; i < pCount; i++) {
        // We pack layers primarily on the outer shell, with some volume inward
        const isShell = Math.random() > 0.15;
        const rFactor = isShell ? (0.95 + Math.random() * 0.08) : Math.random();
        const r = radius * rFactor;
        const theta = Math.random() * Math.PI * 2;
        const y = startY + Math.random() * height;

        positions[i * 3] = r * Math.cos(theta);
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = r * Math.sin(theta);

        // Mix custom high-luxury gradients
        const lerpVal = Math.random();
        const mixedColor = colorA.clone().lerp(colorB, lerpVal);
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
      }

      const geom = new THREE.BufferGeometry();
      geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      // Slightly larger particles for the base, tapering up
      const sizeVal = 0.08 + (radius * 0.015);
      const mat = new THREE.PointsMaterial({
        size: sizeVal,
        map: particleTexture,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        vertexColors: true
      });

      return new THREE.Points(geom, mat);
    };

    // Construct the three stunning tiers
    // Bottom Tiers: Royal Gold & Champagne
    const tier1 = buildCakeTier({
      radius: 2.2,
      height: 1.0,
      startY: -1.0,
      pCount: 2800,
      accentColor: 0xd4ab59, // Gold
      subColor: 0x8b561c    // Cocoa brown
    });
    cakeGroup.add(tier1);

    // Middle Tiers: French Rose Pink & Coral
    const tier2 = buildCakeTier({
      radius: 1.6,
      height: 0.9,
      startY: 0.0,
      pCount: 2000,
      accentColor: 0xf43f5e, // Cherry Rose
      subColor: 0xfbcfe8    // Sweet Candy
    });
    cakeGroup.add(tier2);

    // Top Tiers: Creamy Pearl White & Champagne Glow
    const tier3 = buildCakeTier({
      radius: 1.0,
      height: 0.8,
      startY: 0.9,
      pCount: 1200,
      accentColor: 0xe6ce93, // Light gold
      subColor: 0xfff1f2    // Cream rose
    });
    cakeGroup.add(tier3);

    // 6. Assemble the Candle Stick and Flickering Flame
    // Candle Stick: fine cylindrical column of silver/blue particles
    const candleCount = 180;
    const candleGeom = new THREE.BufferGeometry();
    const candlePos = new Float32Array(candleCount * 3);
    const candleColors = new Float32Array(candleCount * 3);
    const stickBottom = 1.7;
    const stickTop = 2.4;

    for (let i = 0; i < candleCount; i++) {
      const hFract = Math.random();
      const y = stickBottom + hFract * (stickTop - stickBottom);
      
      // Fine spiral width cylindrical shell
      const r = 0.06;
      const angle = hFract * Math.PI * 12; // spiral striping
      
      candlePos[i * 3] = r * Math.cos(angle);
      candlePos[i * 3 + 1] = y;
      candlePos[i * 3 + 2] = r * Math.sin(angle);

      // Light blue to gold gradient candle stick
      const colorHex = Math.random() > 0.4 ? 0xf0fdf4 : 0x38bdf8;
      const c = new THREE.Color(colorHex);
      candleColors[i * 3] = c.r;
      candleColors[i * 3 + 1] = c.g;
      candleColors[i * 3 + 2] = c.b;
    }
    candleGeom.setAttribute('position', new THREE.BufferAttribute(candlePos, 3));
    candleGeom.setAttribute('color', new THREE.BufferAttribute(candleColors, 3));
    
    const candleMat = new THREE.PointsMaterial({
      size: 0.1,
      map: particleTexture,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      vertexColors: true
    });
    const candleStick = new THREE.Points(candleGeom, candleMat);
    cakeGroup.add(candleStick);

    // Candle Flame System: warm flicker particle cloud
    const flameCount = 350;
    const flameGeom = new THREE.BufferGeometry();
    const flamePos = new Float32Array(flameCount * 3);
    const flameColors = new Float32Array(flameCount * 3);
    const flameCenterY = stickTop + 0.1;

    for (let i = 0; i < flameCount; i++) {
      // Shape of candle flame: teardrop shape
      const heightVal = Math.random(); // 0 to 1
      const maxW = 0.18 * (1.0 - Math.pow(heightVal - 0.3, 2)); // wider at bottom, sharp on top
      const theta = Math.random() * Math.PI * 2;
      const w = Math.random() * maxW;

      const px = w * Math.cos(theta);
      const py = flameCenterY + heightVal * 0.7;
      const pz = w * Math.sin(theta);

      flamePos[i * 3] = px;
      flamePos[i * 3 + 1] = py;
      flamePos[i * 3 + 2] = pz;

      // Inner heat (white-orange) to outer heat (scarlet red)
      const blend = Math.pow(heightVal, 1.5);
      const c = new THREE.Color(0xffffff).lerp(new THREE.Color(0xff4500), blend);
      flameColors[i * 3] = c.r;
      flameColors[i * 3 + 1] = c.g;
      flameColors[i * 3 + 2] = c.b;
    }

    flameGeom.setAttribute('position', new THREE.BufferAttribute(flamePos, 3));
    flameGeom.setAttribute('color', new THREE.BufferAttribute(flameColors, 3));

    const flameMat = new THREE.PointsMaterial({
      size: 0.16,
      map: particleTexture,
      transparent: true,
      opacity: 1.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    const candleFlame = new THREE.Points(flameGeom, flameMat);
    cakeGroup.add(candleFlame);
    candleFlameRef.current = candleFlame;

    // 7. Winding Helix Golden Spark Ribbon
    // "有一條由更亮、密度更高的粒子組成的螺旋光帶，緊緊圍繞著蛋糕盤旋而上。"
    const helixCount = 1200;
    const helixGeom = new THREE.BufferGeometry();
    const helixPos = new Float32Array(helixCount * 3);
    const helixColors = new Float32Array(helixCount * 3);

    for (let i = 0; i < helixCount; i++) {
      const fract = i / helixCount;
      const y = -1.2 + fract * 3.4; // covers bottom up to top
      const angle = fract * Math.PI * 8; // circles 4 times
      
      // Radius varies slightly bigger at bottom, tapering up
      const r = (2.4 - fract * 1.0) + (Math.random() - 0.5) * 0.15;
      
      helixPos[i * 3] = r * Math.cos(angle);
      helixPos[i * 3 + 1] = y;
      helixPos[i * 3 + 2] = r * Math.sin(angle);

      // Gold stars gradient
      const c = new THREE.Color(0xffffff).lerp(new THREE.Color(0xd4ab59), 0.7);
      helixColors[i * 3] = c.r;
      helixColors[i * 3 + 1] = c.g;
      helixColors[i * 3 + 2] = c.b;
    }
    helixGeom.setAttribute('position', new THREE.BufferAttribute(helixPos, 3));
    helixGeom.setAttribute('color', new THREE.BufferAttribute(helixColors, 3));

    const helixMat = new THREE.PointsMaterial({
      size: 0.14,
      map: particleTexture,
      transparent: true,
      opacity: 0.95,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true
    });
    const helixPoints = new THREE.Points(helixGeom, helixMat);
    cakeGroup.add(helixPoints);
    helixPointsRef.current = helixPoints;

    // 8. Animation & Render Clock
    const clock = new THREE.Clock();
    let animId: number;

    const tick = () => {
      const elapsedTime = clock.getElapsedTime();
      const delta = clock.getDelta();

      // Controls update
      controls.update();

      // Gentle idle rotation without fighting finger drag.
      if (cakeGroup && !controlsInteractingRef.current && step === 2) {
        cakeGroup.rotation.y += delta * 0.12;
      }

      // Slowly drift star fields in background
      if (starField) {
        starField.rotation.y = elapsedTime * 0.02;
        starField.rotation.x = Math.sin(elapsedTime * 0.01) * 0.05;
      }

      // Dynamic wind distortion to Helix (gently moving up the helix)
      if (helixPoints) {
        const positions = helixGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < helixCount; i++) {
          const fract = i / helixCount;
          // Dynamically swirl the helix coordinates
          const angle = fract * Math.PI * 8 + (elapsedTime * 1.5);
          const r = (2.4 - fract * 1.0) + Math.sin(elapsedTime * 2 + i) * 0.08;
          positions[i * 3] = r * Math.cos(angle);
          positions[i * 3 + 2] = r * Math.sin(angle);
        }
        helixGeom.attributes.position.needsUpdate = true;
      }

      // Live flicker and wind distortion on Candle flame
      if (flameIntensityRef.current > 0.0) {
        // Handle Extinguish Animation
        if (isTriggeredRef.current) {
          flameIntensityRef.current = Math.max(0, flameIntensityRef.current - delta * 2.5);
          flameMat.opacity = flameIntensityRef.current;
          flameMat.size = 0.16 * flameIntensityRef.current;
        }

        const positions = flameGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < flameCount; i++) {
          const baseIdx = i * 3;
          // Random slight flickering oscillation
          const flickerX = Math.sin(elapsedTime * 20 + i) * 0.015;
          const flickerZ = Math.cos(elapsedTime * 20 + i) * 0.015;
          
          // Apply slight upward drift logic
          positions[baseIdx] += flickerX;
          positions[baseIdx + 2] += flickerZ;

          // Limit drift to keep flame cohesive
          const heightVal = (positions[baseIdx + 1] - flameCenterY) / 0.7; // 0 to 1
          const maxWidth = 0.22 * (1.0 - Math.pow(heightVal - 0.3, 2));

          const dist = Math.sqrt(positions[baseIdx] * positions[baseIdx] + positions[baseIdx + 2] * positions[baseIdx + 2]);
          if (dist > maxWidth) {
            positions[baseIdx] *= 0.9;
            positions[baseIdx + 2] *= 0.9;
          }
        }
        flameGeom.attributes.position.needsUpdate = true;
      }

      // Animated WebGL Fireworks Particle Lifecycle
      const activeFireworks = fireworksRef.current;
      for (let f = activeFireworks.length - 1; f >= 0; f--) {
        const fw = activeFireworks[f];
        fw.age++;

        // Update positions using vectors
        const positions = fw.geometry.attributes.position.array as Float32Array;
        const velocities = fw.velocities;
        
        for (let i = 0; i < velocities.length; i++) {
          const v = velocities[i];
          positions[i * 3] += v.x;
          positions[i * 3 + 1] += v.y;
          positions[i * 3 + 2] += v.z;

          // Apply slight air friction & gravity
          v.x *= 0.97;
          v.y *= 0.97;
          v.z *= 0.97;
          v.y -= 0.0012; // gravity fall
        }

        fw.geometry.attributes.position.needsUpdate = true;

        // Fade fireworks out on age
        const opacityFract = Math.max(0, 1.0 - (fw.age / fw.maxAge));
        (fw.points.material as THREE.PointsMaterial).opacity = opacityFract;

        // Clean-up dead fireworks
        if (fw.age >= fw.maxAge) {
          scene.remove(fw.points);
          fw.geometry.dispose();
          (fw.points.material as THREE.PointsMaterial).dispose();
          activeFireworks.splice(f, 1);
        }
      }

      // Check flat sensor countdown on step 2
      if (step === 2 && !isTriggeredRef.current) {
        if (orientationRef.current.isFlat) {
          // If flat orientation is established
          flatTimeRef.current += delta;
          
          // Update auto-blowout countdown
          const remainingCountdown = Math.max(0, 2.2 - flatTimeRef.current);
          
          const p = Math.min(1.0, flatTimeRef.current / 2.2);
          
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `${p * 100}%`;
          }
          if (statusLabelRef.current) {
            const remainingTime = Math.ceil(remainingCountdown * 10) / 10;
            statusLabelRef.current.textContent = 
              flatTimeRef.current >= 0.5 
                ? `即將自動熄滅... (${remainingTime}秒)`
                : `偵測平放中...`;
          }

          // Auto-blowout after being flat for 2.2 seconds
          if (flatTimeRef.current >= 2.2) {
            isTriggeredRef.current = true;
            onBlowTriggered();
          }
        } else {
          // Reset flat timer
          flatTimeRef.current = 0;
          if (progressBarRef.current) {
            progressBarRef.current.style.width = `0%`;
          }
          if (statusLabelRef.current) {
            statusLabelRef.current.textContent = `請將手機放平`;
          }
        }
      }

      // Composer output is vital for Bloom Pass Glow
      composer.render();
      animId = requestAnimationFrame(tick);
    };

    tick();

    // 9. Resize Handling
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera || !composer) return;
      
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();

      renderer.setSize(w, h);
      composer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    // Clean-up standard WebGL resources fully on unmount
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
      
      // Dispose geometry/materials
      scene.traverse((object: any) => {
        if (object.isPoints) {
          object.geometry.dispose();
          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
      
      renderer.dispose();
    };
  }, [step]);

  // Handle forcing/simulating the blowing event (highly useful for desktops)
  const forceBlowEvent = () => {
    if (isTriggeredRef.current) return;
    isTriggeredRef.current = true;
    onBlowTriggered();
  };

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* 3D WebGL Canvas Layer */}
      <div 
        ref={containerRef} 
        className={`w-full h-full touch-none transition-all duration-1000 ${
          step === 3 && isExtinguished ? 'filter brightness-90 animate-pulse-slow' : ''
        }`} 
      />

      {/* Interactive Sensor Overlay Container for Step 2 - Mobile optimized */}
      {step === 2 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-full max-w-sm px-3 sm:px-4 z-20 pointer-events-auto">
          <div className="glass-morphism rounded-2xl p-3 sm:p-4 shadow-xl border border-gold-300/10 flex flex-col items-center">
            
            {/* Visual Tilt Sensors Indicator */}
            <div className="flex items-center gap-2 w-full justify-between mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Compass className={`w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 ${isFlat ? 'text-gold-200 animate-spin' : 'text-gray-400'}`} />
                <span ref={statusLabelRef} className="text-xs font-serif font-semibold text-gold-100 uppercase tracking-wider truncate">
                  請將手機放平
                </span>
              </div>
              
              <div className="flex gap-2 font-mono text-[8px] sm:text-[9px] text-gray-400 flex-shrink-0 ml-1">
                <span>B: {betaValue}°</span>
                <span>G: {gammaValue}°</span>
              </div>
            </div>

            {/* Custom progress bar */}
            <div className="w-full h-2 bg-stone-900/80 rounded-full overflow-hidden border border-white/5 mb-3">
              <div ref={progressBarRef} className="h-full w-0 bg-gradient-to-r from-gold-400 to-pink-500 rounded-full transition-all duration-75" />
            </div>

            <p className="text-[9px] sm:text-[10px] text-gray-400 text-center leading-relaxed font-sans max-w-[280px]">
              {isFlat 
                ? "手機已平放，蠟燭即將熄滅並綻放禮花。"
                : "手指拖動屏幕中央蛋糕可旋轉。放平手機，或點擊下方按鈕吹熄蠟燭。"}
            </p>

            {/* Simulated blowout button for non-gyroscopic desktop testing */}
            <div className="w-full mt-3 pt-3 border-t border-white/5 flex flex-col justify-center items-center">
              <button
                onClick={forceBlowEvent}
                className="w-full py-2.5 bg-gold-400/10 hover:bg-gold-400/20 active:scale-95 border border-gold-400/20 hover:border-gold-300/40 text-xs sm:text-sm text-gold-200 font-serif font-medium rounded-lg flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer"
              >
                <Wind className="w-4 h-4 flex-shrink-0" />
                <span>吹熄蠟燭，放禮花</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Gyroscope IOS permission invitation dialog - Mobile optimized */}
      {showPermissionPrompt && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-30 flex items-center justify-center p-4 sm:p-6">
          <div className="glass-morphism rounded-3xl p-4 sm:p-6 max-w-sm w-full text-center space-y-3 sm:space-y-4 border border-gold-300/20 shadow-2xl">
            <Compass className="w-10 h-10 sm:w-12 sm:h-12 text-gold-300 mx-auto animate-pulse" />
            <h4 className="text-lg sm:text-xl font-serif font-bold text-gold-200">啟動陀螺儀感應</h4>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed font-sans">
              iOS 設備要求用戶手動授權啟用手機陀螺儀。這將允許您通過「平放手機」實現自動吹滅蠟燭的互動效果！
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={requestGyroPermission}
                className="w-full py-2.5 sm:py-3 bg-gradient-to-r from-gold-500 to-gold-300 hover:from-gold-600 hover:to-gold-400 text-black font-semibold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-gold-500/10 active:scale-95"
              >
                確認授權陀螺儀
              </button>
              <button
                onClick={() => {
                  setShowPermissionPrompt(false);
                  setGyroAuthorized(false);
                }}
                className="w-full py-2 text-stone-400 hover:text-stone-300 text-xs transition px-3 rounded-lg underline cursor-pointer"
              >
                不授權，直接使用手動按鈕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
