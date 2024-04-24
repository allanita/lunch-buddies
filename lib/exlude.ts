/**
 * Exclude keys from obj
 */
export function exclude(obj: {}, keys: string[]) {
  return Object.fromEntries(Object.entries(obj).filter(([key]) => !keys.includes(key)));
}
