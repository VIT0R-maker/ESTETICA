/* ============ CAIXA REVEAL — SCRUB DE VÍDEO ============
   Mesma ideia do hero, mais simples: enquanto a seção fica presa (pinned),
   o scroll avança o vídeo da caixa abrindo. Desligado em prefers-reduced-motion,
   onde o vídeo simplesmente fica no primeiro frame. */
(function initCaixaRevealScrub() {
  const section = document.getElementById('caixaReveal');
  if (!section) return;

  const video = section.querySelector('.caixa-reveal__video');
  const track = section.querySelector('.caixa-reveal__track');
  if (!video || !track) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const clamp01 = value => Math.max(0, Math.min(1, value));
  let videoDuration = 0;
  let pendingFrame  = null;
  let lastProgress  = -1;

  function syncDuration() {
    if (video.duration && !Number.isNaN(video.duration)) {
      videoDuration = video.duration;
    }
  }

  function update() {
    syncDuration();
    if (!videoDuration) return;

    const rect               = track.getBoundingClientRect();
    const scrollableDistance = Math.max(1, rect.height - window.innerHeight);
    const progress           = clamp01(-rect.top / scrollableDistance);

    /* Ignora micro-variações de scroll: setar currentTime é caro. */
    if (Math.abs(progress - lastProgress) < 0.001) return;
    lastProgress = progress;

    const targetTime = progress * videoDuration;
    if (Math.abs(video.currentTime - targetTime) > 0.04) {
      try { video.currentTime = targetTime; } catch (e) {}
    }
  }

  function requestUpdate() {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      update();
    });
  }

  video.pause();
  video.currentTime = 0;
  video.addEventListener('loadedmetadata', () => {
    syncDuration();
    requestUpdate();
  }, { once: true });

  try { video.load(); } catch (e) {}

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate, { passive: true });

  requestUpdate();
})();
