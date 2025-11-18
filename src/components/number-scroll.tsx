import React, { useEffect, useRef } from "react";
import { extractNumber } from "../utils";
import type { NumberAnimateProps } from "../types";

type NumberScrollProps = Omit<NumberAnimateProps, "type"> & {
  rolls?: number; // 每个数字滚动次数，默认 6
};

const SAFE_WIDTH = 2;

export const NumberScroll: React.FC<NumberScrollProps> = ({
  text,
  duration = 1000,
  background = "transparent",
  color = "#000000d9",
  fontSize: propFontSize = "12px",
  fontWeight = "normal",
  fontFamily = "monospace",
  rolls = 6,
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

    // 2️⃣ 动态测量 canvas 尺寸
    const textWidth = ctx.measureText(text).width;
    const textHeight = fontSize * 1.5; // 字体高度估算
    canvas.width = textWidth + SAFE_WIDTH; // 加点 padding 防止边缘截断
    canvas.height = textHeight;

    // ⚠️ 注意：设置宽高会清空 context，需重新设置
    const ctx2 = canvas.getContext("2d")!;
    ctx2.font = font;
    ctx2.textBaseline = "middle";
    ctx2.fillStyle = color;
    canvas.style.background = background;

    const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
    const targetText = text;

    const rollConfigs = targetText.split("").map((ch) => ({
      isDigit: /\d/.test(ch),
      startOffset: (Math.random() * 0.6 + 0.7) * rolls * fontSize,
      direction: 1,
    }));

    const draw = (progress: number) => {
      const eased = easeOutCubic(progress);
      ctx2.clearRect(0, 0, canvas.width, canvas.height);

      const chars = targetText.split("");
      const baseX = (canvas.width - ctx2.measureText(targetText).width) / 2;
      const baseY = canvas.height / 2;

      let x = baseX;

      chars.forEach((ch, i) => {
        const cfg = rollConfigs[i];
        const charWidth = ctx2.measureText(ch).width;

        if (cfg.isDigit) {
          const offset = cfg.startOffset * (1 - eased) * cfg.direction;
          const currentDigit = parseInt(ch, 10);
          const rollingDigit =
            (currentDigit + Math.floor(Math.abs(offset / fontSize))) % 10;

          for (let j = -2; j <= 2; j++) {
            const y = baseY + (offset % fontSize) + j * fontSize;
            const num = (rollingDigit - j + 10) % 10;
            ctx2.fillText(num.toString(), x, y);
          }
        } else {
          ctx2.fillText(ch, x, baseY);
        }

        x += charWidth;
      });
    };

    let startTime: number | null = null;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      draw(progress);

      if (progress < 1) requestAnimationFrame(animate);
      else {
        ctx2.clearRect(0, 0, canvas.width, canvas.height);
        const textWidth = ctx2.measureText(targetText).width;
        ctx2.fillText(
          targetText,
          (canvas.width - textWidth) / 2,
          canvas.height / 2
        );
      }
    };

    requestAnimationFrame(animate);
  }, [
    text,
    duration,
    rolls,
    fontSize,
    background,
    color,
    fontWeight,
    fontFamily,
  ]);

  return (
    <canvas
      ref={canvasRef}
      style={{ verticalAlign: "middle", display: "inline-block" }}
    />
  );
};
