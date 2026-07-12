'use client'

/**
 * OceanIntro — cinematic 10s WebGL + canvas opening sequence.
 *
 * Layers (back → front):
 *  1. WebGL fragment shader   — volumetric deep-ocean: depth fog, animated
 *     caustics, god rays, sun glow. Driven by phase uniforms.
 *  2. 2D canvas               — boids fish school (forms a rotating ship's
 *     wheel), bubbles, plankton, passing ship silhouette, surface-burst wipe.
 *  3. DOM                     — kinetic wordmark typography, depth meter,
 *     skip control.
 *
 * Plays once per session. Skipped entirely for prefers-reduced-motion.
 */

import { useEffect, useRef, useState } from 'react'

const TOTAL = 10.4 // seconds

// ── timeline (seconds) ────────────────────────────────────────────────────────
const T = {
  fadeIn: 0.9,       // black → abyss
  schoolIn: 1.4,     // fish arrive
  ringForm: 3.2,     // school assembles into wheel
  titleIn: 4.1,      // wordmark letters materialize
  subIn: 5.4,        // subtitle
  disperse: 6.9,     // wheel dissolves, ship crosses
  ascend: 7.6,       // rapid ascent begins
  burst: 9.5,        // surface burst / flash
  out: 9.9,          // overlay fade
}

// ── WebGL shader ──────────────────────────────────────────────────────────────
const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`

const FRAG = `
precision highp float;
uniform vec2 u_res;uniform float u_time;uniform float u_prog;uniform float u_asc;uniform float u_burst;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return v;}
void main(){
vec2 uv=gl_FragCoord.xy/u_res;
vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;
float t=u_time*.32;
// depth palette — rises with ascent
float dm=uv.y*.45+u_asc*.85;
vec3 abyss=vec3(.002,.012,.032);
vec3 deep=vec3(.008,.055,.11);
vec3 mid=vec3(.012,.13,.22);
vec3 sur=vec3(.05,.55,.78);
vec3 col=mix(abyss,deep,smoothstep(0.,.55,dm));
col=mix(col,mid,smoothstep(.45,1.05,dm));
col=mix(col,sur,smoothstep(.95,1.75,dm));
// drifting volumetric murk
float murk=fbm(p*1.6+vec2(t*.18,-t*.07));
col*=.82+.36*murk;
// caustic web — two advected fields interfering
float c1=fbm(p*3.1+vec2(t*.55,t*.21));
float c2=fbm(p*3.1-vec2(t*.42,-t*.33)+7.31);
float caus=pow(1.-abs(c1-c2),9.);
col+=vec3(.12,.55,.75)*caus*(.10+.55*u_asc+.25*u_prog)*smoothstep(-.35,.9,uv.y);
// god rays — angular streaks from a sun that nears as we ascend
vec2 sun=vec2(.5+.13*sin(u_time*.09),1.22-u_asc*.28);
vec2 d=uv-sun;
float ang=atan(d.x,d.y);
float rays=pow(max(0.,sin(ang*14.+u_time*.42)*.5+.5),3.5)
          *pow(max(0.,sin(ang*23.-u_time*.31+2.1)*.5+.5),2.);
float rmask=smoothstep(1.35,.05,length(d))*smoothstep(-.1,.4,uv.y);
col+=vec3(.18,.72,.95)*rays*rmask*(.05+.30*u_prog+.55*u_asc);
// sun glow core
col+=vec3(.35,.85,1.)*pow(max(0.,1.-length(d)*1.35),3.2)*(.10+.9*u_asc);
// bioluminescent motes (stable star-like glints, only in the deep)
vec2 g=floor(gl_FragCoord.xy/3.);
float glint=step(.9985,hash(g))*(.5+.5*sin(u_time*2.+hash(g.yx)*40.));
col+=vec3(.2,.8,1.)*glint*(1.-u_asc)*.55;
// surface burst flash
col=mix(col,vec3(.88,1.,1.),u_burst);
// vignette
float vig=smoothstep(1.35,.3,length(p));
col*=mix(.68,1.,vig);
gl_FragColor=vec4(col,1.);
}`

// ── fish boid ────────────────────────────────────────────────────────────────
interface Fish {
  x: number; y: number; vx: number; vy: number
  size: number; hue: number; flap: number; ring: number // ring slot angle
}

interface Bubble { x: number; y: number; r: number; s: number; w: number }

function easeInOut(x: number) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2 }
function clamp01(x: number) { return Math.max(0, Math.min(1, x)) }
// phase ramp: 0 before a, 1 after b
function ramp(t: number, a: number, b: number) { return clamp01((t - a) / (b - a)) }

const WORD = 'MARITIME AI GUIDE'
const SUB = 'CHART YOUR COURSE'

export default function OceanIntro() {
  const [mounted, setMounted] = useState(false)
  const [done, setDone] = useState(false)
  const wrapRef = useRef<HTMLDivElement>(null)
  const glCanvasRef = useRef<HTMLCanvasElement>(null)
  const fxCanvasRef = useRef<HTMLCanvasElement>(null)
  const titleRef = useRef<HTMLDivElement>(null)
  const subRef = useRef<HTMLDivElement>(null)
  const depthRef = useRef<HTMLSpanElement>(null)
  const skipRef = useRef<HTMLButtonElement>(null)
  const skippedRef = useRef(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (sessionStorage.getItem('mag_intro_v1')) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    const wrap = wrapRef.current!
    const glc = glCanvasRef.current!
    const fxc = fxCanvasRef.current!
    const fx = fxc.getContext('2d')!
    const gl = glc.getContext('webgl', { antialias: false, alpha: false })

    document.body.style.overflow = 'hidden'
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let W = window.innerWidth, H = window.innerHeight

    function resize() {
      W = window.innerWidth; H = window.innerHeight
      for (const c of [glc, fxc]) {
        c.width = W * dpr; c.height = H * dpr
        c.style.width = `${W}px`; c.style.height = `${H}px`
      }
      if (gl) gl.viewport(0, 0, glc.width, glc.height)
      fx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    // ── WebGL setup ──
    let uTime: WebGLUniformLocation | null = null
    let uRes: WebGLUniformLocation | null = null
    let uProg: WebGLUniformLocation | null = null
    let uAsc: WebGLUniformLocation | null = null
    let uBurst: WebGLUniformLocation | null = null
    if (gl) {
      const vs = gl.createShader(gl.VERTEX_SHADER)!
      gl.shaderSource(vs, VERT); gl.compileShader(vs)
      const fs = gl.createShader(gl.FRAGMENT_SHADER)!
      gl.shaderSource(fs, FRAG); gl.compileShader(fs)
      const prog = gl.createProgram()!
      gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog)
      gl.useProgram(prog)
      const buf = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buf)
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
      const loc = gl.getAttribLocation(prog, 'a')
      gl.enableVertexAttribArray(loc)
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
      uTime = gl.getUniformLocation(prog, 'u_time')
      uRes = gl.getUniformLocation(prog, 'u_res')
      uProg = gl.getUniformLocation(prog, 'u_prog')
      uAsc = gl.getUniformLocation(prog, 'u_asc')
      uBurst = gl.getUniformLocation(prog, 'u_burst')
    }

    // ── fish school ──
    const FISH_N = Math.min(110, Math.floor(W / 12))
    const fish: Fish[] = Array.from({ length: FISH_N }, (_, i) => ({
      x: Math.random() * W,
      y: H * 0.75 + Math.random() * H * 0.6,
      vx: (Math.random() - 0.5) * 2,
      vy: -2.2 - Math.random() * 1.5,
      size: 5 + Math.random() * 9,
      hue: 185 + Math.random() * 20,
      flap: Math.random() * Math.PI * 2,
      ring: (i / FISH_N) * Math.PI * 2,
    }))

    const bubbles: Bubble[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 1 + Math.random() * 3.5, s: 0.4 + Math.random() * 1.2,
      w: Math.random() * Math.PI * 2,
    }))

    const plankton = Array.from({ length: 90 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 0.4 + Math.random() * 1.1, a: 0.15 + Math.random() * 0.4,
      sp: 0.15 + Math.random() * 0.4,
    }))

    // ── kinetic typography via WAAPI ──
    let titleAnimated = false
    let subAnimated = false
    function animateLetters(el: HTMLElement, delayStep: number, dur: number) {
      const spans = Array.from(el.querySelectorAll<HTMLElement>('span[data-l]'))
      spans.forEach((s, i) => {
        // wave stagger — center-out
        const mid = (spans.length - 1) / 2
        const order = Math.abs(i - mid)
        s.animate(
          [
            { opacity: 0, transform: 'translateY(42px) scale(1.4) rotateX(70deg)', filter: 'blur(14px)', letterSpacing: '0.4em' },
            { opacity: 1, transform: 'translateY(0) scale(1) rotateX(0deg)', filter: 'blur(0px)', letterSpacing: '0.02em' },
          ],
          { duration: dur, delay: order * delayStep, easing: 'cubic-bezier(0.16,1,0.3,1)', fill: 'forwards' },
        )
      })
      el.style.opacity = '1'
    }

    // ── main loop ──
    const start = performance.now()
    let raf = 0
    let ended = false

    function finish(fast: boolean) {
      if (ended) return
      ended = true
      sessionStorage.setItem('mag_intro_v1', '1')
      document.body.style.overflow = ''
      const fade = wrap.animate(
        [{ opacity: 1 }, { opacity: 0 }],
        { duration: fast ? 420 : 700, easing: 'ease-out', fill: 'forwards' },
      )
      fade.onfinish = () => {
        cancelAnimationFrame(raf)
        setDone(true)
      }
    }

    function skip() { skippedRef.current = true; finish(true) }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') skip()
    }
    window.addEventListener('keydown', onKey)
    const skipBtn = skipRef.current
    skipBtn?.addEventListener('click', skip)

    function drawFishShape(f: Fish, t: number, alpha: number) {
      const angle = Math.atan2(f.vy, f.vx)
      const tail = Math.sin(t * 9 + f.flap) * 0.45
      fx.save()
      fx.translate(f.x, f.y)
      fx.rotate(angle)
      fx.scale(f.size / 10, f.size / 10)
      const grad = fx.createLinearGradient(-14, 0, 10, 0)
      grad.addColorStop(0, `hsla(${f.hue},90%,72%,${alpha * 0.55})`)
      grad.addColorStop(1, `hsla(${f.hue},95%,88%,${alpha})`)
      fx.fillStyle = grad
      fx.beginPath()
      fx.moveTo(10, 0)
      fx.quadraticCurveTo(2, -4.4, -6, -1.6)
      fx.quadraticCurveTo(-9, 0, -6, 1.6)
      fx.quadraticCurveTo(2, 4.4, 10, 0)
      fx.fill()
      // tail
      fx.beginPath()
      fx.moveTo(-6, 0)
      fx.lineTo(-13, -4 + tail * 6)
      fx.lineTo(-13, 4 + tail * 6)
      fx.closePath()
      fx.fillStyle = `hsla(${f.hue},85%,65%,${alpha * 0.8})`
      fx.fill()
      // eye glint
      fx.beginPath()
      fx.arc(5.5, -1, 0.9, 0, Math.PI * 2)
      fx.fillStyle = `rgba(6,22,40,${alpha})`
      fx.fill()
      fx.restore()
    }

    function frame(now: number) {
      const t = (now - start) / 1000
      if (t > TOTAL) { finish(false) }

      const prog = clamp01(t / TOTAL)
      const asc = easeInOut(ramp(t, T.ascend, T.burst))
      const burst = ramp(t, T.burst, T.burst + 0.35) * (1 - ramp(t, T.burst + 0.35, T.out + 0.4))
      const fadeInA = ramp(t, 0, T.fadeIn)

      // ── shader pass ──
      if (gl) {
        gl.uniform1f(uTime, t)
        gl.uniform2f(uRes, glc.width, glc.height)
        gl.uniform1f(uProg, prog)
        gl.uniform1f(uAsc, asc)
        gl.uniform1f(uBurst, burst)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }

      // ── 2D pass ──
      fx.clearRect(0, 0, W, H)

      // plankton drift (sinks faster during ascent = we rise)
      fx.save()
      for (const pk of plankton) {
        pk.y += pk.sp * (1 + asc * 22)
        pk.x += Math.sin(t * 0.6 + pk.y * 0.01) * 0.2
        if (pk.y > H + 4) { pk.y = -4; pk.x = Math.random() * W }
        fx.beginPath()
        fx.arc(pk.x, pk.y, pk.r, 0, Math.PI * 2)
        fx.fillStyle = `rgba(160,230,255,${pk.a * fadeInA * (1 - burst)})`
        fx.fill()
      }
      fx.restore()

      // bubbles (rush downward during ascent)
      for (const b of bubbles) {
        b.y -= b.s * (1 + asc * -3.4) // normal rise; during ascent they streak down
        b.x += Math.sin(t * 1.4 + b.w) * 0.5
        if (b.y < -8) { b.y = H + 8; b.x = Math.random() * W }
        if (b.y > H + 12) { b.y = -8; b.x = Math.random() * W }
        fx.beginPath()
        fx.arc(b.x, b.y, b.r * (1 + asc * 0.8), 0, Math.PI * 2)
        fx.strokeStyle = `rgba(190,240,255,${0.35 * fadeInA * (1 - burst)})`
        fx.lineWidth = 1
        fx.stroke()
        fx.beginPath()
        fx.arc(b.x - b.r * 0.3, b.y - b.r * 0.3, b.r * 0.32, 0, Math.PI * 2)
        fx.fillStyle = `rgba(255,255,255,${0.45 * fadeInA * (1 - burst)})`
        fx.fill()
      }

      // passing ship silhouette (surface, far) during disperse phase
      const shipP = ramp(t, T.disperse - 0.4, T.ascend + 1.6)
      if (shipP > 0 && shipP < 1) {
        const sx = -260 + (W + 520) * shipP
        const sy = H * 0.16
        const bob = Math.sin(t * 1.1) * 4
        fx.save()
        fx.globalAlpha = 0.5 * Math.sin(shipP * Math.PI)
        fx.translate(sx, sy + bob)
        fx.fillStyle = 'rgba(2,10,22,0.9)'
        fx.beginPath() // hull
        fx.moveTo(-120, 0); fx.lineTo(120, 0); fx.lineTo(96, 26); fx.lineTo(-96, 26); fx.closePath(); fx.fill()
        fx.fillRect(-58, -30, 74, 30) // superstructure
        fx.fillRect(-38, -48, 26, 18)
        fx.fillRect(30, -22, 10, 22) // funnel
        fx.restore()
      }

      // ── fish behaviour ──
      const ringT = easeInOut(ramp(t, T.ringForm, T.ringForm + 1.1)) * (1 - easeInOut(ramp(t, T.disperse, T.disperse + 0.9)))
      const cx = W / 2, cy = H / 2
      // elliptical wheel that frames the wordmark
      const ringRX = Math.min(W * 0.36, 620)
      const ringRY = Math.min(H * 0.34, 330)
      const spin = t * 0.5

      for (let fi = 0; fi < fish.length; fi++) {
        const f = fish[fi]
        let ax = 0, ay = 0
        // ring slot (elliptical, rotating)
        const slotA = f.ring + spin
        const tx = cx + Math.cos(slotA) * ringRX
        const ty = cy + Math.sin(slotA) * ringRY
        if (ringT > 0.01) {
          // strong spring onto the slot + heavy damping so the wheel locks
          ax += (tx - f.x) * 0.06 * ringT
          ay += (ty - f.y) * 0.06 * ringT
          f.vx *= 1 - 0.10 * ringT
          f.vy *= 1 - 0.10 * ringT
          // tangential drift so the wheel visibly turns
          ax += -Math.sin(slotA) * 0.55 * ringT
          ay += Math.cos(slotA) * 0.50 * ringT
        } else {
          // loose lissajous wander target for the school
          const wx = cx + Math.sin(t * 0.4) * W * 0.26
          const wy = cy + Math.sin(t * 0.63 + 1.7) * H * 0.2 - asc * H * 0.9
          ax += (wx - f.x) * 0.0016
          ay += (wy - f.y) * 0.0016
        }
        // separation only while free-schooling (slots handle spacing on the ring)
        if (ringT < 0.5) {
          for (let k = 0; k < 3; k++) {
            const o = fish[(fi + k * 37 + 1) % fish.length]
            const dx = f.x - o.x, dy = f.y - o.y
            const d2 = dx * dx + dy * dy
            if (d2 < 900 && d2 > 0.01) { ax += dx / d2 * 6; ay += dy / d2 * 6 }
          }
        }
        // during ascent everyone dives downward fast (we fly up past them)
        if (asc > 0) ay += asc * 1.6

        f.vx += ax; f.vy += ay
        const sp = Math.hypot(f.vx, f.vy)
        const maxSp = 3.4 + ringT * 4 + asc * 6
        if (sp > maxSp) { f.vx = (f.vx / sp) * maxSp; f.vy = (f.vy / sp) * maxSp }
        f.x += f.vx; f.y += f.vy

        const alpha = fadeInA * ramp(t, T.schoolIn - 0.6, T.schoolIn + 1.2) * (1 - burst)
        if (alpha > 0.01) drawFishShape(f, t, alpha)
      }

      // ── surface burst wipe ── rising foam edge just before the end
      const wipe = ramp(t, T.burst - 0.15, T.out + 0.1)
      if (wipe > 0) {
        const yLine = H * (1 - wipe * 1.25)
        const g2 = fx.createLinearGradient(0, yLine, 0, yLine + H * 0.5)
        g2.addColorStop(0, 'rgba(235,252,255,0.95)')
        g2.addColorStop(0.12, 'rgba(160,235,255,0.55)')
        g2.addColorStop(1, 'rgba(120,220,255,0)')
        fx.fillStyle = g2
        fx.beginPath()
        fx.moveTo(0, yLine)
        for (let x = 0; x <= W; x += 16) {
          fx.lineTo(x, yLine + Math.sin(x * 0.02 + t * 7) * 14 + Math.sin(x * 0.005 - t * 3) * 22)
        }
        fx.lineTo(W, H); fx.lineTo(0, H); fx.closePath()
        fx.fill()
      }

      // ── DOM cues ──
      if (!titleAnimated && t >= T.titleIn && titleRef.current) {
        titleAnimated = true
        animateLetters(titleRef.current, 55, 950)
      }
      if (!subAnimated && t >= T.subIn && subRef.current) {
        subAnimated = true
        animateLetters(subRef.current, 30, 700)
      }
      // title exit on ascent
      if (titleRef.current && asc > 0) {
        titleRef.current.style.transform = `translateY(${asc * 120}px) scale(${1 + asc * 0.35})`
        titleRef.current.style.opacity = String(1 - asc * 1.6)
        if (subRef.current) {
          subRef.current.style.transform = `translateY(${asc * 160}px)`
          subRef.current.style.opacity = String(1 - asc * 2)
        }
      }
      // depth meter
      if (depthRef.current) {
        const preAsc = ramp(t, T.fadeIn, T.ascend)
        const depth = Math.max(0, Math.round(3800 - preAsc * 1400 - easeInOut(ramp(t, T.ascend, T.burst)) * 2400))
        depthRef.current.textContent = `− ${depth.toLocaleString('en-IN')} M`
        depthRef.current.style.opacity = String(fadeInA * (1 - burst))
      }

      if (!ended) raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('keydown', onKey)
      skipBtn?.removeEventListener('click', skip)
      document.body.style.overflow = ''
    }
  }, [mounted])

  if (!mounted || done) return null

  return (
    <div
      ref={wrapRef}
      className="fixed inset-0 z-[200] bg-[#010710] select-none"
      aria-hidden="true"
      style={{ perspective: '900px' }}
    >
      <canvas ref={glCanvasRef} className="absolute inset-0" />
      <canvas ref={fxCanvasRef} className="absolute inset-0" />

      {/* wordmark */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
        <div
          ref={titleRef}
          className="font-display font-bold text-white text-center leading-none opacity-0"
          style={{
            fontSize: 'clamp(2rem, 7vw, 5.5rem)',
            textShadow: '0 0 60px rgba(0,212,255,0.55), 0 0 24px rgba(0,212,255,0.35)',
            transformStyle: 'preserve-3d',
          }}
        >
          {WORD.split('').map((ch, i) => (
            <span
              key={i}
              data-l
              className="inline-block opacity-0"
              style={ch === ' ' ? { width: '0.45em' } : undefined}
            >
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
        <div
          ref={subRef}
          className="mt-5 font-display font-medium text-accent tracking-[0.55em] text-center opacity-0"
          style={{ fontSize: 'clamp(0.65rem, 1.6vw, 1rem)', textShadow: '0 0 30px rgba(0,212,255,0.8)' }}
        >
          {SUB.split('').map((ch, i) => (
            <span key={i} data-l className="inline-block opacity-0" style={ch === ' ' ? { width: '0.6em' } : undefined}>
              {ch === ' ' ? ' ' : ch}
            </span>
          ))}
        </div>
      </div>

      {/* depth meter */}
      <div className="absolute left-6 bottom-6 pointer-events-none">
        <span
          ref={depthRef}
          className="font-mono text-[11px] tracking-[0.3em] text-accent/80"
          style={{ opacity: 0 }}
        >
          − 3,800 M
        </span>
      </div>

      {/* skip */}
      <button
        ref={skipRef}
        className="absolute right-6 bottom-6 text-[11px] tracking-[0.25em] uppercase text-white/50 hover:text-white transition-colors border border-white/15 hover:border-white/40 rounded-full px-4 py-2 backdrop-blur-sm"
        style={{ animation: 'fadeIn 0.6s ease-out 1s both' }}
      >
        Skip ⏎
      </button>
    </div>
  )
}
