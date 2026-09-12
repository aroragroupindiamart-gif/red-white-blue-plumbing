export function selectVariant(variants: string[], locationId: number, serviceId: number, salt = 0): string {
  if (!variants || variants.length === 0) return "";
  const hash = Math.abs((locationId * 31 + serviceId + salt * 97) % variants.length);
  return variants[hash];
}
