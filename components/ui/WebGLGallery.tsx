'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';

const VERT = `
  precision highp float;
  uniform float uDistort;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    vec3 p = position;
    // bulge toward viewer on hover
    p.z += sin(uv.x * 3.14159) * sin(uv.y * 3.14159) * uDistort * 0.35;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`;

const FRAG = `
  precision highp float;
  uniform sampler2D uTexture;
  uniform float uDistort;
  varying vec2 vUv;
  void main() {
    float amt = uDistort * 0.04;
    float r = texture2D(uTexture, vUv + vec2(amt, 0.0)).r;
    float g = texture2D(uTexture, vUv).g;
    float b = texture2D(uTexture, vUv - vec2(amt, 0.0)).b;
    gl_FragColor = vec4(vec3(r, g, b) + uDistort * 0.12, 1.0);
  }
`;

/**
 * Compact WebGL image grid. Images laid out in columns to fit one screen.
 * Hovering an image bulges + RGB-splits it (GPU shader). One canvas for all.
 */
export default function WebGLGallery({images}: {images: string[]}) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount || images.length === 0) return;

    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let W = mount.clientWidth || window.innerWidth;
    let H = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -1000, 1000);
    camera.position.z = 10;

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = 'anonymous';
    const geometry = new THREE.PlaneGeometry(1, 1, 20, 20);

    type Item = {mesh: THREE.Mesh; mat: THREE.ShaderMaterial; cx: number; cy: number; w: number; h: number};
    const items: Item[] = images.map((src) => {
      const tex = loader.load(src);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.minFilter = THREE.LinearFilter;
      const mat = new THREE.ShaderMaterial({
        uniforms: {uTexture: {value: tex}, uDistort: {value: 0}},
        vertexShader: VERT,
        fragmentShader: FRAG,
      });
      const mesh = new THREE.Mesh(geometry, mat);
      scene.add(mesh);
      return {mesh, mat, cx: 0, cy: 0, w: 1, h: 1};
    });

    const layout = () => {
      const cols = W < 680 ? 2 : 3;
      const rows = Math.ceil(items.length / cols);
      const padX = W * 0.06;
      const gap = Math.min(W, H) * 0.03;
      const cellW = (W - padX * 2 - gap * (cols - 1)) / cols;
      const cellH = cellW * 0.72;
      const gridH = rows * cellH + (rows - 1) * gap;
      const startX = -W / 2 + padX + cellW / 2;
      const startY = gridH / 2 - cellH / 2;
      items.forEach((it, k) => {
        const col = k % cols;
        const row = Math.floor(k / cols);
        it.cx = startX + col * (cellW + gap);
        it.cy = startY - row * (cellH + gap);
        it.w = cellW;
        it.h = cellH;
        it.mesh.position.set(it.cx, it.cy, 0);
        it.mesh.scale.set(cellW, cellH, 1);
      });
    };
    layout();

    const pointer = {x: -99999, y: -99999};
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointer.x = e.clientX - r.left - W / 2;
      pointer.y = -(e.clientY - r.top - H / 2);
    };
    const onLeave = () => {
      pointer.x = -99999;
      pointer.y = -99999;
    };
    mount.addEventListener('pointermove', onMove);
    mount.addEventListener('pointerleave', onLeave);

    let raf = 0;
    let running = false;
    const render = () => {
      for (const it of items) {
        const inside =
          Math.abs(pointer.x - it.cx) < it.w / 2 && Math.abs(pointer.y - it.cy) < it.h / 2;
        const target = inside ? 1 : 0;
        it.mat.uniforms.uDistort.value += (target - it.mat.uniforms.uDistort.value) * 0.12;
      }
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(render);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(render);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => (e.isIntersecting && !document.hidden ? start() : stop())),
      {threshold: 0}
    );
    io.observe(mount);
    const onVis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVis);

    const onResize = () => {
      W = mount.clientWidth || window.innerWidth;
      H = mount.clientHeight || window.innerHeight;
      renderer.setSize(W, H);
      camera.left = -W / 2;
      camera.right = W / 2;
      camera.top = H / 2;
      camera.bottom = -H / 2;
      camera.updateProjectionMatrix();
      layout();
    };
    window.addEventListener('resize', onResize);

    return () => {
      stop();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
      mount.removeEventListener('pointermove', onMove);
      mount.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      items.forEach((it) => {
        (it.mat.uniforms.uTexture.value as THREE.Texture)?.dispose();
        it.mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, [images]);

  return <div ref={mountRef} className="h-full w-full" />;
}
