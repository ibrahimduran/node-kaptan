export function toHyphenSpace(str: string) {
  return str
    .replace(/([A-Z])/g, ' $1')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}
