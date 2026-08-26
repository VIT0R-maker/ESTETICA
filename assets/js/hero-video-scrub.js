/* ============ HERO — SCRUB DE VÍDEO + EXPANSÃO PARA FULL-BLEED ============
   O vídeo do topo não toca sozinho: o scroll da página controla o currentTime.
   Ao mesmo tempo o quadro cresce de 90vw até ocupar o viewport inteiro,
   sempre mantendo 16:9. */
(function initHeroVideoScrub() {
  const video         = document.getElementById('heroVideo');
  const videoStatus   = document.getElementById('videoStatus');
  const heroTrack     = document.getElementById('heroTrack');
  const heroVideoWrap = document.getElementById('heroVideoWrap');
  if (!video || !heroTrack || !heroVideoWrap) return;

  /* Estado de carregamento — o único feedback visível enquanto o mp4 baixa. */
  video.addEventListener('loadedmetadata', () => {
    if (videoStatus) videoStatus.textContent = 'Pronto';
  });
  video.addEventListener('canplaythrough', () => {
    if (videoStatus) videoStatus.style.display = 'none';
  });
  video.addEventListener('error', () => {
    if (!videoStatus) return;
    videoStatus.textContent = 'Não foi possível carregar o vídeo.';
    videoStatus.style.color = 'var(--accent-red)';
  });

  video.load();

  const clamp01        = value => Math.max(0, Math.min(1, value));
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function update() {
    const vh         = window.innerHeight;
    const scrubbable = Math.max(1, heroTrack.offsetHeight - vh);
    const progress   = clamp01((window.scrollY - heroTrack.offsetTop) / scrubbable);

    /* Scrub: o progresso do scroll vira o tempo do vídeo. */
    if (video.readyState >= 1 && video.duration && !Number.isNaN(video.duration)) {
      try { video.currentTime = video.duration * easeInOutCubic(progress); } catch (e) {}
    }

    /* Expansão: acontece entre 10% e 60% do progresso. A largura final é a
       maior que cabe no viewport mantendo 16:9 — pode ser limitada pela
       largura ou pela altura da janela. */
    const expandEased = easeInOutCubic(clamp01((progress - 0.10) / 0.50));

    const initialMaxWidth = Math.min(window.innerWidth * 0.9, 1280);
    const finalMaxWidth   = Math.min(window.innerWidth, vh * (16 / 9));
    const currentMaxWidth = initialMaxWidth + (finalMaxWidth - initialMaxWidth) * expandEased;

    heroVideoWrap.style.setProperty('--video-max', `${currentMaxWidth.toFixed(0)}px`);
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
  video.addEventListener('loadedmetadata', requestUpdate, { once: true });

  update();
})();
