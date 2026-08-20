const welcomePosterSrc = '../assets/images/welcome-poster.webp';
const welcomePoster2Src = '../assets/images/welcome-poster2.webp';
const POSTER2_DURATION_MS = 2000;

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
        <img
          class="welcome-poster welcome-poster--second"
          src="${welcomePoster2Src}"
          alt=""
          aria-hidden="true"
          loading="eager"
          decoding="async"
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

  const poster2 = screen.querySelector('.welcome-poster--second');
  let tapped = false;
  let timer = null;

  screen.addEventListener('pointerdown', () => {
    if (tapped) {
      return;
    }
    tapped = true;

    if (!poster2) {
      actions.goTo('home');
      return;
    }

    poster2.classList.add('is-visible');
    timer = setTimeout(() => {
      timer = null;
      // The screen may have been re-rendered (e.g. locale switch) while waiting.
      if (poster2.isConnected) {
        actions.goTo('home');
      }
    }, POSTER2_DURATION_MS);
  });
}
