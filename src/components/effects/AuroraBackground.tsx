import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  hue: number;
}

export function AuroraBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const timeRef = useRef(0);

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: 28 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      opacity: Math.random() * 0.4 + 0.1,
      hue: Math.random() * 60 + 180, // cyan-blue-purple range
    }));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const draw = () => {
      const { width: w, height: h } = canvas;
      timeRef.current += 0.005;
      const t = timeRef.current;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      // Aurora orbs
      const orbs = [
        { x: 0.25 + Math.sin(t * 0.7) * 0.15, y: 0.3 + Math.cos(t * 0.5) * 0.1, r: w * 0.45, color: 'rgba(6,182,212,0.055)' },
        { x: 0.75 + Math.cos(t * 0.6) * 0.12, y: 0.7 + Math.sin(t * 0.4) * 0.12, r: w * 0.4,  color: 'rgba(139,92,246,0.045)' },
        { x: mx * 0.5 + 0.25, y: my * 0.5 + 0.25, r: w * 0.35, color: 'rgba(59,130,246,0.035)' },
        { x: 0.5 + Math.sin(t * 0.9) * 0.2, y: 0.5 + Math.cos(t * 0.8) * 0.15, r: w * 0.3, color: 'rgba(6,182,212,0.03)' },
      ];

      orbs.forEach(orb => {
        const grd = ctx.createRadialGradient(orb.x * w, orb.y * h, 0, orb.x * w, orb.y * h, orb.r);
        grd.addColorStop(0, orb.color);
        grd.addColorStop(1, 'transparent');
        ctx.fillStyle = grd;
        ctx.beginPath();
        ctx.arc(orb.x * w, orb.y * h, orb.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Mouse follow spotlight
      const spotGrd = ctx.createRadialGradient(mx * w, my * h, 0, mx * w, my * h, w * 0.25);
      spotGrd.addColorStop(0, 'rgba(6,182,212,0.04)');
      spotGrd.addColorStop(1, 'transparent');
      ctx.fillStyle = spotGrd;
      ctx.fillRect(0, 0, w, h);

      // Particles
      particlesRef.current.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.opacity})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouse);
    };
  }, [initParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 1 }}
      aria-hidden="true"
    />
  );
}
