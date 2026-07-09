const welcomePosterSrc = '../assets/images/welcome-poster.png';

export function render() {
  return `
    <section class="screen screen--welcome">
      <div class="welcome-poster-wrap">
        <img
          class="welcome-poster"
          src="${welcomePosterSrc}"
          alt="Zdravo Jem welcome poster"
          loading="eager"
          decoding="async"
          fetchpriority="high"
        />
      </div>
    </section>
  `;
}

export function bind({ actions, root }) {
  const screen = root.querySelector('.screen--welcome');
  if (!screen) {
    return;
  }

  screen.addEventListener('pointerdown', () => {
    actions.goTo('home');
  });
}
