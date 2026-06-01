export function gameCardImageSrc(name) {
  return `../assets/images/home-games/${String(name || '').trim()}.png`;
}
