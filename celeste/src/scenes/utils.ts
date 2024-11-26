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

export function formatTimeDuration(time: number) {
  const seconds = Math.floor(time / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(
    2,
    "0"
  )}:${String(seconds % 60).padStart(2, "0")}`;
}
