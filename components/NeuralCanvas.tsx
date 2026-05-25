"use client";

import { useEffect, useRef } from "react";

interface DendriteBranch {
  angle: number;
  length: number;
  width: number;
  curve: number;
  children: DendriteBranch[];
}

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  pulsePhase: number;
  isHub: boolean;
  rotation: number;
  dendrites: DendriteBranch[];
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

function generateSubBranches(
  isHub: boolean,
  parentLength: number,
  depth: number
): DendriteBranch[] {
  if (depth <= 0) return [];

  const count = 1 + Math.floor(Math.random() * (isHub ? 3 : 2));
  return Array.from({ length: count }, () => {
    const length = parentLength * (0.48 + Math.random() * 0.3);
    return {
      angle: (Math.random() - 0.5) * 1.8,
      length,
      width: Math.max(0.3, parentLength * 0.05 + Math.random() * 0.25),
      curve: (Math.random() - 0.5) * length * 0.4,
      children: generateSubBranches(isHub, length, depth - 1),
    };
  });
}

function generateDendriteTree(isHub: boolean): DendriteBranch[] {
  const count = isHub ? 6 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 2);
  return Array.from({ length: count }, (_, i) => {
    const length = isHub ? 28 + Math.random() * 30 : 18 + Math.random() * 22;
    return {
      angle: (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.8,
      length,
      width: isHub ? 1.3 + Math.random() * 0.8 : 0.8 + Math.random() * 0.55,
      curve: (Math.random() - 0.5) * length * 0.38,
      children: generateSubBranches(isHub, length, isHub ? 2 : 1),
    };
  });
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
      const count = Math.floor((canvas.width * canvas.height) / 22000);
      nodes = Array.from({ length: Math.max(count, 20) }, () => {
        const isHub = Math.random() > 0.8;
        return {
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          opacity: Math.random() * 0.3 + 0.4,
          pulsePhase: Math.random() * Math.PI * 2,
          isHub,
          rotation: Math.random() * Math.PI * 2,
          dendrites: generateDendriteTree(isHub),
        };
      });
      buildConnections();
    };

    const drawDendriteBranch = (
      x: number,
      y: number,
      parentAngle: number,
      branch: DendriteBranch,
      alpha: number,
      depth: number
    ) => {
      const angle = parentAngle + branch.angle;
      const endX = x + Math.cos(angle) * branch.length;
      const endY = y + Math.sin(angle) * branch.length;
      const ctrlX = (x + endX) / 2 - Math.sin(angle) * branch.curve;
      const ctrlY = (y + endY) / 2 + Math.cos(angle) * branch.curve;
      const branchAlpha = alpha * (0.95 - depth * 0.1);

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
      const grad = ctx.createLinearGradient(x, y, endX, endY);
      grad.addColorStop(0, `rgba(${TEAL_LIGHT}, ${branchAlpha * 0.95})`);
      grad.addColorStop(0.55, `rgba(${TEAL}, ${branchAlpha * 0.7})`);
      grad.addColorStop(1, `rgba(${TEAL_LIGHT}, ${branchAlpha * 0.35})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = branch.width;
      ctx.lineCap = "round";
      ctx.stroke();

      if (branch.children.length === 0) {
        // Dendritic spine / terminal bouton
        const spineGrd = ctx.createRadialGradient(endX, endY, 0, endX, endY, 2.8);
        spineGrd.addColorStop(0, `rgba(${TEAL_LIGHT}, ${branchAlpha * 1.1})`);
        spineGrd.addColorStop(1, `rgba(${TEAL}, 0)`);
        ctx.beginPath();
        ctx.arc(endX, endY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = spineGrd;
        ctx.fill();
        return;
      }

      branch.children.forEach((child) => {
        drawDendriteBranch(endX, endY, angle, child, alpha, depth + 1);
      });
    };

    const drawDendriteArbor = (n: Node) => {
      const pulse = Math.sin(n.pulsePhase) * 0.2 + 0.8;
      const alpha = n.opacity * pulse;

      n.dendrites.forEach((branch) => {
        drawDendriteBranch(n.x, n.y, n.rotation, branch, alpha, 0);
      });
    };

    const drawSoma = (n: Node) => {
      const pulse = Math.sin(n.pulsePhase) * 0.15 + 0.85;
      const alpha = n.opacity * pulse;
      const somaR = n.isHub ? 2.2 : 1.6;

      // Minimal nucleus — dendritic branches are the visual focus
      const core = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, somaR * 2.5);
      core.addColorStop(0, `rgba(255, 255, 255, ${alpha * 0.5})`);
      core.addColorStop(0.45, `rgba(${TEAL_LIGHT}, ${alpha * 0.35})`);
      core.addColorStop(1, `rgba(${TEAL}, 0)`);
      ctx.beginPath();
      ctx.arc(n.x, n.y, somaR * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = core;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(n.x, n.y, somaR, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${TEAL_LIGHT}, ${alpha * 0.75})`;
      ctx.fill();
    };

    const drawConnection = (conn: Connection) => {
      const a = nodes[conn.from];
      const b = nodes[conn.to];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const strength = 1 - dist / MAX_DIST;
      const len = dist || 1;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const cx = mx + (-dy / len) * conn.curve;
      const cy = my + (dx / len) * conn.curve;

      // Start/end slightly offset from soma center toward the partner
      const startOffset = a.isHub ? 6 : 4;
      const endOffset = b.isHub ? 6 : 4;
      const ax = a.x + (dx / len) * startOffset;
      const ay = a.y + (dy / len) * startOffset;
      const bx = b.x - (dx / len) * endOffset;
      const by = b.y - (dy / len) * endOffset;

      const baseAlpha = strength * 0.28 + 0.06;

      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.quadraticCurveTo(cx, cy, bx, by);
      const grad = ctx.createLinearGradient(ax, ay, bx, by);
      grad.addColorStop(0, `rgba(${TEAL_LIGHT}, ${baseAlpha * 1.4})`);
      grad.addColorStop(0.5, `rgba(${TEAL}, ${baseAlpha * 0.65})`);
      grad.addColorStop(1, `rgba(${TEAL_LIGHT}, ${baseAlpha * 1.2})`);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 0.55 + strength * 0.45;
      ctx.lineCap = "round";
      ctx.stroke();

      // Synapse terminals
      [
        [ax, ay],
        [bx, by],
      ].forEach(([px, py]) => {
        const grd = ctx.createRadialGradient(px, py, 0, px, py, 3.5);
        grd.addColorStop(0, `rgba(${TEAL_LIGHT}, ${baseAlpha * 1.8})`);
        grd.addColorStop(1, `rgba(${TEAL}, 0)`);
        ctx.beginPath();
        ctx.arc(px, py, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd;
        ctx.fill();
      });

      if (conn.signalActive) {
        conn.signalPhase += conn.signalSpeed;
        if (conn.signalPhase >= 1) {
          conn.signalPhase = 0;
          conn.signalActive = Math.random() > 0.35;
        }

        const pt = curvePoint(ax, ay, bx, by, conn.curve, conn.signalPhase);
        const pulseAlpha = Math.sin(conn.signalPhase * Math.PI) * 0.85 + 0.15;
        const pulseGrd = ctx.createRadialGradient(pt.x, pt.y, 0, pt.x, pt.y, 5);
        pulseGrd.addColorStop(0, `rgba(255, 255, 255, ${pulseAlpha * 0.9})`);
        pulseGrd.addColorStop(0.35, `rgba(${TEAL_LIGHT}, ${pulseAlpha * 0.7})`);
        pulseGrd.addColorStop(1, `rgba(${TEAL}, 0)`);
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = pulseGrd;
        ctx.fill();
      } else if (Math.random() > 0.997) {
        conn.signalActive = true;
        conn.signalPhase = 0;
      }
    };

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 30 || n.x > canvas.width - 30) n.vx *= -1;
        if (n.y < 30 || n.y > canvas.height - 30) n.vy *= -1;
        n.pulsePhase += n.isHub ? 0.016 : 0.022;
        n.rotation += n.isHub ? 0.0004 : 0.0008;
      });

      if (frame % REBUILD_INTERVAL === 0) buildConnections();

      // Layer order: dendrite arbors → axons → soma bodies
      nodes.forEach(drawDendriteArbor);
      connections.forEach(drawConnection);
      nodes.forEach(drawSoma);

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
