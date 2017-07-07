export function uid() {
  // TODO: implement this
  return new Array(12)
    .fill(null)
    .map(() => Math.floor(Math.random() * 10))
    .join('');
}
