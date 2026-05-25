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
  isHub: boolean;
}

interface Connection {
  from: number;
  to: number;
  signalPhase: number;
  signalSpeed: number;
  signalActive: boolean;
  curve: number;
}

const TEAL = "20, 184, 166";
const TEAL_LIGHT = "45, 212, 191";
const MAX_CONNECTIONS = 3;
const MAX_DIST = 190;
const REBUILD_INTERVAL = 90;

function connectionKey(a: number, b: number) {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

function curvePoint(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  curve: number,
  t: number
) {
  const mx = (ax + bx) / 2;
  const my = (ay + by) / 2;
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  const cx = mx + (-dy / len) * curve;
  const cy = my + (dx / len) * curve;

  const u = 1 - t;
  return {
    x: u * u * ax + 2 * u * t * cx + t * t * bx,
    y: u * u * ay + 2 * u * t * cy + t * t * by,
  };
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
    let frame = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };

    const buildConnections = () => {
      const seen = new Set<string>();
      const next: Connection[] = [];

      nodes.forEach((_, i) => {
        const neighbors = nodes
          .map((node, j) => {
            if (i === j) return null;
            const dx = nodes[i].x - node.x;
            const dy = nodes[i].y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            return { j, dist };
          })
          .filter((n): n is { j: number; dist: number } => n !== null && n.dist < MAX_DIST)
          .sort((a, b) => a.dist - b.dist)
          .slice(0, MAX_CONNECTIONS);

        neighbors.forEach(({ j, dist }) => {
          const key = connectionKey(i, j);
          if (seen.has(key)) return;
          seen.add(key);

          const existing = connections.find(
            (c) => connectionKey(c.from, c.to) === key
          );

          next.push({
            from: i,
            to: j,
            signalPhase: existing?.signalPhase ?? Math.random(),
            signalSpeed: existing?.signalSpeed ?? 0.004 + Math.random() * 0.006,
            signalActive: existing?.signalActive ?? Math.random() > 0.55,
            curve: (Math.random() - 0.5) * dist * 0.22,
          });
        });
      });

      connections = next;
    };

    const init = () => {
      resize();
      const count = Math.floor((canvas.width * canvas.height) / 20000);
      nodes = Array.from({ length: Math.max(count, 22) }, () => {
        const isHub = Math.random() > 0.78;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.22,
          vy: (Math.random() - 0.5) * 0.22,
          radius: isHub ? Math.random() * 1.8 + 2.4 : Math.random() * 1.2 + 1.2,
          opacity: Math.random() * 0.35 + 0.35,
          pulsePhase: Math.random() * Math.PI * 2,
          isHub,
        };
      });
      buildConnections();
    };

    const drawConnection = (conn: Connection) => {
      const a = nodes[conn.from];
      const b = nodes[conn.to];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const strength = 1 - dist / MAX_DIST;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const len = dist || 1;
      const cx = mx + (-dy / len) * conn.curve;
      const cy = my + (dx / len) * conn.curve;

      const baseAlpha = strength * 0.28 + 0.06;

      // Dendrite shaft with glow
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.quadraticCurveTo(cx, cy, b.x, b.y);
      const grad = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
      grad.addColorStop(0, `rgba(${TEAL_LIGHT}, ${baseAlpha * 1.4})`);
      grad.addColorStop(0.5, `rgba(${TEAL}, ${baseAlpha * 0.65})`);
      grad.addColorStop(1, `rgba(${TEAL_LIGHT}, ${baseAlpha * 1.2})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.6 + strength * 0.5;
      ctx.lineCap = "round";
      ctx.stroke();

      // Synapse terminals at each end
      [a, b].forEach((node, idx) => {
        const t = idx === 0 ? 0.08 : 0.92;
        const pt = curvePoint(a.x, a.y, b.x, b.y, conn.curve, t);
        const grd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 4);
        grd.addColorStop(0, `rgba(${TEAL_LIGHT}, ${baseAlpha * 1.8})`);
        grd.addColorStop(1, `rgba(${TEAL}, 0)`);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      // Action potential pulse traveling along the axon
      if (conn.signalActive) {
        conn.signalPhase += conn.signalSpeed;
        if (conn.signalPhase >= 1) {
          conn.signalPhase = 0;
          conn.signalActive = Math.random() > 0.35;
        }

        const pt = curvePoint(a.x, a.y, b.x, b.y, conn.curve, conn.signalPhase);
        const pulseAlpha = Math.sin(conn.signalPhase * Math.PI) * 0.85 + 0.15;
        const pulseGrd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 6);
        pulseGrd.addColorStop(0, `rgba(255, 255, 255, ${pulseAlpha * 0.9})`);
        pulseGrd.addColorStop(0.35, `rgba(${TEAL_LIGHT}, ${pulseAlpha * 0.7})`);
        pulseGrd.addColorStop(1, `rgba(${TEAL}, 0)`);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = pulseGrd;
        ctx.fill();
      } else if (Math.random() > 0.997) {
        conn.signalActive = true;
        conn.signalPhase = 0;
      }
    };

    const drawNode = (n: Node) => {
      const pulse = Math.sin(n.pulsePhase) * 0.25 + 0.75;
      const alpha = n.opacity * pulse;
      const somaRadius = n.radius * (n.isHub ? 1.15 : 1);

      // Outer membrane glow
      const outer = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, somaRadius * 6);
      outer.addColorStop(0, `rgba(${TEAL_LIGHT}, ${alpha * 0.35})`);
      outer.addColorStop(0.45, `rgba(${TEAL}, ${alpha * 0.12})`);
      outer.addColorStop(1, `rgba(${TEAL}, 0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, somaRadius * 6, 0, Math.PI * 2);
      ctx.fillStyle = outer;
      ctx.fill();

      // Cell body ring
      ctx.beginPath();
      ctx.arc(n.x, n.y, somaRadius + 0.8, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(${TEAL_LIGHT}, ${alpha * 0.35})`;
      ctx.lineWidth = 0.6;
      ctx.stroke();

      // Nucleus / soma core
      const core = ctx.createRadialGradient(
        n.x - somaRadius * 0.2,
        n.y - somaRadius * 0.2,
        0,
        n.x,
        n.y,
        somaRadius
      );
      core.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.55})`);
      core.addColorStop(0.4, `rgba(${TEAL_LIGHT}, ${alpha})`);
      core.addColorStop(1, `rgba(${TEAL}, ${alpha * 0.6})`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, somaRadius, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();
    };

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 20 || n.x > canvas.width - 20) n.vx *= -1;
        if (n.y < 20 || n.y > canvas.height - 20) n.vy *= -1;
        n.pulsePhase += n.isHub ? 0.018 : 0.025;
      });

      if (frame % REBUILD_INTERVAL === 0) buildConnections();

      connections.forEach(drawConnection);
      nodes.forEach(drawNode);

      animationId = requestAnimationFrame(draw);
    };

    init();
    draw();

    const handleResize = () => {
      init();
    };
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
        opacity: 0.9,
      }}
    />
  );
}
