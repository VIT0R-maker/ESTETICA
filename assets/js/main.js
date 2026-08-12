const video         = document.getElementById('heroVideo');
  const videoStatus   = document.getElementById('videoStatus');
  const heroTrack     = document.getElementById('heroTrack');
  const heroVideoWrap = document.getElementById('heroVideoWrap');
  const ticker        = null;

  // log everything for debugging
  video.addEventListener('loadedmetadata', () => {
    console.log('[video] loadedmetadata, duration:', video.duration);
    videoStatus.textContent = 'Pronto';
  });
  video.addEventListener('canplay',        () => console.log('[video] canplay'));
  video.addEventListener('canplaythrough', () => {
    console.log('[video] canplaythrough');
    videoStatus.style.display = 'none';
  });
  video.addEventListener('error', (e) => {
    console.error('[video] error:', video.error);
    videoStatus.textContent = 'ERRO ao carregar vídeo. Verifique se orient-watch.mp4 está na pasta.';
    videoStatus.style.color = 'var(--accent-red)';
  });
  video.addEventListener('stalled', () => console.warn('[video] stalled'));
  video.addEventListener('suspend', () => console.log('[video] suspend'));

  // explicit load
  video.load();

  // scroll choreography
  const easeOutCubic   = t => 1 - Math.pow(1 - t, 3);
  const easeInOutCubic = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function update() {
    const trackTop    = heroTrack.offsetTop;
    const trackHeight = heroTrack.offsetHeight;
    const vh          = window.innerHeight;
    const scrubbable  = trackHeight - vh;
    const scrollY     = window.scrollY;
    const progress    = Math.max(0, Math.min(1, (scrollY - trackTop) / scrubbable));

    // VIDEO SCRUB
    if (video.readyState >= 1 && video.duration && !isNaN(video.duration)) {
      const eased = easeInOutCubic(progress);
      const target = video.duration * eased;
      try { video.currentTime = target; } catch (e) {}
    }

    // VIDEO EXPAND TO FULL-BLEED (centered, 16:9 maintained)
    // Expansion happens between 10% and 60% of scroll progress
    const expandT = Math.max(0, Math.min(1, (progress - 0.10) / 0.50));
    const expandEased = easeInOutCubic(expandT);

    // Initial state: 90vw width, max 1280px
    // Final state: largest size that fits viewport keeping 16:9 — could be width-bound
    // (16/9 of viewport height fits in width) or height-bound (vice versa)
    const vw = window.innerWidth;
    const viewportH = window.innerHeight;
    // Maximum width that keeps 16:9 inside viewport: min(vw, viewportH * 16/9)
    const finalMaxWidth = Math.min(vw, viewportH * (16 / 9));

    // Initial width is 90vw clamped by 1280px
    const initialMaxWidth = Math.min(vw * 0.9, 1280);

    // Interpolate
    const currentMaxWidth = initialMaxWidth + (finalMaxWidth - initialMaxWidth) * expandEased;

    heroVideoWrap.style.setProperty('--video-max', `${currentMaxWidth.toFixed(0)}px`);

    // expose for debugging
    window._heroDebug = {
      progress,
      videoTime: video.currentTime,
      videoDuration: video.duration,
      videoReadyState: video.readyState
    };
  }

  let pendingFrame = null;
  function onScroll() {
    if (pendingFrame !== null) return;
    pendingFrame = requestAnimationFrame(() => {
      pendingFrame = null;
      update();
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // run once metadata is available
  video.addEventListener('loadedmetadata', () => requestAnimationFrame(update), { once: true });

  // initial
  update();