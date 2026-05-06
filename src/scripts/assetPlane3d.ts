/**
 * Asset section — top-down render of the A340 GLB.
 *
 * Camera is positioned steeply above and slightly forward so the full
 * wingspan + fuselage reads as a blueprint plan-view. Wings are shown —
 * they define the silhouette from this angle. Slow incommensurate drift
 * (gentle yaw wander + subtle banking) keeps it alive. Mouse moves the
 * heading slightly so the plane acknowledges the viewer.
 */
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const COLOR_BONE   = 0xfaf3e8;
const COLOR_ACCENT = 0xc4551e;

// Show wing panels (Object_2/3) — essential for top-view silhouette.
// Keep the noisy wing-edge slivers (7-10) hidden.
const HIDDEN_MESHES = new Set(["Object_7", "Object_8", "Object_9", "Object_10"]);

const BASE_Z = -1.1; // shifts plane toward screen-top (camera.up = -Z)

interface PlaneInstance {
  destroy: () => void;
}

export function initAssetPlane3D(
  canvas: HTMLCanvasElement,
  modelUrl = "/models/plane-a340.glb",
): PlaneInstance {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  // ── Renderer ──────────────────────────────────────────────────────
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  // ── Scene + camera ────────────────────────────────────────────────
  const scene  = new THREE.Scene();
  // Wide FOV + steep elevation angle = convincing top-down plan view.
  // camera.up points along -X so the nose (positive-X end of the fuselage)
  // appears at the left of the canvas — matches conventional plan drawings.
  const camera = new THREE.PerspectiveCamera(54, 1, 0.1, 1000);
  camera.position.set(0, 8, 2.5);
  camera.up.set(0, 0, -1); // fuselage (X-axis) runs horizontally in screen space
  camera.lookAt(0, 0, 0);

  // ── Lighting ──────────────────────────────────────────────────────
  // Overhead ambient keeps the top surfaces even; a warm fill from above
  // picks out wing-root creases and engine fairings.
  scene.add(new THREE.AmbientLight(0xffffff, 0.75));

  const top = new THREE.DirectionalLight(0xfff4e0, 0.8);
  top.position.set(0, 8, 3);
  scene.add(top);

  const fill = new THREE.DirectionalLight(0xd0e8ff, 0.2);
  fill.position.set(4, 2, 0);
  scene.add(fill);

  // ── Plane group ───────────────────────────────────────────────────
  const planeGroup = new THREE.Group();
  scene.add(planeGroup);

  let modelLoaded = false;
  const loader    = new GLTFLoader();

  loader.load(
    modelUrl,
    (gltf) => {
      const model   = gltf.scene;
      const wrapper = new THREE.Group();
      wrapper.add(model);

      // Scale to 8 units — slightly smaller than side-view so the wingspan
      // (roughly equal to fuselage length on an A340) fits the canvas.
      const bboxOrig = new THREE.Box3().setFromObject(model);
      const sizeOrig = new THREE.Vector3();
      bboxOrig.getSize(sizeOrig);
      const maxDim = Math.max(sizeOrig.x, sizeOrig.y, sizeOrig.z);
      wrapper.scale.setScalar(8.0 / maxDim);

      // Recenter
      const bboxScaled   = new THREE.Box3().setFromObject(wrapper);
      const centerScaled = new THREE.Vector3();
      bboxScaled.getCenter(centerScaled);
      wrapper.position.sub(centerScaled);

      // ── Materials ──────────────────────────────────────────────────
      const bodyMat = new THREE.MeshLambertMaterial({
        color:       COLOR_BONE,
        transparent: true,
        opacity:     0.09,
        depthWrite:  false,
        side:        THREE.DoubleSide,
      });

      const edgeMatFuselage = new THREE.LineBasicMaterial({
        color:       COLOR_BONE,
        transparent: true,
        opacity:     0.88,
      });

      // Wing edges at full brightness — they're the star of this view
      const edgeMatWing = new THREE.LineBasicMaterial({
        color:       COLOR_BONE,
        transparent: true,
        opacity:     0.80,
      });

      const edgeMatEngine = new THREE.LineBasicMaterial({
        color:       COLOR_ACCENT,
        transparent: true,
        opacity:     0.45,
      });

      model.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!((mesh.isMesh as boolean) && mesh.geometry)) return;

        if (HIDDEN_MESHES.has(mesh.name)) {
          mesh.visible = false;
          return;
        }

        mesh.material      = bodyMat;
        mesh.castShadow    = false;
        mesh.receiveShadow = false;

        if (mesh.name === "Object_5") return; // belly — body wash only

        let threshold: number;
        let edgeMat: THREE.LineBasicMaterial;

        if (mesh.name === "Object_4") {
          threshold = 75;
          edgeMat   = edgeMatFuselage;
        } else if (mesh.name === "Object_2" || mesh.name === "Object_3") {
          threshold = 35; // lower threshold → more wing-surface edges visible from above
          edgeMat   = edgeMatWing;
        } else if (mesh.name === "Object_6") {
          threshold = 50;
          edgeMat   = edgeMatFuselage;
        } else {
          threshold = 50;
          edgeMat   = edgeMatEngine;
        }

        const lines = new THREE.LineSegments(
          new THREE.EdgesGeometry(mesh.geometry, threshold),
          edgeMat,
        );
        mesh.add(lines);
      });

      planeGroup.add(wrapper);
      modelLoaded = true;
    },
    undefined,
    (err) => { console.error("[assetPlane3d] GLTF load failed:", err); },
  );

  // ── Resize ────────────────────────────────────────────────────────
  function resize(): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (w === 0 || h === 0) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  const ro = new ResizeObserver(resize);
  ro.observe(canvas);

  // ── Slide animation ───────────────────────────────────────────────
  // Four phases:
  //   "hidden"   — off-screen left, waiting for section to enter viewport
  //   "entering" — sliding in from left with ease-out-back overshoot
  //   "at-rest"  — centred, idling
  //   "exiting"  — sweeping out to right with ease-in acceleration
  //
  // IntersectionObserver stays alive for the component lifetime so it can
  // drive both the entry and exit on every scroll-in / scroll-out cycle.
  const ENTRANCE_X   = -10; // world units — off-screen left
  const EXIT_X       =  10; // world units — off-screen right
  const ENTRANCE_DUR = 1400; // ms
  const EXIT_DUR     =  900; // ms — snappier exit

  type Phase = "hidden" | "entering" | "at-rest" | "exiting";
  let phase: Phase     = "hidden";
  let animStartTime    = 0;

  // Ease-out-back — decelerates then overshoots slightly before settling
  function easeOutBack(t: number): number {
    const c1 = 1.70158, c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  }
  // Ease-in-quad — starts moving immediately, accelerates off-screen.
  // Gentler than cubic so motion is visible from the first frame.
  function easeInQuad(t: number): number {
    return t * t;
  }

  // ── Mouse tracking ────────────────────────────────────────────────
  // From a top-down view, left/right cursor heading is the most legible
  // interaction — the nose subtly turns to follow. Pitch has no visual
  // meaning here so its range is kept tiny.
  const section = canvas.closest<HTMLElement>("[data-asset]");
  let cursorNX = 0;
  let curYaw   = 0;

  // Two observers with different thresholds so each animation has plenty
  // of screen real-estate to play:
  //   enterIO  — fires at 15 % visibility so entrance starts early
  //   exitIO   — fires at 50 % visibility so exit is clearly visible before
  //              the section disappears
  const enterIO = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting && (phase === "hidden" || phase === "exiting")) {
      phase = "entering";
      animStartTime = modelLoaded ? performance.now() : 0;
    }
  }, { threshold: 0.15 });

  const exitIO = new IntersectionObserver(([entry]) => {
    if (!entry.isIntersecting && (phase === "at-rest" || phase === "entering")) {
      phase = "exiting";
      animStartTime = performance.now();
    }
  }, { threshold: 0.5 });

  if (section) { enterIO.observe(section); exitIO.observe(section); }

  function onPointerMove(e: PointerEvent): void {
    if (!section) return;
    const r  = section.getBoundingClientRect();
    cursorNX = ((e.clientX - r.left) / r.width) * 2 - 1;
  }
  function onPointerLeave(): void { cursorNX = 0; }

  section?.addEventListener("pointermove",  onPointerMove);
  section?.addEventListener("pointerleave", onPointerLeave);

  // ── Animation ─────────────────────────────────────────────────────
  // From above, yaw wander (nose drifting left/right) and a hair of roll
  // are the only motions that read clearly. Altitude drift moves the plane
  // toward/away from the camera — subtle zoom effect.
  const FOLLOW    = 0.025;
  const YAW_RANGE = 0.10; // ±~6° of heading response to cursor

  let frameId = 0;
  let stopped = false;
  let t       = 0;

  function tick(): void {
    if (stopped) return;
    frameId = requestAnimationFrame(tick);
    t += 0.004;

    if (modelLoaded) {
      // If IO fired before GLB loaded, clock starts on first tick after load
      if (phase === "entering" && animStartTime === 0) {
        animStartTime = performance.now();
      }

      let posX = 0;
      switch (phase) {
        case "hidden":
          posX = ENTRANCE_X;
          break;
        case "entering":
          if (prefersReducedMotion) {
            posX  = 0;
            phase = "at-rest";
          } else {
            const p = Math.min((performance.now() - animStartTime) / ENTRANCE_DUR, 1);
            posX = ENTRANCE_X * (1 - easeOutBack(p));
            if (p >= 1) { phase = "at-rest"; posX = 0; }
          }
          break;
        case "at-rest":
          posX = 0;
          break;
        case "exiting":
          if (prefersReducedMotion) {
            // Skip animation — snap off-screen left, ready for re-entry
            phase = "hidden";
            posX  = ENTRANCE_X;
          } else {
            const p = Math.min((performance.now() - animStartTime) / EXIT_DUR, 1);
            posX = EXIT_X * easeInQuad(p);
            if (p >= 1) {
              // Section is fully gone by now, so snapping left is invisible
              phase = "hidden";
              posX  = ENTRANCE_X;
            }
          }
          break;
      }

      planeGroup.position.x = posX;

      if (!prefersReducedMotion) {
        const yawDrift  = Math.sin(t * 0.19) * 0.018 + Math.sin(t * 0.31) * 0.009;
        const rollDrift = Math.sin(t * 0.23) * 0.008 + Math.sin(t * 0.41) * 0.004;
        const altDrift  = Math.sin(t * 0.37) * 0.04  + Math.sin(t * 0.17) * 0.02;

        curYaw += (cursorNX * YAW_RANGE - curYaw) * FOLLOW;

        planeGroup.rotation.x = 0; // explicit reset — prevents x-axis drift from any future change
        planeGroup.rotation.y = yawDrift + curYaw;
        planeGroup.rotation.z = rollDrift;
        planeGroup.position.y = altDrift;
        planeGroup.position.z = BASE_Z;
      }
    }

    renderer.render(scene, camera);
  }
  tick();

  return {
    destroy: () => {
      stopped = true;
      cancelAnimationFrame(frameId);
      ro.disconnect();
      enterIO.disconnect();
      exitIO.disconnect();
      section?.removeEventListener("pointermove",  onPointerMove);
      section?.removeEventListener("pointerleave", onPointerLeave);
      renderer.dispose();
      planeGroup.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        const mat = mesh.material;
        if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
        else if (mat && (mat as THREE.Material).dispose)
          (mat as THREE.Material).dispose();
      });
    },
  };
}
