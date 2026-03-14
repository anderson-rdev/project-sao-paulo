/* ═══════════════════════════════════════════
   São Paulo FC — Glórias Tricolor
   script.js  (versão expandida com todos os componentes Bootstrap)
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ──────────────────────────────────────────
     1. CAROUSEL HERO — reinicia animações CSS
     ────────────────────────────────────────── */
  const heroCarousel = document.getElementById('heroCarousel');
  if (heroCarousel) {
    heroCarousel.addEventListener('slide.bs.carousel', () => {
      document.querySelectorAll('.slide-era,.slide-title,.slide-desc,.slide-trophies')
        .forEach(el => { el.style.animation = 'none'; void el.offsetHeight; });
    });
    heroCarousel.addEventListener('slid.bs.carousel', () => {
      const active = heroCarousel.querySelector('.carousel-item.active');
      if (active) active.querySelectorAll('.slide-era,.slide-title,.slide-desc,.slide-trophies')
        .forEach(el => { el.style.animation = ''; });
    });
  }

  /* ──────────────────────────────────────────
     2. INTERSECTION OBSERVER — reveal on scroll
     ────────────────────────────────────────── */
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.conquest-card,.tl-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity .5s ease, transform .5s ease, border-color .35s, box-shadow .35s';
    revealObserver.observe(el);
  });

  /* ──────────────────────────────────────────
     3. SCROLLSPY / NAVBAR ACTIVE
     ────────────────────────────────────────── */
  const scrollSpy = new bootstrap.ScrollSpy(document.body, {
    target: '#navMenu',
    offset: 80,
    method: 'offset'
  });

  /* ──────────────────────────────────────────
     4. POPOVERS — inicializa todos
     ────────────────────────────────────────── */
  document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => {
    new bootstrap.Popover(el, { trigger: 'hover focus' });
  });
  // Popovers manuais
  new bootstrap.Popover(document.getElementById('btnAdicionar'), {
    trigger: 'hover',
    title: '<i class="fa fa-plus-circle me-1" style="color:var(--spfc-red)"></i>Adicionar',
    content: 'Registre um novo título tricolor no painel.',
    html: true,
    placement: 'top'
  });
  new bootstrap.Popover(document.getElementById('dropdownFiltro'), {
    trigger: 'hover',
    content: 'Filtre as conquistas por categoria.',
    placement: 'top'
  });

  /* ──────────────────────────────────────────
     5. RANGE — atualiza label ao vivo
     ────────────────────────────────────────── */
  const rangeInput = document.getElementById('importancia');
  const rangeVal = document.getElementById('rangeVal');
  if (rangeInput) {
    rangeInput.addEventListener('input', () => {
      rangeVal.textContent = `${rangeInput.value} / 10`;
    });
  }

  /* ──────────────────────────────────────────
     6. ESTADO — conquistas dinâmicas
     ────────────────────────────────────────── */
  const MAX_CONQUISTAS = 10;
  const ITEMS_POR_PAGINA = 6;
  let conquistas = [];
  let paginaAtual = 1;
  let filtroAtivo = 'todos';

  const emojiMap = {
    Internacional: '🌍', Continental: '🌎', Nacional: '🇧🇷',
    Estadual: '🏟️', Regional: '🏙️', default: '🏆'
  };

  function getEmoji(cat) { return emojiMap[cat] || emojiMap.default; }

  function importanciaLabel(val) {
    if (val <= 3) return { text: 'Relevante', cls: 'bg-secondary' };
    if (val <= 6) return { text: 'Importante', cls: 'bg-warning text-dark' };
    return { text: 'Histórico', cls: 'bg-danger' };
  }

  /* ──────────────────────────────────────────
     7. PROGRESS BAR
     ────────────────────────────────────────── */
  function atualizarProgress() {
    const pct = Math.round((conquistas.length / MAX_CONQUISTAS) * 100);
    const bar = document.getElementById('conquProgress');
    const lbl = document.getElementById('progressLabel');
    if (bar) bar.style.width = `${pct}%`;
    if (lbl) lbl.textContent = `${conquistas.length} / ${MAX_CONQUISTAS}`;
  }

  /* ──────────────────────────────────────────
     8. ALERT
     ────────────────────────────────────────── */
  function mostrarAlert(msg, tipo = 'success') {
    const area = document.getElementById('alertArea');
    if (!area) return;
    const cls = tipo === 'success' ? 'alert-spfc-success' : 'alert-spfc-danger';
    const ico = tipo === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
    area.innerHTML = `
      <div class="alert ${cls} alert-dismissible fade show d-flex align-items-center gap-2" role="alert">
        <i class="fa ${ico}"></i>
        <span>${msg}</span>
        <button type="button" class="btn-close ms-auto" data-bs-dismiss="alert" style="filter:invert(.8)"></button>
      </div>`;
    // Auto-close after 4s
    setTimeout(() => {
      const a = area.querySelector('.alert');
      if (a) bootstrap.Alert.getOrCreateInstance(a).close();
    }, 4000);
  }

  /* ──────────────────────────────────────────
     9. TOAST
     ────────────────────────────────────────── */
  function dispararToast(msg, tipo = 'sucesso') {
    if (tipo === 'sucesso') {
      document.getElementById('toastMsg').textContent = msg;
      bootstrap.Toast.getOrCreateInstance(document.getElementById('toastSucesso')).show();
    } else {
      document.getElementById('toastErrMsg').textContent = msg;
      bootstrap.Toast.getOrCreateInstance(document.getElementById('toastErro')).show();
    }
  }

  /* ──────────────────────────────────────────
     10. SPINNER — simula loading
     ────────────────────────────────────────── */
  function simularLoading(callback, delay = 600) {
    const spinner = document.getElementById('spinnerArea');
    const grid = document.getElementById('cardsGrid');
    if (spinner) spinner.classList.remove('d-none');
    if (grid) grid.innerHTML = '';
    setTimeout(() => {
      if (spinner) spinner.classList.add('d-none');
      callback();
    }, delay);
  }

  /* ──────────────────────────────────────────
     11. RENDERIZAR CARDS + COLLAPSE + PAGINATION
     ────────────────────────────────────────── */
  function conquistasFiltradas() {
    if (filtroAtivo === 'todos') return conquistas;
    if (filtroAtivo === 'custom') return conquistas; // todas as adicionadas são custom
    return conquistas.filter(c => c.categoria === filtroAtivo);
  }

  function renderPaginacao(total) {
    const nav = document.getElementById('paginacao');
    if (!nav) return;
    const totalPags = Math.ceil(total / ITEMS_POR_PAGINA);
    if (totalPags <= 1) { nav.innerHTML = ''; return; }

    let html = `
      <li class="page-item ${paginaAtual === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${paginaAtual - 1}">&#8592;</a>
      </li>`;
    for (let i = 1; i <= totalPags; i++) {
      html += `<li class="page-item ${i === paginaAtual ? 'active' : ''}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>`;
    }
    html += `
      <li class="page-item ${paginaAtual === totalPags ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${paginaAtual + 1}">&#8594;</a>
      </li>`;
    nav.innerHTML = html;

    nav.querySelectorAll('.page-link').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const p = parseInt(link.dataset.page);
        if (!p || p < 1 || p > totalPags) return;
        paginaAtual = p;
        renderCards();
      });
    });
  }

  function renderCards() {
    const grid = document.getElementById('cardsGrid');
    if (!grid) return;

    const lista = conquistasFiltradas();
    const inicio = (paginaAtual - 1) * ITEMS_POR_PAGINA;
    const pagina = lista.slice(inicio, inicio + ITEMS_POR_PAGINA);

    if (lista.length === 0) {
      grid.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="fa fa-trophy" style="font-size:3rem;color:rgba(227,6,19,.2);"></i>
          <p class="mt-3" style="font-family:'Rajdhani',sans-serif;letter-spacing:2px;color:rgba(245,245,240,.3);text-transform:uppercase;">
            Nenhuma conquista encontrada
          </p>
        </div>`;
      renderPaginacao(0);
      return;
    }

    grid.innerHTML = pagina.map((c, idx) => {
      const id = `conq-${c.id}`;
      const collapseId = `detail-${c.id}`;
      const imp = importanciaLabel(c.importancia);
      const tags = [
        c.invicto ? '🛡️ Invicto' : null,
        c.historico ? '📜 Histórico' : null,
        c.recorde ? '🏅 Recorde' : null,
        c.intl ? '🌍 Internacional' : null,
      ].filter(Boolean);

      return `
        <div class="col-md-6 col-lg-4">
          <div class="dyn-card" id="${id}">
            <span class="card-ano">${c.ano}</span>
            <div class="card-header-spfc">
              <div>
                <p class="card-cat">${getEmoji(c.categoria)} ${c.categoria}</p>
                <h5 class="card-title-dyn">${c.nome}</h5>
              </div>
            </div>
            <div class="card-body">
              <div class="d-flex flex-wrap gap-1 mb-2">
                <span class="badge ${imp.cls} badge-imp">${imp.text} ${c.importancia}/10</span>
                ${tags.map(t => `<span class="badge bg-transparent border badge-imp" style="border-color:rgba(201,168,76,.4);color:var(--spfc-gold);">${t}</span>`).join('')}
              </div>
              ${c.adversario ? `<p class="card-detail-text mb-2">⚔️ vs <strong style="color:rgba(245,245,240,.75);">${c.adversario}</strong></p>` : ''}
              <div class="d-flex gap-2 mt-2">
                <button class="btn-detail" type="button"
                  data-bs-toggle="collapse" data-bs-target="#${collapseId}"
                  aria-expanded="false">
                  <i class="fa fa-chevron-down me-1"></i>Detalhes
                </button>
                <button class="btn-del" onclick="deletarConquista('${c.id}')">
                  <i class="fa fa-trash me-1"></i>Remover
                </button>
              </div>
              <div class="collapse mt-3" id="${collapseId}">
                <div style="background:rgba(0,0,0,.3);border-left:3px solid var(--spfc-red);padding:.8rem 1rem;border-radius:0 4px 4px 0;">
                  <p class="card-detail-text mb-0">
                    ${c.descricao || '<em style="opacity:.5;">Nenhuma descrição adicionada.</em>'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Animate cards in
    grid.querySelectorAll('.dyn-card').forEach((card, i) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(16px)';
      card.style.transition = 'opacity .4s ease, transform .4s ease';
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, i * 80);
    });

    renderPaginacao(lista.length);
  }

  window.deletarConquista = function (id) {
    conquistas = conquistas.filter(c => c.id !== id);
    if (conquistasFiltradas().length === 0 && paginaAtual > 1) paginaAtual--;
    renderCards();
    atualizarProgress();
    mostrarAlert('Conquista removida do painel.', 'danger');
    dispararToast('Conquista removida!', 'erro');
  };

  /* ──────────────────────────────────────────
     12. FILTRO DROPDOWN
     ────────────────────────────────────────── */
  document.querySelectorAll('[data-filter]').forEach(item => {
    item.addEventListener('click', e => {
      e.preventDefault();
      document.querySelectorAll('[data-filter]').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      filtroAtivo = item.dataset.filter;
      paginaAtual = 1;
      simularLoading(renderCards, 400);
    });
  });

  /* ──────────────────────────────────────────
     13. MODAL — SALVAR CONQUISTA (Validação Bootstrap)
     ────────────────────────────────────────── */
  document.getElementById('btnSalvar').addEventListener('click', () => {
    const form = document.getElementById('formConquista');
    form.classList.add('was-validated');
    if (!form.checkValidity()) return;

    if (conquistas.length >= MAX_CONQUISTAS) {
      mostrarAlert(`Limite de ${MAX_CONQUISTAS} conquistas atingido!`, 'danger');
      dispararToast('Limite máximo atingido!', 'erro');
      return;
    }

    const nova = {
      id: `c${Date.now()}`,
      nome: document.getElementById('nomeConquista').value.trim(),
      ano: document.getElementById('anoConquista').value,
      categoria: document.getElementById('categoriaConquista').value,
      adversario: document.getElementById('adversarioConquista').value.trim(),
      descricao: document.getElementById('descConquista').value.trim(),
      importancia: parseInt(document.getElementById('importancia').value),
      invicto: document.getElementById('chkInvicto').checked,
      historico: document.getElementById('chkHistorico').checked,
      recorde: document.getElementById('chkRecorde').checked,
      intl: document.getElementById('chkInternacional').checked,
    };

    conquistas.unshift(nova);
    paginaAtual = 1;
    filtroAtivo = 'todos';
    document.querySelectorAll('[data-filter]').forEach(i => i.classList.remove('active'));
    document.querySelector('[data-filter="todos"]').classList.add('active');

    form.reset();
    form.classList.remove('was-validated');
    bootstrap.Modal.getInstance(document.getElementById('modalConquista')).hide();

    simularLoading(renderCards, 500);
    atualizarProgress();

    mostrarAlert(`✅ Conquista "<strong>${nova.nome}</strong>" adicionada com sucesso!`, 'success');
    dispararToast(`"${nova.nome}" salva!`);
  });

  /* ──────────────────────────────────────────
     INIT
     ────────────────────────────────────────── */
  // Carrega painel vazio com spinner inicial
  simularLoading(renderCards, 800);
  atualizarProgress();

});