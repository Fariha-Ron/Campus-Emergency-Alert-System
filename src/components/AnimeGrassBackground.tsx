import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  pulseSpeed: number;
  color: string;
}

interface Petal {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  rotation: number;
  rotationSpeed: number;
  opacity: number;
}

export const AnimeGrassBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle high-DPI displays without blurring
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const handleResize = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize glowing anemo/dendro spores (fireflies/floating seeds)
    const particleColors = [
      'rgba(167, 243, 208, ', // Mint highlight
      'rgba(110, 231, 183, ', // Bright mint
      'rgba(52, 211, 153, ',  // Emerald
      'rgba(253, 224, 71, ',  // Warm sunlight gold
    ];

    const particles: Particle[] = Array.from({ length: 32 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2.5 + 1.2,
      speedX: Math.random() * 0.4 + 0.15,
      speedY: -(Math.random() * 0.35 + 0.1),
      opacity: Math.random() * 0.6 + 0.25,
      pulseSpeed: Math.random() * 0.03 + 0.015,
      color: particleColors[Math.floor(Math.random() * particleColors.length)],
    }));

    // Initialize floating anime petals / dandelion puffs
    const petals: Petal[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 6 + 4,
      speedX: Math.random() * 0.7 + 0.4,
      speedY: Math.random() * 0.25 + 0.05,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.02,
      opacity: Math.random() * 0.35 + 0.15,
    }));

    // Grass blade configurations
    const grassCount = Math.min(Math.floor(width / 7), 160);
    const grassBlades = Array.from({ length: grassCount }, (_, i) => {
      const x = (i / grassCount) * width + (Math.random() - 0.5) * 12;
      const bladeHeight = Math.random() * 55 + 45;
      const baseWidth = Math.random() * 3 + 2.5;
      const layer = Math.random(); // 0 = back, 1 = front
      return {
        x,
        height: bladeHeight,
        baseWidth,
        layer,
        phase: Math.random() * Math.PI * 2,
      };
    });

    let time = 0;

    const render = () => {
      time += 0.018;

      // 1. Vibrant Genshin Celestial Horizon Sky
      const skyGradient = ctx.createLinearGradient(0, 0, 0, height);
      skyGradient.addColorStop(0, '#7DD3FC');    // Celestial anime cyan/blue
      skyGradient.addColorStop(0.35, '#BAE6FD'); // Soft sky
      skyGradient.addColorStop(0.60, '#ECFCCB'); // Sunlit golden-lime horizon
      skyGradient.addColorStop(0.85, '#D1FAE5'); // Lush mint mist
      skyGradient.addColorStop(1, '#A7F3D0');    // Foreground field base
      ctx.fillStyle = skyGradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Soft Stylized Anime Sunbeam God-Rays
      ctx.save();
      const sunGradient = ctx.createRadialGradient(width * 0.85, height * 0.05, 0, width * 0.85, height * 0.05, width * 0.8);
      sunGradient.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
      sunGradient.addColorStop(0.4, 'rgba(254, 240, 138, 0.12)');
      sunGradient.addColorStop(1, 'rgba(254, 240, 138, 0)');
      ctx.fillStyle = sunGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 3. Cel-Shaded Distant Mountain Silhouettes (Layer 1 - Misty Teal)
      ctx.save();
      ctx.fillStyle = 'rgba(15, 118, 110, 0.22)';
      ctx.beginPath();
      ctx.moveTo(0, height * 0.72);
      ctx.bezierCurveTo(width * 0.25, height * 0.62, width * 0.45, height * 0.74, width * 0.68, height * 0.65);
      ctx.bezierCurveTo(width * 0.85, height * 0.58, width * 0.95, height * 0.66, width, height * 0.68);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 4. Cel-Shaded Rolling Midground Hills (Layer 2 - Rich Forest Emerald)
      ctx.save();
      const midHillGrad = ctx.createLinearGradient(0, height * 0.68, 0, height);
      midHillGrad.addColorStop(0, '#059669');
      midHillGrad.addColorStop(1, '#065F46');
      ctx.fillStyle = midHillGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.78);
      ctx.bezierCurveTo(width * 0.2, height * 0.70, width * 0.5, height * 0.82, width * 0.75, height * 0.74);
      ctx.bezierCurveTo(width * 0.88, height * 0.70, width * 0.96, height * 0.76, width, height * 0.79);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 5. Cel-Shaded Rolling Foreground Hill (Layer 3 - Vibrant Spring Meadow)
      ctx.save();
      const foreHillGrad = ctx.createLinearGradient(0, height * 0.80, 0, height);
      foreHillGrad.addColorStop(0, '#10B981');
      foreHillGrad.addColorStop(0.4, '#059669');
      foreHillGrad.addColorStop(1, '#047857');
      ctx.fillStyle = foreHillGrad;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.85);
      ctx.bezierCurveTo(width * 0.3, height * 0.88, width * 0.65, height * 0.81, width, height * 0.86);
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // 6. Animated Cel-Shaded Grass Field along the Horizon & Foreground
      const grassBaseY = height;
      ctx.save();
      for (let i = 0; i < grassBlades.length; i++) {
        const blade = grassBlades[i];
        const isBackLayer = blade.layer < 0.45;

        // Realistic sinusoidal wind wave sweeping across from left to right
        const windWave = Math.sin(time * 1.5 + blade.x * 0.006 + blade.phase) * 16;
        const windGust = Math.sin(time * 0.6) * 8;
        const tipOffset = (windWave + windGust) * (isBackLayer ? 0.7 : 1.1);

        const startX = blade.x;
        const startY = grassBaseY;
        const tipX = startX + tipOffset;
        const tipY = startY - blade.height;
        const controlX = startX + tipOffset * 0.45;
        const controlY = startY - blade.height * 0.55;

        // Cel-shaded grass blade gradient
        const bladeGrad = ctx.createLinearGradient(startX, startY, tipX, tipY);
        if (isBackLayer) {
          bladeGrad.addColorStop(0, '#065F46');
          bladeGrad.addColorStop(1, '#10B981');
        } else {
          bladeGrad.addColorStop(0, '#047857');
          bladeGrad.addColorStop(0.6, '#10B981');
          bladeGrad.addColorStop(1, '#6EE7B7'); // Sunny mint tip
        }

        ctx.fillStyle = bladeGrad;
        ctx.beginPath();
        ctx.moveTo(startX - blade.baseWidth * 0.5, startY);
        ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
        ctx.quadraticCurveTo(controlX + blade.baseWidth * 0.4, controlY, startX + blade.baseWidth * 0.5, startY);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 7. Floating Anemo / Dendro Glowing Spores
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        // Wrap around seamlessly
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;

        const currentOpacity = p.opacity + Math.sin(time * 2 + i) * 0.15;
        const clampedOpacity = Math.max(0.1, Math.min(currentOpacity, 0.85));

        // Soft outer glow
        const glowGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3.5);
        glowGrad.addColorStop(0, `${p.color}${clampedOpacity})`);
        glowGrad.addColorStop(0.5, `${p.color}${clampedOpacity * 0.35})`);
        glowGrad.addColorStop(1, `${p.color}0)`);

        ctx.fillStyle = glowGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Core bright center
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // 8. Delicate Floating Anime Petals / Dandelion Seeds
      ctx.save();
      for (let i = 0; i < petals.length; i++) {
        const pt = petals[i];
        pt.x += pt.speedX;
        pt.y += pt.speedY + Math.sin(time + i) * 0.2;
        pt.rotation += pt.rotationSpeed;

        if (pt.x > width + 30) pt.x = -30;
        if (pt.y > height + 30) pt.y = -30;

        ctx.save();
        ctx.translate(pt.x, pt.y);
        ctx.rotate(pt.rotation);
        ctx.fillStyle = `rgba(255, 255, 255, ${pt.opacity})`;
        ctx.beginPath();
        ctx.ellipse(0, 0, pt.size, pt.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.restore();

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="pointer-events-none overflow-hidden inset-0 fixed z-0 select-none"
      aria-hidden="true"
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block"
      />
      {/* Soft warm sun vignette overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/20 via-transparent to-sky-400/10 pointer-events-none" />
    </div>
  );
};
