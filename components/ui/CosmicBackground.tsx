'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';

/**
 * Site-wide living cosmos. A WebGL spiral-galaxy particle system (white-hot core
 * fading to PaidVille crimson) with a distant starfield and real UnrealBloom.
 * The galaxy rotates and the camera drifts/zooms with scroll so the background
 * continuously transitions the whole site.
 *
 * Mounted fixed behind all content. Caps DPR, pauses when the tab is hidden,
 * and renders a single static frame (no rAF) for reduced-motion users.
 */
export default function CosmicBackground() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 1.75);

    let width = window.innerWidth;
    let height = window.innerHeight;

    // ---- Renderer ---------------------------------------------------------
    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
    renderer.setPixelRatio(DPR);
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
    camera.position.set(0, 1.6, 7);

    // ---- Round soft particle sprite --------------------------------------
    const makeSprite = () => {
      const s = 64;
      const c = document.createElement('canvas');
      c.width = c.height = s;
      const g = c.getContext('2d')!;
      const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
      grd.addColorStop(0, 'rgba(255,255,255,1)');
      grd.addColorStop(0.35, 'rgba(255,255,255,0.55)');
      grd.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = grd;
      g.fillRect(0, 0, s, s);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      return tex;
    };
    const sprite = makeSprite();

    // ---- Galaxy -----------------------------------------------------------
    const GAL_COUNT = 14000;
    const RADIUS = 5;
    const BRANCHES = 4;
    const SPIN = 1.1;
    const RND = 0.55;
    const RND_POW = 2.6;
    const inside = new THREE.Color('#fff1e6');
    const outside = new THREE.Color('#b00000');

    const gPos = new Float32Array(GAL_COUNT * 3);
    const gCol = new Float32Array(GAL_COUNT * 3);
    for (let i = 0; i < GAL_COUNT; i++) {
      const i3 = i * 3;
      const r = Math.pow(Math.random(), 1.4) * RADIUS;
      const branch = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spin = r * SPIN;
      const rand = () =>
        Math.pow(Math.random(), RND_POW) * (Math.random() < 0.5 ? 1 : -1) * RND * (r / RADIUS + 0.15);
      const rx = rand();
      const ry = rand() * 0.5; // flatter disc
      const rz = rand();
      gPos[i3] = Math.cos(branch + spin) * r + rx;
      gPos[i3 + 1] = ry;
      gPos[i3 + 2] = Math.sin(branch + spin) * r + rz;

      const col = inside.clone().lerp(outside, Math.min(1, r / RADIUS));
      gCol[i3] = col.r;
      gCol[i3 + 1] = col.g;
      gCol[i3 + 2] = col.b;
    }
    const galGeo = new THREE.BufferGeometry();
    galGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
    galGeo.setAttribute('color', new THREE.BufferAttribute(gCol, 3));
    const galMat = new THREE.PointsMaterial({
      size: 0.055,
      sizeAttenuation: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      transparent: true,
      map: sprite,
      alphaMap: sprite,
    });
    const galaxy = new THREE.Points(galGeo, galMat);
    galaxy.rotation.x = Math.PI * 0.28; // tilt the disc toward camera
    scene.add(galaxy);

    // Bright core glow.
    const coreMat = new THREE.SpriteMaterial({
      map: sprite,
      color: new THREE.Color('#ffd9c2'),
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      opacity: 0.9,
    });
    const core = new THREE.Sprite(coreMat);
    core.scale.set(2.6, 2.6, 1);
    galaxy.add(core);

    // ---- Distant starfield ------------------------------------------------
    const STAR_COUNT = 1800;
    const sPos = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      const i3 = i * 3;
      const rr = 14 + Math.random() * 26;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      sPos[i3] = rr * Math.sin(phi) * Math.cos(theta);
      sPos[i3 + 1] = rr * Math.sin(phi) * Math.sin(theta);
      sPos[i3 + 2] = rr * Math.cos(phi);
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(sPos, 3));
    const starMat = new THREE.PointsMaterial({
      size: 0.06,
      sizeAttenuation: true,
      color: new THREE.Color('#cfd3ff'),
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      map: sprite,
      alphaMap: sprite,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- Post-processing (bloom) -----------------------------------------
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(DPR);
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 1.15, 0.65, 0.0);
    composer.addPass(bloom);

    // ---- Scroll + pointer reactivity -------------------------------------
    let scrollProgress = 0;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollProgress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});

    const pointer = {x: 0, y: 0};
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointer, {passive: true});

    // ---- Render -----------------------------------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    let running = false;
    // Smoothed scroll + pointer for buttery camera motion.
    let sp = 0;
    let px = 0;
    let py = 0;

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      sp += (scrollProgress - sp) * 0.06;
      px += (pointer.x - px) * 0.05;
      py += (pointer.y - py) * 0.05;

      // Galaxy spins on its own AND reacts to the cursor — the mouse steers the cosmos.
      galaxy.rotation.y = t * 0.05 + sp * 2.2 + px * 0.6;
      galaxy.rotation.x = Math.PI * 0.28 - sp * 0.5 + py * 0.28; // disc tips with scroll + cursor
      galaxy.rotation.z = px * 0.12;
      stars.rotation.y = t * 0.01 + px * 0.12;

      // Camera drifts/zooms through the cosmos with scroll + strong cursor parallax.
      const targetX = px * 2.6;
      const targetY = 1.6 + py * -1.5 - sp * 1.2;
      const targetZ = 7 + sp * 4.5;
      camera.position.x += (targetX - camera.position.x) * 0.06;
      camera.position.y += (targetY - camera.position.y) * 0.06;
      camera.position.z += (targetZ - camera.position.z) * 0.05;
      camera.lookAt(0, 0, 0);

      composer.render();
    };

    const loop = () => {
      if (!running) return;
      renderFrame();
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (running || prefersReduced) return;
      running = true;
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      composer.setSize(width, height);
      onScroll();
    };
    window.addEventListener('resize', onResize);

    if (prefersReduced) {
      renderFrame(); // single static frame
    } else {
      start();
    }

    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
      galGeo.dispose();
      galMat.dispose();
      starGeo.dispose();
      starMat.dispose();
      coreMat.dispose();
      sprite.dispose();
      bloom.dispose();
      composer.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen"
      style={{background: 'radial-gradient(ellipse at 50% 35%, #0c0608 0%, #050506 55%, #000 100%)'}}
    />
  );
}
