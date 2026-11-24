/* Gianni Tiberi — Ergothérapeute : animations & petits effets JS */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------
     1. Barre de progression de lecture (en haut de la page)
  --------------------------------------------------------------- */
  const progress = document.createElement('div');
  progress.className = 'scroll-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.appendChild(progress);

  function updateProgress() {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.transform = 'scaleX(' + Math.min(ratio, 1) + ')';
  }

  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
  updateProgress();

  /* ---------------------------------------------------------------
     2. Apparition douce des éléments au scroll (IntersectionObserver)
        - les éléments marqués .reveal deviennent visibles
        - les .hero-copy > * apparaissent en cascade
  --------------------------------------------------------------- */
  // Éléments explicitement marqués dans le HTML
  const revealTargets = document.querySelectorAll('.reveal');

  // Éléments du hero : cascade automatique
  document.querySelectorAll('.hero-copy > *, .hero-image').forEach((el, i) => {
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', (i * 0.12).toFixed(2) + 's');
  });

  // Cartes "steps" et articles, image explicative + blocs contact : cascade légère
  document.querySelectorAll('.step, .blog-card--link, .explainer-image, .contact-card, .quote-inner').forEach((el, i) => {
    if (el.classList.contains('reveal')) return;
    el.classList.add('reveal');
    el.style.setProperty('--reveal-delay', ((i % 3) * 0.12).toFixed(2) + 's');
  });

  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    // Pas d'animation : tout visible immédiatement
    document.querySelectorAll('.reveal').forEach((el) => el.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
  }

  /* ---------------------------------------------------------------
     3. Parallaxe légère sur l'image du hero (desktop uniquement)
  --------------------------------------------------------------- */
  const heroImage = document.querySelector('.hero-image');
  if (heroImage && !prefersReducedMotion && window.matchMedia('(min-width: 761px)').matches) {
    window.addEventListener('scroll', () => {
      const hero = document.querySelector('.hero');
      if (!hero) return;
      const rect = hero.getBoundingClientRect();
      if (rect.bottom < 0) return;
      const offset = window.scrollY * 0.12;
      heroImage.style.translate = '0 ' + offset.toFixed(1) + 'px';
    }, { passive: true });
  }

  /* ---------------------------------------------------------------
     4. Micro-interaction : l'emoji du bouton hero suit le survol
  --------------------------------------------------------------- */
  const heroButton = document.querySelector('.button');
  if (heroButton) {
    const arrow = heroButton.querySelector('span[aria-hidden]');
    heroButton.addEventListener('mouseenter', () => {
      if (arrow) arrow.style.transition = 'transform .25s ease';
      if (arrow) arrow.style.transform = 'translateX(5px)';
    });
    heroButton.addEventListener('mouseleave', () => {
      if (arrow) arrow.style.transform = '';
    });
  }

  /* ---------------------------------------------------------------
     5. Année du footer mise à jour automatiquement
  --------------------------------------------------------------- */
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

})();

/* ---------------------------------------------------------------
   6. Page article : charge le contenu selon ?id=...
--------------------------------------------------------------- */
const ARTICLES = {
  autonomie: {
    category: 'Au quotidien',
    title: 'Favoriser l’autonomie, un geste à la fois',
    image: 'img/autonomie.png',
    imageAlt: 'Un adulte s’exerce à l’équilibre avec l’aide d’une professionnelle',
    body: [
      'L’autonomie ne signifie pas forcément tout faire seul. Elle peut aussi consister à choisir, participer ou réaliser une étape d’une activité.',
      'Prendre le temps d’observer ce qui est important pour la personne aide à repérer les étapes qui lui conviennent et celles qui sont difficiles. Un objet plus facile à saisir, un rangement à portée de main ou un rythme moins pressé peuvent parfois rendre une activité plus accessible.',
      'Les adaptations sont à imaginer avec la personne et à ajuster selon ses besoins : il n’existe pas de solution unique.'
    ]
  },
  ecole: {
    category: 'Enfants & école',
    title: 'Rendre les activités scolaires plus accessibles',
    image: 'img/enfant.png',
    imageAlt: 'Un enfant réalise une activité manuelle accompagné par une professionnelle',
    body: [
      'Écrire, découper, s’installer ou organiser son matériel peut demander des efforts différents selon les élèves. Repérer précisément le moment qui pose difficulté permet de chercher une réponse adaptée.',
      'Selon les besoins, l’équipe peut réfléchir à l’installation, à la disposition du matériel, au temps accordé ou à des outils alternatifs. L’enfant, sa famille, l’école et les professionnels peuvent partager leurs observations pour envisager des ajustements utiles.',
      'Chaque situation est particulière : une adaptation se choisit et s’évalue avec les personnes concernées.'
    ]
  },
  adultes: {
    category: 'Adultes',
    title: 'Adapter ses activités à ses besoins',
    image: 'img/exercices.png',
    imageAlt: 'Un adulte s’exerce avec l’aide d’un professionnel',
    body: [
      'Quand une activité devient difficile, il peut être utile de regarder l’ensemble de la situation : les gestes à réaliser, l’environnement, les objets utilisés et le rythme de l’activité.',
      'Réorganiser un espace, modifier une étape ou essayer un matériel différent sont des exemples de pistes à explorer. L’objectif est de trouver avec la personne des solutions qui ont du sens pour ses habitudes et ses priorités.',
      'Un ergothérapeute peut accompagner cette réflexion en tenant compte du contexte et des attentes de chacun.'
    ]
  }
};

(function loadArticle() {
  const container = document.getElementById('article-body');
  if (!container) return; // pas sur la page article

  const id = new URLSearchParams(window.location.search).get('id');
  const data = ARTICLES[id];

  if (!data) {
    document.getElementById('article-title').textContent = 'Article introuvable';
    document.getElementById('article-category').style.display = 'none';
    document.getElementById('article-image').style.display = 'none';
    container.innerHTML = '<p>Cet article n’existe pas ou a été déplacé. <a href="index.html#conseils">Retourner aux articles</a>.</p>';
    return;
  }

  document.title = data.title + ' — Gianni Tiberi, ergothérapeute';
  document.getElementById('article-category').textContent = data.category;
  document.getElementById('article-title').textContent = data.title;
  document.getElementById('article-image').src = data.image;
  document.getElementById('article-image').alt = data.imageAlt;
  container.innerHTML = data.body.map(function (p) { return '<p>' + p + '</p>'; }).join('');
})();
