/**
 * Hero plane — Three.js renderer for a real Airbus A340 GLB model.
 *
 * Two WebGL renderers share one scene:
 *   • webglCanvas   — blueprint wireframe look (always visible)
 *   • solidCanvas   — warm opaque material, clipped to a circle at the
 *                     cursor position via CSS clip-path (updated each frame)
 *
 * Moving the cursor over the plane reveals the solid aircraft skin inside
 * a ~90px radius circle — like a torch cutting through the blueprint overlay.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const COLOR_BONE = 0xfaf3e8;

// Per-mesh solid colours — approximate A340 livery zones.
// Unmapped meshes (engine nacelles, etc.) fall back to dark metallic.
const SOLID_COLORS: Record<string, { color: number; specular: number; shininess: number }> = {
  Object_4:  { color: 0xF0EAE0, specular: 0x404040, shininess: 22  }, // fuselage — warm white
  Object_5:  { color: 0xC4C0B8, specular: 0x303030, shininess: 14  }, // belly    — medium grey
  Object_6:  { color: 0xF0EAE0, specular: 0x404040, shininess: 22  }, // tail fin — white
  Object_2:  { color: 0xDCDAD0, specular: 0x404040, shininess: 18  }, // wing L   — light grey
  Object_3:  { color: 0xDCDAD0, specular: 0x404040, shininess: 18  }, // wing R   — light grey
  Object_7:  { color: 0x6C6C70, specular: 0x909090, shininess: 70  }, // pylon    — metallic
  Object_8:  { color: 0x6C6C70, specular: 0x909090, shininess: 70  },
  Object_9:  { color: 0x6C6C70, specular: 0x909090, shininess: 70  },
  Object_10: { color: 0x6C6C70, specular: 0x909090, shininess: 70  },
};
// Fallback for any unmapped mesh (engine nacelles, gear doors, …)
const SOLID_DEFAULT = { color: 0x4E4E54, specular: 0xA0A0A0, shininess: 90 };

interface PlaneInstance {
  destroy: () => void;
}

export function initHeroPlane3D(
  webglCanvas: HTMLCanvasElement,
  modelUrl = "/models/plane-a340.glb",
): PlaneInstance {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ── Wireframe renderer (primary) ────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas: webglCanvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ── Solid-reveal renderer (secondary) ───────────────────────────
  const solidCanvas = document.getElementById("solid-plane-canvas") as HTMLCanvasElement | null;
  const solidRenderer = solidCanvas
    ? new THREE.WebGLRenderer({
        canvas: solidCanvas,
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      })
    : null;
  solidRenderer?.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  solidRenderer?.setClearColor(0x000000, 0);

  // ── Shared scene + camera ───────────────────────────────────────
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);

  // ── Lighting ────────────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.85));
  const key = new THREE.DirectionalLight(0xffffff, 0.6);
  key.position.set(5, 6, 5);
  scene.add(key);

  // ── Plane group ─────────────────────────────────────────────────
  const planeGroup = new THREE.Group();
  scene.add(planeGroup);

  // Materials + mesh list hoisted so tick() can swap between renders
  let bodyMat: THREE.MeshLambertMaterial | null = null;
  let edgeMat: THREE.LineBasicMaterial | null   = null;
  // Flat list of every mesh and its per-part solid PhongMaterial
  const solidMeshList: Array<{ mesh: THREE.Mesh; mat: THREE.MeshPhongMaterial }> = [];

  // Warm sun added only during the solid render pass for dramatic lighting
  const sunLight = new THREE.DirectionalLight(0xfff3d0, 1.1);
  sunLight.position.set(2, 8, 5);

  let modelLoaded = false;
  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      const model   = gltf.scene;
      const wrapper = new THREE.Group();
      wrapper.add(model);

      const bboxOrig = new THREE.Box3().setFromObject(model);
      const sizeOrig = new THREE.Vector3();
      bboxOrig.getSize(sizeOrig);
      wrapper.scale.setScalar(6.0 / Math.max(sizeOrig.x, sizeOrig.y, sizeOrig.z));

      const bboxScaled   = new THREE.Box3().setFromObject(wrapper);
      const centerScaled = new THREE.Vector3();
      bboxScaled.getCenter(centerScaled);
      wrapper.position.sub(centerScaled);

      // Wireframe materials (primary render)
      bodyMat = new THREE.MeshLambertMaterial({
        color:       COLOR_BONE,
        transparent: true,
        opacity:     0.12,
        depthWrite:  false,
        side:        THREE.DoubleSide,
      });
      edgeMat = new THREE.LineBasicMaterial({
        color:       COLOR_BONE,
        transparent: true,
        opacity:     0.85,
      });

      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!((mesh.isMesh as boolean) && mesh.geometry)) return;

        mesh.material      = bodyMat!;
        mesh.castShadow    = false;
        mesh.receiveShadow = false;

        // Edge overlay for wireframe pass
        const edges = new THREE.EdgesGeometry(mesh.geometry, 18);
        mesh.add(new THREE.LineSegments(edges, edgeMat!));

        // Per-part solid material for the reveal pass
        const spec = SOLID_COLORS[mesh.name] ?? SOLID_DEFAULT;
        const solidMat = new THREE.MeshPhongMaterial({
          color:       spec.color,
          specular:    spec.specular,
          shininess:   spec.shininess,
          transparent: true,
          opacity:     0.90,
          depthWrite:  false,
          side:        THREE.DoubleSide,
        });
        solidMeshList.push({ mesh, mat: solidMat });
      });

      planeGroup.add(wrapper);
      planeGroup.rotation.set(0.18, -Math.PI / 2, 0);
      planeGroup.position.set(0, 0.15, 0);
      modelLoaded = true;
    },
    undefined,
    (err) => { console.error("[heroPlane3d] GLTF load failed:", err); },
  );

  camera.position.set(0, 1.4, 9);
  camera.lookAt(0, 0, 0);

  // ── Cursor — hero-section tracking (flight path response) ───────
  const hero = webglCanvas.closest<HTMLElement>("[data-hero]");
  let cursorNX     = 0;
  let cursorNY     = 0;
  let cursorInHero = false;

  function onPointerMove(e: PointerEvent): void {
    if (!hero) return;
    const r  = hero.getBoundingClientRect();
    cursorNX = (e.clientX - r.left) / r.width  - 0.5;
    cursorNY = (e.clientY - r.top)  / r.height - 0.5;
    cursorInHero = true;
  }
  function onPointerLeave(): void { cursorInHero = false; }

  hero?.addEventListener("pointermove", onPointerMove, { passive: true });
  hero?.addEventListener("pointerleave", onPointerLeave);

  const baseRotX = 0.18;
  const baseRotY = -0.55;

  // ── Cursor — canvas-local tracking (circle reveal) ──────────────
  let revealX        = 0;   // px relative to webglCanvas left
  let revealY        = 0;   // px relative to webglCanvas top
  let revealHovering = false;
  let revealRadius   = 0;   // animated, 0 → TARGET_R

  const TARGET_R = 160;     // fully-open circle radius in CSS px

  function onCanvasPointerMove(e: PointerEvent): void {
    const r = webglCanvas.getBoundingClientRect();
    revealX       = e.clientX - r.left;
    revealY       = e.clientY - r.top;
    revealHovering = true;
  }
  function onCanvasPointerLeave(): void { revealHovering = false; }

  webglCanvas.addEventListener("pointermove",  onCanvasPointerMove, { passive: true });
  webglCanvas.addEventListener("pointerleave", onCanvasPointerLeave);

  // ── Contrail canvas + particle system ───────────────────────────
  const contrailCanvas = document.getElementById("contrail-canvas") as HTMLCanvasElement | null;
  const ctx2d          = contrailCanvas?.getContext("2d") ?? null;

  interface TrailParticle {
    x: number; y: number;
    vx: number; vy: number;
    life: number;
    radius: number;
  }
  const particles: TrailParticle[] = [];
  const MAX_PARTICLES = 280;

  const ENGINE_LOCALS = [
    new THREE.Vector3(-2.1, -0.38, -0.3),
    new THREE.Vector3(-1.0, -0.38, -0.3),
    new THREE.Vector3( 1.0, -0.38, -0.3),
    new THREE.Vector3( 2.1, -0.38, -0.3),
  ];

  function projectToScreen(localPos: THREE.Vector3): { x: number; y: number } | null {
    if (!contrailCanvas) return null;
    const w = contrailCanvas.clientWidth;
    const h = contrailCanvas.clientHeight;
    if (w === 0 || h === 0) return null;
    const world = localPos.clone();
    planeGroup.localToWorld(world);
    const ndc = world.clone().project(camera);
    if (ndc.z > 1) return null;
    return { x: (ndc.x * 0.5 + 0.5) * w, y: (-ndc.y * 0.5 + 0.5) * h };
  }

  function updateContrail(): void {
    if (!contrailCanvas || !ctx2d || !modelLoaded) return;
    const w = contrailCanvas.clientWidth;
    const h = contrailCanvas.clientHeight;
    if (w === 0 || h === 0) return;

    if (contrailCanvas.width !== w || contrailCanvas.height !== h) {
      contrailCanvas.width  = w;
      contrailCanvas.height = h;
    }

    if (particles.length < MAX_PARTICLES) {
      ENGINE_LOCALS.forEach((lp) => {
        const sc = projectToScreen(lp);
        if (!sc) return;
        particles.push({
          x: sc.x + (Math.random() - 0.5) * 5,
          y: sc.y + (Math.random() - 0.5) * 5,
          vx: (Math.random() - 0.5) * 0.3,
          vy:  0.05 + Math.random() * 0.15,
          life:   1.0,
          radius: 1.0 + Math.random() * 1.8,
        });
      });
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= 0.008;
      p.x += p.vx;
      p.y += p.vy;
      if (p.life <= 0) { particles.splice(i, 1); }
    }

    ctx2d.clearRect(0, 0, w, h);
    particles.forEach((p) => {
      const r = Math.max(0.4, p.radius * p.life);
      ctx2d.beginPath();
      ctx2d.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx2d.fillStyle = `rgba(250,243,232,${(p.life * 0.42).toFixed(3)})`;
      ctx2d.fill();
    });
  }

  // ── Resize ──────────────────────────────────────────────────────
  function resize(): void {
    const w = webglCanvas.clientWidth;
    const h = webglCanvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    if (solidRenderer && solidCanvas) {
      solidRenderer.setSize(solidCanvas.clientWidth || w, solidCanvas.clientHeight || h, false);
    }
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(webglCanvas);

  // ── Animation loop ──────────────────────────────────────────────
  let frameId   = 0;
  let stopped   = false;
  let startTime = 0;
  let curYaw3   = -Math.PI / 2;
  let curPitch3 = baseRotX;

  function tick(): void {
    if (stopped) return;
    frameId = requestAnimationFrame(tick);

    if (!modelLoaded) {
      renderer.render(scene, camera);
      return;
    }

    if (prefersReducedMotion) {
      planeGroup.rotation.set(baseRotX, baseRotY, 0);
      renderer.render(scene, camera);
      return;
    }

    if (startTime === 0) startTime = performance.now();
    const elapsed = (performance.now() - startTime) / 1000;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const ease = (t: number) => t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const P1 = 5.0;
    let yaw: number, pitch: number, bank: number, posX: number, posY: number;

    if (elapsed < P1) {
      const t = ease(elapsed / P1);
      yaw   = lerp(-Math.PI / 2, -0.55, t);
      pitch = 0.18;
      bank  = Math.sin(t * Math.PI) * 0.16;
      posX  = 0;
      posY  = 0.15;
      curYaw3   = yaw;
      curPitch3 = pitch;
    } else {
      const s = elapsed - P1;
      const tgtYaw   = cursorInHero ? -0.55 + cursorNX * 0.45   : -0.55;
      const tgtPitch = cursorInHero ? baseRotX - cursorNY * 0.28 : baseRotX;
      curYaw3   += (tgtYaw   - curYaw3)   * 0.012;
      curPitch3 += (tgtPitch - curPitch3) * 0.012;

      const vertDrift  = Math.sin(s * 0.21) * 0.07  + Math.sin(s * 0.38) * 0.035;
      const pitchDrift = Math.sin(s * 0.23) * 0.016 + Math.sin(s * 0.41) * 0.009;
      const rollWander = Math.sin(s * 0.29) * 0.012 + Math.sin(s * 0.13) * 0.007;
      const yawWander  = Math.sin(s * 0.17) * 0.008;

      yaw   = curYaw3   + yawWander;
      pitch = curPitch3 + pitchDrift;
      bank  = (curYaw3 - (-0.55)) * 0.28 + rollWander;
      posX  = 0;
      posY  = 0.15 + vertDrift;
    }

    planeGroup.position.set(posX, posY, 0);
    planeGroup.rotation.x = pitch;
    planeGroup.rotation.y = yaw;
    planeGroup.rotation.z = bank;

    // ── Primary render: wireframe blueprint ──────────────────────
    renderer.render(scene, camera);
    updateContrail();

    // ── Circle reveal: animate radius + render solid ──────────────
    if (solidRenderer && solidCanvas && bodyMat && edgeMat) {
      const targetR = revealHovering ? TARGET_R : 0;
      revealRadius += (targetR - revealRadius) * 0.12;

      if (revealRadius > 0.5) {
        // Radial mask: fully opaque at centre, fades to transparent at the edge.
        // Falloff starts at 55 % of the radius so most of the circle is solid,
        // with a ~70 px soft halo at the rim.
        const fadeStart = (revealRadius * 0.55).toFixed(1);
        const fadeEnd   = revealRadius.toFixed(1);
        const cx        = revealX.toFixed(1);
        const cy        = revealY.toFixed(1);
        const mask      = `radial-gradient(circle at ${cx}px ${cy}px, black ${fadeStart}px, transparent ${fadeEnd}px)`;
        (solidCanvas.style as unknown as Record<string, string>).webkitMaskImage = mask;
        solidCanvas.style.maskImage       = mask;
        solidCanvas.style.opacity         = "1";

        // Swap every mesh to its per-part solid material; hide wireframe edges
        for (const { mesh, mat } of solidMeshList) mesh.material = mat;
        edgeMat.opacity = 0;

        // Warm sun light — makes white fuselage glow and engines look metallic
        scene.add(sunLight);
        solidRenderer.render(scene, camera);
        scene.remove(sunLight);

        // Restore wireframe materials
        for (const { mesh } of solidMeshList) mesh.material = bodyMat;
        edgeMat.opacity = 0.85;
      } else {
        solidCanvas.style.opacity = "0";
      }
    }
  }
  tick();

  return {
    destroy: () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      hero?.removeEventListener("pointermove", onPointerMove);
      hero?.removeEventListener("pointerleave", onPointerLeave);
      webglCanvas.removeEventListener("pointermove",  onCanvasPointerMove);
      webglCanvas.removeEventListener("pointerleave", onCanvasPointerLeave);
      particles.length = 0;
      if (contrailCanvas && ctx2d) {
        ctx2d.clearRect(0, 0, contrailCanvas.clientWidth, contrailCanvas.clientHeight);
      }
      for (const { mat } of solidMeshList) mat.dispose();
      solidMeshList.length = 0;
      renderer.dispose();
      solidRenderer?.dispose();
      planeGroup.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat && (mat as THREE.Material).dispose) (mat as THREE.Material).dispose();
      });
    },
  };
}
