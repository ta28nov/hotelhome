import { useRef, useEffect } from 'react';

// ==============================
// IMPORT CÁC THÀNH PHẦN CẦN THIẾT TỪ THREE.JS
// Dùng alias để rút gọn tên và tăng tính rõ ràng.
import {
  Clock as e,                   // Quản lý thời gian (tính delta cho animation)
  PerspectiveCamera as t,         // Camera phối cảnh
  Scene as i,                    // Scene chứa các đối tượng 3D
  WebGLRenderer as s,             // Renderer dùng WebGL để render scene
  SRGBColorSpace as n,            // Không gian màu sRGB
  MathUtils as o,                // Các hàm tiện ích toán học (chuyển đổi giữa radian và độ, …)
  Vector2 as r,                  // Vector 2D, dùng cho vị trí chuột
  Vector3 as a,                  // Vector 3D, dùng cho vị trí, vận tốc, …
  MeshPhysicalMaterial as c,      // Vật liệu vật lý với hiệu ứng clearcoat
  ShaderChunk as h,              // Các đoạn shader mặc định của Three.js
  Color as l,                    // Quản lý màu sắc
  Object3D as m,                 // Lớp cơ sở cho tất cả các đối tượng 3D
  InstancedMesh as d,            // Cho phép render nhiều instance của một mesh, tối ưu hiệu suất
  PMREMGenerator as p,           // Tạo texture môi trường (envMap)
  SphereGeometry as g,           // Hình học sphere (hình cầu)
  AmbientLight as f,             // Ánh sáng môi trường (chiếu đều)
  PointLight as u,               // Ánh sáng điểm
  ACESFilmicToneMapping as v,     // Tone mapping giúp ánh sáng trông tự nhiên hơn
  Raycaster as y,                // Dùng để bắn tia (ray) để tính giao nhau
  Plane as w,                    // Lớp mặt phẳng, dùng trong việc tính giao nhau với tia
} from "three";

// ------------------------------
// IMPORT MÔI TRƯỜNG PHÒNG (RoomEnvironment) để tạo hiệu ứng envMap
import { RoomEnvironment as z } from "three/examples/jsm/environments/RoomEnvironment.js";

// ==================================================
// CLASS x
// Quản lý toàn bộ scene, camera, renderer và các sự kiện (resize, intersection, visibility)
// Đã cập nhật màu nền của scene và renderer thành light gray (0xf7f7f7)
class x {
  #e;           // Cấu hình đầu vào
  canvas;       // Phần tử canvas render
  camera;       // Camera của scene
  cameraMinAspect; // Aspect tối thiểu (nếu cần điều chỉnh FOV)
  cameraMaxAspect; // Aspect tối đa (nếu cần điều chỉnh FOV)
  cameraFov;    // FOV ban đầu của camera
  maxPixelRatio; // Pixel ratio tối đa
  minPixelRatio; // Pixel ratio tối thiểu
  scene;        // Scene chứa các đối tượng 3D
  renderer;     // WebGLRenderer để render scene
  #t;           // Tham chiếu postprocessing (nếu có)
  size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 }; // Kích thước canvas và world
  render = this.#i;   // Hàm render mặc định (gọi renderer.render)
  onBeforeRender = () => {}; // Callback trước mỗi frame
  onAfterRender = () => {};  // Callback sau mỗi frame
  onAfterResize = () => {};  // Callback sau khi resize
  #s = false;   // Trạng thái canvas có nằm trong viewport hay không
  #n = false;   // Trạng thái animation (đang chạy hay dừng)
  isDisposed = false; // Kiểm tra đã dispose hay chưa
  #o;           // IntersectionObserver
  #r;           // ResizeObserver
  #a;           // Timeout ID cho resize
  #c = new e(); // Clock để tính toán delta giữa các frame
  #h = { elapsed: 0, delta: 0 }; // Lưu trữ thời gian elapsed và delta
  #l;           // ID của requestAnimationFrame

  constructor(e) {
    this.#e = { ...e };
    this.#m();  // Khởi tạo camera
    this.#d();  // Khởi tạo scene
    this.#p();  // Khởi tạo renderer
    this.resize(); // Cập nhật kích thước ban đầu
    this.#g();  // Thiết lập các sự kiện (resize, intersection, visibility)
  }
  
  // --- Khởi tạo camera ---
  #m() {
    this.camera = new t();
    this.cameraFov = this.camera.fov;
  }
  
  // --- Khởi tạo scene và đặt background ---  
  // Cập nhật background thành light gray (0xf7f7f7)
  #d() {
    this.scene = new i();
    this.scene.background = new l(0xf7f7f7);
  }
  
  // --- Khởi tạo renderer và thiết lập clear color ---
  // Cập nhật clear color thành light gray (0xf7f7f7)
  #p() {
    if (this.#e.canvas) {
      this.canvas = this.#e.canvas;
    } else if (this.#e.id) {
      this.canvas = document.getElementById(this.#e.id);
    } else {
      console.error("Three: Missing canvas or id parameter");
    }
    this.canvas.style.display = "block";
    const e = {
      canvas: this.canvas,
      powerPreference: "high-performance",
      ...(this.#e.rendererOptions ?? {}),
    };
    this.renderer = new s(e);
    this.renderer.outputColorSpace = n;
    this.renderer.setClearColor(0xf7f7f7, 1);
  }
  
  // --- Thiết lập các sự kiện: resize, intersection, visibility ---
  #g() {
    if (!(this.#e.size instanceof Object)) {
      window.addEventListener("resize", this.#f.bind(this));
      if (this.#e.size === "parent" && this.canvas.parentNode) {
        this.#r = new ResizeObserver(this.#f.bind(this));
        this.#r.observe(this.canvas.parentNode);
      }
    }
    this.#o = new IntersectionObserver(this.#u.bind(this), {
      root: null,
      rootMargin: "0px",
      threshold: 0,
    });
    this.#o.observe(this.canvas);
    document.addEventListener("visibilitychange", this.#v.bind(this));
  }
  
  // --- Loại bỏ các sự kiện đã đăng ký (dùng khi dispose) ---
  #y() {
    window.removeEventListener("resize", this.#f.bind(this));
    this.#r?.disconnect();
    this.#o?.disconnect();
    document.removeEventListener("visibilitychange", this.#v.bind(this));
  }
  
  // --- Callback của IntersectionObserver ---
  #u(e) {
    this.#s = e[0].isIntersecting;
    this.#s ? this.#w() : this.#z();
  }
  
  // --- Callback khi visibility của document thay đổi ---
  #v() {
    if (this.#s) {
      document.hidden ? this.#z() : this.#w();
    }
  }
  
  // --- Xử lý sự kiện resize (sử dụng timeout để tối ưu hiệu suất) ---
  #f() {
    if (this.#a) clearTimeout(this.#a);
    this.#a = setTimeout(this.resize.bind(this), 100);
  }
  
  // --- Cập nhật kích thước renderer và camera ---
  resize() {
    let e, t;
    if (this.#e.size instanceof Object) {
      e = this.#e.size.width;
      t = this.#e.size.height;
    } else if (this.#e.size === "parent" && this.canvas.parentNode) {
      e = this.canvas.parentNode.offsetWidth;
      t = this.canvas.parentNode.offsetHeight;
    } else {
      e = window.innerWidth;
      t = window.innerHeight;
    }
    this.size.width = e;
    this.size.height = t;
    this.size.ratio = e / t;
    this.#x();  // Cập nhật projection matrix cho camera
    this.#b();  // Cập nhật kích thước renderer
    this.onAfterResize(this.size);
  }
  
  // --- Cập nhật projection matrix của camera ---
  #x() {
    this.camera.aspect = this.size.width / this.size.height;
    if (this.camera.isPerspectiveCamera && this.cameraFov) {
      if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
        this.#A(this.cameraMinAspect);
      } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
        this.#A(this.cameraMaxAspect);
      } else {
        this.camera.fov = this.cameraFov;
      }
    }
    this.camera.updateProjectionMatrix();
    this.updateWorldSize();
  }
  
  // --- Điều chỉnh FOV của camera theo aspect ratio ---
  #A(e) {
    const t = Math.tan(o.degToRad(this.cameraFov / 2)) / (this.camera.aspect / e);
    this.camera.fov = 2 * o.radToDeg(Math.atan(t));
  }
  
  // --- Tính toán kích thước thế giới dựa trên camera ---
  updateWorldSize() {
    if (this.camera.isPerspectiveCamera) {
      const e = (this.camera.fov * Math.PI) / 180;
      this.size.wHeight = 2 * Math.tan(e / 2) * this.camera.position.length();
      this.size.wWidth = this.size.wHeight * this.camera.aspect;
    } else if (this.camera.isOrthographicCamera) {
      this.size.wHeight = this.camera.top - this.camera.bottom;
      this.size.wWidth = this.camera.right - this.camera.left;
    }
  }
  
  // --- Cập nhật kích thước renderer và thiết lập pixel ratio ---
  #b() {
    this.renderer.setSize(this.size.width, this.size.height);
    this.#t?.setSize(this.size.width, this.size.height);
    let e = window.devicePixelRatio;
    if (this.maxPixelRatio && e > this.maxPixelRatio) {
      e = this.maxPixelRatio;
    } else if (this.minPixelRatio && e < this.minPixelRatio) {
      e = this.minPixelRatio;
    }
    this.renderer.setPixelRatio(e);
    this.size.pixelRatio = e;
  }
  
  // --- Getter và setter cho postprocessing (nếu có) ---
  get postprocessing() {
    return this.#t;
  }
  
  set postprocessing(e) {
    this.#t = e;
    this.render = e.render.bind(e);
  }
  
  // --- Bắt đầu animation loop khi canvas nằm trong viewport ---
  #w() {
    if (this.#n) return;
    const animate = () => {
      this.#l = requestAnimationFrame(animate);
      this.#h.delta = this.#c.getDelta();
      this.#h.elapsed += this.#h.delta;
      this.onBeforeRender(this.#h);
      this.render();
      this.onAfterRender(this.#h);
    };
    this.#n = true;
    this.#c.start();
    animate();
  }
  
  // --- Dừng animation loop khi canvas không nằm trong viewport ---
  #z() {
    if (this.#n) {
      cancelAnimationFrame(this.#l);
      this.#n = false;
      this.#c.stop();
    }
  }
  
  // --- Hàm render mặc định ---
  #i() {
    this.renderer.render(this.scene, this.camera);
  }
  
  // --- Xóa các đối tượng trong scene ---
  clear() {
    this.scene.traverse((e) => {
      if (e.isMesh && typeof e.material === "object" && e.material !== null) {
        Object.keys(e.material).forEach((t) => {
          const i = e.material[t];
          if (i !== null && typeof i === "object" && typeof i.dispose === "function") {
            i.dispose();
          }
        });
        e.material.dispose();
        e.geometry.dispose();
      }
    });
    this.scene.clear();
  }
  
  // --- Dọn dẹp và giải phóng tài nguyên ---
  dispose() {
    this.#y();
    this.#z();
    this.clear();
    this.#t?.dispose();
    this.renderer.dispose();
    this.isDisposed = true;
  }
}

// ==============================
// XỬ LÝ CÁC SỰ KIỆN CHUỘT (Pointer Events)
// Sử dụng Map để lưu DOM element và các callback liên quan.
const b = new Map(),
  A = new r(); // Vector2 lưu vị trí chuột (clientX, clientY)
let R = false; // Cờ đánh dấu đã đăng ký event cho body hay chưa

// --- Hàm S: đăng ký sự kiện chuột cho một DOM element ---
function S(e) {
  const t = {
    position: new r(),    // Vị trí chuột tương đối so với element
    nPosition: new r(),   // Vị trí normalized (-1 đến 1)
    hover: false,         // Trạng thái hover
    onEnter() {},         // Callback khi chuột enter element
    onMove() {},          // Callback khi chuột di chuyển trong element
    onClick() {},         // Callback khi click
    onLeave() {},         // Callback khi chuột rời khỏi element
    ...e,
  };
  (function (e, t) {
    if (!b.has(e)) {
      b.set(e, t);
      if (!R) {
        document.body.addEventListener("pointermove", M);
        document.body.addEventListener("pointerleave", L);
        document.body.addEventListener("click", C);
        R = true;
      }
    }
  })(e.domElement, t);
  t.dispose = () => {
    const t = e.domElement;
    b.delete(t);
    if (b.size === 0) {
      document.body.removeEventListener("pointermove", M);
      document.body.removeEventListener("pointerleave", L);
      R = false;
    }
  };
  return t;
}

// --- Hàm M: xử lý pointermove, cập nhật vị trí chuột và gọi callback ---
function M(e) {
  A.x = e.clientX;
  A.y = e.clientY;
  for (const [elem, t] of b) {
    const i = elem.getBoundingClientRect();
    if (D(i)) {
      P(t, i);
      if (!t.hover) {
        t.hover = true;
        t.onEnter(t);
      }
      t.onMove(t);
    } else if (t.hover) {
      t.hover = false;
      t.onLeave(t);
    }
  }
}

// --- Hàm C: xử lý click, gọi callback onClick nếu chuột trong element ---
function C(e) {
  A.x = e.clientX;
  A.y = e.clientY;
  for (const [elem, t] of b) {
    const i = elem.getBoundingClientRect();
    P(t, i);
    if (D(i)) t.onClick(t);
  }
}

// --- Hàm L: xử lý pointerleave, gọi callback onLeave ---
function L() {
  for (const t of b.values()) {
    if (t.hover) {
      t.hover = false;
      t.onLeave(t);
    }
  }
}

// --- Hàm P: cập nhật vị trí chuột tương đối và normalized ---
function P(e, t) {
  const { position: i, nPosition: s } = e;
  i.x = A.x - t.left;
  i.y = A.y - t.top;
  s.x = (i.x / t.width) * 2 - 1;
  s.y = (-i.y / t.height) * 2 + 1;
}

// --- Hàm D: kiểm tra vị trí chuột có nằm trong bounding box của element không ---
function D(e) {
  const { x: t, y: i } = A;
  const { left: s, top: n, width: o, height: r } = e;
  return t >= s && t <= s + o && i >= n && i <= n + r;
}

// ==============================
// CÁC HÀM TIỆN ÍCH TỪ MathUtils
const { randFloat: k, randFloatSpread: E } = o;

// Khởi tạo các vector dùng cho tính toán vật lý
const F = new a();
const I = new a();
const O = new a();
const V = new a();
const B = new a();
const N = new a();
const _ = new a();
const j = new a();
const H = new a();
const T = new a();

// ==============================
// CLASS W: Xử lý vật lý cho các sphere
class W {
  constructor(e) {
    this.config = e;
    this.positionData = new Float32Array(3 * e.count).fill(0);
    this.velocityData = new Float32Array(3 * e.count).fill(0);
    this.sizeData = new Float32Array(e.count).fill(1);
    this.center = new a();
    this.#R();       // Khởi tạo vị trí ban đầu
    this.setSizes(); // Thiết lập kích thước ban đầu
  }
  // --- Khởi tạo vị trí ban đầu cho các sphere ---
  #R() {
    const { config: e, positionData: t } = this;
    this.center.toArray(t, 0);
    for (let i = 1; i < e.count; i++) {
      const s = 3 * i;
      t[s] = E(2 * e.maxX);
      t[s + 1] = E(2 * e.maxY);
      t[s + 2] = E(2 * e.maxZ);
    }
  }
  // --- Thiết lập kích thước cho các sphere ---
  setSizes() {
    const { config: e, sizeData: t } = this;
    t[0] = e.size0;
    for (let i = 1; i < e.count; i++) {
      t[i] = k(e.minSize, e.maxSize);
    }
  }
  // --- Cập nhật vị trí và vận tốc của các sphere, xử lý va chạm ---
  update(e) {
    const { config: t, center: i, positionData: s, sizeData: n, velocityData: o } = this;
    let r = 0;
    if (t.controlSphere0) {
      r = 1;
      F.fromArray(s, 0);
      F.lerp(i, 0.1).toArray(s, 0);
      V.set(0, 0, 0).toArray(o, 0);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base);
      B.fromArray(o, base);
      B.y -= e.delta * t.gravity * n[idx];
      B.multiplyScalar(t.friction);
      B.clampLength(0, t.maxVelocity);
      I.add(B);
      I.toArray(s, base);
      B.toArray(o, base);
    }
    for (let idx = r; idx < t.count; idx++) {
      const base = 3 * idx;
      I.fromArray(s, base);
      B.fromArray(o, base);
      const radius = n[idx];
      for (let jdx = idx + 1; jdx < t.count; jdx++) {
        const otherBase = 3 * jdx;
        O.fromArray(s, otherBase);
        N.fromArray(o, otherBase);
        const otherRadius = n[jdx];
        _.copy(O).sub(I);
        const dist = _.length();
        const sumRadius = radius + otherRadius;
        if (dist < sumRadius) {
          const overlap = sumRadius - dist;
          j.copy(_).normalize().multiplyScalar(0.5 * overlap);
          H.copy(j).multiplyScalar(Math.max(B.length(), 1));
          T.copy(j).multiplyScalar(Math.max(N.length(), 1));
          I.sub(j);
          B.sub(H);
          I.toArray(s, base);
          B.toArray(o, base);
          O.add(j);
          N.add(T);
          O.toArray(s, otherBase);
          N.toArray(o, otherBase);
        }
      }
      if (t.controlSphere0) {
        _.copy(F).sub(I);
        const dist = _.length();
        const sumRadius0 = radius + n[0];
        if (dist < sumRadius0) {
          const diff = sumRadius0 - dist;
          j.copy(_.normalize()).multiplyScalar(diff);
          H.copy(j).multiplyScalar(Math.max(B.length(), 2));
          I.sub(j);
          B.sub(H);
        }
      }
      if (Math.abs(I.x) + radius > t.maxX) {
        I.x = Math.sign(I.x) * (t.maxX - radius);
        B.x = -B.x * t.wallBounce;
      }
      if (t.gravity === 0) {
        if (Math.abs(I.y) + radius > t.maxY) {
          I.y = Math.sign(I.y) * (t.maxY - radius);
          B.y = -B.y * t.wallBounce;
        }
      } else if (I.y - radius < -t.maxY) {
        I.y = -t.maxY + radius;
        B.y = -B.y * t.wallBounce;
      }
      const maxBoundary = Math.max(t.maxZ, t.maxSize);
      if (Math.abs(I.z) + radius > maxBoundary) {
        I.z = Math.sign(I.z) * (t.maxZ - radius);
        B.z = -B.z * t.wallBounce;
      }
      I.toArray(s, base);
      B.toArray(o, base);
    }
  }
}

// ==============================
// CLASS Y: Mở rộng MeshPhysicalMaterial để thêm hiệu ứng scattering cho clearcoat
class Y extends c {
  constructor(e) {
    super(e);
    // Định nghĩa các uniform cho hiệu ứng scattering
    this.uniforms = {
      thicknessDistortion: { value: 0.1 },
      thicknessAmbient: { value: 0 },
      thicknessAttenuation: { value: 0.1 },
      thicknessPower: { value: 2 },
      thicknessScale: { value: 10 },
    };
    // Kích hoạt sử dụng UV trong shader
    this.defines.USE_UV = "";
    // Sửa đổi shader trước khi compile
    this.onBeforeCompile = (e) => {
      Object.assign(e.uniforms, this.uniforms);
      e.fragmentShader =
        "\n        uniform float thicknessPower;\n        uniform float thicknessScale;\n        uniform float thicknessDistortion;\n        uniform float thicknessAmbient;\n        uniform float thicknessAttenuation;\n      " +
        e.fragmentShader;
      e.fragmentShader = e.fragmentShader.replace(
        "void main() {",
        "\n        void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {\n          vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));\n          float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;\n          #ifdef USE_COLOR\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;\n          #else\n            vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;\n          #endif\n          reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;\n        }\n\n        void main() {\n      "
      );
      const t = h.lights_fragment_begin.replaceAll(
        "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
        "\n          RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );\n          RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);\n        "
      );
      e.fragmentShader = e.fragmentShader.replace("#include <lights_fragment_begin>", t);
      if (this.onBeforeCompile2) this.onBeforeCompile2(e);
    };
  }
}

// ==============================
// CẤU HÌNH MẶC ĐỊNH CHO Ballpit
const X = {
  count: 200,
  colors: [0x05C3DD, 0x0099CC, 0xffffff, 0x808080, 0x000000],
  ambientColor: 16777215,
  ambientIntensity: 1,
  lightIntensity: 200,
  materialParams: {
    metalness: 0.5,
    roughness: 0.5,
    clearcoat: 1,
    clearcoatRoughness: 0.15,
  },
  minSize: 0.5,
  maxSize: 1,
  size0: 1,
  gravity: 0.5,
  friction: 0.9975,
  wallBounce: 0.95,
  maxVelocity: 0.15,
  maxX: 5,
  maxY: 5,
  maxZ: 2,
  controlSphere0: false,
  followCursor: true,
};

const U = new m(); // Object3D dùng để cập nhật matrix cho mỗi instance

// ==============================
// CLASS Z: Kế thừa InstancedMesh để render các sphere
class Z extends d {
  constructor(e, t = {}) {
    const i = { ...X, ...t };
    const s = new z(); // Tạo môi trường phòng
    const n = new p(e, 0.04).fromScene(s).texture; // Tạo texture môi trường
    const o = new g(); // Geometry của sphere
    const r = new Y({ envMap: n, ...i.materialParams }); // Material mở rộng với scattering
    r.envMapRotation.x = -Math.PI / 2;
    super(o, r, i.count);
    this.config = i;
    this.physics = new W(i); // Tạo instance vật lý cho sphere
    this.#S();  // Thiết lập ánh sáng
    this.setColors(i.colors); // Cài đặt màu sắc cho sphere
  }
  // --- Thiết lập ánh sáng cho Ballpit ---
  #S() {
    this.ambientLight = new f(
      this.config.ambientColor,
      this.config.ambientIntensity
    );
    this.add(this.ambientLight);
    this.light = new u(this.config.colors[0], this.config.lightIntensity);
    this.add(this.light);
  }
  // --- Cài đặt màu sắc cho từng sphere ---
  setColors(e) {
    if (Array.isArray(e) && e.length > 1) {
      const t = (function (e) {
        let t, i;
        function setColors(e) {
          t = e;
          i = [];
          t.forEach((col) => {
            i.push(new l(col));
          });
        }
        setColors(e);
        return {
          setColors,
          // Nội suy màu theo tỷ lệ (0-1)
          getColorAt: function (ratio, out = new l()) {
            const scaled = Math.max(0, Math.min(1, ratio)) * (t.length - 1);
            const idx = Math.floor(scaled);
            const start = i[idx];
            if (idx >= t.length - 1) return start.clone();
            const alpha = scaled - idx;
            const end = i[idx + 1];
            out.r = start.r + alpha * (end.r - start.r);
            out.g = start.g + alpha * (end.g - start.g);
            out.b = start.b + alpha * (end.b - start.b);
            return out;
          },
        };
      })(e);
      for (let idx = 0; idx < this.count; idx++) {
        this.setColorAt(idx, t.getColorAt(idx / this.count));
        if (idx === 0) {
          this.light.color.copy(t.getColorAt(idx / this.count));
        }
      }
      this.instanceColor.needsUpdate = true;
    }
  }
  // --- Cập nhật vị trí, kích thước của từng sphere ---
  update(e) {
    this.physics.update(e);
    for (let idx = 0; idx < this.count; idx++) {
      U.position.fromArray(this.physics.positionData, 3 * idx);
      // Nếu followCursor là false, ẩn sphere đầu tiên
      if (idx === 0 && this.config.followCursor === false) {
        U.scale.setScalar(0);
      } else {
        U.scale.setScalar(this.physics.sizeData[idx]);
      }
      U.updateMatrix();
      this.setMatrixAt(idx, U.matrix);
      if (idx === 0) this.light.position.copy(U.position);
    }
    this.instanceMatrix.needsUpdate = true;
  }
}

// ==============================
// HÀM createBallpit: Khởi tạo Ballpit trên canvas, trả về các phương thức tương tác
function createBallpit(e, t = {}) {
  const i = new x({
    canvas: e,
    size: "parent",
    rendererOptions: { antialias: true, alpha: true },
  });
  let s;
  i.renderer.toneMapping = v;
  i.camera.position.set(0, 0, 20);
  i.camera.lookAt(0, 0, 0);
  i.cameraMaxAspect = 1.5;
  i.resize();
  initialize(t);
  const n = new y(); // Raycaster để xác định vị trí tương tác
  const o = new w(new a(0, 0, 1), 0);
  const r = new a();
  let c = false;
  // Đăng ký sự kiện chuột cho canvas, cập nhật center cho vật lý sphere
  const h = S({
    domElement: e,
    onMove() {
      n.setFromCamera(h.nPosition, i.camera);
      i.camera.getWorldDirection(o.normal);
      n.ray.intersectPlane(o, r);
      s.physics.center.copy(r);
      s.config.controlSphere0 = true;
    },
    onLeave() {
      s.config.controlSphere0 = false;
    },
  });
  // Hàm initialize lại Ballpit khi thay đổi cấu hình
  function initialize(e) {
    if (s) {
      i.clear();
      i.scene.remove(s);
    }
    s = new Z(i.renderer, e);
    i.scene.add(s);
  }
  i.onBeforeRender = (e) => {
    if (!c) s.update(e);
  };
  i.onAfterResize = (e) => {
    s.config.maxX = e.wWidth / 2;
    s.config.maxY = e.wHeight / 2;
  };
  return {
    three: i,
    get spheres() {
      return s;
    },
    setCount(e) {
      initialize({ ...s.config, count: e });
    },
    togglePause() {
      c = !c;
    },
    dispose() {
      h.dispose();
      i.dispose();
    },
  };
}

// ==============================
// COMPONENT Ballpit (React)
// Sử dụng useRef và useEffect để khởi tạo và dọn dẹp canvas Ballpit.
const Ballpit = ({ className = '', followCursor = true, ...props }) => {
  const canvasRef = useRef(null);
  const spheresInstanceRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    spheresInstanceRef.current = createBallpit(canvas, { followCursor, ...props });

    return () => {
      if (spheresInstanceRef.current) {
        spheresInstanceRef.current.dispose();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Render canvas chiếm toàn màn hình (position fixed)
  return (
    <canvas
      className={className}
      ref={canvasRef}
      style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
    />
  );
};

export default Ballpit;
