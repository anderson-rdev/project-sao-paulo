/* ═══════════════════════════════════════════
   São Paulo FC — Glórias Tricolor
   main.js
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  // ────────────────────────────────────────
  // 1. CAROUSEL — reinicia animações CSS a cada slide
  // ────────────────────────────────────────
  const carousel = document.getElementById('heroCarousel');

  if (carousel) {
    // Antes de transicionar: zera as animações dos elementos
    carousel.addEventListener('slide.bs.carousel', () => {
      document
        .querySelectorAll('.slide-era, .slide-title, .slide-desc, .slide-trophies')
        .forEach(el => {
          el.style.animation = 'none';
          // Força o browser a reconhecer a mudança (reflow)
          void el.offsetHeight;
        });
    });

    // Depois de transicionar: restaura as animações do slide ativo
    carousel.addEventListener('slid.bs.carousel', () => {
      const activeSlide = carousel.querySelector('.carousel-item.active');
      if (!activeSlide) return;

      activeSlide
        .querySelectorAll('.slide-era, .slide-title, .slide-desc, .slide-trophies')
        .forEach(el => {
          el.style.animation = '';
        });
    });
  }

  // ────────────────────────────────────────
  // 2. INTERSECTION OBSERVER — reveal ao rolar
  //    Aplica fade-up nos cards de conquistas e timeline
  // ────────────────────────────────────────
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = 'translateY(0)';
          // Para de observar após revelar (otimização)
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  // Inicializa os elementos como invisíveis e os observa
  document.querySelectorAll('.conquest-card, .tl-card').forEach(el => {
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(20px)';
    el.style.transition = 'opacity 0.5s ease, transform 0.5s ease, border-color 0.35s, box-shadow 0.35s';
    revealObserver.observe(el);
  });

  // ────────────────────────────────────────
  // 3. NAVBAR — destaca o link da seção visível (scrollspy manual)
  // ────────────────────────────────────────
  const sections  = document.querySelectorAll('section[id], div[id="heroCarousel"]');
  const navLinks  = document.querySelectorAll('.navbar-nav .nav-link');

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          navLinks.forEach(link => {
            link.classList.remove('active-nav');
            if (link.getAttribute('href') === `#${entry.target.id}`) {
              link.classList.add('active-nav');
            }
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(sec => sectionObserver.observe(sec));

  // Estilo inline do link ativo (complementa o CSS)
  document.head.insertAdjacentHTML('beforeend', `
    <style>
      .navbar-nav .nav-link.active-nav {
        color: var(--spfc-white) !important;
      }
      .navbar-nav .nav-link.active-nav::after {
        width: 70% !important;
      }
    </style>
  `);

});