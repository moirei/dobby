export function isInt(n: number | bigint): boolean {
  return Number(n) === n && n % 1 === 0;
}

export function isFloat(n: number | bigint): boolean {
  return Number(n) === n && n % 1 !== 0;
}
