import React, { useEffect, useRef } from "react";
import { extractNumber } from "../utils";
import type { NumberAnimateProps } from "../types";

type NumberFlipProps = Omit<NumberAnimateProps, "type"> & {
  stopStep?: number; // 每位数字停止偏移量，默认 100
  speedMultiplier?: number; // 全局速度倍率，默认 5
  odometer?: boolean; // 是否启用里程表效果，默认 false // 模拟「从右往左滚动停止」的 odometer（里程表）效果
};

const SAFE_WIDTH = 2;

export const NumberFlip: React.FC<NumberFlipProps> = ({
  text,
  duration = 1000,
  background = "transparent",
  color = "#000000d9",
  fontSize: propFontSize = "40px",
  fontWeight = "normal",
  fontFamily = "monospace",
  stopStep = 100,
  speedMultiplier = 5,
  odometer = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fontSize = extractNumber(propFontSize, 60);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // 1️⃣ 字体设置
    const font = `${fontSize}px ${fontWeight} ${fontFamily}`;
    ctx.font = font;
    ctx.textBaseline = "middle";

    // 2️⃣ 固定每个字符的格宽（用最宽的 '8' 来测）
    const charWidth = ctx.measureText("8").width;
    const totalWidth = text.length * charWidth;
    const textHeight = fontSize * 1.5; // 字体高度估算

    canvas.width = totalWidth + SAFE_WIDTH;
    canvas.height = textHeight;

    // ⚠️ 设置宽高会清空 context，需重新设置样式
    const ctx2 = canvas.getContext("2d")!;
    ctx2.font = font;
    ctx2.textBaseline = "middle";
    ctx2.fillStyle = color;
    canvas.style.background = background;

    const targetText = text;
    const currentChars = targetText.split("");
    const lastChangeTime: number[] = currentChars.map(() => 0);

    const nextDigit = (ch: string) => ((parseInt(ch, 10) + 1) % 10).toString();

    /** 绘制函数：每个字符固定格宽，防止抖动 */
    const drawText = () => {
      ctx2.clearRect(0, 0, canvas.width, canvas.height);
      const startX = (canvas.width - totalWidth) / 2;
      const baseY = canvas.height / 2;

      for (let i = 0; i < currentChars.length; i++) {
        const ch = currentChars[i];
        const chWidth = ctx2.measureText(ch).width;
        const x = startX + i * charWidth + (charWidth - chWidth) / 2;
        ctx2.fillText(ch, x, baseY);
      }
    };

    // 初始化：让数字进入滚动状态
    for (let i = 0; i < currentChars.length; i++) {
      if (/\d/.test(currentChars[i]))
        currentChars[i] = nextDigit(currentChars[i]);
    }

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      let allStopped = true;
      let digitIndex = 0;

      for (let i = 0; i < targetText.length; i++) {
        const ch = targetText[i];
        // eslint-disable-next-line no-continue
        if (!/\d/.test(ch)) continue;

        const baseSpeed = Math.max(50, 300 - digitIndex * 50);
        let stopTime: number;
        if (odometer) {
          // 后面的数字更快
          const stopOffset =
            (targetText.replace(/\D/g, "").length - digitIndex - 1) * stopStep;
          stopTime = duration - stopOffset;
        } else {
          stopTime = duration;
        }

        if (elapsed < stopTime) {
          if (timestamp - lastChangeTime[i]! > baseSpeed / speedMultiplier) {
            currentChars[i] = nextDigit(currentChars[i]);
            lastChangeTime[i] = timestamp;
          }
          allStopped = false;
        } else {
          currentChars[i] = targetText[i];
        }
        digitIndex++;
      }

      drawText();
      if (!allStopped) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }, [
    text,
    duration,
    fontSize,
    background,
    color,
    stopStep,
    speedMultiplier,
    fontWeight,
    fontFamily,
    odometer,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        verticalAlign: "middle",
        display: "inline-block",
      }}
    />
  );
};
