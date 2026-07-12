'use client'

/**
 * OceanAmbience — persistent living-ocean layer for the hero section.
 *
 * WebGL shader (caustic light-web + god rays, subtle) beneath a 2D canvas
 * with parallax fish silhouettes, rising bubbles and layered surface waves.
 * Pauses when the tab is hidden or the hero is scrolled out of view.
 * Fully pointer-transparent; adds zero layout.
 */

import { useEffect, useRef } from 'react'

const VERT = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`
const FRAG = `
precision highp float;
uniform vec2 u_res;uniform float u_time;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*noise(p);p=p*2.02+vec2(3.1,7.7);a*=.5;}return v;}
void main(){
vec2 uv=gl_FragCoord.xy/u_res;
vec2 p=(gl_FragCoord.xy-.5*u_res)/u_res.y;
float t=u_time*.22;
vec3 col=vec3(0.);
// caustic interference web
float c1=fbm(p*2.6+vec2(t*.5,t*.2));
float c2=fbm(p*2.6-vec2(t*.38,-t*.29)+5.7);
float caus=pow(1.-abs(c1-c2),8.);
col+=vec3(.05,.38,.55)*caus*.5*smoothstep(-.4,1.,uv.y);
// god rays from upper-left
vec2 sun=vec2(.18,1.25);
vec2 d=uv-sun;float ang=atan(d.x,d.y);
float rays=pow(max(0.,sin(ang*12.+u_time*.3)*.5+.5),4.)
          *pow(max(0.,sin(ang*19.-u_time*.21+1.4)*.5+.5),2.);
col+=vec3(.07,.4,.6)*rays*smoothstep(1.5,.2,length(d))*.5;
// slow murk shimmer
col+=vec3(.02,.1,.16)*fbm(p*1.4+vec2(-t*.15,t*.1))*.6;
gl_FragColor=vec4(col,1.);
}`

interface AFish { x: number; y: number; v: number; size: number; depth: number; flap: number; dir: number }
interface ABubble { x: number; y: number; r: number; s: number; w: number }

export default function OceanAmbience() {
  const glRef = useRef<HTMLCanvasElement>(null)
  const fxRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const glc = glRef.current!
    const fxc = fxRef.current!
    const fx = fxc.getContext('2d')!
    const gl = glc.getContext('webgl', { antialias: false, alpha: false })
    const host = glc.parentElement!

    const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
    let W = 0, H = 0

    function resize() {
      const rect = host.getBoundingClientRect()
      W = Math.max(1, rect.width); H = Math.max(1, rect.height)
      for (const c of [glc, fxc]) {
        c.width = W * dpr; c.height = H * dpr
        c.style.width = `${W}px`; c.style.height = `${H}px`
      }
      if (gl) gl.viewport(0, 0, glc.width, glc.height)
      fx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(host)

    let uTime: WebGLUniformLocation | null = null
    let uRes: WebGLUniformLocation | null = null
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
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const fishes: AFish[] = Array.from({ length: 9 }, () => ({
      x: Math.random() * 1600,
      y: 0.15 + Math.random() * 0.6, // fraction of H
      v: 0.25 + Math.random() * 0.6,
      size: 8 + Math.random() * 16,
      depth: 0.25 + Math.random() * 0.75, // parallax + alpha
      flap: Math.random() * Math.PI * 2,
      dir: Math.random() > 0.4 ? 1 : -1,
    }))

    const bubbles: ABubble[] = Array.from({ length: 26 }, () => ({
      x: Math.random() * 1600, y: Math.random() * 900,
      r: 1 + Math.random() * 3, s: 0.25 + Math.random() * 0.7,
      w: Math.random() * Math.PI * 2,
    }))

    let visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting }, { threshold: 0.02 })
    io.observe(host)
    function onVis() { visible = !document.hidden && visible }
    document.addEventListener('visibilitychange', onVis)

    const start = performance.now()
    let raf = 0

    function drawFish(f: AFish, t: number) {
      const y = f.y * H + Math.sin(t * 0.7 + f.flap) * 8 * f.depth
      const tail = Math.sin(t * 6 + f.flap) * 0.5
      const a = 0.10 + f.depth * 0.16
      fx.save()
      fx.translate(f.x, y)
      fx.scale(f.dir * f.size / 10, f.size / 10)
      fx.fillStyle = `rgba(140,220,255,${a})`
      fx.beginPath()
      fx.moveTo(10, 0)
      fx.quadraticCurveTo(2, -4.2, -6, -1.5)
      fx.quadraticCurveTo(-9, 0, -6, 1.5)
      fx.quadraticCurveTo(2, 4.2, 10, 0)
      fx.fill()
      fx.beginPath()
      fx.moveTo(-6, 0)
      fx.lineTo(-12.5, -3.6 + tail * 5)
      fx.lineTo(-12.5, 3.6 + tail * 5)
      fx.closePath()
      fx.fill()
      fx.restore()
    }

    function frame(now: number) {
      raf = requestAnimationFrame(frame)
      if (!visible || reduced) return
      const t = (now - start) / 1000

      if (gl) {
        gl.uniform1f(uTime, t)
        gl.uniform2f(uRes, glc.width, glc.height)
        gl.drawArrays(gl.TRIANGLES, 0, 3)
      }

      fx.clearRect(0, 0, W, H)

      // fish
      for (const f of fishes) {
        f.x += f.v * f.dir * (0.6 + f.depth)
        if (f.dir > 0 && f.x > W + 60) { f.x = -60; f.y = 0.12 + Math.random() * 0.62 }
        if (f.dir < 0 && f.x < -60) { f.x = W + 60; f.y = 0.12 + Math.random() * 0.62 }
        drawFish(f, t)
      }

      // bubbles
      for (const b of bubbles) {
        b.y -= b.s
        b.x += Math.sin(t * 1.2 + b.w) * 0.35
        if (b.y < -6) { b.y = H + 6; b.x = Math.random() * W }
        fx.beginPath()
        fx.arc(b.x % (W + 12), b.y, b.r, 0, Math.PI * 2)
        fx.strokeStyle = 'rgba(170,230,255,0.22)'
        fx.lineWidth = 1
        fx.stroke()
      }

      // layered surface waves along the bottom edge
      const layers = [
        { amp: 10, len: 0.008, sp: 0.7, y: H - 34, col: 'rgba(0,212,255,0.05)' },
        { amp: 14, len: 0.006, sp: -0.5, y: H - 20, col: 'rgba(0,212,255,0.07)' },
        { amp: 18, len: 0.004, sp: 0.35, y: H - 8, col: 'rgba(0,168,204,0.10)' },
      ]
      for (const L of layers) {
        fx.beginPath()
        fx.moveTo(0, H)
        for (let x = 0; x <= W; x += 12) {
          fx.lineTo(x, L.y + Math.sin(x * L.len + t * L.sp) * L.amp + Math.sin(x * L.len * 2.7 - t * L.sp * 1.6) * L.amp * 0.4)
        }
        fx.lineTo(W, H)
        fx.closePath()
        fx.fillStyle = L.col
        fx.fill()
      }
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <canvas ref={glRef} className="absolute inset-0 mix-blend-screen opacity-80" />
      <canvas ref={fxRef} className="absolute inset-0" />
    </div>
  )
}
