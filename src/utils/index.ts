// 工具函数：从字符串中提取数字
export function extractNumber(
  input: string | number | null | undefined,
  defaultValue = 0
): number {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (input == null) return defaultValue;
  const match = String(input)
    .trim()
    .match(/-?\d+(\.\d+)?/);
  return match ? Number(match[0]) : defaultValue;
}
