export function spr(num: number, cols: number = 1, rows: number = 1) {
  // 8x8
  const sY = Math.floor(num / 16);
  const sX = num % 16;
  const clip = [sX * 8, sY * 8, 8 * cols, 8 * rows] as [
    number,
    number,
    number,
    number
  ];

  return clip;
}
