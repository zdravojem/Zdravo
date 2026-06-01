export function recipeImageSrc(slug) {
  return `../assets/images/recipes/${String(slug || '').trim()}.jpg`;
}
