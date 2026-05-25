"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  pulsePhase: number;
}

interface Connection {
  from: number;
  to: number;
  opacity: number;
}

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let nodes: Node[] = [];
    let connections: Connection[] = [];

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const init = () => {
      resize();
      const count = Math.floor((canvas.width * canvas.height) / 18000);
      nodes = Array.from({ length: Math.max(count, 25) }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
        pulsePhase: Math.random() * Math.PI * 2,
      }));
      buildConnections();
    };

    const buildConnections = () => {
      connections = [];
      const maxDist = 160;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            connections.push({ from: i, to: j, opacity: 1 - dist / maxDist });
          }
        }
      }
    };

    let frame = 0;
    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Move nodes
      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
        n.pulsePhase += 0.02;
      });

      // Rebuild connections every 60 frames
      if (frame % 60 === 0) buildConnections();

      // Draw connections
      connections.forEach(({ from, to, opacity }) => {
        const a = nodes[from];
        const b = nodes[to];
        const alpha = opacity * 0.18;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = `rgba(20, 184, 166, ${alpha})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach((n) => {
        const pulse = Math.sin(n.pulsePhase) * 0.3 + 0.7;
        const alpha = n.opacity * pulse;

        // Glow
        const grd = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 4);
        grd.addColorStop(0, `rgba(20, 184, 166, ${alpha * 0.4})`);
        grd.addColorStop(1, "rgba(20, 184, 166, 0)");
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 4, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${alpha})`;
        ctx.fill();
      });

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();

    const handleResize = () => { init(); };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="neural-canvas"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.85,
      }}
    />
  );
}
