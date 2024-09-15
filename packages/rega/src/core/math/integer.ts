export function toInt8(num: number) {
  num = num & 0xff;
  if (num > 127) {
    return num - 256;
  }
  return num;
}

export function toInt16(num: number) {
  num = num & 0xffff;
  if (num > 32767) {
    return num - 65536;
  }
  return num;
}
