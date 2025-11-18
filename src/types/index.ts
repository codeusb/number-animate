export interface NumberAnimateProps {
  /**
   * 动画效果
   * 滚动 | 翻牌
   */
  type: "scroll" | "flip";
  /**
   * 显示文本
   */
  text: string;
  /**
   * 动画时长
   * @default 1000
   */
  duration?: number;
  /**
   * 背景色
   * @default transparent
   */
  background?: string;
  /**
   * 字体颜色
   * @default #000000d9
   */
  color?: string;
  /**
   * 字体大小
   * @default 12px
   */
  fontSize?: number | string;
  /**
   * 字体粗细
   * @default normal
   */
  fontWeight?: string;
  /**
   * 字体族
   * @default monospace
   */
  fontFamily?: string;
}
