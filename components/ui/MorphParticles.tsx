'use client';

import {useEffect, useRef} from 'react';
import * as THREE from 'three';

const COUNT = 16000;
const STEP = 2;

const LOGO_SOURCES = [
  '/images/splashlogo.png',
  '/images/logo.png',
  '/images/logo2.png',
  '/images/logo3.jpg',
];

type Pt = [number, number];

function sampleCanvas(g: CanvasRenderingContext2D, cw: number, ch: number, isText: boolean): Pt[] {
  const {data} = g.getImageData(0, 0, cw, ch);
  const pts: Pt[] = [];
  for (let y = 0; y < ch; y += STEP) {
    for (let x = 0; x < cw; x += STEP) {
      const i = (y * cw + x) * 4;
      const a = data[i + 3];
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      const keep = isText ? lum > 120 : a > 170 && lum < 248;
      if (keep) pts.push([(x - cw / 2) / (cw / 2), (ch / 2 - y) / (cw / 2)]);
    }
  }
  return pts;
}

function normalize(pts: Pt[]): Pt[] {
  let m = 0;
  for (const [x, y] of pts) m = Math.max(m, Math.abs(x), Math.abs(y));
  if (m === 0) return pts;
  return pts.map(([x, y]) => [(x / m) * 0.95, (y / m) * 0.95]);
}

function loadImagePoints(src: string): Promise<Pt[]> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cw = 300;
      const ch = Math.max(1, Math.round((cw * img.height) / img.width));
      const c = document.createElement('canvas');
      c.width = cw;
      c.height = ch;
      const g = c.getContext('2d');
      if (!g) return resolve([]);
      g.drawImage(img, 0, 0, cw, ch);
      const pts = sampleCanvas(g, cw, ch, false);
      const cells = Math.ceil(cw / STEP) * Math.ceil(ch / STEP);
      if (pts.length / cells > 0.55) return resolve([]);
      resolve(pts);
    };
    img.onerror = () => resolve([]);
    img.src = src;
  });
}

function textPoints(text: string): Pt[] {
  // Wide canvas + auto-fit font so the WHOLE word fits (no clipped letters).
  const cw = 1100;
  const ch = 260;
  const c = document.createElement('canvas');
  c.width = cw;
  c.height = ch;
  const g = c.getContext('2d');
  if (!g) return [];
  g.fillStyle = '#000';
  g.fillRect(0, 0, cw, ch);
  g.fillStyle = '#fff';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  let fontSize = 180;
  g.font = `900 ${fontSize}px Montserrat, Arial, sans-serif`;
  while (g.measureText(text).width > cw * 0.9 && fontSize > 24) {
    fontSize -= 4;
    g.font = `900 ${fontSize}px Montserrat, Arial, sans-serif`;
  }
  g.fillText(text, cw / 2, ch / 2 + 6);
  return sampleCanvas(g, cw, ch, true);
}

const VERT = `
  precision highp float;
  attribute vec3 aPosA;
  attribute vec3 aPosB;
  attribute float aTint;
  attribute float aSize;
  uniform float uMorph;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uScale;
  uniform vec2 uMouseWorld;
  uniform float uRepel;
  varying float vTint;
  void main() {
    vTint = aTint;
    vec3 p = mix(aPosA, aPosB, uMorph) * uScale;
    p.x += sin(uTime * 0.6 + p.y * 1.4) * 0.02;
    p.y += cos(uTime * 0.5 + p.x * 1.4) * 0.02;
    // Cursor disturbance: mostly a swirl/stir with only a tiny push, so the
    // particles react and orbit the pointer WITHOUT carving a clean circle.
    vec2 toM = p.xy - uMouseWorld;
    float dist = length(toM);
    float radius = 0.62;
    if (dist < radius && dist > 0.0001) {
      float f = 1.0 - dist / radius;
      vec2 dir = toM / dist;
      vec2 perp = vec2(-dir.y, dir.x);
      // Mostly swirl, only a tiny outward push → lively stir, no clean empty circle.
      p.xy += (dir * 0.1 + perp * 0.7) * f * f * uRepel;
    }
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = aSize * uPixelRatio * (1.0 + sin(uTime + aTint * 6.28) * 0.15);
  }
`;

const FRAG = `
  precision highp float;
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  varying float vTint;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    // Sharper core: a crisp dot with a thin glow rim.
    float alpha = smoothstep(0.5, 0.28, d);
    gl_FragColor = vec4(mix(uColorA, uColorB, vTint), alpha * uOpacity);
  }
`;

const STAR_VERT = `
  precision highp float;
  attribute float aDepth;
  uniform vec2 uPointer;
  uniform float uTime;
  uniform float uPixelRatio;
  varying float vD;
  void main() {
    vD = aDepth;
    vec3 p = position;
    p.xy += uPointer * (0.15 + aDepth * 0.9); // closer stars parallax more
    p.x += sin(uTime * 0.04 + position.y * 3.0) * 0.015;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = (1.0 + aDepth * 2.4) * uPixelRatio * (0.7 + 0.3 * sin(uTime * 2.0 + aDepth * 30.0));
  }
`;

const STAR_FRAG = `
  precision highp float;
  varying float vD;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.15, d) * (0.28 + vD * 0.6);
    gl_FragColor = vec4(vec3(0.9, 0.93, 1.0), a);
  }
`;

const NEBULA_VERT = `
  precision highp float;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const NEBULA_FRAG = `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  float blob(vec2 uv, vec2 c, float r) { vec2 d = uv - c; return exp(-dot(d, d) / (r * r)); }
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float t = uTime * 0.05;
    float n = 0.0;
    n += blob(uv, vec2(sin(t) * 0.7, cos(t * 0.8) * 0.5), 0.8) * 0.5;
    n += blob(uv, vec2(cos(t * 0.6) * 0.8, sin(t * 0.5) * 0.7), 0.55) * 0.4;
    n += blob(uv, vec2(sin(t * 1.1) * 0.6, -0.5 + cos(t) * 0.4), 0.65) * 0.35;
    vec3 col = vec3(0.55, 0.02, 0.06) * n;
    gl_FragColor = vec4(col, n * 0.4);
  }
`;

const NOISE3D = `
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
  vec4 p = permute(permute(permute(i.z + vec4(0.0,i1.z,i2.z,1.0)) + i.y + vec4(0.0,i1.y,i2.y,1.0)) + i.x + vec4(0.0,i1.x,i2.x,1.0));
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
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
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

const BLOB_VERT = 'precision highp float;\n' + NOISE3D + `
  uniform float uTime;
  uniform float uSeed;
  varying float vFres;
  void main() {
    vec3 pos = position;
    float n = snoise(pos * 1.5 + uTime * 0.4 + uSeed);
    pos += normal * n * 0.32;
    vec4 mv = modelViewMatrix * vec4(pos, 1.0);
    vec3 nrm = normalize(normalMatrix * normal);
    vec3 viewDir = normalize(-mv.xyz);
    vFres = pow(1.0 - max(dot(viewDir, nrm), 0.0), 2.2);
    gl_Position = projectionMatrix * mv;
  }
`;

const BLOB_FRAG = `
  precision highp float;
  varying float vFres;
  uniform vec3 uColor;
  void main() {
    gl_FragColor = vec4(uColor * (vFres * 0.8 + 0.03), vFres * 0.28 + 0.02);
  }
`;

const jitter = (i: number, salt: number) => ((Math.sin(i * salt) * 43758.5453) % 1) * 0.02;

/**
 * Site-wide WebGL particle morph: PaidVille logos dissolve into each other and
 * the word "PAIDVILLE", forever. The render loop starts SYNCHRONOUSLY on the
 * text shape (so it always draws, even under React Strict Mode / HMR), then the
 * logos load in to enrich the cycle.
 */
export default function MorphParticles() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);
    let disposed = false;
    let raf = 0;

    const renderer = new THREE.WebGLRenderer({antialias: true, alpha: true, powerPreference: 'high-performance'});
    renderer.setPixelRatio(DPR);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const halfH = 3.4;
    const aspect = () => window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-halfH * aspect(), halfH * aspect(), halfH, -halfH, 0.1, 100);
    camera.position.z = 10;

    const uniforms = {
      uMorph: {value: 0},
      uTime: {value: 0},
      uPixelRatio: {value: DPR},
      uOpacity: {value: 0.45},
      uScale: {value: 2.8},
      uMouseWorld: {value: new THREE.Vector2(999, 999)},
      uRepel: {value: 1.0},
      uColorA: {value: new THREE.Color('#ff1a1a')},
      uColorB: {value: new THREE.Color('#fff2e0')},
    };

    // Scale the normalized cluster to fit the viewport so it never clips.
    const fit = () => {
      const hw = halfH * aspect();
      uniforms.uScale.value = Math.min(hw, halfH) * 0.95;
    };
    fit();
    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });

    // Persistent attribute buffers.
    const aPosA = new Float32Array(COUNT * 3);
    const aPosB = new Float32Array(COUNT * 3);
    const tint = new Float32Array(COUNT);
    const size = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i++) {
      tint[i] = (i % 5) / 5;
      size[i] = 1.4 + ((i * 7) % 5) * 0.5; // smaller, denser → sharper
    }

    const toBuf = (pts: Pt[]) => {
      const arr = new Float32Array(COUNT * 3);
      const src = pts.length ? pts : [[0, 0] as Pt];
      for (let i = 0; i < COUNT; i++) {
        const p = src[i % src.length];
        // Normalized positions; uScale (viewport-fit) is applied in the shader.
        arr[i * 3] = p[0] + jitter(i + 1, 12.9898);
        arr[i * 3 + 1] = p[1] + jitter(i + 1, 78.233);
        arr[i * 3 + 2] = jitter(i + 1, 5.123) * 0.4;
      }
      return arr;
    };

    let shapeBufs: Float32Array[] = [toBuf(normalize(textPoints('PAIDVILLE')))];
    let nShapes = 1;
    let lastSeg = -1;

    aPosA.set(shapeBufs[0]);
    aPosB.set(shapeBufs[0]);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(aPosA, 3));
    geo.setAttribute('aPosA', new THREE.BufferAttribute(aPosA, 3));
    geo.setAttribute('aPosB', new THREE.BufferAttribute(aPosB, 3));
    geo.setAttribute('aTint', new THREE.BufferAttribute(tint, 1));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    const points = new THREE.Points(geo, material);
    points.frustumCulled = false;
    scene.add(points);

    // --- Parallax depth starfield (same renderer; no extra WebGL context) ---
    const STAR_COUNT = 3200;
    const starPos = new Float32Array(STAR_COUNT * 3);
    const starDepth = new Float32Array(STAR_COUNT);
    for (let i = 0; i < STAR_COUNT; i++) {
      starPos[i * 3] = (Math.random() * 2 - 1) * 8;
      starPos[i * 3 + 1] = (Math.random() * 2 - 1) * 5.5;
      starPos[i * 3 + 2] = -1 - Math.random() * 2;
      starDepth[i] = Math.random();
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    starGeo.setAttribute('aDepth', new THREE.BufferAttribute(starDepth, 1));
    const starUniforms = {
      uPointer: {value: new THREE.Vector2(0, 0)},
      uTime: {value: 0},
      uPixelRatio: {value: DPR},
    };
    const starMat = new THREE.ShaderMaterial({
      uniforms: starUniforms,
      vertexShader: STAR_VERT,
      fragmentShader: STAR_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(starGeo, starMat);
    stars.frustumCulled = false;
    scene.add(stars);

    const pointer = {x: 0, y: 0};
    let spx = 0;
    let spy = 0;
    const onPointer = (e: PointerEvent) => {
      pointer.x = (e.clientX / window.innerWidth - 0.5) * 2;
      pointer.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointer, {passive: true});

    // --- Nebula glow layer (slow-drifting crimson clouds, behind everything) ---
    const nebulaGeo = new THREE.PlaneGeometry(1, 1);
    const nebulaUniforms = {uTime: {value: 0}};
    const nebulaMat = new THREE.ShaderMaterial({
      uniforms: nebulaUniforms,
      vertexShader: NEBULA_VERT,
      fragmentShader: NEBULA_FRAG,
      transparent: true,
      depthWrite: false,
      depthTest: false,
      blending: THREE.AdditiveBlending,
    });
    const nebula = new THREE.Mesh(nebulaGeo, nebulaMat);
    nebula.position.z = -3;
    nebula.renderOrder = -2;
    nebula.frustumCulled = false;
    scene.add(nebula);
    const sizeNebula = () => {
      const hw = halfH * aspect();
      nebula.scale.set(hw * 2.4, halfH * 2.4, 1);
    };
    sizeNebula();

    // --- Bouncing interactive glow blobs (drift, bounce off edges, flee cursor) ---
    const blobGeo = new THREE.IcosahedronGeometry(0.5, 12);
    type Blob = {mesh: THREE.Mesh; mat: THREE.ShaderMaterial; vx: number; vy: number; r: number};
    const blobs: Blob[] = [];
    const BLOB_N = 9;
    for (let i = 0; i < BLOB_N; i++) {
      const scale = 0.5 + Math.random() * 0.75;
      const mat = new THREE.ShaderMaterial({
        uniforms: {
          uTime: {value: 0},
          uSeed: {value: Math.random() * 10},
          uColor: {value: new THREE.Color(i % 2 ? '#ff2b2b' : '#c00000')},
        },
        vertexShader: BLOB_VERT,
        fragmentShader: BLOB_FRAG,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        blending: THREE.AdditiveBlending,
      });
      const mesh = new THREE.Mesh(blobGeo, mat);
      mesh.scale.setScalar(scale);
      mesh.position.set((Math.random() * 2 - 1) * 4, (Math.random() * 2 - 1) * 2.5, -1.5);
      mesh.renderOrder = -1;
      mesh.frustumCulled = false;
      scene.add(mesh);
      blobs.push({mesh, mat, vx: (Math.random() * 2 - 1) * 0.6, vy: (Math.random() * 2 - 1) * 0.6, r: scale * 0.75});
    }
    let lastT = 0;

    const setShapes = (shapes: Float32Array[]) => {
      if (!shapes.length) return;
      shapeBufs = shapes;
      nShapes = shapes.length;
      lastSeg = -1; // force re-apply next frame
    };

    // Load logos async; enrich the cycle once ready (loop already running).
    Promise.all(LOGO_SOURCES.map(loadImagePoints)).then((results) => {
      if (disposed) return;
      const logos = results.filter((p) => p.length > 40).map((p) => toBuf(normalize(p)));
      const text = toBuf(normalize(textPoints('PAIDVILLE')));
      const all = [...logos, text];
      if (all.length >= 2) setShapes(all);
    });

    const ease = (x: number) => x * x * (3 - 2 * x);
    const SEG = 3.6;
    const HOLD = 0.6;
    const clock = new THREE.Clock();

    const renderFrame = () => {
      const t = clock.getElapsedTime();
      uniforms.uTime.value = t;

      if (nShapes <= 1) {
        if (lastSeg !== 0) {
          aPosA.set(shapeBufs[0]);
          aPosB.set(shapeBufs[0]);
          (geo.attributes.aPosA as THREE.BufferAttribute).needsUpdate = true;
          (geo.attributes.aPosB as THREE.BufferAttribute).needsUpdate = true;
          lastSeg = 0;
        }
        uniforms.uMorph.value = 0;
      } else {
        const total = nShapes * SEG;
        const tt = t % total;
        const seg = Math.floor(tt / SEG);
        const local = (tt - seg * SEG) / SEG;
        if (seg !== lastSeg) {
          aPosA.set(shapeBufs[seg % nShapes]);
          aPosB.set(shapeBufs[(seg + 1) % nShapes]);
          (geo.attributes.aPosA as THREE.BufferAttribute).needsUpdate = true;
          (geo.attributes.aPosB as THREE.BufferAttribute).needsUpdate = true;
          lastSeg = seg;
        }
        uniforms.uMorph.value = local < HOLD ? 0 : ease((local - HOLD) / (1 - HOLD));
      }

      // Smoothed pointer → parallax the starfield + a touch on the morph.
      spx += (pointer.x - spx) * 0.05;
      spy += (pointer.y - spy) * 0.05;
      starUniforms.uPointer.value.set(spx, -spy);
      starUniforms.uTime.value = t;
      nebulaUniforms.uTime.value = t;
      points.position.x = spx * 0.12;
      points.position.y = -spy * 0.12;
      // Pointer in world space for the morph's cursor repulsion.
      const hw = halfH * aspect();
      uniforms.uMouseWorld.value.set(pointer.x * hw - points.position.x, -pointer.y * halfH - points.position.y);

      // Blob physics: drift, bounce off edges, flee the cursor.
      const dt = lastT ? Math.min(t - lastT, 0.05) : 0;
      lastT = t;
      const mwx = pointer.x * hw;
      const mwy = -pointer.y * halfH;
      for (const b of blobs) {
        const dx = b.mesh.position.x - mwx;
        const dy = b.mesh.position.y - mwy;
        const dd = Math.hypot(dx, dy);
        if (dd < 1.3 && dd > 0.001) {
          const push = (1.3 - dd) * 2.4;
          b.vx += (dx / dd) * push * dt;
          b.vy += (dy / dd) * push * dt;
        }
        b.mesh.position.x += b.vx * dt;
        b.mesh.position.y += b.vy * dt;
        if (b.mesh.position.x > hw - b.r) {
          b.mesh.position.x = hw - b.r;
          b.vx = -Math.abs(b.vx);
        } else if (b.mesh.position.x < -hw + b.r) {
          b.mesh.position.x = -hw + b.r;
          b.vx = Math.abs(b.vx);
        }
        if (b.mesh.position.y > halfH - b.r) {
          b.mesh.position.y = halfH - b.r;
          b.vy = -Math.abs(b.vy);
        } else if (b.mesh.position.y < -halfH + b.r) {
          b.mesh.position.y = -halfH + b.r;
          b.vy = Math.abs(b.vy);
        }
        b.vx *= 0.992;
        b.vy *= 0.992;
        b.mesh.rotation.y += dt * 0.3;
        b.mesh.rotation.x += dt * 0.2;
        b.mat.uniforms.uTime.value = t;
      }

      points.rotation.z = Math.sin(t * 0.1) * 0.04;
      renderer.render(scene, camera);
    };

    let running = false;
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

    // Start the loop SYNCHRONOUSLY — tied to this exact renderer/canvas.
    if (prefersReduced) renderFrame();
    else start();

    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', onVisibility);

    const onResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = -halfH * aspect();
      camera.right = halfH * aspect();
      camera.top = halfH;
      camera.bottom = -halfH;
      camera.updateProjectionMatrix();
      fit();
      sizeNebula();
    };
    window.addEventListener('resize', onResize);

    return () => {
      disposed = true;
      stop();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointer);
      geo.dispose();
      material.dispose();
      starGeo.dispose();
      starMat.dispose();
      nebulaGeo.dispose();
      nebulaMat.dispose();
      blobGeo.dispose();
      blobs.forEach((b) => b.mat.dispose());
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-screen w-screen"
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #0c0708 0%, #070708 55%, #050506 100%)',
        transform: 'translateZ(0)',
      }}
    />
  );
}
