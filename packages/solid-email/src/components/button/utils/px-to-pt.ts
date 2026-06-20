export function pxToPt(px: number | undefined) {
  return typeof px === 'number' && !Number.isNaN(Number(px))
    ? (px * 3) / 4
    : undefined;
}
