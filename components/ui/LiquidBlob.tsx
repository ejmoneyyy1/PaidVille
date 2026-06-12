'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';

const NOISE = `
vec4 permute(vec4 x){return mod(((x*34.0)+1.0)*x,289.0);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159 - 0.85373472095314 * r;}
float snoise(vec3 v){
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod(i, 289.0);
  vec4 p = permute( permute( permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 1.0/7.0;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}
`;

const VERT = 'precision highp float;\n' + NOISE + `
  uniform float uTime;
  uniform float uEnergy;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDisp;
  void main() {
    vec3 pos = position;
    float n = snoise(pos * 1.25 + uTime * 0.35);
    float disp = n * (0.26 + uEnergy * 0.22);
    vDisp = disp;
    pos += normal * disp;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vNormal = normalize(normalMatrix * normal);
    vView = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  precision highp float;
  uniform vec3 uLow;
  uniform vec3 uHigh;
  varying vec3 vNormal;
  varying vec3 vView;
  varying float vDisp;
  void main() {
    float fres = pow(1.0 - max(dot(vView, vNormal), 0.0), 2.4);
    vec3 col = mix(uLow, uHigh, clamp(fres + vDisp * 0.7, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
  }
`;

/**
 * Interactive liquid-metal blob — a high-poly sphere displaced by 3D simplex
 * noise with a crimson fresnel rim, that wobbles harder and tilts toward the
 * cursor. Self-contained Three.js. Pauses offscreen; near-static for reduced motion.
 */
export default function LiquidBlob() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Cap DPR lower so Safari/retina renders fewer pixels → smoother framerate (matches Chrome).
    const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
    let W = mount.clientWidth || window.innerWidth;
    let H = mount.clientHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});
    renderer.setPixelRatio(DPR);
    renderer.setSize(W, H);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
    camera.position.z = 5;

    // Higher tessellation = smooth surface (no facets); DPR cap keeps Safari fast.
    const geometry = new THREE.IcosahedronGeometry(1.2, 32);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTime: {value: 0},
        uEnergy: {value: 0},
        uLow: {value: new THREE.Color('#1a0202')},
        uHigh: {value: new THREE.Color('#ff2b2b')},
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
    });
    const blob = new THREE.Mesh(geometry, material);
    scene.add(blob);

    const pointer = {x: 0, y: 0};
    let energy = 0;
    const onMove = (e: PointerEvent) => {
      const r = mount.getBoundingClientRect();
      pointer.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
      pointer.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
      energy = Math.min(1, energy + 0.08);
    };
    window.addEventListener('pointermove', onMove, {passive: true});

    const clock = new THREE.Clock();
    let raf = 0;
    let running = false;
    let rotX = 0;
    let rotY = 0;

    const frame = () => {
      const t = clock.getElapsedTime();
      energy *= 0.95;
      material.uniforms.uTime.value = prefersReduced ? 0.5 : t;
      material.uniforms.uEnergy.value = energy;
      rotY += (pointer.x * 0.6 - rotY) * 0.05 + (prefersReduced ? 0 : 0.002);
      rotX += (pointer.y * 0.4 - rotX) * 0.05;
      blob.rotation.y = rotY + (prefersReduced ? 0 : t * 0.12);
      blob.rotation.x = rotX;
      renderer.render(scene, camera);
      if (running) raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (es) => es.forEach((e) => (e.isIntersecting ? start() : stop())),
      {threshold: 0.05}
    );
    io.observe(mount);
    if (prefersReduced) renderer.render(scene, camera);

    const onResize = () => {
      W = mount.clientWidth;
      H = mount.clientHeight;
      renderer.setSize(W, H);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', onResize);

    return () => {
      stop();
      io.disconnect();
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="h-full w-full" />;
}
