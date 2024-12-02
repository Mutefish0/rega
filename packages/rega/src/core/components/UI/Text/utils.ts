const NEWLINE = 10;
const PRECISION = 6;
const ERROR = 1 / Math.pow(10, PRECISION);

export function ceil(w: number) {
  let i = 0;
  for (; i < PRECISION; i++) {
    w *= 10;
    if (w % 1 === 0) {
      return Math.ceil(w) / Math.pow(10, i + 1);
    }
  }
  return Math.ceil(w) / Math.pow(10, i);
}

// horizontal advance
export type HA = (code: number) => number;

export function splitText(
  ha: HA,
  letterSpacing: number,
  codes: number[],
  maxWidth: number,
  paddingLeft = 0,
  paddingRight = 0
): Array<{ width: number; row: Array<{ code: number; xPos: number }> }> {
  const result: Array<{
    width: number;
    row: Array<{ code: number; xPos: number }>;
  }> = [];

  let row: Array<{ code: number; xPos: number }> = [];

  let lineStartIndex = 0;
  let cursor = paddingLeft;

  const charCount = codes.length;

  for (let i = 0; i < charCount; i++) {
    const charCode = codes[i];

    // 检查是否是换行符
    if (charCode === NEWLINE) {
      // '\n' 的 Unicode 编码是 10
      // 遇到换行符，强制结束当前行
      result.push({
        width: cursor - letterSpacing + paddingRight,
        row,
      });

      lineStartIndex = i + 1; // 新行从换行符后开始

      cursor = paddingLeft; // 重置宽度

      row = []; // 重置数据

      continue;
    }

    const _ha = ha(charCode);

    let nextCursor = cursor + _ha;

    // 计算当前字符的宽度，只在不是第一字符时才考虑间距

    if (nextCursor + paddingRight > maxWidth + ERROR && nextCursor > 0) {
      // 当前行超出宽度限制，分割
      result.push({
        width: cursor - letterSpacing + paddingRight,
        row,
      });

      row = [
        {
          xPos: paddingLeft,
          code: charCode,
        },
      ]; // 重置数据
      lineStartIndex = i;
      cursor = paddingLeft + _ha + letterSpacing;
    } else {
      row.push({
        code: charCode,
        xPos: cursor,
      });

      cursor = nextCursor + letterSpacing;
    }
  }

  // 添加最后一行
  if (lineStartIndex < charCount) {
    result.push({
      width: cursor - letterSpacing + paddingRight,
      row,
    });
  }

  return result;
}
