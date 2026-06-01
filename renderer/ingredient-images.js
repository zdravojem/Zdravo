export function ingredientImageKey(name) {
  return String(name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function ingredientImageSrc(name) {
  return `../assets/images/ingredients/${ingredientImageKey(name)}.jpg`;
}
