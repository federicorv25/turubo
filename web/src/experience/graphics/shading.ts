import { CanvasTexture, Color, Vector2, Vector3, type MeshStandardMaterial, type PointsMaterial } from 'three'

/** Everything created for the scene is registered here and released together in dispose(). */
export class Tracker {
  private readonly items = new Set<{ dispose(): void }>()
  add<T extends { dispose(): void }>(item: T): T {
    this.items.add(item)
    return item
  }
  dispose() {
    for (const item of this.items) item.dispose()
    this.items.clear()
  }
}

/** World-space wind shared by the foliage material. */
const FOLIAGE_WIND_VERTEX = /* glsl */ `
  mat4 lfModel = modelMatrix;
  #ifdef USE_INSTANCING
    lfModel = modelMatrix * instanceMatrix;
  #endif
  vec4 worldPos = lfModel * vec4(transformed, 1.0);
  float gust = sin(uTime * 1.85 + worldPos.x * 0.45 + worldPos.z * 0.35);
  float flutter = cos(uTime * 4.1 + worldPos.x * 1.3 - worldPos.z * 1.1) * 0.35;
  float swayAmp = uWindStrength * uSwayScale * clamp(transformed.y + 0.55, 0.0, 2.0);
  vec3 windWorld = vec3(gust + flutter, 0.0, gust * 0.65 - flutter * 0.4) * swayAmp;
  transformed += inverse(mat3(lfModel)) * windWorld;
`

/**
 * Stylized materials ported from the prototype (turubo-atlas/src/engine/ShaderManager.ts):
 * warm/cool terminator and rim light for actors, strata for rock and terrain, wind for foliage, soft round particles.
 */
export class Shading {
  readonly uTime = { value: 0 }
  /** Points towards the sun (same direction as the key light). */
  readonly uSunDir = { value: new Vector3(32, 24.5, 28).normalize() }
  readonly uWindStrength = { value: 1 }
  private readonly tracker: Tracker
  private particleTexture: CanvasTexture | null = null

  constructor(tracker: Tracker) {
    this.tracker = tracker
  }

  update(elapsed: number) {
    this.uTime.value = elapsed
    this.uWindStrength.value = 0.85 + Math.sin(elapsed * 0.45) * 0.25
  }

  actor(material: MeshStandardMaterial, rimColorHex = 0xffcf88, rimStrength = 0.36) {
    const rimColor = new Color(rimColorHex)
    material.customProgramCacheKey = () => 'stylized-actor-v5'
    material.onBeforeCompile = shader => {
      shader.uniforms.uSunDir = this.uSunDir
      shader.uniforms.uRimColor = { value: rimColor }
      shader.uniforms.uRimStrength = { value: rimStrength }
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 uSunDir;
          uniform vec3 uRimColor;
          uniform float uRimStrength;`)
        .replace('#include <opaque_fragment>', `
          vec3 stV = normalize(vViewPosition);
          vec3 stW = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
          float stNdotL = dot(stW, normalize(uSunDir));
          float stStep = smoothstep(-0.32, 0.38, stNdotL);
          float stFresnel = pow(1.0 - clamp(dot(normal, stV), 0.0, 1.0), 2.6);
          float stUpBias = clamp(stW.y * 0.5 + 0.5, 0.25, 1.0);
          vec3 stShadowTint = mix(vec3(0.76, 0.78, 0.92), vec3(1.06, 1.01, 0.94), stStep);
          outgoingLight *= stShadowTint * mix(0.86, 1.08, stStep);
          outgoingLight += uRimColor * (stFresnel * uRimStrength * stUpBias);
          #include <opaque_fragment>`)
    }
    return material
  }

  rock(material: MeshStandardMaterial, rimColorHex = 0xffd191, rimStrength = 0.22) {
    const rimColor = new Color(rimColorHex)
    material.customProgramCacheKey = () => 'stylized-rock-v5'
    material.onBeforeCompile = shader => {
      shader.uniforms.uSunDir = this.uSunDir
      shader.uniforms.uRimColor = { value: rimColor }
      shader.uniforms.uRimStrength = { value: rimStrength }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          varying vec3 vRockWorldPos;
          varying float vRockLocalY;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vRockLocalY = transformed.y;
          vec4 rkPos = vec4(transformed, 1.0);
          #ifdef USE_INSTANCING
            rkPos = instanceMatrix * rkPos;
          #endif
          vRockWorldPos = (modelMatrix * rkPos).xyz;`)
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 uSunDir;
          uniform vec3 uRimColor;
          uniform float uRimStrength;
          varying vec3 vRockWorldPos;
          varying float vRockLocalY;
          float rkHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
          float rkNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(rkHash(i), rkHash(i + vec2(1.0, 0.0)), f.x), mix(rkHash(i + vec2(0.0, 1.0)), rkHash(i + vec2(1.0, 1.0)), f.x), f.y);
          }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec3 rkN = normalize(cross(dFdx(vRockWorldPos), dFdy(vRockWorldPos)));
          float grain = rkNoise(vRockWorldPos.xz * 1.45 + vRockWorldPos.y * 2.1);
          float strata = sin(vRockWorldPos.y * 3.1 + grain * 2.2 + vRockWorldPos.x * 0.25);
          float strataMask = smoothstep(-0.2, 0.72, strata);
          float facetTint = dot(rkN, vec3(0.45, 0.72, -0.52));
          diffuseColor.rgb *= mix(0.86, 1.14, strataMask * 0.55 + grain * 0.45);
          diffuseColor.rgb *= mix(vec3(0.92, 0.90, 0.96), vec3(1.08, 1.01, 0.92), clamp(facetTint * 0.5 + 0.5, 0.0, 1.0));
          float baseDust = 1.0 - smoothstep(-0.65, 0.45, vRockLocalY);
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.56, 0.44, 0.30), baseDust * 0.28);`)
        .replace('#include <opaque_fragment>', `
          vec3 rkV = normalize(vViewPosition);
          float rkSun = smoothstep(-0.35, 0.48, dot(rkN, normalize(uSunDir)));
          float rkRim = pow(1.0 - clamp(dot(normal, rkV), 0.0, 1.0), 2.8);
          float rkTopAO = clamp(rkN.y * 0.45 + 0.65, 0.45, 1.05);
          outgoingLight *= mix(vec3(0.75, 0.74, 0.88), vec3(1.08, 1.02, 0.94), rkSun) * rkTopAO;
          outgoingLight += uRimColor * (rkRim * uRimStrength * clamp(rkN.y * 0.5 + 0.5, 0.2, 1.0));
          #include <opaque_fragment>`)
    }
    return material
  }

  terrain(material: MeshStandardMaterial) {
    material.customProgramCacheKey = () => 'stylized-terrain-v5'
    material.onBeforeCompile = shader => {
      shader.uniforms.uSunDir = this.uSunDir
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          varying vec3 vTerrWorldPos;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          vTerrWorldPos = (modelMatrix * vec4(transformed, 1.0)).xyz;`)
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 uSunDir;
          varying vec3 vTerrWorldPos;
          float trHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
          float trNoise(vec2 p) {
            vec2 i = floor(p);
            vec2 f = fract(p);
            f = f * f * (3.0 - 2.0 * f);
            return mix(mix(trHash(i), trHash(i + vec2(1.0, 0.0)), f.x), mix(trHash(i + vec2(0.0, 1.0)), trHash(i + vec2(1.0, 1.0)), f.x), f.y);
          }
          float trFbm(vec2 p) { return trNoise(p) * 0.62 + trNoise(p * 2.17 + vec2(4.3, 1.9)) * 0.38; }`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          vec3 tn = normalize(cross(dFdx(vTerrWorldPos), dFdy(vTerrWorldPos)));
          float slopeFactor = 1.0 - clamp(tn.y, 0.0, 1.0);
          float macroNoise = trFbm(vTerrWorldPos.xz * 0.085);
          float microNoise = trNoise(vTerrWorldPos.xz * 0.58);
          float strataWave = sin(vTerrWorldPos.y * 2.9 + macroNoise * 2.4 + sin(vTerrWorldPos.x * 0.14) * 1.1);
          float strataBand = smoothstep(-0.3, 0.68, strataWave);
          vec3 strataCol = mix(vec3(0.49, 0.27, 0.20), vec3(0.84, 0.50, 0.31), strataBand);
          float grassMix = smoothstep(0.32, 0.72, macroNoise) * (1.0 - smoothstep(0.14, 0.42, slopeFactor));
          diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.68, 0.51, 0.34), vec3(0.56, 0.61, 0.29), microNoise), grassMix * 0.38);
          diffuseColor.rgb = mix(diffuseColor.rgb, strataCol, smoothstep(0.14, 0.56, slopeFactor) * 0.74);
          diffuseColor.rgb *= mix(0.84, 1.07, microNoise * 0.55 + clamp(tn.y, 0.0, 1.0) * 0.45);`)
        .replace('#include <opaque_fragment>', `
          float trSunWrap = smoothstep(-0.25, 0.55, dot(tn, normalize(uSunDir)));
          float rimSun = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 3.0);
          float ridgeLift = smoothstep(1.8, 12.0, vTerrWorldPos.y);
          outgoingLight *= mix(vec3(0.82, 0.80, 0.90), vec3(1.06, 1.01, 0.94), trSunWrap);
          outgoingLight += vec3(0.98, 0.72, 0.40) * (rimSun * 0.18 * ridgeLift);
          #include <opaque_fragment>`)
    }
    return material
  }

  foliage(material: MeshStandardMaterial, swayScale = 0.068, backlitStrength = 0.24) {
    material.customProgramCacheKey = () => 'stylized-foliage-v5'
    material.onBeforeCompile = shader => {
      shader.uniforms.uTime = this.uTime
      shader.uniforms.uWindStrength = this.uWindStrength
      shader.uniforms.uSunDir = this.uSunDir
      shader.uniforms.uSwayScale = { value: swayScale }
      shader.uniforms.uBacklitStrength = { value: backlitStrength }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          uniform float uTime;
          uniform float uWindStrength;
          uniform float uSwayScale;
          varying float vLeafHeight;
          varying vec3 vLeafWorldDir;`)
        .replace('#include <begin_vertex>', `#include <begin_vertex>
          ${FOLIAGE_WIND_VERTEX}
          vLeafHeight = clamp(transformed.y * 0.55 + 0.5, 0.0, 1.0);
          vLeafWorldDir = normalize(worldPos.xyz - cameraPosition);`)
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          uniform vec3 uSunDir;
          uniform float uBacklitStrength;
          varying float vLeafHeight;
          varying vec3 vLeafWorldDir;`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          diffuseColor.rgb *= mix(vec3(0.74, 0.80, 0.72), vec3(1.12, 1.08, 0.86), vLeafHeight);`)
        .replace('#include <opaque_fragment>', `
          float lfRim = pow(1.0 - clamp(dot(normal, normalize(vViewPosition)), 0.0, 1.0), 2.4);
          float lfBacklit = pow(max(dot(normalize(vLeafWorldDir), normalize(uSunDir)), 0.0), 2.4);
          outgoingLight += vec3(0.88, 0.90, 0.44) * ((lfRim * 0.16 + lfBacklit * uBacklitStrength) * vLeafHeight);
          #include <opaque_fragment>`)
    }
    return material
  }

  /** Radial soft-dot sprite (alpha read from the green channel by PointsMaterial.alphaMap). */
  private softParticleTexture() {
    if (this.particleTexture) return this.particleTexture
    const size = 64
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
      gradient.addColorStop(0, 'rgb(255,255,255)')
      gradient.addColorStop(0.35, 'rgb(200,200,200)')
      gradient.addColorStop(1, 'rgb(0,0,0)')
      context.fillStyle = gradient
      context.fillRect(0, 0, size, size)
    }
    this.particleTexture = this.tracker.add(new CanvasTexture(canvas))
    return this.particleTexture
  }

  /** Round, soft motes whose on-screen size is capped and which fade near the camera. */
  softParticles(material: PointsMaterial, maxPointSizeCssPx = 14, nearFadeStart = 0.9, nearFadeEnd = 3.2) {
    material.alphaMap = this.softParticleTexture()
    material.transparent = true
    material.depthWrite = false
    const baseSize = material.size
    material.customProgramCacheKey = () => 'soft-particle-v1'
    material.onBeforeCompile = shader => {
      shader.uniforms.uMaxPointSize = { value: maxPointSizeCssPx }
      shader.uniforms.uPointBaseSize = { value: baseSize }
      shader.uniforms.uNearFade = { value: new Vector2(nearFadeStart, nearFadeEnd) }
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>
          uniform float uMaxPointSize;
          uniform float uPointBaseSize;
          uniform vec2 uNearFade;
          varying float vNearFade;`)
        .replace('#include <logdepthbuf_vertex>', `
          gl_PointSize = min(gl_PointSize, uMaxPointSize * (size / max(uPointBaseSize, 1e-4)));
          vNearFade = smoothstep(uNearFade.x, uNearFade.y, -mvPosition.z);
          #include <logdepthbuf_vertex>`)
      shader.fragmentShader = shader.fragmentShader
        .replace('#include <common>', `#include <common>
          varying float vNearFade;`)
        .replace('#include <color_fragment>', `#include <color_fragment>
          diffuseColor.a *= vNearFade;`)
    }
    return material
  }
}
