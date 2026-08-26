/* ============ CONSTRUÇÃO — ZOOM DA FOTO DA CAIXA ============
   Enquanto a seção está pinned, o texto some e a foto cresce até cobrir a tela.
   O JS só calcula números e escreve custom properties; quem anima de fato é o
   CSS (--case-scale, --case-shift-y, --case-radius, --case-copy-opacity...).
   Desligado em prefers-reduced-motion — sem os tokens, o CSS usa os defaults. */
(function initCaseScrollZoom() {
  const section = document.getElementById('case');
  if (!section) return;

  const track      = section.querySelector('.case-scroll-track');
  const pin        = section.querySelector('.case-scroll-pin');
  const shell      = section.querySelector('.case-scroll-image-shell');
  const imageFrame = section.querySelector('.case-scroll-image');
  if (!track || !pin || !shell || !imageFrame) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp01        = value => Math.max(0, Math.min(1, value));
  const easeOutCubic   = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  /* offsetTop é relativo ao offsetParent, que aqui não é o pin — daí a soma
     manual subindo a cadeia até chegar nele. */
  function offsetTopWithin(element, ancestor) {
    let offset = 0;
    let node = element;
    while (node && node !== ancestor) {
      offset += node.offsetTop;
      node = node.offsetParent;
    }
    return offset;
  }

  function update() {
    const vh        = window.innerHeight;
    const vw        = window.innerWidth;
    const trackTop  = track.getBoundingClientRect().top + window.scrollY;
    const scrubbable = Math.max(1, track.offsetHeight - vh);
    const progress  = clamp01((window.scrollY - trackTop) / scrubbable);

    /* O zoom só começa depois de 18% e termina em 86% do trecho pinned. */
    const expanded = easeInOutCubic(clamp01((progress - 0.18) / 0.68));

    const frameWidth  = imageFrame.offsetWidth  || shell.offsetWidth  || 1;
    const frameHeight = imageFrame.offsetHeight || shell.offsetHeight || 1;

    /* Escala que faz a foto cobrir o viewport (+2% de folga para não vazar
       borda por arredondamento). */
    const targetScale   = Math.max(vw / frameWidth, vh / frameHeight) * 1.02;
    const currentScale  = 1 + (targetScale - 1) * expanded;

    /* Ao crescer, a foto também se recentra verticalmente na tela. */
    const shellCenterY  = offsetTopWithin(shell, pin) + (shell.offsetHeight / 2);
    const centeredShift = (vh / 2) - shellCenterY;

    /* O texto sai bem antes, no primeiro terço. */
    const copyOpacity = 1 - easeOutCubic(clamp01(progress / 0.34));

    section.style.setProperty('--case-scale', currentScale.toFixed(4));
    section.style.setProperty('--case-shift-y', `${(centeredShift * expanded).toFixed(1)}px`);
    section.style.setProperty('--case-radius', `${(16 * (1 - expanded)).toFixed(1)}px`);
    section.style.setProperty('--case-border-opacity', (1 - expanded).toFixed(3));
    section.style.setProperty('--case-copy-opacity', copyOpacity.toFixed(3));
    section.style.setProperty('--case-copy-y', `${((1 - copyOpacity) * -20).toFixed(1)}px`);
  }

  let pendingFrame = null;
  function requestUpdate() {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      update();
    });
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  requestUpdate();
})();
