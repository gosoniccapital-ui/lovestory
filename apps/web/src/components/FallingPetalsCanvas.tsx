"use client";

import React, { useEffect, useRef } from "react";

export type ParticleType = "petals" | "sakura" | "goldDust" | "hearts" | "snow" | "none";

interface FallingPetalsCanvasProps {
  type?: ParticleType;
  density?: "low" | "medium" | "high";
  speed?: number;
  className?: string;
  style?: React.CSSProperties;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  rotation: number;
  rotationSpeed: number;
  flip: number;
  flipSpeed: number;
  opacity: number;
  color: string;
  shape: "petal" | "circle" | "heart";
}

export function FallingPetalsCanvas({
  type = "petals",
  density = "medium",
  speed = 1,
  className = "",
  style,
}: FallingPetalsCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (type === "none") return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Density config based on screen size (Mobile optimization)
    const isMobile = width < 768;
    const countMap = {
      low: isMobile ? 12 : 25,
      medium: isMobile ? 24 : 50,
      high: isMobile ? 40 : 80,
    };
    const count = countMap[density] || 35;

    const PETAL_COLORS = [
      "#f43f5e",
      "#fb7185",
      "#fda4af",
      "#fecdd3",
      "#ffe4e6",
      "#e11d48",
    ];

    const GOLD_COLORS = [
      "#fef08a",
      "#fde047",
      "#eab308",
      "#ca8a04",
      "#fbbf24",
      "#ffffff",
    ];

    const particles: Particle[] = [];

    for (let i = 0; i < count; i++) {
      const isGold = type === "goldDust";
      const isHeart = type === "hearts";
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height - height,
        size: isGold ? Math.random() * 3 + 1.5 : Math.random() * 10 + 8,
        speedY: (Math.random() * 1.5 + 1) * speed,
        speedX: (Math.random() * 1 - 0.5) * speed,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() * 2 - 1) * 0.8,
        flip: Math.random() * Math.PI,
        flipSpeed: Math.random() * 0.03 + 0.01,
        opacity: Math.random() * 0.5 + 0.5,
        color: isGold
          ? GOLD_COLORS[Math.floor(Math.random() * GOLD_COLORS.length)]
          : PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)],
        shape: isGold ? "circle" : isHeart ? "heart" : "petal",
      });
    }

    const drawPetal = (
      ctx: CanvasRenderingContext2D,
      p: Particle,
      scaleX: number
    ) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.scale(scaleX, 1);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        -p.size / 2,
        -p.size / 2,
        -p.size / 2,
        p.size / 2,
        0,
        p.size
      );
      ctx.bezierCurveTo(
        p.size / 2,
        p.size / 2,
        p.size / 2,
        -p.size / 2,
        0,
        0
      );
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 4;
      ctx.fill();
      ctx.restore();
    };

    const drawHeart = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.beginPath();
      const topCurveHeight = p.size * 0.3;
      ctx.moveTo(0, topCurveHeight);
      ctx.bezierCurveTo(0, 0, -p.size / 2, 0, -p.size / 2, topCurveHeight);
      ctx.bezierCurveTo(
        -p.size / 2,
        (p.size + topCurveHeight) / 2,
        0,
        (p.size + topCurveHeight) / 2,
        0,
        p.size
      );
      ctx.bezierCurveTo(
        0,
        (p.size + topCurveHeight) / 2,
        p.size / 2,
        (p.size + topCurveHeight) / 2,
        p.size / 2,
        topCurveHeight
      );
      ctx.bezierCurveTo(p.size / 2, 0, 0, 0, 0, topCurveHeight);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.fill();
      ctx.restore();
    };

    const drawGoldSparkle = (ctx: CanvasRenderingContext2D, p: Particle) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.beginPath();
      ctx.arc(0, 0, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.opacity;
      ctx.shadowColor = "#fef08a";
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.restore();
    };

    let tick = 0;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      tick++;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 3D flip calculation
        p.flip += p.flipSpeed;
        const scaleX = Math.cos(p.flip);

        // Wind sway simulation
        const wind = Math.sin(tick * 0.02 + i) * 0.6;
        p.x += p.speedX + wind;
        p.y += p.speedY;
        p.rotation += p.rotationSpeed;

        // Render shape
        if (p.shape === "circle") {
          drawGoldSparkle(ctx, p);
        } else if (p.shape === "heart") {
          drawHeart(ctx, p);
        } else {
          drawPetal(ctx, p, scaleX);
        }

        // Recycle particle
        if (p.y > height + 20 || p.x < -30 || p.x > width + 30) {
          p.x = Math.random() * width;
          p.y = -20;
          p.opacity = Math.random() * 0.5 + 0.5;
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
    };
  }, [type, density, speed]);

  if (type === "none") return null;

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-40 w-full h-full ${className}`}
      style={style}
    />
  );
}

